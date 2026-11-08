# Enruta2 — Especificación del proyecto

> Se escribe **Enruta2** y se pronuncia **"enrutados"**.
> Documento vivo: actualízalo cuando cambie el alcance, el modelo de datos o una decisión.

---

## 1. Resumen

Enruta2 es una plataforma móvil para **rutas escolares en Colombia** con dos apps:

| App                                   | Para quién                                        | Qué hace                                                                                                                                                                                 |
| ------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Enruta2 Conductor** (`apps/driver`) | Conductor, acompañante y administrador de la ruta | Registrar estudiantes y direcciones, calcular el orden óptimo de recogida, hacer el recorrido parada por parada (navegando con Waze o Google Maps) compartiendo GPS y marcar cada parada |
| **Enruta2** (`apps/guardian`)         | Acudientes (papás, mamás, cuidadores)             | Ver en vivo dónde va la ruta y en cuántos minutos llega, recibir notificaciones y avisar "hoy no va"                                                                                     |

Detrás de ambas hay una API en NestJS con PostgreSQL + PostGIS, WebSockets para el tiempo real y un motor de optimización (OSRM + VROOM).

**Por qué dos apps y no una con roles:** la ubicación en segundo plano exige una declaración especial ante Google Play. Separando las apps, solo la del conductor la pide, y la de los acudientes pasa la revisión de Google Play con mucha menos fricción.

---

## 2. Problema y contexto

### 2.1 El problema

- Los acudientes no saben dónde va la ruta. Esperan en la puerta sin saber si falta 1 minuto o 20, o llaman al conductor mientras maneja.
- El conductor arma el orden de recogida "de memoria". Cuando un niño no va o entra uno nuevo, el orden deja de ser eficiente.
- Nadie tiene trazabilidad de a qué hora se recogió o se entregó cada niño.

### 2.2 Competencia

Ya existen apps de seguimiento de rutas escolares en Colombia y la región (Bus esCool, Rutappy School, Mi Buseta, Mi Ruta Segura, Traceus, EnRuta School / EnRutaV2, entre otras). **"Ver el bus en el mapa" ya es un commodity.**

### 2.3 Diferenciadores de Enruta2

1. **Optimización del orden de recogida** (y de entrega en la vuelta): la ruta más rápida por todas las paradas.
2. **"Hoy no va" con recálculo automático:** el acudiente avisa, el conductor recibe el aviso al instante (aunque vaya en camino a esa parada), la parada sale del recorrido y el orden se recalcula.
3. **Hora estimada de llegada en vivo por parada** ("llega en 6 min"), que a los papás les importa más que el mapa.
4. **Solo el celular:** no requiere instalar GPS en el vehículo, y el conductor navega con la app que ya usa (Waze o Google Maps).
5. **Privacidad por diseño:** cada acudiente ve el vehículo, en qué parada va y cuál es la suya; nunca las direcciones ni los nombres de otras familias.

### 2.4 Contexto regulatorio (Colombia)

- **Ley 1581 de 2012 (habeas data):** los datos de niños, niñas y adolescentes tienen protección especial; se requiere autorización expresa del representante legal.
- **Decreto 1048 del 5 de agosto de 2026** (vigente desde el 7 de agosto de 2026): actualizó la reglamentación del transporte especial con obligaciones para conductores y acompañantes y sobre la supervisión de los estudiantes. **Tarea pendiente:** leer el decreto y convertir en funcionalidades lo que aplique (por ejemplo, registro del acompañante en cada recorrido).
- El público objetivo son **empresas legales de transporte especial** y sus conductores, no rutas informales.

---

## 3. Usuarios y roles

Los roles son **por organización**: una persona puede ser administradora en una organización y acudiente en otra.

| Rol                     | App        | Puede                                                                                                                                                     |
| ----------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN`                 | Conductor  | Gestionar vehículos, rutas, estudiantes, conductores, acompañantes e invitaciones de su organización; ver todos los recorridos de su organización         |
| `DRIVER` (conductor)    | Conductor  | Ver sus rutas, iniciar y finalizar recorridos, compartir ubicación, marcar cada parada **solo estando en la dirección**                                   |
| `MONITOR` (acompañante) | Conductor  | Marcar recogido, entregado o no salió; compartir ubicación si el recorrido usa su celular                                                                 |
| `GUARDIAN` (acudiente)  | Acudientes | Ver el vehículo en vivo, en qué parada va y la hora estimada de su parada, recibir notificaciones, marcar "hoy no va", gestionar su autorización de datos |

**Caso especial:** un conductor independiente es una organización de una sola persona, con los roles `ADMIN` y `DRIVER` a la vez.

**Implementación:** permisos con CASL, definidos una sola vez en `packages/domain/permissions` y usados tanto en la API (guards de NestJS) como en las apps (mostrar u ocultar acciones). El servidor siempre es la fuente de verdad.

---

## 4. Glosario

| Término                 | Significado                                                                      |
| ----------------------- | -------------------------------------------------------------------------------- |
| **Organización**        | Empresa de transporte (o conductor independiente) dueña de las rutas             |
| **Ruta**                | Plantilla recurrente: vehículo, colegio, jornada, sentido y lista de estudiantes |
| **Jornada**             | `AM` (mañana) o `PM` (tarde)                                                     |
| **Sentido**             | `TO_SCHOOL` (ida: casas → colegio) o `TO_HOME` (vuelta: colegio → casas)         |
| **Recorrido** (`Trip`)  | Una ejecución concreta de una ruta en una fecha                                  |
| **Parada**              | Dirección de un estudiante dentro de una ruta                                    |
| **Acudiente**           | Adulto responsable del estudiante                                                |
| **Acompañante**         | Adulto que va en el vehículo y supervisa a los estudiantes                       |
| **Hora estimada (ETA)** | Minutos que faltan para que el vehículo llegue a una parada                      |

---

## 5. Alcance del MVP

### 5.1 Historias de usuario

**Administrador**

- A1. Como admin, creo mi organización y registro vehículos (placa, capacidad).
- A2. Como admin, creo una ruta con colegio (dirección y punto en el mapa), jornada, sentido, hora de entrada o salida (informativa: no restringe la ruta), conductor y acompañante.
- A3. Como admin, agrego estudiantes a una ruta con su dirección. La app geocodifica la dirección y **me pide confirmar o ajustar el pin en el mapa** (las direcciones colombianas tipo "Cra 43A # 1-50" se geocodifican mal con frecuencia).
- A4. Como admin, invito a los acudientes de cada estudiante con un enlace o código.

**Conductor y acompañante**

- C1. Como conductor, veo el orden óptimo de las paradas de la ruta del día, en lista y en mapa, con la hora estimada de llegada a cada parada.
- C2. Como conductor, recalculo el orden cuando cambian los estudiantes de la ruta.
- C3. Como conductor, inicio el recorrido; la app comparte la ubicación en segundo plano hasta que lo finalizo, aunque la pantalla esté apagada o Waze o Google Maps esté en primer plano.
- C4. Como conductor o acompañante, marco en cada parada **recogido**, **entregado** o **no salió**. La app solo lo permite cuando el GPS confirma que estamos en la dirección, o con un motivo si la posición no coincide con el pin; siempre con el GPS activo.
- C5. Como conductor, si pierdo señal, la app guarda los puntos GPS y los eventos y los envía cuando vuelve la conexión.
- C6. Como conductor, al iniciar el recorrido elijo **Waze** o **Google Maps** y navego **una parada a la vez**: la app abre la navegación hacia la parada, me avisa cuando llego para volver a Enruta2 y, después de marcarla, habilita **Ir a la siguiente**.
- C7. Como conductor, recibo un aviso cada vez que un acudiente marca "hoy no va" (_"Pablo no va hoy"_, o _"Pablo no va hoy y tampoco regresa"_). Si voy en camino a esa parada, sigo de una vez a la siguiente desde donde estoy.
- C8. Como conductor o acompañante, en la vuelta marco que un estudiante **no va en la ruta de regreso** (por ejemplo, si no fue a la ida y su acudiente no marcó "tampoco regresa"); su acudiente recibe el aviso.

**Acudiente**

- G1. Como acudiente, acepto la invitación y doy la **autorización expresa** de tratamiento de datos de mi hijo antes de ver cualquier información.
- G2. Como acudiente, veo en un mapa el vehículo en vivo y mi parada, la hora estimada de llegada a mi parada y en qué parada va el recorrido (_"va en la 3 de 12; la tuya es la 7"_), sin saber quién se recogió o se entregó en las demás. Lo veo desde que sale la ruta hasta que dejan a mi hijo.
- G3. Como acudiente, recibo notificaciones: la ruta salió, **va en camino a mi dirección** (con la hora estimada), va llegando (~5 min), llegó (automático, por GPS), mi hijo fue recogido, llegó al colegio, va de vuelta y llegó a casa.
- G4. Como acudiente, marco **"hoy no va"** para la ida, incluso con el recorrido en curso. La app me pregunta _"¿Confirmas que Pablo no va hoy?"_, con la casilla **Tampoco regresa** para sacarlo también de la vuelta. La parada sale del recorrido, el conductor recibe el aviso y ve el orden recalculado.
- G5. Como acudiente, marco **"no regresa en la ruta"** cuando mi hijo sí fue a la ida pero no vuelve en la ruta (por ejemplo, si lo recojo en el colegio), hasta que la ruta salga del colegio.

**Sistema**

- S1. Los puntos GPS se borran automáticamente después de `LOCATION_RETENTION_DAYS`.
- S2. Cada evento de parada guarda **quién** lo marcó y **cuándo**.
- S3. Cada acceso a la ubicación en vivo queda registrado (quién la vio y cuándo).

### 5.2 Fuera del alcance del MVP

- iOS (el código debe quedar preparado, pero no se publica)
- Panel web para empresas y colegios (fase posterior, en Next.js)
- Pagos, facturación y cobro del servicio
- Chat entre acudientes y conductor
- Múltiples vehículos optimizados juntos (VRP multi-vehículo); el MVP optimiza **una ruta = un vehículo**
- Hardware GPS o integración con rastreadores del vehículo

---

## 6. Flujos principales

### 6.1 Ida (`TO_SCHOOL`)

El conductor hace el recorrido **una parada a la vez**, navegando con Waze o Google Maps ([ADR 0010](adr/0010-navegacion-waze-google-maps.md)).

1. Antes de salir, el backend genera el `Trip` del día con las paradas activas (excluye las marcadas "hoy no va") y su orden optimizado.
2. El conductor toca **Iniciar recorrido** y elige **Waze** o **Google Maps** (la elección se recuerda en el celular). Arranca el rastreo en segundo plano → notificación a todos los acudientes: _"La ruta de {nombre} ya salió 🚐"_.
3. **Ir a la parada** (la primera se abre al iniciar): Enruta2 abre Waze o Google Maps con las coordenadas de la parada → la parada pasa a `EN_ROUTE` → notificación a su acudiente: _"La ruta va en camino por {nombre}. Llega en unos {minutos} min."_
4. Con cada lote de puntos GPS, el backend recalcula la hora estimada de **cada parada pendiente** (no la del colegio) y la emite por WebSocket.
5. Si la hora estimada baja de ~5 min → _"va llegando"_ (solo si el aviso de "en camino" decía más de 5 min).
6. Cuando el vehículo entra al radio de la parada → `ARRIVED` automático → notificación _"La ruta llegó por {nombre}"_. En el celular del conductor aparece _"Llegaste donde {nombre}. Toca para marcar"_, que lo devuelve a Enruta2.
7. El conductor (o el acompañante) marca **recogido** o **no salió**. Los botones solo se habilitan si el GPS del celular confirma que está en la dirección (sección 12.3).
8. Con la parada marcada se habilita **Ir a la siguiente** → vuelve al paso 3.
9. Después de la última parada, **Ir al colegio**. Al llegar → notificación a los acudientes de los recogidos: _"{nombre} llegó al colegio"_, y se cierra su sesión en vivo (sección 6.5).
10. El conductor finaliza el recorrido → se detiene el rastreo y se cierra la sala de tiempo real.

### 6.2 Vuelta (`TO_HOME`)

Igual, pero el vehículo sale del colegio con los estudiantes a bordo. El aviso de "en camino" dice _"{nombre} va en camino a casa. Llega en unos {minutos} min."_, en la parada se marca **entregado** (o **no salió** si nadie recibe) y el aviso final es _"{nombre} llegó a casa 🏠"_, que también cierra la sesión en vivo de ese acudiente. La vuelta termina en la última parada (ruta abierta).

Antes de salir del colegio o durante la vuelta, el conductor o el acompañante puede marcar que un estudiante **no va en la ruta de regreso** (sección 6.3).

### 6.3 "Hoy no va"

1. El acudiente marca "hoy no va" para la ida de una fecha y jornada. La app pregunta _"¿Confirmas que {nombre} no va hoy?"_, con la casilla **Tampoco regresa** (desmarcada por defecto).
2. **Siempre** le llega un aviso al conductor y al acompañante: _"{nombre} no va hoy."_, o _"{nombre} no va hoy y tampoco regresa."_ si marcó la casilla.
3. Si el recorrido no ha empezado: la parada se excluye al generarlo. Con **Tampoco regresa**, también se excluye de la vuelta de esa jornada.
4. Si ya empezó y la parada no se ha marcado: pasa a `EXCUSED` y se recalcula el orden de las pendientes desde la posición actual.
5. Si el conductor iba **en camino a esa parada**, el aviso dice _"{nombre} no va hoy. Puedes seguir a la siguiente parada."_ y se habilita **Ir a la siguiente** desde donde está, sin pasar por la dirección.
6. No hay hora de corte: se acepta hasta que la parada de la ida se marque (recogido o no salió).
7. **Vuelta:** si no se marcó **Tampoco regresa**, el estudiante aparece en la vuelta con la señal _"No fue a la ida"_. El conductor o el acompañante puede marcar que **no va en la ruta de regreso**, antes de salir del colegio o durante la vuelta: la parada pasa a `EXCUSED`, se recalcula el orden y el acudiente recibe el aviso (sección 13), por si es un error. Ese marcado no exige estar en la dirección.
8. **"No regresa en la ruta"** (el acudiente, solo la vuelta): para cuando el estudiante sí fue a la ida pero no vuelve en la ruta. La app pregunta _"¿Confirmas que {nombre} no regresa hoy en la ruta?"_ y al conductor le llega _"{nombre} no regresa hoy en la ruta."_ Se acepta **hasta que la vuelta inicia**; después, el botón queda desactivado con _"La ruta ya salió del colegio. Comunícate con el conductor."_, porque el estudiante puede ir ya a bordo y saltar su parada sería peligroso.
9. **Deshacer:** el acudiente puede quitar un aviso hasta que inicie ese recorrido. Después debe comunicarse con el conductor: volver a meter una parada en pleno recorrido no se hace desde la app de acudientes.

### 6.4 Onboarding del acudiente

Invitación (enlace o código) → registro → **autorización de tratamiento de datos** (versionada, con fecha) → vinculación con su estudiante → permiso de notificaciones.

### 6.5 Lo que ve el acudiente durante el recorrido

- **Hasta cuándo:** desde que sale la ruta hasta que dejan a su hijo: en la ida, al llegar al colegio; en la vuelta, al entregarlo en la casa. En ese momento se cierra su sesión en vivo y deja de ver el vehículo. Si su hijo no va (`EXCUSED`) o no salió (`NO_SHOW`), se cierra en ese momento. Con varios hijos en el mismo recorrido, se cierra al dejar al último.
- El vehículo en vivo y **su** parada en el mapa; ninguna otra parada.
- El progreso: _"Va en la parada 3 de 12 · la tuya es la 7"_, y la hora estimada de llegada a su parada.
- Nada sobre las demás paradas: ni nombres, ni direcciones, ni si alguien fue recogido o entregado.

### 6.6 Dónde se avisan las ausencias (app de acudientes)

En la pantalla de inicio, cada hijo tiene una tarjeta con los recorridos de hoy, uno por fila:

```
┌ Pablo ─────────────────────────────────────┐
│ 🚐 Ida       En camino · llega en 8 min     │
│                              [ Hoy no va ]  │
│ 🏠 Regreso   Sale del colegio ~12:30 p. m.  │
│                   [ No regresa en la ruta ] │
└──────────────── Avisar para otro día ───────┘
```

- **Hoy no va** abre la confirmación de la ida con la casilla **Tampoco regresa**; **No regresa en la ruta**, la de la vuelta (sección 6.3).
- Un botón que ya no aplica (la parada ya se marcó o la vuelta ya salió del colegio) queda desactivado y dice por qué.
- Un aviso hecho se muestra en su fila (_"Avisaste que no va · Deshacer"_), con **Deshacer** mientras ese recorrido no haya iniciado.
- **Avisar para otro día** (citas médicas, viajes): se elige la fecha y las mismas dos opciones.

---

## 7. Requisitos no funcionales

### 7.1 Privacidad y seguridad (prioridad máxima)

- Autorización expresa del acudiente guardada con versión del texto y fecha (`Consent`).
- Un acudiente **solo** recibe: posición del vehículo, su parada, la hora estimada de su parada y el progreso del recorrido (número de la parada actual, total de paradas y número de la suya). Nunca la lista de paradas, ni direcciones, nombres o estados (recogido, entregado) de otros estudiantes.
- A Waze o Google Maps solo salen las coordenadas de la parada siguiente, desde el celular del conductor; nunca nombres.
- La ubicación en vivo solo existe mientras el `Trip` está `IN_PROGRESS`, y cada acudiente la ve solo hasta que dejan a su hijo (sección 6.5). Después, el servidor lo saca de la sala y no lo deja volver a unirse.
- La autorización se valida en el servidor: al unirse a la sala WebSocket y en cada endpoint.
- Registro de accesos a la ubicación en vivo (`LocationAccessLog`).
- Borrado automático de puntos GPS (`LOCATION_RETENTION_DAYS`, propuesta inicial: 7).
- Sin datos de menores en logs. Usar identificadores, no nombres ni coordenadas.
- HTTPS, JWT de acceso corto con refresh rotativo, rate limiting, validación de toda entrada.

### 7.2 Batería y confiabilidad del rastreo

- Frecuencia adaptativa: cada ~5 s o ~25 m en movimiento; menos frecuente detenido.
- Envío por **lotes HTTP con reintento**, no por socket, desde la tarea en segundo plano (los sockets en segundo plano son poco confiables en Android).
- Cola local (SQLite) cuando no hay señal; se envía al reconectar sin perder el orden.
- Servicio en primer plano de Android con notificación fija ("Recorrido activo") mientras dura el recorrido.
- El rastreo debe seguir con Waze o Google Maps en primer plano: es la situación normal, porque el conductor navega con ellos.

### 7.2.1 GPS siempre activo

El GPS del celular que hace el rastreo debe estar activo y funcionando durante todo el recorrido; sin él no hay hora estimada, ni avisos de llegada, ni marcado en la dirección.

- **Para iniciar el recorrido** la app exige: ubicación del celular activada, permiso de ubicación "todo el tiempo", ubicación precisa y la app excluida de la optimización de batería. Si falta algo, **Iniciar recorrido** queda bloqueado y la app guía al conductor para corregirlo.
- **Durante el recorrido**, si el conductor apaga la ubicación, quita el permiso o el celular deja de dar posiciones por más de `GPS_LOST_SECONDS` (por defecto 30): alerta en el celular del conductor que no se puede descartar (_"Activa el GPS para continuar el recorrido"_), con sonido, hasta que vuelva la posición. El evento queda registrado y el admin recibe un aviso.
- **En el servidor**, si un recorrido en curso no recibe puntos durante `TRACKING_STALE_MIN` (por defecto 2): aviso al admin y, para los acudientes, el mapa muestra _"Sin ubicación del vehículo desde las {hora}"_ en vez de una posición vieja como si fuera actual. Puede ser falta de datos móviles: el celular sigue guardando los puntos y los envía al reconectar.
- Marcar una parada con motivo (sección 12.3) solo es posible **con el GPS funcionando**: sirve cuando la posición no coincide con el pin, no para trabajar sin GPS.

### 7.3 Rendimiento

- Hora estimada recalculada como máximo cada ~30 s por recorrido.
- Notificación de "va llegando" con un margen de error objetivo de ±2 min (se mide en el piloto).

### 7.4 Observabilidad

- Logs JSON estructurados con identificador de correlación (pino).
- `/health/live` y `/health/ready` (NestJS Terminus: base de datos, Redis, OSRM, VROOM).
- Métricas Prometheus: recorridos activos, puntos GPS ingeridos, latencia del cálculo de hora estimada, notificaciones enviadas y fallidas, duración de la optimización.
- Tableros de Grafana versionados en `infra/grafana`.

---

## 8. Arquitectura

### 8.1 Contenedores (C4 nivel 2)

```mermaid
flowchart LR
  subgraph Moviles
    D[App Conductor<br/>Expo · Android]
    G[App Acudientes<br/>Expo · Android]
  end

  subgraph Backend
    API[API NestJS<br/>REST + WebSockets + jobs]
    PG[(PostgreSQL + PostGIS)]
    R[(Redis<br/>pub/sub · adapter Socket.IO)]
    OSRM[OSRM<br/>tiempos y rutas sobre OSM Colombia]
    V[VROOM<br/>optimización del orden]
  end

  PUSH[Expo Push Service<br/>FCM]

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

### 8.2 Módulos de la API (NestJS)

| Módulo               | Responsabilidad                                                            |
| -------------------- | -------------------------------------------------------------------------- |
| `auth`               | Registro, login, JWT, refresh, invitaciones                                |
| `organizations`      | Organizaciones y membresías con rol                                        |
| `fleet`              | Vehículos                                                                  |
| `routes`             | Rutas, estudiantes, paradas, acudientes vinculados                         |
| `geocoding`          | Geocodificación de direcciones (proveedor detrás de una interfaz)          |
| `optimization`       | Cliente de VROOM/OSRM; heurística de respaldo desde `packages/domain`      |
| `trips`              | Generación diaria de recorridos, inicio/fin, máquina de estados de paradas |
| `tracking`           | Ingesta de puntos GPS, cálculo de hora estimada, gateway WebSocket         |
| `absences`           | "Hoy no va" y recálculo                                                    |
| `notifications`      | Catálogo de mensajes y envío por Expo Push                                 |
| `consents`           | Autorizaciones de tratamiento de datos                                     |
| `retention`          | Job programado de borrado de datos                                         |
| `health` / `metrics` | Health checks y métricas                                                   |

---

## 9. Stack y decisiones

| Decisión         | Elección                                      | Alternativas consideradas   | Razón                                                                                                              |
| ---------------- | --------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Plataforma móvil | React Native + Expo, solo Android en el MVP   | PWA, Flutter, nativo        | TypeScript de punta a punta; el MVP necesita GPS en segundo plano, notificaciones y cámara, que una PWA no da bien |
| Número de apps   | Dos (conductor y acudientes)                  | Una con roles               | Aísla el permiso de ubicación en segundo plano en una sola app                                                     |
| Backend          | NestJS + PostgreSQL + PostGIS + Prisma        | Express, Drizzle            | Estructura modular, buen soporte de WebSockets y OpenAPI                                                           |
| Tiempo real      | Socket.IO + Redis adapter                     | Firebase, Supabase Realtime | Control total de la autorización por sala; escala horizontal con Redis                                             |
| Optimización     | OSRM + VROOM (Docker)                         | Google Routes API, OR-Tools | Código abierto, sin costo por uso, soporta rutas abiertas y tiempo de servicio por parada                          |
| Mapas en la app  | `react-native-maps` (Google en Android)       | MapLibre                    | Más rápido de integrar. Confirmar precios vigentes del SDK de mapas en el ADR                                      |
| Geocodificación  | Detrás de una interfaz; proveedor por decidir | Google Geocoding, Nominatim | Las direcciones colombianas exigen confirmar el pin manualmente en cualquier caso                                  |
| Permisos         | CASL                                          | Chequeos manuales por rol   | Reglas declarativas compartidas entre API y apps                                                                   |
| Monorepo         | pnpm + Turborepo                              | Nx                          | Simple y rápido                                                                                                    |

### 9.1 ADRs iniciales

| #    | Título                                                            |
| ---- | ----------------------------------------------------------------- |
| 0001 | Expo y Android como única plataforma del MVP                      |
| 0002 | Dos apps separadas en vez de una con roles                        |
| 0003 | Estrategia de ubicación en segundo plano e ingesta por lotes HTTP |
| 0004 | Motor de optimización: OSRM + VROOM                               |
| 0005 | Tiempo real con Socket.IO y Redis                                 |
| 0006 | Permisos con CASL compartidos en `packages/domain`                |
| 0007 | PostGIS con Prisma usando `Unsupported` + SQL crudo encapsulado   |
| 0008 | Proveedor de mapas y de geocodificación                           |
| 0010 | Navegación con Waze o Google Maps, parada por parada              |

---

## 10. Modelo de datos (borrador)

> Columnas geográficas: `geography(Point, 4326)`, declaradas en Prisma como `Unsupported(...)`.
> Toda tabla tiene `id` (UUID), `createdAt`, `updatedAt`. Las acciones de usuario guardan `createdById`.

| Entidad             | Campos clave                                                                                                                                                             | Notas                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Organization`      | name, nit (opcional)                                                                                                                                                     | Empresa o conductor independiente                                                                                                                  |
| `User`              | email, passwordHash, fullName, phone                                                                                                                                     |                                                                                                                                                    |
| `Membership`        | userId, organizationId, role (`ADMIN`/`DRIVER`/`MONITOR`/`GUARDIAN`)                                                                                                     | Roles por organización                                                                                                                             |
| `Vehicle`           | organizationId, plate, capacity                                                                                                                                          |                                                                                                                                                    |
| `School`            | organizationId, name, addressText, location                                                                                                                              |                                                                                                                                                    |
| `Route`             | organizationId, schoolId, vehicleId, name, shift (`AM`/`PM`), direction (`TO_SCHOOL`/`TO_HOME`), schoolTime, defaultDriverId, defaultMonitorId, startLocation (opcional) | Plantilla recurrente; `schoolTime` es informativa                                                                                                  |
| `Student`           | organizationId, firstName, lastName                                                                                                                                      | Mínimo de datos necesarios                                                                                                                         |
| `StudentGuardian`   | studentId, userId (acudiente), relationship                                                                                                                              |                                                                                                                                                    |
| `Stop`              | routeId, studentId, addressText, location, confirmedAt, serviceSeconds                                                                                                   | `location` confirmada por el usuario                                                                                                               |
| `RouteOptimization` | routeId, orderedStopIds, totalDurationSec, totalDistanceM, computedAt, engine (`VROOM`/`HEURISTIC`)                                                                      | Historial de cálculos                                                                                                                              |
| `Trip`              | routeId, date, status (`SCHEDULED`/`IN_PROGRESS`/`COMPLETED`/`CANCELLED`), trackingUserId, startedAt, endedAt                                                            | Una ejecución de la ruta                                                                                                                           |
| `TripStop`          | tripId, stopId, sequence, status, etaAt, enRouteAt, arrivedAt, completedAt, completedById, completedLocation, completedAccuracyM, overrideReason                         | Estado por parada en el recorrido; `overrideReason` cuando se marca sin confirmación del GPS                                                       |
| `LocationPing`      | tripId, location, speed, heading, accuracy, recordedAt, receivedAt                                                                                                       | Se borra por retención; considerar partición por fecha                                                                                             |
| `Absence`           | studentId, date, shift, direction (`TO_SCHOOL`/`TO_HOME`), createdById                                                                                                   | "Hoy no va". Con **Tampoco regresa** se crean las dos direcciones; solo la vuelta la crean el acudiente (**No regresa en la ruta**) o el conductor |
| `Consent`           | guardianUserId, studentId, textVersion, acceptedAt, revokedAt                                                                                                            | Autorización Ley 1581                                                                                                                              |
| `PushToken`         | userId, token, platform, lastSeenAt                                                                                                                                      |                                                                                                                                                    |
| `NotificationLog`   | userId, tripId, type, sentAt, status                                                                                                                                     |                                                                                                                                                    |
| `LocationAccessLog` | userId, tripId, accessedAt                                                                                                                                               | Quién vio la ubicación en vivo                                                                                                                     |

### 10.1 Máquinas de estado (en `packages/domain`)

**Trip:** `SCHEDULED → IN_PROGRESS → COMPLETED` (o `CANCELLED` desde `SCHEDULED`).

**TripStop:**

```
PENDING → EN_ROUTE → APPROACHING → ARRIVED → PICKED_UP    (ida)
                                           → DROPPED_OFF  (vuelta)
                                           → NO_SHOW      (el niño no salió / nadie recibió)
PENDING, EN_ROUTE, APPROACHING o ARRIVED → EXCUSED  ("hoy no va")
```

- `EN_ROUTE`: el conductor tocó **Ir a la parada**. Solo una parada del recorrido puede estar entre `EN_ROUTE` y `ARRIVED`, y solo se puede ir a la siguiente cuando la actual quedó en `PICKED_UP`, `DROPPED_OFF`, `NO_SHOW` o `EXCUSED`.
- `APPROACHING` y `ARRIVED` los detecta el servidor; en un tramo corto se puede pasar de `EN_ROUTE` a `ARRIVED` directamente.
- `PICKED_UP`, `DROPPED_OFF` y `NO_SHOW` se aceptan desde `EN_ROUTE`, `APPROACHING` o `ARRIVED` si la posición que trae el evento está en la dirección (sección 12.3): sin señal, el servidor puede no haber detectado aún la llegada.

Las transiciones inválidas se rechazan con error de dominio. Cada transición registra quién y cuándo.

---

## 11. API (borrador)

### 11.1 REST

| Método              | Ruta                                             | Rol                                                                                                                                                 |
| ------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`              | `/auth/register`, `/auth/login`, `/auth/refresh` | Público                                                                                                                                             |
| `POST`              | `/invitations/:code/accept`                      | Autenticado                                                                                                                                         |
| `POST/GET/PATCH`    | `/organizations/:orgId/vehicles`                 | ADMIN                                                                                                                                               |
| `POST/GET/PATCH`    | `/organizations/:orgId/routes`                   | ADMIN (lectura: DRIVER, MONITOR)                                                                                                                    |
| `POST/PATCH/DELETE` | `/routes/:routeId/stops`                         | ADMIN                                                                                                                                               |
| `POST`              | `/geocoding/search`                              | ADMIN                                                                                                                                               |
| `POST`              | `/routes/:routeId/optimize`                      | ADMIN, DRIVER                                                                                                                                       |
| `GET`               | `/me/trips/today`                                | DRIVER, MONITOR, GUARDIAN (cada uno ve lo suyo)                                                                                                     |
| `POST`              | `/trips/:tripId/start`, `/trips/:tripId/finish`  | DRIVER                                                                                                                                              |
| `POST`              | `/trips/:tripId/locations` (lote)                | Usuario que hace el rastreo                                                                                                                         |
| `POST`              | `/trips/:tripId/stops/:tripStopId/events`        | MONITOR, DRIVER                                                                                                                                     |
| `POST/DELETE`       | `/students/:studentId/absences`                  | GUARDIAN del estudiante (ida con `alsoReturn`, o solo la vuelta antes de que inicie), ADMIN; DRIVER y MONITOR solo la vuelta del recorrido en curso |
| `GET`               | `/guardian/trips/:tripId/live`                   | GUARDIAN del estudiante en ese recorrido                                                                                                            |
| `POST`              | `/consents`                                      | GUARDIAN                                                                                                                                            |
| `POST`              | `/me/push-tokens`                                | Autenticado                                                                                                                                         |

**Eventos de parada** (`/trips/:tripId/stops/:tripStopId/events`): `EN_ROUTE` (Ir a la parada), `PICKED_UP`, `DROPPED_OFF` y `NO_SHOW`. Cada uno lleva la posición, la precisión del GPS y la hora del celular, y `overrideReason` si se marca sin confirmación del GPS. `APPROACHING` y `ARRIVED` los detecta el servidor.

### 11.2 WebSocket (`/live`)

| Evento             | Dirección          | Contenido                                                                                                                          |
| ------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `trip:join`        | cliente → servidor | `tripId`. El servidor valida que el usuario tenga en el recorrido un estudiante que todavía no hayan dejado                        |
| `trip:position`    | servidor → cliente | Posición del vehículo, rumbo, momento                                                                                              |
| `trip:eta`         | servidor → cliente | **Solo** la hora estimada de la parada del acudiente                                                                               |
| `trip:stop-status` | servidor → cliente | Estado de **su** parada                                                                                                            |
| `trip:progress`    | servidor → cliente | Número de la parada actual, total de paradas y número de la suya. Nada más de las otras paradas                                    |
| `trip:ended`       | servidor → cliente | Fin del recorrido **o entrega de su hijo** (sección 6.5); el cliente deja de mostrar la ubicación y el servidor lo saca de la sala |

Al conductor y al admin se les emite la vista completa (todas las paradas) en una sala distinta, incluido `trip:absence` ("hoy no va") para que la app del conductor se actualice al instante, además del push.

---

## 12. Algoritmos

### 12.1 Optimización del orden

- **Problema:** viajante para **un vehículo** (TSP), resuelto con VROOM sobre la matriz de tiempos de OSRM. **Objetivo:** la ruta más rápida (menor duración total) pasando por todas las paradas. La hora de entrada al colegio no es una restricción.
- **Ida:** inicio en `Route.startLocation` (o la primera parada), una tarea por parada con tiempo de servicio y **fin en el colegio**.
- **Vuelta:** inicio en el colegio, una tarea por parada, **ruta abierta** (sin punto final).
- **Sin ventanas de tiempo:** con una ventana imposible, VROOM deja paradas sin asignar en vez de avisar ([ADR 0004](adr/0004-osrm-vroom.md)). Un resultado con paradas sin asignar es un error, nunca una ruta válida.
- **Respaldo:** heurística en `packages/domain` (vecino más cercano + 2-opt) para cuando VROOM no esté disponible. Sus tests comparan la calidad contra VROOM en casos de prueba.
- **Recálculo:** al cambiar estudiantes de la ruta o con un "hoy no va" durante un recorrido (solo sobre las paradas pendientes, desde la posición actual). Durante el recorrido, el recálculo solo cambia cuáles son las siguientes; la parada en `EN_ROUTE` no se reordena, salvo que quede `EXCUSED`.

### 12.2 Hora estimada (ETA)

- Se calcula para **las paradas de los estudiantes**, no para el colegio.
- Con cada lote de puntos (máximo una vez cada ~30 s por recorrido): pedir a OSRM la ruta desde la posición actual por las paradas pendientes en orden, acumular duraciones y sumar el tiempo de servicio de cada parada.
- El conductor navega con Waze o Google Maps, que pueden tomar otro camino; la hora estimada se corrige sola en el siguiente lote porque siempre parte de la posición actual.
- Suavizar para evitar saltos bruscos (por ejemplo, promedio móvil exponencial).

### 12.3 Detección de eventos

- `EN_ROUTE`: lo marca el conductor al tocar **Ir a la parada**. Dispara el aviso de "en camino" con la hora estimada de ese momento.
- `APPROACHING`: hora estimada ≤ `APPROACHING_THRESHOLD_MIN` (por defecto 5). No se avisa si el aviso de "en camino" ya decía 5 min o menos.
- `ARRIVED`: distancia a la parada ≤ `ARRIVAL_RADIUS_M` (por defecto 100, se ajusta en el piloto) y velocidad baja.
- `APPROACHING` y `ARRIVED`, y los avisos a los acudientes, se deciden **en el servidor** a partir de los puntos GPS, no con geocercas del celular.
- **Marcar en la dirección:** la app del conductor habilita recogido, entregado y no salió cuando la posición del celular está a ≤ `ARRIVAL_RADIUS_M` de la parada. Lo calcula con su propio GPS (funciona sin señal) con la regla compartida de `packages/domain`, y el servidor la revalida con la posición que trae el evento. Si la posición no coincide con el pin, el conductor puede marcar igual eligiendo un motivo (_el pin está mal ubicado_, _la entrada queda lejos_, _otro_ con texto): queda en `overrideReason` con la posición y la precisión del GPS, y el admin lo ve en el historial del recorrido para corregir el pin. Exige el GPS funcionando, con una posición de los últimos `GPS_LOST_SECONDS` (sección 7.2.1).
- Cada notificación se envía **una sola vez** por parada y recorrido (idempotencia).

---

## 13. Notificaciones

Tono **cercano y cálido**, en español de Colombia. `{nombre}` es el nombre del estudiante.

| Evento                                      | Mensaje                                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Recorrido iniciado                          | La ruta de {nombre} ya salió 🚐                                                               |
| En camino (ida)                             | La ruta va en camino por {nombre}. Llega en unos {minutos} min.                               |
| En camino (vuelta)                          | {nombre} va en camino a casa. Llega en unos {minutos} min.                                    |
| Va llegando                                 | La ruta está a unos 5 minutos. ¡Alisten el morral!                                            |
| Llegó a la parada                           | La ruta llegó por {nombre}.                                                                   |
| Recogido                                    | {nombre} ya va en la ruta ✅                                                                  |
| Llegó al colegio                            | {nombre} llegó al colegio.                                                                    |
| Va de vuelta                                | {nombre} va de vuelta a casa.                                                                 |
| Entregado                                   | {nombre} llegó a casa 🏠                                                                      |
| No salió                                    | La ruta pasó y {nombre} no salió. Comunícate con el conductor.                                |
| No va en el regreso (lo marca el conductor) | El conductor marcó que {nombre} no va en la ruta de regreso. Si no es así, comunícate con él. |

Al conductor y al acompañante:

| Evento                         | Mensaje                                                  |
| ------------------------------ | -------------------------------------------------------- |
| Hoy no va                      | {nombre} no va hoy.                                      |
| Hoy no va ni regresa           | {nombre} no va hoy y tampoco regresa.                    |
| No regresa                     | {nombre} no regresa hoy en la ruta.                      |
| Hoy no va, en camino a su casa | {nombre} no va hoy. Puedes seguir a la siguiente parada. |
| Llegó a la parada              | Llegaste donde {nombre}. Toca para marcar.               |
| GPS apagado                    | Activa el GPS para continuar el recorrido.               |

Al admin:

| Evento                   | Mensaje                                                 |
| ------------------------ | ------------------------------------------------------- |
| GPS apagado en recorrido | El GPS de la ruta {ruta} está apagado desde las {hora}. |
| Sin ubicación            | La ruta {ruta} no envía su ubicación desde las {hora}.  |

---

## 14. Cumplimiento y publicación en Google Play

### 14.1 Ubicación en segundo plano (solo `apps/driver`)

- Google Play solo la permite cuando aporta un beneficio significativo y es parte de la función central de la app.
- Requiere el **formulario de declaración de permisos** en Play Console, con **video** que muestre la función.
- Requiere un **aviso visible dentro de la app** (pantalla bloqueante) **antes** de pedir el permiso, explicando qué se recoge y para qué.
- La política de privacidad debe mencionar explícitamente la ubicación, dentro de la app y en la ficha de la tienda.
- La revisión puede tardar más de lo normal; planear con margen.

### 14.2 Cuenta de desarrollador

- Cuenta personal: pago único de USD 25.
- Las cuentas personales nuevas deben hacer una **prueba cerrada con mínimo 12 testers inscritos durante 14 días continuos** antes de poder publicar en producción.
- Plan: usar como testers a los acudientes de la ruta piloto (cumple el requisito y valida el producto al mismo tiempo).

### 14.3 Otros requisitos

- Formulario de seguridad de datos (_Data safety_) en Play Console.
- Política de privacidad pública, con capítulo de datos de menores.
- **El identificador de cada app no se puede cambiar después de publicar.** Propuesta, a confirmar: `co.enruta2.driver` y `co.enruta2.guardian`.

---

## 15. Estándar de calidad (portafolio)

El proyecto debe poder defenderse en una entrevista técnica. Debe incluir:

- [ ] README profesional (problema, demo, arquitectura, cómo correrlo)
- [ ] Diagramas C4 (contexto y contenedores) en `docs/c4`
- [ ] ADRs en `docs/adr`
- [ ] Docker Compose para levantar todo el backend localmente
- [ ] GitHub Actions: lint, typecheck, tests y build en cada PR
- [ ] Tests: unitarios en `packages/domain` (cobertura alta), integración de la API con Testcontainers (PostgreSQL + PostGIS)
- [ ] OpenAPI (Swagger) de toda la API
- [ ] Migraciones versionadas con Prisma Migrate
- [ ] Logs estructurados, health checks y métricas Prometheus con tableros de Grafana
- [ ] Control de acceso por roles (CASL)
- [ ] Prueba de carga de la ingesta de puntos GPS con k6 (fase final)

---

## 16. Roadmap por fases

Cada fase termina con su criterio de aceptación cumplido y los tests en verde.

### Fase 0 — Fundaciones

- Monorepo (pnpm + Turborepo), `packages/config`, TypeScript strict, ESLint, Prettier.
- Docker Compose con PostGIS y Redis.
- API NestJS mínima con `/health/live` y `/health/ready`, logs JSON y Swagger.
- Las dos apps Expo creadas y corriendo en emulador Android.
- GitHub Actions con lint, typecheck y tests.
- ADRs 0001 a 0003.

**Aceptación:** `pnpm install && pnpm test` funciona en limpio; CI en verde; ambas apps abren en Android.

### Fase 1 — Datos, autenticación y permisos

- Esquema Prisma inicial (sección 10) con migraciones.
- Registro, login, JWT con refresh rotativo e invitaciones.
- Organizaciones, membresías y permisos CASL en `packages/domain`.
- CRUD de vehículos, colegios, rutas y estudiantes; vinculación de acudientes; autorización de datos.

**Aceptación:** tests de integración demuestran que un acudiente no puede leer datos de estudiantes que no son suyos.

### Fase 2 — Paradas y optimización

- Geocodificación detrás de una interfaz y confirmación del pin en el mapa (app del conductor).
- OSRM con el Valle de Aburrá (recorte del extracto de Colombia de OpenStreetMap) y VROOM en Docker. Ya montados en la Etapa 1 del plan (`infra/routing`); en esta fase la API los empieza a usar.
- Endpoint de optimización para ida y vuelta.
- Heurística de respaldo en `packages/domain` con tests.
- Lista y mapa del orden óptimo en la app del conductor.

**Aceptación:** con 15 paradas reales de prueba en Medellín, la ruta más rápida se calcula en menos de 2 s, con todas las paradas incluidas.

### Fase 3 — Recorrido en vivo

- Generación diaria de recorridos.
- Iniciar y finalizar recorrido; rastreo en segundo plano con servicio en primer plano, cola local SQLite e ingesta por lotes.
- Navegación parada por parada: elegir Waze o Google Maps, abrirlos con un enlace por parada e **Ir a la siguiente** ([ADR 0010](adr/0010-navegacion-waze-google-maps.md)).
- Gateway WebSocket con salas autorizadas y Redis adapter.
- Cálculo de hora estimada por parada.
- GPS siempre activo: requisitos para iniciar, alerta al conductor si se apaga y aviso al admin si el recorrido deja de enviar ubicación (sección 7.2.1).
- Mapa en vivo en la app de acudientes: vehículo, su parada y el progreso ("parada 3 de 12"), nada más, y solo hasta que dejan a su hijo.

**Aceptación:** con la pantalla apagada o Waze en primer plano durante 30 min, el rastreo no se interrumpe; un acudiente de otro recorrido no puede unirse a la sala.

### Fase 4 — Eventos y notificaciones

- Máquina de estados de paradas en `packages/domain`.
- Aviso de "en camino" al tocar **Ir a la parada**; detección de "va llegando" y "llegó" en el servidor.
- Marcado de recogido, entregado y no salió solo en la dirección (GPS), con motivo cuando se fuerza.
- Notificaciones push con el catálogo de la sección 13, idempotentes, en las dos apps.

**Aceptación:** en una simulación de recorrido, cada acudiente recibe exactamente una notificación por evento.

### Fase 5 — "Hoy no va" e historial

- Ausencias desde la tarjeta de cada hijo (sección 6.6): **Hoy no va** con la casilla **Tampoco regresa**, **No regresa en la ruta** hasta que inicia la vuelta, **Deshacer** y **Avisar para otro día**; aviso inmediato al conductor; recálculo durante el recorrido e **Ir a la siguiente** desde la posición actual.
- "No va en la ruta de regreso" marcado por el conductor o el acompañante, con aviso al acudiente.
- Historial de recorridos (horas de paso por parada).
- Job de retención de datos y registro de accesos a la ubicación.

**Aceptación:** marcar "hoy no va" con el recorrido en curso avisa al conductor y actualiza su orden en menos de 5 s.

### Fase 6 — Calidad y lanzamiento

- Métricas Prometheus y tableros de Grafana.
- Prueba de carga con k6 (meta inicial: 200 recorridos simultáneos con un punto cada 5 s).
- Revisión de seguridad y privacidad.
- Cumplimiento de Google Play: aviso visible, video de ubicación en segundo plano, seguridad de datos, política de privacidad.
- Prueba cerrada con 12+ testers durante 14 días.

**Aceptación:** apps aprobadas para producción en Google Play.

---

## 17. Plan de validación (piloto)

Una ruta real (idealmente de una empresa legal de transporte especial), durante al menos 2 semanas.

| Métrica                   | Cómo se mide                                                                 |
| ------------------------- | ---------------------------------------------------------------------------- |
| Error de la hora estimada | Diferencia entre la hora estimada 5 min antes y la llegada real              |
| Minutos ahorrados         | Duración del recorrido con el orden de la app vs. el orden habitual          |
| Notificaciones a tiempo   | % de "va llegando" enviadas entre 3 y 7 min antes de la llegada              |
| Paradas marcadas sin GPS  | % de paradas marcadas con motivo; si es alto, el radio o los pines están mal |
| Uso de los acudientes     | Aperturas por día y por acudiente                                            |
| Estabilidad               | % de sesiones sin fallos; recorridos sin cortes de rastreo                   |

---

## 18. Decisiones abiertas

1. Método de autenticación de acudientes: correo y contraseña (MVP) o código por SMS/WhatsApp (más fácil para papás, pero con costo).
2. Proveedor de geocodificación y de mapas (ADR 0008), con precios verificados.
3. Días de retención de puntos GPS y de eventos de parada (validar con la Ley 1581).
4. Obligaciones del Decreto 1048 de 2026 que deben convertirse en funcionalidades.
5. Identificadores definitivos de las apps en Google Play.
6. Modelo de negocio, si el piloto funciona (cobro a la empresa de transporte por vehículo, por ejemplo).

---

## 19. Referencias

- Expo Location: https://docs.expo.dev/versions/latest/sdk/location/
- Expo Notifications: https://docs.expo.dev/push-notifications/overview/
- Google Play — ubicación en segundo plano: https://support.google.com/googleplay/android-developer/answer/9799150
- Google Play — requisitos de prueba para cuentas personales nuevas: https://support.google.com/googleplay/android-developer/answer/14151465
- OSRM: https://github.com/Project-OSRM/osrm-backend
- VROOM: https://github.com/VROOM-Project/vroom
- Extracto de OpenStreetMap de Colombia (Geofabrik): https://download.geofabrik.de/south-america/colombia.html
- PostGIS: https://postgis.net/documentation/
- NestJS: https://docs.nestjs.com
- Prisma: https://www.prisma.io/docs
- Socket.IO Redis adapter: https://socket.io/docs/v4/redis-adapter/
- CASL: https://casl.js.org
- Testcontainers: https://testcontainers.com
- k6: https://grafana.com/docs/k6/latest/
- Modelo C4: https://c4model.com
- ADRs con MADR: https://adr.github.io/madr/
- Decreto 1048 de 2026 (nota de prensa): https://newsroom.rcnradio.com/colombia/rutas-escolares-en-colombia-tendran-nuevos-requisitos-para-el-transporte-de-menores
- Ley 1581 de 2012 (protección de datos personales): consultar el texto oficial en el sitio de la Función Pública o de la SIC
