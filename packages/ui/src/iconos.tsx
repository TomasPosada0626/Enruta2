import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colores } from './tema';

export type IconoProps = {
  tamano?: number;
  color?: string;
  grosor?: number;
};

type Trazo = { color: string; grosor: number };

/** Íconos de línea (24×24) del diseño F. Siempre decorativos: el texto o el accessibilityLabel del botón los describe. */
function crearIcono(dibujar: (t: Trazo) => ReactNode, grosorBase = 2) {
  return function Icono({ tamano = 20, color = colores.marino, grosor = grosorBase }: IconoProps) {
    return (
      <Svg
        width={tamano}
        height={tamano}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={grosor}
        strokeLinecap="round"
        strokeLinejoin="round"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {dibujar({ color, grosor })}
      </Svg>
    );
  };
}

export const IconoMenu = crearIcono(() => <Path d="M4 7h16M4 12h16M4 17h10" />, 2.2);
export const IconoTelefono = crearIcono(() => (
  <Path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
));
export const IconoCasa = crearIcono(() => (
  <>
    <Path d="M3 11l9-7 9 7" />
    <Path d="M5 10v10h14V10" />
  </>
));
export const IconoCheck = crearIcono(() => <Path d="M5 12l5 5L20 7" />, 2.8);
export const IconoCheckCirculo = crearIcono(
  () => (
    <>
      <Circle cx={12} cy={12} r={10} />
      <Path d="M7.5 12.5l3 3 6-6.5" />
    </>
  ),
  2.2,
);
export const IconoEquis = crearIcono(() => <Path d="M6 6l12 12M18 6L6 18" />, 2.6);
export const IconoMapa = crearIcono(() => (
  <>
    <Path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
    <Path d="M9 4v14M15 6v14" />
  </>
));
export const IconoGps = crearIcono(
  ({ color }) => (
    <>
      <Circle cx={12} cy={12} r={7} />
      <Circle cx={12} cy={12} r={2} fill={color} />
      <Path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  2.2,
);
export const IconoGpsApagado = crearIcono(({ color }) => (
  <>
    <Circle cx={12} cy={12} r={7} />
    <Circle cx={12} cy={12} r={2} fill={color} />
    <Path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    <Path d="M4 4l16 16" strokeWidth={2.6} />
  </>
));
export const IconoPorteria = crearIcono(
  () => (
    <>
      <Path d="M6 21V4h12v17" />
      <Path d="M3 21h18" />
      <Path d="M14 12h.01" />
    </>
  ),
  2.2,
);
export const IconoFlecha = crearIcono(() => <Path d="M5 12h14M13 6l6 6-6 6" />, 2.4);
export const IconoAtras = crearIcono(() => <Path d="M15 6l-6 6 6 6" />, 2.2);
export const IconoSiguiente = crearIcono(() => <Path d="M9 6l6 6-6 6" />, 2.2);
export const IconoNavegar = crearIcono(() => <Path d="M3 11l18-8-8 18-2-8-8-2z" />, 2.4);
export const IconoCampana = crearIcono(() => (
  <>
    <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <Path d="M10 21a2 2 0 0 0 4 0" />
  </>
));
export const IconoInfo = crearIcono(() => (
  <>
    <Circle cx={12} cy={12} r={9} />
    <Path d="M12 11v5M12 8h.01" />
  </>
));
export const IconoOjo = crearIcono(() => (
  <>
    <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <Circle cx={12} cy={12} r={3} />
  </>
));
export const IconoEnlace = crearIcono(
  () => (
    <>
      <Path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <Path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </>
  ),
  2.2,
);
export const IconoMas = crearIcono(() => <Path d="M12 5v14M5 12h14" />, 2.4);
export const IconoEscudo = crearIcono(() => (
  <>
    <Path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
    <Path d="M9 12l2 2 4-4" />
  </>
));
export const IconoCalendarioNo = crearIcono(() => (
  <>
    <Rect x={3} y={5} width={18} height={16} rx={3} />
    <Path d="M3 10h18M8 3v4M16 3v4M10 14l4 4M14 14l-4 4" />
  </>
));
export const IconoPersonaNo = crearIcono(
  () => (
    <>
      <Circle cx={9} cy={8} r={4} />
      <Path d="M2 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5" />
      <Path d="M17 8l5 5M22 8l-5 5" />
    </>
  ),
  2.2,
);
export const IconoCandado = crearIcono(
  () => (
    <>
      <Rect x={5} y={11} width={14} height={10} rx={2} />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  2.2,
);
export const IconoSonido = crearIcono(
  () => (
    <>
      <Path d="M11 5L6 9H3v6h3l5 4V5z" />
      <Path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
    </>
  ),
  2.2,
);
export const IconoUbicacion = crearIcono(
  () => (
    <>
      <Path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <Circle cx={12} cy={9.5} r={2.5} />
    </>
  ),
  2.2,
);
export const IconoCalendario = crearIcono(() => (
  <>
    <Rect x={3} y={5} width={18} height={16} rx={3} />
    <Path d="M3 10h18M8 3v4M16 3v4" />
  </>
));
export const IconoRuta = crearIcono(() => (
  <>
    <Circle cx={6} cy={19} r={2.5} />
    <Circle cx={18} cy={5} r={2.5} />
    <Path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" />
  </>
));
export const IconoPersona = crearIcono(() => (
  <>
    <Circle cx={12} cy={8} r={4} />
    <Path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
  </>
));
export const IconoPersonas = crearIcono(() => (
  <>
    <Circle cx={9} cy={8} r={3.5} />
    <Path d="M2.5 20c0-3.9 2.9-6.2 6.5-6.2s6.5 2.3 6.5 6.2" />
    <Path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.2c2.2.7 3.5 2.8 3.5 5.8" />
  </>
));
export const IconoPortapapeles = crearIcono(() => (
  <>
    <Rect x={5} y={4} width={14} height={17} rx={2.5} />
    <Path d="M9 4V3h6v1M9 13l2 2 4-4" />
  </>
));
export const IconoCompartir = crearIcono(() => (
  <>
    <Path d="M12 3v12M7 8l5-5 5 5" />
    <Path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </>
));
export const IconoSalir = crearIcono(() => (
  <>
    <Path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <Path d="M10 8l-4 4 4 4M6 12h10" />
  </>
));
export const IconoMover = crearIcono(
  () => (
    <Path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" />
  ),
  2.2,
);

export const IconoSobre = crearIcono(() => (
  <>
    <Rect x={3} y={5} width={18} height={14} rx={3} />
    <Path d="M4 7l8 6 8-6" />
  </>
));
