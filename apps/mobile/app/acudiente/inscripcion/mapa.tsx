import {
  Boton,
  BotonIcono,
  colores,
  Hoja,
  IconoAtras,
  IconoCheck,
  IconoMover,
  MapaIlustrado,
  Nota,
  PinParada,
  radios,
  sombra,
  Texto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Animated, Easing, PanResponder, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { textoDireccionCompleta, useEstado } from '../../../src/acudiente/estado';

const ALTO_HOJA = 336;
/** El mapa es más grande que la pantalla para poder arrastrarlo. */
const MARGEN = 260;

function Respiracion() {
  const [valor] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animacion = Animated.loop(
      Animated.timing(valor, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    animacion.start();
    return () => animacion.stop();
  }, [valor]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: -26,
        top: -14,
        width: 52,
        height: 28,
        borderRadius: 14,
        backgroundColor: colores.naranja,
        opacity: valor.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
        transform: [{ scale: valor.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
      }}
    />
  );
}

export default function PasoMapa() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { borrador } = useEstado();
  const direccion = borrador.direccion;
  const [movido, setMovido] = useState(false);

  const [arrastre] = useState(() => new Animated.ValueXY({ x: 0, y: 0 }));
  const [gestos] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => arrastre.extractOffset(),
      onPanResponderMove: Animated.event([null, { dx: arrastre.x, dy: arrastre.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        arrastre.flattenOffset();
        setMovido(true);
      },
    }),
  );

  const altoVisible = height - ALTO_HOJA + 30;
  const centroY = Math.round(altoVisible / 2) + 10;
  // Escala del mapa ampliado: px de pantalla → unidades del diseño (390 de ancho).
  const k = 390 / (width + MARGEN * 2);
  const bajoElPin = { x: (width / 2 + MARGEN) * k, y: (centroY + MARGEN) * k };

  return (
    <View style={{ flex: 1, backgroundColor: colores.blanco, overflow: 'hidden' }}>
      <StatusBar style="dark" />
      <Animated.View
        {...gestos.panHandlers}
        accessibilityLabel="Mapa. Arrástralo para mover el punto"
        style={{
          position: 'absolute',
          left: -MARGEN,
          top: -MARGEN,
          transform: arrastre.getTranslateTransform(),
        }}
      >
        <MapaIlustrado
          ancho={width + MARGEN * 2}
          alto={altoVisible + MARGEN * 2}
          rio="M330 -20 C350 140 290 300 340 460 S 380 640 370 800"
          avenidas={[`M-20 ${bajoElPin.y + 34} L420 ${bajoElPin.y - 90}`, 'M120 -20 L160 800']}
          parques={[
            { x: 40, y: bajoElPin.y + 70, ancho: 70, alto: 46 },
            { x: 250, y: bajoElPin.y - 150, ancho: 60, alto: 40 },
          ]}
          resaltar={{ x: bajoElPin.x - 24, y: bajoElPin.y - 26, ancho: 48, alto: 34 }}
        />
      </Animated.View>

      <View pointerEvents="none" style={{ position: 'absolute', left: width / 2, top: centroY }}>
        <Respiracion />
        <View
          style={{
            position: 'absolute',
            left: -14,
            top: -6,
            width: 28,
            height: 12,
            borderRadius: 6,
            backgroundColor: 'rgba(15,31,61,0.22)',
          }}
        />
        <View style={{ position: 'absolute', left: -27, top: -52 }}>
          <PinParada tamano={54} centro={colores.naranja} />
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          top: insets.top + 12,
          left: 16,
          right: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <BotonIcono accessibilityLabel="Volver" flotante onPress={() => router.back()}>
          <IconoAtras tamano={20} />
        </BotonIcono>
        <View
          style={[
            {
              backgroundColor: colores.blanco,
              borderRadius: radios.pildora,
              paddingVertical: 10,
              paddingHorizontal: 14,
            },
            sombra,
          ]}
        >
          <Texto peso={700} tamano={13}>
            Paso 3 de 4
          </Texto>
        </View>
      </View>

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: centroY - 118,
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: colores.marino,
          borderRadius: radios.pildora,
          paddingVertical: 9,
          paddingHorizontal: 14,
        }}
      >
        <IconoMover tamano={16} color={colores.naranja} />
        <Texto peso={600} tamano={13} color={colores.blanco}>
          {movido ? 'Suelta el pin en la entrada' : 'Mueve el mapa hasta la entrada'}
        </Texto>
      </View>

      <Hoja
        conAsa
        estilo={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: ALTO_HOJA + insets.bottom,
          paddingBottom: insets.bottom + 18,
          paddingHorizontal: 22,
          gap: 14,
        }}
      >
        <View style={{ gap: 6 }}>
          <Texto peso={800} tamano={28} interlineado={31} espaciado={-1.3}>
            ¿Aquí recogen a {borrador.nombre.trim() || 'tu hijo'}?
          </Texto>
          <Texto peso={600} tamano={15}>
            {textoDireccionCompleta(direccion)}
          </Texto>
        </View>
        <Nota texto="El conductor llegará exactamente a este punto. Si no es la entrada, por ejemplo la portería, mueve el mapa antes de confirmar." />
        <View style={{ marginTop: 'auto', gap: 2 }}>
          <Boton
            titulo="Sí, aquí lo recogen"
            icono={<IconoCheck tamano={18} color={colores.naranja} />}
            onPress={() => router.push('/acudiente/inscripcion/dias')}
          />
          <Boton
            titulo="Corregir la dirección"
            variante="texto"
            alto={44}
            tamanoTexto={15}
            onPress={() => router.back()}
          />
        </View>
      </Hoja>
    </View>
  );
}
