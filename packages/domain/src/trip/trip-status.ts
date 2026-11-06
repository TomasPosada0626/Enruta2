import { InvalidTransitionError } from '../errors.js';

/** Estado de un recorrido (spec, sección 10.1). */
export const TripStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type TripStatus = (typeof TripStatus)[keyof typeof TripStatus];

const TRANSITIONS: Readonly<Record<TripStatus, readonly TripStatus[]>> = {
  SCHEDULED: [TripStatus.IN_PROGRESS, TripStatus.CANCELLED],
  IN_PROGRESS: [TripStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionTrip(from: TripStatus, to: TripStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Devuelve el nuevo estado o lanza `InvalidTransitionError` si la transición no está permitida. */
export function transitionTrip(from: TripStatus, to: TripStatus): TripStatus {
  if (!canTransitionTrip(from, to)) {
    throw new InvalidTransitionError('Trip', from, to);
  }
  return to;
}

/** Un recorrido terminado ya no acepta cambios de estado. */
export function isTripFinal(status: TripStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

/** La ubicación en vivo solo existe mientras el recorrido está en curso (spec, sección 7.1). */
export function isTripLive(status: TripStatus): boolean {
  return status === TripStatus.IN_PROGRESS;
}
