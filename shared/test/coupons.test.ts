import { describe, expect, it } from 'vitest';
import type { PricedLine } from '../src/bill';
import {
  couponRemovedMessage,
  couponShortfallMessage,
  couponStatuses,
  eligibleTotal,
  filterCouponStatuses,
  validateCoupon,
} from '../src/coupons';

// Screenshot cart: chicken (meat, exempt) ₹164 + ₹80 + ₹120 non-exempt = ₹200 eligible.
const cart: PricedLine[] = [
  { price: 164, qty: 1, couponExempt: true },
  { price: 80, qty: 1, couponExempt: false },
  { price: 120, qty: 1, couponExempt: false },
];

const coupons = [
  { code: 'FESTIVE50', title: '₹50 Limited Offer', discount: 50, minOrder: 750 },
  { code: 'FESTIVE100', title: '₹100 Limited Offer', discount: 100, minOrder: 1500 },
  { code: 'FESTIVE150', title: '₹150 Limited Offer', discount: 150, minOrder: 2000 },
];

describe('coupons', () => {
  it('ignores exempt (meat) lines in the eligible total', () => {
    expect(eligibleTotal(cart)).toBe(200);
  });

  it('reproduces the "550 / 1300 / 1800 more" hints from the screenshot', () => {
    expect(couponStatuses(coupons, cart).map((s) => s.shortfall)).toEqual([550, 1300, 1800]);
    expect(couponStatuses(coupons, cart).every((s) => !s.applicable)).toBe(true);
  });

  it('marks a coupon applicable once the minimum is reached', () => {
    const big: PricedLine[] = [{ price: 750, qty: 1, couponExempt: false }];
    const [first] = couponStatuses(coupons, big);
    expect(first?.applicable).toBe(true);
    expect(first?.shortfall).toBe(0);
  });

  it('writes the hint with the rupee sign', () => {
    expect(couponShortfallMessage(550)).toBe('Add non-exempt products worth ₹550 more to apply');
  });

  it('flags a meat-only cart as exempt-only', () => {
    const meat: PricedLine[] = [{ price: 900, qty: 1, couponExempt: true }];
    const [first] = couponStatuses(coupons, meat);
    expect(first?.exemptOnly).toBe(true);
    expect(validateCoupon('festive50', coupons, meat)).toMatchObject({ valid: false, reason: 'exempt_categories_only' });
  });

  it('validates codes without regard to case and spaces', () => {
    const big: PricedLine[] = [{ price: 800, qty: 1, couponExempt: false }];
    expect(validateCoupon(' festive50 ', coupons, big)).toMatchObject({ valid: true, discount: 50 });
    expect(validateCoupon('NOPE', coupons, big)).toMatchObject({ valid: false, message: 'Invalid coupon' });
    expect(validateCoupon('', coupons, big)).toMatchObject({ valid: false, message: 'Please enter a coupon code' });
    expect(validateCoupon('FESTIVE100', coupons, big)).toMatchObject({ valid: false, reason: 'min_order_amount' });
  });

  it('filters the list by the typed text', () => {
    const list = couponStatuses(coupons, cart);
    expect(filterCouponStatuses(list, 'e100').map((s) => s.coupon.code)).toEqual(['FESTIVE100']);
    expect(filterCouponStatuses(list, '')).toHaveLength(3);
  });

  it('explains why an applied coupon was removed', () => {
    const check = validateCoupon('FESTIVE50', coupons, cart);
    expect(couponRemovedMessage('FESTIVE50', check, 750)).toBe('Coupon FESTIVE50 removed — non-exempt items are below ₹750');
  });
});
