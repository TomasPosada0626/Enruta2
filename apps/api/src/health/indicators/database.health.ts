import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type HealthCheckAttempt, HealthIndicatorService } from '@nestjs/terminus';
import pg from 'pg';
import type { Env } from '../../config/env.js';

const CHECK_TIMEOUT_MS = 2_000;

/**
 * Verifica que PostgreSQL responde y que la extensión PostGIS está instalada.
 * En la Fase 1 este chequeo pasa a usar el cliente de Prisma.
 */
@Injectable()
export class DatabaseHealthIndicator implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseHealthIndicator.name);
  private readonly pool: pg.Pool;

  constructor(
    config: ConfigService<Env, true>,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {
    this.pool = new pg.Pool({
      connectionString: config.get('DATABASE_URL', { infer: true }),
      max: 1,
      connectionTimeoutMillis: CHECK_TIMEOUT_MS,
    });
    // Sin este manejador, el error de una conexión inactiva tumba el proceso.
    this.pool.on('error', (error) =>
      this.logger.warn(`Error en el pool de PostgreSQL: ${error.message}`),
    );
  }

  isHealthy<const Key extends string>(key: Key): HealthCheckAttempt<Key> {
    return this.healthIndicatorService
      .check(key)
      .attempt(async () => {
        try {
          const { rows } = await this.pool.query<{ postgis: string }>(
            'SELECT postgis_lib_version() AS postgis',
          );
          return { postgis: rows[0]?.postgis };
        } catch (error) {
          // El detalle va al log; la respuesta pública no expone hosts ni usuarios.
          this.logger.warn(`PostgreSQL no disponible: ${(error as Error).message}`);
          throw new Error('PostgreSQL no disponible');
        }
      })
      .withTimeout(CHECK_TIMEOUT_MS);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
