import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

// Datos de ejemplo del prototipo. Nombres, direcciones y teléfonos son ficticios.
export const HIJO = { nombre: 'Pablo', nombreCompleto: 'Pablo Pérez' };
export const ACUDIENTE = { nombre: 'Laura' };
export const RUTA = {
  nombre: 'Ruta Norte',
  jornada: 'Jornada de la mañana',
  salidaVuelta: '~12:30 p. m.',
};
/** Número ficticio: en el prototipo solo abre el marcador. */
export const TELEFONO_DE_PRUEBA = '+573000000000';
export const CONDUCTOR = { nombre: 'Luis', telefono: TELEFONO_DE_PRUEBA };
export const ACOMPANANTE = { nombre: 'Ana', telefono: TELEFONO_DE_PRUEBA };

export const MUNICIPIOS = [
  'Medellín',
  'Envigado',
  'Sabaneta',
  'Itagüí',
  'La Estrella',
  'Caldas',
  'Bello',
  'Copacabana',
  'Girardota',
  'Barbosa',
] as const;

export const TIPOS_DE_VIA = [
  'Calle',
  'Carrera',
  'Diagonal',
  'Transversal',
  'Circular',
  'Avenida',
] as const;

export type Direccion = {
  municipio: string;
  barrio: string;
  via: string;
  numero: string;
  cruce: string;
  placa: string;
  complemento: string;
  indicaciones: string;
};

export function textoDireccion(d: Direccion) {
  return `${d.via} ${d.numero} # ${d.cruce}-${d.placa}`;
}

export function textoDireccionCompleta(d: Direccion) {
  const complemento = d.complemento ? `, ${d.complemento}` : '';
  return `${textoDireccion(d)}${complemento} · ${d.barrio}, ${d.municipio}`;
}

type Ausencia = { tampocoRegresa: boolean; hora: string };

type Estado = {
  direccion: Direccion;
  setDireccion: (cambio: Partial<Direccion>) => void;
  ausencia: Ausencia | null;
  avisarNoVa: (tampocoRegresa: boolean) => void;
  deshacerNoVa: () => void;
  noRegresa: boolean;
  setNoRegresa: (valor: boolean) => void;
};

const Contexto = createContext<Estado | null>(null);

/** Estado del prototipo de acudientes. En las fases 1 y 5 lo reemplaza la API. */
export function EstadoProvider({ children }: { children: ReactNode }) {
  const [direccion, setDireccionCompleta] = useState<Direccion>({
    municipio: 'Medellín',
    barrio: 'El Poblado',
    via: 'Carrera',
    numero: '43A',
    cruce: '1',
    placa: '50',
    complemento: 'Torre 2, apto 504',
    indicaciones: 'Portería principal',
  });
  const [ausencia, setAusencia] = useState<Ausencia | null>(null);
  const [noRegresa, setNoRegresa] = useState(false);

  const valor = useMemo<Estado>(
    () => ({
      direccion,
      setDireccion: (cambio) => setDireccionCompleta((d) => ({ ...d, ...cambio })),
      ausencia,
      avisarNoVa: (tampocoRegresa) => {
        setAusencia({
          tampocoRegresa,
          hora: new Date().toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }),
        });
        if (tampocoRegresa) setNoRegresa(true);
      },
      deshacerNoVa: () => {
        if (ausencia?.tampocoRegresa) setNoRegresa(false);
        setAusencia(null);
      },
      noRegresa,
      setNoRegresa,
    }),
    [direccion, ausencia, noRegresa],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEstado() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useEstado debe usarse dentro de EstadoProvider');
  return valor;
}
