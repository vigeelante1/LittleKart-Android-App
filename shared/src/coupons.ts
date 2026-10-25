// Coupon eligibility. Exempt categories (meat) do not count toward the minimum order value.
import type { PricedLine } from './bill';
import { formatRupee } from './money';
import type { Coupon } from './types';

/** Sum of price × qty over non-exempt lines. */
export function eligibleTotal(lines: readonly PricedLine[]): number {
  return lines.reduce((sum, l) => (l.couponExempt ? sum : sum + l.price * l.qty), 0);
}

/** Sum of price × qty over exempt lines. */
export function excludedTotal(lines: readonly PricedLine[]): number {
  return lines.reduce((sum, l) => (l.couponExempt ? sum + l.price * l.qty : sum), 0);
}

export interface CouponStatus {
  coupon: Coupon;
  applicable: boolean;
  /** Rupees of non-exempt products still needed. 0 when applicable. */
  shortfall: number;
  /** Only exempt products (meat) are in the cart, so no coupon can apply. */
  exemptOnly: boolean;
  /** "Save ₹50" on applicable cards. */
  estimatedDiscount: number;
}

export function couponStatus(coupon: Coupon, eligible: number, excluded = 0): CouponStatus {
  const shortfall = Math.max(0, coupon.minOrder - eligible);
  const applicable = shortfall === 0 && eligible > 0;
  return {
    coupon,
    applicable,
    shortfall: applicable ? 0 : shortfall,
    exemptOnly: !applicable && eligible <= 0 && excluded > 0,
    estimatedDiscount: applicable ? Math.min(coupon.discount, eligible) : 0,
  };
}

export function couponStatuses(coupons: readonly Coupon[], lines: readonly PricedLine[]): CouponStatus[] {
  const eligible = eligibleTotal(lines);
  const excluded = excludedTotal(lines);
  return coupons.map((c) => couponStatus(c, eligible, excluded));
}

/** The grey hint under a coupon that can't be used yet ("Rs" in the live copy is written "₹", DECISIONS D-21). */
export function couponShortfallMessage(shortfall: number): string {
  return `Add non-exempt products worth ${formatRupee(Math.ceil(shortfall))} more to apply`;
}

/** Codes are matched without regard to case or surrounding spaces. */
export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

/** The list filtered by the text in the coupon field (code or title). */
export function filterCouponStatuses(statuses: readonly CouponStatus[], term: string): CouponStatus[] {
  const q = normalizeCouponCode(term);
  if (!q) return [...statuses];
  return statuses.filter((s) => s.coupon.code.includes(q) || s.coupon.title.toUpperCase().includes(q));
}

export type CouponCheck =
  | { valid: true; coupon: Coupon; discount: number }
  | { valid: false; reason: 'empty' | 'not_found' | 'min_order_amount' | 'exempt_categories_only'; message: string };

/** Checks a code against the cart. The server repeats this check when the order is placed (D-16). */
export function validateCoupon(code: string, coupons: readonly Coupon[], lines: readonly PricedLine[]): CouponCheck {
  const wanted = normalizeCouponCode(code);
  if (!wanted) return { valid: false, reason: 'empty', message: 'Please enter a coupon code' };
  const coupon = coupons.find((c) => c.code === wanted);
  if (!coupon) return { valid: false, reason: 'not_found', message: 'Invalid coupon' };
  const status = couponStatus(coupon, eligibleTotal(lines), excludedTotal(lines));
  if (status.exemptOnly) {
    return { valid: false, reason: 'exempt_categories_only', message: 'Not available for exempt categories in this cart.' };
  }
  if (!status.applicable) {
    return { valid: false, reason: 'min_order_amount', message: couponShortfallMessage(status.shortfall) };
  }
  return { valid: true, coupon, discount: status.estimatedDiscount };
}

/** Snackbar after a coupon stops applying because the cart changed. */
export function couponRemovedMessage(code: string, check: CouponCheck, minOrder: number): string {
  if (check.valid) return '';
  if (check.reason === 'exempt_categories_only') {
    return `Coupon ${code} removed — only exempt items (e.g. Meat/Food) are left in the cart`;
  }
  if (check.reason === 'min_order_amount') return `Coupon ${code} removed — non-exempt items are below ${formatRupee(minOrder)}`;
  return `Coupon ${code} removed: no longer valid for this cart`;
}
