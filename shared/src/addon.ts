// "Forgot something?" (iteration 2, DECISIONS D-105): like Zepto and Blinkit, for 40 seconds after an order is
// placed the shopper can add more items to the same order, with no extra delivery or other fees. The original
// coupon discount stays as it was. Not for scheduled orders (D-103).
import type { Bill } from './bill';
import { MAX_UNITS_PER_PRODUCT } from './limits';
import { codAllowed, type Order, type OrderItem } from './orders';
import type { CartLine, Product } from './types';

export const ADD_ON_WINDOW_MS = 40_000;
/** Extra time the server allows for a slow network after the app's countdown ends. */
export const ADD_ON_GRACE_MS = 5_000;

type WindowOrder = Pick<Order, 'status' | 'placedAt' | 'scheduledFor'>;

/** Milliseconds left to add items (0 when the window is closed). */
export function addOnTimeLeft(order: WindowOrder, nowMs = Date.now()): number {
  if (order.scheduledFor || order.status !== 'pending' || order.placedAt === undefined) return 0;
  return Math.max(0, order.placedAt + ADD_ON_WINDOW_MS - nowMs);
}

/** Whole seconds left, for the countdown ("0:32"). */
export const addOnSecondsLeft = (order: WindowOrder, nowMs = Date.now()): number => Math.ceil(addOnTimeLeft(order, nowMs) / 1000);

/** "0:32" */
export const countdownLabel = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/** The server's check: the window, plus a few seconds of grace. */
export function canAddItems(order: WindowOrder, nowMs = Date.now(), graceMs = ADD_ON_GRACE_MS): boolean {
  if (order.scheduledFor || order.status !== 'pending' || order.placedAt === undefined) return false;
  return nowMs < order.placedAt + ADD_ON_WINDOW_MS + graceMs;
}

export interface AddOnQuote {
  items: OrderItem[];
  /** Rupees for the added items. */
  amount: number;
  /** Lines dropped: product, size or stock gone. */
  unavailable: CartLine[];
  /** Lines that would take a product over 30 units in this order. */
  overLimit: CartLine[];
}

/** Prices add-on lines with current products. The 30-unit limit counts what the order already holds. */
export function quoteAddOn(order: Pick<Order, 'items'>, lines: readonly CartLine[], products: readonly Product[]): AddOnQuote {
  const byId = new Map(products.map((p) => [p.id, p]));
  const units = new Map<string, number>();
  for (const i of order.items) units.set(i.productId, (units.get(i.productId) ?? 0) + i.qty);
  const items: OrderItem[] = [];
  const unavailable: CartLine[] = [];
  const overLimit: CartLine[] = [];
  for (const line of lines) {
    const product = byId.get(line.productId);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (!product || !variant || variant.stock < line.qty) {
      unavailable.push(line);
      continue;
    }
    const total = (units.get(product.id) ?? 0) + line.qty;
    if (total > MAX_UNITS_PER_PRODUCT) {
      overLimit.push(line);
      continue;
    }
    units.set(product.id, total);
    items.push({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      label: variant.label,
      imageUrl: variant.imageUrl ?? product.imageUrl,
      itemType: product.itemType,
      price: variant.price,
      ...(variant.mrp !== undefined ? { mrp: variant.mrp } : {}),
      qty: line.qty,
      addedLater: true,
    });
  }
  return { items, amount: items.reduce((s, i) => s + i.price * i.qty, 0), unavailable, overLimit };
}

/** The bill with added items: items total and grand total grow by their price; fees, tip and discount stay. */
export function billWithAddOn(bill: Bill, items: readonly OrderItem[]): Bill {
  const amount = items.reduce((s, i) => s + i.price * i.qty, 0);
  const mrp = items.reduce((s, i) => s + (i.mrp ?? i.price) * i.qty, 0);
  const itemsTotal = bill.itemsTotal + amount;
  const mrpTotal = bill.mrpTotal + mrp;
  return { ...bill, itemsTotal, mrpTotal, mrpSavings: mrpTotal - itemsTotal, grandTotal: bill.grandTotal + amount };
}

/** Cash on Delivery for an add-on follows the usual rule on the whole order: up to ₹1,000, no meat or food. */
export function addOnCodAllowed(order: Pick<Order, 'items' | 'bill'>, items: readonly OrderItem[]): boolean {
  const all = [...order.items, ...items];
  return codAllowed(billWithAddOn(order.bill, items).itemsTotal, all.map((i) => i.itemType));
}

/** The order once an add-on is confirmed. */
export function orderWithAddOn(order: Order, addOn: { id: string; createdAt: number; paymentType: Order['paymentType'] }, items: readonly OrderItem[]): Order {
  return {
    ...order,
    items: [...order.items, ...items],
    bill: billWithAddOn(order.bill, items),
    addOns: [...(order.addOns ?? []), { ...addOn, amount: items.reduce((s, i) => s + i.price * i.qty, 0) }],
  };
}

/** Rupees to pay at the door: the whole order when it is Cash on Delivery, plus add-ons paid that way. */
export function payAtDoor(order: Pick<Order, 'paymentType' | 'bill' | 'addOns'>): number {
  const addOns = order.addOns ?? [];
  if (order.paymentType === 'Cash on Delivery') {
    return order.bill.grandTotal - addOns.filter((a) => a.paymentType !== 'Cash on Delivery').reduce((s, a) => s + a.amount, 0);
  }
  return addOns.filter((a) => a.paymentType === 'Cash on Delivery').reduce((s, a) => s + a.amount, 0);
}
