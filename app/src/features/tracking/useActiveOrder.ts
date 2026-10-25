import { isTrackable } from '@littlekart/shared';
import { useEffect } from 'react';
import { repos } from '@/services';
import { useAuthStore, useTrackingStore } from '@/store';

const REFRESH_MS = 20_000;

/**
 * Keeps the tracked order up to date: the newest order that can still be tracked (placed, not delivered or
 * failed, less than 45 minutes old). Refreshed every 20 s like the site. Mounted once, in the bottom dock.
 */
export function useActiveOrderRefresh(): void {
  const user = useAuthStore((s) => s.user);
  const setActive = useTrackingStore((s) => s.setActive);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    const refresh = () =>
      repos.orders
        .list()
        .then((orders) => {
          if (!alive) return;
          setActive(orders.find((o) => isTrackable(o)) ?? null);
        })
        .catch(() => undefined);
    void refresh();
    const timer = setInterval(() => void refresh(), REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [user, setActive]);
}
