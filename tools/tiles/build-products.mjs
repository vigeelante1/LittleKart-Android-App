// Renders the drawn product pictures into app/src/assets/products/<id>.webp, framed like the photos.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { PRODUCTS as P1 } from './products.mjs';
import { PRODUCTS2 } from './products2.mjs';
const PRODUCTS = { ...P1, ...PRODUCTS2 };
const out = new URL('../../app/src/assets/products/', import.meta.url).pathname;
const tmp = process.env.TILE_TMP ?? '/tmp/products-png';
const frame = new URL('./frame.py', import.meta.url).pathname;
mkdirSync(tmp, { recursive: true });
const only = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
const p = await b.newPage({ viewport: { width: 480, height: 480 } });
for (const [id, svg] of Object.entries(PRODUCTS)) {
  if (only.length && !only.includes(id)) continue;
  await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
  await p.screenshot({ path: `${tmp}/${id}.png`, omitBackground: true });
  execFileSync('python3', [frame, `${tmp}/${id}.png`, `${out}${id}.webp`]);
}
await b.close();
console.log('products', Object.keys(PRODUCTS).length);
