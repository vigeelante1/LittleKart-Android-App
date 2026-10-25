import type { Order } from '@littlekart/shared';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { repos } from '@/services';
import { useCartStore } from '@/store';
import { useProductStore } from '@/store/productStore';

export interface ReorderSummary {
  requested: number;
  added: number;
  partial: number;
  unavailable: string[];
}

/**
 * Reorder: puts the order's items back in the cart at today's stock (and the 30-unit limit), then opens the
 * cart, or shows what could not be added.
 */
export function useReorder() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReorderSummary | null>(null);
  const upsert = useProductStore((s) => s.upsert);

  const reorder = useCallback(
    async (order: Order) => {
      setBusyId(order.id);
      try {
        const products = await repos.catalog.getProductsByIds([...new Set(order.items.map((i) => i.productId))]);
        upsert(products);
        const cart = useCartStore.getState();
        let added = 0;
        let partial = 0;
        const unavailable: string[] = [];
        for (const item of order.items) {
          const variant = products.find((p) => p.id === item.productId)?.variants.find((v) => v.id === item.variantId);
          if (!variant || variant.stock <= 0) {
            unavailable.push(item.name);
            continue;
          }
          let count = 0;
          for (let i = 0; i < item.qty; i += 1) {
            if (!cart.increment(item.productId, item.variantId, variant.stock)) break;
            count += 1;
          }
          if (count === item.qty) added += 1;
          else if (count > 0) partial += 1;
          else unavailable.push(item.name);
        }
        const result = { requested: order.items.length, added, partial, unavailable };
        if (partial > 0 || unavailable.length > 0) setSummary(result);
        else router.push('/cart');
      } catch {
        setSummary({ requested: order.items.length, added: 0, partial: 0, unavailable: order.items.map((i) => i.name) });
      } finally {
        setBusyId(null);
      }
    },
    [upsert],
  );

  return { reorder, busyId, summary, closeSummary: () => setSummary(null) };
}
