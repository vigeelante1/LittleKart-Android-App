import { describe, expect, it } from 'vitest';
import {
  applyListing,
  filterProducts,
  hasActiveFilters,
  NO_FILTERS,
  priceBand,
  priceBandOptions,
  sizeOptions,
  sortProducts,
  toggleSize,
} from '../src/listing';
import type { Product } from '../src/types';

const product = (id: string, sizes: [string, number, number | undefined, number][]): Product => ({
  id,
  categoryId: 'c',
  name: id,
  imageUrl: '',
  itemType: 'product',
  couponExempt: false,
  variants: sizes.map(([label, price, mrp, stock], i) => ({ id: `${id}-${i}`, label, price, mrp, stock })),
});

const a = product('a', [['1kg', 328, undefined, 10], ['500g', 164, undefined, 10]]);
const b = product('b', [['500g', 90, 120, 3]]);
const c = product('c', [['1L', 150, 160, 50]]);
const gone = product('gone', [['1kg', 50, 100, 0]]);
const list = [a, gone, b, c];

describe('listing (live site rules)', () => {
  it('keeps catalog order for Recommended but moves out-of-stock last', () => {
    expect(sortProducts(list, 'relevance').map((p) => p.id)).toEqual(['a', 'b', 'c', 'gone']);
  });

  it('sorts by the first size price', () => {
    expect(sortProducts(list, 'price_low_high').map((p) => p.id)).toEqual(['b', 'c', 'a', 'gone']);
    expect(sortProducts(list, 'price_high_low').map((p) => p.id)).toEqual(['a', 'c', 'b', 'gone']);
  });

  it('sorts by rupees saved and by stock', () => {
    expect(sortProducts(list, 'discount_high_low').map((p) => p.id)).toEqual(['b', 'c', 'a', 'gone']);
    expect(sortProducts(list, 'quantity_high_low').map((p) => p.id)).toEqual(['c', 'a', 'b', 'gone']);
  });

  it('puts prices into the three bands', () => {
    expect([99, 100, 199, 200].map(priceBand)).toEqual(['below_99', 'range_100_199', 'range_100_199', 'above_200']);
    expect(filterProducts(list, { price: 'range_100_199', sizes: [] }).map((p) => p.id)).toEqual(['c']);
  });

  it('counts bands, most first, like the live sheet', () => {
    expect(priceBandOptions(list).map((o) => `${o.label} (${o.count})`)).toEqual([
      'Below ₹99 (2)',
      '₹100-199 (1)',
      'Above ₹200 (1)',
    ]);
  });

  it('filters by any size and lists sizes with counts', () => {
    expect(filterProducts(list, { price: 'all', sizes: ['500G'] }).map((p) => p.id)).toEqual(['a', 'b']);
    expect(sizeOptions(list)).toEqual([
      { label: '1kg', count: 2 },
      { label: '500g', count: 2 },
      { label: '1L', count: 1 },
    ]);
  });

  it('toggles sizes and knows when filters are active', () => {
    expect(toggleSize(['1kg'], '500g')).toEqual(['1kg', '500g']);
    expect(toggleSize(['1kg', '500g'], '1KG')).toEqual(['500g']);
    expect(hasActiveFilters(NO_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...NO_FILTERS, sort: 'discount_high_low' })).toBe(true);
    expect(applyListing(list, { sort: 'price_low_high', price: 'all', sizes: ['1kg'] }).map((p) => p.id)).toEqual(['a', 'gone']);
  });
});
