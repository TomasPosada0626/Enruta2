import { describe, expect, it, vi } from 'vitest';
import { MailDeliveryError } from '../mail.types.js';
import { inlineImagesAsDataUris } from './file.transport.js';
import { ResendTransport } from './resend.transport.js';

const message = {
  to: 'laura@example.com',
  subject: '482913 es tu código de Enruta2',
  html: '<img src="cid:cabecera-guardian">',
  text: 'Tu código de Enruta2 es: 482913',
  inlineImages: [
    {
      contentId: 'cabecera-guardian',
      filename: 'header-guardian.png',
      content: Buffer.from('png'),
    },
  ],
};

function fakeFetch(status: number, body: unknown) {
  return vi.fn<typeof fetch>(() => Promise.resolve(new Response(JSON.stringify(body), { status })));
}

describe('ResendTransport', () => {
  it('envía el correo con la imagen incrustada y devuelve el id de Resend', async () => {
    const fetch = fakeFetch(200, { id: 'email_123' });
    const transport = new ResendTransport({
      apiKey: 're_test',
      from: 'Enruta2 <no-responder@correo.enruta2.co>',
      replyTo: 'soporte@enruta2.co',
      fetch,
    });

    await expect(transport.send({ ...message, idempotencyKey: 'codigo-1' })).resolves.toEqual({
      id: 'email_123',
    });

    const [url, init] = fetch.mock.calls[0]!;
    expect(url).toBe('https://api.resend.com/emails');
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer re_test');
    expect(headers['Idempotency-Key']).toBe('codigo-1');
    expect(JSON.parse(init?.body as string)).toEqual({
      from: 'Enruta2 <no-responder@correo.enruta2.co>',
      to: ['laura@example.com'],
      subject: message.subject,
      html: message.html,
      text: message.text,
      reply_to: 'soporte@enruta2.co',
      attachments: [
        {
          filename: 'header-guardian.png',
          content: Buffer.from('png').toString('base64'),
          content_id: 'cabecera-guardian',
        },
      ],
    });
  });

  it('lanza MailDeliveryError sin el destinatario cuando Resend rechaza el correo', async () => {
    const transport = new ResendTransport({
      apiKey: 're_test',
      from: 'Enruta2 <onboarding@resend.dev>',
      fetch: fakeFetch(422, { name: 'validation_error', message: 'Invalid `to`' }),
    });

    const error = await transport.send(message).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(MailDeliveryError);
    expect((error as MailDeliveryError).status).toBe(422);
    expect((error as Error).message).not.toContain('laura@example.com');
  });
});

describe('inlineImagesAsDataUris', () => {
  it('reemplaza cada cid por la imagen en base64', () => {
    expect(inlineImagesAsDataUris(message)).toBe(
      `<img src="data:image/png;base64,${Buffer.from('png').toString('base64')}">`,
    );
  });
});
