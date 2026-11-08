import {
  Boton,
  BotonIcono,
  Campo,
  colores,
  Hoja,
  IconoFlecha,
  IconoInfo,
  IconoOjo,
  Nota,
  PinLogo,
  Texto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { CONDUCTOR } from '../../src/conductor/datos';

export default function Entrar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [correo, setCorreo] = useState(CONDUCTOR.correo);
  const [clave, setClave] = useState('contraseña');
  const [verClave, setVerClave] = useState(false);

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1, backgroundColor: colores.marino }}>
      <StatusBar style="light" />
      <Svg
        width={420}
        height={420}
        viewBox="0 0 64 64"
        style={{ position: 'absolute', top: -70, right: -150, opacity: 0.09 }}
        accessibilityElementsHidden
      >
        <Path
          d="M19 25 C19 15 45 14 45 26 C45 35 27 39 19 49 L46 49"
          fill="none"
          stroke={colores.blanco}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>

      <View
        style={{ paddingTop: insets.top + 48, paddingHorizontal: 24, paddingBottom: 34, gap: 18 }}
      >
        <PinLogo tamano={64} sobreOscuro />
        <View style={{ gap: 4 }}>
          <Texto peso={800} tamano={44} interlineado={46} espaciado={-2} color={colores.blanco}>
            enruta
            <Texto peso={800} tamano={44} color={colores.naranja}>
              2
            </Texto>
          </Texto>
          <Texto peso={700} tamano={15} espaciado={2} color={colores.grisClaro}>
            CONDUCTOR
          </Texto>
        </View>
      </View>

      <Hoja estilo={{ flex: 1, paddingHorizontal: 0, paddingTop: 0 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingTop: 28,
            paddingBottom: insets.bottom + 20,
            gap: 16,
          }}
        >
          <View style={{ gap: 6 }}>
            <Texto peso={800} tamano={30} interlineado={32} espaciado={-1.3}>
              Entra para empezar tu ruta
            </Texto>
            <Texto tamano={15} color={colores.gris}>
              Con la cuenta que te creó tu empresa.
            </Texto>
          </View>

          <Campo
            etiqueta="Correo"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Campo
            etiqueta="Contraseña"
            value={clave}
            onChangeText={setClave}
            secureTextEntry={!verClave}
            autoComplete="password"
            derecha={
              <BotonIcono
                accessibilityLabel={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onPress={() => setVerClave((v) => !v)}
                plano
              >
                <IconoOjo tamano={20} color={colores.gris} />
              </BotonIcono>
            }
          />

          <Boton
            titulo="Entrar"
            variante="naranja"
            alto={58}
            tamanoTexto={18}
            iconoDerecha={<IconoFlecha tamano={20} color={colores.marino} />}
            onPress={() => router.replace('/conductor/hoy')}
          />

          <Nota
            icono={<IconoInfo tamano={18} />}
            texto="¿Primera vez? Abre la invitación que te envió la empresa de transporte."
          />
        </ScrollView>
      </Hoja>
    </KeyboardAvoidingView>
  );
}
