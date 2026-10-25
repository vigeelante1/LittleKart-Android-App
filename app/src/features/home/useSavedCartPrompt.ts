import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useHydrated } from '@/hooks/useHydrated';
import { useAuthStore, useCartStore, useLocationStore, useUiStore } from '@/store';

/**
 * Decision per user for this app launch: 'ask' when they had a saved cart at app start / login, 'done' otherwise
 * or once answered. Decided once, so adding items later never pops the dialog mid-session.
 */
const decisions = new Map<string, 'ask' | 'done'>();

/**
 * Shows "You have a saved existing cart" when a logged-in user opens the app (or logs in) with items in the cart
 * (DESIGN_SPEC S5, S18). Waits until a delivery location is set, so it never stacks on the location dialog.
 */
export function useSavedCartPrompt() {
  const user = useAuthStore((s) => s.user);
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const hasLocation = useLocationStore((s) => s.selected !== null);
  const cartReady = useHydrated(useCartStore);
  const authReady = useHydrated(useAuthStore);
  // With the backend, wait until the server's saved cart has been joined in (useCartSync).
  const syncedFor = useUiStore((s) => s.cartSyncedFor);
  const [, rerender] = useState(0);
  const [clearing, setClearing] = useState(false);

  // Decide once, the first time we know who is logged in and what their saved cart holds.
  if (cartReady && authReady && user && syncedFor === user.id && !decisions.has(user.id)) {
    decisions.set(user.id, lines.length > 0 ? 'ask' : 'done');
  }
  const visible = !!user && hasLocation && decisions.get(user.id) === 'ask';

  const answer = useCallback(() => {
    if (user) decisions.set(user.id, 'done');
    rerender((n) => n + 1);
  }, [user]);

  const gotoCart = useCallback(() => {
    answer();
    router.push('/cart');
  }, [answer]);

  const clearCart = useCallback(() => {
    setClearing(true);
    clear();
    setClearing(false);
    answer();
  }, [answer, clear]);

  return { visible, count: lines.length, clearing, gotoCart, clearCart };
}
