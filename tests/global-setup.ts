import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const astroBin = path.join(root, 'node_modules', 'astro', 'bin', 'astro.mjs');

function build(base: string, outDir: string) {
  rmSync(path.join(root, outDir), { recursive: true, force: true });
  execFileSync(process.execPath, [astroBin, 'build'], {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      ASTRO_TELEMETRY_DISABLED: '1',
      BASE_PATH: base,
      OUT_DIR: outDir,
    },
  });
}

export default function setup() {
  build('/', 'dist');
  build('/mptour', 'dist-base');
}
