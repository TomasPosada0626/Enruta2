import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

// Datos de ejemplo del prototipo. Nombres, colegios, direcciones y teléfonos son ficticios.

export const ACUDIENTE = { nombre: 'Laura', apellido: 'Gómez', correo: 'laura.gomez@correo.com' };
/** Número ficticio: en el prototipo solo abre el marcador. */
export const TELEFONO_DE_PRUEBA = '+573000000000';
/** Código de la ruta de ejemplo para inscribirse. */
export const CODIGO_DE_PRUEBA = 'K7P2QX';

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

type Persona = { nombre: string; telefono: string };

/** enVivo: el recorrido de hoy ya salió. programada: sale más tarde. pendiente: inscripción sin aprobar. */
export type EstadoHijo = 'enVivo' | 'programada' | 'pendiente';

export type Hijo = {
  id: string;
  nombre: string;
  apellido: string;
  ruta: string;
  colegio: string;
  jornada: string;
  estado: EstadoHijo;
  salidaIda: string;
  salidaVuelta: string;
  paradaActual: number;
  totalParadas: number;
  tuParada: number;
  minutos: number;
  direccion: Direccion;
  diasIda: boolean[];
  diasRegreso: boolean[];
  conductor: Persona;
  acompanante: Persona;
  acudientes: { nombre: string; principal: boolean }[];
};

const CASA: Direccion = {
  municipio: 'Medellín',
  barrio: 'El Poblado',
  via: 'Carrera',
  numero: '43A',
  cruce: '1',
  placa: '50',
  complemento: 'Torre 2, apto 504',
  indicaciones: 'Portería principal',
};

const HIJOS_INICIALES: Hijo[] = [
  {
    id: 'pablo',
    nombre: 'Pablo',
    apellido: 'Pérez',
    ruta: 'Ruta Norte',
    colegio: 'Colegio Campestre del Valle',
    jornada: 'Jornada de la mañana',
    estado: 'enVivo',
    salidaIda: '~6:00 a. m.',
    salidaVuelta: '~12:30 p. m.',
    paradaActual: 3,
    totalParadas: 12,
    tuParada: 7,
    minutos: 8,
    direccion: CASA,
    diasIda: [true, true, true, true, true],
    diasRegreso: [true, true, true, false, false],
    conductor: { nombre: 'Luis', telefono: TELEFONO_DE_PRUEBA },
    acompanante: { nombre: 'Ana', telefono: TELEFONO_DE_PRUEBA },
    acudientes: [
      { nombre: 'Laura Gómez', principal: true },
      { nombre: 'Andrés Pérez', principal: false },
    ],
  },
  {
    id: 'emma',
    nombre: 'Emma',
    apellido: 'Pérez',
    ruta: 'Ruta Sur',
    colegio: 'Liceo Los Almendros',
    jornada: 'Jornada única',
    estado: 'programada',
    salidaIda: '6:40 a. m.',
    salidaVuelta: '~2:15 p. m.',
    paradaActual: 0,
    totalParadas: 9,
    tuParada: 4,
    minutos: 22,
    direccion: CASA,
    diasIda: [true, true, true, true, true],
    diasRegreso: [true, true, true, true, true],
    conductor: { nombre: 'Jorge', telefono: TELEFONO_DE_PRUEBA },
    acompanante: { nombre: 'Marta', telefono: TELEFONO_DE_PRUEBA },
    acudientes: [{ nombre: 'Laura Gómez', principal: true }],
  },
];

type Ausencia = { tampocoRegresa: boolean; hora: string };

export type Borrador = {
  codigo: string;
  nombre: string;
  apellido: string;
  direccion: Direccion;
  diasIda: boolean[];
  diasRegreso: boolean[];
};

const BORRADOR_VACIO: Borrador = {
  codigo: CODIGO_DE_PRUEBA,
  nombre: '',
  apellido: 'Pérez',
  direccion: CASA,
  diasIda: [true, true, true, true, true],
  diasRegreso: [true, true, true, false, false],
};

type Estado = {
  hijos: Hijo[];
  /** Hijo que se está viendo en "En vivo". */
  hijo: Hijo;
  seleccionar: (id: string) => void;
  ausencias: Record<string, Ausencia | undefined>;
  avisarNoVa: (id: string, tampocoRegresa: boolean) => void;
  deshacerNoVa: (id: string) => void;
  noRegresa: Record<string, boolean | undefined>;
  setNoRegresa: (id: string, valor: boolean) => void;
  borrador: Borrador;
  setBorrador: (cambio: Partial<Borrador>) => void;
  setDireccionBorrador: (cambio: Partial<Direccion>) => void;
  /** Crea el hijo como inscripción pendiente de aprobación y lo deja seleccionado. */
  enviarInscripcion: () => void;
  reiniciar: () => void;
};

const Contexto = createContext<Estado | null>(null);

const horaActual = () =>
  new Date().toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });

/** Estado del prototipo de acudientes. En las fases 1 y 5 lo reemplaza la API. */
export function EstadoProvider({ children }: { children: ReactNode }) {
  const [hijos, setHijos] = useState<Hijo[]>(HIJOS_INICIALES);
  const [seleccionadoId, setSeleccionadoId] = useState(HIJOS_INICIALES[0]!.id);
  const [ausencias, setAusencias] = useState<Record<string, Ausencia | undefined>>({});
  const [noRegresa, setNoRegresaTodos] = useState<Record<string, boolean | undefined>>({});
  const [borrador, setBorradorCompleto] = useState<Borrador>(BORRADOR_VACIO);

  const valor = useMemo<Estado>(() => {
    const hijo = hijos.find((h) => h.id === seleccionadoId) ?? hijos[0]!;
    return {
      hijos,
      hijo,
      seleccionar: setSeleccionadoId,
      ausencias,
      avisarNoVa: (id, tampocoRegresa) => {
        setAusencias((a) => ({ ...a, [id]: { tampocoRegresa, hora: horaActual() } }));
        if (tampocoRegresa) setNoRegresaTodos((n) => ({ ...n, [id]: true }));
      },
      deshacerNoVa: (id) => {
        if (ausencias[id]?.tampocoRegresa) setNoRegresaTodos((n) => ({ ...n, [id]: false }));
        setAusencias((a) => ({ ...a, [id]: undefined }));
      },
      noRegresa,
      setNoRegresa: (id, v) => setNoRegresaTodos((n) => ({ ...n, [id]: v })),
      borrador,
      setBorrador: (cambio) => setBorradorCompleto((b) => ({ ...b, ...cambio })),
      setDireccionBorrador: (cambio) =>
        setBorradorCompleto((b) => ({ ...b, direccion: { ...b.direccion, ...cambio } })),
      enviarInscripcion: () => {
        const id = `${borrador.nombre.trim().toLowerCase() || 'hijo'}-${hijos.length + 1}`;
        const nuevo: Hijo = {
          ...HIJOS_INICIALES[0]!,
          id,
          nombre: borrador.nombre.trim() || 'Tu hijo',
          apellido: borrador.apellido.trim(),
          estado: 'pendiente',
          direccion: borrador.direccion,
          diasIda: borrador.diasIda,
          diasRegreso: borrador.diasRegreso,
          acudientes: [{ nombre: `${ACUDIENTE.nombre} ${ACUDIENTE.apellido}`, principal: true }],
        };
        setHijos((h) => [...h, nuevo]);
        setSeleccionadoId(id);
        setBorradorCompleto(BORRADOR_VACIO);
      },
      reiniciar: () => {
        setHijos(HIJOS_INICIALES);
        setSeleccionadoId(HIJOS_INICIALES[0]!.id);
        setAusencias({});
        setNoRegresaTodos({});
        setBorradorCompleto(BORRADOR_VACIO);
      },
    };
  }, [hijos, seleccionadoId, ausencias, noRegresa, borrador]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEstado() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useEstado debe usarse dentro de EstadoProvider');
  return valor;
}
