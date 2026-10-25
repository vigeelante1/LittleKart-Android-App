import { describe, expect, it } from 'vitest';
import { computeBill, type PricedLine } from '../src/bill';

// The worked example from the screenshots (DESIGN_SPEC S8): Chicken ₹164, Keera ₹80 (MRP 120), Allam ₹120 (MRP 160).
const screenshotCart: PricedLine[] = [
  { price: 164, qty: 1, couponExempt: true },
  { price: 80, mrp: 120, qty: 1, couponExempt: false },
  { price: 120, mrp: 160, qty: 1, couponExempt: false },
];
const fees = { deliveryFee: 30, platformFee: 10 };

describe('computeBill', () => {
  it('matches the screenshot bill: 364 / 444 / 80 / 30 / 10 / 404', () => {
    const bill = computeBill(screenshotCart, fees);
    expect(bill.itemsTotal).toBe(364);
    expect(bill.mrpTotal).toBe(444);
    expect(bill.mrpSavings).toBe(80);
    expect(bill.deliveryFee).toBe(30);
    expect(bill.platformFee).toBe(10);
    expect(bill.grandTotal).toBe(404);
  });

  it('adds the tip to the grand total', () => {
    expect(computeBill(screenshotCart, fees, 20).grandTotal).toBe(424);
  });

  it('subtracts a coupon discount, never below zero items total', () => {
    expect(computeBill(screenshotCart, fees, 0, 50).grandTotal).toBe(354);
    expect(computeBill([{ price: 10, qty: 1, couponExempt: false }], fees, 0, 50).couponDiscount).toBe(10);
  });

  it('multiplies by quantity', () => {
    const bill = computeBill([{ price: 45, mrp: 50, qty: 3, couponExempt: false }], fees);
    expect(bill.itemsTotal).toBe(135);
    expect(bill.mrpSavings).toBe(15);
  });

  it('charges no fees or tip on an empty cart', () => {
    const bill = computeBill([], fees, 30);
    expect(bill.grandTotal).toBe(0);
  });
});
