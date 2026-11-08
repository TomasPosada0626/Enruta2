import {
  Boton,
  colores,
  Fila,
  IconoCheck,
  IconoCompartir,
  IconoSiguiente,
  radios,
  Texto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { Share, View } from 'react-native';

import {
  CODIGO_RUTA,
  INSCRIPCIONES_APROBADAS,
  INSCRIPCIONES_PENDIENTES,
  RUTA,
} from '../../../src/conductor/datos';
import { Pantalla } from '../../../src/conductor/Pantalla';

function Seccion({ texto }: { texto: string }) {
  return (
    <Texto peso={800} tamano={13} espaciado={0.5} color={colores.gris} style={{ marginTop: 6 }}>
      {texto}
    </Texto>
  );
}

export default function Inscripciones() {
  const router = useRouter();

  const compartir = () =>
    Share.share({
      message: `Inscribe a tu hijo en la ${RUTA.nombre}: abre la app Enruta2, toca «Tengo un enlace o código» y escribe ${CODIGO_RUTA}.`,
    });

  return (
    <Pantalla
      enPestana
      encabezado={
        <View style={{ gap: 4, paddingTop: 8 }}>
          <Texto peso={600} tamano={14} color={colores.grisClaro}>
            {RUTA.nombre}
          </Texto>
          <Texto peso={800} tamano={30} interlineado={33} espaciado={-1.3} color={colores.blanco}>
            Inscripciones
          </Texto>
        </View>
      }
    >
      <View
        style={{
          borderWidth: 2,
          borderColor: colores.marino,
          borderRadius: 22,
          padding: 16,
          gap: 12,
        }}
      >
        <Texto peso={700} tamano={13} color={colores.gris}>
          Código de la ruta
        </Texto>
        <Texto
          peso={800}
          tamano={40}
          interlineado={42}
          espaciado={6}
          accessibilityLabel={`Código ${CODIGO_RUTA.split('').join(' ')}`}
        >
          {CODIGO_RUTA}
        </Texto>
        <Texto tamano={14} color={colores.gris}>
          Compártelo en el grupo de WhatsApp de los papás. Solo sirve para pedir una inscripción:
          nadie entra sin tu aprobación.
        </Texto>
        <Boton
          titulo="Compartir código"
          variante="naranja"
          icono={<IconoCompartir tamano={18} color={colores.marino} />}
          onPress={compartir}
        />
      </View>

      <Seccion texto={`PENDIENTES · ${INSCRIPCIONES_PENDIENTES.length}`} />
      {INSCRIPCIONES_PENDIENTES.map((i) => (
        <Fila
          key={i.id}
          titulo={i.estudiante}
          detalle={`${i.acudiente} · ${i.direccion} · ${i.hace}`}
          izquierda={
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: radios.pildora,
                backgroundColor: colores.naranja,
              }}
            />
          }
          derecha={<IconoSiguiente tamano={20} color={colores.gris} />}
          accessibilityLabel={`Revisar la inscripción de ${i.estudiante}`}
          onPress={() => router.push('/conductor/aprobar')}
        />
      ))}

      <Seccion texto="APROBADAS HACE POCO" />
      {INSCRIPCIONES_APROBADAS.map((i) => (
        <Fila
          key={i.id}
          titulo={i.estudiante}
          detalle={i.fecha}
          izquierda={<IconoCheck tamano={18} color={colores.marino} />}
        />
      ))}
    </Pantalla>
  );
}
