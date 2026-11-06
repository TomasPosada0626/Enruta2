# 0001 — Expo y Android como única plataforma del MVP

- **Estado:** Aceptada
- **Fecha:** 2026-11-05

## Contexto

El MVP necesita ubicación en segundo plano con la pantalla apagada, notificaciones push y mapas, en celulares Android de gama media, que son la gran mayoría en Colombia entre conductores y acudientes. El proyecto lo desarrolla una sola persona y la API ya está en TypeScript.

## Opciones consideradas

1. **PWA:** sin instalación, pero el navegador no permite rastreo confiable en segundo plano ni notificaciones consistentes en Android.
2. **Flutter:** buen rendimiento, pero obliga a un segundo lenguaje (Dart) y no comparte código con la API.
3. **Nativo (Kotlin):** máximo control, pero mucho más lento de construir y sin reutilizar código.
4. **React Native con Expo:** TypeScript de punta a punta, módulos mantenidos para ubicación, tareas en segundo plano y notificaciones, y builds en la nube con EAS.

## Decisión

React Native con **Expo SDK 58** (React Native 0.88, React 19.3), publicando **solo Android** en el MVP. Las dos apps ya tienen identificador de iOS (`bundleIdentifier`) para no cerrar esa puerta, pero iOS no se publica.

## Consecuencias

- Las reglas de negocio se comparten entre la API y las apps a través de `packages/domain`.
- Las carpetas `android/` e `ios/` no se versionan: Expo las genera desde `app.json` (Continuous Native Generation).
- **Expo Go sirve solo para la Fase 0.** La ubicación en segundo plano exige un _development build_ (EAS o `expo run:android` con Android Studio). Se configura en la etapa de pruebas de riesgo, junto con `expo-dev-client` y `eas.json`.
- Cada SDK de Expo trae cambios incompatibles: las actualizaciones se hacen con `expo install --fix` y `expo-doctor`, una versión a la vez.
- Los identificadores `co.enruta2.driver` y `co.enruta2.guardian` siguen siendo una propuesta: se pueden cambiar hasta la primera publicación en Google Play, después no.
