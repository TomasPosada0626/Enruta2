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

import { RecorridoProvider } from '../src/recorrido';

export default function Layout() {
  const [fuentesListas] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
  });

  if (!fuentesListas) return <View style={{ flex: 1, backgroundColor: colores.marino }} />;

  return (
    <RecorridoProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colores.marino },
        }}
      >
        <Stack.Screen
          name="aviso-no-va"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen name="gps" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      </Stack>
    </RecorridoProvider>
  );
}
