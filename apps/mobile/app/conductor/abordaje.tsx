import { Boton, Cifra, colores, IconoCheck, IconoFlecha, radios, Texto } from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import {
  ABORDARON_AL_INICIO,
  ESTUDIANTES,
  INSCRITOS_VUELTA,
  NO_FUE_A_LA_IDA,
  PARADAS_VUELTA,
  RUTA,
} from '../../src/conductor/datos';
import { Pantalla } from '../../src/conductor/Pantalla';
import { useRecorrido } from '../../src/conductor/recorrido';

function Seccion({ texto }: { texto: string }) {
  return (
    <Texto peso={800} tamano={13} espaciado={0.5} color={colores.gris} style={{ marginTop: 4 }}>
      {texto}
    </Texto>
  );
}

export default function Abordaje() {
  const router = useRouter();
  const { iniciar } = useRecorrido();
  const [aBordo, setABordo] = useState<Set<string>>(() => new Set(ABORDARON_AL_INICIO));

  const faltan = INSCRITOS_VUELTA.filter((e) => !aBordo.has(e.id));
  const subieron = INSCRITOS_VUELTA.filter((e) => aBordo.has(e.id));

  const alternar = (id: string) =>
    setABordo((actual) => {
      const nuevo = new Set(actual);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });

  const armarRuta = () => {
    const paradas = PARADAS_VUELTA.map((p) => ({
      ...p,
      estudiantes: p.estudiantes.filter((e) => aBordo.has(e.id)),
    })).filter((p) => p.estudiantes.length > 0);
    iniciar('vuelta', paradas);
    router.dismissTo('/conductor/recorrido');
  };

  const confirmar = () => {
    const nombres = faltan.map((e) => e.nombre.split(' ')[0]).join(', ');
    Alert.alert(
      `Van ${subieron.length} de ${INSCRITOS_VUELTA.length}. ¿Armar la ruta?`,
      faltan.length > 0
        ? `${nombres} ${faltan.length === 1 ? 'queda' : 'quedan'} como «no subió» y le avisamos a su acudiente.`
        : 'Están todos a bordo.',
      [
        { text: 'Revisar', style: 'cancel' },
        { text: 'Armar ruta', onPress: armarRuta },
      ],
    );
  };

  return (
    <Pantalla
      encabezado={
        <>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: 44,
            }}
          >
            <Texto peso={700} tamano={15} color={colores.grisClaro}>
              {RUTA.nombre} · Regreso
            </Texto>
            <View
              style={{
                backgroundColor: colores.blancoTenue,
                borderRadius: radios.pildora,
                paddingVertical: 8,
                paddingHorizontal: 12,
              }}
            >
              <Texto peso={700} tamano={13} color={colores.blanco}>
                En el colegio
              </Texto>
            </View>
          </View>
          <View
            style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}
            accessible
            accessibilityLabel={`${subieron.length} de ${INSCRITOS_VUELTA.length} a bordo`}
          >
            <Cifra tamano={72} color={colores.blanco}>
              {subieron.length}
            </Cifra>
            <View style={{ gap: 2, paddingBottom: 8 }}>
              <Texto peso={700} tamano={22} interlineado={24} color={colores.grisClaro}>
                de {INSCRITOS_VUELTA.length} a bordo
              </Texto>
              <Texto tamano={14} color={colores.grisClaro}>
                Toca a cada uno cuando suba
              </Texto>
            </View>
          </View>
        </>
      }
      pie={
        <>
          <Texto tamano={13} color={colores.gris} style={{ textAlign: 'center' }}>
            Los que no marques quedan como «no subió» y le avisamos a su acudiente.
          </Texto>
          <Boton
            titulo={`Armar ruta · ${subieron.length} a bordo`}
            alto={58}
            tamanoTexto={18}
            deshabilitado={subieron.length === 0}
            iconoDerecha={<IconoFlecha tamano={20} color={colores.naranja} />}
            onPress={confirmar}
          />
        </>
      }
    >
      <Seccion texto={`FALTAN POR SUBIR · ${faltan.length}`} />
      {faltan.length === 0 && (
        <Texto tamano={15} color={colores.gris}>
          Están todos a bordo.
        </Texto>
      )}
      {faltan.map((e) => (
        <View
          key={e.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            borderWidth: 1.5,
            borderColor: colores.linea,
            borderRadius: 16,
            paddingVertical: 8,
            paddingLeft: 14,
            paddingRight: 8,
          }}
        >
          <View style={{ gap: 3, flexShrink: 1 }}>
            <Texto peso={700} tamano={16}>
              {e.nombre}
            </Texto>
            {NO_FUE_A_LA_IDA.has(e.id) && (
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: colores.naranjaSuave,
                  borderRadius: radios.pildora,
                  paddingVertical: 3,
                  paddingHorizontal: 8,
                }}
              >
                <Texto peso={700} tamano={12} color={colores.naranjaTexto}>
                  No fue a la ida
                </Texto>
              </View>
            )}
          </View>
          <Boton
            titulo="Abordó"
            variante="contorno"
            alto={44}
            tamanoTexto={15}
            accessibilityLabel={`Marcar a ${e.nombre} a bordo`}
            onPress={() => alternar(e.id)}
          />
        </View>
      ))}

      <Seccion texto={`A BORDO · ${subieron.length}`} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {subieron.map((e) => (
          <Pressable
            key={e.id}
            accessibilityRole="button"
            accessibilityLabel={`Quitar a ${e.nombre} de a bordo`}
            onPress={() => alternar(e.id)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              height: 36,
              paddingHorizontal: 11,
              borderRadius: radios.pildora,
              backgroundColor: colores.marinoSuave,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <IconoCheck tamano={12} color={colores.marino} grosor={3} />
            <Texto peso={700} tamano={13}>
              {e.nombre}
            </Texto>
          </Pressable>
        ))}
      </View>

      <Seccion texto="NO REGRESAN HOY · 1" />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colores.superficie,
          borderRadius: 14,
          paddingVertical: 11,
          paddingHorizontal: 14,
        }}
      >
        <Texto peso={700} tamano={15} color={colores.gris}>
          {ESTUDIANTES.mateo.nombre}
        </Texto>
        <Texto tamano={13} color={colores.gris}>
          Avisó su acudiente
        </Texto>
      </View>
    </Pantalla>
  );
}
