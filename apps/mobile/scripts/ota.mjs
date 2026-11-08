// Publica una actualización OTA (EAS Update) en el canal "preview".
// Los APK instalados la descargan al abrir la app y ofrecen reiniciar para usarla.
//
//   pnpm ota                       mensaje = asunto del último commit
//   pnpm ota "Arregla el selector"  mensaje propio
//
// Solo sirve para cambios de JavaScript, estilos e imágenes. Si cambian dependencias nativas
// (un paquete nuevo de Expo, por ejemplo), hay que subir "version" en app.json y crear un APK nuevo.

import { execSync, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const EAS = 'eas-cli@27.5.0';

const desdeArgumento = process.argv.slice(2).join(' ').trim();
const ultimoCommit = execSync('git log -1 --pretty=%s', { cwd: APP, encoding: 'utf8' }).trim();
// Sin comillas ni caracteres especiales de la consola (Windows usa cmd.exe con shell: true).
const mensaje = (desdeArgumento || ultimoCommit).replace(/["%^&|<>`$\\]/g, '').slice(0, 200);

console.log(`Publicando en el canal preview: «${mensaje}»\n`);

const resultado = spawnSync(
  'npx',
  [
    '-y',
    EAS,
    'update',
    '--channel',
    'preview',
    '--environment',
    'preview',
    '--platform',
    'android',
    '--message',
    `"${mensaje}"`,
    '--non-interactive',
  ],
  { cwd: APP, stdio: 'inherit', shell: true },
);

process.exit(resultado.status ?? 1);
