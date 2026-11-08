# 0004 — Motor de optimización: OSRM + VROOM

- **Estado:** Aceptada (validada con la prueba de riesgo de la Etapa 1)
- **Fecha:** 2026-11-08

## Contexto

Cada ruta necesita el orden de sus paradas para un solo vehículo: en la ida, desde el punto de salida hasta el colegio, llegando antes de la hora de entrada; en la vuelta, desde el colegio y sin punto final. Una ruta tiene unas 15 paradas y el cálculo debe tardar menos de 2 s (criterio de la Fase 2). Durante el recorrido también hacen falta tiempos de viaje por las vías reales para la hora estimada.

Restricciones: proyecto personal sin presupuesto por uso, direcciones de menores de edad (Ley 1581) y un equipo de desarrollo con Windows, 7,8 GB de RAM y unos 4 GB para Docker.

## Opciones consideradas

1. **Google Route Optimization API:** sin infraestructura propia, pero con costo por cada cálculo y con las direcciones de los estudiantes saliendo hacia un tercero.
2. **OR-Tools en la API, con la matriz de tiempos de OSRM:** muy flexible, pero hay que modelar el problema a mano y no tiene bindings oficiales para Node.
3. **OSRM + VROOM en Docker:** código abierto, sin costo por uso. VROOM resuelve el problema de un vehículo con inicio, fin, tiempo de servicio y rutas abiertas, usando OSRM para los tiempos.

## Decisión

Opción 3:

- **OSRM** (perfil de carro, algoritmo MLD) sobre OpenStreetMap, y **VROOM** a través de vroom-express. Los dos corren en Docker Compose con el perfil `routing` (ver [`infra/routing`](../../infra/routing/README.md)).
- **Datos:** extracto de Colombia de Geofabrik, recortado al Valle de Aburrá con osmium. Antes del recorte se renumeran los nodos: sin eso, `osmium extract` pasa de 2 GB por el rango de IDs de OpenStreetMap, aunque el área sea pequeña.
- **Viabilidad de la ida:** Enruta2 **no** le pasa a VROOM la hora de entrada como ventana del vehículo. Con una hora imposible, VROOM no informa que la ruta es inviable: deja paradas sin asignar para cumplirla (en la prueba, 6 de 15). Por eso se pide el orden de menor duración con todas las paradas, y `feasible = llegada ≤ hora de entrada − margen`. Con el inicio y el fin fijos, minimizar la duración es lo mismo que llegar lo antes posible, así que la ventana no aporta un mejor orden.

## Mediciones

Escenario de [`fixtures/medellin.json`](../../infra/routing/fixtures/medellin.json): 15 puntos públicos repartidos por todo el valle, salida desde la Estación Itagüí y llegada a EAFIT, con 60 s de servicio por parada. Medido el 2026-11-08 en el equipo de desarrollo (Docker con 4 GB).

| Medición                                    | Resultado                                                 |
| ------------------------------------------- | --------------------------------------------------------- |
| Cálculo de la ida (5 corridas)              | mediana 49–61 ms, máximo 95 ms                            |
| Cálculo de la vuelta, ruta abierta          | mediana 43–53 ms, máximo 73 ms                            |
| Matriz de tiempos de OSRM 17×17             | 41–56 ms                                                  |
| Orden óptimo frente al orden de la lista    | 125,7 frente a 169,0 min: ahorra 43 min (26 %) y 33 km    |
| Hora de entrada alcanzable                  | 0 paradas sin asignar                                     |
| Hora de entrada imposible (60 % del óptimo) | 6 de 15 paradas sin asignar; ningún aviso de inviabilidad |
| Memoria en reposo                           | OSRM 76 MB, VROOM 38 MB                                   |

Preparación de los datos (`pnpm routing:prepare`, sin contar la descarga): unos 2 min en total, con un pico de memoria por paso de 444 MB (OSRM extract). El recorte tiene 2,3 millones de nodos y 310 000 vías; OSRM procesó 909 restricciones de giro sin descartar ninguna. Los archivos de OSRM ocupan unos 100 MB.

## Consecuencias

- El peor caso queda 20 veces por debajo del límite de 2 s: la optimización puede responder dentro de la misma petición HTTP, sin cola de trabajos.
- Sin costo por uso y sin enviar las direcciones de los estudiantes a terceros.
- **Tiempos sin tráfico:** OSRM calcula con velocidades de vía libre. Las horas estimadas antes de salir serán optimistas en hora pico; durante el recorrido se corrigen con el GPS (sección 12.2 del spec). En el piloto conviene medir el desfase y evaluar un factor de corrección.
- **Cobertura limitada al recorte:** una parada fuera del Valle de Aburrá se ajusta a la vía más cercana dentro del recorte, aunque esté lejos. La API debe rechazar paradas cuya distancia a la vía supere un umbral (en la prueba, la mayor fue de 179 m).
- Los IDs de nodo del recorte no son los de OpenStreetMap (los de vías y relaciones sí). OSRM no los necesita.
- El mapa hay que actualizarlo de vez en cuando: borrar el extracto y volver a correr `routing:prepare`.
- **Pendiente:** repetir la medición en la Fase 2 con las 15 direcciones reales de la empresa piloto, que serán más compactas que este escenario.
