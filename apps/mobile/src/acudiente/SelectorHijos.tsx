import { colores, IconoMas, radios, sombra, Texto } from '@enruta2/ui';
import { Pressable, ScrollView, View } from 'react-native';

import type { Hijo } from './estado';

/** Fila de hijos para elegir cuál se ve en "En vivo", con el botón para inscribir otro. */
export function SelectorHijos({
  hijos,
  seleccionadoId,
  onSeleccionar,
  onAgregar,
}: {
  hijos: readonly Hijo[];
  seleccionadoId: string;
  onSeleccionar: (id: string) => void;
  onAgregar: () => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      accessibilityLabel="Tus hijos"
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 6 }}
    >
      {hijos.map((h) => {
        const activo = h.id === seleccionadoId;
        return (
          <Pressable
            key={h.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: activo }}
            accessibilityLabel={`${h.nombre}, ${h.ruta}`}
            onPress={() => onSeleccionar(h.id)}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                height: 44,
                paddingLeft: 5,
                paddingRight: 14,
                borderRadius: radios.pildora,
                backgroundColor: activo ? colores.marino : colores.blanco,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
              sombra,
            ]}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: activo ? colores.naranja : colores.marinoSuave,
              }}
            >
              <Texto peso={800} tamano={15}>
                {h.nombre.charAt(0)}
              </Texto>
            </View>
            <View>
              <Texto
                peso={800}
                tamano={15}
                interlineado={17}
                color={activo ? colores.blanco : colores.marino}
              >
                {h.nombre}
              </Texto>
              <Texto
                tamano={11}
                interlineado={13}
                color={activo ? colores.grisClaro : colores.gris}
              >
                {h.estado === 'pendiente' ? 'Pendiente' : h.ruta}
              </Texto>
            </View>
          </Pressable>
        );
      })}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Inscribir otro hijo"
        onPress={onAgregar}
        style={({ pressed }) => [
          {
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colores.blanco,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
          sombra,
        ]}
      >
        <IconoMas tamano={20} color={colores.naranjaIcono} />
      </Pressable>
    </ScrollView>
  );
}
