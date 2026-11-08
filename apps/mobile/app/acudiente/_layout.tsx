import { colores } from '@enruta2/ui';
import { Stack } from 'expo-router';

import { EstadoProvider } from '../../src/acudiente/estado';

/** Sección de los acudientes. */
export default function LayoutAcudiente() {
  return (
    <EstadoProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colores.blanco },
        }}
      >
        <Stack.Screen
          name="hoy-no-va"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
    </EstadoProvider>
  );
}
