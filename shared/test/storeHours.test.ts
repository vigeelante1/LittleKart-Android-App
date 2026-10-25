import { describe, expect, it } from 'vitest';
import { isStoreOpen, parseClock, storeClosedLines } from '../src/storeHours';

const store = { openTime: '6:00 AM', closeTime: '12:00 AM' };
const ist = (h: number, m = 0) => Date.UTC(2026, 9, 24, h, m) - 330 * 60_000;

describe('store hours', () => {
  it('reads clock times', () => {
    expect(parseClock('6:00 AM')).toBe(360);
    expect(parseClock('12:00 AM')).toBe(0);
    expect(parseClock('12:30 PM')).toBe(750);
    expect(parseClock('18:30')).toBe(1110);
    expect(parseClock('soon')).toBeNull();
  });
  it('is open from 6 AM to midnight and closed after midnight', () => {
    expect(isStoreOpen(store, ist(5, 59))).toBe(false);
    expect(isStoreOpen(store, ist(6, 0))).toBe(true);
    expect(isStoreOpen(store, ist(23, 59))).toBe(true);
    expect(isStoreOpen(store, ist(0, 0))).toBe(true);
    expect(isStoreOpen(store, ist(0, 1))).toBe(false);
  });
  it('says when it opens again', () => {
    expect(storeClosedLines(store).snackbar).toBe("Sorry, we're closed — We'll be back at 6:00 AM");
  });
});
