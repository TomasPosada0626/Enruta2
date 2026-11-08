// Tokens del diseño F (lienzo "Enruta2 — Diseño de las apps", página "Pantallas · F").

export const colores = {
  marino: '#0F1F3D',
  naranja: '#F26B1D',
  /** Naranja para texto sobre blanco o crema (cumple 4.5:1). */
  naranjaTexto: '#A8430B',
  /** Naranja para íconos y trazos sobre blanco. */
  naranjaIcono: '#C2510F',
  naranjaSuave: '#FFF1E8',
  naranjaAviso: '#FFF4EC',
  gris: '#5A6375',
  grisOscuro: '#3B4558',
  grisClaro: '#C3CAD8',
  grisMarcador: '#8A93A6',
  linea: '#E2E5DD',
  lineaSuave: '#EEF0F3',
  borde: '#D5D9E0',
  bordeFuerte: '#9AA3B5',
  superficie: '#F6F7F9',
  marinoSuave: '#E3E8F2',
  blanco: '#FFFFFF',
  velo: 'rgba(15,31,61,0.55)',
  blancoTenue: 'rgba(255,255,255,0.12)',
  blancoMedio: 'rgba(255,255,255,0.2)',
  // Cartografía del mapa ilustrado.
  manzana: '#E6E8E1',
  rio: '#C9DCEB',
  parque: '#D4E4CC',
} as const;

export const radios = {
  boton: 14,
  botonGrande: 16,
  tarjeta: 20,
  hoja: 30,
  pildora: 999,
} as const;

/** Familias de Hanken Grotesk que cargan las apps con @expo-google-fonts/hanken-grotesk. */
export const fuentes = {
  400: 'HankenGrotesk_400Regular',
  500: 'HankenGrotesk_500Medium',
  600: 'HankenGrotesk_600SemiBold',
  700: 'HankenGrotesk_700Bold',
  800: 'HankenGrotesk_800ExtraBold',
} as const;

export type Peso = keyof typeof fuentes;

export const sombra = {
  shadowColor: colores.marino,
  shadowOpacity: 0.14,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
} as const;

export const sombraHoja = {
  shadowColor: colores.marino,
  shadowOpacity: 0.12,
  shadowRadius: 30,
  shadowOffset: { width: 0, height: -10 },
  elevation: 16,
} as const;
