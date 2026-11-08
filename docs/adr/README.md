# Registro de decisiones de arquitectura (ADR)

Cada decisión que cambia la forma del sistema queda escrita aquí, con su contexto y sus consecuencias, en formato [MADR](https://adr.github.io/madr/). Para una decisión nueva, copia [`template.md`](template.md) con el siguiente número.

| #                                       | Decisión                                                        | Estado    |
| --------------------------------------- | --------------------------------------------------------------- | --------- |
| [0001](0001-expo-android-mvp.md)        | Expo y Android como única plataforma del MVP                    | Aceptada  |
| [0002](0002-dos-apps-separadas.md)      | Dos apps separadas en vez de una con roles                      | Aceptada  |
| [0003](0003-ubicacion-segundo-plano.md) | Ubicación en segundo plano e ingesta por lotes HTTP             | Aceptada  |
| [0004](0004-osrm-vroom.md)              | Motor de optimización: OSRM + VROOM                             | Aceptada  |
| 0005                                    | Tiempo real con Socket.IO y Redis                               | Pendiente |
| 0006                                    | Permisos con CASL compartidos en `packages/domain`              | Pendiente |
| 0007                                    | PostGIS con Prisma usando `Unsupported` + SQL crudo encapsulado | Pendiente |
| 0008                                    | Proveedor de mapas y de geocodificación                         | Pendiente |
| [0009](0009-versiones-base.md)          | Versiones base: Node 26, TypeScript 6.0, NestJS 12, Expo SDK 58 | Aceptada  |
