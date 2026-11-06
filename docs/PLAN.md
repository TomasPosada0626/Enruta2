# Plan de acción

Cómo se va a ejecutar el roadmap de la [especificación](SPEC.md) (sección 16). Sigue el mismo orden de fases, con tres cambios:

1. Las pruebas de riesgo técnico van **antes** del CRUD.
2. Dos decisiones del modelo de datos se cierran **antes** de la Fase 1.
3. Los trámites que no dependen del código arrancan desde el primer día, porque son los que más tardan.

Los tiempos suponen una persona a medio tiempo. Total estimado: 16 a 18 semanas.

## Frentes sin código (en paralelo desde la semana 1)

- [ ] **Cuenta de Google Play Console.** La verificación de identidad tarda días y la prueba cerrada de 14 días es la ruta crítica del lanzamiento. Si se constituye empresa, evaluar una cuenta de organización: exige número D-U-N-S, pero no exige la prueba cerrada con 12 testers.
- [ ] **Empresa piloto.** Hablar con 3 a 5 empresas o conductores de transporte especial. Confirmar que la optimización y el "hoy no va" les importan, y conseguir las 15 direcciones reales para la prueba de la Fase 2.
- [ ] **Decreto 1048 de 2026.** Leer el texto oficial (no solo la nota de prensa) y anotar qué obligaciones cambian el modelo de datos.
- [ ] **Roles ante la Ley 1581.** Lo normal es que la empresa de transporte sea la _responsable_ del tratamiento y Enruta2 la _encargada_. Definir con qué base se registran los datos del estudiante antes de que el acudiente dé su autorización.

## Ajustes propuestos al spec (por decidir antes de la Fase 1)

- **Paradas compartidas.** Hoy `Stop` es por estudiante. Hermanos o vecinos de la misma unidad residencial quedarían como paradas duplicadas en el mismo punto. Propuesta: `Stop` = dirección, con `StopStudent`; recogido, entregado y no salió se marcan por estudiante.
- **Android 14+.** Además de la ubicación en segundo plano, Play Console pide declarar el tipo de servicio en primer plano (`location`). Agregarlo a la sección 14.
- **`LocationPing` particionado por día** desde la primera migración, para borrar por retención con `DROP` de particiones en vez de `DELETE` masivos (ADR 0007).
- **Prueba cerrada por app.** La app del conductor también necesita 12 testers; los acudientes del piloto solo cubren la suya.

## Etapas

| Etapa                                          | Duración | Estado     |
| ---------------------------------------------- | -------- | ---------- |
| 0. Fundaciones (Fase 0)                        | 1 sem    | Completada |
| 1. Pruebas de riesgo                           | 1 sem    | Pendiente  |
| 2. Datos, auth y permisos (Fase 1)             | 2–3 sem  | Pendiente  |
| 3. Paradas y optimización (Fase 2)             | 2–3 sem  | Pendiente  |
| 4. Recorrido en vivo (Fase 3)                  | 3 sem    | Pendiente  |
| 5. Eventos, notificaciones y "hoy no va" (4–5) | 3 sem    | Pendiente  |
| 6. Calidad, lanzamiento y piloto (Fase 6)      | ~4 sem   | Pendiente  |

### Etapa 0 — Fundaciones

- [x] Monorepo con pnpm y Turborepo, TypeScript estricto, ESLint y Prettier (`packages/config`)
- [x] `packages/domain` con roles, jornada, sentido y máquina de estados de `Trip`, con tests y cobertura mínima del 90 %
- [x] Docker Compose con PostGIS 3.6 (PostgreSQL 18) y Redis 8
- [x] API NestJS con `/health/live`, `/health/ready`, logs JSON con identificador de correlación y Swagger en `/docs`
- [x] Apps Expo (SDK 58) del conductor y de acudientes, importando `@enruta2/domain`
- [x] GitHub Actions: formato, lint, typecheck, tests y build
- [x] ADRs 0001 a 0003 (y 0009 sobre versiones base)
- [x] Abrir ambas apps en un dispositivo Android con Expo Go

### Etapa 1 — Pruebas de riesgo

Tres prototipos desechables que validan lo que podría obligar a cambiar el diseño:

- [ ] **Rastreo en segundo plano** en un celular real de gama media (Xiaomi o Samsung): 30 min con la pantalla apagada, cola SQLite y envío por lotes. Requiere un _development build_ (la ubicación en segundo plano no funciona en Expo Go).
- [ ] **OSRM y VROOM** con el Valle de Aburrá recortado con `osmium extract` (el extracto completo de Colombia necesita más memoria de la que Docker tiene en Windows). Meta: 15 paradas en menos de 2 s.
- [ ] **Geocodificación**: 20 direcciones reales tipo "Cra 43A # 1-50" contra 2 o 3 proveedores, para decidir el ADR 0008 con datos.

### Etapas 2 a 6

Siguen las fases 1 a 6 del spec. Notas:

- **Fase 1:** escribir primero el test de aceptación ("un acudiente no lee datos ajenos") con Testcontainers; define la forma de los guards y de CASL.
- **Fase 2:** la heurística de respaldo (vecino más cercano + 2-opt) se hace con TDD en `packages/domain`.
- **Fase 3:** incluye la pantalla de aviso de ubicación, que también se necesita para el video de Google Play.
- **Fases 4–5:** Expo Push requiere un proyecto de Firebase (FCM v1) con credenciales subidas a EAS. La idempotencia de notificaciones se garantiza con una restricción única en `NotificationLog`.
- **Fase 6:** la prueba cerrada de 14 días y el piloto de 2 semanas son el mismo periodo, con los acudientes de la ruta piloto como testers.
