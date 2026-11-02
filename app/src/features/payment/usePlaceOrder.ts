import { codRestrictedItems, codUnavailableMessage, type Order, type PaymentType } from '@littlekart/shared';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { OrderError, repos, type RazorpayCheckout } from '@/services';
import { useCartStore, useTrackingStore, type CheckoutSnapshot, type DeliveryLocation } from '@/store';
import { strings } from '@/strings';
import type { OrderErrorState } from './OrderErrorDialog';
import type { CheckoutMessage } from './razorpayHtml';

interface Args {
  snapshot: CheckoutSnapshot;
  location: DeliveryLocation;
  phone: string;
  name: string;
  /** Cash on Delivery can be offered (below ₹1000, no meat or food). */
  codAllowed: boolean;
  /** The chosen slot was taken or has passed: open the slot sheet again (D-103). */
  onSlotUnavailable?: () => void;
}

const newRequestId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/** Submit Order on the payment page: places the order, runs Razorpay for UPI / card, and the dialogs. */
export function usePlaceOrder({ snapshot, location, phone, name, codAllowed, onSlotUnavailable }: Args) {
  const [method, setMethod] = useState<PaymentType>('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<OrderErrorState | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [checkout, setCheckout] = useState<RazorpayCheckout | null>(null);
  const pendingOrder = useRef<Order | null>(null);
  /** The latest submit, for the dialogs' "Choose Cash on Delivery" button. */
  const submitRef = useRef<(type: PaymentType) => void>(() => undefined);
  const retry = useCallback((type: PaymentType) => submitRef.current(type), []);
  const clearCart = useCartStore((s) => s.clear);
  const setActive = useTrackingStore((s) => s.setActive);

  // Cash on Delivery stops being possible when the cart changes; fall back to UPI (state adjusted in render).
  if (!codAllowed && method === 'Cash on Delivery') setMethod('UPI');

  const closeError = useCallback(() => setError(null), []);
  const go = useCallback((path: '/cart' | '/') => {
    setError(null);
    router.navigate(path);
  }, []);

  const finishPlaced = useCallback(
    (order: Order) => {
      clearCart();
      setActive(order);
      setSubmitting(false);
      setPlaced(order);
    },
    [clearCart, setActive],
  );

  const codActions = useCallback(
    (retry: (type: PaymentType) => void) =>
      codAllowed ? [{ label: strings.payment.chooseCod, onPress: () => retry('Cash on Delivery') }] : [],
    [codAllowed],
  );

  const submit = useCallback(
    async (override?: PaymentType) => {
      const paymentType = override ?? method;
      if (override) setMethod(override);
      setError(null);
      if (paymentType === 'Cash on Delivery' && !codAllowed) {
        setMethod('UPI');
        setError({
          title: strings.payment.codUnavailableTitle,
          message: codUnavailableMessage(codRestrictedItems(snapshot.items.map((i) => i.product.itemType))),
        });
        return;
      }
      setSubmitting(true);
      try {
        const result = await repos.orders.place({
          requestId: newRequestId(),
          lines: snapshot.items.map((i) => i.line),
          address: { name, phone, text: location.text, lat: location.lat, lng: location.lng },
          tip: snapshot.tip,
          ...(snapshot.couponCode ? { couponCode: snapshot.couponCode } : {}),
          ...(snapshot.slot ? { slotStart: snapshot.slot.start } : {}),
          paymentType,
        });
        if (result.razorpay) {
          pendingOrder.current = result.order;
          setCheckout(result.razorpay);
          return;
        }
        finishPlaced(result.order);
      } catch (e) {
        setSubmitting(false);
        const code = e instanceof OrderError ? e.code : '';
        const message = e instanceof Error ? e.message : '';
        if (code === 'items_unavailable') {
          setError({
            title: strings.payment.stockTitle,
            message,
            actions: [
              { label: strings.payment.reviewCart, onPress: () => go('/cart') },
              { label: strings.payment.continueShopping, onPress: () => go('/') },
            ],
          });
        } else if (code === 'not_deliverable') {
          setError({
            title: strings.payment.deliveryUnavailableTitle,
            message: strings.checkout.deliveryUnavailable,
            actions: [{ label: strings.payment.changeAddress, onPress: () => go('/cart') }],
          });
        } else if (code === 'store_closed') {
          setError({
            title: strings.storeClosed.dialogTitle,
            message,
            details: e instanceof OrderError ? e.details : [],
            actions: [{ label: strings.storeClosed.backToCart, onPress: () => go('/cart') }],
          });
        } else if (code === 'slot_unavailable') {
          setError({
            title: strings.schedule.unavailableTitle,
            message,
            actions: [{ label: strings.schedule.chooseAnother, onPress: () => onSlotUnavailable?.() }],
          });
        } else if (code === 'cod_unavailable') {
          setMethod('UPI');
          setError({ title: strings.payment.codUnavailableTitle, message });
        } else if (code === 'payment_unavailable') {
          setError({
            title: strings.payment.serviceUnavailable,
            message: strings.payment.onlineUnavailable(codAllowed),
            actions: codActions(retry),
          });
        } else if (code) {
          setError({ title: strings.payment.errorTitle, message: message || strings.payment.errorBody });
        } else {
          setError({ title: strings.payment.notPlacedTitle, message: strings.payment.notPlacedBody });
        }
      }
    },
    [method, codAllowed, snapshot, name, phone, location, finishPlaced, go, codActions, retry, onSlotUnavailable],
  );
  useEffect(() => {
    submitRef.current = (type) => void submit(type);
  }, [submit]);

  /** How the Razorpay sheet ended. */
  const onCheckout = useCallback(
    async (message: CheckoutMessage) => {
      const order = pendingOrder.current;
      setCheckout(null);
      pendingOrder.current = null;
      if (!order) return;
      if (message.type === 'success') {
        try {
          const paid = await repos.orders.confirmPayment(order.id, {
            razorpayOrderId: message.razorpay_order_id,
            razorpayPaymentId: message.razorpay_payment_id,
            razorpaySignature: message.razorpay_signature,
          });
          finishPlaced(paid);
        } catch {
          setSubmitting(false);
          setError({ title: strings.payment.upiFailed, message: strings.payment.verifyFailed, actions: codActions(retry) });
        }
        return;
      }
      setSubmitting(false);
      // Closing or failing the payment ends this attempt; the server puts the stock back.
      void repos.orders.paymentFailed(order.id).catch(() => undefined);
      if (message.type === 'failed') {
        setError({
          title: strings.payment.upiFailed,
          message: message.description || strings.payment.paymentNotCompleted,
          actions: [{ label: strings.payment.tryAnother, onPress: closeError }, ...codActions(retry)],
        });
      } else if (message.type === 'unavailable') {
        setError({
          title: strings.payment.serviceUnavailable,
          message: strings.payment.onlineUnavailable(codAllowed),
          actions: codActions(retry),
        });
      }
    },
    [retry, finishPlaced, codActions, closeError, codAllowed],
  );

  return { method, setMethod, submitting, submit, error, closeError, placed, checkout, onCheckout };
}
