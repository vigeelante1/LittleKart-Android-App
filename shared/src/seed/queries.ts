// Catalog lookups over the seed data, used by the app's sample-data mode and by the API,
// so both answer the same way. Replaced by database queries in the database milestone.
import { matchesQuery } from '../listing';
import { relatedProducts, type RelatedProducts } from '../related';
import { suggestProducts } from '../suggest';
import { findSwaps, type SwapLine, type SwapOffer } from '../swap';
import type { Id, Product, Section, SubCategory } from '../types';
import { drawnCardIds } from './images';
import { swapGroupOf } from './swaps';
import { banners, categories, dealProductIds, products, recommendationIds, sections, subCategoriesByTile } from './catalog';

const byId = new Map(products.map((p) => [p.id, p]));
const pick = (ids: readonly Id[]) => ids.flatMap((id) => byId.get(id) ?? []);
const tiles = sections.flatMap((s) => s.tiles);

/** Every shelf of the home tile a shelf belongs to (a tile without its own list is its only shelf). */
export function shelvesOf(shelfId: Id): Id[] {
  for (const [tileId, subs] of Object.entries(subCategoriesByTile)) if (subs.some((s) => s.id === shelfId)) return [tileId, ...subs.map((s) => s.id)];
  return [shelfId];
}

export const seedCatalog = {
  home: () => ({ categories, sections: sections as Section[], banners, deals: pick(dealProductIds) }),

  /**
   * Left-rail sub-categories for a home tile. Tiles without their own list in the sample data
   * show the tile itself as the only sub-category, so every tile opens a working screen.
   */
  subCategories: (tileId: Id): SubCategory[] => {
    const own = subCategoriesByTile[tileId];
    if (own) return own;
    const tile = tiles.find((t) => t.id === tileId);
    return tile ? [{ id: tile.id, name: tile.label, imageUrl: tile.imageUrl }] : [];
  },

  products: (subCategoryId: Id, query?: string): Product[] =>
    products.filter((p) => p.categoryId === subCategoryId && matchesQuery(p.name, query ?? '')),

  byIds: (ids: readonly Id[]): Product[] => pick(ids),

  /** Smart suggestions (DECISIONS D-90): what goes with the cart, then the popular list. */
  recommendations: (cartIds: readonly Id[]): Product[] => suggestProducts(cartIds, products, recommendationIds),

  /** Swap & save offers for the cart lines (DECISIONS D-91). */
  swaps: (lines: readonly SwapLine[]): SwapOffer[] =>
    findSwaps(lines, byId, swapGroupOf, (p) => !drawnCardIds.has(p.id)),

  /** "Similar products" and "Popular in this category" for the product page (DECISIONS D-97). */
  related: (productId: Id): RelatedProducts => {
    const product = byId.get(productId);
    if (!product) return { similar: [], popular: [], tileId: null };
    return relatedProducts(product, products, shelvesOf(product.categoryId));
  },

  search: (query: string): Product[] => (query.trim() ? products.filter((p) => matchesQuery(p.name, query)) : []),
};
