import type { INestApplication } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { HealthModule } from '../src/health/health.module.js';
import { DatabaseHealthIndicator } from '../src/health/indicators/database.health.js';
import { RedisHealthIndicator } from '../src/health/indicators/redis.health.js';
import { REQUEST_ID_HEADER, createLoggerParams } from '../src/observability/logger.js';

type Status = 'up' | 'down';

/** Servidor HTTP que acepta supertest. */
type App = Parameters<typeof request>[0];

/**
 * Indicador falso para no depender de PostgreSQL ni Redis reales.
 * Las pruebas contra bases reales llegan con Testcontainers en la Fase 1.
 */
function fakeIndicator(status: Status) {
  const service = new HealthIndicatorService();
  return {
    isHealthy: (key: string) =>
      service.check(key).attempt(() => {
        if (status === 'down') throw new Error(`${key} no disponible`);
      }),
  };
}

describe('Health (e2e)', () => {
  let app: INestApplication<App> | undefined;

  async function start(database: Status, redis: Status): Promise<INestApplication<App>> {
    const moduleRef = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot(createLoggerParams({ NODE_ENV: 'test', LOG_LEVEL: 'silent' })),
        HealthModule,
      ],
    })
      .overrideProvider(DatabaseHealthIndicator)
      .useValue(fakeIndicator(database))
      .overrideProvider(RedisHealthIndicator)
      .useValue(fakeIndicator(redis))
      .compile();

    app = moduleRef.createNestApplication({ logger: false });
    await app.init();
    return app;
  }

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it('GET /health/live responde 200 aunque las dependencias estén caídas', async () => {
    const server = await start('down', 'down');
    const res = await request(server.getHttpServer()).get('/health/live').expect(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });

  it('GET /health/ready responde 200 cuando PostgreSQL y Redis responden', async () => {
    const server = await start('up', 'up');
    const res = await request(server.getHttpServer()).get('/health/ready').expect(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      info: { database: { status: 'up' }, redis: { status: 'up' } },
    });
  });

  it('GET /health/ready responde 503 e indica qué dependencia falló', async () => {
    const server = await start('down', 'up');
    const res = await request(server.getHttpServer()).get('/health/ready').expect(503);
    expect(res.body).toMatchObject({
      status: 'error',
      error: { database: { status: 'down' } },
      info: { redis: { status: 'up' } },
    });
  });

  it('devuelve el identificador de correlación en cada respuesta', async () => {
    const server = await start('up', 'up');
    const res = await request(server.getHttpServer())
      .get('/health/live')
      .set(REQUEST_ID_HEADER, 'prueba-123')
      .expect(200);
    expect(res.headers[REQUEST_ID_HEADER]).toBe('prueba-123');
  });
});
