# Ruteo: OSRM + VROOM

Motor de tiempos de viaje (OSRM) y de optimización del orden de paradas (VROOM) sobre el mapa de OpenStreetMap. La decisión y sus mediciones están en el [ADR 0004](../../docs/adr/0004-osrm-vroom.md).

## Uso

```bash
pnpm routing:prepare     # una vez: descarga Colombia, recorta el Valle de Aburrá y lo procesa con OSRM
pnpm routing:up          # levanta OSRM (127.0.0.1:5000) y VROOM (127.0.0.1:3001)
pnpm routing:benchmark   # mide el escenario de 15 paradas de fixtures/medellin.json
pnpm routing:down        # detiene OSRM y VROOM
```

`routing:prepare` deja todo en `infra/routing/data/` (no se versiona). Para actualizar el mapa, borra `colombia-latest.osm.pbf` y vuelve a correrlo.

## Archivos

| Archivo                  | Qué es                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `prepare.mjs`            | Descarga, verificación MD5, renumeración y recorte con osmium, y procesamiento con OSRM |
| `osmium.Dockerfile`      | Imagen mínima con `osmium-tool` de Debian                                               |
| `vroom/config.yml`       | Configuración de vroom-express apuntando al contenedor de OSRM                          |
| `benchmark.mjs`          | Prueba de la Etapa 1: tiempo de cálculo, ahorro e inviabilidad                          |
| `fixtures/medellin.json` | 15 puntos públicos de referencia (no son direcciones de estudiantes)                    |

## Por qué solo el Valle de Aburrá

El extracto de Colombia pesa unos 330 MB y procesarlo completo con OSRM pide más memoria de la que Docker suele tener en un equipo de desarrollo (en Windows, WSL2 limita la memoria). Para el MVP basta con el área metropolitana; ampliar la cobertura es cambiar el recorte (`REGION_BBOX` en `prepare.mjs`) o procesar el país completo en un servidor con más memoria.

## Memoria

Cada contenedor corre con un límite de 2 GB (`ROUTING_MEMORY=3g pnpm routing:prepare` lo sube). Si un paso se pasa, falla solo ese contenedor en vez de tumbar la máquina virtual de Docker.

Antes de recortar, `prepare.mjs` renumera los nodos (`osmium renumber --object-type node`). Sin ese paso, `osmium extract` marca los nodos del valle en un mapa de bits que cubre todo el rango de IDs de OpenStreetMap (más de 13 mil millones) y se pasa de 2 GB aunque el área sea pequeña. Con IDs consecutivos, la renumeración y el recorte usan menos de 300 MB cada uno, y ningún paso de la preparación pasa de 450 MB. Efecto secundario: los IDs de nodo del recorte no son los de OpenStreetMap (los de vías y relaciones sí). OSRM no los necesita para rutear.
