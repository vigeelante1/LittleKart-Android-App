import { describe, expect, it } from 'vitest';
import { relatedProducts, type Product } from '../src';
import { products, seedCatalog, shelvesOf } from '../src/seed';

const byId = new Map(products.map((p) => [p.id, p]));

describe('relatedProducts (product page, D-97)', () => {
  it('lists the same shelf, closest price first, never the product itself', () => {
    const p = byId.get('good-day-cashew')!;
    const { similar } = seedCatalog.related(p.id);
    expect(similar.length).toBeGreaterThan(2);
    expect(similar.every((s) => s.categoryId === p.categoryId && s.id !== p.id)).toBe(true);
    const gaps = similar.map((s) => Math.abs(s.variants[0]!.price - p.variants[0]!.price));
    expect(gaps).toEqual([...gaps].sort((a, b) => a - b));
  });

  it('covers every shelf of the tile in "popular", biggest discount first, without repeating the first similar ones', () => {
    const { similar, popular } = seedCatalog.related('chicken-boneless');
    const shelves = shelvesOf('chicken');
    expect(shelves).toEqual(expect.arrayContaining(['chicken', 'mutton', 'fish']));
    expect(popular.every((p) => shelves.includes(p.categoryId))).toBe(true);
    expect(popular.some((p) => p.categoryId !== 'chicken')).toBe(true);
    const firstSimilar = new Set(similar.slice(0, 4).map((p) => p.id));
    expect(popular.some((p) => firstSimilar.has(p.id))).toBe(false);
    expect(seedCatalog.related('chicken-boneless').tileId).toBe('fresh-meat-fish');
    expect(seedCatalog.related('good-day-cashew').tileId).toBe('biscuits-cookies');
  });

  it('leaves sold-out products out and keeps to the limit', () => {
    const p = byId.get('maggi-masala')!;
    const soldOut: Product = { ...byId.get('top-ramen')!, variants: byId.get('top-ramen')!.variants.map((v) => ({ ...v, stock: 0 })) };
    const catalog = products.map((x) => (x.id === soldOut.id ? soldOut : x));
    const { similar, popular } = relatedProducts(p, catalog, shelvesOf(p.categoryId), 3);
    expect(similar.map((x) => x.id)).not.toContain('top-ramen');
    expect(similar.length).toBeLessThanOrEqual(3);
    expect(popular.length).toBeLessThanOrEqual(3);
  });

  it('answers empty lists for an unknown product', () => {
    expect(seedCatalog.related('nope')).toEqual({ similar: [], popular: [], tileId: null });
  });
});
