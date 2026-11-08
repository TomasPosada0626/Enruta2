import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { Texto } from './Texto';
import { colores } from './tema';

const RUTA_DOS = 'M19 25 C19 15 45 14 45 26 C45 35 27 39 19 49 L46 49';
const PIN =
  'M32 3 C18.2 3 8 13.6 8 27 C8 44.5 32 61 32 61 C32 61 56 44.5 56 27 C56 13.6 45.8 3 32 3 Z';

type PinProps = { tamano?: number; sobreOscuro?: boolean };

/** El logo: un pin con el "2" de Enruta2 dibujado como una ruta, con su parada final en naranja. */
export function PinLogo({ tamano = 32, sobreOscuro = false }: PinProps) {
  const fondo = sobreOscuro ? colores.blanco : colores.marino;
  const trazo = sobreOscuro ? colores.marino : colores.blanco;
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 64 64" accessibilityElementsHidden>
      <Path d={PIN} fill={fondo} />
      <G transform="translate(32 27) scale(0.56) translate(-32.5 -32)">
        <Path
          d={RUTA_DOS}
          fill="none"
          stroke={trazo}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={46} cy={49} r={8} fill={colores.naranja} stroke={fondo} strokeWidth={3} />
      </G>
    </Svg>
  );
}

/** Pin de parada (la parada del acudiente o la que se confirma en el mapa). */
export function PinParada({
  tamano = 40,
  centro = colores.blanco,
}: {
  tamano?: number;
  centro?: string;
}) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 64 64" accessibilityElementsHidden>
      <Path d={PIN} fill={colores.marino} stroke={colores.blanco} strokeWidth={3} />
      <Circle cx={32} cy={27} r={9} fill={centro} />
    </Svg>
  );
}

/** Logo con el nombre: "enruta2". */
export function Marca({ tamano = 20, sobreOscuro = false }: PinProps) {
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
      accessible
      accessibilityLabel="Enruta2"
    >
      <PinLogo tamano={Math.round(tamano * 1.6)} sobreOscuro={sobreOscuro} />
      <Texto
        peso={800}
        tamano={tamano}
        espaciado={-tamano * 0.04}
        color={sobreOscuro ? colores.blanco : colores.marino}
      >
        enruta
        <Texto
          peso={800}
          tamano={tamano}
          color={sobreOscuro ? colores.naranja : colores.naranjaIcono}
        >
          2
        </Texto>
      </Texto>
    </View>
  );
}
