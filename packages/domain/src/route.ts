/** Jornada de una ruta: mañana o tarde. */
export const Shift = {
  AM: 'AM',
  PM: 'PM',
} as const;

export type Shift = (typeof Shift)[keyof typeof Shift];

/** Sentido de una ruta: ida (casas → colegio) o vuelta (colegio → casas). */
export const Direction = {
  TO_SCHOOL: 'TO_SCHOOL',
  TO_HOME: 'TO_HOME',
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];
