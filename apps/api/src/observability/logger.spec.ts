import type { IncomingMessage, ServerResponse } from 'node:http';
import { describe, expect, it } from 'vitest';
import { REQUEST_ID_HEADER, resolveRequestId } from './logger.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function call(incoming?: string | string[]) {
  const headers = new Map<string, unknown>();
  const req = { headers: incoming === undefined ? {} : { [REQUEST_ID_HEADER]: incoming } };
  const res = { setHeader: (name: string, value: unknown) => headers.set(name, value) };
  const id = resolveRequestId(req as IncomingMessage, res as unknown as ServerResponse);
  return { id, echoed: headers.get(REQUEST_ID_HEADER) };
}

describe('resolveRequestId', () => {
  it('reusa el identificador del cliente y lo devuelve en la respuesta', () => {
    expect(call('app-driver-123')).toEqual({ id: 'app-driver-123', echoed: 'app-driver-123' });
  });

  it('genera un UUID cuando el cliente no envía identificador', () => {
    const { id, echoed } = call();
    expect(id).toMatch(UUID);
    expect(echoed).toBe(id);
  });

  it.each([
    ['con salto de línea (inyección en logs)', 'abc\n{"level":60}'],
    ['demasiado largo', 'a'.repeat(65)],
    ['repetido en varios encabezados', ['a', 'b']],
  ])('descarta un identificador %s', (_caso, incoming) => {
    expect(call(incoming).id).toMatch(UUID);
  });
});
