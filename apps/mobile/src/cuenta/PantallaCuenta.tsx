import { BotonIcono, colores, Hoja, IconoAtras, Texto } from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type Modo = 'acudiente' | 'conductor';

/**
 * Estructura de las pantallas de cuenta (crear, verificar, recuperar) en cada modo:
 * blanca con el ícono arriba para el acudiente, encabezado azul marino con la hoja para el conductor.
 */
export function PantallaCuenta({
  modo,
  titulo,
  subtitulo,
  icono,
  children,
  pie,
}: {
  modo: Modo;
  titulo: string;
  subtitulo?: ReactNode;
  /** Ícono grande sobre el título (solo en el modo acudiente). */
  icono?: ReactNode;
  children: ReactNode;
  pie?: ReactNode;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const oscuro = modo === 'conductor';

  const contenido = (
    <>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: oscuro ? 26 : 8,
          paddingBottom: 20,
          gap: 16,
        }}
      >
        {children}
      </ScrollView>
      {pie && (
        <View
          style={{
            paddingHorizontal: 22,
            paddingTop: 8,
            paddingBottom: insets.bottom + 14,
            gap: 4,
          }}
        >
          {pie}
        </View>
      )}
    </>
  );

  const encabezado = (
    <View style={{ gap: oscuro ? 18 : 16 }}>
      <BotonIcono accessibilityLabel="Volver" sobreOscuro={oscuro} onPress={() => router.back()}>
        <IconoAtras tamano={20} color={oscuro ? colores.blanco : colores.marino} />
      </BotonIcono>
      {!oscuro && icono}
      <View style={{ gap: 6 }}>
        <Texto
          peso={800}
          tamano={oscuro ? 30 : 31}
          interlineado={oscuro ? 33 : 34}
          espaciado={-1.3}
          color={oscuro ? colores.blanco : colores.marino}
          accessibilityRole="header"
        >
          {titulo}
        </Texto>
        {subtitulo ? (
          <Texto tamano={15} interlineado={21} color={oscuro ? colores.grisClaro : colores.gris}>
            {subtitulo}
          </Texto>
        ) : null}
      </View>
    </View>
  );

  if (oscuro) {
    return (
      <KeyboardAvoidingView behavior="height" style={{ flex: 1, backgroundColor: colores.marino }}>
        <StatusBar style="light" />
        <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 26 }}>
          {encabezado}
        </View>
        <Hoja estilo={{ flex: 1, paddingHorizontal: 0, paddingTop: 0 }}>{contenido}</Hoja>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1, backgroundColor: colores.blanco }}>
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 22, paddingBottom: 8 }}>
        {encabezado}
      </View>
      {contenido}
    </KeyboardAvoidingView>
  );
}

/** Ícono redondo naranja suave para la cabecera del modo acudiente. */
export function IconoCabecera({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        width: 64,
        height: 64,
        borderRadius: 22,
        backgroundColor: colores.naranjaSuave,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}
