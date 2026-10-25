import type { Order } from '@littlekart/shared';
import { useEffect, useState } from 'react';
import { repos } from '@/services';

/** The store an order is delivered from (for its pin on the tracking map). */
export function useOrderStore(order: Order | null | undefined): { lat: number; lng: number } | null {
  const [found, setFound] = useState<{ id: string; at: { lat: number; lng: number } | null } | null>(null);
  const id = order?.id;
  const lat = order?.address.lat;
  const lng = order?.address.lng;
  useEffect(() => {
    if (!id || lat === undefined || lng === undefined) return;
    let active = true;
    repos.stores
      .nearest(lat, lng)
      .then((nearest) => {
        if (active) setFound({ id, at: nearest ? { lat: nearest.store.lat, lng: nearest.store.lng } : null });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [id, lat, lng]);
  return found && found.id === id ? found.at : null;
}
