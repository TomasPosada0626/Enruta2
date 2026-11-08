import { Boton, colores, Dias, IconoEscudo, IconoMas, Nota, PinParada, Texto } from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { HIJO, textoDireccion, useEstado } from '../../src/estado';
import { PasoInscripcion } from '../../src/PasoInscripcion';

const DIAS_NOMBRE = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

/** "jueves y viernes", "martes, jueves y viernes". */
function enLista(palabras: string[]) {
  return palabras.length <= 1
    ? (palabras[0] ?? '')
    : `${palabras.slice(0, -1).join(', ')} y ${palabras.at(-1)}`;
}

function Recorrido({
  titulo,
  detalle,
  direccion,
  dias,
  onCambiar,
}: {
  titulo: string;
  detalle: string;
  direccion: string;
  dias: boolean[];
  onCambiar: (i: number) => void;
}) {
  return (
    <View
      style={{
        borderWidth: 1.5,
        borderColor: colores.linea,
        borderRadius: 22,
        padding: 16,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Texto peso={800} tamano={17} espaciado={-0.3}>
          {titulo}
        </Texto>
        <Texto tamano={13} color={colores.gris}>
          {detalle}
        </Texto>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${titulo}: ${direccion}. Cambiar dirección`}
        onPress={() =>
          Alert.alert(
            'Cambiar dirección',
            'Aquí eliges otra de tus direcciones o agregas una nueva.',
          )
        }
        style={({ pressed }) => ({
          height: 48,
          borderRadius: 14,
          backgroundColor: colores.superficie,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 12,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <PinParada tamano={16} centro={colores.naranja} />
        <Texto peso={700} tamano={15} style={{ flex: 1 }}>
          {direccion}
        </Texto>
        <Texto peso={700} tamano={13} color={colores.naranjaTexto}>
          Cambiar
        </Texto>
      </Pressable>
      <Dias seleccionados={dias} onCambiar={onCambiar} />
    </View>
  );
}

export default function PasoDias() {
  const router = useRouter();
  const { direccion } = useEstado();
  const [ida, setIda] = useState([true, true, true, true, true]);
  const [regreso, setRegreso] = useState([true, true, true, false, false]);

  const alternar = (setter: typeof setIda) => (i: number) =>
    setter((dias) => dias.map((d, j) => (j === i ? !d : d)));

  const libres = regreso.map((d, i) => (d ? null : DIAS_NOMBRE[i])).filter(Boolean) as string[];
  const ningunDia = !ida.some(Boolean) && !regreso.some(Boolean);

  const enviar = () =>
    Alert.alert(
      'Inscripción enviada',
      `El conductor revisa el cupo y la aprueba. Te avisamos cuando ${HIJO.nombre} quede inscrito.`,
      [{ text: 'Listo', onPress: () => router.replace('/inicio') }],
    );

  return (
    <PasoInscripcion
      paso={4}
      pie={<Boton titulo="Enviar inscripción" deshabilitado={ningunDia} onPress={enviar} />}
    >
      <View style={{ gap: 6 }}>
        <Texto peso={800} tamano={27} interlineado={30} espaciado={-1.1}>
          ¿Qué días va en la ruta?
        </Texto>
        <Texto tamano={14} color={colores.gris}>
          La ida y el regreso pueden tener días y direcciones distintas.
        </Texto>
      </View>

      <Recorrido
        titulo="Ida"
        detalle="lo recogen en"
        direccion={textoDireccion(direccion)}
        dias={ida}
        onCambiar={alternar(setIda)}
      />
      <Recorrido
        titulo="Regreso"
        detalle="lo dejan en"
        direccion={textoDireccion(direccion)}
        dias={regreso}
        onCambiar={alternar(setRegreso)}
      />

      {libres.length > 0 && (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            Alert.alert(
              'Otra dirección',
              'Aquí escribes la otra dirección (por ejemplo, la casa del papá) y la confirmas en el mapa.',
            )
          }
          style={({ pressed }) => ({
            height: 52,
            borderRadius: 16,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colores.bordeFuerte,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <IconoMas tamano={18} color={colores.naranjaIcono} />
          <Texto peso={700} tamano={15}>
            Otra dirección para {enLista(libres)}
          </Texto>
        </Pressable>
      )}

      <Nota
        fondo={colores.naranjaAviso}
        icono={<IconoEscudo tamano={18} color={colores.naranjaTexto} />}
        texto={`El conductor revisa el cupo y aprueba la inscripción. Te avisamos cuando ${HIJO.nombre} quede inscrito.`}
      />
    </PasoInscripcion>
  );
}
