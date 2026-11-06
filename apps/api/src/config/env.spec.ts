import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.js';

const valid = {
  DATABASE_URL: 'postgresql://enruta2:enruta2@localhost:15432/enruta2',
  REDIS_URL: 'redis://localhost:6379',
};

describe('validateEnv', () => {
  it('aplica valores por defecto y convierte el puerto a número', () => {
    expect(validateEnv({ ...valid, PORT: '4000' })).toEqual({
      ...valid,
      NODE_ENV: 'development',
      PORT: 4000,
      LOG_LEVEL: 'info',
    });
  });

  it('falla si falta DATABASE_URL', () => {
    expect(() => validateEnv({ REDIS_URL: valid.REDIS_URL })).toThrow(/DATABASE_URL/);
  });

  it('rechaza una DATABASE_URL que no es de PostgreSQL', () => {
    expect(() => validateEnv({ ...valid, DATABASE_URL: 'mysql://localhost/enruta2' })).toThrow(
      /DATABASE_URL/,
    );
  });

  it('rechaza un nivel de log desconocido', () => {
    expect(() => validateEnv({ ...valid, LOG_LEVEL: 'verbose' })).toThrow(/LOG_LEVEL/);
  });
});
