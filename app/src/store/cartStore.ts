import { canIncrement, MAX_UNITS_PER_PRODUCT, type CartLine, type Id } from '@littlekart/shared';
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
