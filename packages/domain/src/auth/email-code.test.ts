import { describe, expect, it } from 'vitest';
import {
  EMAIL_CODE_RULES,
  EmailCodeResult,
  canSendEmailCode,
  emailCodeExpiresAt,
  evaluateEmailCodeAttempt,
  normalizeEmailCode,
  type EmailCodeState,
} from './email-code.js';

const SENT = new Date('2026-11-08T12:00:00Z');
const at = (seconds: number) => new Date(SENT.getTime() + seconds * 1000);

function state(overrides: Partial<EmailCodeState> = {}): EmailCodeState {
  return { expiresAt: emailCodeExpiresAt(SENT), attempts: 0, consumedAt: null, ...overrides };
}

describe('evaluateEmailCodeAttempt', () => {
  it('acepta el código correcto dentro de la vigencia', () => {
    expect(evaluateEmailCodeAttempt(state(), true, at(30))).toEqual({
      result: EmailCodeResult.VALID,
      attempts: 0,
      remainingAttempts: EMAIL_CODE_RULES.maxAttempts,
    });
  });

  it('cuenta un intento fallido y dice cuántos quedan', () => {
    expect(evaluateEmailCodeAttempt(state({ attempts: 1 }), false, at(30))).toEqual({
      result: EmailCodeResult.WRONG,
      attempts: 2,
      remainingAttempts: 3,
    });
  });

  it('bloquea el código en el último intento fallido', () => {
    const last = EMAIL_CODE_RULES.maxAttempts - 1;
    expect(evaluateEmailCodeAttempt(state({ attempts: last }), false, at(30))).toEqual({
      result: EmailCodeResult.LOCKED,
      attempts: EMAIL_CODE_RULES.maxAttempts,
      remainingAttempts: 0,
    });
  });

  it('no evalúa un código bloqueado, aunque esta vez coincida', () => {
    const locked = state({ attempts: EMAIL_CODE_RULES.maxAttempts });
    expect(evaluateEmailCodeAttempt(locked, true, at(30)).result).toBe(EmailCodeResult.LOCKED);
  });

  it('rechaza un código vencido sin gastar intentos', () => {
    const vence = EMAIL_CODE_RULES.ttlMinutes * 60;
    expect(evaluateEmailCodeAttempt(state({ attempts: 2 }), true, at(vence))).toEqual({
      result: EmailCodeResult.EXPIRED,
      attempts: 2,
      remainingAttempts: 3,
    });
  });

  it('rechaza un código que ya se usó', () => {
    const used = state({ consumedAt: at(10) });
    expect(evaluateEmailCodeAttempt(used, true, at(20)).result).toBe(EmailCodeResult.USED);
  });
});

describe('emailCodeExpiresAt', () => {
  it('vence a los 10 minutos del envío', () => {
    expect(emailCodeExpiresAt(SENT).toISOString()).toBe('2026-11-08T12:10:00.000Z');
  });
});

describe('canSendEmailCode', () => {
  it('permite el primer envío', () => {
    expect(canSendEmailCode([], SENT)).toEqual({ allowed: true });
  });

  it('pide esperar el minuto entre envíos', () => {
    expect(canSendEmailCode([SENT], at(15))).toEqual({ allowed: false, retryAfterSeconds: 45 });
  });

  it('permite reenviar cuando pasa el minuto', () => {
    expect(canSendEmailCode([SENT], at(60))).toEqual({ allowed: true });
  });

  it('limita los envíos por hora y dice cuándo se libera uno', () => {
    const sends = [0, 120, 240, 360, 480].map(at);
    expect(canSendEmailCode(sends, at(600))).toEqual({
      allowed: false,
      retryAfterSeconds: 3600 - 600,
    });
  });

  it('olvida los envíos de hace más de una hora', () => {
    const sends = [0, 120, 240, 360, 480].map(at);
    expect(canSendEmailCode(sends, at(3600 + 120))).toEqual({ allowed: true });
  });
});

describe('normalizeEmailCode', () => {
  it.each([
    ['482913', '482913'],
    ['482 913', '482913'],
    [' 482-913 ', '482913'],
  ])('acepta %j', (input, expected) => {
    expect(normalizeEmailCode(input)).toBe(expected);
  });

  it.each(['48291', '4829130', '48a913', ''])('rechaza %j', (input) => {
    expect(normalizeEmailCode(input)).toBeNull();
  });
});
