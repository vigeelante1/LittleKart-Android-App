import { describe, expect, it } from 'vitest';
import { addOnCodAllowed, addOnSecondsLeft, billWithAddOn, canAddItems, countdownLabel, orderWithAddOn, payAtDoor, quoteAddOn } from '../src/addon';
import type { Order } from '../src/orders';
import { products } from '../src/seed';

const T = 1_800_000_000_000;
const bill = { itemsTotal: 126, mrpTotal: 140, mrpSavings: 14, deliveryFee: 0, platformFee: 10, lateNightFee: 0, longDistanceFee: 0, tip: 0, couponDiscount: 20, grandTotal: 116 };
const order: Order = {
  id: 'LK1', createdAt: T, placedAt: T, status: 'pending', paymentType: 'Cash on Delivery',
  items: [{ productId: 'amul-butter', variantId: 'amul-100', name: 'Butter', label: '100G', imageUrl: '', itemType: 'product', price: 63, mrp: 70, qty: 2 }],
  bill, address: { name: 'A', phone: '1', text: 'x', lat: 0, lng: 0 }, storeId: 's', deliveryOtp: '1234', etaMinutes: 20,
};
const line = (productId: string, variantId: string, qty: number) => ({ productId, variantId, qty, addedAt: 1 });

describe('add items after ordering (D-105)', () => {
  it('opens for 40 seconds after placing, with 5 seconds of grace on the server', () => {
    expect(addOnSecondsLeft(order, T)).toBe(40);
    expect(addOnSecondsLeft(order, T + 7_500)).toBe(33);
    expect(addOnSecondsLeft(order, T + 40_000)).toBe(0);
    expect(countdownLabel(33)).toBe('0:33');
    expect(canAddItems(order, T + 44_000)).toBe(true);
    expect(canAddItems(order, T + 45_000)).toBe(false);
  });
  it('is closed for scheduled, unpaid or moved-on orders', () => {
    expect(addOnSecondsLeft({ ...order, scheduledFor: { start: T + 1e7, end: T + 2e7 } }, T)).toBe(0);
    expect(canAddItems({ ...order, status: 'pending_payment' }, T)).toBe(false);
    expect(canAddItems({ ...order, status: 'accepted' }, T)).toBe(false);
    expect(canAddItems({ ...order, placedAt: undefined }, T)).toBe(false);
  });
  it('prices add-ons, drops unknown lines and keeps the 30-unit limit across the order', () => {
    const q = quoteAddOn(order, [line('parle-g', 'parle-g-1', 2), line('nope', 'x', 1), line('amul-butter', 'amul-100', 29)], products);
    expect(q.items).toEqual([expect.objectContaining({ productId: 'parle-g', qty: 2, addedLater: true })]);
    expect(q.amount).toBe(2 * (q.items[0]?.price ?? 0));
    expect(q.unavailable).toHaveLength(1);
    expect(q.overLimit).toHaveLength(1);
  });
  it('adds no fees and keeps the original discount', () => {
    const items = quoteAddOn(order, [line('parle-g', 'parle-g-1', 1)], products).items;
    const b = billWithAddOn(bill, items);
    expect(b.itemsTotal).toBe(126 + 30);
    expect(b.grandTotal).toBe(116 + 30);
    expect([b.platformFee, b.deliveryFee, b.couponDiscount]).toEqual([10, 0, 20]);
    const merged = orderWithAddOn(order, { id: 'A1', createdAt: T + 10_000, paymentType: 'UPI' }, items);
    expect(merged.items).toHaveLength(2);
    expect(merged.addOns).toEqual([{ id: 'A1', createdAt: T + 10_000, paymentType: 'UPI', amount: 30 }]);
    expect(payAtDoor(merged)).toBe(116);
    expect(payAtDoor({ ...merged, paymentType: 'UPI', addOns: [{ id: 'A2', createdAt: 1, paymentType: 'Cash on Delivery', amount: 30 }] })).toBe(30);
  });
  it('Cash on Delivery for an add-on follows the whole-order rule', () => {
    const small = quoteAddOn(order, [line('parle-g', 'parle-g-1', 1)], products).items;
    expect(addOnCodAllowed(order, small)).toBe(true);
    const meat = quoteAddOn(order, [line('chicken-curry-skinless', 'ccs-1kg', 1)], products).items;
    expect(addOnCodAllowed(order, meat)).toBe(false);
    const big = quoteAddOn(order, [line('india-gate-basmati', 'india-gate-basmati-1', 5)], products).items;
    expect(addOnCodAllowed(order, big)).toBe(false);
  });
});
