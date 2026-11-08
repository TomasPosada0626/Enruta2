/**
 * Código de 6 dígitos que llega por correo para verificar la cuenta o recuperar la contraseña
 * (spec, sección 6.7). La API guarda solo el hash del código; estas reglas deciden qué pasa con
 * cada intento y cuándo se puede pedir otro.
 */

/** Para qué se envió el código. */
export const EmailCodePurpose = {
  VERIFY_EMAIL: 'VERIFY_EMAIL',
  RESET_PASSWORD: 'RESET_PASSWORD',
} as const;

export type EmailCodePurpose = (typeof EmailCodePurpose)[keyof typeof EmailCodePurpose];

export const EMAIL_CODE_RULES = {
  /** Cifras del código. */
  digits: 6,
  /** Minutos de vigencia desde que se envía. */
  ttlMinutes: 10,
  /** Intentos fallidos permitidos por código; después hay que pedir otro. */
  maxAttempts: 5,
  /** Segundos de espera entre un envío y el siguiente al mismo correo. */
  resendCooldownSeconds: 60,
  /** Envíos máximos al mismo correo en una hora. */
  maxSendsPerHour: 5,
} as const;

const HOUR_MS = 60 * 60 * 1000;

/** Lo que la API guarda de cada código enviado (sin el código en claro). */
export interface EmailCodeState {
  expiresAt: Date;
  /** Intentos fallidos hasta ahora. */
  attempts: number;
  /** Fecha en que se usó, o `null` si sigue disponible. */
  consumedAt: Date | null;
}

export const EmailCodeResult = {
  /** El código es correcto: la cuenta queda verificada o se puede cambiar la contraseña. */
  VALID: 'VALID',
  /** No coincide; quedan intentos. */
  WRONG: 'WRONG',
  /** Pasaron los minutos de vigencia. */
  EXPIRED: 'EXPIRED',
  /** Se agotaron los intentos de este código. */
  LOCKED: 'LOCKED',
  /** Ya se usó. */
  USED: 'USED',
} as const;

export type EmailCodeResult = (typeof EmailCodeResult)[keyof typeof EmailCodeResult];

export interface EmailCodeAttempt {
  result: EmailCodeResult;
  /** Intentos fallidos después de este intento (lo que la API debe guardar). */
  attempts: number;
  /** Intentos que le quedan a la persona con este código. */
  remainingAttempts: number;
}

/**
 * Evalúa un intento. `matches` lo calcula la API comparando hashes en tiempo constante.
 * Un código usado, vencido o bloqueado no se evalúa: así no se puede seguir probando cifras.
 */
export function evaluateEmailCodeAttempt(
  state: EmailCodeState,
  matches: boolean,
  now: Date,
): EmailCodeAttempt {
  const { maxAttempts } = EMAIL_CODE_RULES;
  const rest = (attempts: number) => Math.max(0, maxAttempts - attempts);

  if (state.consumedAt !== null) {
    return { result: EmailCodeResult.USED, attempts: state.attempts, remainingAttempts: 0 };
  }
  if (state.attempts >= maxAttempts) {
    return { result: EmailCodeResult.LOCKED, attempts: state.attempts, remainingAttempts: 0 };
  }
  if (now.getTime() >= state.expiresAt.getTime()) {
    return {
      result: EmailCodeResult.EXPIRED,
      attempts: state.attempts,
      remainingAttempts: rest(state.attempts),
    };
  }
  if (matches) {
    return {
      result: EmailCodeResult.VALID,
      attempts: state.attempts,
      remainingAttempts: rest(state.attempts),
    };
  }

  const attempts = state.attempts + 1;
  return {
    result: attempts >= maxAttempts ? EmailCodeResult.LOCKED : EmailCodeResult.WRONG,
    attempts,
    remainingAttempts: rest(attempts),
  };
}

/** Fecha de vencimiento de un código enviado en `sentAt`. */
export function emailCodeExpiresAt(sentAt: Date): Date {
  return new Date(sentAt.getTime() + EMAIL_CODE_RULES.ttlMinutes * 60 * 1000);
}

export type ResendDecision = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * Decide si se puede enviar otro código al mismo correo, a partir de las fechas de los envíos
 * anteriores. Limita los reenvíos seguidos y el total por hora.
 */
export function canSendEmailCode(previousSends: readonly Date[], now: Date): ResendDecision {
  const { resendCooldownSeconds, maxSendsPerHour } = EMAIL_CODE_RULES;
  const t = now.getTime();
  const lastHour = previousSends.map((d) => d.getTime()).filter((s) => s <= t && t - s < HOUR_MS);

  if (lastHour.length === 0) return { allowed: true };

  const latest = Math.max(...lastHour);
  const cooldownLeft = resendCooldownSeconds * 1000 - (t - latest);
  if (cooldownLeft > 0) {
    return { allowed: false, retryAfterSeconds: Math.ceil(cooldownLeft / 1000) };
  }

  if (lastHour.length >= maxSendsPerHour) {
    const oldest = Math.min(...lastHour);
    return { allowed: false, retryAfterSeconds: Math.ceil((oldest + HOUR_MS - t) / 1000) };
  }

  return { allowed: true };
}

/**
 * Limpia lo que la persona escribió o pegó ("482 913", "482-913") y devuelve solo las cifras,
 * o `null` si no queda un código de 6 cifras.
 */
export function normalizeEmailCode(input: string): string | null {
  const digits = input.replace(/[\s-]/g, '');
  return new RegExp(`^\\d{${EMAIL_CODE_RULES.digits}}$`).test(digits) ? digits : null;
}
