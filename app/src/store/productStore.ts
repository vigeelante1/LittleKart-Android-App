// In-memory cache of products seen on any screen, so the cart, the View Cart pill and the header
// can look up names, images, prices and item types without asking the server again. Not persisted.
import type { Id, Product } from '@littlekart/shared';
import { create } from 'zustand';

interface ProductState {
  byId: Record<Id, Product>;
  upsert: (products: readonly Product[]) => void;
}

export const useProductStore = create<ProductState>()((set) => ({
  byId: {},
  upsert: (products) =>
    set(({ byId }) => {
      if (products.length === 0) return { byId };
      const next = { ...byId };
      for (const p of products) next[p.id] = p;
      return { byId: next };
    }),
}));
