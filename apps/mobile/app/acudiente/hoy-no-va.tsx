import {
  Boton,
  colores,
  IconoCalendarioNo,
  IconoCampana,
  IconoCheck,
  Nota,
  radios,
  sombraHoja,
  Texto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEstado } from '../../src/acudiente/estado';

const fecha = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date());
const fechaCapitalizada = fecha.charAt(0).toUpperCase() + fecha.slice(1);

/** Confirmación de "hoy no va" para la ida, con la casilla "Tampoco regresa" (spec, sección 6.3). */
export default function HoyNoVa() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hijo, avisarNoVa } = useEstado();
  const [tampocoRegresa, setTampocoRegresa] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colores.velo }}>
      <Pressable
        accessibilityLabel="Cerrar"
        onPress={() => router.back()}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View
        accessibilityViewIsModal
        style={[
          {
            backgroundColor: colores.blanco,
            borderTopLeftRadius: radios.hoja,
            borderTopRightRadius: radios.hoja,
            paddingHorizontal: 22,
            paddingTop: 10,
            paddingBottom: insets.bottom + 18,
            gap: 16,
          },
          sombraHoja,
        ]}
      >
        <View
          style={{
            alignSelf: 'center',
            width: 40,
            height: 5,
            borderRadius: 3,
            backgroundColor: colores.borde,
          }}
        />
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            backgroundColor: colores.naranjaSuave,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 4,
          }}
        >
          <IconoCalendarioNo tamano={28} color={colores.naranjaIcono} />
        </View>

        <View style={{ gap: 6 }}>
          <Texto peso={800} tamano={28} interlineado={31} espaciado={-1.3}>
            ¿Confirmas que {hijo.nombre} no va hoy?
          </Texto>
          <Texto tamano={15} color={colores.gris}>
            {fechaCapitalizada} · Ida
          </Texto>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: tampocoRegresa }}
          onPress={() => setTampocoRegresa((v) => !v)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            gap: 14,
            alignItems: 'flex-start',
            borderWidth: tampocoRegresa ? 2 : 1.5,
            borderColor: tampocoRegresa ? colores.marino : colores.borde,
            borderRadius: 18,
            padding: 16,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              marginTop: 1,
              borderWidth: tampocoRegresa ? 0 : 2,
              borderColor: colores.bordeFuerte,
              backgroundColor: tampocoRegresa ? colores.marino : colores.blanco,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {tampocoRegresa && <IconoCheck tamano={16} color={colores.blanco} grosor={3} />}
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Texto peso={800} tamano={17}>
              Tampoco regresa
            </Texto>
            <Texto tamano={14} color={colores.gris}>
              También lo sacamos de la ruta de regreso de hoy.
            </Texto>
          </View>
        </Pressable>

        <Nota
          icono={<IconoCampana tamano={18} />}
          texto={`Le avisamos de inmediato a ${hijo.conductor.nombre}, el conductor, y a ${hijo.acompanante.nombre}, la acompañante.`}
        />

        <View style={{ gap: 4, marginTop: 4 }}>
          <Boton
            titulo="Sí, no va hoy"
            onPress={() => {
              avisarNoVa(hijo.id, tampocoRegresa);
              router.back();
            }}
          />
          <Boton
            titulo="Cancelar"
            variante="texto"
            alto={48}
            tamanoTexto={16}
            onPress={() => router.back()}
          />
        </View>
      </View>
    </View>
  );
}
