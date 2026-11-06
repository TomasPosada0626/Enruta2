# 0009 — Versiones base: Node 26, TypeScript 6.0, NestJS 12, Expo SDK 58

- **Estado:** Aceptada
- **Fecha:** 2026-11-05

## Contexto

Al crear el monorepo (noviembre de 2026), varias herramientas tenían versiones mayores nuevas que todavía no son compatibles entre sí. Elegir siempre "la última" rompía la instalación o el linting.

## Decisión

| Herramienta | Versión          | Motivo                                                                                                                           |
| ----------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Node.js     | 26 (LTS)         | Versión LTS vigente, compatible con Expo SDK 58, NestJS 12 y Vitest 5. Fijada en `.nvmrc` para el CI.                            |
| pnpm        | 9.15             | Fijada en `packageManager` para que local y CI usen la misma.                                                                    |
| TypeScript  | 6.0 (no 7.x)     | `typescript-eslint` acepta `<6.1` y `@nestjs/swagger` acepta `^5.5 \|\| ^6.0`. Expo SDK 58 también usa 6.0.                      |
| ESLint      | 9 (no 10)        | `eslint-plugin-react` y `eslint-plugin-import`, que usa `eslint-config-expo`, aún no aceptan ESLint 10.                          |
| NestJS      | 12               | Publicado como ES modules: la API es `"type": "module"` y los imports llevan extensión `.js`.                                    |
| Vitest      | 5 (con Vite 8)   | Las pruebas de NestJS funcionan sin plugin de SWC: la inyección de dependencias por constructor se verificó con las pruebas e2e. |
| Expo        | SDK 58           | React Native 0.88 y React 19.3.                                                                                                  |
| PostgreSQL  | 18 + PostGIS 3.6 | Versiones estables más recientes de la imagen `postgis/postgis`.                                                                 |

Las versiones compartidas viven en el `catalog` de `pnpm-workspace.yaml`.

## Consecuencias

- `packages/domain` y la API son ES modules; Metro empaqueta `@enruta2/domain` sin configuración extra.
- TypeScript 6 cambió valores por defecto (por ejemplo, `types` vacío): cada `tsconfig` declara explícitamente los tipos que usa.
- VS Code debe usar el TypeScript del repo (`.vscode/settings.json` apunta a `node_modules/typescript/lib`), no el que trae el editor o una extensión nightly.
- **Revisar** cuando `typescript-eslint` y `@nestjs/swagger` acepten TypeScript 7, y cuando los plugins de Expo acepten ESLint 10.
