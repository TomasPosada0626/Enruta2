# 0002 — Dos apps separadas en vez de una con roles

- **Estado:** Reemplazada por [ADR 0011](0011-una-app-con-seleccion-de-rol.md)
- **Fecha:** 2026-11-05

## Contexto

El conductor necesita compartir su ubicación en segundo plano. Google Play solo permite ese permiso cuando es parte de la función central de la app, y exige una declaración con video y una revisión más larga. Los acudientes, en cambio, solo consumen información y son el grupo más grande de usuarios.

## Opciones consideradas

1. **Una sola app con roles:** un solo código y una sola ficha en la tienda, pero toda la app pediría ubicación en segundo plano, incluso para los acudientes, que no la usan.
2. **Dos apps:** el permiso queda aislado en la app que lo necesita.

## Decisión

Dos apps en el monorepo:

| App               | Carpeta         | Identificador (propuesto) | Roles                  |
| ----------------- | --------------- | ------------------------- | ---------------------- |
| Enruta2 Conductor | `apps/driver`   | `co.enruta2.driver`       | ADMIN, DRIVER, MONITOR |
| Enruta2           | `apps/guardian` | `co.enruta2.guardian`     | GUARDIAN               |

La asignación de roles a cada app vive en `packages/domain` (`DRIVER_APP_ROLES`, `GUARDIAN_APP_ROLES`), con un test que garantiza que cada rol pertenece a exactamente una app.

## Consecuencias

- La app de acudientes pasa la revisión de Google Play sin declaración de ubicación en segundo plano.
- Menos permisos en el celular de los acudientes, en línea con la privacidad por diseño (spec, sección 7.1).
- Hay dos fichas en la tienda y **dos pruebas cerradas** (12 testers durante 14 días cada una, si la cuenta es personal).
- Parte de la interfaz se va a repetir entre las dos apps. Cuando aparezca la duplicación, se extrae a un paquete `packages/ui`.
- Una persona que es administradora en una organización y acudiente en otra usa las dos apps.
