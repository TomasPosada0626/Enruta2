import { EmailCodePurpose } from '@enruta2/domain';
import { describe, expect, it } from 'vitest';
import { escapeHtml, renderEmailCode } from './email-code.js';

const base = {
  audience: 'guardian' as const,
  purpose: EmailCodePurpose.VERIFY_EMAIL,
  firstName: 'Laura',
  code: '482913',
};

describe('renderEmailCode', () => {
  it('pone el código en el asunto, en el HTML (agrupado) y en el texto plano', () => {
    const mail = renderEmailCode(base);
    expect(mail.subject).toBe('482913 es tu código de Enruta2');
    expect(mail.html).toContain('482 913');
    expect(mail.text).toContain('Tu código de Enruta2 es: 482913');
    expect(mail.html).toContain('Hola, Laura: este es tu código');
  });

  it('usa la cabecera del mapa para acudientes y la azul marino para conductores', () => {
    const acudiente = renderEmailCode(base);
    const conductor = renderEmailCode({ ...base, audience: 'driver' });

    expect(acudiente.inlineImages[0]?.filename).toBe('header-guardian.png');
    expect(acudiente.html).toContain('cid:cabecera-guardian');
    expect(acudiente.html).toContain('CONFIRMA TU CORREO');

    expect(conductor.inlineImages[0]?.filename).toBe('header-driver.png');
    expect(conductor.html).toContain('cid:cabecera-driver');
    expect(conductor.html).toContain('CUENTA DE CONDUCTOR');
    expect(conductor.inlineImages[0]?.content.length).toBeGreaterThan(1000);
  });

  it('cambia el texto para recuperar la contraseña', () => {
    const mail = renderEmailCode({ ...base, purpose: EmailCodePurpose.RESET_PASSWORD });
    expect(mail.subject).toBe('482913 es tu código para cambiar la contraseña de Enruta2');
    expect(mail.html).toContain('RECUPERA TU CONTRASEÑA');
    expect(mail.text).toContain('tu contraseña sigue igual');
  });

  it('escapa el nombre para que no se pueda inyectar HTML', () => {
    const mail = renderEmailCode({ ...base, firstName: '<img src=x onerror=alert(1)>' });
    expect(mail.html).not.toContain('<img src=x');
    expect(mail.html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('saluda sin nombre si viene vacío', () => {
    expect(renderEmailCode({ ...base, firstName: '  ' }).html).toContain('Este es tu código');
  });
});

describe('escapeHtml', () => {
  it('escapa los cinco caracteres especiales', () => {
    expect(escapeHtml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });
});
