import type { SwapOffer } from '@littlekart/shared';
import { useEffect, useMemo, useState } from 'react';
import type { ResolvedLine } from '@/hooks/useCartProducts';
import { repos } from '@/services';
import { swapKey, useSwapStore } from '@/store';
import { useProductStore } from '@/store/productStore';

/**
 * Swap & save offers for the cart (DECISIONS D-91), keyed by "productId:variantId" of the line.
 * Asked again whenever the cart's lines change; offers the user turned down stay hidden this session.
 */
export function useSwaps(items: readonly ResolvedLine[]): ReadonlyMap<string, SwapOffer> {
  const upsert = useProductStore((s) => s.upsert);
  const dismissed = useSwapStore((s) => s.dismissed);
  const key = useMemo(
    () =>
      items
        .filter((i) => i.variant.stock > 0)
        .map((i) => swapKey(i.product.id, i.variant.id))
        .join(','),
    [items],
  );
  const [result, setResult] = useState<{ key: string; offers: SwapOffer[] } | null>(null);

  useEffect(() => {
    if (!key) return;
    let active = true;
    const lines = key.split(',').map((pair) => {
      const [productId = '', variantId = ''] = pair.split(':');
      return { productId, variantId };
    });
    repos.catalog
      .getSwaps(lines)
      .then((offers) => {
        if (!active) return;
        upsert(offers.map((o) => o.product));
        setResult({ key, offers });
      })
      .catch(() => active && setResult({ key, offers: [] }));
    return () => {
      active = false;
    };
  }, [key, upsert]);

  return useMemo(() => {
    const offers = key && result?.key === key ? result.offers : [];
    const inCart = new Set(items.map((i) => i.product.id));
    return new Map(
      offers
        .filter((o) => !dismissed.includes(swapKey(o.fromProductId, o.fromVariantId)) && !inCart.has(o.product.id))
        .map((o) => [swapKey(o.fromProductId, o.fromVariantId), o]),
    );
  }, [key, result, dismissed, items]);
}
