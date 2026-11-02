// Swap & save offers the user turned down ("No thanks"). Not persisted: they come back next session (D-91).
import type { Id } from '@littlekart/shared';
import { create } from 'zustand';

interface SwapState {
  /** "productId:variantId" of the cart lines whose offer was dismissed. */
  dismissed: readonly string[];
  dismiss: (productId: Id, variantId: Id) => void;
}

export const swapKey = (productId: Id, variantId: Id) => `${productId}:${variantId}`;

export const useSwapStore = create<SwapState>()((set) => ({
  dismissed: [],
  dismiss: (productId, variantId) =>
    set(({ dismissed }) => ({ dismissed: [...new Set([...dismissed, swapKey(productId, variantId)])] })),
}));
