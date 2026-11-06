/** Rol de una persona dentro de una organización (spec, sección 3). */
export const Role = {
  ADMIN: 'ADMIN',
  DRIVER: 'DRIVER',
  MONITOR: 'MONITOR',
  GUARDIAN: 'GUARDIAN',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLES: readonly Role[] = Object.values(Role);

/** Nombres de los roles en español de Colombia, compartidos por ambas apps. */
export const ROLE_LABELS: Readonly<Record<Role, string>> = {
  ADMIN: 'Administrador',
  DRIVER: 'Conductor',
  MONITOR: 'Acompañante',
  GUARDIAN: 'Acudiente',
};

/** Roles que atiende la app del conductor (ADR 0002). */
export const DRIVER_APP_ROLES: readonly Role[] = [Role.ADMIN, Role.DRIVER, Role.MONITOR];

/** Roles que atiende la app de acudientes (ADR 0002). */
export const GUARDIAN_APP_ROLES: readonly Role[] = [Role.GUARDIAN];
