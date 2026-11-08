import {
  Boton,
  colores,
  IconoFlecha,
  IconoPersonaNo,
  radios,
  sombraHoja,
  Texto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRecorrido } from '../src/recorrido';

/** Aviso al conductor: un acudiente marcó "hoy no va" mientras él iba en camino a esa parada. */
export default function AvisoNoVa() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const r = useRecorrido();

  const activo = r.fase !== 'terminado' && r.parada;
  const estudiantes = activo ? r.parada!.estudiantes : [];
  const nombres = estudiantes.map((e) => e.nombre);
  const titulo =
    nombres.length === 0
      ? 'Samuel Ochoa no va hoy'
      : nombres.length === 1
        ? `${nombres[0]} no va hoy`
        : `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)} no van hoy`;
  const siguiente = activo ? r.paradas[r.indice + 1] : undefined;

  const seguir = () => {
    if (activo) r.excusarActual();
    router.back();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(8,16,34,0.62)' }}>
      <View
        accessibilityRole="alert"
        accessibilityViewIsModal
        style={[
          {
            backgroundColor: colores.blanco,
            borderTopLeftRadius: radios.hoja,
            borderTopRightRadius: radios.hoja,
            paddingHorizontal: 22,
            paddingTop: 24,
            paddingBottom: insets.bottom + 18,
            gap: 16,
          },
          sombraHoja,
        ]}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 20,
            backgroundColor: colores.naranja,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconoPersonaNo tamano={30} color={colores.marino} />
        </View>

        <View style={{ gap: 6 }}>
          <Texto peso={800} tamano={30} interlineado={32} espaciado={-1.3}>
            {titulo}
          </Texto>
          <Texto tamano={15} color={colores.gris}>
            Su acudiente avisó hace un momento. Ibas en camino a su parada.
          </Texto>
        </View>

        {siguiente ? (
          <View
            style={{ backgroundColor: colores.superficie, borderRadius: 18, padding: 14, gap: 10 }}
          >
            <Texto peso={800} tamano={13} espaciado={0.5} color={colores.gris}>
              SIGUES DESDE DONDE ESTÁS
            </Texto>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: colores.marino,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Texto peso={800} tamano={17} color={colores.blanco}>
                  {r.indice + 1}
                </Texto>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Texto peso={800} tamano={17} espaciado={-0.3}>
                  {siguiente.direccion}
                </Texto>
                <Texto tamano={14} color={colores.gris}>
                  {siguiente.estudiantes.length}{' '}
                  {siguiente.estudiantes.length === 1 ? 'estudiante' : 'estudiantes'} · ruta
                  recalculada
                </Texto>
              </View>
            </View>
          </View>
        ) : null}

        <View style={{ gap: 6 }}>
          <Boton
            titulo={siguiente ? 'Ir a la siguiente' : 'Entendido'}
            variante="naranja"
            alto={60}
            tamanoTexto={18}
            iconoDerecha={
              siguiente ? <IconoFlecha tamano={20} color={colores.marino} /> : undefined
            }
            onPress={seguir}
          />
          <Boton
            titulo="Ver la ruta actualizada"
            variante="texto"
            alto={48}
            tamanoTexto={16}
            onPress={seguir}
          />
        </View>
      </View>
    </View>
  );
}
