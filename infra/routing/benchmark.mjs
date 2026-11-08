// Prueba de riesgo de la Etapa 1: ¿OSRM + VROOM calculan el orden de 15 paradas reales del
// Valle de Aburrá en menos de 2 s y respetan la hora de entrada? (criterio de la Fase 2)
//
//   pnpm routing:up && pnpm routing:benchmark
//
// Variables opcionales: OSRM_URL (por defecto http://localhost:5000),
// VROOM_URL (por defecto http://localhost:3001), RUNS (por defecto 5).

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OSRM_URL = process.env.OSRM_URL ?? 'http://localhost:5000';
const VROOM_URL = process.env.VROOM_URL ?? 'http://localhost:3001';
const RUNS = Number(process.env.RUNS ?? 5);

const SERVICE_SECONDS = 60; // tiempo de servicio por parada (spec: Stop.serviceSeconds)
const LIMIT_MS = 2_000; // criterio de aceptación de la Fase 2

const ROOT = dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(await readFile(join(ROOT, 'fixtures', 'medellin.json'), 'utf8'));
const { start, school, stops } = fixture;

const coord = (p) => [p.lon, p.lat];
const minutes = (seconds) => `${(seconds / 60).toFixed(1)} min`;
const km = (meters) => `${(meters / 1000).toFixed(1)} km`;

async function waitFor(name, url) {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
  throw new Error(`${name} no responde en ${url}. ¿Corriste pnpm routing:up?`);
}

async function vroom(problem) {
  const startedAt = performance.now();
  const response = await fetch(VROOM_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(problem),
  });
  const elapsedMs = performance.now() - startedAt;
  const body = await response.json();
  if (!response.ok || body.code !== 0) {
    throw new Error(`VROOM respondió ${response.status}: ${JSON.stringify(body).slice(0, 300)}`);
  }
  return { body, elapsedMs };
}

// Ruta de OSRM por los puntos en el orden dado (VROOM sin geometría no devuelve distancias).
async function osrmRoute(points) {
  const path = points.map((p) => coord(p).join(',')).join(';');
  const body = await (await fetch(`${OSRM_URL}/route/v1/driving/${path}?overview=false`)).json();
  if (body.code !== 'Ok') throw new Error(`OSRM /route: ${body.code}`);
  return body.routes[0];
}

function jobs() {
  return stops.map((stop, index) => ({
    id: index + 1,
    location: coord(stop),
    service: SERVICE_SECONDS,
  }));
}

function toSchool(timeWindow) {
  return {
    vehicles: [
      {
        id: 1,
        profile: 'car',
        start: coord(start),
        end: coord(school),
        ...(timeWindow ? { time_window: [0, timeWindow] } : {}),
      },
    ],
    jobs: jobs(),
  };
}

function toHome() {
  // Vuelta: sale del colegio y no tiene punto final (ruta abierta).
  return { vehicles: [{ id: 1, profile: 'car', start: coord(school) }], jobs: jobs() };
}

function describeRoute(body) {
  const route = body.routes[0];
  const ordered = route.steps.filter((s) => s.type === 'job').map((s) => stops[s.id - 1]);
  const end = route.steps.at(-1);
  return {
    ordered,
    order: ordered.map((stop) => stop.name),
    // En la ida, `end` es el colegio; en la vuelta (sin punto final), la última parada.
    arrival: end.arrival,
    unassigned: body.unassigned.length,
  };
}

function stats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return { median: sorted[Math.floor(sorted.length / 2)], max: sorted.at(-1) };
}

async function main() {
  await waitFor('OSRM', `${OSRM_URL}/nearest/v1/driving/${coord(school).join(',')}`);
  await waitFor('VROOM', VROOM_URL);

  console.log(
    `Escenario: ${stops.length} paradas, salida desde ${start.name}, colegio ${school.name}`,
  );
  console.log(
    `Tiempo de servicio por parada: ${SERVICE_SECONDS} s. Corridas por escenario: ${RUNS}.\n`,
  );

  // 1. Matriz de tiempos de OSRM (la base de todo el cálculo).
  const points = [start, ...stops, school].map((p) => coord(p).join(',')).join(';');
  let t = performance.now();
  const table = await (await fetch(`${OSRM_URL}/table/v1/driving/${points}`)).json();
  if (table.code !== 'Ok') throw new Error(`OSRM /table: ${table.code}`);
  console.log(
    `OSRM /table ${stops.length + 2}×${stops.length + 2}: ${(performance.now() - t).toFixed(0)} ms`,
  );

  // 2. Ida sin hora límite: el orden óptimo y su duración.
  const times = [];
  let best;
  for (let i = 0; i < RUNS; i++) {
    const { body, elapsedMs } = await vroom(toSchool());
    times.push(elapsedMs);
    best = body;
  }
  const ida = describeRoute(best);
  const idaStats = stats(times);
  const idaRoute = await osrmRoute([start, ...ida.ordered, school]);
  console.log('\n— Ida (TO_SCHOOL), orden óptimo —');
  console.log(
    `Cálculo: mediana ${idaStats.median.toFixed(0)} ms, máximo ${idaStats.max.toFixed(0)} ms`,
  );
  console.log(
    `Llegada al colegio: ${minutes(ida.arrival)} después de salir · distancia ${km(idaRoute.distance)}`,
  );
  ida.order.forEach((name, i) => console.log(`  ${String(i + 1).padStart(2)}. ${name}`));

  // 3. El mismo recorrido en el orden de la lista, sin optimizar.
  const naive = await osrmRoute([start, ...stops, school]);
  const naiveArrival = naive.duration + stops.length * SERVICE_SECONDS;
  const saved = naiveArrival - ida.arrival;
  console.log('\n— Mismo recorrido en el orden de la lista (sin optimizar) —');
  console.log(
    `Llegada: ${minutes(naiveArrival)} · distancia ${km(naive.distance)} · ` +
      `la optimización ahorra ${minutes(saved)} (${((saved / naiveArrival) * 100).toFixed(0)} %) ` +
      `y ${km(naive.distance - idaRoute.distance)}`,
  );

  // 4. Hora límite alcanzable: entrada al colegio 10 min después de la llegada óptima.
  const reachable = await vroom(toSchool(ida.arrival + 600));
  console.log('\n— Ida con hora límite alcanzable —');
  console.log(`Paradas sin asignar: ${describeRoute(reachable.body).unassigned} (factible)`);

  // 5. Hora límite imposible: 60 % de la duración óptima.
  const tight = await vroom(toSchool(Math.round(ida.arrival * 0.6)));
  const tightRoute = describeRoute(tight.body);
  console.log('\n— Ida con hora límite imposible —');
  console.log(
    `VROOM no informa "inviable": deja ${tightRoute.unassigned} de ${stops.length} paradas sin asignar ` +
      `para cumplir la hora. Enruta2 nunca puede dejar a un niño por fuera.`,
  );

  // 6. Vuelta: ruta abierta desde el colegio.
  const vueltaTimes = [];
  let vueltaBody;
  for (let i = 0; i < RUNS; i++) {
    const { body, elapsedMs } = await vroom(toHome());
    vueltaTimes.push(elapsedMs);
    vueltaBody = body;
  }
  const vuelta = describeRoute(vueltaBody);
  const vueltaStats = stats(vueltaTimes);
  console.log('\n— Vuelta (TO_HOME), ruta abierta —');
  console.log(
    `Cálculo: mediana ${vueltaStats.median.toFixed(0)} ms, máximo ${vueltaStats.max.toFixed(0)} ms · ` +
      `última entrega a los ${minutes(vuelta.arrival)} · última parada: ${vuelta.order.at(-1)}`,
  );

  const worst = Math.max(idaStats.max, vueltaStats.max);
  console.log(
    `\n${worst < LIMIT_MS ? '✔' : '✖'} Peor tiempo de cálculo: ${worst.toFixed(0)} ms ` +
      `(criterio de la Fase 2: menos de ${LIMIT_MS} ms)`,
  );
  if (worst >= LIMIT_MS) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`✖ ${error.message}`);
  process.exit(1);
});
