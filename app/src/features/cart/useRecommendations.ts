import type { Id, Product } from '@littlekart/shared';
import { isOutOfStock } from '@littlekart/shared';
import { useEffect, useMemo, useState } from 'react';
import { repos } from '@/services';
import { useProductStore } from '@/store/productStore';

/** The live cart asks for up to 20 suggestions and hides sold-out ones. */
const MAX_RECOMMENDATIONS = 20;

/**
 * Smart suggestions (DECISIONS D-90) for the products in the cart: "Often bought together" in the cart and
 * "Suggested products" on the payment page. Empty while loading or when there are none.
 */
export function useRecommendations(cartProductIds: readonly Id[], max = MAX_RECOMMENDATIONS): Product[] {
  const upsert = useProductStore((s) => s.upsert);
  // Cart order is kept (most recent first): the suggestions take turns between items in that order.
  const key = useMemo(() => [...new Set(cartProductIds)].join(','), [cartProductIds]);
  const [result, setResult] = useState<{ key: string; products: Product[] } | null>(null);

  useEffect(() => {
    if (!key) return;
    let active = true;
    repos.catalog
      .getRecommendations(key.split(','))
      .then((products) => {
        if (!active) return;
        upsert(products);
        setResult({ key, products: products.filter((p) => !isOutOfStock(p)).slice(0, max) });
      })
      .catch(() => active && setResult({ key, products: [] }));
    return () => {
      active = false;
    };
  }, [key, upsert, max]);

  return key && result?.key === key ? result.products : [];
}
