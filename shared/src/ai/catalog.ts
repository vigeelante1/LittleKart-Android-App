// The part of the catalog the assistant may choose from, as compact text (D-102).
import type { Product } from '../types';

/** Shelves that hold things you cook or serve with (no soap, pens or medicines). */
export const AI_SHELVES: ReadonlySet<string> = new Set([
  'chicken', 'mutton', 'fish', 'veggies-fruits', 'dairy-bread-eggs', 'oil-ghee', 'atta-dal-rice', 'spices-masalas',
  'dry-fruits', 'cereals-breakfast', 'noodles-pasta', 'tea-coffee', 'frozen-food', 'sauces-spreads', 'homemade-batters',
  'home-made-snacks-pickles', 'sweets', 'snack-sweets', 'cool-drinks', 'juices', 'ice-cream-desserts', 'chips', 'namkeens',
  'biscuits-cookies', 'chocolates', 'tissues-disposable', 'pooja-store', 'flowers',
]);

/** Founder sub-categories are "<tile>--<group>"; the tile decides. */
export const shelfOf = (categoryId: string): string => categoryId.split('--')[0] ?? categoryId;

export const aiProducts = (products: readonly Product[]): Product[] =>
  products.filter((p) => AI_SHELVES.has(shelfOf(p.categoryId)) && p.variants.some((v) => v.stock > 0));

/** One line per product: id | name | shelf | size id=label ₹price, ... (sold-out sizes left out). */
export function catalogText(products: readonly Product[]): string {
  return aiProducts(products)
    .map((p) => {
      const sizes = p.variants.filter((v) => v.stock > 0).map((v) => `${v.id}=${v.label} ₹${v.price}`).join(', ');
      return `${p.id} | ${p.name} | ${shelfOf(p.categoryId)} | ${sizes}`;
    })
    .join('\n');
}
