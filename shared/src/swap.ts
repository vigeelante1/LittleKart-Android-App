// Swap & save (DECISIONS D-91): like Zepto, a cart line can offer a cheaper product of the same kind.
// LittleKart's shoppers are price-conscious, so a swap is only ever offered when it saves money.
import type { Id, Product, Variant } from './types';

export interface SwapLine {
  productId: Id;
  variantId: Id;
}

export interface SwapOffer {
  /** The cart line the offer is for. */
  fromProductId: Id;
  fromVariantId: Id;
  /** The cheaper product and the size to put in the cart instead. */
  product: Product;
  variantId: Id;
  /** Rupees saved on each unit. */
  saving: number;
}

/** Smallest saving worth offering: ₹3, and at least 3% of the price. */
export const MIN_SWAP_SAVING = 3;
export const MIN_SWAP_SAVING_SHARE = 0.03;
/** At most this many lines in one cart show an offer. */
export const MAX_SWAPS_PER_CART = 3;
/** The cheaper pack may be a little smaller (never below 80%) or up to 1.5 times larger. */
const MIN_SIZE_RATIO = 0.8;
const MAX_SIZE_RATIO = 1.5;

export interface PackSize {
  unit: 'g' | 'ml' | 'pc';
  amount: number;
}

const UNIT_FACTORS: Record<string, [PackSize['unit'], number]> = {
  g: ['g', 1],
  gm: ['g', 1],
  kg: ['g', 1000],
  ml: ['ml', 1],
  l: ['ml', 1000],
  ltr: ['ml', 1000],
  pc: ['pc', 1],
  pcs: ['pc', 1],
  pads: ['pc', 1],
  pulls: ['pc', 1],
  strips: ['pc', 1],
};

/**
 * Reads a size label: "500g", "1L Pouch", "4 Pack (280g)" (grams in brackets win), "4 x 100g" (400 g),
 * "20 Pcs". Returns null when the label has no size ("1 U", "1 Box", "Free Size").
 */
export function parsePackSize(label: string): PackSize | null {
  const text = label.toLowerCase();
  const bracket = /\(([^)]*)\)/.exec(text);
  if (bracket?.[1]) {
    const inner = parsePackSize(bracket[1]);
    if (inner) return inner;
  }
  const multi = /(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(kg|gm|g|ml|ltr|l)\b/.exec(text);
  if (multi) {
    const [unit, factor] = UNIT_FACTORS[multi[3] ?? ''] ?? ['g', 1];
    return { unit, amount: Number(multi[1]) * Number(multi[2]) * factor };
  }
  const single = /(\d+(?:\.\d+)?)\s*(kg|gm|g|ml|ltr|l|pcs|pc|pads|pulls|strips)\b/.exec(text);
  if (!single) return null;
  const [unit, factor] = UNIT_FACTORS[single[2] ?? ''] ?? ['g', 1];
  return { unit, amount: Number(single[1]) * factor };
}

/** True when `saving` is big enough to offer for something that costs `price`. */
export function worthSwapping(price: number, saving: number): boolean {
  return saving >= MIN_SWAP_SAVING && saving >= price * MIN_SWAP_SAVING_SHARE;
}

/** The candidate's size that can stand in for `from`, cheaper and no worse per gram/ml/piece, or null. */
function cheaperVariant(from: Variant, candidate: Product): Variant | null {
  const size = parsePackSize(from.label);
  let best: Variant | null = null;
  for (const v of candidate.variants) {
    if (v.stock <= 0) continue;
    const saving = from.price - v.price;
    if (!worthSwapping(from.price, saving)) continue;
    const other = parsePackSize(v.label);
    if (size || other) {
      if (!size || !other || size.unit !== other.unit) continue;
      const ratio = other.amount / size.amount;
      if (ratio < MIN_SIZE_RATIO || ratio > MAX_SIZE_RATIO) continue;
      if (v.price / other.amount > from.price / size.amount) continue;
    }
    if (!best || v.price < best.price) best = v;
  }
  return best;
}

/**
 * The best cheaper swap for one cart line among `candidates` (products of the same kind), or null.
 * Products in `avoid` (already in the cart) are skipped; `preferred` ones (photos) win over a bigger saving
 * from a product without a photo.
 */
export function findSwap(
  line: SwapLine,
  products: ReadonlyMap<Id, Product>,
  candidates: readonly Id[],
  avoid: ReadonlySet<Id>,
  preferred: (p: Product) => boolean = () => true,
): SwapOffer | null {
  const from = products.get(line.productId)?.variants.find((v) => v.id === line.variantId);
  if (!from) return null;
  let best: { offer: SwapOffer; preferred: boolean } | null = null;
  for (const id of candidates) {
    if (id === line.productId || avoid.has(id)) continue;
    const product = products.get(id);
    if (!product) continue;
    const variant = cheaperVariant(from, product);
    if (!variant) continue;
    const offer: SwapOffer = {
      fromProductId: line.productId,
      fromVariantId: line.variantId,
      product,
      variantId: variant.id,
      saving: from.price - variant.price,
    };
    const isPreferred = preferred(product);
    if (!best || (isPreferred && !best.preferred) || (isPreferred === best.preferred && offer.saving > best.offer.saving)) {
      best = { offer, preferred: isPreferred };
    }
  }
  return best?.offer ?? null;
}

/**
 * Offers for a whole cart: at most one per line and `MAX_SWAPS_PER_CART` in all, the biggest savings kept.
 * `groupOf` gives the products of the same kind as a product (empty when it has none).
 */
export function findSwaps(
  lines: readonly SwapLine[],
  products: ReadonlyMap<Id, Product>,
  groupOf: (productId: Id) => readonly Id[],
  preferred?: (p: Product) => boolean,
): SwapOffer[] {
  const inCart = new Set(lines.map((l) => l.productId));
  const offers = lines.flatMap((line) => findSwap(line, products, groupOf(line.productId), inCart, preferred) ?? []);
  return offers.sort((a, b) => b.saving - a.saving).slice(0, MAX_SWAPS_PER_CART);
}
