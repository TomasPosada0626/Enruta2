import {
  Boton,
  BotonIcono,
  colores,
  Dias,
  IconoAtras,
  IconoCheck,
  PinParada,
  radios,
  Texto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';

import { RUTA } from '../../src/conductor/datos';
import { Pantalla } from '../../src/conductor/Pantalla';

const CUPO = 15;
const OCUPACION_IDA = [
  { dia: 'L', ocupados: 14 },
  { dia: 'M', ocupados: 14 },
  { dia: 'M', ocupados: 13 },
  { dia: 'J', ocupados: 13 },
  { dia: 'V', ocupados: 12 },
];

/** Aprobación de una inscripción (rol ADMIN; el conductor independiente lo es). */
export default function Aprobar() {
  const router = useRouter();

  const aprobar = () =>
    Alert.alert(
      'Pablo quedó inscrito',
      'Le avisamos a Laura. Pablo entra a la ruta desde el próximo recorrido.',
      [{ text: 'Listo', onPress: () => router.back() }],
    );

  const rechazar = () =>
    Alert.alert('¿Rechazar la inscripción?', 'Le avisamos a Laura con el motivo que elijas.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'No hay cupo', onPress: () => router.back() },
      { text: 'Fuera de la zona', onPress: () => router.back() },
    ]);

  return (
    <Pantalla
      encabezado={
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 46 }}>
            <BotonIcono accessibilityLabel="Volver" sobreOscuro onPress={() => router.back()}>
              <IconoAtras tamano={20} color={colores.blanco} />
            </BotonIcono>
            <Texto peso={700} tamano={15} color={colores.grisClaro}>
              {RUTA.nombre} · hace 12 min
            </Texto>
          </View>
          <Texto peso={800} tamano={30} interlineado={33} espaciado={-1.3} color={colores.blanco}>
            Nueva inscripción
          </Texto>
        </>
      }
      pie={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Boton
            titulo="Rechazar"
            variante="contornoNaranja"
            alto={58}
            estilo={{ flex: 1 }}
            onPress={rechazar}
          />
          <Boton
            titulo="Aprobar"
            alto={58}
            estilo={{ flex: 1.6 }}
            icono={<IconoCheck tamano={18} color={colores.naranja} />}
            onPress={aprobar}
          />
        </View>
      }
    >
      <View style={{ gap: 4 }}>
        <Texto peso={800} tamano={27} interlineado={30} espaciado={-1.1}>
          Pablo Pérez
        </Texto>
        <Texto tamano={14} color={colores.gris}>
          Lo inscribió Laura Gómez · acudiente principal
        </Texto>
      </View>

      <View
        style={{
          borderWidth: 1.5,
          borderColor: colores.linea,
          borderRadius: 20,
          padding: 14,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <PinParada tamano={24} centro={colores.naranja} />
          <View style={{ flex: 1, gap: 2 }}>
            <Texto peso={800} tamano={17} espaciado={-0.3}>
              Carrera 43A # 1-50
            </Texto>
            <Texto tamano={14} color={colores.gris}>
              Torre 2, apto 504 · El Poblado, Medellín
            </Texto>
            <Texto peso={600} tamano={14}>
              Portería principal
            </Texto>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colores.marinoSuave,
            borderRadius: 12,
            paddingVertical: 4,
            paddingLeft: 12,
            paddingRight: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <IconoCheck tamano={15} color={colores.marino} />
            <Texto peso={700} tamano={13}>
              Laura confirmó la ubicación
            </Texto>
          </View>
          <Pressable
            accessibilityRole="link"
            onPress={() =>
              Alert.alert('Ver punto', 'En la app real abre el punto confirmado en el mapa.')
            }
            style={{ paddingVertical: 10, paddingHorizontal: 10 }}
          >
            <Texto peso={800} tamano={13} style={{ textDecorationLine: 'underline' }}>
              Ver punto
            </Texto>
          </Pressable>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Texto peso={800} tamano={15}>
            Ida
          </Texto>
          <Dias seleccionados={[true, true, true, true, true]} compacto />
        </View>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Texto peso={800} tamano={15}>
            Regreso
          </Texto>
          <Dias seleccionados={[true, true, true, false, false]} compacto />
        </View>
      </View>

      <View style={{ backgroundColor: colores.superficie, borderRadius: 18, padding: 14, gap: 10 }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          <Texto peso={800} tamano={14}>
            Cupo con Pablo · ida
          </Texto>
          <Texto tamano={13} color={colores.gris}>
            {CUPO} puestos
          </Texto>
        </View>
        <View
          style={{ flexDirection: 'row', gap: 8 }}
          accessible
          accessibilityLabel={`Ocupación de la ida con Pablo: ${OCUPACION_IDA.map((d) => d.ocupados).join(', ')} de ${CUPO} puestos de lunes a viernes`}
        >
          {OCUPACION_IDA.map((d, i) => (
            <View key={i} style={{ flex: 1, gap: 4, alignItems: 'center' }}>
              <View
                style={{
                  width: '100%',
                  height: 42,
                  borderRadius: 8,
                  backgroundColor: colores.linea,
                  justifyContent: 'flex-end',
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: `${(d.ocupados / CUPO) * 100}%`,
                    backgroundColor: colores.marino,
                  }}
                />
              </View>
              <Texto peso={700} tamano={12}>
                {d.dia} {d.ocupados}
              </Texto>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <IconoCheck tamano={15} color={colores.marino} />
          <Texto peso={700} tamano={13}>
            Hay cupo todos los días
          </Texto>
        </View>
      </View>
      <View style={{ height: radios.boton }} />
    </Pantalla>
  );
}
