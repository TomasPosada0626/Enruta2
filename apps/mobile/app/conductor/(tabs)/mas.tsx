import {
  colores,
  Fila,
  IconoGps,
  IconoNavegar,
  IconoSalir,
  IconoSiguiente,
  radios,
  Texto,
} from '@enruta2/ui';
import Constants from 'expo-constants';
import { useRouter, type Href } from 'expo-router';
import * as Updates from 'expo-updates';
import { Linking, View } from 'react-native';

import { CONDUCTOR, RUTA } from '../../../src/conductor/datos';
import { Pantalla } from '../../../src/conductor/Pantalla';
import { useRecorrido } from '../../../src/conductor/recorrido';

const PRUEBAS: { titulo: string; detalle: string; ruta: Href }[] = [
  {
    titulo: 'Aviso: un estudiante no va',
    detalle: 'Llega mientras vas en camino',
    ruta: '/conductor/aviso-no-va',
  },
  { titulo: 'GPS apagado', detalle: 'Alerta que no se puede cerrar', ruta: '/conductor/gps' },
  {
    titulo: 'Lista de abordaje',
    detalle: 'Armar la vuelta en el colegio',
    ruta: '/conductor/abordaje',
  },
  {
    titulo: 'Aprobar una inscripción',
    detalle: 'Vista del administrador',
    ruta: '/conductor/aprobar',
  },
];

function Seccion({ texto }: { texto: string }) {
  return (
    <Texto peso={800} tamano={13} espaciado={0.5} color={colores.gris} style={{ marginTop: 6 }}>
      {texto}
    </Texto>
  );
}

export default function Mas() {
  const router = useRouter();
  const { navegador, setNavegador } = useRecorrido();
  const version = Constants.expoConfig?.version ?? '0.1.0';
  const actualizacion = Updates.isEmbeddedLaunch
    ? 'incluida en el APK'
    : `OTA ${Updates.updateId?.slice(0, 8) ?? ''}`;

  return (
    <Pantalla
      enPestana
      encabezado={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 8 }}>
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: radios.pildora,
              backgroundColor: colores.naranja,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Texto peso={800} tamano={24}>
              {CONDUCTOR.nombre.charAt(0)}
            </Texto>
          </View>
          <View style={{ gap: 2 }}>
            <Texto peso={800} tamano={26} interlineado={29} espaciado={-1} color={colores.blanco}>
              {CONDUCTOR.nombre} Ramírez
            </Texto>
            <Texto tamano={14} color={colores.grisClaro}>
              Conductor · {RUTA.nombre}
            </Texto>
          </View>
        </View>
      }
    >
      <Seccion texto="AJUSTES" />
      <Fila
        titulo="App de navegación"
        detalle={navegador === 'waze' ? 'Waze' : 'Google Maps'}
        izquierda={<IconoNavegar tamano={20} color={colores.naranjaIcono} />}
        derecha={
          <Texto peso={700} tamano={13} color={colores.naranjaTexto}>
            Cambiar
          </Texto>
        }
        onPress={() => setNavegador(navegador === 'waze' ? 'maps' : 'waze')}
      />
      <Fila
        titulo="GPS y permisos"
        detalle="Ubicación precisa · todo el tiempo · sin ahorro de batería"
        izquierda={<IconoGps tamano={20} color={colores.naranjaIcono} />}
        derecha={<IconoSiguiente tamano={20} color={colores.gris} />}
        onPress={() => Linking.openSettings()}
      />

      <Seccion texto="SOLO EN EL PROTOTIPO" />
      {PRUEBAS.map((p) => (
        <Fila
          key={p.titulo}
          titulo={p.titulo}
          detalle={p.detalle}
          derecha={<IconoSiguiente tamano={20} color={colores.gris} />}
          onPress={() => router.push(p.ruta)}
        />
      ))}

      <Seccion texto="CUENTA" />
      <Fila
        titulo="Cerrar sesión"
        izquierda={<IconoSalir tamano={20} color={colores.marino} />}
        onPress={() => router.replace('/')}
      />
      <Texto tamano={12} color={colores.gris} style={{ textAlign: 'center', marginTop: 4 }}>
        Enruta2 Conductor {version} · canal {Updates.channel ?? 'desarrollo'} · {actualizacion}
      </Texto>
    </Pantalla>
  );
}
