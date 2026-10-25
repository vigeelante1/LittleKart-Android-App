// Price formatting and discount helpers. All amounts are whole rupees.

/** "₹45" */
export function formatRupee(amount: number): string {
  return `₹${Math.round(amount)}`;
}

/** Discount percent shown on cards: round((mrp - price) / mrp × 100). 0 when there is no MRP or no discount. */
export function discountPercent(price: number, mrp?: number): number {
  if (mrp === undefined || mrp <= 0 || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Rupees saved per unit ("₹20 OFF"). 0 when there is no discount. */
export function savingsAmount(price: number, mrp?: number): number {
  if (mrp === undefined || mrp <= price) return 0;
  return mrp - price;
}

/** "1 item" / "3 items" (the live app shows "1 items"; fixed per DECISIONS D-21). */
export function itemsLabel(count: number): string {
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}
