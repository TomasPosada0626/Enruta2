# 0004 — Motor de optimización: OSRM + VROOM

- **Estado:** Aceptada (validada con la prueba de riesgo de la Etapa 1)
- **Fecha:** 2026-11-08

## Contexto

Cada ruta necesita el orden de sus paradas para un solo vehículo: en la ida, desde el punto de salida hasta el colegio; en la vuelta, desde el colegio y sin punto final. El objetivo es la ruta más rápida pasando por todas las paradas; la hora de entrada al colegio no es una restricción. Una ruta tiene unas 15 paradas y el cálculo debe tardar menos de 2 s (criterio de la Fase 2). Durante el recorrido también hacen falta tiempos de viaje por las vías reales para la hora estimada.

El piloto cubre el Valle de Aburrá completo: los 10 municipios, con sus zonas rurales.

Restricciones: proyecto personal sin presupuesto por uso, direcciones de menores de edad (Ley 1581) y un equipo de desarrollo con Windows, 7,8 GB de RAM y unos 4 GB para Docker.

## Opciones consideradas

1. **Google Route Optimization API:** sin infraestructura propia, pero con costo por cada cálculo y con las direcciones de los estudiantes saliendo hacia un tercero.
2. **OR-Tools en la API, con la matriz de tiempos de OSRM:** muy flexible, pero hay que modelar el problema a mano y no tiene bindings oficiales para Node.
3. **OSRM + VROOM en Docker:** código abierto, sin costo por uso. VROOM resuelve el problema de un vehículo con inicio, fin, tiempo de servicio y rutas abiertas, usando OSRM para los tiempos.

## Decisión

Opción 3:

- **OSRM** (perfil de carro, algoritmo MLD) sobre OpenStreetMap, y **VROOM** a través de vroom-express. Los dos corren en Docker Compose con el perfil `routing` (ver [`infra/routing`](../../infra/routing/README.md)).
- **Datos:** extracto de Colombia de Geofabrik, recortado a los límites de los 10 municipios del Valle de Aburrá con unos 3 km de margen (`-75.75,5.95,-75.19,6.54`). Antes del recorte se renumeran los nodos: sin eso, `osmium extract` pasa de 2 GB por el rango de IDs de OpenStreetMap, aunque el área sea pequeña.
- **Sin ventanas de tiempo:** se pide a VROOM la ruta de menor duración con todas las paradas obligatorias. Si se le pasa una ventana imposible, VROOM no informa que la ruta es inviable: deja paradas sin asignar para cumplirla (en una prueba, 6 de 15). Por eso un resultado con paradas sin asignar se trata como error, nunca como ruta válida.

## Mediciones

Escenario de [`fixtures/medellin.json`](../../infra/routing/fixtures/medellin.json): 15 puntos públicos repartidos por Medellín y el sur del valle, salida desde la Estación Itagüí y llegada a EAFIT, con 60 s de servicio por parada. Medido el 2026-11-08 en el equipo de desarrollo (Docker con 4 GB), en tres corridas de `pnpm routing:benchmark` (las dos primeras con el recorte inicial, un 2 % más pequeño).

| Medición                                 | Resultado                                              |
| ---------------------------------------- | ------------------------------------------------------ |
| Cálculo de la ida (5 por corrida)        | mediana 49–65 ms, máximo 119 ms                        |
| Cálculo de la vuelta, ruta abierta       | mediana 43–54 ms, máximo 73 ms                         |
| Matriz de tiempos de OSRM 17×17          | 41–56 ms                                               |
| Orden óptimo frente al orden de la lista | 125,7 frente a 169,0 min: ahorra 43 min (26 %) y 33 km |
| Paradas por fuera de la ruta             | 0                                                      |
| Memoria en reposo                        | OSRM 76 MB, VROOM 38 MB                                |

**Cobertura:** las cabeceras de los 10 municipios y los corregimientos de Santa Elena, San Antonio de Prado y San Sebastián de Palmitas quedan a menos de 50 m de una vía del mapa. De Barbosa a Caldas, OSRM calcula 62 km en 59 min.

**Preparación** (`pnpm routing:prepare`, sin contar la descarga): alrededor de 1 min con las imágenes ya descargadas. El pico de memoria por paso fue de 444 MB (OSRM extract, medido con un recorte un 2 % más pequeño). El recorte pesa 17 MB y los archivos de OSRM, unos 100 MB. OSRM no descartó ninguna restricción de giro tras la renumeración.

## Consecuencias

- El peor caso queda más de 15 veces por debajo del límite de 2 s: la optimización puede responder dentro de la misma petición HTTP, sin cola de trabajos.
- Sin costo por uso y sin enviar las direcciones de los estudiantes a terceros.
- **Tiempos sin tráfico:** OSRM calcula con velocidades de vía libre. Las horas estimadas antes de salir serán optimistas en hora pico; durante el recorrido se corrigen con el GPS (sección 12.2 del spec). En el piloto conviene medir el desfase. Si el tráfico cambia el mejor orden, VROOM acepta una matriz de tiempos propia: se le podría pasar una con tráfico sin cambiar de motor.
- **Cobertura limitada al recorte:** una parada fuera del Valle de Aburrá se ajusta a la vía más cercana dentro del recorte, aunque esté lejos. La API debe rechazar paradas cuya distancia a la vía supere un umbral (en las pruebas, la mayor fue de 179 m).
- Los IDs de nodo del recorte no son los de OpenStreetMap (los de vías y relaciones sí). OSRM no los necesita.
- El mapa hay que actualizarlo de vez en cuando: borrar el extracto y volver a correr `routing:prepare`.
- **Pendiente:** repetir la medición en la Fase 2 con las 15 direcciones reales de la empresa piloto.
