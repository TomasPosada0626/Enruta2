import type { ComponentType, ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import type { IconoProps } from './iconos';
import { Texto } from './Texto';
import { colores, radios } from './tema';

export type ItemPestana = {
  clave: string;
  etiqueta: string;
  Icono: ComponentType<IconoProps>;
  /** Número de pendientes (avisos, inscripciones). */
  insignia?: number;
};

/** Menú inferior de las dos apps: ícono con fondo suave en la pestaña activa y contador naranja. */
export function BarraPestanas({
  items,
  activa,
  onElegir,
  margenInferior = 0,
}: {
  items: readonly ItemPestana[];
  activa: string;
  onElegir: (clave: string) => void;
  /** Alto del área de gestos del sistema (insets.bottom). */
  margenInferior?: number;
}) {
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: colores.blanco,
        borderTopWidth: 1,
        borderTopColor: colores.lineaSuave,
        paddingTop: 8,
        paddingBottom: margenInferior + 8,
        paddingHorizontal: 6,
        shadowColor: colores.marino,
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
        elevation: 12,
      }}
    >
      {items.map(({ clave, etiqueta, Icono, insignia }) => {
        const activo = clave === activa;
        const color = activo ? colores.marino : colores.gris;
        return (
          <Pressable
            key={clave}
            accessibilityRole="tab"
            accessibilityState={{ selected: activo }}
            accessibilityLabel={insignia ? `${etiqueta}, ${insignia} pendientes` : etiqueta}
            onPress={() => onElegir(clave)}
            style={({ pressed }) => ({
              flex: 1,
              minHeight: 52,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              transform: [{ scale: pressed ? 0.94 : 1 }],
            })}
          >
            <View
              style={{
                width: 58,
                height: 32,
                borderRadius: radios.pildora,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: activo ? colores.marinoSuave : 'transparent',
              }}
            >
              <Icono tamano={22} color={color} grosor={activo ? 2.4 : 2} />
              {insignia ? (
                <View
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: 8,
                    minWidth: 18,
                    height: 18,
                    paddingHorizontal: 4,
                    borderRadius: 9,
                    backgroundColor: colores.naranja,
                    borderWidth: 2,
                    borderColor: colores.blanco,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Texto peso={800} tamano={10} interlineado={12} color={colores.marino}>
                    {insignia}
                  </Texto>
                </View>
              ) : null}
            </View>
            <Texto peso={activo ? 800 : 600} tamano={12} interlineado={14} color={color}>
              {etiqueta}
            </Texto>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Fila de lista con título, detalle y acción a la derecha (pantallas de avisos, cuenta, hijos). */
export function Fila({
  titulo,
  detalle,
  izquierda,
  derecha,
  onPress,
  accessibilityLabel,
}: {
  titulo: string;
  detalle?: string;
  izquierda?: ReactNode;
  derecha?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colores.superficie,
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 14,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {izquierda}
      <View style={{ flex: 1, gap: 2 }}>
        <Texto peso={700} tamano={16}>
          {titulo}
        </Texto>
        {detalle ? (
          <Texto tamano={14} color={colores.gris}>
            {detalle}
          </Texto>
        ) : null}
      </View>
      {derecha}
    </Pressable>
  );
}
