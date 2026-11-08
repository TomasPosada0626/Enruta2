import {
  Boton,
  BotonIcono,
  Campo,
  colores,
  Hoja,
  IconoEnlace,
  IconoOjo,
  MapaIlustrado,
  Marca,
  radios,
  sombra,
  Texto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ALTO_MAPA = 330;

export default function Entrar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1, backgroundColor: colores.blanco }}>
      <StatusBar style="dark" />
      <View style={{ position: 'absolute', top: 0, left: 0 }}>
        <MapaIlustrado
          ancho={width}
          alto={ALTO_MAPA + insets.top}
          rio="M110 -20 C150 80 86 160 140 240 S 200 330 180 360"
          avenidas={['M-20 250 L420 124']}
          parques={[{ x: 262, y: 210, ancho: 96, alto: 62 }]}
          ruta={{
            puntos: [
              [40, 300],
              [100, 262],
              [168, 230],
              [232, 196],
              [292, 160],
            ],
            vehiculo: 2,
            tuParada: 4,
          }}
        />
      </View>

      <View
        style={[
          {
            position: 'absolute',
            top: insets.top + 14,
            left: 16,
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

      <Hoja
        estilo={{
          marginTop: ALTO_MAPA + insets.top - 44,
          flex: 1,
          paddingHorizontal: 0,
          paddingTop: 0,
        }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingTop: 26,
            paddingBottom: insets.bottom + 20,
            gap: 14,
          }}
        >
          <View style={{ gap: 6 }}>
            <Texto peso={800} tamano={31} interlineado={34} espaciado={-1.4}>
              Entra a Enruta2
            </Texto>
            <Texto tamano={15} color={colores.gris}>
              Sigue en vivo la ruta de tus hijos.
            </Texto>
          </View>

          <Campo
            etiqueta="Correo"
            value={correo}
            onChangeText={setCorreo}
            placeholder="tu@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <View style={{ gap: 4 }}>
            <Campo
              etiqueta="Contraseña"
              value={clave}
              onChangeText={setClave}
              secureTextEntry={!verClave}
              autoComplete="password"
              derecha={
                <BotonIcono
                  plano
                  accessibilityLabel={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onPress={() => setVerClave((v) => !v)}
                >
                  <IconoOjo tamano={20} color={colores.gris} />
                </BotonIcono>
              }
            />
            <Boton
              titulo="¿Olvidaste tu contraseña?"
              variante="texto"
              alto={40}
              tamanoTexto={14}
              estilo={{ alignSelf: 'flex-end', paddingHorizontal: 0 }}
            />
          </View>

          <Boton titulo="Entrar" onPress={() => router.replace('/acudiente/inicio')} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colores.lineaSuave }} />
            <Texto tamano={13} color={colores.gris}>
              ¿Te invitaron a una ruta?
            </Texto>
            <View style={{ flex: 1, height: 1, backgroundColor: colores.lineaSuave }} />
          </View>

          <Boton
            titulo="Tengo un enlace o código"
            variante="contorno"
            alto={52}
            tamanoTexto={16}
            icono={<IconoEnlace tamano={18} color={colores.naranjaIcono} />}
            onPress={() => router.push('/acudiente/inscripcion/estudiante')}
          />
        </ScrollView>
      </Hoja>
    </KeyboardAvoidingView>
  );
}
