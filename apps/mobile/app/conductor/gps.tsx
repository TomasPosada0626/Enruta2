import {
  Boton,
  colores,
  IconoCampana,
  IconoCandado,
  IconoGps,
  IconoGpsApagado,
  IconoSonido,
  radios,
  Texto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Animated, Easing, Linking, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RUTA } from '../../src/conductor/datos';
import { useRecorrido } from '../../src/conductor/recorrido';

function Onda({ retraso }: { retraso: number }) {
  const [valor] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.delay(retraso),
        Animated.timing(valor, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    animacion.start();
    return () => animacion.stop();
  }, [valor, retraso]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 3,
        borderColor: colores.naranja,
        opacity: valor.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
        transform: [{ scale: valor.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.7] }) }],
      }}
    />
  );
}

function abrirAjustesDeUbicacion() {
  if (Platform.OS === 'android') {
    Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS').catch(() =>
      Linking.openSettings(),
    );
  } else {
    Linking.openSettings();
  }
}

/** Alerta que no se puede descartar: el GPS se apagó con el recorrido en curso (spec, sección 7.2.1). */
export default function GpsApagado() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const r = useRecorrido();
  const parada = r.fase === 'terminado' ? '' : ` · parada ${r.indice + 1} de ${r.paradas.length}`;
  // Hora en que se perdió la posición (en el prototipo, hace un minuto).
  const [hora] = useState(() =>
    new Date(Date.now() - 60_000).toLocaleTimeString('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
    }),
  );

  return (
    <View
      accessibilityRole="alert"
      style={{
        flex: 1,
        backgroundColor: colores.marino,
        paddingTop: insets.top + 10,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 22,
        gap: 20,
      }}
    >
      <StatusBar style="light" />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: 44,
        }}
      >
        <Texto peso={700} tamano={15} color={colores.grisClaro} style={{ flexShrink: 1 }}>
          {RUTA.nombre} · {r.sentido === 'ida' ? 'Ida' : 'Regreso'}
          {parada}
        </Texto>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'rgba(242,107,29,0.18)',
            borderRadius: radios.pildora,
            paddingVertical: 7,
            paddingHorizontal: 11,
          }}
        >
          <IconoSonido tamano={14} color="#FFB48A" />
          <Texto peso={700} tamano={12} color="#FFB48A">
            Con sonido
          </Texto>
        </View>
      </View>

      <View
        style={{
          alignSelf: 'center',
          width: 150,
          height: 150,
          marginTop: 24,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Onda retraso={0} />
        <Onda retraso={900} />
        <View
          style={{
            width: 112,
            height: 112,
            borderRadius: 56,
            backgroundColor: colores.naranja,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconoGpsApagado tamano={56} color={colores.marino} />
        </View>
      </View>

      <View style={{ gap: 10, marginTop: 8 }}>
        <Texto
          peso={800}
          tamano={32}
          interlineado={34}
          espaciado={-1.4}
          color={colores.blanco}
          style={{ textAlign: 'center' }}
        >
          Activa el GPS para continuar el recorrido
        </Texto>
        <Texto tamano={16} color={colores.grisClaro} style={{ textAlign: 'center' }}>
          Los acudientes ven «Sin ubicación desde las {hora}» hasta que vuelva la señal.
        </Texto>
      </View>

      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 18,
          padding: 16,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <IconoCampana tamano={18} color={colores.naranja} />
          <Texto tamano={15} color={colores.blanco} style={{ flex: 1 }}>
            El administrador ya recibió un aviso.
          </Texto>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <IconoCandado tamano={18} color={colores.naranja} />
          <Texto tamano={15} color={colores.blanco} style={{ flex: 1 }}>
            Marcar paradas queda en pausa sin GPS.
          </Texto>
        </View>
      </View>

      <View style={{ marginTop: 'auto', gap: 10 }}>
        <Boton
          titulo="Activar ubicación"
          variante="naranja"
          alto={62}
          tamanoTexto={19}
          icono={<IconoGps tamano={22} color={colores.marino} />}
          onPress={abrirAjustesDeUbicacion}
        />
        <Texto tamano={13} color={colores.grisClaro} style={{ textAlign: 'center' }}>
          Esta alerta se cierra sola cuando vuelva la ubicación.
        </Texto>
        <Boton
          titulo="Cerrar (solo en el prototipo)"
          variante="contornoClaro"
          alto={46}
          tamanoTexto={14}
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}
