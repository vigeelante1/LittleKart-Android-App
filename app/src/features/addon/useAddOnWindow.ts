import { addOnTimeLeft, countdownLabel, type Order } from '@littlekart/shared';
import { useEffect, useState } from 'react';
import { useAuthStore, useTrackingStore } from '@/store';

export interface AddOnWindow {
  order: Order;
  seconds: number;
  /** "0:32" */
  left: string;
}

/**
 * The order the shopper just placed while items can still be added to it (40 s, D-105), else null.
 * Ticks every second only while the window is open.
 */
export function useAddOnWindow(): AddOnWindow | null {
  const order = useTrackingStore((s) => s.active);
  const signedIn = useAuthStore((s) => s.user !== null);
  const [now, setNow] = useState(() => Date.now());
  const ms = order && signedIn ? addOnTimeLeft(order, now) : 0;

  useEffect(() => {
    if (ms <= 0) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(1000, ms % 1000 || 1000));
    return () => clearTimeout(timer);
  }, [ms, now]);
  // A newly placed order restarts the clock.
  useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), 0);
    return () => clearTimeout(timer);
  }, [order?.id, order?.placedAt]);

  if (!order || ms <= 0) return null;
  const seconds = Math.ceil(ms / 1000);
  return { order, seconds, left: countdownLabel(seconds) };
}
