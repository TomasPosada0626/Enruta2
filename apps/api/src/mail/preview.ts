// Vista previa y prueba real de los correos con código.
//
//   pnpm correo                       genera los 4 correos en apps/api/tmp/correos/vista-previa
//   pnpm correo --para tu@gmail.com   además envía los dos de verificación con Resend
//
// Para enviar, apps/api/.env debe tener RESEND_API_KEY. Sin MAIL_FROM se usa el remitente de
// prueba de Resend, que solo entrega al correo con el que creaste la cuenta de Resend.

import { randomInt } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { EmailCodePurpose } from '@enruta2/domain';
import { createMailTransport } from './mail.module.js';
import { inlineImagesAsDataUris } from './transports/file.transport.js';
import { type MailAudience, renderEmailCode } from './templates/email-code.js';

if (existsSync('.env')) process.loadEnvFile('.env');

const VARIANTES: {
  archivo: string;
  audience: MailAudience;
  purpose: EmailCodePurpose;
  nombre: string;
}[] = [
  {
    archivo: 'acudiente-verificar',
    audience: 'guardian',
    purpose: EmailCodePurpose.VERIFY_EMAIL,
    nombre: 'Laura',
  },
  {
    archivo: 'conductor-verificar',
    audience: 'driver',
    purpose: EmailCodePurpose.VERIFY_EMAIL,
    nombre: 'Luis',
  },
  {
    archivo: 'acudiente-recuperar',
    audience: 'guardian',
    purpose: EmailCodePurpose.RESET_PASSWORD,
    nombre: 'Laura',
  },
  {
    archivo: 'conductor-recuperar',
    audience: 'driver',
    purpose: EmailCodePurpose.RESET_PASSWORD,
    nombre: 'Luis',
  },
];

const carpeta = resolve('tmp', 'correos', 'vista-previa');
await mkdir(carpeta, { recursive: true });

for (const v of VARIANTES) {
  const correo = renderEmailCode({
    audience: v.audience,
    purpose: v.purpose,
    firstName: v.nombre,
    code: '482913',
  });
  const ruta = join(carpeta, `${v.archivo}.html`);
  await writeFile(ruta, inlineImagesAsDataUris(correo), 'utf8');
  console.log(`Vista previa: ${ruta}`);
}

const indice = process.argv.indexOf('--para');
const para = indice >= 0 ? process.argv[indice + 1] : undefined;

if (para) {
  const { RESEND_API_KEY, MAIL_FROM, MAIL_REPLY_TO } = process.env;
  if (!RESEND_API_KEY) {
    console.error('\nFalta RESEND_API_KEY en apps/api/.env (resend.com → API Keys).');
    process.exit(1);
  }
  const transporte = createMailTransport({ RESEND_API_KEY, MAIL_FROM, MAIL_REPLY_TO });
  for (const v of VARIANTES.filter((x) => x.purpose === EmailCodePurpose.VERIFY_EMAIL)) {
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const correo = renderEmailCode({
      audience: v.audience,
      purpose: v.purpose,
      firstName: v.nombre,
      code,
    });
    const enviado = await transporte.send({ to: para, ...correo });
    console.log(`Enviado (${v.archivo}): ${enviado.id}`);
  }
}
