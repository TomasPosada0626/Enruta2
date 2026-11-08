import {
  MailDeliveryError,
  type MailMessage,
  type MailTransport,
  type SentMail,
} from '../mail.types.js';

const RESEND_URL = 'https://api.resend.com/emails';

/** Remitente de prueba de Resend: solo entrega al correo de la cuenta, sin dominio verificado. */
export const RESEND_TEST_SENDER = 'Enruta2 <onboarding@resend.dev>';

export interface ResendOptions {
  apiKey: string;
  from: string;
  replyTo?: string | undefined;
  /** Inyectable para los tests. */
  fetch?: typeof fetch;
}

/** Envía con la API REST de Resend (https://resend.com/docs/api-reference/emails/send-email). */
export class ResendTransport implements MailTransport {
  private readonly fetch: typeof fetch;

  constructor(private readonly options: ResendOptions) {
    this.fetch = options.fetch ?? globalThis.fetch;
  }

  async send(message: MailMessage): Promise<SentMail> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.options.apiKey}`,
      'Content-Type': 'application/json',
    };
    if (message.idempotencyKey) headers['Idempotency-Key'] = message.idempotencyKey;

    const response = await this.fetch(RESEND_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: this.options.from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(this.options.replyTo ? { reply_to: this.options.replyTo } : {}),
        attachments: (message.inlineImages ?? []).map((image) => ({
          filename: image.filename,
          content: image.content.toString('base64'),
          content_id: image.contentId,
        })),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    const body = (await response.json().catch(() => ({}))) as { id?: string; name?: string };
    if (!response.ok || !body.id) {
      throw new MailDeliveryError(response.status, body.name ?? 'unknown_error');
    }
    return { id: body.id };
  }
}
