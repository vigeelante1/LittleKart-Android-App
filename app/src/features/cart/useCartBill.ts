import { computeBill, computeFees, type Bill, type Fees, type PricedLine } from '@littlekart/shared';
import { useMemo } from 'react';
import type { ResolvedLine } from '@/hooks/useCartProducts';
import { useConfig } from '@/hooks/useConfig';
import { useNearestStore } from '@/hooks/useNearestStore';

export interface CartBill {
  outOfStockCount: number;
  allUnavailable: boolean;
  fees: Fees;
  bill: Bill;
}

/** Lines that can be billed: out-of-stock lines are left out of the bill, as on the site. */
export function billableLines(items: readonly ResolvedLine[]): ResolvedLine[] {
  return items.filter((i) => i.variant.stock > 0);
}

export function toPricedLines(items: readonly ResolvedLine[]): PricedLine[] {
  return billableLines(items).map(({ line, product, variant }) => ({
    price: variant.price,
    mrp: variant.mrp,
    qty: line.qty,
    couponExempt: product.couponExempt,
  }));
}

/** Bill for the cart screen: live fee rules (shared/pricing.ts), tip and coupon discount. */
export function useCartBill(items: readonly ResolvedLine[], tip: number, couponDiscount: number): CartBill {
  const config = useConfig();
  const { nearest } = useNearestStore();
  const distanceKm = nearest?.distanceKm ?? null;

  return useMemo(() => {
    const billable = billableLines(items);
    const priced = toPricedLines(items);
    const itemsTotal = priced.reduce((sum, l) => sum + l.price * l.qty, 0);
    const fees = computeFees({
      itemsTotal,
      lines: billable.map(({ line, product, variant }) => ({ price: variant.price, qty: line.qty, itemType: product.itemType })),
      distanceKm,
      settings: config.pricing,
    });
    return {
      outOfStockCount: items.length - billable.length,
      allUnavailable: items.length > 0 && billable.length === 0,
      fees,
      bill: computeBill(priced, fees, tip, couponDiscount),
    };
  }, [items, tip, couponDiscount, distanceKm, config.pricing]);
}
