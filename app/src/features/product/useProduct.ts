import type { Id, Product, RelatedProducts } from '@littlekart/shared';
import { useEffect, useState } from 'react';
import { repos } from '@/services';
import { useProductStore } from '@/store/productStore';

/** The product for the product page: from the products already seen, else loaded once. */
export function useProduct(id: Id): { product: Product | null; missing: boolean } {
  const cached = useProductStore((s) => s.byId[id]);
  const upsert = useProductStore((s) => s.upsert);
  const [missingId, setMissingId] = useState<Id | null>(null);

  useEffect(() => {
    if (cached || !id) return;
    let active = true;
    repos.catalog
      .getProductsByIds([id])
      .then((found) => {
        if (!active) return;
        upsert(found);
        if (found.length === 0) setMissingId(id);
      })
      .catch(() => active && setMissingId(id));
    return () => {
      active = false;
    };
  }, [cached, id, upsert]);

  return { product: cached ?? null, missing: !cached && missingId === id };
}

/** "Similar products" and "Popular in this category" (DECISIONS D-97). Null while loading. */
export function useRelated(id: Id): RelatedProducts | null {
  const upsert = useProductStore((s) => s.upsert);
  const [result, setResult] = useState<{ id: Id; related: RelatedProducts } | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    repos.catalog
      .getRelated(id)
      .then((related) => {
        if (!active) return;
        upsert([...related.similar, ...related.popular]);
        setResult({ id, related });
      })
      .catch(() => active && setResult({ id, related: { similar: [], popular: [], tileId: null } }));
    return () => {
      active = false;
    };
  }, [id, upsert]);

  return result?.id === id ? result.related : null;
}
