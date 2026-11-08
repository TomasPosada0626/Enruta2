import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { MailMessage, MailTransport, SentMail } from '../mail.types.js';

/**
 * Transporte de desarrollo: guarda cada correo como un HTML que se abre en el navegador, con las
 * imágenes incrustadas como data URI. Así se prueba el flujo sin una clave de Resend.
 */
export class FileTransport implements MailTransport {
  constructor(private readonly directory: string) {}

  async send(message: MailMessage): Promise<SentMail> {
    await mkdir(this.directory, { recursive: true });
    const path = join(this.directory, `${Date.now()}-${slug(message.subject)}.html`);
    await writeFile(path, inlineImagesAsDataUris(message), 'utf8');
    return { id: path };
  }
}

/** Reemplaza cada `cid:` por la imagen en base64 para ver el correo fuera de un cliente de correo. */
export function inlineImagesAsDataUris(message: Pick<MailMessage, 'html' | 'inlineImages'>) {
  return (message.inlineImages ?? []).reduce(
    (html, image) =>
      html.replaceAll(
        `cid:${image.contentId}`,
        `data:image/png;base64,${image.content.toString('base64')}`,
      ),
    message.html,
  );
}

function slug(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}
