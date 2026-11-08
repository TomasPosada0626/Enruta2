// Prepara los datos de ruteo de OSRM para el Valle de Aburrá.
//
//   pnpm routing:prepare
//
// 1. Descarga el extracto de Colombia de Geofabrik (si no existe) y verifica su MD5.
// 2. Renumera los nodos con osmium. El recorte marca los IDs de nodo en un mapa de bits
//    que cubre todo el rango de IDs de OSM (más de 13 mil millones), y como los nodos del
//    valle están repartidos por todo ese rango, sin renumerar pide más de 2 GB. Con IDs
//    consecutivos (1, 2, 3…) el mapa ocupa unos pocos MB. Los IDs de vías y relaciones
//    se conservan; los de nodo del recorte ya no son los de OpenStreetMap.
// 3. Recorta el Valle de Aburrá con osmium: el extracto completo necesita más memoria
//    de la que Docker suele tener en un equipo de desarrollo.
// 4. Procesa el recorte con OSRM (perfil de carro, algoritmo MLD).
//
// Todo queda en infra/routing/data, que no se versiona.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { rename, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DATA = join(ROOT, 'data');

const SOURCE_URL = 'https://download.geofabrik.de/south-america/colombia-latest.osm.pbf';
const COUNTRY_FILE = 'colombia-latest.osm.pbf';
// Intermedio: se borra al terminar el recorte.
const RENUMBERED_FILE = 'colombia-nodos-renumerados.osm.pbf';

const REGION = 'valle-aburra';
// Los 10 municipios del Valle de Aburrá, de Caldas a Barbosa, con sus zonas rurales.
// Límites de OpenStreetMap (2026-11): -75.719,5.978,-75.217,6.509; aquí con ~3 km de margen.
// Orden: oeste,sur,este,norte.
const REGION_BBOX = '-75.75,5.95,-75.19,6.54';

const OSRM_IMAGE = 'ghcr.io/project-osrm/osrm-backend:v26.11.0-debian';
const OSMIUM_IMAGE = 'enruta2/osmium:local';

// Límite de memoria por contenedor: si un paso se pasa, falla solo ese contenedor
// en vez de tumbar la máquina virtual de Docker. Se puede subir con ROUTING_MEMORY=3g.
const MEMORY_LIMIT = process.env.ROUTING_MEMORY ?? '2g';

function step(title) {
  console.log(`\n▶ ${title}`);
  return performance.now();
}

function done(start) {
  console.log(`  listo en ${((performance.now() - start) / 1000).toFixed(1)} s`);
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status === 137) {
    throw new Error(
      `El contenedor se quedó sin memoria (límite ${MEMORY_LIMIT}). ` +
        'Súbelo con ROUTING_MEMORY=3g o recorta un área más pequeña.',
    );
  }
  if (result.status !== 0) {
    throw new Error(`Falló: ${command} ${args.join(' ')} (código ${result.status})`);
  }
}

function docker(image, args) {
  run('docker', ['run', '--rm', '--memory', MEMORY_LIMIT, '-v', `${DATA}:/data`, image, ...args]);
}

async function md5(path) {
  const hash = createHash('md5');
  await pipeline(createReadStream(path), hash);
  return hash.digest('hex');
}

async function downloadCountry() {
  const target = join(DATA, COUNTRY_FILE);
  if (existsSync(target)) {
    const { mtime } = await stat(target);
    console.log(
      `  ya existe (${mtime.toISOString().slice(0, 10)}); bórralo para descargar uno nuevo`,
    );
    return;
  }

  const expected = (await (await fetch(`${SOURCE_URL}.md5`)).text()).split(/\s+/)[0];
  const response = await fetch(SOURCE_URL);
  if (!response.ok || !response.body) throw new Error(`Descarga fallida: HTTP ${response.status}`);

  const total = Number(response.headers.get('content-length') ?? 0);
  let received = 0;
  let lastReported = 0;
  const body = Readable.fromWeb(response.body);
  body.on('data', (chunk) => {
    received += chunk.length;
    const percent = total ? Math.floor((received / total) * 100) : 0;
    if (percent >= lastReported + 10) {
      lastReported = percent;
      console.log(`  ${percent} % (${(received / 1e6).toFixed(0)} MB)`);
    }
  });

  const partial = `${target}.part`;
  await pipeline(body, createWriteStream(partial));

  const actual = await md5(partial);
  if (actual !== expected) {
    await rm(partial);
    throw new Error(`MD5 no coincide: esperado ${expected}, obtenido ${actual}`);
  }
  await rename(partial, target);
  console.log(`  MD5 verificado (${actual})`);
}

async function main() {
  mkdirSync(DATA, { recursive: true });

  let t = step(`Extracto de Colombia (${SOURCE_URL})`);
  await downloadCountry();
  done(t);

  t = step('Imagen de osmium');
  run('docker', ['build', '-q', '-t', OSMIUM_IMAGE, '-f', join(ROOT, 'osmium.Dockerfile'), ROOT]);
  done(t);

  t = step('Renumeración de nodos (para que el recorte quepa en memoria)');
  docker(OSMIUM_IMAGE, [
    'renumber',
    '--object-type',
    'node',
    '--overwrite',
    '-o',
    `/data/${RENUMBERED_FILE}`,
    `/data/${COUNTRY_FILE}`,
  ]);
  done(t);

  t = step(`Recorte del Valle de Aburrá (bbox ${REGION_BBOX})`);
  docker(OSMIUM_IMAGE, [
    'extract',
    '--bbox',
    REGION_BBOX,
    '--strategy',
    'complete_ways',
    '--overwrite',
    '-o',
    `/data/${REGION}.osm.pbf`,
    `/data/${RENUMBERED_FILE}`,
  ]);
  await rm(join(DATA, RENUMBERED_FILE));
  done(t);

  t = step('OSRM: extract (perfil de carro)');
  docker(OSRM_IMAGE, ['osrm-extract', '-p', '/opt/car.lua', `/data/${REGION}.osm.pbf`]);
  done(t);

  t = step('OSRM: partition');
  docker(OSRM_IMAGE, ['osrm-partition', `/data/${REGION}.osrm`]);
  done(t);

  t = step('OSRM: customize');
  docker(OSRM_IMAGE, ['osrm-customize', `/data/${REGION}.osrm`]);
  done(t);

  console.log('\nDatos listos. Siguiente paso: pnpm routing:up');
}

main().catch((error) => {
  console.error(`\n✖ ${error.message}`);
  process.exit(1);
});
