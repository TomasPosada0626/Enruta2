// Reglas de los formularios de cuenta en el prototipo. Las mismas reglas del código viven en
// packages/domain (auth/email-code.ts) y la API las aplica de verdad; aquí solo guían a la persona.

/** Solo en el prototipo: el código que "llega" por correo. */
export const CODIGO_CORREO_DE_PRUEBA = '123456';

export const DIGITOS_CODIGO = 6;
export const INTENTOS_CODIGO = 5;
export const SEGUNDOS_PARA_REENVIAR = 60;
export const MINUTOS_DE_VIGENCIA = 10;
export const LARGO_MINIMO_CLAVE = 8;

export function esCorreoValido(correo: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.trim());
}

/** Celular colombiano: 10 cifras que empiezan por 3. */
export function esCelularValido(celular: string) {
  return /^3\d{9}$/.test(celular.replace(/\D/g, ''));
}

/** "Te queda 1 intento" / "Te quedan 3 intentos". */
export function textoIntentos(quedan: number) {
  return quedan === 1 ? 'Te queda 1 intento' : `Te quedan ${quedan} intentos`;
}

/** 42 → "0:42". */
export function textoSegundos(segundos: number) {
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`;
}
