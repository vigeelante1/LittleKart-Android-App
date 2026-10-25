// Delivery, platform and extra fees, as the live cart computes them (littlekart.com cart, read 23 Oct 2026).
// Settings are the live values of GET /api/public/delivery-pricing-settings (DECISIONS D-56). Rules our
// catalog cannot trigger yet (rain surge, special events) are left out; the settings that drive them are off.
import type { ItemType } from './types';

export interface PricingSettings {
  freeDeliveryThreshold: number;
  deliveryFeeAmount: number;
  handlingFeeAmount: number;
  lateNightFeeAmount: number;
  longDistanceFeeAmount: number;
  /** Below the free-delivery threshold: charge delivery / platform fee. */
  amountApplyDeliveryFee: boolean;
  amountApplyHandlingFee: boolean;
  longDistanceEnabled: boolean;
  longDistanceKm: number;
  /** "HH:mm" in India time. */
  lateNightAfterTime: string;
  lateNightEnabled: boolean;
  distanceAmountEnabled: boolean;
  distanceAmountKm: number;
  distanceAmountMaxOrder: number;
  foodDeliveryEnabled: boolean;
  foodDeliveryThreshold: number;
  foodDeliveryFeeBelow: number;
  foodDeliveryFeeAtOrAbove: number;
  foodDeliveryApplyHandlingFee: boolean;
  meatChargesEnabled: boolean;
  meatValueThreshold: number;
  meatDeliveryFeeBelow: number;
  meatDeliveryFeeAtOrAbove: number;
  meatHandlingFeeBelow: number;
  meatHandlingFeeAtOrAbove: number;
  meatLateNightFeeBelow: number;
  meatLateNightFeeAtOrAbove: number;
}

/** Live values (updatedAt 2026-09-28). */
export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  freeDeliveryThreshold: 99,
  deliveryFeeAmount: 30,
  handlingFeeAmount: 10,
  lateNightFeeAmount: 20,
  longDistanceFeeAmount: 30,
  amountApplyDeliveryFee: true,
  amountApplyHandlingFee: true,
  longDistanceEnabled: true,
  longDistanceKm: 4.5,
  lateNightAfterTime: '22:00',
  lateNightEnabled: true,
  distanceAmountEnabled: true,
  distanceAmountKm: 5,
  distanceAmountMaxOrder: 499,
  foodDeliveryEnabled: true,
  foodDeliveryThreshold: 399,
  foodDeliveryFeeBelow: 40,
  foodDeliveryFeeAtOrAbove: 40,
  foodDeliveryApplyHandlingFee: false,
  meatChargesEnabled: true,
  meatValueThreshold: 499,
  meatDeliveryFeeBelow: 30,
  meatDeliveryFeeAtOrAbove: 30,
  meatHandlingFeeBelow: 10,
  meatHandlingFeeAtOrAbove: 10,
  meatLateNightFeeBelow: 20,
  meatLateNightFeeAtOrAbove: 20,
};

export interface FeeLine {
  price: number;
  qty: number;
  itemType: ItemType;
}

export interface FeeInput {
  /** Items total of the lines that will be billed (out-of-stock lines left out). */
  itemsTotal: number;
  lines: readonly FeeLine[];
  /** Distance from the serving store; null when unknown. */
  distanceKm: number | null;
  nowMs?: number;
  settings?: PricingSettings;
}

export interface Fees {
  deliveryFee: number;
  platformFee: number;
  lateNightFee: number;
  longDistanceFee: number;
  /** The delivery fee shown struck through next to "FREE" when nothing is charged. */
  baseDeliveryFee: number;
  /** The platform fee shown struck through next to "FREE". */
  baseHandlingFee: number;
  freeDeliveryThreshold: number;
  longDistanceApplies: boolean;
  distanceAmountApplies: boolean;
  foodDeliveryApplies: boolean;
  meatChargesApplies: boolean;
  lateNightApplies: boolean;
  settings: PricingSettings;
}

/** Minutes since midnight in India time. */
export function istMinutes(nowMs: number): number {
  const ist = new Date(nowMs + 330 * 60_000);
  return ist.getUTCHours() * 60 + ist.getUTCMinutes();
}

function parseHm(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h > 23 || min > 59 ? null : h * 60 + min;
}

const isAfter = (time: string, nowMs: number) => {
  const at = parseHm(time);
  return at !== null && istMinutes(nowMs) >= at;
};

const beyond = (distanceKm: number | null, km: number) =>
  distanceKm !== null && Number.isFinite(distanceKm) && distanceKm > km;

export function computeFees(input: FeeInput): Fees {
  const p = input.settings ?? DEFAULT_PRICING_SETTINGS;
  const nowMs = input.nowMs ?? Date.now();
  const itemsTotal = input.itemsTotal;

  const longDistance = p.longDistanceEnabled && beyond(input.distanceKm, p.longDistanceKm);
  const lateNight = p.lateNightEnabled && isAfter(p.lateNightAfterTime, nowMs);
  const belowThreshold = itemsTotal < p.freeDeliveryThreshold;
  const distanceAmount =
    p.distanceAmountEnabled && beyond(input.distanceKm, p.distanceAmountKm) && itemsTotal < p.distanceAmountMaxOrder;

  const hasFood = input.lines.some((l) => l.itemType === 'food');
  const meatLines = input.lines.filter((l) => l.itemType === 'meat');
  const meatValue = meatLines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const meatBelow = meatValue < p.meatValueThreshold;
  const meat = p.meatChargesEnabled && meatLines.length > 0;
  const food = p.foodDeliveryEnabled && hasFood && !meat;

  let delivery = false;
  let handling = false;
  let lateNightCharge = false;
  let longDistanceCharge = false;
  let deliveryAmount: number | null = null;
  let handlingAmount: number | null = null;
  let lateNightAmount: number | null = null;

  if (belowThreshold && !food && !meat) {
    delivery ||= p.amountApplyDeliveryFee;
    handling ||= p.amountApplyHandlingFee;
  }
  if (food) {
    delivery = true;
    deliveryAmount = itemsTotal < p.foodDeliveryThreshold ? p.foodDeliveryFeeBelow : p.foodDeliveryFeeAtOrAbove;
    if (p.foodDeliveryApplyHandlingFee) handling = true;
  }
  if (meat) {
    delivery = true;
    handling = true;
    deliveryAmount = meatBelow ? p.meatDeliveryFeeBelow : p.meatDeliveryFeeAtOrAbove;
    handlingAmount = meatBelow ? p.meatHandlingFeeBelow : p.meatHandlingFeeAtOrAbove;
  }
  // Live settings apply nothing extra for long distance (all its "apply" switches are off).
  if (lateNight) {
    lateNightCharge = true;
    if (meat) lateNightAmount = meatBelow ? p.meatLateNightFeeBelow : p.meatLateNightFeeAtOrAbove;
  }
  if (distanceAmount && !food && !meat) longDistanceCharge = true;

  return {
    deliveryFee: delivery ? (deliveryAmount ?? p.deliveryFeeAmount) : 0,
    platformFee: handling ? (handlingAmount ?? p.handlingFeeAmount) : 0,
    lateNightFee: lateNightCharge ? (lateNightAmount ?? p.lateNightFeeAmount) : 0,
    longDistanceFee: longDistanceCharge ? p.longDistanceFeeAmount : 0,
    baseDeliveryFee: deliveryAmount ?? p.deliveryFeeAmount,
    baseHandlingFee: p.handlingFeeAmount,
    freeDeliveryThreshold: p.freeDeliveryThreshold,
    longDistanceApplies: longDistance,
    distanceAmountApplies: distanceAmount,
    foodDeliveryApplies: food,
    meatChargesApplies: meat,
    lateNightApplies: lateNight,
    settings: p,
  };
}

/** Text of the Delivery Fee info popup. */
export function deliveryFeeInfo(fees: Fees): string {
  const p = fees.settings;
  if (fees.meatChargesApplies && fees.lateNightApplies) {
    const below = p.meatLateNightFeeBelow;
    const above = p.meatLateNightFeeAtOrAbove;
    const limit = p.meatValueThreshold;
    return below === above
      ? `A late-night delivery fee of ₹${below} applies to this order.`
      : `A late-night delivery fee of ₹${below} applies for orders below ₹${limit}. For orders of ₹${limit} or more, the late-night fee is ₹${above}.`;
  }
  if (fees.lateNightApplies) return `A late-night delivery fee of ₹${p.lateNightFeeAmount} applies after ${p.lateNightAfterTime}.`;
  if (fees.distanceAmountApplies) {
    return `An additional delivery charge applies for locations beyond ${p.distanceAmountKm} km when the cart value is below ₹${p.distanceAmountMaxOrder}.`;
  }
  if (fees.meatChargesApplies || fees.foodDeliveryApplies) return 'Delivery charges applied for restaurant food and meat orders.';
  if (fees.longDistanceApplies) return `A delivery charge of ₹${p.deliveryFeeAmount} applies for locations beyond ${p.longDistanceKm} km.`;
  if (fees.freeDeliveryThreshold > 0) {
    const t = fees.freeDeliveryThreshold;
    return `A delivery charge applies for orders below ₹${t}. Orders of ₹${t} or more qualify for free delivery.`;
  }
  return 'Delivery charges apply based on your location, order value, and delivery time.';
}

export const PLATFORM_FEE_INFO = 'These charges are for the proper packing and ensuring the safe and quick deliveries.';

export function lateNightFeeInfo(fees: Fees): string {
  return `Late-night fee of ₹${fees.lateNightFee} applies after ${fees.settings.lateNightAfterTime}.`;
}

export function longDistanceFeeInfo(fees: Fees): string {
  const p = fees.settings;
  return fees.distanceAmountApplies
    ? `Long-distance fee of ₹${fees.longDistanceFee} applies when distance is above ${p.distanceAmountKm} km and cart is below ₹${p.distanceAmountMaxOrder}.`
    : `Long-distance fee of ₹${fees.longDistanceFee} applies for locations beyond ${p.longDistanceKm} km.`;
}

export type FreeDeliveryNudge =
  | { kind: 'add-more'; amount: number; progressPercent: number }
  | { kind: 'unlocked' }
  | null;

/** The green "Add ₹N more for FREE delivery!" / "Yay! You've unlocked FREE delivery!" card above the bill. */
export function freeDeliveryNudge(fees: Fees, itemsTotal: number): FreeDeliveryNudge {
  if (itemsTotal <= 0) return null;
  if (fees.foodDeliveryApplies || fees.meatChargesApplies) return null;
  const p = fees.settings;
  const threshold = fees.freeDeliveryThreshold;
  const toThreshold = Math.max(0, threshold - itemsTotal);
  const toDistanceLimit = Math.max(0, p.distanceAmountMaxOrder - itemsTotal);
  const distanceNudge = fees.distanceAmountApplies && toDistanceLimit > 0;
  const thresholdNudge = threshold > 0 && toThreshold > 0 && !fees.longDistanceApplies && !fees.distanceAmountApplies;
  if (distanceNudge || thresholdNudge) {
    const amount = distanceNudge ? toDistanceLimit : toThreshold;
    const target = distanceNudge ? p.distanceAmountMaxOrder : threshold;
    return { kind: 'add-more', amount: Math.ceil(amount), progressPercent: Math.min(100, target > 0 ? (itemsTotal / target) * 100 : 0) };
  }
  if (threshold > 0 && toThreshold <= 0 && fees.deliveryFee === 0 && !fees.longDistanceApplies) return { kind: 'unlocked' };
  return null;
}
