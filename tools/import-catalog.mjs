#!/usr/bin/env node
// One-step catalog import (iteration 2, DECISIONS D-95): turns LittleKart's own product export into the
// app's catalog, so the app shows the real products and photos.
//
//   node tools/import-catalog.mjs <products.csv> [<images folder>]
//
// CSV columns (header row; names are matched without case, extra columns are ignored):
//   tile          home tile id or label, e.g. "chips" or "Chips" (must be one of the home tiles)
//   sub_category  left-rail group inside the tile, e.g. "Chicken"; empty = the tile itself
//   name          product name as shown, e.g. "Lay's India's Magic Masala"
//   size          size label, e.g. "52g"; one row per size, rows with the same name become one product
//   mrp           MRP in rupees (optional)
//   price         selling price in rupees
//   stock         units in stock (optional, default 50)
//   image         image file name inside <images folder>, e.g. "lays-magic.jpg" (optional)
//   Nutrition per 100 g, optional (DECISIONS D-101): calories, protein, carbs, sugars, fat, saturated_fat,
//   trans_fat, fibre, sodium_mg, per ("100g" or "100ml"), diet ("veg" or "nonveg"). With calories, protein,
//   carbs and fat filled, the product page shows "Nutritional info" and the cards show the matching tags.
//
// What it does:
//   1. Writes shared/src/seed/founderCatalog.ts (products and sub-categories). When that file has
//      products, the app and the API use them instead of the sample catalog.
//   2. Puts every image on the same 480 × 480 white square (78% fill, centred, soft shadow) as
//      app/src/assets/products/<product id>.webp and regenerates app/src/assets/productImages.ts.
//      Products without an image keep the drawn picture style (a neutral placeholder until drawn).
//   3. Prints anything it could not place (unknown tile, missing price, missing image file).
// Then run: npm run typecheck && npm test, and rebuild the app.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [csvPath, imagesDir] = process.argv.slice(2);
if (!csvPath) {
  console.error('Usage: node tools/import-catalog.mjs <products.csv> [<images folder>]');
  process.exit(1);
}

/** Minimal CSV parser: commas, quoted fields, doubled quotes, CRLF. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f.trim())) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim())) rows.push(row);
  return rows;
}

const slug = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'item';

// Home tiles from the catalog source (ids and labels), read as text so this script needs no TypeScript.
const catalogSrc = readFileSync(join(root, 'shared/src/seed/catalog.ts'), 'utf8');
const tiles = [...catalogSrc.matchAll(/tile\('([a-z0-9-]+)', '([^']+)'/g)].map(([, id, label]) => ({ id, label }));
const tileOf = (value) => {
  const v = value.trim().toLowerCase();
  return tiles.find((t) => t.id === v || t.label.toLowerCase() === v || slug(t.label) === slug(v));
};
const ITEM_TYPE = { 'fresh-meat-fish': 'meat', restaurants: 'food', 'print-zone': 'print' };

const [header, ...lines] = parseCsv(readFileSync(csvPath, 'utf8'));
const col = (name) => header.findIndex((h) => h.trim().toLowerCase().replace(/[\s-]+/g, '_') === name);
const C = { tile: col('tile'), sub: col('sub_category'), name: col('name'), size: col('size'), mrp: col('mrp'), price: col('price'), stock: col('stock'), image: col('image'),
  calories: col('calories'), protein: col('protein'), carbs: col('carbs'), sugars: col('sugars'), fat: col('fat'), saturated_fat: col('saturated_fat'),
  trans_fat: col('trans_fat'), fibre: col('fibre'), sodium_mg: col('sodium_mg'), per: col('per'), diet: col('diet') };
for (const k of ['tile', 'name', 'price']) if (C[k] < 0) { console.error(`Missing column "${k}"`); process.exit(1); }

const problems = [];
const products = new Map();
const subsByTile = new Map();
lines.forEach((r, n) => {
  const at = `row ${n + 2}`;
  const get = (k) => (C[k] >= 0 ? (r[C[k]] ?? '').trim() : '');
  const tile = tileOf(get('tile'));
  if (!tile) return problems.push(`${at}: unknown tile "${get('tile')}"`);
  const name = get('name');
  const price = Number(get('price'));
  if (!name || !(price > 0)) return problems.push(`${at}: needs a name and a price`);
  const subName = get('sub') || tile.label;
  const subId = get('sub') ? `${tile.id}--${slug(subName)}` : tile.id;
  if (!subsByTile.has(tile.id)) subsByTile.set(tile.id, new Map());
  subsByTile.get(tile.id).set(subId, subName);
  const key = `${subId}|${name.toLowerCase()}`;
  if (!products.has(key)) {
    let id = slug(name);
    while ([...products.values()].some((p) => p.id === id)) id += '-2';
    products.set(key, { id, categoryId: subId, name, itemType: ITEM_TYPE[tile.id] ?? 'product', variants: [], image: '' });
  }
  const p = products.get(key);
  const mrp = Number(get('mrp'));
  const stock = get('stock') === '' ? 50 : Math.max(0, Math.floor(Number(get('stock')) || 0));
  p.variants.push({ id: `${p.id}-${p.variants.length + 1}`, label: get('size') || '1 pc', price, ...(mrp > price ? { mrp } : {}), stock });
  if (!p.image && get('image')) p.image = get('image');
  // Nutrition from the first row of the product that has it.
  const num = (k) => (get(k) === '' || Number.isNaN(Number(get(k))) ? undefined : Number(get(k)));
  if (!p.nutrition && [num('calories'), num('protein'), num('carbs'), num('fat')].every((v) => v !== undefined)) {
    const opt = (k, key) => (num(k) !== undefined ? { [key]: num(k) } : {});
    const diet = get('diet').toLowerCase().replace(/[^a-z]/g, '');
    p.nutrition = {
      per: get('per').toLowerCase().includes('ml') ? '100ml' : '100g',
      energyKcal: num('calories'), protein: num('protein'), carbs: num('carbs'), fat: num('fat'),
      ...opt('sugars', 'sugars'), ...opt('saturated_fat', 'saturatedFat'), ...opt('trans_fat', 'transFat'), ...opt('fibre', 'fibre'), ...opt('sodium_mg', 'sodiumMg'),
      ...(diet === 'veg' ? { diet: 'veg' } : diet === 'nonveg' ? { diet: 'nonVeg' } : {}),
      source: 'LittleKart product data',
    };
  }
});

// Images: framed like every other product picture.
const productsDir = join(root, 'app/src/assets/products');
const frame = join(root, 'tools/frame-photo.py');
for (const p of products.values()) {
  if (!p.image) { problems.push(`${p.name}: no image (shows the neutral placeholder)`); continue; }
  const file = imagesDir ? join(imagesDir, p.image) : p.image;
  if (!existsSync(file)) { problems.push(`${p.name}: image file not found (${file})`); p.image = ''; continue; }
  execFileSync('python3', [frame, file, join(productsDir, `${p.id}.webp`)]);
}

const list = [...products.values()];
const subs = Object.fromEntries(
  [...subsByTile].map(([tileId, m]) => [tileId, [...m].map(([id, name]) => ({ id, name, imageUrl: `asset:t/${tileId}` }))]),
);
writeFileSync(
  join(root, 'shared/src/seed/founderCatalog.ts'),
  `// Generated by tools/import-catalog.mjs from LittleKart's product export (DECISIONS D-95). Do not edit by hand.\n` +
    `// When this list has products, the app and the API use it instead of the sample catalog.\n` +
    `import type { Product, SubCategory } from '../types';\n\n` +
    `export const founderProducts: Product[] = ${JSON.stringify(
      list.map(({ image, ...p }) => ({ ...p, imageUrl: image ? `asset:p/${p.id}` : 'asset:product', couponExempt: p.itemType === 'meat' })),
      null,
      2,
    )};\n\nexport const founderSubCategories: Record<string, SubCategory[]> = ${JSON.stringify(subs, null, 2)};\n`,
);

// Registry of bundled product images (every .webp in the folder).
const ids = readdirSync(productsDir).filter((f) => f.endsWith('.webp')).map((f) => f.slice(0, -5)).sort();
writeFileSync(
  join(root, 'app/src/assets/productImages.ts'),
  `// Generated (iteration 2, DECISIONS D-82, D-95): bundled product images, one per product id.\n` +
    `// Photos: Open Food Facts / Wikimedia Commons or LittleKart's own (credits in CREDITS.md). Drawn pictures: made for this app.\n` +
    `export const productImages: Record<string, number> = {\n${ids.map((id) => `  '${id}': require('./products/${id}.webp'),`).join('\n')}\n};\n`,
);

console.log(`Imported ${list.length} products in ${subsByTile.size} tiles (${list.reduce((n, p) => n + p.variants.length, 0)} sizes).`);
if (problems.length) console.log(`\nNeeds a look (${problems.length}):\n- ${problems.join('\n- ')}`);
console.log('\nNext: npm run typecheck && npm test, then rebuild the app.');
