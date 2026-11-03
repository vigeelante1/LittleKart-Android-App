import { type Order, type PaymentType } from '@littlekart/shared';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import type { CheckoutMessage } from '@/features/payment/razorpayHtml';
import type { ResolvedLine } from '@/hooks/useCartProducts';
import { OrderError, repos, type RazorpayCheckout } from '@/services';
import { useCartStore, useTrackingStore } from '@/store';
import { strings } from '@/strings';
import { useAddOnStore } from './addOnStore';

const newRequestId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/** "Add to order": sends the cart's items to the placed order, runs the add-on's own payment when online (D-105). */
export function useAddItems(order: Order) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<RazorpayCheckout | null>(null);
  const pending = useRef<{ addOnId: string; lines: ResolvedLine[] } | null>(null);
  const requestId = useRef(newRequestId());
  const setActive = useTrackingStore((s) => s.setActive);

  const done = useCallback(
    (updated: Order, lines: readonly ResolvedLine[]) => {
      const { remove } = useCartStore.getState();
      for (const l of lines) remove(l.line.productId, l.line.variantId);
      setActive(updated);
      setBusy(false);
      requestId.current = newRequestId();
      useAddOnStore.getState().setOpen(false);
      router.navigate({ pathname: '/tracking/[id]', params: { id: updated.id } });
    },
    [setActive],
  );

  const submit = useCallback(
    async (lines: ResolvedLine[], paymentType: PaymentType) => {
      if (busy || lines.length === 0) return;
      setBusy(true);
      setError(null);
      try {
        const result = await repos.orders.addItems(order.id, { requestId: requestId.current, lines: lines.map((l) => l.line), paymentType });
        if (result.razorpay && result.addOnId) {
          pending.current = { addOnId: result.addOnId, lines };
          setCheckout(result.razorpay);
          return;
        }
        done(result.order, lines);
      } catch (e) {
        setBusy(false);
        requestId.current = newRequestId();
        setError(e instanceof OrderError ? e.message : strings.payment.notPlacedBody);
      }
    },
    [busy, order.id, done],
  );

  const onCheckout = useCallback(
    async (message: CheckoutMessage) => {
      const p = pending.current;
      pending.current = null;
      setCheckout(null);
      if (!p) return;
      if (message.type === 'success') {
        try {
          const paid = await repos.orders.confirmAddOnPayment(order.id, p.addOnId, {
            razorpayOrderId: message.razorpay_order_id,
            razorpayPaymentId: message.razorpay_payment_id,
            razorpaySignature: message.razorpay_signature,
          });
          done(paid, p.lines);
        } catch {
          setBusy(false);
          setError(strings.payment.verifyFailed);
        }
        return;
      }
      setBusy(false);
      requestId.current = newRequestId();
      void repos.orders.addOnPaymentFailed(order.id, p.addOnId).catch(() => undefined);
      setError(message.type === 'failed' ? message.description || strings.payment.paymentNotCompleted : message.type === 'unavailable' ? strings.payment.serviceUnavailable : null);
    },
    [order.id, done],
  );

  return { busy, error, setError, checkout, submit, onCheckout };
}
