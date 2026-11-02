import { useEffect, useMemo } from 'react';
import { billableLines, useCartBill } from '@/features/cart/useCartBill';
import { useCartProducts } from '@/hooks/useCartProducts';
import { useCheckoutStore, type CheckoutSnapshot } from '@/store';

const lineKey = (items: CheckoutSnapshot['items']) => items.map((i) => `${i.product.id}:${i.variant.id}:${i.line.qty}`).join(',');

/**
 * Keeps the payment page's order in step with the cart while it is open, so a product added from
 * "Suggested products" (D-90) shows in the items and the bill. Paused while the order is being placed
 * and after it is placed (the cart is emptied then).
 */
export function useLiveCheckout(snapshot: CheckoutSnapshot, paused: boolean) {
  const start = useCheckoutStore((s) => s.start);
  const items = useCartProducts();
  const live = useMemo(() => billableLines(items), [items]);
  const { bill } = useCartBill(live, snapshot.tip, snapshot.bill.couponDiscount);

  useEffect(() => {
    if (paused || live.length === 0 || lineKey(live) === lineKey(snapshot.items)) return;
    start({ ...snapshot, items: live, bill });
  }, [paused, live, bill, snapshot, start]);
}
