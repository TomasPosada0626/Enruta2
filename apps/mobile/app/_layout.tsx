import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/hanken-grotesk';
import { colores } from '@enruta2/ui';
import { Stack } from 'expo-router';
import { View } from 'react-native';

import { useActualizaciones } from '../src/actualizaciones';

/** Una sola app: la pantalla inicial pide el rol y cada rol tiene su propia sección. */
export default function LayoutRaiz() {
  useActualizaciones();
  const [fuentesListas] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
  });

  if (!fuentesListas) return <View style={{ flex: 1, backgroundColor: colores.blanco }} />;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="acudiente" />
      <Stack.Screen name="conductor" />
    </Stack>
  );
}
