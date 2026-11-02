import { describe, expect, it } from 'vitest';
import { findSwap, findSwaps, MAX_SWAPS_PER_CART, parsePackSize, worthSwapping, type Product } from '../src';
import { drawnCardIds, products, seedCatalog, swapGroupOf, swapGroups } from '../src/seed';

const byId = new Map(products.map((p) => [p.id, p]));
const first = (id: string) => ({ productId: id, variantId: byId.get(id)!.variants[0]!.id });

describe('parsePackSize', () => {
  it.each([
    ['500g', { unit: 'g', amount: 500 }],
    ['1kg', { unit: 'g', amount: 1000 }],
    ['1L Pouch', { unit: 'ml', amount: 1000 }],
    ['2.25L', { unit: 'ml', amount: 2250 }],
    ['4 Pack (280g)', { unit: 'g', amount: 280 }],
    ['4 x 100g', { unit: 'g', amount: 400 }],
    ['250g (Pack of 4)', { unit: 'g', amount: 250 }],
    ['20 Pcs', { unit: 'pc', amount: 20 }],
    ['15 Pads', { unit: 'pc', amount: 15 }],
  ])('%s', (label, size) => expect(parsePackSize(label)).toEqual(size));

  it.each(['1 U', '1 Box', 'Free Size', '1 Set'])('%s has no size', (label) => expect(parsePackSize(label)).toBeNull());
});

describe('worthSwapping', () => {
  it('needs ₹3 and 3%', () => {
    expect(worthSwapping(40, 2)).toBe(false);
    expect(worthSwapping(40, 3)).toBe(true);
    expect(worthSwapping(330, 5)).toBe(false);
    expect(worthSwapping(330, 10)).toBe(true);
  });
});

describe('findSwap (Swap & save, D-91)', () => {
  const group = (id: string) => swapGroupOf(id);

  it('offers the cheaper basmati', () => {
    const offer = findSwap(first('india-gate-basmati'), byId, group('india-gate-basmati'), new Set());
    expect(offer).toMatchObject({ product: { id: 'daawat-basmati' }, saving: 64 });
  });

  it('never offers a dearer product, and none when already the cheapest', () => {
    expect(findSwap(first('daawat-basmati'), byId, group('daawat-basmati'), new Set())).toBeNull();
  });

  it('matches the size: Aashirvaad 5kg swaps to Pillsbury 5kg, Aashirvaad 1kg has no match', () => {
    const fiveKg = { productId: 'aashirvaad-atta', variantId: byId.get('aashirvaad-atta')!.variants[1]!.id };
    expect(findSwap(fiveKg, byId, group('aashirvaad-atta'), new Set())).toMatchObject({ product: { id: 'pillsbury-atta' }, saving: 14 });
    expect(findSwap(first('aashirvaad-atta'), byId, group('aashirvaad-atta'), new Set())).toBeNull();
  });

  it('refuses a cheaper pack that costs more per gram', () => {
    // YiPPee 4-pack is ₹4 less than Maggi's, but 240 g against 280 g.
    const maggi4 = { productId: 'maggi-masala', variantId: byId.get('maggi-masala')!.variants[1]!.id };
    expect(findSwap(maggi4, byId, ['maggi-masala', 'yippee-magic'], new Set())).toBeNull();
  });

  it('skips products already in the cart and sold-out sizes', () => {
    expect(findSwap(first('india-gate-basmati'), byId, group('india-gate-basmati'), new Set(['daawat-basmati']))).toBeNull();
    const soldOut: Product = { ...byId.get('daawat-basmati')!, variants: byId.get('daawat-basmati')!.variants.map((v) => ({ ...v, stock: 0 })) };
    const map = new Map(byId).set('daawat-basmati', soldOut);
    expect(findSwap(first('india-gate-basmati'), map, group('india-gate-basmati'), new Set())).toBeNull();
  });

  it('prefers a product with a photo over a bigger saving on a drawn card', () => {
    const offer = findSwap(first('dabur-red'), byId, group('dabur-red'), new Set(), (p) => !drawnCardIds.has(p.id));
    // Colgate (₹10 less) is a drawn card; Closeup is smaller and dearer per gram, so there is no photo offer
    // and the drawn card is used.
    expect(offer?.product.id).toBe('colgate-strong');
  });

  it('keeps at most one offer per line and three per cart, biggest savings first', () => {
    const lines = ['india-gate-basmati', 'taj-mahal-tea', 'drools-adult', 'mamaearth-vitc', 'fogg-black'].map(first);
    const offers = findSwaps(lines, byId, swapGroupOf);
    expect(offers).toHaveLength(MAX_SWAPS_PER_CART);
    expect(offers.map((o) => o.saving)).toEqual([...offers.map((o) => o.saving)].sort((a, b) => b - a));
    expect(new Set(offers.map((o) => o.fromProductId)).size).toBe(offers.length);
  });
});

describe('swap groups', () => {
  it('only list real products, each in one group, never meat or medicine', () => {
    const seen = new Set<string>();
    const noSwap = new Set(['chicken', 'mutton', 'fish', 'cold-cough-fever', 'first-aid', 'gut-care', 'medical-devices', 'veggies-fruits', 'flowers']);
    for (const g of swapGroups) {
      expect(g.length).toBeGreaterThanOrEqual(2);
      for (const id of g) {
        const p = byId.get(id);
        expect(p, id).toBeDefined();
        expect(seen.has(id), id).toBe(false);
        expect(noSwap.has(p!.categoryId), id).toBe(false);
        seen.add(id);
      }
    }
  });

  it('every group can offer at least one swap', () => {
    for (const g of swapGroups) {
      const any = g.some((id) => byId.get(id)!.variants.some((v) => findSwap({ productId: id, variantId: v.id }, byId, g, new Set())));
      expect(any, g.join(',')).toBe(true);
    }
  });

  it('sample mode answers through seedCatalog.swaps', () => {
    expect(seedCatalog.swaps([first('drools-adult')])).toMatchObject([{ product: { id: 'pedigree-adult' }, saving: 80 }]);
  });
});
