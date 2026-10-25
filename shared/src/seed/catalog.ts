// Seed catalog taken from the screenshots and littlekart.com (23 Oct 2026), with the typo fixes in DECISIONS D-21.
// Used by the app's sample-data mode and by the API, so both always show the same catalog.
// "asset:<role>" images are bundled placeholders in the app until the founder provides real images (D-24).
import type { Banner, Category, Product, Section, SubCategory, Tile } from '../types';

const CAT = 'asset:category';
const PRODUCT = 'asset:product';
const BANNER = 'asset:banner';

/** Top strip, in the live order. */
export const categories: Category[] = [
  { id: 'pooja-flowers', name: 'Pooja & Flowers', imageUrl: CAT, isNew: true },
  { id: 'food-meat', name: 'Food & Meat', imageUrl: CAT },
  { id: 'groceries-kitchen', name: 'Groceries & Kitchen', imageUrl: CAT },
  { id: 'snacks-drinks', name: 'Snacks & Drinks', imageUrl: CAT },
  { id: 'stationery-sports', name: 'Stationery & Sports', imageUrl: CAT },
  { id: 'health-wellness', name: 'Health & Wellness', imageUrl: CAT },
  { id: 'beauty-personal-care', name: 'Beauty & Personal Care', imageUrl: CAT },
];

const tile = (id: string, label: string, isNew = false): Tile => ({ id, label, imageUrl: CAT, isNew, categoryId: id });

/** Home sections, in the live order. Each tile opens the category list screen. */
export const sections: Section[] = [
  { id: 's-pooja', title: 'Pooja & Flowers', categoryId: 'pooja-flowers', tiles: [tile('flowers', 'Flowers'), tile('pooja-store', 'Pooja Store')] },
  {
    id: 's-food',
    title: 'Food & Meat',
    categoryId: 'food-meat',
    tiles: [
      tile('fresh-meat-fish', 'Fresh Meat & Fish'),
      tile('restaurants', 'Restaurants'),
      tile('sweets', 'Sweets'),
      tile('homemade-batters', 'Homemade Batters', true),
      tile('home-made-snacks-pickles', 'Home Made Snacks & Pickles', true),
    ],
  },
  {
    id: 's-groceries',
    title: 'Groceries & Kitchen',
    categoryId: 'groceries-kitchen',
    tiles: [
      tile('veggies-fruits', 'Veggies & Fruits'),
      tile('dairy-bread-eggs', 'Dairy, Bread & Eggs'),
      tile('pet-food', 'Pet Food'),
      tile('oil-ghee', 'Oil & Ghee'),
      tile('atta-dal-rice', 'Atta, Dal, Rice'),
      tile('cereals-breakfast', 'Cereals & Breakfast'),
      tile('noodles-pasta', 'Noodles & Pasta'),
      tile('tea-coffee', 'Tea & Coffee'),
      tile('spices-masalas', 'Spices & Masalas'),
      tile('dry-fruits', 'Dry Fruits'),
      tile('frozen-food', 'Frozen Food'),
      tile('household-essentials', 'Household Essentials'),
    ],
  },
  {
    id: 's-snacks',
    title: 'Snacks & Drinks',
    categoryId: 'snacks-drinks',
    tiles: [
      tile('cool-drinks', 'Cool Drinks'),
      tile('juices', 'Juices'),
      tile('ice-cream-desserts', 'Ice Cream & Desserts'),
      tile('chips', 'Chips'),
      tile('namkeens', 'Namkeens'),
      tile('chocolates', 'Chocolates'),
      tile('snack-sweets', 'Sweets'),
      tile('sauces-spreads', 'Sauces & Spreads'),
      tile('biscuits-cookies', 'Biscuits & Cookies'),
      tile('protein-bar', 'Protein Bar'),
      tile('paan-corner', 'Paan Corner'),
    ],
  },
  {
    id: 's-stationery',
    title: 'Stationery & Sports',
    categoryId: 'stationery-sports',
    tiles: [
      tile('stationery', 'Stationery'),
      tile('print-zone', 'Print Zone'),
      tile('sports', 'Sports'),
      tile('tissues-disposable', 'Tissues & Disposable'),
      tile('electronics', 'Electronics'),
      tile('decoration-kits', 'Decoration Kits & Items'),
      tile('crackers', 'Crackers'),
    ],
  },
  {
    id: 's-health',
    title: 'Health & Wellness',
    categoryId: 'health-wellness',
    tiles: [
      tile('cold-cough-fever', 'Cold Cough & Fever'),
      tile('first-aid', 'First aid'),
      tile('gut-care', 'Gut Care'),
      tile('hand-wash', 'Hand wash & sanitizer'),
      tile('medical-devices', 'Medical devices'),
      tile('oral-care', 'Oral care'),
      tile('sexual-wellness', 'Sexual wellness'),
      tile('adult-diapers', 'Adult diapers'),
    ],
  },
  {
    id: 's-beauty',
    title: 'Beauty & Personal Care',
    categoryId: 'beauty-personal-care',
    tiles: [
      tile('baby-care', 'Baby Care'),
      tile('bath-body', 'Bath & Body'),
      tile('feminine-hygiene', 'Feminine Hygiene'),
      tile('fragrances', 'Fragrances'),
      tile('grooming', 'Grooming'),
      tile('skin-care', 'Skin Care'),
    ],
  },
];

export const banners: Banner[] = [
  { id: 'b-fresh-meat', imageUrl: BANNER },
  { id: 'b-flowers', imageUrl: BANNER },
  { id: 'b-sweets', imageUrl: BANNER },
  { id: 'b-refer', imageUrl: BANNER },
];

/** Rolling words in the home search placeholder, in the site's order. */
export const searchHints = ['Mango', 'Milk', 'Rice', 'Shampoo', 'IceCream', 'Spinach'];

/** Left-rail sub-categories for each tile. Only tiles seen in the screenshots are filled in. */
export const subCategoriesByTile: Record<string, SubCategory[]> = {
  'fresh-meat-fish': [
    { id: 'chicken', name: 'Chicken', imageUrl: CAT },
    { id: 'mutton', name: 'Mutton', imageUrl: CAT },
    { id: 'fish', name: 'Fish', imageUrl: CAT },
  ],
  stationery: [
    { id: 'books-charts', name: 'Books & Charts', imageUrl: CAT },
    { id: 'pens-pencils', name: 'Pens & Pencils', imageUrl: CAT },
    { id: 'stationery-items', name: 'Stationery Items', imageUrl: CAT },
    { id: 'toys', name: 'Toys', imageUrl: CAT },
    { id: 'umbrellas-raincoats', name: 'Umbrellas & Raincoats', imageUrl: CAT },
    { id: 'gift-wrap', name: 'Gift Wrap', imageUrl: CAT },
    { id: 'lunch-hydration', name: 'Lunch & Hydration', imageUrl: CAT },
  ],
};

const v = (id: string, label: string, price: number, mrp?: number, stock = 50) => ({ id, label, price, mrp, stock });

export const products: Product[] = [
  // Limited Time Deals (home)
  { id: 'fanta-orange', categoryId: 'cool-drinks', name: 'Fanta Orange Flavoured | ఫాంటా ఆరెంజ్ ఫ్లేవర్డ్', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('fanta-1l', '1L', 45, 50)] },
  { id: 'chikkudu', categoryId: 'veggies-fruits', name: 'చిక్కుడు | Chikkudu', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('chikkudu-500', '500 gm', 70, 80)] },
  { id: 'watermelon', categoryId: 'veggies-fruits', name: 'Watermelon | పుచ్చకాయ', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('watermelon-1', '1pc (2.5 - 3 kg)', 169, 300)] },
  { id: 'allam', categoryId: 'veggies-fruits', name: 'అల్లం | Allam | अदरक | Ginger', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('allam-500', '500g', 120, 160)] },
  { id: 'beerakaya', categoryId: 'veggies-fruits', name: 'బీరకాయ | Beerakaya', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('beerakaya-1kg', '1kg', 60, 80)] },
  { id: 'munakkaya', categoryId: 'veggies-fruits', name: 'మునక్కాయ | Munakkaya | Drumstick', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('munakkaya-1kg', '1kg', 150, 180)] },
  { id: 'keera-dosakaya', categoryId: 'veggies-fruits', name: 'కీర దోసకాయ | Keera Dosakaya | Cucumber', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('keera-500', '500g', 80, 120)] },

  // Chicken (category screen)
  { id: 'chicken-curry-skinless', categoryId: 'chicken', name: 'Sneha Chicken Curry Cut Skinless Halal', imageUrl: PRODUCT, itemType: 'meat', couponExempt: true, variants: [v('ccs-1kg', '1kg', 328), v('ccs-500', '500g', 164)] },
  { id: 'chicken-curry-skin', categoryId: 'chicken', name: 'Sneha Chicken Curry Cut With Skin Halal', imageUrl: PRODUCT, itemType: 'meat', couponExempt: true, variants: [v('ccw-1kg', '1kg', 284), v('ccw-500', '500g', 142)] },
  { id: 'chicken-boneless', categoryId: 'chicken', name: 'Sneha Chicken Boneless Halal', imageUrl: PRODUCT, itemType: 'meat', couponExempt: true, variants: [v('cb-500', '500g', 330, undefined, 9)] },
  { id: 'chicken-biryani-cut', categoryId: 'chicken', name: 'Sneha Chicken Biryani Cut Skinless Halal', imageUrl: PRODUCT, itemType: 'meat', couponExempt: true, variants: [v('cbc-1kg', '1kg', 328), v('cbc-500', '500g', 164)] },
  // Fish (seen in "Often bought together" on the site)
  { id: 'catla-fish', categoryId: 'fish', name: 'Catla Fish (Bocha Fish) | బొచ్చ చేప', imageUrl: PRODUCT, itemType: 'meat', couponExempt: true, variants: [v('catla-1kg', '1kg', 220)] },

  // Books & Charts (category screen)
  { id: 'classmate-notebook', categoryId: 'books-charts', name: 'Classmate Notebook - Single Line', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('cn-1', '1 U', 45, 48)] },
  { id: 'classmate-300', categoryId: 'books-charts', name: 'classmate 300 pages', subtitle: 'Classmate 300 pages', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('c300-1', '1', 88, 90)] },
  { id: 'classmate-256', categoryId: 'books-charts', name: 'Classmate 256 pages', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('c256-1', '1 U', 72, 75)] },
  { id: 'classmate-172', categoryId: 'books-charts', name: 'Classmate 172 pages 24 x 18 cm', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('c172-1', '1 U', 53, 55)] },

  // Often bought together (cart)
  { id: 'sneha-brown-eggs', categoryId: 'dairy-bread-eggs', name: 'sneha brown eggs', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('sbe-6', '6pc', 85)] },
  { id: 'banana', categoryId: 'veggies-fruits', name: 'Banana | Aratipandu', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('banana-6', '6Pcs', 45, 55)] },
  { id: 'amul-butter', categoryId: 'dairy-bread-eggs', name: 'Amul Salted Butter | Uppu | ఉప్పు', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('amul-100', '100G', 63)] },
  { id: 'aashirvaad-chilli', categoryId: 'spices-masalas', name: 'Aashirvaad Chilli Powder | Karam Podi | ఆశీర్వాద్ మిరపకాయల పొడి', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('ac-200', '200g', 89, 130, 9)] },
  { id: 'vijaya-groundnut-oil', categoryId: 'oil-ghee', name: 'Vijaya Groundnut Oil', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('vgo-1l', '1L', 197, 218)] },
  { id: 'heritage-curd', categoryId: 'dairy-bread-eggs', name: 'Heritage Total Curd Pouch', imageUrl: PRODUCT, itemType: 'product', couponExempt: false, variants: [v('hc-450', '450g or 500g', 50)] },
];

export const dealProductIds = ['fanta-orange', 'chikkudu', 'watermelon', 'allam', 'beerakaya', 'munakkaya'];

// More than 6, so the cart shows "View more" as the live cart does with its 20 suggestions.
export const recommendationIds = [
  'amul-butter',
  'aashirvaad-chilli',
  'heritage-curd',
  'sneha-brown-eggs',
  'banana',
  'vijaya-groundnut-oil',
  'fanta-orange',
  'keera-dosakaya',
  'allam',
  'watermelon',
];
