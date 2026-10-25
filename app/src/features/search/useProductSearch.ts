import type { Product } from '@littlekart/shared';
import { useEffect, useState } from 'react';
import { repos } from '@/services';
import { useProductStore } from '@/store/productStore';

const DEBOUNCE_MS = 250;

/** Product search with a short pause after typing, so each keystroke doesn't start a new request. */
export function useProductSearch(query: string) {
  const upsert = useProductStore((s) => s.upsert);
  const [result, setResult] = useState<{ query: string; products: Product[] } | null>(null);
  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) return;
    let active = true;
    const timer = setTimeout(() => {
      repos.catalog
        .search(trimmed)
        .then((products) => {
          if (!active) return;
          upsert(products);
          setResult({ query: trimmed, products });
        })
        .catch(() => active && setResult({ query: trimmed, products: [] }));
    }, DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [trimmed, upsert]);

  const current = trimmed && result?.query === trimmed ? result : null;
  return {
    products: current?.products ?? [],
    /** True once the answer for the text in the box has arrived. */
    done: current !== null,
    query: trimmed,
  };
}
