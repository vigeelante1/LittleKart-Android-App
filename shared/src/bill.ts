// Bill calculation. Used by the app for display and by the API as the final authority (DECISIONS D-16).

export interface PricedLine {
  price: number;
  mrp?: number;
  qty: number;
  couponExempt: boolean;
}

/** Charged amounts (from `computeFees` in pricing.ts). */
export interface BillFees {
  deliveryFee: number;
  platformFee: number;
  lateNightFee?: number;
  longDistanceFee?: number;
}

export interface Bill {
  itemsTotal: number;
  mrpTotal: number;
  mrpSavings: number;
  deliveryFee: number;
  platformFee: number;
  lateNightFee: number;
  longDistanceFee: number;
  tip: number;
  couponDiscount: number;
  grandTotal: number;
}

export function computeBill(lines: readonly PricedLine[], fees: BillFees, tip = 0, couponDiscount = 0): Bill {
  const itemsTotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const mrpTotal = lines.reduce((sum, l) => sum + (l.mrp ?? l.price) * l.qty, 0);
  const hasItems = itemsTotal > 0;
  const charge = (amount: number | undefined) => (hasItems ? Math.max(0, amount ?? 0) : 0);
  const deliveryFee = charge(fees.deliveryFee);
  const platformFee = charge(fees.platformFee);
  const lateNightFee = charge(fees.lateNightFee);
  const longDistanceFee = charge(fees.longDistanceFee);
  const safeTip = charge(tip);
  const discount = Math.min(Math.max(0, couponDiscount), itemsTotal);
  const total = itemsTotal + deliveryFee + platformFee + lateNightFee + longDistanceFee + safeTip - discount;
  return {
    itemsTotal,
    mrpTotal,
    mrpSavings: mrpTotal - itemsTotal,
    deliveryFee,
    platformFee,
    lateNightFee,
    longDistanceFee,
    tip: safeTip,
    couponDiscount: discount,
    // The live cart never asks for less than ₹1 (and ₹0 when nothing can be billed).
    grandTotal: hasItems ? Math.max(total, 1) : 0,
  };
}
