/** Error de una regla de negocio. La API lo traduce a una respuesta HTTP 4xx. */
export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

/** Se intentó mover una entidad a un estado que su máquina de estados no permite. */
export class InvalidTransitionError extends DomainError {
  constructor(
    readonly entity: string,
    readonly from: string,
    readonly to: string,
  ) {
    super('INVALID_TRANSITION', `${entity}: transición inválida de ${from} a ${to}`);
  }
}
