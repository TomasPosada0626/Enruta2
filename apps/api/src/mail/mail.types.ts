/** Imagen incrustada en el correo; el HTML la usa con `src="cid:<contentId>"`. */
export interface InlineImage {
  contentId: string;
  filename: string;
  content: Buffer;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  /** Versión en texto plano: la leen algunos clientes y ayuda a no caer en spam. */
  text: string;
  inlineImages?: readonly InlineImage[];
  /** Evita enviar dos veces el mismo correo si la petición se reintenta. */
  idempotencyKey?: string;
}

export interface SentMail {
  /** Identificador del proveedor (o la ruta del archivo en desarrollo). */
  id: string;
}

/** Cómo sale un correo: Resend en producción, un archivo HTML en desarrollo. */
export interface MailTransport {
  send(message: MailMessage): Promise<SentMail>;
}

export const MAIL_TRANSPORT = Symbol('MAIL_TRANSPORT');

/** El proveedor rechazó el correo. No incluye el destinatario: los logs no llevan datos personales. */
export class MailDeliveryError extends Error {
  constructor(
    readonly status: number,
    readonly providerCode: string,
  ) {
    super(`El proveedor de correo respondió ${status} (${providerCode})`);
    this.name = 'MailDeliveryError';
  }
}
