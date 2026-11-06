import { describe, expect, it } from 'vitest';
import { DomainError, InvalidTransitionError } from '../errors.js';
import {
  TripStatus,
  canTransitionTrip,
  isTripFinal,
  isTripLive,
  transitionTrip,
} from './trip-status.js';

const { SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED } = TripStatus;

describe('máquina de estados de Trip', () => {
  it.each([
    [SCHEDULED, IN_PROGRESS],
    [SCHEDULED, CANCELLED],
    [IN_PROGRESS, COMPLETED],
  ])('permite %s → %s', (from, to) => {
    expect(canTransitionTrip(from, to)).toBe(true);
    expect(transitionTrip(from, to)).toBe(to);
  });

  it.each([
    [SCHEDULED, COMPLETED],
    [IN_PROGRESS, SCHEDULED],
    [IN_PROGRESS, CANCELLED],
    [COMPLETED, IN_PROGRESS],
    [CANCELLED, SCHEDULED],
    [SCHEDULED, SCHEDULED],
  ])('rechaza %s → %s', (from, to) => {
    expect(canTransitionTrip(from, to)).toBe(false);
    expect(() => transitionTrip(from, to)).toThrow(InvalidTransitionError);
  });

  it('el error de transición es un error de dominio con código y estados', () => {
    try {
      transitionTrip(COMPLETED, IN_PROGRESS);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect(error).toMatchObject({
        name: 'InvalidTransitionError',
        code: 'INVALID_TRANSITION',
        entity: 'Trip',
        from: COMPLETED,
        to: IN_PROGRESS,
      });
    }
  });

  it('solo COMPLETED y CANCELLED son estados finales', () => {
    expect(isTripFinal(COMPLETED)).toBe(true);
    expect(isTripFinal(CANCELLED)).toBe(true);
    expect(isTripFinal(SCHEDULED)).toBe(false);
    expect(isTripFinal(IN_PROGRESS)).toBe(false);
  });

  it('la ubicación en vivo solo existe con el recorrido en curso', () => {
    expect(isTripLive(IN_PROGRESS)).toBe(true);
    for (const status of [SCHEDULED, COMPLETED, CANCELLED]) {
      expect(isTripLive(status)).toBe(false);
    }
  });
});
