# 0003 — Ubicación en segundo plano e ingesta por lotes HTTP

- **Estado:** Aceptada (se valida con el prototipo de la etapa de pruebas de riesgo)
- **Fecha:** 2026-11-05

## Contexto

Durante un recorrido, la app del conductor debe enviar su posición aunque la pantalla esté apagada, durante 30 a 90 minutos, en celulares de gama media y con señal intermitente. Android limita fuertemente el trabajo en segundo plano (Doze, App Standby), y algunos fabricantes comunes en Colombia (Xiaomi, Samsung, Huawei) cierran procesos de forma todavía más agresiva.

## Opciones consideradas

1. **Socket abierto desde la tarea en segundo plano:** baja latencia, pero Android suspende o corta los sockets en segundo plano y se pierden puntos sin aviso.
2. **Geocercas del celular** para detectar llegadas: ahorra batería, pero son imprecisas y no dan la hora estimada.
3. **Rastreo con servicio en primer plano y envío por lotes HTTP con reintento.**

## Decisión

- `expo-location` con `expo-task-manager`, usando un **servicio en primer plano de Android** de tipo `location`, con notificación fija "Recorrido activo" mientras dura el recorrido.
- **Frecuencia adaptativa:** cada ~5 s o ~25 m en movimiento; menos frecuente con el vehículo detenido.
- **Cola local en SQLite:** cada punto se guarda primero en el celular, con un identificador generado en el cliente y la hora en que se tomó (`recordedAt`).
- **Envío por lotes** a `POST /trips/:tripId/locations`, con reintento y espera exponencial. El servidor ignora identificadores repetidos (ingesta idempotente) y ordena por `recordedAt`, así que reenviar un lote nunca duplica puntos.
- La detección de "va llegando" y "llegó" se hace **en el servidor** a partir de los puntos, no en el celular.
- El rastreo solo existe con el recorrido en curso (`isTripLive` en `packages/domain`).

## Consecuencias

- Tolera pérdidas de señal sin perder puntos ni el orden.
- La latencia hacia los acudientes depende del tamaño del lote (unos segundos), aceptable para una hora estimada que se recalcula cada ~30 s.
- Google Play exige: declaración de ubicación en segundo plano con video, declaración del tipo de servicio en primer plano (Android 14+) y una pantalla de aviso visible **antes** de pedir el permiso.
- Hay que guiar al conductor para excluir la app de la optimización de batería en los fabricantes más agresivos.
- **Validación:** el prototipo debe rastrear 30 min con la pantalla apagada en un Xiaomi o Samsung real, sin cortes. Si falla, esta decisión se revisa antes de la Fase 3.
