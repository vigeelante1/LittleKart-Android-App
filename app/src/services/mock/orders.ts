// Sample-data orders: priced and checked on the phone with the same shared rules the server uses.
// There is no payment gateway in this mode, so a UPI / card order is treated as paid at once (FIDELITY_NOTES).
import {
  codAllowed,
  codRestrictedItems,
  codUnavailableMessage,
  distanceKm,
  indiaClockLabel,
  isStoreOpen,
  makeDeliveryOtp,
  makeOrderId,
  quoteOrder,
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
    if (!isStoreOpen(serving.store)) {
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
      paymentType: input.paymentType,
      items: quote.items,
      bill: quote.bill,
      ...(quote.coupon?.valid ? { couponCode: quote.coupon.coupon.code } : {}),
      address: input.address,
      storeId: serving.store.id,
      deliveryOtp: makeDeliveryOtp(),
      etaMinutes: trackingMinutes(config.eta, serving.km, itemTypes),
    };
    orders.unshift(order);
    byRequest.set(input.requestId, order);
    return later({ order });
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
