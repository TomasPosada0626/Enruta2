import {
  Boton,
  BotonIcono,
  colores,
  Hoja,
  IconoCasa,
  IconoMenu,
  IconoTelefono,
  MapaIlustrado,
  Marca,
  Pildora,
  radios,
  sombra,
  Texto,
  type Punto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ACOMPANANTE, ACUDIENTE, CONDUCTOR, HIJO, RUTA, useEstado } from '../src/estado';

const ALTO_HOJA = 414;
const TOTAL_PARADAS = 12;
const PARADA_ACTUAL = 3;
const TU_PARADA = 7;

/** Ruta de ejemplo en coordenadas del diseño (390 de ancho, 480 de alto visible). */
const RUTA_DISENO: Punto[] = [
  [36, 440],
  [92, 400],
  [150, 356],
  [208, 330],
  [252, 288],
  [286, 238],
  [320, 192],
  [352, 132],
  [384, 70],
];

function llamar(telefono: string) {
  Linking.openURL(`tel:${telefono}`).catch(() => Alert.alert('No se pudo abrir el marcador'));
}

function BotonLlamar({
  nombre,
  rol,
  onPress,
}: {
  nombre: string;
  rol: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Llamar a ${nombre}, ${rol.toLowerCase()}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        height: 56,
        borderRadius: radios.boton,
        backgroundColor: colores.marino,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 12,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <IconoTelefono tamano={18} color={colores.naranja} />
      <View>
        <Texto peso={700} tamano={15} color={colores.blanco}>
          {nombre}
        </Texto>
        <Texto tamano={12} color={colores.grisClaro}>
          {rol}
        </Texto>
      </View>
    </Pressable>
  );
}

export default function Inicio() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { ausencia, noRegresa, setNoRegresa, deshacerNoVa } = useEstado();

  // Hora estimada "en vivo": en el prototipo baja un minuto cada 20 segundos.
  const [minutos, setMinutos] = useState(8);
  useEffect(() => {
    const intervalo = setInterval(() => setMinutos((m) => Math.max(1, m - 1)), 20_000);
    return () => clearInterval(intervalo);
  }, []);

  // La ruta se ajusta al espacio visible sobre la hoja.
  const escala = width / 390;
  const altoVisibleDiseno = (height - ALTO_HOJA - insets.bottom) / escala;
  const f = Math.min(1, (altoVisibleDiseno - 10) / 460);
  const puntos = RUTA_DISENO.map(([x, y]) => [x, y * f] as const);
  const vehiculo = puntos[PARADA_ACTUAL - 1]!;
  const tuParada = puntos[TU_PARADA - 1]!;

  const llamarConductor = () =>
    Alert.alert(
      `${CONDUCTOR.nombre} está manejando`,
      `Si es urgente, llama a ${ACOMPANANTE.nombre}, la acompañante.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: `Llamar a ${ACOMPANANTE.nombre}`, onPress: () => llamar(ACOMPANANTE.telefono) },
        { text: 'Llamar igual', onPress: () => llamar(CONDUCTOR.telefono) },
      ],
    );

  const confirmarNoRegresa = () =>
    Alert.alert(
      `¿Confirmas que ${HIJO.nombre} no regresa hoy en la ruta?`,
      `Le avisamos a ${CONDUCTOR.nombre} de inmediato.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, no regresa', onPress: () => setNoRegresa(true) },
      ],
    );

  const abrirMenu = () =>
    Alert.alert(
      `Hola, ${ACUDIENTE.nombre}`,
      'Menú del prototipo',
      [
        { text: 'Inscribir otro hijo', onPress: () => router.push('/inscripcion/direccion') },
        {
          text: 'Reiniciar la prueba',
          onPress: () => {
            deshacerNoVa();
            setNoRegresa(false);
            setMinutos(8);
          },
        },
        { text: 'Cerrar sesión', onPress: () => router.replace('/entrar') },
      ],
      { cancelable: true },
    );

  return (
    <View style={{ flex: 1, backgroundColor: colores.blanco }}>
      <StatusBar style="dark" />
      <View style={{ position: 'absolute', top: 0, left: 0 }}>
        <MapaIlustrado
          ancho={width}
          alto={height}
          ruta={
            ausencia ? undefined : { puntos, vehiculo: PARADA_ACTUAL - 1, tuParada: TU_PARADA - 1 }
          }
        />
      </View>

      {!ausencia && (
        <>
          <View
            style={[
              {
                position: 'absolute',
                left: tuParada[0] * escala - 152,
                top: tuParada[1] * escala - 62,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: colores.blanco,
                borderRadius: radios.pildora,
                paddingVertical: 6,
                paddingLeft: 6,
                paddingRight: 12,
              },
              sombra,
            ]}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colores.marino,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Texto peso={800} tamano={12} color={colores.blanco}>
                {TU_PARADA}
              </Texto>
            </View>
            <Texto peso={700} tamano={13}>
              Tu parada
            </Texto>
          </View>
          <View
            style={[
              {
                position: 'absolute',
                left: vehiculo[0] * escala + 22,
                top: vehiculo[1] * escala + 10,
                backgroundColor: colores.naranja,
                borderRadius: radios.pildora,
                paddingVertical: 6,
                paddingHorizontal: 12,
              },
              sombra,
            ]}
          >
            <Texto peso={800} tamano={13}>
              Va en la {PARADA_ACTUAL}
            </Texto>
          </View>
        </>
      )}

      <View
        style={{
          position: 'absolute',
          top: insets.top + 12,
          left: 16,
          right: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View
          style={[
            {
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
        <BotonIcono accessibilityLabel="Menú" flotante onPress={abrirMenu}>
          <IconoMenu tamano={20} />
        </BotonIcono>
      </View>

      <Hoja
        conAsa
        estilo={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: ALTO_HOJA + insets.bottom,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Texto peso={700} tamano={15}>
            Ida de {HIJO.nombre}
          </Texto>
          {ausencia ? (
            <Pildora texto="Hoy no va" fondo={colores.superficie} color={colores.gris} />
          ) : (
            <Pildora
              texto="En vivo"
              fondo={colores.naranjaSuave}
              color={colores.naranjaTexto}
              punto={colores.naranja}
            />
          )}
        </View>

        {ausencia ? (
          <View style={{ gap: 6 }}>
            <Texto peso={800} tamano={26} interlineado={29} espaciado={-1.1}>
              Avisaste que {HIJO.nombre} no va hoy
            </Texto>
            <Texto tamano={14} color={colores.gris}>
              A las {ausencia.hora}. {CONDUCTOR.nombre} y {ACOMPANANTE.nombre} ya lo saben. Si fue
              un error, llámalos.
            </Texto>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <View>
              <Texto tamano={14} color={colores.gris}>
                Llega a tu parada en
              </Texto>
              <View
                style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}
                accessible
                accessibilityLabel={`${minutos} minutos`}
              >
                <Texto peso={800} tamano={78} interlineado={80} espaciado={-4.6}>
                  {minutos}
                </Texto>
                <Texto peso={700} tamano={30} espaciado={-1}>
                  min
                </Texto>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 3, paddingBottom: 8 }}>
              <Texto tamano={14} color={colores.gris}>
                Va en la parada{' '}
                <Texto peso={700} tamano={14}>
                  {PARADA_ACTUAL} de {TOTAL_PARADAS}
                </Texto>
              </Texto>
              <Texto tamano={14} color={colores.gris}>
                La tuya es la{' '}
                <Texto peso={700} tamano={14}>
                  {TU_PARADA}
                </Texto>
              </Texto>
            </View>
          </View>
        )}

        <View style={{ height: 1, backgroundColor: colores.lineaSuave }} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <IconoCasa tamano={18} />
          <Texto tamano={14} color={colores.gris} style={{ flex: 1 }}>
            {noRegresa ? (
              <>
                Regreso:{' '}
                <Texto peso={700} tamano={14}>
                  no regresa en la ruta hoy
                </Texto>
              </>
            ) : (
              <>
                Regreso: sale del colegio{' '}
                <Texto peso={700} tamano={14}>
                  {RUTA.salidaVuelta}
                </Texto>
              </>
            )}
          </Texto>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {!ausencia && (
            <Boton
              titulo="Hoy no va"
              variante="contorno"
              alto={48}
              tamanoTexto={15}
              estilo={{ flex: 1, paddingHorizontal: 8 }}
              onPress={() => router.push('/hoy-no-va')}
            />
          )}
          {noRegresa ? (
            !ausencia?.tampocoRegresa && (
              <Boton
                titulo="Deshacer «no regresa»"
                variante="contorno"
                alto={48}
                tamanoTexto={14}
                estilo={{ flex: 1, paddingHorizontal: 8 }}
                onPress={() => setNoRegresa(false)}
              />
            )
          ) : (
            <Boton
              titulo="No regresa en la ruta"
              variante="contorno"
              alto={48}
              tamanoTexto={14}
              estilo={{ flex: 1, paddingHorizontal: 8 }}
              onPress={confirmarNoRegresa}
            />
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <BotonLlamar
            nombre={ACOMPANANTE.nombre}
            rol="Acompañante"
            onPress={() => llamar(ACOMPANANTE.telefono)}
          />
          <BotonLlamar nombre={CONDUCTOR.nombre} rol="Conductor" onPress={llamarConductor} />
        </View>

        <Boton
          titulo="Avisar para otro día"
          variante="texto"
          alto={40}
          tamanoTexto={15}
          onPress={() =>
            Alert.alert(
              'Avisar para otro día',
              'Aquí eliges la fecha y si no va a la ida, al regreso o a ninguno.',
            )
          }
        />
      </Hoja>
    </View>
  );
}
