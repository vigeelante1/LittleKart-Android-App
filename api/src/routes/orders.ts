// Orders and payments (DECISIONS D-68). Every price, fee, coupon and stock check is done again here (D-16).
//   POST /orders                       place an order (Cash on Delivery → placed; UPI → waits for Razorpay)
//   POST /orders/:id/payment           Razorpay's success response → placed
//   POST /orders/:id/payment-failed    the customer closed or failed the payment → Payment Failed (stock put back)
//   GET  /orders, GET /orders/:id      the customer's orders
//   POST /payments/webhook             Razorpay's server-to-server confirmation
import {
  codAllowed,
  codRestrictedItems,
  codUnavailableMessage,
  distanceKm,
  checkOrderSlot,
  indiaClockLabel,
  makeDeliveryOtp,
  makeOrderId,
  MAX_UNITS_PER_PRODUCT,
  quoteOrder,
  SLOT_UNAVAILABLE_MESSAGE,
  trackingMinutes,
  type Order,
  type Store,
} from '@littlekart/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { DataLayer } from '../data/types.js';
import type { PaymentGateway } from '../payments/gateway.js';
import { requireUser } from './session.js';

/** Unpaid online orders are given up after 15 minutes and their stock goes back on sale. */
export const PAYMENT_WINDOW_MS = 15 * 60 * 1000;

const orderBody = z.object({
  requestId: z.string().min(8).max(80),
  /** Scheduled delivery (D-103): start of the chosen one-hour slot, epoch ms. */
  slotStart: z.number().int().positive().optional(),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1).max(100),
        variantId: z.string().min(1).max(100),
        qty: z.number().int().min(1).max(MAX_UNITS_PER_PRODUCT),
        addedAt: z.number().int().nonnegative(),
      }),
    )
    .min(1)
    .max(100),
  address: z.object({
    name: z.string().trim().min(1).max(80),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    text: z.string().trim().min(1).max(500),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  tip: z.number().int().min(0).max(1000),
  couponCode: z.string().max(40).optional(),
  paymentType: z.enum(['UPI', 'Cash on Delivery']),
});

const paymentBody = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

/** The store that delivers to this point, if any. */
function servingStore(stores: readonly Store[], lat: number, lng: number) {
  return stores
    .map((store) => ({ store, km: distanceKm(lat, lng, store.lat, store.lng) }))
    .filter((s) => s.km <= s.store.deliveryRadiusKm)
    .sort((a, b) => a.km - b.km)[0];
}

const ONLINE_UNAVAILABLE = 'Online payment is currently unavailable. Please choose Cash on Delivery or try again later.';

export async function orderRoutes(
  app: FastifyInstance,
  { data, gateway, now = Date.now }: { data: DataLayer; gateway?: PaymentGateway; now?: () => number },
) {
  const { accounts, orders, catalog, meta, carts } = data;

  app.post('/orders', async (request, reply) => {
    const user = await requireUser(request, reply, accounts);
    if (!user) return;
    const parsed = orderBody.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_order' });
    const body = parsed.data;
    await orders.expirePending(PAYMENT_WINDOW_MS);

    const [stores, config, coupons] = await Promise.all([meta.stores(), meta.config(), meta.coupons()]);
    const serving = servingStore(stores, body.address.lat, body.address.lng);
    if (!serving) {
      return reply.code(409).send({ error: 'not_deliverable', message: 'This address is outside our delivery area. Please change the address.' });
    }
    // The site's "Store Closed" answer, with the hours and the store's current time.
    // Closed: only a scheduled order for a bookable slot (D-103).
    const slotCheck = checkOrderSlot(serving.store, body.slotStart, now());
    if (!slotCheck.ok && slotCheck.reason === 'slot_unavailable') {
      return reply.code(409).send({ error: 'slot_unavailable', message: SLOT_UNAVAILABLE_MESSAGE });
    }
    if (!slotCheck.ok) {
      return reply.code(409).send({
        error: 'store_closed',
        message: `${serving.store.name} is not accepting orders right now.`,
        details: [
          `Store hours: ${serving.store.openTime} - ${serving.store.closeTime}`,
          `Current store time: ${indiaClockLabel(now())}`,
          'Please try again during store hours or choose another delivery time.',
        ],
      });
    }

    const products = await catalog.byIds([...new Set(body.lines.map((l) => l.productId))]);
    const quote = quoteOrder({
      lines: body.lines,
      products,
      distanceKm: serving.km,
      tip: body.tip,
      couponCode: body.couponCode,
      coupons,
      settings: config.pricing,
      // Same clock as the store-hours check, so the late-night fee and closing time always agree.
      nowMs: now(),
    });
    if (quote.unavailable.length > 0 || quote.items.length === 0) {
      return reply.code(409).send({
        error: 'items_unavailable',
        message: 'Some items in your cart are no longer available in the requested quantity. Please review your cart.',
        unavailable: quote.unavailable,
      });
    }
    if (quote.coupon && !quote.coupon.valid) {
      return reply.code(409).send({ error: 'coupon_invalid', message: quote.coupon.message });
    }
    const itemTypes = quote.items.map((i) => i.itemType);
    if (body.paymentType === 'Cash on Delivery' && !codAllowed(quote.bill.itemsTotal, itemTypes)) {
      return reply.code(400).send({ error: 'cod_unavailable', message: codUnavailableMessage(codRestrictedItems(itemTypes)) });
    }
    if (body.paymentType === 'UPI' && !gateway) {
      return reply.code(503).send({ error: 'payment_unavailable', message: ONLINE_UNAVAILABLE });
    }

    const order: Order = {
      id: makeOrderId(),
      createdAt: now(),
      status: body.paymentType === 'Cash on Delivery' ? 'pending' : 'pending_payment',
      paymentType: body.paymentType,
      items: quote.items,
      bill: quote.bill,
      ...(quote.coupon?.valid ? { couponCode: quote.coupon.coupon.code } : {}),
      address: body.address,
      storeId: serving.store.id,
      deliveryOtp: makeDeliveryOtp(),
      etaMinutes: trackingMinutes(config.eta, serving.km, itemTypes),
      ...(slotCheck.slot ? { scheduledFor: slotCheck.slot } : {}),
    };
    const saved = await orders.create(user.id, body.requestId, order);
    if (saved === 'out_of_stock') {
      return reply.code(409).send({
        error: 'items_unavailable',
        message: 'Some items in your cart are no longer available in the requested quantity. Please review your cart.',
        unavailable: [],
      });
    }

    if (saved.status === 'pending') {
      await carts.replace(user.id, []);
      return reply.code(201).send({ order: saved });
    }
    if (saved.status !== 'pending_payment' || !gateway) return reply.code(201).send({ order: saved });

    try {
      const amountPaise = saved.bill.grandTotal * 100;
      const gatewayOrder = await gateway.createOrder({ amountPaise, receipt: saved.id });
      await orders.attachGatewayOrder(saved.id, gatewayOrder.id);
      return reply.code(201).send({ order: saved, razorpay: { keyId: gateway.keyId, orderId: gatewayOrder.id, amount: amountPaise } });
    } catch (error) {
      request.log.error(error, 'razorpay order failed');
      await orders.markPaymentFailed(saved.id);
      return reply.code(503).send({ error: 'payment_unavailable', message: ONLINE_UNAVAILABLE });
    }
  });

  app.post<{ Params: { id: string } }>('/orders/:id/payment', async (request, reply) => {
    const user = await requireUser(request, reply, accounts);
    if (!user) return;
    const parsed = paymentBody.safeParse(request.body);
    if (!parsed.success || !gateway) return reply.code(400).send({ error: 'invalid_payment' });
    const found = await orders.findByGatewayOrder(parsed.data.razorpayOrderId);
    if (!found || found.id !== request.params.id || found.userId !== user.id) return reply.code(404).send({ error: 'not_found' });
    const ok = gateway.verifyPayment({
      gatewayOrderId: parsed.data.razorpayOrderId,
      paymentId: parsed.data.razorpayPaymentId,
      signature: parsed.data.razorpaySignature,
    });
    if (!ok) return reply.code(400).send({ error: 'invalid_signature', message: 'Payment verification failed' });
    if (await orders.markPaid(found.id, parsed.data.razorpayPaymentId)) await carts.replace(user.id, []);
    return { order: await orders.get(user.id, found.id) };
  });

  app.post<{ Params: { id: string } }>('/orders/:id/payment-failed', async (request, reply) => {
    const user = await requireUser(request, reply, accounts);
    if (!user) return;
    const order = await orders.get(user.id, request.params.id);
    if (!order) return reply.code(404).send({ error: 'not_found' });
    await orders.markPaymentFailed(order.id);
    return { order: await orders.get(user.id, order.id) };
  });

  app.get('/orders', async (request, reply) => {
    const user = await requireUser(request, reply, accounts);
    if (!user) return;
    await orders.expirePending(PAYMENT_WINDOW_MS);
    return orders.list(user.id);
  });

  app.get<{ Params: { id: string } }>('/orders/:id', async (request, reply) => {
    const user = await requireUser(request, reply, accounts);
    if (!user) return;
    const order = await orders.get(user.id, request.params.id);
    return order ?? reply.code(404).send({ error: 'not_found' });
  });

  // Razorpay calls this with a signature over the raw body; it confirms payments even if the app was closed.
  await app.register(async (hooks) => {
    hooks.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => done(null, body));
    hooks.post('/payments/webhook', async (request, reply) => {
      const raw = typeof request.body === 'string' ? request.body : '';
      const signature = String(request.headers['x-razorpay-signature'] ?? '');
      if (!gateway || !gateway.verifyWebhook(raw, signature)) return reply.code(400).send({ error: 'invalid_signature' });
      const event = JSON.parse(raw) as {
        event?: string;
        payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
      };
      const payment = event.payload?.payment?.entity;
      if (!payment?.order_id) return reply.code(204).send();
      const found = await orders.findByGatewayOrder(payment.order_id);
      if (!found) return reply.code(204).send();
      // A failed attempt is not final (the customer can retry in the same checkout); unpaid orders expire instead.
      if (event.event === 'payment.captured' || event.event === 'order.paid') {
        if (await orders.markPaid(found.id, payment.id ?? '')) await carts.replace(found.userId, []);
      }
      return reply.code(204).send();
    });
  });
}
