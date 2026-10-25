// Orders and payments on both data layers (PostgreSQL when TEST_DATABASE_URL is set).
import { createHmac } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { memoryData } from '../src/data/memory.js';
import { pgData } from '../src/data/pg.js';
import type { DataLayer } from '../src/data/types.js';
import { connect } from '../src/db/client.js';
import { migrate } from '../src/db/migrate.js';
import { seed } from '../src/db/seed.js';
import { razorpay, type PaymentGateway } from '../src/payments/gateway.js';

const PG_URL = process.env.TEST_DATABASE_URL;
/** 12:00 in India, when the stores are open. */
const NOON = Date.UTC(2026, 9, 24, 6, 30);
const NIGHT = Date.UTC(2026, 9, 24, 21, 0); // 2:30 AM in India
const SECRET = 'test_secret';
const WEBHOOK = 'hook_secret';

function fakeGateway(): PaymentGateway {
  const real = razorpay('rzp_test_abc', SECRET, WEBHOOK);
  let n = 0;
  return { ...real, createOrder: async () => ({ id: `order_${++n}` }) };
}
const sign = (orderId: string, paymentId: string) => createHmac('sha256', SECRET).update(`${orderId}|${paymentId}`).digest('hex');

async function freshPg(): Promise<DataLayer> {
  if (!PG_URL) throw new Error('TEST_DATABASE_URL missing');
  const sql = connect(PG_URL);
  await sql.unsafe('drop schema public cascade; create schema public;');
  await migrate(sql);
  await seed(sql);
  return pgData(sql);
}

const layers: [string, () => Promise<DataLayer>][] = [['memory', async () => memoryData()]];
if (PG_URL) layers.push(['postgres', freshPg]);

const ADDRESS = { name: 'SV', phone: '9718141441', text: 'Bus stand, Nalgonda', lat: 17.0557, lng: 79.2745 };
const butter = (qty: number) => ({ productId: 'amul-butter', variantId: 'amul-100', qty, addedAt: 1 });
let seq = 0;
const rid = () => `req-${Date.now()}-${++seq}`;

describe.each(layers)('%s orders', (name, make) => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let auth: { authorization: string };

  beforeAll(async () => {
    app = await buildApp({ data: await make(), gateway: fakeGateway(), auth: { reviewPhones: new Set(['*']), reviewOtp: '1234' }, now: () => NOON });
    await app.inject({ method: 'POST', url: '/auth/otp/send', payload: { phone: '9718141441', purpose: 'signup' } });
    const v = await app.inject({ method: 'POST', url: '/auth/otp/verify', payload: { phone: '9718141441', otp: '1234', purpose: 'signup', name: 'SV' } });
    auth = { authorization: `Bearer ${(v.json() as { token: string }).token}` };
  });
  afterAll(async () => {
    await app.close();
  });

  const place = (body: Record<string, unknown>) =>
    app.inject({
      method: 'POST',
      url: '/orders',
      headers: auth,
      payload: { requestId: rid(), lines: [butter(1)], address: ADDRESS, tip: 0, paymentType: 'Cash on Delivery', ...body },
    });
  const stock = async () =>
    ((await app.inject({ method: 'GET', url: '/products?ids=amul-butter' })).json() as { variants: { stock: number }[] }[])[0]?.variants[0]?.stock;

  it('places a Cash on Delivery order with server prices and empties the saved cart', async () => {
    await app.inject({ method: 'PUT', url: '/cart', headers: auth, payload: { lines: [butter(2)] } });
    const before = await stock();
    const res = await place({ lines: [butter(2)], tip: 10 });
    expect(res.statusCode).toBe(201);
    const { order } = res.json() as { order: { id: string; status: string; bill: { grandTotal: number }; deliveryOtp: string } };
    // 2 × ₹63 = ₹126 (free delivery from ₹99) + ₹10 tip.
    expect(order).toMatchObject({ status: 'pending', bill: { grandTotal: 136 } });
    expect(order.deliveryOtp).toMatch(/^\d{4}$/);
    expect(((await app.inject({ method: 'GET', url: '/cart', headers: auth })).json() as { lines: unknown[] }).lines).toEqual([]);
    if (name === 'postgres') expect(await stock()).toBe((before ?? 0) - 2);
    const list = (await app.inject({ method: 'GET', url: '/orders', headers: auth })).json() as { id: string }[];
    expect(list[0]?.id).toBe(order.id);
  });

  it('returns the same order for a repeated request', async () => {
    const requestId = rid();
    const a = (await place({ requestId })).json() as { order: { id: string } };
    const b = (await place({ requestId })).json() as { order: { id: string } };
    expect(b.order.id).toBe(a.order.id);
  });

  it('refuses Cash on Delivery for meat and for ₹1000 or more', async () => {
    const meat = await place({ lines: [{ productId: 'chicken-boneless', variantId: 'cb-500', qty: 1, addedAt: 1 }] });
    expect(meat.json()).toMatchObject({ error: 'cod_unavailable', message: expect.stringContaining('regular products') });
    const big = await place({ lines: [{ productId: 'vijaya-groundnut-oil', variantId: 'vgo-1l', qty: 6, addedAt: 1 }] });
    expect(big.json()).toMatchObject({ error: 'cod_unavailable', message: expect.stringContaining('below ₹1000') });
  });

  it('refuses addresses outside the delivery area and missing stock', async () => {
    expect((await place({ address: { ...ADDRESS, lat: 17.385, lng: 78.4867 } })).json()).toMatchObject({ error: 'not_deliverable' });
    const tooMany = await place({ lines: [{ productId: 'chicken-boneless', variantId: 'cb-500', qty: 10, addedAt: 1 }], paymentType: 'UPI' });
    expect(tooMany.json()).toMatchObject({ error: 'items_unavailable' });
  });

  it('takes a Razorpay payment: pending → placed only with a valid signature', async () => {
    const res = await place({ paymentType: 'UPI', lines: [butter(1)] });
    const { order, razorpay: rz } = res.json() as { order: { id: string; status: string }; razorpay: { keyId: string; orderId: string; amount: number } };
    expect(order.status).toBe('pending_payment');
    expect(rz).toMatchObject({ keyId: 'rzp_test_abc', amount: 10300 });

    const bad = await app.inject({
      method: 'POST',
      url: `/orders/${order.id}/payment`,
      headers: auth,
      payload: { razorpayOrderId: rz.orderId, razorpayPaymentId: 'pay_1', razorpaySignature: 'nope' },
    });
    expect(bad.statusCode).toBe(400);
    const good = await app.inject({
      method: 'POST',
      url: `/orders/${order.id}/payment`,
      headers: auth,
      payload: { razorpayOrderId: rz.orderId, razorpayPaymentId: 'pay_1', razorpaySignature: sign(rz.orderId, 'pay_1') },
    });
    expect((good.json() as { order: { status: string } }).order.status).toBe('pending');
  });

  it('marks a closed payment as Payment Failed and puts the stock back; a late webhook still places it', async () => {
    const before = await stock();
    const { order, razorpay: rz } = (await place({ paymentType: 'UPI', lines: [butter(3)] })).json() as {
      order: { id: string };
      razorpay: { orderId: string };
    };
    const failed = await app.inject({ method: 'POST', url: `/orders/${order.id}/payment-failed`, headers: auth });
    expect((failed.json() as { order: { status: string } }).order.status).toBe('payment_failed');
    if (name === 'postgres') expect(await stock()).toBe(before);

    const body = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_9', order_id: rz.orderId } } } });
    const unsigned = await app.inject({ method: 'POST', url: '/payments/webhook', headers: { 'content-type': 'application/json', 'x-razorpay-signature': 'x' }, payload: body });
    expect(unsigned.statusCode).toBe(400);
    const hook = await app.inject({
      method: 'POST',
      url: '/payments/webhook',
      headers: { 'content-type': 'application/json', 'x-razorpay-signature': createHmac('sha256', WEBHOOK).update(body).digest('hex') },
      payload: body,
    });
    expect(hook.statusCode).toBe(204);
    const got = (await app.inject({ method: 'GET', url: `/orders/${order.id}`, headers: auth })).json() as { status: string };
    expect(got.status).toBe('pending');
  });

  it('refuses orders while the store is closed (2:30 AM)', async () => {
    const night = await buildApp({ data: memoryData(), auth: { reviewPhones: new Set(['*']), reviewOtp: '1234' }, now: () => NIGHT });
    await night.inject({ method: 'POST', url: '/auth/otp/send', payload: { phone: '9000000003', purpose: 'signup' } });
    const v = await night.inject({ method: 'POST', url: '/auth/otp/verify', payload: { phone: '9000000003', otp: '1234', purpose: 'signup', name: 'A' } });
    const res = await night.inject({
      method: 'POST',
      url: '/orders',
      headers: { authorization: `Bearer ${(v.json() as { token: string }).token}` },
      payload: { requestId: rid(), lines: [butter(1)], address: ADDRESS, tip: 0, paymentType: 'Cash on Delivery' },
    });
    expect(res.json()).toMatchObject({ error: 'store_closed', details: expect.arrayContaining(['Current store time: 02:30']) });
    await night.close();
  });

  it('says online payment is unavailable without Razorpay keys', async () => {
    const plain = await buildApp({ data: memoryData(), auth: { reviewPhones: new Set(['*']), reviewOtp: '1234' }, now: () => NOON });
    await plain.inject({ method: 'POST', url: '/auth/otp/send', payload: { phone: '9000000002', purpose: 'signup' } });
    const v = await plain.inject({ method: 'POST', url: '/auth/otp/verify', payload: { phone: '9000000002', otp: '1234', purpose: 'signup', name: 'A' } });
    const res = await plain.inject({
      method: 'POST',
      url: '/orders',
      headers: { authorization: `Bearer ${(v.json() as { token: string }).token}` },
      payload: { requestId: rid(), lines: [butter(1)], address: ADDRESS, tip: 0, paymentType: 'UPI' },
    });
    expect(res.statusCode).toBe(503);
    await plain.close();
  });
});
