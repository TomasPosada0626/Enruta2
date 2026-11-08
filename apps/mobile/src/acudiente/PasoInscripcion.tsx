import { BotonIcono, colores, IconoAtras, radios, Texto } from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEstado } from './estado';

/** Pantalla de un paso de la inscripción: volver, título, progreso, contenido y acción fija abajo. */
export function PasoInscripcion({
  paso,
  children,
  pie,
}: {
  paso: number;
  children: ReactNode;
  pie: ReactNode;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { borrador } = useEstado();
  const nombre = borrador.nombre.trim() || 'tu hijo';
  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1, backgroundColor: colores.blanco }}>
      <StatusBar style="dark" />
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, gap: 12 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <BotonIcono accessibilityLabel="Volver" onPress={() => router.back()}>
            <IconoAtras tamano={20} />
          </BotonIcono>
          <Texto peso={700} tamano={16}>
            Inscribir a {nombre}
          </Texto>
          <Texto
            peso={700}
            tamano={13}
            color={colores.gris}
            style={{ width: 46, textAlign: 'right' }}
          >
            {paso} de 4
          </Texto>
        </View>
        <View
          style={{ flexDirection: 'row', gap: 4 }}
          accessible
          accessibilityLabel={`Paso ${paso} de 4`}
        >
          {[1, 2, 3, 4].map((n) => (
            <View
              key={n}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: n <= paso ? colores.marino : colores.linea,
              }}
            />
          ))}
        </View>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 20,
          gap: 14,
        }}
      >
        {children}
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: insets.bottom + 14 }}>
        {pie}
      </View>
    </KeyboardAvoidingView>
  );
}

/** Fila de opciones táctiles (municipio, tipo de vía). */
export function Opciones({
  etiqueta,
  opciones,
  valor,
  onElegir,
}: {
  etiqueta: string;
  opciones: readonly string[];
  valor: string;
  onElegir: (opcion: string) => void;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Texto peso={700} tamano={13}>
        {etiqueta}
      </Texto>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="radiogroup"
        accessibilityLabel={etiqueta}
        contentContainerStyle={{ gap: 6, paddingRight: 20 }}
        style={{ marginRight: -20 }}
      >
        {opciones.map((opcion) => {
          const activa = opcion === valor;
          return (
            <Pressable
              key={opcion}
              accessibilityRole="radio"
              accessibilityState={{ checked: activa }}
              onPress={() => onElegir(opcion)}
              style={({ pressed }) => ({
                height: 44,
                paddingHorizontal: 14,
                borderRadius: radios.boton,
                justifyContent: 'center',
                backgroundColor: activa ? colores.marino : colores.blanco,
                borderWidth: activa ? 0 : 1.5,
                borderColor: colores.borde,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Texto peso={700} tamano={15} color={activa ? colores.blanco : colores.marino}>
                {opcion}
              </Texto>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
