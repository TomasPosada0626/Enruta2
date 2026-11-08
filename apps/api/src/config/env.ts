import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
    REDIS_URL: z.url({ protocol: /^rediss?$/ }),
    /** Clave de Resend (empieza por "re_"). Sin ella, en desarrollo los correos se guardan en tmp/correos. */
    RESEND_API_KEY: z
      .string()
      .regex(/^re_\w+$/, 'debe ser una clave de Resend (re_...)')
      .optional(),
    /** Remitente, por ejemplo: Enruta2 <no-responder@correo.enruta2.co>. Debe ser del dominio verificado. */
    MAIL_FROM: z.string().min(3).optional(),
    /** Dirección a la que llegan las respuestas (opcional). */
    MAIL_REPLY_TO: z.email().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return;
    for (const key of ['RESEND_API_KEY', 'MAIL_FROM'] as const) {
      if (!env[key]) {
        ctx.addIssue({ code: 'custom', path: [key], message: 'es obligatoria en producción' });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

/** Valida las variables de entorno al arrancar: la API no inicia con una configuración inválida. */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Variables de entorno inválidas:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
