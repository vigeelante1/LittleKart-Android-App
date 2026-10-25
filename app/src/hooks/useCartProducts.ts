import type { CartLine, Product, Variant } from '@littlekart/shared';
import { useEffect, useMemo } from 'react';
import { repos } from '@/services';
import { sortedLines, useCartStore } from '@/store';
import { useProductStore } from '@/store/productStore';

export interface ResolvedLine {
  line: CartLine;
  product: Product;
  variant: Variant;
}

/** Cart lines (most recent first) joined with their product and variant. Loads unknown products once. */
export function useCartProducts(): ResolvedLine[] {
  const lines = useCartStore((s) => s.lines);
  const byId = useProductStore((s) => s.byId);
  const upsert = useProductStore((s) => s.upsert);

  const missing = useMemo(() => [...new Set(lines.map((l) => l.productId))].filter((id) => !byId[id]), [lines, byId]);

  useEffect(() => {
    if (missing.length === 0) return;
    let active = true;
    repos.catalog
      .getProductsByIds(missing)
      .then((products) => {
        if (active) upsert(products);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [missing, upsert]);

  return useMemo(
    () =>
      sortedLines(lines).flatMap((line) => {
        const product = byId[line.productId];
        const variant = product?.variants.find((v) => v.id === line.variantId);
        return product && variant ? [{ line, product, variant }] : [];
      }),
    [lines, byId],
  );
}
