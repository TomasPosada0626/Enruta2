import {
  BarraPestanas,
  IconoCampana,
  IconoMapa,
  IconoPersona,
  IconoPersonas,
  type ItemPestana,
} from '@enruta2/ui';
import { Tabs } from 'expo-router';

import { AVISOS_ACUDIENTE } from '../../../src/acudiente/avisos';

const PESTANAS: ItemPestana[] = [
  { clave: 'inicio', etiqueta: 'En vivo', Icono: IconoMapa },
  { clave: 'hijos', etiqueta: 'Hijos', Icono: IconoPersonas },
  {
    clave: 'avisos',
    etiqueta: 'Avisos',
    Icono: IconoCampana,
    insignia: AVISOS_ACUDIENTE.filter((a) => a.nuevo).length,
  },
  { clave: 'cuenta', etiqueta: 'Cuenta', Icono: IconoPersona },
];

/** Menú inferior de los acudientes. */
export default function PestanasAcudiente() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigateToTab, insets }) => (
        <BarraPestanas
          items={PESTANAS}
          activa={state.routes[state.index]?.name ?? 'inicio'}
          onElegir={(clave) => {
            const ruta = state.routes.find((r) => r.name === clave);
            if (ruta) navigateToTab(ruta.key);
          }}
          margenInferior={insets.bottom}
        />
      )}
    >
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="hijos" />
      <Tabs.Screen name="avisos" />
      <Tabs.Screen name="cuenta" />
    </Tabs>
  );
}
