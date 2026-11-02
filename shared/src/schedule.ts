// Schedule for later (iteration 2, DECISIONS D-103): while the store is closed (12:00 AM – 6:00 AM), an order
// can be placed for a one-hour delivery slot in the next opening hours, like Swiggy Instamart.
// Slot times follow the site's own slot style ("8:00 AM - 9:00 AM", "Today" / "Tomorrow").
import { indiaMinutes, isStoreOpen, parseClock } from './storeHours';
import type { Store } from './types';

export const SLOT_MINUTES = 60;
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const IST_OFFSET = 330 * MINUTE;

export interface DeliverySlot {
  /** Epoch ms of the slot's start and end. */
  start: number;
  end: number;
}

/** Epoch ms of midnight (India time) of the day `nowMs` falls on. */
export function indiaMidnight(nowMs: number): number {
  return Math.floor((nowMs + IST_OFFSET) / DAY) * DAY - IST_OFFSET;
}

/**
 * The opening hours a slot can be booked in: the hours the store is open in now, or the next ones when it
 * is closed. A closing time before the opening time runs past midnight ("12:00 AM" = the end of the day).
 */
export function bookingPeriod(store: Pick<Store, 'openTime' | 'closeTime'>, nowMs: number): DeliverySlot | null {
  const open = parseClock(store.openTime);
  const close = parseClock(store.closeTime);
  if (open === null || close === null || open === close) return null;
  const today = indiaMidnight(nowMs);
  for (const day of [today - DAY, today, today + DAY]) {
    const start = day + open * MINUTE;
    const end = close > open ? day + close * MINUTE : day + DAY + close * MINUTE;
    if (end > nowMs) return { start, end };
  }
  return null;
}

/** One-hour slots in the booking period that haven't ended yet (first slot starts at opening time). */
export function deliverySlots(store: Pick<Store, 'openTime' | 'closeTime'>, nowMs = Date.now()): DeliverySlot[] {
  const period = bookingPeriod(store, nowMs);
  if (!period) return [];
  const slots: DeliverySlot[] = [];
  for (let start = period.start; start + SLOT_MINUTES * MINUTE <= period.end; start += SLOT_MINUTES * MINUTE) {
    const end = start + SLOT_MINUTES * MINUTE;
    if (end > nowMs) slots.push({ start, end });
  }
  return slots;
}

/** Slots are offered while the store is closed; an empty list means ordering works as before. */
export function scheduleSlots(store: Pick<Store, 'openTime' | 'closeTime'>, nowMs = Date.now()): DeliverySlot[] {
  return isStoreOpen(store, nowMs) ? [] : deliverySlots(store, nowMs);
}

/** True when an order may be placed for the slot starting at `start` (checked again by the server). */
export function isBookableSlot(store: Pick<Store, 'openTime' | 'closeTime'>, start: number, nowMs = Date.now()): DeliverySlot | null {
  return deliverySlots(store, nowMs).find((s) => s.start === start) ?? null;
}

/** "8:00 AM" (India time). */
export function slotClock(epochMs: number): string {
  const m = indiaMinutes(epochMs);
  const h = Math.floor(m / 60);
  return `${h % 12 || 12}:${String(m % 60).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

/** "Today", "Tomorrow" or "Sat, 31 Oct" for the day a time falls on, seen from `nowMs`. */
export function slotDay(epochMs: number, nowMs = Date.now()): string {
  const days = Math.round((indiaMidnight(epochMs) - indiaMidnight(nowMs)) / DAY);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  const d = new Date(epochMs + IST_OFFSET);
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];
  const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()];
  return `${wd}, ${d.getUTCDate()} ${mo}`;
}

/** "8:00 AM - 9:00 AM" */
export const slotTimes = (slot: DeliverySlot): string => `${slotClock(slot.start)} - ${slotClock(slot.end)}`;

/** "Today, 8:00 AM - 9:00 AM" */
export const slotLabel = (slot: DeliverySlot, nowMs = Date.now()): string => `${slotDay(slot.start, nowMs)}, ${slotTimes(slot)}`;

export type SlotCheck = { ok: true; slot?: DeliverySlot } | { ok: false; reason: 'store_closed' | 'slot_unavailable' };

export const SLOT_UNAVAILABLE_MESSAGE = 'That delivery slot is no longer available. Please choose another slot.';

/**
 * The server's (and sample mode's) check when an order is placed: without a slot the store must be open; with a
 * slot, the slot must still be bookable (it may have been picked just before opening time).
 */
export function checkOrderSlot(store: Pick<Store, 'openTime' | 'closeTime'>, slotStart: number | undefined, nowMs = Date.now()): SlotCheck {
  if (slotStart === undefined) return isStoreOpen(store, nowMs) ? { ok: true } : { ok: false, reason: 'store_closed' };
  const slot = isBookableSlot(store, slotStart, nowMs);
  return slot ? { ok: true, slot } : { ok: false, reason: 'slot_unavailable' };
}
