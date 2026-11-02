import { describe, expect, it } from 'vitest';
import { COMPLEMENTS, suggestProducts, type Product } from '../src';
import { products, recommendationIds, subCategoriesByTile, sections } from '../src/seed';

const byId = new Map(products.map((p) => [p.id, p]));
const shelf = (id: string) => byId.get(id)?.categoryId;

describe('suggestProducts (smart suggestions, D-90)', () => {
  it('suggests what goes with the cart first', () => {
    const recs = suggestProducts(['modern-bread'], products, recommendationIds);
    expect(shelf(recs[0]!.id)).toBe('sauces-spreads');
    const firstFour = recs.slice(0, 4).map((p) => shelf(p.id));
    expect(firstFour).toEqual(['sauces-spreads', 'biscuits-cookies', 'tea-coffee', 'cereals-breakfast']);
  });

  it('takes turns between cart items', () => {
    const recs = suggestProducts(['maggi-masala', 'lays-classic'], products, recommendationIds);
    // Noodles → sauces first, chips → cool drinks first.
    expect(recs.slice(0, 2).map((p) => shelf(p.id))).toEqual(['sauces-spreads', 'cool-drinks']);
  });

  it('never suggests cart items or sold-out products, and no duplicates', () => {
    const soldOut: Product = { ...byId.get('kissan-ketchup')!, variants: byId.get('kissan-ketchup')!.variants.map((v) => ({ ...v, stock: 0 })) };
    const catalog = products.map((p) => (p.id === soldOut.id ? soldOut : p));
    const recs = suggestProducts(['modern-bread', 'kissan-jam'], catalog, recommendationIds);
    const ids = recs.map((p) => p.id);
    expect(ids).not.toContain('modern-bread');
    expect(ids).not.toContain('kissan-jam');
    expect(ids).not.toContain('kissan-ketchup');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps to the limit and gives at most three from one shelf before the popular list', () => {
    const recs = suggestProducts(['harpic'], products, recommendationIds, 20);
    expect(recs.length).toBeLessThanOrEqual(20);
    const counts = new Map<string, number>();
    recs.forEach((p) => counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1));
    for (const [cat, n] of counts) if (!recommendationIds.some((id) => shelf(id) === cat)) expect(n).toBeLessThanOrEqual(3);
  });

  it('shows the popular list for an empty cart', () => {
    expect(suggestProducts([], products, recommendationIds).map((p) => p.id)).toEqual(recommendationIds.slice(0, 20));
  });

  it('never pushes meat, sexual wellness or adult diapers from another shelf', () => {
    const sensitive = new Set(['chicken', 'mutton', 'fish', 'sexual-wellness', 'adult-diapers']);
    for (const targets of Object.values(COMPLEMENTS)) for (const t of targets) expect(sensitive.has(t)).toBe(false);
  });

  it('only names shelves that exist', () => {
    const shelves = new Set(sections.flatMap((s) => s.tiles.flatMap((t) => (subCategoriesByTile[t.id] ?? [{ id: t.id }]).map((x) => x.id))));
    for (const [from, targets] of Object.entries(COMPLEMENTS)) {
      expect(shelves.has(from), from).toBe(true);
      for (const t of targets) expect(shelves.has(t), t).toBe(true);
    }
  });
});
