// Renders the banner pictures to app/src/assets/banners/<name>.webp (800 × 480).
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { BANNERS } from './banners.mjs';
const out = new URL('../../app/src/assets/banners/', import.meta.url).pathname;
const tmp = process.env.TILE_TMP ?? '/tmp/banners-png';
mkdirSync(tmp, { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
const p = await b.newPage({ viewport: { width: 800, height: 480 } });
for (const [name, svg] of Object.entries(BANNERS)) {
  await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await p.screenshot({ path: `${tmp}/${name}.png` });
  execFileSync('python3', ['-c', `from PIL import Image; Image.open('${tmp}/${name}.png').convert('RGB').save('${out}${name}.webp','WEBP',quality=88,method=6)`]);
}
await b.close();
console.log('banners', Object.keys(BANNERS).length);
