import { isStoreOpen, type Store } from '@littlekart/shared';
import { useNearestStore } from './useNearestStore';
import { useNow } from './useNow';

/**
 * The store that delivers to the chosen address when it is closed right now (site: address in the delivery
 * area, store outside its hours), else null. Re-checked every minute.
 */
export function useStoreClosed(): Store | null {
  const { nearest } = useNearestStore();
  const now = useNow(60_000);
  if (!nearest || !nearest.inRadius) return null;
  return isStoreOpen(nearest.store, now) ? null : nearest.store;
}
