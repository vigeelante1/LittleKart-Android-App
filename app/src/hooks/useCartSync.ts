import { mergeCarts, sameCart } from '@littlekart/shared';
import { useEffect, useRef } from 'react';
import { dataSource, repos } from '@/services';
import { useAuthStore, useCartStore, useUiStore } from '@/store';
import { useHydrated } from './useHydrated';

const SAVE_DELAY_MS = 600;

/**
 * Keeps a signed-in customer's cart on the server (littlekart.com syncs the cart the same way):
 * at login the phone's cart is joined with the saved one, then every change is saved a moment later.
 * Mounted once, in the root layout. Sample-data mode keeps the cart on the phone only.
 */
export function useCartSync() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const lines = useCartStore((s) => s.lines);
  const syncedFor = useUiStore((s) => s.cartSyncedFor);
  const cartReady = useHydrated(useCartStore);
  const authReady = useHydrated(useAuthStore);
  const ready = cartReady && authReady;
  const lastSaved = useRef<string>('');

  // Login: join carts once per user.
  useEffect(() => {
    const ui = useUiStore.getState();
    if (!ready) return;
    if (!userId) {
      ui.setCartSyncedFor(null);
      return;
    }
    if (ui.cartSyncedFor === userId) return;
    if (dataSource !== 'http') {
      ui.setCartSyncedFor(userId);
      return;
    }
    let active = true;
    (async () => {
      try {
        const server = await repos.cart.get();
        const merged = mergeCarts(useCartStore.getState().lines, server);
        const saved = await repos.cart.replace(merged);
        if (!active) return;
        lastSaved.current = JSON.stringify(saved);
        useCartStore.getState().replaceAll(saved);
      } catch {
        // Offline or server down: keep the phone's cart; it is saved with the next change.
      } finally {
        if (active) useUiStore.getState().setCartSyncedFor(userId);
      }
    })();
    return () => {
      active = false;
    };
  }, [ready, userId]);

  // Every later change, saved after a short pause.
  useEffect(() => {
    if (dataSource !== 'http' || !userId || syncedFor !== userId) return;
    const snapshot = JSON.stringify(lines);
    if (snapshot === lastSaved.current) return;
    const timer = setTimeout(() => {
      repos.cart
        .replace(lines)
        .then((saved) => {
          lastSaved.current = JSON.stringify(saved);
          if (!sameCart(saved, useCartStore.getState().lines)) useCartStore.getState().replaceAll(saved);
        })
        .catch(() => undefined);
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [lines, syncedFor, userId]);
}
