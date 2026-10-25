// Sorting and filtering for product lists (category screen and search), copied from the live site:
// every rule looks at a product's FIRST size, and out-of-stock products always go last.
import type { Product } from './types';

export type SortValue = 'relevance' | 'quantity_high_low' | 'price_low_high' | 'price_high_low' | 'discount_high_low';
export type PriceBand = 'all' | 'below_99' | 'range_100_199' | 'above_200';

export const DEFAULT_SORT: SortValue = 'relevance';

export const SORT_OPTIONS: readonly { value: SortValue; label: string }[] = [
  { value: 'relevance', label: 'Recommended' },
  { value: 'quantity_high_low', label: 'Stock: High to Low' },
  { value: 'price_low_high', label: 'Price: Low to High' },
  { value: 'price_high_low', label: 'Price: High to Low' },
  { value: 'discount_high_low', label: 'Discount' },
];

export const PRICE_BANDS: readonly { value: Exclude<PriceBand, 'all'>; label: string }[] = [
  { value: 'below_99', label: 'Below ₹99' },
  { value: 'range_100_199', label: '₹100-199' },
  { value: 'above_200', label: 'Above ₹200' },
];

export interface ListingFilters {
  sort: SortValue;
  price: PriceBand;
  /** Size labels to keep (any size of the product may match). Empty = all sizes. */
  sizes: readonly string[];
}

export const NO_FILTERS: ListingFilters = { sort: DEFAULT_SORT, price: 'all', sizes: [] };

const firstPrice = (p: Product) => p.variants[0]?.price ?? 0;
const firstSaving = (p: Product) => {
  const v = p.variants[0];
  return v && v.mrp !== undefined ? v.mrp - v.price : 0;
};
const maxStock = (p: Product) => Math.max(0, ...p.variants.map((v) => v.stock));

export function isOutOfStock(p: Product): boolean {
  return p.variants.every((v) => v.stock <= 0);
}

/** The band a price falls into: ≤ 99, 100–199, ≥ 200. */
export function priceBand(price: number): Exclude<PriceBand, 'all'> {
  if (price <= 99) return 'below_99';
  if (price <= 199) return 'range_100_199';
  return 'above_200';
}

export function sortProducts(products: readonly Product[], sort: SortValue): Product[] {
  const list = [...products];
  switch (sort) {
    case 'relevance':
      break;
    case 'price_low_high':
      list.sort((a, b) => firstPrice(a) - firstPrice(b));
      break;
    case 'price_high_low':
      list.sort((a, b) => firstPrice(b) - firstPrice(a));
      break;
    case 'discount_high_low':
      list.sort((a, b) => firstSaving(b) - firstSaving(a));
      break;
    case 'quantity_high_low':
      list.sort((a, b) => maxStock(b) - maxStock(a));
      break;
  }
  return [...list.filter((p) => !isOutOfStock(p)), ...list.filter(isOutOfStock)];
}

const sameSize = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function filterProducts(products: readonly Product[], filters: Pick<ListingFilters, 'price' | 'sizes'>): Product[] {
  return products.filter((p) => {
    if (filters.price !== 'all' && priceBand(firstPrice(p)) !== filters.price) return false;
    if (filters.sizes.length > 0 && !p.variants.some((v) => filters.sizes.some((s) => sameSize(s, v.label)))) return false;
    return true;
  });
}

export function applyListing(products: readonly Product[], filters: ListingFilters): Product[] {
  return sortProducts(filterProducts(products, filters), filters.sort);
}

/** Price bands with how many products fall in each, most first (the order the live sheet shows). */
export function priceBandOptions(products: readonly Product[]) {
  const counts = { below_99: 0, range_100_199: 0, above_200: 0 };
  for (const p of products) counts[priceBand(firstPrice(p))] += 1;
  return PRICE_BANDS.map((b) => ({ ...b, count: counts[b.value] })).sort((a, b) => b.count - a.count);
}

/** Every size label in the list, with how many products offer it, in first-seen order. */
export function sizeOptions(products: readonly Product[]) {
  const map = new Map<string, { label: string; count: number }>();
  for (const p of products) {
    const seen = new Set<string>();
    for (const v of p.variants) {
      const key = v.label.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const entry = map.get(key);
      if (entry) entry.count += 1;
      else map.set(key, { label: v.label.trim(), count: 1 });
    }
  }
  return [...map.values()];
}

/** True when anything differs from the defaults (the Filters chip turns green). */
export function hasActiveFilters(f: ListingFilters): boolean {
  return f.sort !== DEFAULT_SORT || f.price !== 'all' || f.sizes.length > 0;
}

/** Adds the size if missing, removes it if present (case-insensitive). */
export function toggleSize(sizes: readonly string[], label: string): string[] {
  return sizes.some((s) => sameSize(s, label)) ? sizes.filter((s) => !sameSize(s, label)) : [...sizes, label.trim()];
}

/** Lower-case, accent-free text match used by category and product search. */
export function matchesQuery(name: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  return q.length === 0 || name.toLowerCase().includes(q);
}
