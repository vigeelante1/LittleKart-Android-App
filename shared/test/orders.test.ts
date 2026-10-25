import { describe, expect, it } from 'vitest';
import { codAllowed, codUnavailableMessage, formatOrderDate, makeOrderId, quoteOrder, stepNumber, formatOrderTime, statusLabel, isTrackable } from '../src/orders';
import { DEFAULT_PRICING_SETTINGS } from '../src/pricing';
import type { Product } from '../src/types';

const butter: Product = {
  id: 'amul-butter',
  categoryId: 'dairy',
  name: 'Amul Butter',
  imageUrl: 'asset:product',
  itemType: 'product',
  couponExempt: false,
  variants: [{ id: 'amul-100', label: '100G', price: 63, stock: 5 }],
};
const chicken: Product = {
  id: 'chicken',
  categoryId: 'chicken',
  name: 'Chicken',
  imageUrl: 'asset:product',
  itemType: 'meat',
  couponExempt: true,
  variants: [{ id: 'c-500', label: '500g', price: 330, stock: 9 }],
};
const NOON = Date.UTC(2026, 9, 23, 6, 30);

describe('orders', () => {
  it('allows Cash on Delivery only below ₹1000 and without meat or food', () => {
    expect(codAllowed(999, ['product'])).toBe(true);
    expect(codAllowed(1000, ['product'])).toBe(false);
    expect(codAllowed(200, ['product', 'meat'])).toBe(false);
    expect(codUnavailableMessage(false)).toContain('orders below ₹1000');
  });

  it('prices an order on the server with fees, tip and coupon, and reports missing stock', () => {
    const quote = quoteOrder({
      lines: [
        { productId: 'amul-butter', variantId: 'amul-100', qty: 1, addedAt: 0 },
        { productId: 'chicken', variantId: 'c-500', qty: 10, addedAt: 0 },
      ],
      products: [butter, chicken],
      distanceKm: 2,
      tip: 20,
      coupons: [],
      settings: DEFAULT_PRICING_SETTINGS,
      nowMs: NOON,
    });
    expect(quote.unavailable.map((l) => l.productId)).toEqual(['chicken']);
    expect(quote.items).toHaveLength(1);
    // ₹63 groceries: ₹30 delivery + ₹10 platform + ₹20 tip.
    expect(quote.bill.grandTotal).toBe(123);
  });

  it('formats dates and ids as the site does', () => {
    expect(formatOrderDate(Date.UTC(2026, 9, 23, 19, 35))).toBe('24 Oct at 1:05 AM');
    expect(makeOrderId(() => 0)).toBe('LKAAAAAAAA');
    expect(stepNumber('pending')).toBe(1);
    expect(stepNumber('assigned')).toBe(3);
    expect(statusLabel('payment_failed')).toBe('Payment Failed');
    expect(formatOrderTime(Date.UTC(2026, 9, 23, 19, 35))).toBe('01:05 AM');
    const at = Date.UTC(2026, 9, 23, 19, 35);
    expect(isTrackable({ status: 'pending', createdAt: at }, at + 44 * 60_000)).toBe(true);
    expect(isTrackable({ status: 'pending', createdAt: at }, at + 46 * 60_000)).toBe(false);
  });
});
