import { describe, expect, it } from 'vitest';
import { DRIVER_APP_ROLES, GUARDIAN_APP_ROLES, ROLE_LABELS, ROLES, Role } from './roles.js';

describe('roles', () => {
  it('cada rol pertenece a exactamente una de las dos apps', () => {
    for (const role of ROLES) {
      const apps = [DRIVER_APP_ROLES.includes(role), GUARDIAN_APP_ROLES.includes(role)];
      expect(apps.filter(Boolean)).toHaveLength(1);
    }
  });

  it('la app de acudientes no atiende roles que comparten ubicación', () => {
    expect(GUARDIAN_APP_ROLES).not.toContain(Role.DRIVER);
    expect(GUARDIAN_APP_ROLES).not.toContain(Role.MONITOR);
  });

  it('todos los roles tienen nombre en español', () => {
    for (const role of ROLES) {
      expect(ROLE_LABELS[role]).toBeTruthy();
    }
  });
});
