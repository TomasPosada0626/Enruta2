import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { MAIL_TRANSPORT, type MailTransport, type SentMail } from './mail.types.js';
import { type EmailCodeTemplateInput, renderEmailCode } from './templates/email-code.js';

@Injectable()
export class MailService {
  constructor(
    @Inject(MAIL_TRANSPORT) private readonly transport: MailTransport,
    @InjectPinoLogger(MailService.name) private readonly logger: PinoLogger,
  ) {}

  /**
   * Envía el código de verificación o de recuperación. El log no incluye el correo ni el código
   * (spec, sección 7.1); solo el propósito, el modo y el id del proveedor.
   */
  async sendEmailCode(
    to: string,
    input: EmailCodeTemplateInput,
    idempotencyKey?: string,
  ): Promise<SentMail> {
    const mail = renderEmailCode(input);
    const sent = await this.transport.send({ to, ...mail, idempotencyKey });
    this.logger.info(
      { purpose: input.purpose, audience: input.audience, mailId: sent.id },
      'Correo con código enviado',
    );
    return sent;
  }
}
