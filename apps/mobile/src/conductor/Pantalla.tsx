import { colores, Hoja } from '@enruta2/ui';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Estructura de las pantallas del conductor: encabezado azul marino con las cifras grandes
 * y la hoja blanca encima (el mismo diseño de la app de acudientes, sin mapa).
 */
export function Pantalla({
  encabezado,
  superpuesto,
  children,
  pie,
  enPestana = false,
}: {
  encabezado: ReactNode;
  /** La pantalla vive en una pestaña: el menú inferior ya ocupa el área de gestos. */
  enPestana?: boolean;
  /** Elemento que monta entre el encabezado y la hoja, como el aviso de "Llegaste". */
  superpuesto?: ReactNode;
  children: ReactNode;
  /** Acción principal fija abajo. */
  pie?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colores.marino }}>
      <StatusBar style="light" />
      <View
        style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 22, gap: 14 }}
      >
        {encabezado}
      </View>
      {superpuesto && (
        <View style={{ marginHorizontal: 20, marginBottom: -34, zIndex: 2, elevation: 24 }}>
          {superpuesto}
        </View>
      )}
      <Hoja estilo={{ flex: 1, paddingTop: superpuesto ? 50 : 22, paddingHorizontal: 0 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16, gap: 14 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        {pie && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: (enPestana ? 0 : insets.bottom) + 14,
              gap: 6,
            }}
          >
            {pie}
          </View>
        )}
      </Hoja>
    </View>
  );
}
