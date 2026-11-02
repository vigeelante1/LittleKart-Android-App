// Every home category, checked one by one (iteration 2): products, prices, sizes and the bundled image.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { banners, categories, dealProductIds, products, recommendationIds, sections, seedCatalog } from '../src/seed';
import { drawnCardIds } from '../src/seed/images';

const ASSETS = join(__dirname, '../../app/src/assets');
const registry = readFileSync(join(ASSETS, 'productImages.ts'), 'utf8');
const ITEM_TYPES = new Set(['food', 'meat', 'print', 'product']);

/** Width and height of a .webp file, read from its header. */
function webpSize(file: string): [number, number] {
  const b = readFileSync(file);
  expect(b.toString('ascii', 0, 4)).toBe('RIFF');
  expect(b.toString('ascii', 8, 12)).toBe('WEBP');
  const chunk = b.toString('ascii', 12, 16);
  if (chunk === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (chunk === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
  if (chunk === 'VP8X') return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
  throw new Error(`Unknown webp chunk ${chunk} in ${file}`);
}

const imageId = (url: string) => (url.startsWith('asset:p/') ? url.slice('asset:p/'.length) : null);
const tileId = (url: string) => (url.startsWith('asset:t/') ? url.slice('asset:t/'.length) : null);
const tileRegistry = readFileSync(join(ASSETS, 'tileImages.ts'), 'utf8');
/** Drawn tile pictures (D-94): a registered 480 × 480 webp for every home tile, category and sub-category. */
function expectTilePicture(url: string) {
  const id = tileId(url);
  expect(id, url).not.toBeNull();
  const file = join(ASSETS, 'tiles', `${id}.webp`);
  expect(existsSync(file), url).toBe(true);
  expect(webpSize(file), url).toEqual([480, 480]);
  expect(tileRegistry.includes(`'${id}': require('./tiles/${id}.webp')`), url).toBe(true);
}

describe.each(sections.flatMap((s) => s.tiles.map((t) => ({ section: s.title, tile: t }))))(
  '$section › $tile.label',
  ({ tile }) => {
    const subs = seedCatalog.subCategories(tile.id);

    it('opens at least one sub-category, each with products', () => {
      expect(subs.length).toBeGreaterThan(0);
      for (const sub of subs) expect(seedCatalog.products(sub.id).length, sub.name).toBeGreaterThanOrEqual(2);
    });

    it('has a tile icon and sub-category icons that exist', () => {
      for (const url of [tile.imageUrl, ...subs.map((s) => s.imageUrl)]) expectTilePicture(url);
    });

    it('lists products with a name, valid sizes and prices', () => {
      for (const sub of subs) {
        for (const p of seedCatalog.products(sub.id)) {
          expect(p.name.trim().length, p.id).toBeGreaterThan(0);
          expect(ITEM_TYPES.has(p.itemType), p.id).toBe(true);
          expect(p.variants.length, p.id).toBeGreaterThan(0);
          for (const v of p.variants) {
            expect(v.label.trim().length, v.id).toBeGreaterThan(0);
            expect(v.price, v.id).toBeGreaterThan(0);
            if (v.mrp !== undefined) expect(v.mrp, v.id).toBeGreaterThanOrEqual(v.price);
            expect(v.stock, v.id).toBeGreaterThanOrEqual(0);
          }
        }
      }
    });

    it('gives every product its own bundled 480 × 480 image, registered in the app', () => {
      for (const sub of subs) {
        for (const p of seedCatalog.products(sub.id)) {
          expect(p.imageUrl, p.id).toBe(`asset:p/${p.id}`);
          const file = join(ASSETS, 'products', `${p.id}.webp`);
          expect(existsSync(file), file).toBe(true);
          expect(webpSize(file), p.id).toEqual([480, 480]);
          expect(registry.includes(`'${p.id}': require('./products/${p.id}.webp')`), p.id).toBe(true);
        }
      }
    });

    it('shows products with photos before drawn cards', () => {
      for (const sub of subs) {
        const flags = seedCatalog.products(sub.id).map((p) => (drawnCardIds.has(p.id) ? 1 : 0));
        expect(flags, sub.name).toEqual([...flags].sort((a, b) => a - b));
      }
    });
  },
);

describe('catalog as a whole', () => {
  it('has unique product ids and no product outside a home category', () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    const reachable = new Set(
      sections.flatMap((s) => s.tiles).flatMap((t) => seedCatalog.subCategories(t.id)).flatMap((sub) => seedCatalog.products(sub.id).map((p) => p.id)),
    );
    expect(ids.filter((id) => !reachable.has(id))).toEqual([]);
  });

  it('has no unused images and no image for a product that does not exist', () => {
    const registered = [...registry.matchAll(/'([a-z0-9-]+)': require/g)].map((m) => m[1]);
    expect(new Set(registered)).toEqual(new Set(products.map((p) => p.id)));
  });

  it('points strip categories, banners, deals and suggestions at real things', () => {
    for (const c of categories) expectTilePicture(c.imageUrl);
    const tileIds = new Set(sections.flatMap((s) => s.tiles.map((t) => t.id)));
    for (const b of banners) if (b.targetTileId) expect(tileIds.has(b.targetTileId), b.id).toBe(true);
    expect(seedCatalog.byIds(dealProductIds)).toHaveLength(dealProductIds.length);
    expect(seedCatalog.byIds(recommendationIds)).toHaveLength(recommendationIds.length);
  });
});
