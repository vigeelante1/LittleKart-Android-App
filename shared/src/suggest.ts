// Smart suggestions for the cart and payment pages (DECISIONS D-90). Used by the app's sample-data mode and by
// the API, so both suggest the same products.
import { isOutOfStock } from './listing';
import type { Id, Product } from './types';

/**
 * What people usually buy with something from a shelf (sub-category id → other shelves, best match first).
 * Meat, sexual wellness and adult diapers are never suggested from another shelf.
 */
export const COMPLEMENTS: Readonly<Record<Id, readonly Id[]>> = {
  flowers: ['pooja-store', 'sweets', 'decoration-kits'],
  'pooja-store': ['flowers', 'sweets', 'decoration-kits'],
  chicken: ['spices-masalas', 'oil-ghee', 'cool-drinks'],
  mutton: ['spices-masalas', 'oil-ghee', 'cool-drinks'],
  fish: ['spices-masalas', 'oil-ghee', 'veggies-fruits'],
  restaurants: ['cool-drinks', 'ice-cream-desserts', 'paan-corner'],
  sweets: ['flowers', 'namkeens', 'pooja-store'],
  'homemade-batters': ['home-made-snacks-pickles', 'dairy-bread-eggs', 'oil-ghee'],
  'home-made-snacks-pickles': ['homemade-batters', 'atta-dal-rice', 'tea-coffee'],
  'veggies-fruits': ['spices-masalas', 'oil-ghee', 'dairy-bread-eggs'],
  'dairy-bread-eggs': ['sauces-spreads', 'biscuits-cookies', 'tea-coffee', 'cereals-breakfast'],
  'pet-food': ['household-essentials', 'tissues-disposable'],
  'oil-ghee': ['atta-dal-rice', 'spices-masalas', 'veggies-fruits'],
  'atta-dal-rice': ['oil-ghee', 'spices-masalas', 'home-made-snacks-pickles'],
  'cereals-breakfast': ['dairy-bread-eggs', 'dry-fruits', 'sauces-spreads'],
  'noodles-pasta': ['sauces-spreads', 'cool-drinks', 'frozen-food'],
  'tea-coffee': ['biscuits-cookies', 'dairy-bread-eggs', 'namkeens'],
  'spices-masalas': ['oil-ghee', 'veggies-fruits', 'atta-dal-rice'],
  'dry-fruits': ['cereals-breakfast', 'sweets', 'snack-sweets'],
  'frozen-food': ['sauces-spreads', 'cool-drinks', 'chips'],
  'household-essentials': ['tissues-disposable', 'hand-wash'],
  'cool-drinks': ['chips', 'namkeens', 'ice-cream-desserts'],
  juices: ['biscuits-cookies', 'chips', 'protein-bar'],
  'ice-cream-desserts': ['chocolates', 'cool-drinks', 'biscuits-cookies'],
  chips: ['cool-drinks', 'namkeens', 'chocolates'],
  namkeens: ['cool-drinks', 'chips', 'tea-coffee'],
  chocolates: ['ice-cream-desserts', 'biscuits-cookies', 'chips'],
  'snack-sweets': ['chocolates', 'namkeens', 'dry-fruits'],
  'sauces-spreads': ['dairy-bread-eggs', 'frozen-food', 'noodles-pasta'],
  'biscuits-cookies': ['tea-coffee', 'dairy-bread-eggs', 'chocolates'],
  'protein-bar': ['juices', 'dry-fruits', 'sports'],
  'paan-corner': ['cool-drinks', 'chips'],
  'books-charts': ['pens-pencils', 'stationery-items'],
  'pens-pencils': ['books-charts', 'stationery-items'],
  'stationery-items': ['pens-pencils', 'books-charts'],
  toys: ['chocolates', 'gift-wrap', 'electronics'],
  'umbrellas-raincoats': ['lunch-hydration'],
  'gift-wrap': ['decoration-kits', 'chocolates'],
  'lunch-hydration': ['books-charts', 'biscuits-cookies'],
  'print-zone': ['books-charts', 'pens-pencils', 'stationery-items'],
  sports: ['juices', 'protein-bar', 'cool-drinks'],
  'tissues-disposable': ['household-essentials', 'hand-wash'],
  electronics: ['decoration-kits'],
  'decoration-kits': ['gift-wrap', 'sweets', 'chocolates'],
  crackers: ['sweets', 'decoration-kits', 'flowers'],
  'cold-cough-fever': ['juices', 'medical-devices', 'tissues-disposable'],
  'first-aid': ['medical-devices', 'hand-wash'],
  'gut-care': ['juices', 'cold-cough-fever'],
  'hand-wash': ['tissues-disposable', 'bath-body'],
  'medical-devices': ['first-aid', 'cold-cough-fever'],
  'oral-care': ['bath-body', 'skin-care'],
  'sexual-wellness': ['bath-body', 'fragrances'],
  'adult-diapers': ['tissues-disposable', 'hand-wash'],
  'baby-care': ['tissues-disposable', 'bath-body', 'hand-wash'],
  'bath-body': ['oral-care', 'skin-care', 'hand-wash'],
  'feminine-hygiene': ['tissues-disposable', 'bath-body'],
  fragrances: ['grooming', 'bath-body'],
  grooming: ['fragrances', 'skin-care'],
  'skin-care': ['bath-body', 'grooming'],
};

/** How many products one shelf may add to the suggestions, so a few shelves don't fill the row. */
const PER_SHELF = 3;

/**
 * Suggestions for a cart, best first: products from shelves that go with what is in the cart (taking turns
 * between cart items, the most recently added first), then more from the cart's own shelves, then the
 * popular list. Cart products and sold-out products are left out. `catalog` is in display order, so photos
 * come before drawn cards inside a shelf. An empty cart gets the popular list.
 */
export function suggestProducts(
  cartIds: readonly Id[],
  catalog: readonly Product[],
  popularIds: readonly Id[],
  limit = 20,
): Product[] {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const inCart = new Set(cartIds);
  const byShelf = new Map<Id, Product[]>();
  for (const p of catalog) {
    if (inCart.has(p.id) || isOutOfStock(p)) continue;
    byShelf.set(p.categoryId, [...(byShelf.get(p.categoryId) ?? []), p]);
  }

  const picked: Product[] = [];
  const seen = new Set<Id>();
  const take = (p: Product | undefined) => {
    if (!p || seen.has(p.id) || inCart.has(p.id) || isOutOfStock(p) || picked.length >= limit) return;
    seen.add(p.id);
    picked.push(p);
  };

  const cartShelves = [...new Set(cartIds.flatMap((id) => byId.get(id)?.categoryId ?? []))];
  const fromShelves = (shelves: readonly Id[]) => {
    // Round-robin: the first product of every shelf, then the second, and so on.
    for (let round = 0; round < PER_SHELF; round++) {
      for (const shelf of shelves) take(byShelf.get(shelf)?.[round]);
    }
  };

  const ownShelves = new Set(cartShelves);
  const complementShelves = [...new Set(cartShelves.flatMap((s) => COMPLEMENTS[s] ?? []))].filter((s) => !ownShelves.has(s));
  // Interleave by cart item: first choice of every item, then second choices, ...
  const ordered: Id[] = [];
  for (let rank = 0; rank < 4; rank++) {
    for (const s of cartShelves) {
      const c = COMPLEMENTS[s]?.[rank];
      if (c && complementShelves.includes(c) && !ordered.includes(c)) ordered.push(c);
    }
  }
  fromShelves(ordered);
  fromShelves(cartShelves);
  for (const id of popularIds) take(byId.get(id));
  return picked;
}
