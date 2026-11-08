// Genera las cabeceras de los correos (diseño F) como PNG a 2x, con Hanken Grotesk.
// Uso: pnpm --filter @enruta2/api correo:imagenes
//
// Los correos no pueden usar SVG ni fuentes web en Gmail, así que la cabecera va como imagen
// incrustada (CID) y el resto del correo es HTML con fuentes del sistema.

import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const API = join(dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = join(API, 'src', 'mail', 'templates', 'images');

// Las fuentes vienen del paquete que ya usa la app móvil.
const desdeMovil = createRequire(join(API, '..', 'mobile', 'package.json'));
const fuente = (peso) =>
  desdeMovil.resolve(`@expo-google-fonts/hanken-grotesk/${peso}/HankenGrotesk_${peso}.ttf`);

const C = {
  marino: '#0F1F3D',
  naranja: '#F26B1D',
  naranjaIcono: '#C2510F',
  grisClaro: '#C3CAD8',
  blanco: '#FFFFFF',
  superficie: '#F6F7F9',
  manzana: '#E6E8E1',
  rio: '#C9DCEB',
  parque: '#D4E4CC',
};

const ANCHO = 560;
const PIN =
  'M32 3 C18.2 3 8 13.6 8 27 C8 44.5 32 61 32 61 C32 61 56 44.5 56 27 C56 13.6 45.8 3 32 3 Z';
const RUTA_DOS = 'M19 25 C19 15 45 14 45 26 C45 35 27 39 19 49 L46 49';

/** Logo del pin en (x, y) con `tamano` px. */
function pinLogo({ x, y, tamano, fondo, trazo }) {
  const s = tamano / 64;
  return `
  <g transform="translate(${x} ${y}) scale(${s})">
    <path d="${PIN}" fill="${fondo}"/>
    <g transform="translate(32 27) scale(0.56) translate(-32.5 -32)">
      <path d="${RUTA_DOS}" fill="none" stroke="${trazo}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="46" cy="49" r="8" fill="${C.naranja}" stroke="${fondo}" stroke-width="3"/>
    </g>
  </g>`;
}

/** Recorte con las esquinas de arriba redondeadas (la tarjeta del correo tiene radio 20). */
function recorte(alto) {
  return `<clipPath id="tarjeta"><path d="M0 20 Q0 0 20 0 L${ANCHO - 20} 0 Q${ANCHO} 0 ${ANCHO} 20 L${ANCHO} ${alto} L0 ${alto} Z"/></clipPath>`;
}

/** Borde de la hoja blanca que sube sobre la cabecera, como en la app. */
function hoja(alto) {
  const y = alto - 26;
  return `<path d="M0 ${y + 30} Q0 ${y} 30 ${y} L${ANCHO - 30} ${y} Q${ANCHO} ${y} ${ANCHO} ${y + 30} L${ANCHO} ${alto} L0 ${alto} Z" fill="${C.blanco}"/>`;
}

function svg(alto, defs, contenido) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${alto}" viewBox="0 0 ${ANCHO} ${alto}">
  <defs>${recorte(alto)}${defs}</defs>
  <g clip-path="url(#tarjeta)">${contenido}</g>
</svg>`;
}

function guardar(nombre, codigo) {
  const png = new Resvg(codigo, {
    fitTo: { mode: 'width', value: ANCHO * 2 },
    font: {
      fontFiles: ['500Medium', '700Bold', '800ExtraBold'].map(fuente),
      loadSystemFonts: false,
      defaultFontFamily: 'Hanken Grotesk',
    },
  })
    .render()
    .asPng();
  writeFileSync(join(DESTINO, nombre), png);
  console.log(`${nombre}: ${(png.length / 1024).toFixed(0)} KB`);
}

// ── Acudiente: el mapa ilustrado con la ruta en vivo y la píldora de la marca ──────────────
{
  const alto = 210;
  const puntos = [
    [36, 168],
    [104, 140],
    [176, 128],
    [246, 100],
    [318, 92],
    [392, 66],
    [470, 58],
  ];
  const vehiculo = 3;
  const tuParada = 5;
  const linea = (ps) => ps.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  const [vx, vy] = puntos[vehiculo];
  const [px, py] = puntos[tuParada];

  const defs = `
    <pattern id="manzanas" width="96" height="72" patternUnits="userSpaceOnUse" patternTransform="rotate(-16)">
      <rect width="82" height="58" rx="6" fill="${C.manzana}"/>
    </pattern>
    <filter id="sombra" x="-20%" y="-40%" width="140%" height="200%">
      <feDropShadow dx="0" dy="4" stdDeviation="7" flood-color="${C.marino}" flood-opacity="0.16"/>
    </filter>`;

  const paradas = puntos
    .map(([x, y], i) => {
      if (i === vehiculo || i === tuParada) return '';
      return i < vehiculo
        ? `<circle cx="${x}" cy="${y}" r="5" fill="${C.marino}"/>`
        : `<circle cx="${x}" cy="${y}" r="5" fill="${C.blanco}" stroke="${C.marino}" stroke-width="2.5"/>`;
    })
    .join('');

  const contenido = `
    <rect width="${ANCHO}" height="${alto}" fill="${C.blanco}"/>
    <rect width="${ANCHO}" height="${alto}" fill="url(#manzanas)"/>
    <rect x="380" y="128" width="110" height="64" rx="12" fill="${C.parque}" transform="rotate(-16 435 160)"/>
    <rect x="40" y="40" width="80" height="50" rx="12" fill="${C.parque}" transform="rotate(-16 80 65)"/>
    <path d="M-20 200 L580 30" stroke="${C.blanco}" stroke-width="13"/>
    <path d="M300 -20 L360 240" stroke="${C.blanco}" stroke-width="13"/>
    <path d="M150 -20 C190 60 120 120 180 190 S 230 260 220 300" fill="none" stroke="${C.rio}" stroke-width="30" stroke-linecap="round"/>
    <path d="${linea(puntos.slice(vehiculo))}" fill="none" stroke="${C.marino}" stroke-opacity="0.5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 10"/>
    <path d="${linea(puntos.slice(0, vehiculo + 1))}" fill="none" stroke="${C.marino}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    ${paradas}
    <circle cx="${vx}" cy="${vy}" r="28" fill="${C.naranja}" opacity="0.18"/>
    <circle cx="${vx}" cy="${vy}" r="14" fill="${C.naranja}" stroke="${C.blanco}" stroke-width="3.5"/>
    <path d="M${vx - 5} ${vy + 5} L${vx} ${vy - 7} L${vx + 5} ${vy + 5} L${vx} ${vy + 2} Z" fill="${C.blanco}" transform="rotate(55 ${vx} ${vy})"/>
    <g transform="translate(${px} ${py}) translate(-18 -34) scale(0.56)">
      <path d="${PIN}" fill="${C.marino}" stroke="${C.blanco}" stroke-width="4"/>
      <circle cx="32" cy="27" r="9" fill="${C.naranja}"/>
    </g>
    <g filter="url(#sombra)">
      <rect x="20" y="20" width="164" height="48" rx="24" fill="${C.blanco}"/>
    </g>
    ${pinLogo({ x: 26, y: 24, tamano: 40, fondo: C.marino, trazo: C.blanco })}
    <text x="70" y="53" font-family="Hanken Grotesk" font-weight="800" font-size="25" letter-spacing="-1" fill="${C.marino}">enruta<tspan fill="${C.naranjaIcono}">2</tspan></text>
    ${hoja(alto)}`;

  guardar('header-guardian.png', svg(alto, defs, contenido));
}

// ── Conductor: el encabezado azul marino con el "2" de fondo ─────────────────────────────
{
  const alto = 200;
  const contenido = `
    <rect width="${ANCHO}" height="${alto}" fill="${C.marino}"/>
    <g transform="translate(300 -96) scale(5.4)" opacity="0.09">
      <path d="${RUTA_DOS}" fill="none" stroke="${C.blanco}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    ${pinLogo({ x: 30, y: 30, tamano: 52, fondo: C.blanco, trazo: C.marino })}
    <text x="92" y="66" font-family="Hanken Grotesk" font-weight="800" font-size="38" letter-spacing="-1.6" fill="${C.blanco}">enruta<tspan fill="${C.naranja}">2</tspan></text>
    <text x="94" y="94" font-family="Hanken Grotesk" font-weight="700" font-size="13" letter-spacing="2.6" fill="${C.grisClaro}">CONDUCTOR</text>
    ${hoja(alto)}`;

  guardar('header-driver.png', svg(alto, '', contenido));
}
