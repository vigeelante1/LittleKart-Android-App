// Store opening hours, as the site works them out (India time; a closing time before the opening time runs
// past midnight). Our stores: 6:00 AM – 12:00 AM (DECISIONS D-23).
import type { Store } from './types';

/** "6:00 AM" → 360, "12:00 AM" → 0, "18:30" → 1110. Null when it can't be read. */
export function parseClock(value: string): number | null {
  const m = value.trim().match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*([AaPp][Mm])?$/);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = Number(m[2] ?? '0');
  const ampm = (m[4] ?? '').toUpperCase();
  if (minute > 59) return null;
  if (ampm) {
    if (hour < 1 || hour > 12) return null;
    hour = ampm === 'AM' ? (hour === 12 ? 0 : hour) : hour === 12 ? 12 : hour + 12;
  } else if (hour > 23) return null;
  return hour * 60 + minute;
}

/** Minutes since midnight in India. */
export function indiaMinutes(nowMs: number): number {
  const d = new Date(nowMs + 330 * 60_000);
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/** Open between the two times, both ends included (site rule). Unknown hours count as closed, as on the site. */
export function isStoreOpen(store: Pick<Store, 'openTime' | 'closeTime'>, nowMs = Date.now()): boolean {
  const open = parseClock(store.openTime);
  const close = parseClock(store.closeTime);
  if (open === null || close === null) return false;
  const now = indiaMinutes(nowMs);
  return close < open ? now >= open || now <= close : now >= open && now <= close;
}

/** "We'll be back at 6:00 AM" (ribbon) and the cart's snackbar text. */
export function storeClosedLines(store: Pick<Store, 'openTime'>): { backAt: string; snackbar: string } {
  const at = store.openTime.trim();
  return at
    ? { backAt: `We'll be back at ${at}`, snackbar: `Sorry, we're closed — We'll be back at ${at}` }
    : { backAt: "We'll be back soon.", snackbar: "Sorry, we're closed — We'll be back soon." };
}

/** "18:05" (India time), as in the "Store Closed" dialog's "Current store time". */
export function indiaClockLabel(nowMs: number): string {
  const m = indiaMinutes(nowMs);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
