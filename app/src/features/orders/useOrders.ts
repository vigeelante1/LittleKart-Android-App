import type { Order } from '@littlekart/shared';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { repos } from '@/services';

const POLL_MS = 10_000;

/** The customer's orders, refreshed every 10 s while the screen is open (as the site does). */
export function useOrders(): { orders: Order[]; loading: boolean } {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = () =>
        repos.orders
          .list()
          .then((list) => {
            if (active) setOrders(list);
          })
          .catch(() => {
            if (active) setOrders((prev) => prev ?? []);
          });
      void load();
      const timer = setInterval(() => void load(), POLL_MS);
      return () => {
        active = false;
        clearInterval(timer);
      };
    }, []),
  );

  return { orders: orders ?? [], loading: orders === null };
}

/** One order, refreshed every 10 s. `order` is undefined while loading and null when not found. */
export function useOrder(orderId: string | undefined): Order | null | undefined {
  const [state, setState] = useState<{ id: string; order: Order | null } | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!orderId) return;
      let active = true;
      const load = () =>
        repos.orders
          .get(orderId)
          .then((order) => {
            if (active) setState({ id: orderId, order });
          })
          .catch(() => {
            if (active) setState((prev) => (prev?.id === orderId ? prev : { id: orderId, order: null }));
          });
      void load();
      const timer = setInterval(() => void load(), POLL_MS);
      return () => {
        active = false;
        clearInterval(timer);
      };
    }, [orderId]),
  );

  if (!orderId) return null;
  return state?.id === orderId ? state.order : undefined;
}
