import { resolve } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';
import { MailService } from './mail.service.js';
import { MAIL_TRANSPORT, type MailTransport } from './mail.types.js';
import { FileTransport } from './transports/file.transport.js';
import { RESEND_TEST_SENDER, ResendTransport } from './transports/resend.transport.js';

/** Carpeta donde quedan los correos en desarrollo cuando no hay clave de Resend. */
export const DEV_MAIL_DIR = resolve('tmp', 'correos');

export function createMailTransport(
  env: Pick<Env, 'RESEND_API_KEY' | 'MAIL_FROM' | 'MAIL_REPLY_TO'>,
): MailTransport {
  if (env.RESEND_API_KEY) {
    return new ResendTransport({
      apiKey: env.RESEND_API_KEY,
      from: env.MAIL_FROM ?? RESEND_TEST_SENDER,
      replyTo: env.MAIL_REPLY_TO,
    });
  }
  // validateEnv exige la clave en producción; aquí solo se llega en desarrollo y en tests.
  return new FileTransport(DEV_MAIL_DIR);
}

@Module({
  providers: [
    {
      provide: MAIL_TRANSPORT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        createMailTransport({
          RESEND_API_KEY: config.get('RESEND_API_KEY', { infer: true }),
          MAIL_FROM: config.get('MAIL_FROM', { infer: true }),
          MAIL_REPLY_TO: config.get('MAIL_REPLY_TO', { infer: true }),
        }),
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
