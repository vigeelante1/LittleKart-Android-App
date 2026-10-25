// Quantity limits (DECISIONS D-17).
// One user may hold at most `maxUnitsPerProduct` (30) units of a product, all its variants counted together.
// Each variant is also capped by its stock.
import type { CartLine, Id } from './types';

export const MAX_UNITS_PER_PRODUCT = 30;

/** Total units of a product in the cart, across all its variants. */
export function unitsOfProduct(lines: readonly CartLine[], productId: Id): number {
  return lines.reduce((sum, l) => (l.productId === productId ? sum + l.qty : sum), 0);
}

export function qtyOfVariant(lines: readonly CartLine[], productId: Id, variantId: Id): number {
  return lines.find((l) => l.productId === productId && l.variantId === variantId)?.qty ?? 0;
}

/** Highest quantity this variant's line may reach. */
export function maxQtyForVariant(
  lines: readonly CartLine[],
  productId: Id,
  variantId: Id,
  stock: number,
  maxUnitsPerProduct: number = MAX_UNITS_PER_PRODUCT,
): number {
  const current = qtyOfVariant(lines, productId, variantId);
  const otherVariants = unitsOfProduct(lines, productId) - current;
  const byProductLimit = Math.max(0, maxUnitsPerProduct - otherVariants);
  return Math.max(0, Math.min(byProductLimit, stock));
}

/** True when one more unit of this variant may be added. */
export function canIncrement(
  lines: readonly CartLine[],
  productId: Id,
  variantId: Id,
  stock: number,
  maxUnitsPerProduct: number = MAX_UNITS_PER_PRODUCT,
): boolean {
  return (
    qtyOfVariant(lines, productId, variantId) <
    maxQtyForVariant(lines, productId, variantId, stock, maxUnitsPerProduct)
  );
}

/**
 * Joins the phone's cart with the cart saved on the server at login (DECISIONS D-18 "guest cart merged on login").
 * The same size in both keeps the larger quantity; the server then applies stock and the 30-unit limit.
 */
export function mergeCarts(local: readonly CartLine[], server: readonly CartLine[]): CartLine[] {
  const merged = new Map<string, CartLine>();
  for (const line of [...server, ...local]) {
    const key = `${line.productId}|${line.variantId}`;
    const seen = merged.get(key);
    merged.set(key, seen ? { ...seen, qty: Math.max(seen.qty, line.qty), addedAt: Math.max(seen.addedAt, line.addedAt) } : { ...line });
  }
  return [...merged.values()];
}

/** Same lines and quantities, in any order. */
export function sameCart(a: readonly CartLine[], b: readonly CartLine[]): boolean {
  if (a.length !== b.length) return false;
  const key = (l: CartLine) => `${l.productId}|${l.variantId}|${l.qty}`;
  const set = new Set(a.map(key));
  return b.every((l) => set.has(key(l)));
}
