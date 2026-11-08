import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Alert } from 'react-native';

/**
 * Actualizaciones OTA (EAS Update): al abrir la app busca una versión nueva del canal,
 * la descarga y ofrece reiniciar para usarla. En desarrollo (Expo Go o `expo start`) no hace nada.
 */
export function useActualizaciones() {
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;
    let cancelado = false;
    (async () => {
      try {
        const revision = await Updates.checkForUpdateAsync();
        if (!revision.isAvailable || cancelado) return;
        await Updates.fetchUpdateAsync();
        if (cancelado) return;
        Alert.alert('Hay una versión nueva de Enruta2', 'Reinicia la app para usarla.', [
          { text: 'Más tarde', style: 'cancel' },
          { text: 'Reiniciar', onPress: () => void Updates.reloadAsync() },
        ]);
      } catch {
        // Sin conexión o sin servidor: se vuelve a intentar en la próxima apertura.
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);
}
