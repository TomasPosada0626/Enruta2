import { Text, type TextProps } from 'react-native';

import { colores, fuentes, type Peso } from './tema';

export type TextoProps = TextProps & {
  peso?: Peso;
  tamano?: number;
  color?: string;
  /** Interlineado en px; por defecto 1,3 veces el tamaño. */
  interlineado?: number;
  /** Espaciado entre letras en px (negativo para cifras y títulos grandes). */
  espaciado?: number;
};

/** Texto con Hanken Grotesk. En Android, el peso se elige con la familia, no con fontWeight. */
export function Texto({
  peso = 500,
  tamano = 16,
  color = colores.marino,
  interlineado,
  espaciado,
  style,
  ...resto
}: TextoProps) {
  return (
    <Text
      {...resto}
      style={[
        {
          fontFamily: fuentes[peso],
          fontSize: tamano,
          color,
          lineHeight: interlineado ?? Math.round(tamano * 1.3),
          letterSpacing: espaciado,
          includeFontPadding: false,
        },
        style,
      ]}
    />
  );
}

/** Cifra grande ("8", "4"): interlineado justo y espaciado apretado, como en el diseño. */
export function Cifra({ tamano = 76, ...resto }: Omit<TextoProps, 'peso'>) {
  return (
    <Texto
      peso={800}
      tamano={tamano}
      interlineado={Math.round(tamano * 1.02)}
      espaciado={-tamano * 0.06}
      {...resto}
    />
  );
}
