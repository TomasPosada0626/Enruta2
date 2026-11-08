import { useState, type ReactNode } from 'react';
import {
  Pressable,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { IconoInfo } from './iconos';
import { Texto } from './Texto';
import { colores, radios, sombraHoja } from './tema';

// ── Botón ─────────────────────────────────────────────────────────────────────

export type VarianteBoton =
  'marino' | 'naranja' | 'contorno' | 'contornoNaranja' | 'contornoClaro' | 'blanco' | 'texto';

const estilosBoton: Record<VarianteBoton, { fondo: string; texto: string; borde?: string }> = {
  marino: { fondo: colores.marino, texto: colores.blanco },
  naranja: { fondo: colores.naranja, texto: colores.marino },
  contorno: { fondo: colores.blanco, texto: colores.marino, borde: colores.marino },
  contornoNaranja: { fondo: colores.blanco, texto: colores.marino, borde: colores.naranja },
  contornoClaro: { fondo: 'transparent', texto: colores.blanco, borde: 'rgba(255,255,255,0.4)' },
  blanco: { fondo: colores.blanco, texto: colores.marino },
  texto: { fondo: 'transparent', texto: colores.marino },
};

export type BotonProps = {
  titulo: string;
  onPress?: () => void;
  variante?: VarianteBoton;
  alto?: number;
  tamanoTexto?: number;
  icono?: ReactNode;
  iconoDerecha?: ReactNode;
  deshabilitado?: boolean;
  accessibilityLabel?: string;
  estilo?: StyleProp<ViewStyle>;
};

export function Boton({
  titulo,
  onPress,
  variante = 'marino',
  alto = 56,
  tamanoTexto = 17,
  icono,
  iconoDerecha,
  deshabilitado = false,
  accessibilityLabel,
  estilo,
}: BotonProps) {
  const v = estilosBoton[variante];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        {
          height: alto,
          borderRadius: alto >= 58 ? radios.botonGrande : radios.boton,
          backgroundColor: deshabilitado ? colores.lineaSuave : v.fondo,
          borderWidth: v.borde && !deshabilitado ? 2 : 0,
          borderColor: v.borde,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingHorizontal: 16,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: pressed && variante === 'texto' ? 0.6 : 1,
        },
        estilo,
      ]}
    >
      {icono}
      <Texto
        peso={variante === 'naranja' ? 800 : 700}
        tamano={tamanoTexto}
        color={deshabilitado ? colores.gris : v.texto}
        style={variante === 'texto' ? { textDecorationLine: 'underline' } : undefined}
      >
        {titulo}
      </Texto>
      {iconoDerecha}
    </Pressable>
  );
}

/** Botón redondo solo con ícono (menú, volver). */
export function BotonIcono({
  children,
  onPress,
  accessibilityLabel,
  sobreOscuro = false,
  flotante = false,
  plano = false,
}: {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  sobreOscuro?: boolean;
  flotante?: boolean;
  /** Sin fondo ni borde, por ejemplo dentro de un campo de texto. */
  plano?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: plano ? 44 : 46,
          height: plano ? 44 : 46,
          borderRadius: radios.pildora,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: plano
            ? 'transparent'
            : sobreOscuro
              ? colores.blancoTenue
              : colores.blanco,
          borderWidth: sobreOscuro || flotante || plano ? 0 : 1.5,
          borderColor: colores.linea,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
        flotante && {
          shadowColor: colores.marino,
          shadowOpacity: 0.14,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        },
      ]}
    >
      {children}
    </Pressable>
  );
}

// ── Hoja (panel blanco que sube sobre el mapa o el encabezado) ────────────────

export function Hoja({
  children,
  conAsa = false,
  estilo,
}: {
  children: ReactNode;
  conAsa?: boolean;
  estilo?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: colores.blanco,
          borderTopLeftRadius: radios.hoja,
          borderTopRightRadius: radios.hoja,
          paddingHorizontal: 20,
          paddingTop: conAsa ? 10 : 22,
          gap: 12,
        },
        sombraHoja,
        estilo,
      ]}
    >
      {conAsa && (
        <View
          style={{
            alignSelf: 'center',
            width: 40,
            height: 5,
            borderRadius: radios.pildora,
            backgroundColor: colores.borde,
          }}
        />
      )}
      {children}
    </View>
  );
}

// ── Progreso del recorrido por segmentos ──────────────────────────────────────

export function Segmentos({
  total,
  actual,
  sobreOscuro = false,
}: {
  total: number;
  /** Parada actual, desde 1. Las anteriores se pintan como hechas. */
  actual: number;
  sobreOscuro?: boolean;
}) {
  const hecho = sobreOscuro ? colores.blanco : colores.marino;
  const pendiente = sobreOscuro ? colores.blancoMedio : colores.linea;
  return (
    <View
      style={{ flexDirection: 'row', gap: 4 }}
      accessible
      accessibilityLabel={`Parada ${actual} de ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            backgroundColor:
              i + 1 < actual ? hecho : i + 1 === actual ? colores.naranja : pendiente,
          }}
        />
      ))}
    </View>
  );
}

// ── Píldora ───────────────────────────────────────────────────────────────────

export function Pildora({
  texto,
  fondo = colores.marinoSuave,
  color = colores.marino,
  icono,
  punto,
}: {
  texto: string;
  fondo?: string;
  color?: string;
  icono?: ReactNode;
  /** Color del punto de "en vivo". */
  punto?: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        backgroundColor: fondo,
        borderRadius: radios.pildora,
        paddingVertical: 6,
        paddingHorizontal: 11,
      }}
    >
      {punto && (
        <View
          style={{ width: 7, height: 7, borderRadius: radios.pildora, backgroundColor: punto }}
        />
      )}
      {icono}
      <Texto peso={700} tamano={13} color={color}>
        {texto}
      </Texto>
    </View>
  );
}

// ── Nota informativa ──────────────────────────────────────────────────────────

export function Nota({
  texto,
  icono,
  fondo = colores.superficie,
}: {
  texto: string;
  icono?: ReactNode;
  fondo?: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
        backgroundColor: fondo,
        borderRadius: radios.boton,
        paddingVertical: 12,
        paddingHorizontal: 14,
      }}
    >
      <View style={{ marginTop: 1 }}>{icono ?? <IconoInfo tamano={18} />}</View>
      <Texto tamano={14} color={colores.grisOscuro} style={{ flex: 1 }}>
        {texto}
      </Texto>
    </View>
  );
}

// ── Campo de texto con etiqueta ───────────────────────────────────────────────

export type CampoProps = TextInputProps & {
  etiqueta: string;
  /** Texto suave junto a la etiqueta, como "opcional". */
  detalle?: string;
  /** Mostrar la etiqueta solo a lectores de pantalla (campos en fila). */
  etiquetaOculta?: boolean;
  derecha?: ReactNode;
  estilo?: StyleProp<ViewStyle>;
};

export function Campo({
  etiqueta,
  detalle,
  etiquetaOculta = false,
  derecha,
  estilo,
  style,
  ...input
}: CampoProps) {
  const [enfocado, setEnfocado] = useState(false);
  return (
    <View style={[{ gap: 6 }, estilo]}>
      {!etiquetaOculta && (
        <Texto peso={700} tamano={13}>
          {etiqueta}
          {detalle ? (
            <Texto peso={500} tamano={13} color={colores.gris}>
              {` · ${detalle}`}
            </Texto>
          ) : null}
        </Texto>
      )}
      <View>
        <TextInput
          accessibilityLabel={etiqueta}
          placeholderTextColor={colores.grisMarcador}
          {...input}
          onFocus={(e) => {
            setEnfocado(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setEnfocado(false);
            input.onBlur?.(e);
          }}
          style={[
            {
              height: 52,
              borderWidth: enfocado ? 2 : 1.5,
              borderColor: enfocado ? colores.marino : colores.borde,
              borderRadius: radios.boton,
              paddingHorizontal: 14,
              paddingRight: derecha ? 52 : 14,
              fontFamily: 'HankenGrotesk_500Medium',
              fontSize: 16,
              color: colores.marino,
              backgroundColor: colores.blanco,
            },
            style,
          ]}
        />
        {derecha && <View style={{ position: 'absolute', top: 4, right: 4 }}>{derecha}</View>}
      </View>
    </View>
  );
}

// ── Días de la semana ─────────────────────────────────────────────────────────

const DIAS = [
  { letra: 'L', nombre: 'Lunes' },
  { letra: 'M', nombre: 'Martes' },
  { letra: 'M', nombre: 'Miércoles' },
  { letra: 'J', nombre: 'Jueves' },
  { letra: 'V', nombre: 'Viernes' },
] as const;

export function Dias({
  seleccionados,
  onCambiar,
  compacto = false,
}: {
  seleccionados: readonly boolean[];
  onCambiar?: (indice: number) => void;
  compacto?: boolean;
}) {
  const lado = compacto ? 28 : 46;
  return (
    <View style={{ flexDirection: 'row', gap: compacto ? 4 : 8 }}>
      {DIAS.map((dia, i) => {
        const activo = seleccionados[i] ?? false;
        return (
          <Pressable
            key={dia.nombre}
            accessibilityRole="checkbox"
            accessibilityLabel={dia.nombre}
            accessibilityState={{ checked: activo }}
            disabled={!onCambiar}
            onPress={() => onCambiar?.(i)}
            style={({ pressed }) => ({
              flex: compacto ? undefined : 1,
              width: compacto ? lado : undefined,
              height: lado,
              borderRadius: compacto ? 8 : radios.boton,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: activo ? colores.marino : colores.blanco,
              borderWidth: activo ? 0 : 1.5,
              borderColor: colores.borde,
              transform: [{ scale: pressed ? 0.94 : 1 }],
            })}
          >
            <Texto
              peso={800}
              tamano={compacto ? 12 : 16}
              color={activo ? colores.blanco : colores.marino}
            >
              {dia.letra}
            </Texto>
          </Pressable>
        );
      })}
    </View>
  );
}
