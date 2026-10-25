import { describe, expect, it } from 'vitest';
import { banners, dealProductIds, products, recommendationIds, sections, subCategoriesByTile } from './catalog';
import { seedCatalog } from './queries';

describe('seed catalog (iteration 2 assortment)', () => {
  it('has unique product and variant ids', () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    const vids = products.flatMap((p) => p.variants.map((v) => v.id));
    expect(new Set(vids).size).toBe(vids.length);
  });

  it('fills every sub-category of every home tile', () => {
    for (const tile of sections.flatMap((s) => s.tiles)) {
      for (const sub of seedCatalog.subCategories(tile.id)) {
        expect(seedCatalog.products(sub.id).length, `${tile.id} › ${sub.id}`).toBeGreaterThanOrEqual(2);
      }
    }
    expect(Object.keys(subCategoriesByTile).length).toBeGreaterThan(0);
  });

  it('never prices above MRP and lists deals and suggestions that exist', () => {
    for (const p of products) for (const v of p.variants) if (v.mrp !== undefined) expect(v.price).toBeLessThanOrEqual(v.mrp);
    expect(seedCatalog.byIds(dealProductIds)).toHaveLength(dealProductIds.length);
    expect(seedCatalog.byIds(recommendationIds)).toHaveLength(recommendationIds.length);
  });

  it('uses https photos only, and banners open real tiles', () => {
    for (const p of products) expect(p.imageUrl.startsWith('https://') || p.imageUrl.startsWith('asset:')).toBe(true);
    const tileIds = new Set(sections.flatMap((s) => s.tiles.map((t) => t.id)));
    for (const b of banners) if (b.targetTileId) expect(tileIds.has(b.targetTileId)).toBe(true);
  });
});
