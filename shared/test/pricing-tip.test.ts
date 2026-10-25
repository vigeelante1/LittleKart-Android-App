import { describe, expect, it } from 'vitest';
import { computeBill } from '../src/bill';
import { computeFees, deliveryFeeInfo, freeDeliveryNudge, istMinutes } from '../src/pricing';
import { applyCustom, canApplyCustom, NO_TIP, tapPreset, toggleCustom, typeCustom } from '../src/tip';

// 23 Oct 2026, 12:00 and 22:30 India time.
const NOON = Date.UTC(2026, 9, 23, 6, 30);
const LATE = Date.UTC(2026, 9, 23, 17, 0);
const near = 2;

describe('computeFees (live delivery-pricing settings)', () => {
  it('reads India time', () => {
    expect(istMinutes(NOON)).toBe(12 * 60);
    expect(istMinutes(LATE)).toBe(22 * 60 + 30);
  });

  it('charges ₹30 + ₹10 below ₹99 for groceries', () => {
    const fees = computeFees({ itemsTotal: 63, lines: [{ price: 63, qty: 1, itemType: 'product' }], distanceKm: near, nowMs: NOON });
    expect([fees.deliveryFee, fees.platformFee]).toEqual([30, 10]);
    expect(freeDeliveryNudge(fees, 63)).toEqual({ kind: 'add-more', amount: 36, progressPercent: (63 / 99) * 100 });
  });

  it('makes delivery and platform fee free from ₹99 for groceries', () => {
    const fees = computeFees({ itemsTotal: 120, lines: [{ price: 120, qty: 1, itemType: 'product' }], distanceKm: near, nowMs: NOON });
    expect([fees.deliveryFee, fees.platformFee, fees.baseDeliveryFee, fees.baseHandlingFee]).toEqual([0, 0, 30, 10]);
    expect(freeDeliveryNudge(fees, 120)).toEqual({ kind: 'unlocked' });
  });

  it('always charges ₹30 + ₹10 when meat is in the cart (the live cart and the screenshot bill)', () => {
    const lines = [
      { price: 330, qty: 1, itemType: 'meat' as const },
      { price: 328, qty: 1, itemType: 'meat' as const },
    ];
    const fees = computeFees({ itemsTotal: 658, lines, distanceKm: near, nowMs: NOON });
    expect([fees.deliveryFee, fees.platformFee]).toEqual([30, 10]);
    expect(deliveryFeeInfo(fees)).toBe('Delivery charges applied for restaurant food and meat orders.');
    expect(freeDeliveryNudge(fees, 658)).toBeNull();
    const bill = computeBill([{ price: 658, qty: 1, couponExempt: true }], fees);
    expect(bill.grandTotal).toBe(698);
  });

  it('adds the ₹20 late-night fee after 22:00', () => {
    const fees = computeFees({ itemsTotal: 120, lines: [{ price: 120, qty: 1, itemType: 'product' }], distanceKm: near, nowMs: LATE });
    expect(fees.lateNightFee).toBe(20);
    expect(deliveryFeeInfo(fees)).toBe('A late-night delivery fee of ₹20 applies after 22:00.');
  });

  it('adds the ₹30 long-distance fee beyond 5 km below ₹499', () => {
    const fees = computeFees({ itemsTotal: 150, lines: [{ price: 150, qty: 1, itemType: 'product' }], distanceKm: 5.5, nowMs: NOON });
    expect(fees.longDistanceFee).toBe(30);
    expect(freeDeliveryNudge(fees, 150)).toMatchObject({ kind: 'add-more', amount: 349 });
  });

  it('explains the free-delivery threshold for a nearby grocery cart', () => {
    const fees = computeFees({ itemsTotal: 50, lines: [{ price: 50, qty: 1, itemType: 'product' }], distanceKm: near, nowMs: NOON });
    expect(deliveryFeeInfo(fees)).toBe('A delivery charge applies for orders below ₹99. Orders of ₹99 or more qualify for free delivery.');
  });

  it('never bills less than ₹1', () => {
    expect(computeBill([{ price: 20, qty: 1, couponExempt: false }], { deliveryFee: 0, platformFee: 0 }, 0, 50).grandTotal).toBe(1);
  });
});

describe('tip', () => {
  it('selects a preset and clears it on a second tap', () => {
    const ten = tapPreset(NO_TIP, 10);
    expect(ten.amount).toBe(10);
    expect(tapPreset(ten, 10)).toMatchObject({ preset: null, amount: 0 });
  });

  it('opens the custom field, which drops the preset', () => {
    const open = toggleCustom(tapPreset(NO_TIP, 20));
    expect(open).toMatchObject({ customOpen: true, preset: null, amount: 0 });
    expect(toggleCustom(typeCustom(open, '50'))).toMatchObject({ customOpen: false, customText: '', amount: 0 });
  });

  it('counts custom amounts of 10 to 1000 only', () => {
    const open = toggleCustom(NO_TIP);
    expect(typeCustom(open, '5')).toMatchObject({ customText: '5', amount: 0 });
    expect(canApplyCustom(typeCustom(open, '5'))).toBe(false);
    expect(typeCustom(open, '2500')).toMatchObject({ customText: '1000', amount: 1000 });
    expect(typeCustom(open, '4a')).toBe(open);
    const applied = applyCustom(typeCustom(open, '45'));
    expect(applied).toMatchObject({ customOpen: false, amount: 45 });
  });
});
