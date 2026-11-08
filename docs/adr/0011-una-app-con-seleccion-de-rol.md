# 0011 — Una sola app con selección de rol

- **Estado:** Aceptada
- **Fecha:** 2026-11-08
- **Reemplaza a:** [ADR 0002](0002-dos-apps-separadas.md)

## Contexto

El [ADR 0002](0002-dos-apps-separadas.md) separó el MVP en dos apps para que solo la del conductor pidiera ubicación en segundo plano. Al construir el prototipo aparecieron los costos de esa separación:

- Dos APK que instalar, dos canales de actualización OTA, dos fichas en Google Play y **dos pruebas cerradas** de 14 días con 12 testers cada una (la del conductor no tiene de dónde sacar 12 testers).
- La empresa piloto quiere repartir **un solo enlace o código QR** a conductores, acompañantes y acudientes.
- Las dos apps comparten casi toda la interfaz (`packages/ui`) y la misma API.

## Opciones consideradas

1. **Mantener dos apps** (ADR 0002).
2. **Una sola app con selección de rol:** la primera pantalla pregunta "¿Cómo usas Enruta2?" y lleva al inicio de sesión del acudiente o del conductor.

## Decisión

Opción 2. Una sola app en `apps/mobile`, con identificador `co.enruta2.app` y dos modos:

| Modo      | Rutas de Expo Router | Roles                  | Pestañas                                   |
| --------- | -------------------- | ---------------------- | ------------------------------------------ |
| Acudiente | `app/acudiente/*`    | GUARDIAN               | En vivo, Hijos, Avisos, Cuenta             |
| Conductor | `app/conductor/*`    | ADMIN, DRIVER, MONITOR | Hoy, Recorrido, Inscripciones, Avisos, Más |

La asignación de roles a cada modo sigue en `packages/domain` (`DRIVER_APP_ROLES`, `GUARDIAN_APP_ROLES`), con el test que garantiza que cada rol pertenece a exactamente un modo.

Para conservar lo que buscaba el ADR 0002:

- El permiso de ubicación (en primer plano y en segundo plano) **solo se pide en el modo conductor**, al iniciar el primer recorrido y después de la pantalla de aviso de la sección 14.1 del spec. Un acudiente nunca ve esa solicitud.
- La API decide el modo por el rol de la membresía, no por la pantalla que se eligió al abrir la app.

## Consecuencias

- Un APK, un canal de EAS Update (`preview`) y una ficha en Google Play. La prueba cerrada se cubre con los acudientes de la ruta piloto.
- La declaración de ubicación en segundo plano en Play Console cubre la app completa. La revisión es más estricta que la de una app de acudientes sola: el video debe mostrar el modo conductor y la política de privacidad debe explicar que los acudientes no comparten su ubicación.
- El manifiesto de Android incluye los permisos de ubicación también en los celulares de los acudientes, aunque nunca se soliciten.
- Una persona que es administradora en una organización y acudiente en otra usa la misma app y cambia de modo cerrando sesión.
