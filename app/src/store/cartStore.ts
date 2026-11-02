import { canIncrement, MAX_UNITS_PER_PRODUCT, maxQtyForVariant, type CartLine, type Id } from '@littlekart/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './storage';

interface CartState {
  lines: CartLine[];
  /** Adds one unit. Returns false when the 30-unit limit or the stock stops it (DECISIONS D-17). */
  increment: (productId: Id, variantId: Id, stock: number) => boolean;
  /** Removes one unit; at 1 it removes the line (same as Remove; FIDELITY_NOTES). */
  decrement: (productId: Id, variantId: Id) => void;
  remove: (productId: Id, variantId: Id) => void;
  /**
   * Swap & save (DECISIONS D-91): puts another product in place of a line, in the same spot, keeping the
   * quantity within its stock and the 30-unit limit. Returns the new quantity (0 when nothing changed).
   */
  swap: (from: { productId: Id; variantId: Id }, to: { productId: Id; variantId: Id; stock: number }) => number;
  clear: () => void;
  /** Puts the cart saved on the server (after login or a server correction). */
  replaceAll: (lines: CartLine[]) => void;
}

const sameLine = (l: CartLine, productId: Id, variantId: Id) => l.productId === productId && l.variantId === variantId;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      increment: (productId, variantId, stock) => {
        const { lines } = get();
        if (!canIncrement(lines, productId, variantId, stock, MAX_UNITS_PER_PRODUCT)) return false;
        const existing = lines.find((l) => sameLine(l, productId, variantId));
        set({
          lines: existing
            ? lines.map((l) => (l === existing ? { ...l, qty: l.qty + 1 } : l))
            : [...lines, { productId, variantId, qty: 1, addedAt: Date.now() }],
        });
        return true;
      },
      decrement: (productId, variantId) =>
        set(({ lines }) => ({
          lines: lines
            .map((l) => (sameLine(l, productId, variantId) ? { ...l, qty: l.qty - 1 } : l))
            .filter((l) => l.qty > 0),
        })),
      remove: (productId, variantId) =>
        set(({ lines }) => ({ lines: lines.filter((l) => !sameLine(l, productId, variantId)) })),
      swap: (from, to) => {
        const { lines } = get();
        const old = lines.find((l) => sameLine(l, from.productId, from.variantId));
        if (!old) return 0;
        const rest = lines.filter((l) => l !== old && !sameLine(l, to.productId, to.variantId));
        const qty = Math.min(old.qty, maxQtyForVariant(rest, to.productId, to.variantId, to.stock, MAX_UNITS_PER_PRODUCT));
        if (qty <= 0) return 0;
        set({ lines: lines.flatMap((l) => (l === old ? [{ ...l, productId: to.productId, variantId: to.variantId, qty }] : rest.includes(l) ? [l] : [])) });
        return qty;
      },
      clear: () => set({ lines: [] }),
      replaceAll: (lines) => set({ lines }),
    }),
    { name: 'lk-cart', storage: persistStorage, version: 1 },
  ),
);

/** Cart lines, most recently added first (DESIGN_SPEC "Cart item order"). */
export function sortedLines(lines: readonly CartLine[]): CartLine[] {
  return [...lines].sort((a, b) => b.addedAt - a.addedAt);
}

export function totalUnits(lines: readonly CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

export function qtyInCart(lines: readonly CartLine[], productId: Id, variantId: Id): number {
  return lines.find((l) => sameLine(l, productId, variantId))?.qty ?? 0;
}
