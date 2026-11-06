import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type HealthCheckAttempt, HealthIndicatorService } from '@nestjs/terminus';
import { Redis } from 'ioredis';
import type { Env } from '../../config/env.js';

const CHECK_TIMEOUT_MS = 2_000;

/** Verifica que Redis responde a PING. */
@Injectable()
export class RedisHealthIndicator implements OnModuleDestroy {
  private readonly logger = new Logger(RedisHealthIndicator.name);
  private readonly client: Redis;
  private disconnectedReported = false;

  constructor(
    config: ConfigService<Env, true>,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {
    this.client = new Redis(config.get('REDIS_URL', { infer: true }), {
      connectTimeout: CHECK_TIMEOUT_MS,
      maxRetriesPerRequest: 1,
      retryStrategy: (attempt) => Math.min(attempt * 500, 5_000),
    });
    // ioredis reintenta sin fin: se avisa una vez por caída para no inundar los logs.
    this.client.on('error', (error: NodeJS.ErrnoException) => {
      if (!this.disconnectedReported) {
        this.disconnectedReported = true;
        // Si localhost resuelve a IPv4 e IPv6, Node lanza un AggregateError con message vacío.
        this.logger.warn(`Redis no disponible: ${error.message || error.code || error.name}`);
      }
    });
    this.client.on('ready', () => {
      this.disconnectedReported = false;
    });
  }

  isHealthy<const Key extends string>(key: Key): HealthCheckAttempt<Key> {
    return this.healthIndicatorService
      .check(key)
      .attempt(async () => {
        try {
          await this.client.ping();
        } catch {
          throw new Error('Redis no disponible');
        }
      })
      .withTimeout(CHECK_TIMEOUT_MS);
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }
}
