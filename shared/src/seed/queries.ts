// Catalog lookups over the seed data, used by the app's sample-data mode and by the API,
// so both answer the same way. Replaced by database queries in the database milestone.
import { matchesQuery } from '../listing';
import type { Id, Product, Section, SubCategory } from '../types';
import { banners, categories, dealProductIds, products, recommendationIds, sections, subCategoriesByTile } from './catalog';

const byId = new Map(products.map((p) => [p.id, p]));
const pick = (ids: readonly Id[]) => ids.flatMap((id) => byId.get(id) ?? []);
const tiles = sections.flatMap((s) => s.tiles);

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

  recommendations: (cartIds: readonly Id[]): Product[] => pick(recommendationIds.filter((id) => !cartIds.includes(id))),

  search: (query: string): Product[] => (query.trim() ? products.filter((p) => matchesQuery(p.name, query)) : []),
};
