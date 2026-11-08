import {
  colores,
  Fila,
  IconoCampana,
  IconoEscudo,
  IconoSalir,
  IconoSiguiente,
  radios,
  Texto,
} from '@enruta2/ui';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import { Alert, Linking, View } from 'react-native';

import { ACUDIENTE, useEstado } from '../../../src/acudiente/estado';
import { PaginaBlanca, Seccion } from '../../../src/acudiente/PaginaBlanca';

export default function Cuenta() {
  const router = useRouter();
  const { reiniciar } = useEstado();
  const version = Constants.expoConfig?.version ?? '0.1.0';
  const actualizacion = Updates.isEmbeddedLaunch
    ? 'incluida en el APK'
    : `OTA ${Updates.updateId?.slice(0, 8) ?? ''}`;

  return (
    <PaginaBlanca titulo="Cuenta">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: radios.pildora,
            backgroundColor: colores.marino,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Texto peso={800} tamano={24} color={colores.blanco}>
            {ACUDIENTE.nombre.charAt(0)}
          </Texto>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Texto peso={800} tamano={22} interlineado={25} espaciado={-0.8}>
            {ACUDIENTE.nombre} {ACUDIENTE.apellido}
          </Texto>
          <Texto tamano={14} color={colores.gris}>
            {ACUDIENTE.correo}
          </Texto>
        </View>
      </View>

      <Seccion texto="DATOS Y PRIVACIDAD" />
      <Fila
        titulo="Autorización de datos"
        detalle="Aceptada el 3 de noviembre · versión 1"
        izquierda={<IconoEscudo tamano={20} color={colores.naranjaIcono} />}
        derecha={<IconoSiguiente tamano={20} color={colores.gris} />}
        onPress={() =>
          Alert.alert(
            'Autorización de datos',
            'Aquí puedes leer el texto que aceptaste y revocarlo (Ley 1581 de 2012).',
          )
        }
      />
      <Fila
        titulo="Notificaciones"
        detalle="En camino, llegó, recogido y avisos de la ruta"
        izquierda={<IconoCampana tamano={20} color={colores.naranjaIcono} />}
        derecha={<IconoSiguiente tamano={20} color={colores.gris} />}
        onPress={() => Linking.openSettings()}
      />

      <Seccion texto="SOLO EN EL PROTOTIPO" />
      <Fila
        titulo="Reiniciar la prueba"
        detalle="Quita los avisos de «no va» y los hijos inscritos en la prueba"
        onPress={reiniciar}
      />

      <Seccion texto="SESIÓN" />
      <Fila
        titulo="Cerrar sesión"
        detalle="Vuelve a la elección de rol"
        izquierda={<IconoSalir tamano={20} color={colores.marino} />}
        onPress={() => router.replace('/')}
      />
      <Texto tamano={12} color={colores.gris} style={{ textAlign: 'center', marginTop: 4 }}>
        Enruta2 {version} · canal {Updates.channel ?? 'desarrollo'} · {actualizacion}
      </Texto>
    </PaginaBlanca>
  );
}
