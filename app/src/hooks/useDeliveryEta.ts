import { headerMinutes, slowestProfile, type ItemType, type Store } from '@littlekart/shared';
import { useMemo } from 'react';
import { strings } from '@/strings';
import { useCartProducts } from './useCartProducts';
import { useConfig } from './useConfig';
import { useNearestStore } from './useNearestStore';

/**
 * The header's "Delivery in about N minutes" (DECISIONS D-39): distance from the delivery location to the
 * serving store, and the slowest item type in the cart. While the store is being looked up:
 * "Updating delivery time..."; without a location: "Delivery in 15 minutes".
 */
export function useDeliveryEta(): { label: string; store: Store | null } {
  const config = useConfig();
  const cart = useCartProducts();
  const { nearest, loading } = useNearestStore();
  const itemTypes = useMemo(() => [...new Set(cart.map((c) => c.product.itemType))] as ItemType[], [cart]);

  const label = useMemo(() => {
    const minutes = headerMinutes(config.eta, nearest?.inRadius ? nearest.distanceKm : null, itemTypes);
    if (minutes !== null) return strings.home.deliveryIn(minutes);
    if (loading) return strings.home.updatingDelivery;
    return strings.home.deliveryInFallback(slowestProfile(config.eta, itemTypes).maxMinutes);
  }, [config.eta, nearest, itemTypes, loading]);

  return { label, store: nearest?.inRadius ? nearest.store : null };
}
