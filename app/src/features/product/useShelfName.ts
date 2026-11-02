import type { Id } from '@littlekart/shared';
import { useEffect, useState } from 'react';
import { repos } from '@/services';

/** Name of a product's shelf ("Biscuits & Cookies"), from its home tile's sub-categories. Null until known. */
export function useShelfName(shelfId: Id | null, tileId: Id | null): string | null {
  const [found, setFound] = useState<{ key: string; name: string | null } | null>(null);
  const key = `${tileId}|${shelfId}`;

  useEffect(() => {
    if (!shelfId || !tileId) return;
    let active = true;
    repos.catalog
      .getSubCategories(tileId)
      .then((subs) => active && setFound({ key, name: subs.find((s) => s.id === shelfId)?.name ?? null }))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [key, shelfId, tileId]);

  return found?.key === key ? found.name : null;
}
