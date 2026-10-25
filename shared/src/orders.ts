// Orders and payment rules, as on littlekart.com (payment page and tracking, read 24 Oct 2026).
import { computeBill, type Bill, type PricedLine } from './bill';
import { validateCoupon, type CouponCheck } from './coupons';
import { computeFees, type PricingSettings } from './pricing';
import type { CartLine, Coupon, Id, ItemType, Product } from './types';

export type PaymentType = 'UPI' | 'Cash on Delivery';

/**
 * As the live server names them. pending_payment: waiting for the online payment. pending → accepted → assigned
 * → nearby → delivered: the delivery steps (the store accepts, a partner is assigned, ...).
 * payment_failed: the online payment did not go through. cancelled: cancelled by support.
 */
export type OrderStatus =
  | 'pending_payment'
  | 'pending'
  | 'accepted'
  | 'assigned'
  | 'nearby'
  | 'delivered'
  | 'payment_failed'
  | 'cancelled';

export interface OrderItem {
  productId: Id;
  variantId: Id;
  /** Name, size and prices are copied when the order is placed, so later price changes don't alter it. */
  name: string;
  label: string;
  imageUrl: string;
  itemType: ItemType;
  price: number;
  mrp?: number;
  qty: number;
}

export interface OrderAddress {
  name: string;
  phone: string;
  text: string;
  lat: number;
  lng: number;
}

export interface Order {
  id: Id;
  /** Epoch ms. */
  createdAt: number;
  status: OrderStatus;
  paymentType: PaymentType;
  items: OrderItem[];
  bill: Bill;
  couponCode?: string;
  address: OrderAddress;
  storeId: Id;
  /** 4 digits the customer tells the delivery partner. */
  deliveryOtp: string;
  /** "Arriving in N minutes" at the time of ordering. */
  etaMinutes: number;
}

/** Customer support number when the settings don't give one (placeholder, DECISIONS D-71). */
export const SUPPORT_PHONE_FALLBACK = '9999999999';

/** Cash on Delivery: only for orders below ₹1000 with regular products (no meat or restaurant food). */
export const COD_MAX_TOTAL = 1000;
const COD_RESTRICTED: readonly ItemType[] = ['meat', 'food'];

export function codRestrictedItems(itemTypes: readonly ItemType[]): boolean {
  return itemTypes.some((t) => COD_RESTRICTED.includes(t));
}

export function codAllowed(itemsTotal: number, itemTypes: readonly ItemType[]): boolean {
  return !codRestrictedItems(itemTypes) && itemsTotal < COD_MAX_TOTAL;
}

/** The blue note on the payment page when Cash on Delivery can't be used. */
export function codUnavailableMessage(restricted: boolean, maxTotal = COD_MAX_TOTAL): string {
  return restricted
    ? 'Cash on Delivery is available only for regular products and print items. Please pay securely using UPI or card to complete your order.'
    : `Cash on Delivery is available only for orders below ₹${maxTotal}. As your item total is ₹${maxTotal} or more, please pay securely using UPI or card to complete your order.`;
}

/** "Delivery status" steps on the tracking page (numbered 1-5). */
export const DELIVERY_STEPS: readonly { id: number; label: string }[] = [
  { id: 1, label: 'Pending' },
  { id: 2, label: 'Accepted' },
  { id: 3, label: 'Assigned' },
  { id: 4, label: 'Nearby' },
  { id: 5, label: 'Delivered' },
];

/** The current step number (1-5), as the site works it out from the status. */
export function stepNumber(status: OrderStatus): number {
  switch (status) {
    case 'delivered':
      return 5;
    case 'nearby':
      return 4;
    case 'assigned':
      return 3;
    case 'accepted':
      return 2;
    default:
      return 1;
  }
}

/** The status text used on tracking, My Orders and order details. */
export function statusLabel(status: OrderStatus): string {
  switch (status) {
    case 'pending_payment':
    case 'pending':
      return 'Pending';
    case 'accepted':
      return 'Accepted';
    case 'assigned':
      return 'Delivery partner assigned';
    case 'nearby':
      return 'Delivery partner nearby';
    case 'delivered':
      return 'Delivered';
    case 'payment_failed':
      return 'Payment Failed';
    case 'cancelled':
      return 'Cancelled';
  }
}

export const isFailedOrder = (status: OrderStatus) => status === 'payment_failed' || status === 'cancelled';
export const isPendingOrder = (status: OrderStatus) => status === 'pending' || status === 'pending_payment';

/** The customer may ask to cancel only before the store accepts; otherwise the site explains why not. */
export const canCancel = (status: OrderStatus) => status === 'pending';
export function cannotCancelReason(status: OrderStatus): string {
  switch (stepNumber(status)) {
    case 1:
      return '';
    case 2:
      return 'Cannot cancel the order. It has been accepted by the store.';
    case 3:
      return 'Cannot cancel the order. A delivery partner has been assigned.';
    case 4:
      return 'Cannot cancel the order. Your delivery partner is nearby.';
    default:
      return 'Cannot cancel the order. It has already been delivered.';
  }
}

/** What the order details page says under Cancellation. */
export function stageMessage(status: OrderStatus): string {
  return [
    'Waiting for the store to accept your order.',
    'Store has accepted your order and is preparing it.',
    'A delivery partner has been assigned to your order.',
    'Your delivery partner is nearby.',
    'Your order has been delivered.',
  ][stepNumber(status) - 1]!;
}

/** The tracking page and the floating tracking card stop 45 minutes after the order was placed. */
export const TRACKING_WINDOW_MS = 45 * 60 * 1000;
export function isTrackable(order: Pick<Order, 'status' | 'createdAt'>, nowMs = Date.now()): boolean {
  return !isFailedOrder(order.status) && order.status !== 'delivered' && order.status !== 'pending_payment' &&
    nowMs - order.createdAt < TRACKING_WINDOW_MS;
}

/** "Arriving in 12 minutes" (minutes left from the time of ordering, at least 1). */
export function minutesLeft(order: Pick<Order, 'createdAt' | 'etaMinutes'>, nowMs = Date.now()): number {
  return Math.max(1, Math.ceil(order.etaMinutes - Math.max(0, (nowMs - order.createdAt) / 60_000)));
}
export const arrivingIn = (minutes: number) => `Arriving in ${minutes} minute${minutes === 1 ? '' : 's'}`;

/** "Arriving in N minutes", or "Arriving shortly" once the estimate has passed (iteration 2; the site keeps "1 minute"). */
export function arrivalLabel(order: Pick<Order, 'createdAt' | 'etaMinutes'>, nowMs = Date.now()): string {
  const elapsed = (nowMs - order.createdAt) / 60_000;
  return elapsed >= order.etaMinutes ? 'Arriving shortly' : arrivingIn(minutesLeft(order, nowMs));
}

/** Random 4-digit delivery code. */
export function makeDeliveryOtp(random: () => number = Math.random): string {
  return String(Math.floor(random() * 10000)).padStart(4, '0');
}

/** Short order number shown to customers, e.g. "LK7F3K2Q". */
export function makeOrderId(random: () => number = Math.random): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'LK';
  for (let i = 0; i < 8; i += 1) id += chars[Math.floor(random() * chars.length)];
  return id;
}

/** "24 Oct at 1:05 AM" (India time), as on the payment page. */
export function formatOrderDate(epochMs: number): string {
  const d = new Date(epochMs + 330 * 60_000);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const h = d.getUTCHours();
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} at ${hour12}:${min} ${h < 12 ? 'AM' : 'PM'}`;
}

/** "01:05 AM" (India time), as toLocaleTimeString with 2-digit hours shows it. */
export function formatOrderTime(epochMs: number): string {
  const t = formatOrderDate(epochMs).split(' at ')[1] ?? '';
  return t.length === 7 ? `0${t}` : t;
}

/** "24/10/2026, 1:05:09 am" (en-IN toLocaleString, India time), the order details "Placed on". */
export function formatPlacedOn(epochMs: number): string {
  const d = new Date(epochMs + 330 * 60_000);
  const p = (n: number) => String(n).padStart(2, '0');
  const h = d.getUTCHours();
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${d.getUTCDate()}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}, ${hour12}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} ${h < 12 ? 'am' : 'pm'}`;
}

// ---------- Pricing an order (the server's final check, D-16) ----------


export interface OrderQuote {
  items: OrderItem[];
  bill: Bill;
  /** Lines dropped because the product, size or stock is gone. */
  unavailable: CartLine[];
  coupon: CouponCheck | null;
}

/** Prices cart lines with current products, fees, tip and coupon. Out-of-stock or over-stock lines are reported. */
export function quoteOrder(input: {
  lines: readonly CartLine[];
  products: readonly Product[];
  distanceKm: number | null;
  tip: number;
  couponCode?: string;
  coupons: readonly Coupon[];
  settings: PricingSettings;
  nowMs?: number;
}): OrderQuote {
  const byId = new Map(input.products.map((p) => [p.id, p]));
  const items: OrderItem[] = [];
  const unavailable: CartLine[] = [];
  const priced: PricedLine[] = [];
  for (const line of input.lines) {
    const product = byId.get(line.productId);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (!product || !variant || variant.stock < line.qty) {
      unavailable.push(line);
      continue;
    }
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
    });
    priced.push({ price: variant.price, mrp: variant.mrp, qty: line.qty, couponExempt: product.couponExempt });
  }
  const itemsTotal = priced.reduce((s, l) => s + l.price * l.qty, 0);
  const fees = computeFees({
    itemsTotal,
    lines: items.map((i) => ({ price: i.price, qty: i.qty, itemType: i.itemType })),
    distanceKm: input.distanceKm,
    nowMs: input.nowMs,
    settings: input.settings,
  });
  const coupon = input.couponCode ? validateCoupon(input.couponCode, input.coupons, priced) : null;
  const discount = coupon?.valid ? coupon.discount : 0;
  return { items, bill: computeBill(priced, fees, Math.max(0, Math.floor(input.tip)), discount), unavailable, coupon };
}
