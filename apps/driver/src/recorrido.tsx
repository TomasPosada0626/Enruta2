import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { PARADAS_IDA, type Parada } from './datos';

export type Sentido = 'ida' | 'vuelta';
export type Navegador = 'waze' | 'maps';
export type Marca = 'recogido' | 'noSalio' | 'entregado' | 'nadieRecibio';
export type Fase = 'enCamino' | 'enParada' | 'terminado';

type Estado = {
  sentido: Sentido;
  paradas: Parada[];
  indice: number;
  fase: Fase;
  marcas: Record<string, Marca | undefined>;
  horas: Record<string, string | undefined>;
};

type Recorrido = Estado & {
  navegador: Navegador;
  setNavegador: (n: Navegador) => void;
  parada: Parada | undefined;
  /** Todos los estudiantes de la parada actual quedaron marcados. */
  paradaCompleta: boolean;
  iniciar: (sentido: Sentido, paradas?: Parada[]) => void;
  llegar: () => void;
  marcar: (estudianteId: string, marca: Marca) => void;
  siguiente: () => void;
  /** "Hoy no va" en camino: la parada actual sale del recorrido y se sigue a la siguiente. */
  excusarActual: () => void;
};

const Contexto = createContext<Recorrido | null>(null);

const horaActual = () =>
  new Date().toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: false });

const INICIAL: Estado = {
  sentido: 'ida',
  paradas: PARADAS_IDA,
  indice: 0,
  fase: 'enCamino',
  marcas: {},
  horas: {},
};

/** Estado del recorrido del prototipo. En las fases 3 y 4 lo reemplaza la API. */
export function RecorridoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(INICIAL);
  const [navegador, setNavegador] = useState<Navegador>('waze');

  const valor = useMemo<Recorrido>(() => {
    const parada = estado.paradas[estado.indice];
    const paradaCompleta = !!parada && parada.estudiantes.every((e) => estado.marcas[e.id]);
    return {
      ...estado,
      navegador,
      setNavegador,
      parada,
      paradaCompleta,
      iniciar: (sentido, paradas = PARADAS_IDA) =>
        setEstado({ sentido, paradas, indice: 0, fase: 'enCamino', marcas: {}, horas: {} }),
      llegar: () => setEstado((e) => ({ ...e, fase: 'enParada' })),
      marcar: (id, marca) =>
        setEstado((e) => ({
          ...e,
          marcas: { ...e.marcas, [id]: marca },
          horas: { ...e.horas, [id]: horaActual() },
        })),
      siguiente: () =>
        setEstado((e) => {
          const actual = e.paradas[e.indice];
          let paradas = e.paradas;
          const marcas = { ...e.marcas };
          // Vuelta: si nadie recibió a alguien, la parada pasa al final para volver a intentar.
          const sinRecibir =
            actual?.estudiantes.filter((x) => e.marcas[x.id] === 'nadieRecibio') ?? [];
          if (actual && sinRecibir.length > 0) {
            sinRecibir.forEach((x) => delete marcas[x.id]);
            paradas = [
              ...e.paradas,
              { ...actual, id: `${actual.id}-reintento`, estudiantes: sinRecibir },
            ];
          }
          const indice = e.indice + 1;
          return {
            ...e,
            paradas,
            marcas,
            indice,
            fase: indice >= paradas.length ? 'terminado' : 'enCamino',
          };
        }),
      excusarActual: () =>
        setEstado((e) => {
          const paradas = e.paradas.filter((_, i) => i !== e.indice);
          return {
            ...e,
            paradas,
            fase: e.indice >= paradas.length ? 'terminado' : 'enCamino',
          };
        }),
    };
  }, [estado, navegador]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useRecorrido() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useRecorrido debe usarse dentro de RecorridoProvider');
  return valor;
}

export function urlNavegacion(navegador: Navegador, parada: Parada) {
  return navegador === 'waze'
    ? `https://waze.com/ul?ll=${parada.lat},${parada.lon}&navigate=yes`
    : `https://www.google.com/maps/dir/?api=1&destination=${parada.lat},${parada.lon}&travelmode=driving&dir_action=navigate`;
}
