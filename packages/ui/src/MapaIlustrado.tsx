import { useEffect, useId, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, G, Path, Pattern, Rect } from 'react-native-svg';

import { colores } from './tema';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Ancho de referencia del diseño: todas las coordenadas del mapa están en esta escala. */
export const ANCHO_DISENO = 390;

export type Punto = readonly [number, number];

const ZOOM = {
  barrio: { ancho: 58, alto: 44, manzanaAncho: 49, manzanaAlto: 35, radio: 4, rio: 26 },
  cerca: { ancho: 96, alto: 72, manzanaAncho: 82, manzanaAlto: 58, radio: 6, rio: 30 },
  calle: { ancho: 124, alto: 94, manzanaAncho: 108, manzanaAlto: 78, radio: 8, rio: 40 },
} as const;

export type MapaIlustradoProps = {
  /** Tamaño en pantalla, en px. */
  ancho: number;
  alto: number;
  zoom?: keyof typeof ZOOM;
  /** Trazado del río Medellín en coordenadas del diseño. */
  rio?: string;
  avenidas?: readonly string[];
  parques?: readonly { x: number; y: number; ancho: number; alto: number }[];
  /** Ruta: puntos de las paradas en orden, el índice donde va el vehículo y el de la parada propia. */
  ruta?: { puntos: readonly Punto[]; vehiculo: number; tuParada?: number };
  /** Manzana resaltada (la de la dirección que se confirma). */
  resaltar?: { x: number; y: number; ancho: number; alto: number };
};

const RIO_POR_DEFECTO = 'M96 -20 C134 90 72 170 128 262 S 188 400 158 500';

function aTexto(puntos: readonly Punto[]) {
  return puntos.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
}

/**
 * Mapa ilustrado del diseño F. Es un dibujo, no un mapa real: sirve para el prototipo
 * mientras se elige el proveedor de mapas (ADR 0008).
 */
export function MapaIlustrado({
  ancho,
  alto,
  zoom = 'barrio',
  rio = RIO_POR_DEFECTO,
  avenidas = ['M-20 318 L420 192', 'M168 -20 L232 500'],
  parques = [
    { x: 250, y: 320, ancho: 96, alto: 62 },
    { x: 22, y: 150, ancho: 74, alto: 50 },
  ],
  ruta,
  resaltar,
}: MapaIlustradoProps) {
  const id = `manzanas${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const z = ZOOM[zoom];
  const altoDiseno = (ANCHO_DISENO * alto) / ancho;

  // useState (no useRef) para que el valor animado sea estable sin leer refs durante el render.
  const [halo] = useState(() => new Animated.Value(0));
  const conRuta = ruta !== undefined;
  useEffect(() => {
    if (!conRuta) return;
    const animacion = Animated.loop(
      Animated.timing(halo, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    );
    animacion.start();
    return () => animacion.stop();
  }, [halo, conRuta]);

  const vehiculo = ruta ? ruta.puntos[ruta.vehiculo] : undefined;
  const hechos = ruta ? ruta.puntos.slice(0, ruta.vehiculo + 1) : [];
  const pendientes = ruta ? ruta.puntos.slice(ruta.vehiculo) : [];

  return (
    <Svg
      width={ancho}
      height={alto}
      viewBox={`0 0 ${ANCHO_DISENO} ${altoDiseno}`}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        <Pattern
          id={id}
          width={z.ancho}
          height={z.alto}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-16)"
        >
          <Rect width={z.manzanaAncho} height={z.manzanaAlto} rx={z.radio} fill={colores.manzana} />
        </Pattern>
      </Defs>
      <Rect width={ANCHO_DISENO} height={altoDiseno} fill={colores.blanco} />
      <Rect width={ANCHO_DISENO} height={altoDiseno} fill={`url(#${id})`} />
      {parques.map((p) => (
        <Rect
          key={`${p.x}-${p.y}`}
          x={p.x}
          y={p.y}
          width={p.ancho}
          height={p.alto}
          rx={12}
          fill={colores.parque}
          transform={`rotate(-16 ${p.x + p.ancho / 2} ${p.y + p.alto / 2})`}
        />
      ))}
      {avenidas.map((d) => (
        <Path key={d} d={d} stroke={colores.blanco} strokeWidth={13} />
      ))}
      <Path d={rio} fill="none" stroke={colores.rio} strokeWidth={z.rio} strokeLinecap="round" />
      {resaltar && (
        <Rect
          x={resaltar.x}
          y={resaltar.y}
          width={resaltar.ancho}
          height={resaltar.alto}
          rx={6}
          fill="#DADDD4"
          stroke={colores.marino}
          strokeOpacity={0.35}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          transform={`rotate(-16 ${resaltar.x + resaltar.ancho / 2} ${resaltar.y + resaltar.alto / 2})`}
        />
      )}

      {ruta && vehiculo && (
        <G>
          <Path
            d={aTexto(pendientes)}
            fill="none"
            stroke={colores.marino}
            strokeOpacity={0.5}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1 10"
          />
          <Path
            d={aTexto(hechos)}
            fill="none"
            stroke={colores.marino}
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {ruta.puntos.map(([x, y], i) =>
            i === ruta.vehiculo || i === ruta.tuParada ? null : i < ruta.vehiculo ? (
              <Circle key={i} cx={x} cy={y} r={5} fill={colores.marino} />
            ) : (
              <Circle
                key={i}
                cx={x}
                cy={y}
                r={5}
                fill={colores.blanco}
                stroke={colores.marino}
                strokeWidth={2.5}
              />
            ),
          )}
          <AnimatedCircle
            cx={vehiculo[0]}
            cy={vehiculo[1]}
            r={halo.interpolate({ inputRange: [0, 1], outputRange: [14, 34] })}
            fill={colores.naranja}
            opacity={halo.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] })}
          />
          <Circle
            cx={vehiculo[0]}
            cy={vehiculo[1]}
            r={14}
            fill={colores.naranja}
            stroke={colores.blanco}
            strokeWidth={3.5}
          />
          <Path
            d={`M${vehiculo[0] - 5} ${vehiculo[1] + 5} L${vehiculo[0]} ${vehiculo[1] - 7} L${vehiculo[0] + 5} ${vehiculo[1] + 5} L${vehiculo[0]} ${vehiculo[1] + 2} Z`}
            fill={colores.blanco}
            transform={`rotate(55 ${vehiculo[0]} ${vehiculo[1]})`}
          />
          {ruta.tuParada !== undefined && ruta.puntos[ruta.tuParada] && (
            <G
              transform={`translate(${ruta.puntos[ruta.tuParada]![0]} ${ruta.puntos[ruta.tuParada]![1]}) translate(-18 -34) scale(0.56)`}
            >
              <Path
                d="M32 3 C18.2 3 8 13.6 8 27 C8 44.5 32 61 32 61 C32 61 56 44.5 56 27 C56 13.6 45.8 3 32 3 Z"
                fill={colores.marino}
                stroke={colores.blanco}
                strokeWidth={4}
              />
              <Circle cx={32} cy={27} r={9} fill={colores.blanco} />
            </G>
          )}
        </G>
      )}
    </Svg>
  );
}
