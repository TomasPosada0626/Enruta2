import {
  colores,
  Hoja,
  IconoFlecha,
  IconoPersonas,
  IconoRuta,
  MapaIlustrado,
  Marca,
  radios,
  sombra,
  Texto,
} from '@enruta2/ui';
import { useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ComponentType } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ALTO_MAPA = 300;

function OpcionRol({
  titulo,
  detalle,
  Icono,
  fondoIcono,
  colorIcono,
  ruta,
}: {
  titulo: string;
  detalle: string;
  Icono: ComponentType<{ tamano?: number; color?: string }>;
  fondoIcono: string;
  colorIcono: string;
  ruta: Href;
}) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${detalle}`}
      onPress={() => router.push(ruta)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderWidth: 2,
        borderColor: pressed ? colores.marino : colores.linea,
        borderRadius: 22,
        padding: 16,
        backgroundColor: colores.blanco,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View
        style={{
          width: 54,
          height: 54,
          borderRadius: 18,
          backgroundColor: fondoIcono,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icono tamano={26} color={colorIcono} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Texto peso={800} tamano={19} interlineado={22} espaciado={-0.5}>
          {titulo}
        </Texto>
        <Texto tamano={14} color={colores.gris}>
          {detalle}
        </Texto>
      </View>
      <IconoFlecha tamano={20} color={colores.marino} />
    </Pressable>
  );
}

/** Pantalla inicial de la única app: cada persona elige cómo la usa. */
export default function ElegirRol() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <View style={{ flex: 1, backgroundColor: colores.blanco }}>
      <StatusBar style="dark" />
      <View style={{ position: 'absolute', top: 0, left: 0 }}>
        <MapaIlustrado
          ancho={width}
          alto={ALTO_MAPA + insets.top}
          rio="M110 -20 C150 80 86 160 140 240 S 200 330 180 360"
          avenidas={['M-20 250 L420 124']}
          parques={[{ x: 262, y: 200, ancho: 96, alto: 62 }]}
          ruta={{
            puntos: [
              [40, 290],
              [100, 252],
              [168, 220],
              [232, 186],
              [292, 150],
              [350, 110],
            ],
            vehiculo: 2,
            tuParada: 4,
          }}
        />
      </View>
      <View
        style={[
          {
            position: 'absolute',
            top: insets.top + 14,
            left: 16,
            backgroundColor: colores.blanco,
            borderRadius: radios.pildora,
            paddingVertical: 7,
            paddingLeft: 8,
            paddingRight: 16,
          },
          sombra,
        ]}
      >
        <Marca tamano={20} />
      </View>

      <Hoja
        estilo={{
          marginTop: ALTO_MAPA + insets.top - 40,
          flex: 1,
          paddingHorizontal: 0,
          paddingTop: 0,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingTop: 28,
            paddingBottom: insets.bottom + 24,
            gap: 14,
          }}
        >
          <View style={{ gap: 6, marginBottom: 4 }}>
            <Texto peso={800} tamano={31} interlineado={34} espaciado={-1.4}>
              ¿Cómo usas Enruta2?
            </Texto>
            <Texto tamano={15} color={colores.gris}>
              Elige tu rol para entrar.
            </Texto>
          </View>

          <OpcionRol
            titulo="Soy acudiente"
            detalle="Sigue en vivo la ruta de tus hijos y avisa cuando no van."
            Icono={IconoPersonas}
            fondoIcono={colores.marinoSuave}
            colorIcono={colores.marino}
            ruta="/acudiente/entrar"
          />
          <OpcionRol
            titulo="Soy conductor o acompañante"
            detalle="Haz el recorrido parada por parada y marca a cada estudiante."
            Icono={IconoRuta}
            fondoIcono={colores.naranja}
            colorIcono={colores.marino}
            ruta="/conductor/entrar"
          />

          <Texto tamano={13} color={colores.gris} style={{ textAlign: 'center', marginTop: 6 }}>
            Puedes cambiar de rol cuando cierres sesión.
          </Texto>
        </ScrollView>
      </Hoja>
    </View>
  );
}
