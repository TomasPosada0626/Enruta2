import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { EMAIL_CODE_RULES, EmailCodePurpose } from '@enruta2/domain';
import type { InlineImage } from '../mail.types.js';

/** Modo de la app de quien recibe el correo: cambia la cabecera y el texto (ADR 0011). */
export type MailAudience = 'guardian' | 'driver';

export interface EmailCodeTemplateInput {
  audience: MailAudience;
  purpose: EmailCodePurpose;
  /** Nombre de pila, tal como lo escribió la persona al registrarse. */
  firstName: string;
  code: string;
}

export interface RenderedMail {
  subject: string;
  html: string;
  text: string;
  inlineImages: InlineImage[];
}

// Tokens del diseño F (packages/ui/src/tema.ts). Gmail no carga fuentes web, así que Hanken
// Grotesk solo se ve donde se puede; el resto usa la fuente del sistema.
const C = {
  marino: '#0F1F3D',
  naranjaTexto: '#A8430B',
  gris: '#5A6375',
  linea: '#E2E5DD',
  superficie: '#F6F7F9',
  blanco: '#FFFFFF',
};
const FUENTE = "'Hanken Grotesk', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const HEADERS: Record<MailAudience, { file: string; height: number; alt: string }> = {
  guardian: { file: 'header-guardian.png', height: 210, alt: 'Enruta2' },
  driver: { file: 'header-driver.png', height: 200, alt: 'Enruta2 Conductor' },
};

const headerCache = new Map<MailAudience, Buffer>();

function headerImage(audience: MailAudience): InlineImage {
  let content = headerCache.get(audience);
  if (!content) {
    const url = new URL(`./images/${HEADERS[audience].file}`, import.meta.url);
    content = readFileSync(fileURLToPath(url));
    headerCache.set(audience, content);
  }
  return { contentId: `cabecera-${audience}`, filename: HEADERS[audience].file, content };
}

interface Copy {
  eyebrow: string;
  lead: string;
  ignore: string;
  subject: (code: string) => string;
  preheader: string;
}

function copyFor(audience: MailAudience, purpose: EmailCodePurpose): Copy {
  const vence = `Vence en ${EMAIL_CODE_RULES.ttlMinutes} minutos.`;
  if (purpose === EmailCodePurpose.RESET_PASSWORD) {
    return {
      eyebrow: 'RECUPERA TU CONTRASEÑA',
      lead: 'Escríbelo en Enruta2 para crear una contraseña nueva.',
      ignore: 'Si no pediste cambiar tu contraseña, ignora este correo: tu contraseña sigue igual.',
      subject: (code) => `${code} es tu código para cambiar la contraseña de Enruta2`,
      preheader: `Escríbelo en la app para crear una contraseña nueva. ${vence}`,
    };
  }
  return {
    eyebrow: audience === 'driver' ? 'CUENTA DE CONDUCTOR' : 'CONFIRMA TU CORREO',
    lead:
      audience === 'driver'
        ? 'Escríbelo en Enruta2 para activar tu cuenta y empezar tus recorridos.'
        : 'Escríbelo en Enruta2 para crear tu cuenta y seguir en vivo la ruta de tus hijos.',
    ignore:
      'Si no creaste una cuenta en Enruta2, ignora este correo: sin este código nadie puede usar tu dirección.',
    subject: (code) => `${code} es tu código de Enruta2`,
    preheader: `Escríbelo en la app para activar tu cuenta. ${vence}`,
  };
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** El nombre lo escribe la persona: se escapa para que no pueda inyectar HTML en el correo. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

/** "482913" → "482 913": más fácil de leer y de copiar (la app ignora el espacio). */
function groupCode(code: string) {
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

/** Correo con el código de 6 dígitos, con la identidad de la app según el modo. */
export function renderEmailCode(input: EmailCodeTemplateInput): RenderedMail {
  const copy = copyFor(input.audience, input.purpose);
  const name = input.firstName.trim().slice(0, 40);
  const greeting = name ? `Hola, ${escapeHtml(name)}: este es tu código` : 'Este es tu código';
  const header = HEADERS[input.audience];
  const image = headerImage(input.audience);
  const grouped = groupCode(input.code);
  const expiry = `Vence en ${EMAIL_CODE_RULES.ttlMinutes} minutos. Si pides otro, este deja de servir.`;
  const warning =
    'Nadie de Enruta2 ni de la empresa de transporte te va a pedir este código por WhatsApp o por llamada.';

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(copy.subject(grouped))}</title>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;700;800&display=swap" rel="stylesheet">
<style>
  @media (max-width: 600px) {
    .contenido { padding-left: 22px !important; padding-right: 22px !important; }
    .titulo { font-size: 26px !important; line-height: 30px !important; }
    .codigo { font-size: 38px !important; letter-spacing: 6px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.superficie};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.superficie};">${copy.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.superficie};">
  <tr>
    <td align="center" style="padding:28px 12px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background:${C.blanco};border-radius:20px;">
        <tr>
          <td style="padding:0;line-height:0;">
            <img src="cid:${image.contentId}" width="560" height="${header.height}" alt="${header.alt}" style="display:block;width:100%;max-width:560px;height:auto;border:0;border-radius:20px 20px 0 0;">
          </td>
        </tr>
        <tr>
          <td class="contenido" style="padding:6px 36px 8px;font-family:${FUENTE};color:${C.marino};">
            <p style="margin:0 0 10px;font-size:12px;line-height:16px;font-weight:800;letter-spacing:1.6px;color:${C.naranjaTexto};">${copy.eyebrow}</p>
            <h1 class="titulo" style="margin:0 0 10px;font-size:30px;line-height:34px;font-weight:800;letter-spacing:-1px;color:${C.marino};">${greeting}</h1>
            <p style="margin:0;font-size:16px;line-height:24px;color:${C.gris};">${copy.lead}</p>
          </td>
        </tr>
        <tr>
          <td class="contenido" style="padding:20px 36px 4px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="background:${C.superficie};border:1.5px solid ${C.linea};border-radius:16px;padding:20px 8px;">
                  <span class="codigo" style="font-family:${FUENTE};font-size:44px;line-height:52px;font-weight:800;letter-spacing:10px;color:${C.marino};white-space:nowrap;">${grouped}</span>
                </td>
              </tr>
            </table>
            <p style="margin:12px 0 0;font-family:${FUENTE};font-size:14px;line-height:20px;color:${C.gris};text-align:center;">${expiry}</p>
          </td>
        </tr>
        <tr>
          <td class="contenido" style="padding:24px 36px 32px;font-family:${FUENTE};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-top:1px solid ${C.linea};padding-top:20px;font-size:14px;line-height:21px;color:${C.gris};">
                  <p style="margin:0 0 8px;"><strong style="color:${C.marino};">${warning}</strong></p>
                  <p style="margin:0;">${copy.ignore}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="margin:18px 0 0;font-family:${FUENTE};font-size:12px;line-height:18px;color:${C.gris};">Enruta2 · Rutas escolares en el Valle de Aburrá</p>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    name ? `Hola, ${name}:` : 'Hola:',
    '',
    `Tu código de Enruta2 es: ${input.code}`,
    '',
    copy.lead,
    expiry,
    '',
    warning,
    copy.ignore,
    '',
    'Enruta2 · Rutas escolares en el Valle de Aburrá',
  ].join('\n');

  return { subject: copy.subject(input.code), html, text, inlineImages: [image] };
}
