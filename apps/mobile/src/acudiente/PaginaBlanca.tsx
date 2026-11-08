import { colores, Texto } from '@enruta2/ui';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Pestaña de lista de los acudientes (Hijos, Avisos, Cuenta): título grande y contenido con scroll. */
export function PaginaBlanca({
  titulo,
  subtitulo,
  accion,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  accion?: ReactNode;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colores.blanco }}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 24,
          gap: 14,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flex: 1, gap: 4 }}>
            {subtitulo ? (
              <Texto peso={600} tamano={14} color={colores.gris}>
                {subtitulo}
              </Texto>
            ) : null}
            <Texto peso={800} tamano={31} interlineado={34} espaciado={-1.4}>
              {titulo}
            </Texto>
          </View>
          {accion}
        </View>
        {children}
      </ScrollView>
    </View>
  );
}

export function Seccion({ texto }: { texto: string }) {
  return (
    <Texto peso={800} tamano={13} espaciado={0.5} color={colores.gris} style={{ marginTop: 6 }}>
      {texto}
    </Texto>
  );
}
