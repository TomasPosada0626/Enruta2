import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Params } from 'nestjs-pino';
import type { Env } from '../config/env.js';

export const REQUEST_ID_HEADER = 'x-request-id';

// Solo se acepta un identificador corto y sin caracteres especiales, para evitar inyección en los logs.
const SAFE_REQUEST_ID = /^[\w-]{1,64}$/;

/** Reusa el identificador de correlación que envía el cliente si es seguro; si no, genera uno. */
export function resolveRequestId(req: IncomingMessage, res: ServerResponse): string {
  const incoming = req.headers[REQUEST_ID_HEADER];
  const id =
    typeof incoming === 'string' && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID();
  res.setHeader(REQUEST_ID_HEADER, id);
  return id;
}

/**
 * Logs JSON estructurados con identificador de correlación (spec, sección 7.4).
 * Nunca se registran cuerpos de petición: pueden traer datos de menores (spec, sección 7.1).
 */
export function createLoggerParams(env: Pick<Env, 'NODE_ENV' | 'LOG_LEVEL'>): Params {
  return {
    pinoHttp: {
      level: env.LOG_LEVEL,
      genReqId: resolveRequestId,
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
        censor: '[REDACTADO]',
      },
      // Los health checks llegan cada pocos segundos: registrarlos solo agrega ruido.
      autoLogging: { ignore: (req) => req.url?.startsWith('/health') ?? false },
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: { singleLine: true, translateTime: 'SYS:HH:MM:ss.l' },
            }
          : undefined,
    },
  };
}
