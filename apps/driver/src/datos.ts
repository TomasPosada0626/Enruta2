// Datos de ejemplo del prototipo. Nombres, direcciones y horas son ficticios.

export type Estudiante = { id: string; nombre: string };

export type Parada = {
  id: string;
  direccion: string;
  complemento: string;
  indicaciones?: string;
  estudiantes: Estudiante[];
  /** Minutos estimados desde la parada anterior (en el prototipo no se calculan). */
  minutos: number;
  lat: number;
  lon: number;
};

export const RUTA = {
  nombre: 'Ruta Norte',
  salidaIda: '~6:00 a. m.',
  salidaVuelta: '~12:30 p. m.',
};

export const CONDUCTOR = { nombre: 'Luis', correo: 'luis.ramirez@correo.com' };

const est = (id: string, nombre: string): Estudiante => ({ id, nombre });

export const ESTUDIANTES = {
  pablo: est('pablo', 'Pablo Pérez'),
  sara: est('sara', 'Sara Pérez'),
  samuel: est('samuel', 'Samuel Ochoa'),
  valentina: est('valentina', 'Valentina Ríos'),
  isabella: est('isabella', 'Isabella Mejía'),
  tomas: est('tomas', 'Tomás Restrepo'),
  mariana: est('mariana', 'Mariana Zapata'),
  martin: est('martin', 'Martín Cardona'),
  sofia: est('sofia', 'Sofía Henao'),
  jeronimo: est('jeronimo', 'Jerónimo Gómez'),
  luciana: est('luciana', 'Luciana Correa'),
  simon: est('simon', 'Simón Arias'),
  juanjose: est('juanjose', 'Juan José Arango'),
  emilia: est('emilia', 'Emilia Vélez'),
  mateo: est('mateo', 'Mateo Gil'),
} as const;

const E = ESTUDIANTES;

/** Ida de hoy: Mateo Gil no va (su acudiente avisó), así que no aparece. */
export const PARADAS_IDA: Parada[] = [
  {
    id: 'p1',
    direccion: 'Calle 7 Sur # 42-70',
    complemento: 'Casa 12 · El Poblado',
    estudiantes: [E.samuel],
    minutos: 5,
    lat: 6.1985,
    lon: -75.5676,
  },
  {
    id: 'p2',
    direccion: 'Carrera 43A # 1-50',
    complemento: 'Torre 2, apto 504 · El Poblado',
    indicaciones: 'Portería principal',
    estudiantes: [E.pablo, E.sara],
    minutos: 6,
    lat: 6.2087,
    lon: -75.5677,
  },
  {
    id: 'p3',
    direccion: 'Calle 9 # 39-15',
    complemento: 'Apto 301 · Manila',
    indicaciones: 'Timbre del 301',
    estudiantes: [E.valentina, E.isabella],
    minutos: 4,
    lat: 6.2105,
    lon: -75.5712,
  },
  {
    id: 'p4',
    direccion: 'Carrera 37 # 10A-30',
    complemento: 'Unidad Los Balsos · El Poblado',
    indicaciones: 'Entrada vehicular',
    estudiantes: [E.tomas],
    minutos: 5,
    lat: 6.2003,
    lon: -75.5783,
  },
];

/** Vuelta: las paradas se arman con los que abordaron en el colegio. */
export const PARADAS_VUELTA: Parada[] = [
  { ...PARADAS_IDA[3]!, id: 'v1', minutos: 7 },
  { ...PARADAS_IDA[2]!, id: 'v2', minutos: 4 },
  { ...PARADAS_IDA[1]!, id: 'v3', minutos: 6 },
  {
    id: 'v4',
    direccion: 'Calle 10 # 40-20',
    complemento: 'Apto 802 · El Poblado',
    estudiantes: [E.mariana, E.martin],
    minutos: 5,
    lat: 6.2068,
    lon: -75.5701,
  },
  {
    id: 'v5',
    direccion: 'Carrera 35 # 8A-40',
    complemento: 'Unidad El Remanso · El Poblado',
    indicaciones: 'Portería sobre la carrera 35',
    estudiantes: [E.sofia, E.jeronimo, E.luciana],
    minutos: 6,
    lat: 6.2121,
    lon: -75.5655,
  },
  { ...PARADAS_IDA[0]!, id: 'v6', estudiantes: [E.samuel], minutos: 8 },
  {
    id: 'v7',
    direccion: 'Calle 5A # 30-12',
    complemento: 'Casa 4 · Castropol',
    estudiantes: [E.simon, E.juanjose, E.emilia],
    minutos: 5,
    lat: 6.2034,
    lon: -75.5629,
  },
];

/** Inscritos para la vuelta de hoy. Mateo Gil no regresa en la ruta. */
export const INSCRITOS_VUELTA = [
  E.pablo,
  E.valentina,
  E.samuel,
  E.isabella,
  E.tomas,
  E.mariana,
  E.martin,
  E.sofia,
  E.jeronimo,
  E.luciana,
  E.simon,
  E.sara,
  E.juanjose,
  E.emilia,
];

/** Sara no fue a la ida en este ejemplo, y su acudiente no marcó "tampoco regresa". */
export const NO_FUE_A_LA_IDA = new Set<string>([E.sara.id]);

export const ABORDARON_AL_INICIO = new Set<string>(
  INSCRITOS_VUELTA.filter((e) => ![E.sara.id, E.juanjose.id, E.emilia.id].includes(e.id)).map(
    (e) => e.id,
  ),
);
