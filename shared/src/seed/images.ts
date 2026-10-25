// Product images (DECISIONS D-80, D-82). Every product has an image bundled in the app under
// app/src/assets/products/<id>.webp: a cleaned-up free-licensed photo (credits in CREDITS.md) or a drawn card.
// The catalog refers to it as "asset:p/<id>"; the app maps that to the bundled file.
import type { Id, Product } from '../types';

export const productImage = (id: Id): string => `asset:p/${id}`;

/** First word of the English part of a name ("Haldiram's Aloo Bhujia" → "haldiram's"), used to group brands. */
function brandKey(name: string): string {
  const english = name.split('|').map((s) => s.trim()).find((s) => /^[ -~]+$/.test(s)) ?? name;
  return (english.split(/\s+/)[0] ?? '').toLowerCase();
}

/**
 * Bundled image for every product, and a tidy order inside each sub-category (DECISIONS D-82):
 * products with a photo first, then drawn cards; within each, products of the same brand sit together
 * (the first product of a brand keeps its place).
 */
export function withImages(list: Product[]): Product[] {
  const groupKey = (p: Product) => `${p.categoryId}|${brandKey(p.name)}`;
  const firstSeen = new Map<string, number>();
  list.forEach((p, i) => {
    if (!firstSeen.has(groupKey(p))) firstSeen.set(groupKey(p), i);
  });
  return list
    .map((p, i) => ({
      product: { ...p, imageUrl: productImage(p.id) },
      card: drawnCardIds.has(p.id) ? 1 : 0,
      brand: firstSeen.get(groupKey(p)) ?? i,
      index: i,
    }))
    .sort((a, b) => a.card - b.card || a.brand - b.brand || a.index - b.index)
    .map((x) => x.product);
}

/** Products shown with a drawn card instead of a photo (no clean free-licensed photo was found). */
export const drawnCardIds: ReadonlySet<Id> = new Set([
  'aachi-chicken-masala',
  'aashirvaad-chilli',
  'amrutanjan',
  'amul-cheese-slices',
  'amul-choco-cone',
  'amul-dark',
  'amul-kulfi',
  'amul-vanilla-tub',
  'beardo-oil',
  'beerakaya',
  'bikano-soan-cake',
  'brinjal',
  'britannia-brown-bread',
  'bubble-gun',
  'camlin-geometry',
  'chart-paper',
  'chicken-biryani-cut',
  'classmate-172',
  'classmate-256',
  'classmate-300',
  'classmate-notebook',
  'clinic-plus',
  'colgate-strong',
  'cotton-wicks',
  'crepe-bandage',
  'cycle-agarbatti',
  'dabur-honey',
  'dettol-antiseptic',
  'digene',
  'dove-soap',
  'drools-adult',
  'everest-turmeric',
  'fanta-orange',
  'fevistick',
  'five-star',
  'fortune-ricebran',
  'fortune-sunflower',
  'friends-adult-l',
  'gift-wrap-sheets',
  'gillette-foam',
  'gits-gulab-jamun-mix',
  'godrej-yummiez-kebab',
  'greeting-card',
  'ground-chakkar',
  'halls-mentho',
  'happy-birthday-banner',
  'havmor-butterscotch',
  'head-shoulders',
  'heritage-buttermilk',
  'heritage-curd',
  'heritage-ghee',
  'heritage-milk',
  'himalaya-baby-wipes',
  'himalaya-handwash',
  'huggies-pants-l',
  'id-chapati',
  'id-malabar-parota',
  'id-ragi-batter',
  'itc-masterchef-nuggets',
  'jasmine-string',
  'jersey-paneer',
  'kaja-tapeswaram',
  'kids-umbrella',
  'kwality-cornetto',
  'lays-classic',
  'lifebuoy-handwash-refill',
  'lifree-pants',
  'manforce-pack',
  'matches-ship',
  'mdh-chana',
  'milton-lunch-box',
  'mtr-payasam-mix',
  'mtr-rava-idli',
  'munch',
  'mutton-curry-cut',
  'mutton-liver',
  'mutton-paya',
  'narasus-coffee',
  'natraj-sharpener',
  'nivea-soft',
  'oral-b-brush',
  'palmolive-handwash',
  'paper-boat-aamras',
  'parachute-oil',
  'parle-g',
  'pencil-crackers',
  'pillsbury-atta',
  'playing-cards',
  'print-bw',
  'print-photo',
  'print-spiral',
  'priya-avakaya',
  'priya-gongura',
  'priya-sambar-powder',
  'pudin-hara',
  'pulse-candy',
  'purepet-biscuits',
  'raincoat-adult',
  'res-idli',
  'ritebite-choco-almond',
  'ruchi-lemon',
  'santoor-soap',
  'savlon-sanitizer',
  'seer-fish',
  'set-wet-gel',
  'skipping-rope',
  'soframycin',
  'sofy-antibacteria',
  'sona-masoori',
  'spinach',
  'stayfree-secure',
  'sumeru-paratha',
  'sundrop-peanut-butter',
  'tata-moong-dal',
  'tata-toor-dal',
  'underpads',
  'vadilal-mango',
  'vaseline-lip',
  'vicks-inhaler',
  'vijaya-groundnut-oil',
  'vijaya-milk',
  'vim-bar',
  'vim-gel',
  'whiskas-ocean',
  'whisper-ultra',
  'zandu-balm',
]);
