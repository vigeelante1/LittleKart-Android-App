// "Similar products" and "Popular in this category" on the product page (iteration 2, DECISIONS D-97).
// Used by the app's sample-data mode and by the API, so both show the same products.
import { isOutOfStock } from './listing';
import type { Id, Product } from './types';

export interface RelatedProducts {
  /** Same shelf (sub-category), closest in price first. */
  similar: Product[];
  /** The whole category (every shelf of the product's home tile), biggest discount first, then catalog order. */
  popular: Product[];
  /** Home tile the product's shelf belongs to ("View more" opens it), or null when unknown. */
  tileId: Id | null;
}

export const RELATED_LIMIT = 10;

const price = (p: Product) => p.variants[0]?.price ?? 0;
const discount = (p: Product) =>
  Math.max(0, ...p.variants.map((v) => (v.mrp !== undefined && v.mrp > v.price ? (v.mrp - v.price) / v.mrp : 0)));

/**
 * Products to show under a product. `shelves` are the ids of the product's home tile: the tile id first, then its
 * sub-category ids (the product's own shelf among them). Sold-out products and the product itself are left out; "popular" avoids repeating the
 * products already shown first in "similar".
 */
export function relatedProducts(
  product: Product,
  catalog: readonly Product[],
  shelves: readonly Id[],
  limit = RELATED_LIMIT,
): RelatedProducts {
  const others = catalog.filter((p) => p.id !== product.id && !isOutOfStock(p));
  const order = new Map(catalog.map((p, i) => [p.id, i]));
  const similar = others
    .filter((p) => p.categoryId === product.categoryId)
    .sort((a, b) => Math.abs(price(a) - price(product)) - Math.abs(price(b) - price(product)) || (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    .slice(0, limit);
  const shown = new Set(similar.slice(0, 4).map((p) => p.id));
  const inCategory = new Set(shelves.length ? shelves : [product.categoryId]);
  const popular = others
    .filter((p) => inCategory.has(p.categoryId) && !shown.has(p.id))
    .sort((a, b) => discount(b) - discount(a) || (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    .slice(0, limit);
  return { similar, popular, tileId: shelves[0] ?? null };
}
