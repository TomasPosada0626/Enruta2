import {
  Boton,
  BotonIcono,
  colores,
  Hoja,
  IconoCampana,
  IconoCasa,
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

import { useEstado } from '../../../src/acudiente/estado';
import { SelectorHijos } from '../../../src/acudiente/SelectorHijos';

const ALTO_HOJA = 400;

/** Ruta de ejemplo en coordenadas del diseño (390 de ancho, 460 de alto visible). */
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

export default function EnVivo() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [alto, setAlto] = useState(0);
  const { hijos, hijo, seleccionar, ausencias, noRegresa, setNoRegresa } = useEstado();
  const ausencia = ausencias[hijo.id];
  const noVuelve = noRegresa[hijo.id] ?? false;

  // Hora estimada "en vivo": en el prototipo baja un minuto cada 20 segundos.
  const [transcurridos, setTranscurridos] = useState(0);
  useEffect(() => {
    const intervalo = setInterval(() => setTranscurridos((t) => t + 1), 20_000);
    return () => clearInterval(intervalo);
  }, []);
  const minutos = Math.max(1, hijo.minutos - transcurridos);

  const enVivo = hijo.estado === 'enVivo' && !ausencia;

  // La ruta se ajusta al espacio visible sobre la hoja.
  const escala = width / 390;
  const altoVisibleDiseno = (Math.max(alto, 1) - ALTO_HOJA) / escala;
  const f = Math.min(1, Math.max(0.4, (altoVisibleDiseno - 10) / 460));
  const puntos = RUTA_DISENO.map(([x, y]) => [x, y * f] as const);
  const vehiculo = puntos[Math.max(hijo.paradaActual - 1, 0)]!;
  const tuParada = puntos[Math.min(hijo.tuParada - 1, puntos.length - 1)]!;

  const llamarConductor = () =>
    Alert.alert(
      `${hijo.conductor.nombre} está manejando`,
      `Si es urgente, llama a ${hijo.acompanante.nombre}, la acompañante.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: `Llamar a ${hijo.acompanante.nombre}`,
          onPress: () => llamar(hijo.acompanante.telefono),
        },
        { text: 'Llamar igual', onPress: () => llamar(hijo.conductor.telefono) },
      ],
    );

  const confirmarNoRegresa = () =>
    Alert.alert(
      `¿Confirmas que ${hijo.nombre} no regresa hoy en la ruta?`,
      `Le avisamos a ${hijo.conductor.nombre} de inmediato.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, no regresa', onPress: () => setNoRegresa(hijo.id, true) },
      ],
    );

  return (
    <View
      style={{ flex: 1, backgroundColor: colores.blanco }}
      onLayout={(e) => setAlto(e.nativeEvent.layout.height)}
    >
      <StatusBar style="dark" />
      {alto > 0 && (
        <View style={{ position: 'absolute', top: 0, left: 0 }}>
          <MapaIlustrado
            ancho={width}
            alto={alto}
            ruta={
              enVivo
                ? { puntos, vehiculo: hijo.paradaActual - 1, tuParada: hijo.tuParada - 1 }
                : undefined
            }
          />
        </View>
      )}

      {enVivo && alto > 0 && (
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
                {hijo.tuParada}
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
              Va en la {hijo.paradaActual}
            </Texto>
          </View>
        </>
      )}

      <View style={{ position: 'absolute', top: insets.top + 10, left: 0, right: 0, gap: 6 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
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
          <BotonIcono
            accessibilityLabel="Avisos"
            flotante
            onPress={() => router.navigate('/acudiente/avisos')}
          >
            <IconoCampana tamano={20} />
          </BotonIcono>
        </View>
        <SelectorHijos
          hijos={hijos}
          seleccionadoId={hijo.id}
          onSeleccionar={seleccionar}
          onAgregar={() => router.push('/acudiente/inscripcion/estudiante')}
        />
      </View>

      <Hoja
        conAsa
        estilo={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: ALTO_HOJA,
          paddingBottom: 14,
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Texto peso={700} tamano={15}>
            {hijo.estado === 'pendiente' ? 'Inscripción' : 'Ida'} de {hijo.nombre}
          </Texto>
          {hijo.estado === 'pendiente' ? (
            <Pildora texto="Pendiente" fondo={colores.naranjaSuave} color={colores.naranjaTexto} />
          ) : ausencia ? (
            <Pildora texto="Hoy no va" fondo={colores.superficie} color={colores.gris} />
          ) : hijo.estado === 'programada' ? (
            <Pildora texto="Programada" fondo={colores.superficie} color={colores.marino} />
          ) : (
            <Pildora
              texto="En vivo"
              fondo={colores.naranjaSuave}
              color={colores.naranjaTexto}
              punto={colores.naranja}
            />
          )}
        </View>

        {hijo.estado === 'pendiente' ? (
          <>
            <View style={{ gap: 6 }}>
              <Texto peso={800} tamano={26} interlineado={29} espaciado={-1.1}>
                Inscripción enviada
              </Texto>
              <Texto tamano={14} color={colores.gris}>
                El conductor de la {hijo.ruta} revisa el cupo y la aprueba. Te avisamos cuando{' '}
                {hijo.nombre} quede inscrito.
              </Texto>
            </View>
            <Boton
              titulo={`Ver los datos de ${hijo.nombre}`}
              variante="contorno"
              alto={50}
              tamanoTexto={15}
              onPress={() => router.navigate('/acudiente/hijos')}
            />
          </>
        ) : (
          <>
            {ausencia ? (
              <View style={{ gap: 6 }}>
                <Texto peso={800} tamano={26} interlineado={29} espaciado={-1.1}>
                  Avisaste que {hijo.nombre} no va hoy
                </Texto>
                <Texto tamano={14} color={colores.gris}>
                  A las {ausencia.hora}. {hijo.conductor.nombre} y {hijo.acompanante.nombre} ya lo
                  saben. Si fue un error, llámalos.
                </Texto>
              </View>
            ) : hijo.estado === 'programada' ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                <View>
                  <Texto tamano={14} color={colores.gris}>
                    La {hijo.ruta} sale a las
                  </Texto>
                  <Texto peso={800} tamano={60} interlineado={64} espaciado={-3}>
                    {hijo.salidaIda.replace(' a. m.', '')}
                    <Texto peso={700} tamano={22}>
                      {' '}
                      a. m.
                    </Texto>
                  </Texto>
                </View>
                <Texto
                  tamano={14}
                  color={colores.gris}
                  style={{ maxWidth: 140, textAlign: 'right', paddingBottom: 8 }}
                >
                  Te avisamos cuando vaya en camino a tu dirección.
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
                      {hijo.paradaActual} de {hijo.totalParadas}
                    </Texto>
                  </Texto>
                  <Texto tamano={14} color={colores.gris}>
                    La tuya es la{' '}
                    <Texto peso={700} tamano={14}>
                      {hijo.tuParada}
                    </Texto>
                  </Texto>
                </View>
              </View>
            )}

            <View style={{ height: 1, backgroundColor: colores.lineaSuave }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconoCasa tamano={18} />
              <Texto tamano={14} color={colores.gris} style={{ flex: 1 }}>
                {noVuelve ? (
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
                      {hijo.salidaVuelta}
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
                  onPress={() => router.push('/acudiente/hoy-no-va')}
                />
              )}
              {noVuelve ? (
                !ausencia?.tampocoRegresa && (
                  <Boton
                    titulo="Deshacer «no regresa»"
                    variante="contorno"
                    alto={48}
                    tamanoTexto={14}
                    estilo={{ flex: 1, paddingHorizontal: 8 }}
                    onPress={() => setNoRegresa(hijo.id, false)}
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
                nombre={hijo.acompanante.nombre}
                rol="Acompañante"
                onPress={() => llamar(hijo.acompanante.telefono)}
              />
              <BotonLlamar
                nombre={hijo.conductor.nombre}
                rol="Conductor"
                onPress={llamarConductor}
              />
            </View>
          </>
        )}
      </Hoja>
    </View>
  );
}
