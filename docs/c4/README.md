# Diagramas C4

Vistas de arquitectura según el [modelo C4](https://c4model.com). Están en Mermaid para que GitHub las dibuje y se versionen junto al código.

## Nivel 1 — Contexto

Quién usa Enruta2 y con qué sistemas externos habla.

```mermaid
flowchart TB
  admin["👤 Administrador<br/>empresa de transporte"]
  driver["👤 Conductor y acompañante"]
  guardian["👤 Acudiente"]

  enruta2["Enruta2<br/>rutas escolares: orden óptimo,<br/>ubicación en vivo y hora estimada"]

  osm["OpenStreetMap<br/>red vial de Colombia"]
  push["Expo Push / FCM<br/>notificaciones"]
  geo["Proveedor de geocodificación<br/>(ADR 0008)"]
  play["Google Play<br/>distribución de las apps"]

  admin -->|"registra vehículos, rutas<br/>y estudiantes"| enruta2
  driver -->|"hace el recorrido y<br/>marca cada parada"| enruta2
  enruta2 -->|"posición, hora estimada<br/>y notificaciones"| guardian
  guardian -->|"avisa «hoy no va»"| enruta2

  enruta2 -->|"calcula tiempos y rutas"| osm
  enruta2 -->|"envía notificaciones"| push
  enruta2 -->|"convierte direcciones<br/>en coordenadas"| geo
  play -.->|"instala"| driver
  play -.->|"instala"| guardian
```

## Nivel 2 — Contenedores

```mermaid
flowchart LR
  subgraph Moviles["Móviles (Android)"]
    D["App Conductor<br/>Expo · apps/driver"]
    G["App Acudientes<br/>Expo · apps/guardian"]
  end

  subgraph Backend
    API["API NestJS · apps/api<br/>REST + WebSockets + jobs"]
    PG[("PostgreSQL 18<br/>+ PostGIS 3.6")]
    R[("Redis 8<br/>pub/sub · adapter Socket.IO")]
    OSRM["OSRM<br/>tiempos y rutas sobre OSM"]
    V["VROOM<br/>optimización del orden"]
  end

  PUSH["Expo Push Service<br/>FCM"]

  D -->|"lotes de puntos GPS y eventos · HTTPS"| API
  G -->|"REST · HTTPS"| API
  API -->|"posición y hora estimada · WebSocket"| G
  API --> PG
  API <--> R
  API --> OSRM
  API --> V
  V --> OSRM
  API --> PUSH
  PUSH --> G
```

**Estado actual (Etapa 1):** existen las dos apps, la API con health checks, PostgreSQL/PostGIS y Redis. OSRM y VROOM ya corren en Docker con el Valle de Aburrá ([`infra/routing`](../../infra/routing/README.md)), pero la API los empieza a usar en la Fase 2; WebSockets y Expo Push llegan en las fases 3 y 4.
