import { colores } from '@enruta2/ui';
import { Stack } from 'expo-router';

import { RecorridoProvider } from '../../src/conductor/recorrido';

/** Sección del conductor, acompañante y administrador de ruta. */
export default function LayoutConductor() {
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
