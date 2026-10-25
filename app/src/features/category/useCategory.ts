import { matchesQuery, type Id, type Product, type SubCategory } from '@littlekart/shared';
import { useEffect, useMemo, useState } from 'react';
import { repos } from '@/services';
import { useProductStore } from '@/store/productStore';

interface Loaded<T> {
  key: Id;
  value: T;
}

/** Sub-categories of a home tile, the selected one, and its products filtered by the in-category search. */
export function useCategory(tileId: Id) {
  const upsert = useProductStore((s) => s.upsert);
  const [subs, setSubs] = useState<Loaded<SubCategory[]> | null>(null);
  const [picked, setPicked] = useState<Loaded<Id> | null>(null);
  const [products, setProducts] = useState<Loaded<Product[]> | null>(null);
  const [search, setSearch] = useState<Loaded<string>>({ key: '', value: '' });

  // Results are stored with the id they belong to, so a stale answer is never shown for another category.
  const subCategories = subs?.key === tileId ? subs.value : null;
  const selectedId = picked?.key === tileId ? picked.value : (subCategories?.[0]?.id ?? null);
  const list = selectedId && products?.key === selectedId ? products.value : null;
  const query = search.key === selectedId ? search.value : '';

  useEffect(() => {
    let active = true;
    repos.catalog
      .getSubCategories(tileId)
      .then((value) => active && setSubs({ key: tileId, value }))
      .catch(() => active && setSubs({ key: tileId, value: [] }));
    return () => {
      active = false;
    };
  }, [tileId]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    repos.catalog
      .getProducts(selectedId)
      .then((value) => {
        if (!active) return;
        upsert(value);
        setProducts({ key: selectedId, value });
      })
      .catch(() => active && setProducts({ key: selectedId, value: [] }));
    return () => {
      active = false;
    };
  }, [selectedId, upsert]);

  const matching = useMemo(() => (list ?? []).filter((p) => matchesQuery(p.name, query)), [list, query]);

  return {
    subCategories: subCategories ?? [],
    selected: subCategories?.find((s) => s.id === selectedId) ?? null,
    select: (id: Id) => setPicked({ key: tileId, value: id }),
    products: matching,
    loading: subCategories === null || (selectedId !== null && list === null),
    query,
    setQuery: (value: string) => selectedId && setSearch({ key: selectedId, value }),
  };
}
