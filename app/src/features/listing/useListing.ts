import {
  applyListing,
  DEFAULT_SORT,
  hasActiveFilters,
  NO_FILTERS,
  PRICE_BANDS,
  priceBandOptions,
  SORT_OPTIONS,
  sizeOptions,
  type ListingFilters,
  type Product,
} from '@littlekart/shared';
import { useMemo, useState } from 'react';
import { strings } from '@/strings';
import type { SheetMode } from './FilterSheet';

/**
 * Sort and filter state for a product list (category screen, search), with the live site's chip labels.
 * `resetKey`: filters belong to one list (e.g. one sub-category); a new key starts with no filters.
 */
export function useListing(products: readonly Product[], resetKey = '') {
  const [stored, setStored] = useState<{ key: string; filters: ListingFilters }>({ key: resetKey, filters: NO_FILTERS });
  const [sheet, setSheet] = useState<SheetMode | null>(null);
  const filters = stored.key === resetKey ? stored.filters : NO_FILTERS;
  const setFilters = (next: ListingFilters) => setStored({ key: resetKey, filters: next });

  const visible = useMemo(() => applyListing(products, filters), [products, filters]);
  const prices = useMemo(() => priceBandOptions(products), [products]);
  const sizes = useMemo(() => sizeOptions(products), [products]);

  const sortActive = filters.sort !== DEFAULT_SORT;
  const priceActive = filters.price !== 'all';

  return {
    filters,
    setFilters,
    visible,
    priceOptions: prices,
    sizeOptions: sizes,
    sheet,
    openSheet: setSheet,
    closeSheet: () => setSheet(null),
    chips: {
      filtersActive: hasActiveFilters(filters),
      sortActive,
      sortLabel: sortActive ? (SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ?? strings.filters.sort) : strings.filters.sort,
      priceActive,
      priceLabel: priceActive ? (PRICE_BANDS.find((b) => b.value === filters.price)?.label ?? strings.filters.price) : strings.filters.price,
    },
    /** The message the site shows when filters hide every product. */
    emptyMessage:
      products.length > 0 && visible.length === 0
        ? filters.sizes.length > 0 || filters.sort !== DEFAULT_SORT
          ? strings.filters.noMatch
          : strings.filters.noPriceMatch
        : null,
  };
}

export type Listing = ReturnType<typeof useListing>;
