// Sample-data orders: priced and checked on the phone with the same shared rules the server uses.
// There is no payment gateway in this mode, so a UPI / card order is treated as paid at once (FIDELITY_NOTES).
import {
  addOnCodAllowed,
  canAddItems,
  MAX_UNITS_PER_PRODUCT,
  orderWithAddOn,
  quoteAddOn,
  codAllowed,
  codRestrictedItems,
  codUnavailableMessage,
  distanceKm,
  checkOrderSlot,
  indiaClockLabel,
  makeDeliveryOtp,
  makeOrderId,
  quoteOrder,
  SLOT_UNAVAILABLE_MESSAGE,
  trackingMinutes,
  type Order,
} from '@littlekart/shared';
import { seedCatalog } from '@littlekart/shared/seed';
import { config, coupons, stores } from '@/data/mock/other';
import { OrderError, type OrderRepo } from '../repositories';

const later = <T,>(value: T, ms = 400): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), ms));

const orders: Order[] = [];
const byRequest = new Map<string, Order>();

export const mockOrders: OrderRepo = {
  place: async (input) => {
    const existing = byRequest.get(input.requestId);
    if (existing) return later({ order: existing });

    const serving = stores
      .map((store) => ({ store, km: distanceKm(input.address.lat, input.address.lng, store.lat, store.lng) }))
      .filter((s) => s.km <= s.store.deliveryRadiusKm)
      .sort((a, b) => a.km - b.km)[0];
    if (!serving) throw new OrderError('not_deliverable', 'This address is outside our delivery area. Please change the address.');
    const slotCheck = checkOrderSlot(serving.store, input.slotStart);
    if (!slotCheck.ok && slotCheck.reason === 'slot_unavailable') throw new OrderError('slot_unavailable', SLOT_UNAVAILABLE_MESSAGE);
    if (!slotCheck.ok) {
      throw new OrderError('store_closed', `${serving.store.name} is not accepting orders right now.`, [
        `Store hours: ${serving.store.openTime} - ${serving.store.closeTime}`,
        `Current store time: ${indiaClockLabel(Date.now())}`,
        'Please try again during store hours or choose another delivery time.',
      ]);
    }

    const quote = quoteOrder({
      lines: input.lines,
      products: seedCatalog.byIds([...new Set(input.lines.map((l) => l.productId))]),
      distanceKm: serving.km,
      tip: input.tip,
      couponCode: input.couponCode,
      coupons,
      settings: config.pricing,
    });
    if (quote.unavailable.length > 0 || quote.items.length === 0) {
      throw new OrderError(
        'items_unavailable',
        'Some items in your cart are no longer available in the requested quantity. Please review your cart.',
      );
    }
    if (quote.coupon && !quote.coupon.valid) throw new OrderError('coupon_invalid', quote.coupon.message);
    const itemTypes = quote.items.map((i) => i.itemType);
    if (input.paymentType === 'Cash on Delivery' && !codAllowed(quote.bill.itemsTotal, itemTypes)) {
      throw new OrderError('cod_unavailable', codUnavailableMessage(codRestrictedItems(itemTypes)));
    }

    const order: Order = {
      id: makeOrderId(),
      createdAt: Date.now(),
      status: 'pending',
      // No payment gateway in sample mode, so every order is placed at once and the add-items window starts now.
      placedAt: Date.now(),
      paymentType: input.paymentType,
      items: quote.items,
      bill: quote.bill,
      ...(quote.coupon?.valid ? { couponCode: quote.coupon.coupon.code } : {}),
      address: input.address,
      storeId: serving.store.id,
      deliveryOtp: makeDeliveryOtp(),
      etaMinutes: trackingMinutes(config.eta, serving.km, itemTypes),
      ...(slotCheck.slot ? { scheduledFor: slotCheck.slot } : {}),
    };
    orders.unshift(order);
    byRequest.set(input.requestId, order);
    return later({ order });
  },
  addItems: async (orderId, input) => {
    const index = orders.findIndex((o) => o.id === orderId);
    const order = orders.at(index);
    if (index < 0 || !order) throw new OrderError('not_found', 'Order not found.');
    const done = byRequest.get(input.requestId);
    if (done) return later({ order: orders.find((o) => o.id === orderId) ?? done });
    if (!canAddItems(order)) throw new OrderError('add_on_closed', 'The time to add items to this order is over. Your items are still in the cart.');
    const quote = quoteAddOn(order, input.lines, seedCatalog.byIds([...new Set(input.lines.map((l) => l.productId))]));
    if (quote.overLimit.length > 0) throw new OrderError('limit_reached', `You can order at most ${MAX_UNITS_PER_PRODUCT} units of a product.`);
    if (quote.unavailable.length > 0 || quote.items.length === 0) {
      throw new OrderError('items_unavailable', 'Some items are no longer available in the requested quantity. Please review them.');
    }
    if (input.paymentType === 'Cash on Delivery' && !addOnCodAllowed(order, quote.items)) {
      throw new OrderError('cod_unavailable', codUnavailableMessage(codRestrictedItems([...order.items, ...quote.items].map((i) => i.itemType))));
    }
    // Online add-ons count as paid at once in sample mode (no gateway), as orders do.
    const updated = orderWithAddOn(order, { id: makeOrderId(), createdAt: Date.now(), paymentType: input.paymentType }, quote.items);
    orders.splice(index, 1, updated);
    byRequest.set(input.requestId, updated);
    return later({ order: updated });
  },
  confirmAddOnPayment: async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new OrderError('not_found', 'Order not found.');
    return later(order);
  },
  addOnPaymentFailed: async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new OrderError('not_found', 'Order not found.');
    return later(order);
  },
  confirmPayment: async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new OrderError('not_found', 'Order not found.');
    return later(order);
  },
  paymentFailed: async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new OrderError('not_found', 'Order not found.');
    if (order.status === 'pending_payment') order.status = 'payment_failed';
    return later(order);
  },
  list: () => later([...orders], 250),
  get: (orderId) => later(orders.find((o) => o.id === orderId) ?? null, 200),
};
