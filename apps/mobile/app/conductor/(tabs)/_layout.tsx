import {
  BarraPestanas,
  IconoCalendario,
  IconoCampana,
  IconoPersona,
  IconoPortapapeles,
  IconoRuta,
  type ItemPestana,
} from '@enruta2/ui';
import { Tabs } from 'expo-router';

import { AVISOS, INSCRIPCIONES_PENDIENTES } from '../../../src/conductor/datos';

const PESTANAS: ItemPestana[] = [
  { clave: 'hoy', etiqueta: 'Hoy', Icono: IconoCalendario },
  { clave: 'recorrido', etiqueta: 'Recorrido', Icono: IconoRuta },
  {
    clave: 'inscripciones',
    etiqueta: 'Inscripciones',
    Icono: IconoPortapapeles,
    insignia: INSCRIPCIONES_PENDIENTES.length,
  },
  {
    clave: 'avisos',
    etiqueta: 'Avisos',
    Icono: IconoCampana,
    insignia: AVISOS.filter((a) => a.nuevo).length,
  },
  { clave: 'mas', etiqueta: 'Más', Icono: IconoPersona },
];

/** Menú inferior del conductor. */
export default function PestanasConductor() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigateToTab, insets }) => (
        <BarraPestanas
          items={PESTANAS}
          activa={state.routes[state.index]?.name ?? 'hoy'}
          onElegir={(clave) => {
            const ruta = state.routes.find((r) => r.name === clave);
            if (ruta) navigateToTab(ruta.key);
          }}
          margenInferior={insets.bottom}
        />
      )}
    >
      <Tabs.Screen name="hoy" />
      <Tabs.Screen name="recorrido" />
      <Tabs.Screen name="inscripciones" />
      <Tabs.Screen name="avisos" />
      <Tabs.Screen name="mas" />
    </Tabs>
  );
}
