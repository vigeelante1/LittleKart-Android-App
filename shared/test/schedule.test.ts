import { describe, expect, it } from 'vitest';
import { arrivalLabel, isTrackable, type Order } from '../src/orders';
import { deliverySlots, isBookableSlot, scheduleSlots, slotLabel, slotTimes } from '../src/schedule';

const ist = (iso: string) => new Date(`${iso}+05:30`).getTime();
const store = { openTime: '6:00 AM', closeTime: '12:00 AM' };

describe('schedule for later (D-103)', () => {
  it('offers one-hour slots from 6 AM to midnight while the store is closed', () => {
    const now = ist('2026-10-31T01:30:00');
    const slots = scheduleSlots(store, now);
    expect(slots).toHaveLength(18);
    expect(slotLabel(slots[0]!, now)).toBe('Today, 6:00 AM - 7:00 AM');
    expect(slotTimes(slots[2]!)).toBe('8:00 AM - 9:00 AM');
    expect(slotTimes(slots[17]!)).toBe('11:00 PM - 12:00 AM');
  });

  it('offers nothing while the store is open (orders go out now)', () => {
    expect(scheduleSlots(store, ist('2026-10-31T12:30:00'))).toEqual([]);
    expect(scheduleSlots(store, ist('2026-10-31T00:00:00'))).toEqual([]); // midnight itself is still open (site rule)
    expect(scheduleSlots(store, ist('2026-10-31T00:01:00'))).toHaveLength(18);
  });

  it('a chosen slot stays bookable after opening until it ends', () => {
    const eight = ist('2026-10-31T08:00:00');
    expect(isBookableSlot(store, eight, ist('2026-10-31T03:00:00'))).toEqual({ start: eight, end: ist('2026-10-31T09:00:00') });
    expect(isBookableSlot(store, eight, ist('2026-10-31T08:40:00'))).not.toBeNull();
    expect(isBookableSlot(store, eight, ist('2026-10-31T09:00:00'))).toBeNull();
    expect(isBookableSlot(store, eight + 60_000, ist('2026-10-31T03:00:00'))).toBeNull();
  });

  it('a store that closes in the evening books tomorrow', () => {
    const now = ist('2026-10-31T22:00:00');
    const slots = scheduleSlots({ openTime: '9:00 AM', closeTime: '9:00 PM' }, now);
    expect(slots).toHaveLength(12);
    expect(slotLabel(slots[0]!, now)).toBe('Tomorrow, 9:00 AM - 10:00 AM');
    expect(deliverySlots({ openTime: '', closeTime: '' }, now)).toEqual([]);
  });

  it('tracks a scheduled order until 45 minutes after its slot, with slot wording', () => {
    const order: Pick<Order, 'status' | 'createdAt' | 'etaMinutes' | 'scheduledFor'> = {
      status: 'pending',
      createdAt: ist('2026-10-31T01:30:00'),
      etaMinutes: 20,
      scheduledFor: { start: ist('2026-10-31T08:00:00'), end: ist('2026-10-31T09:00:00') },
    };
    expect(arrivalLabel(order, ist('2026-10-31T01:31:00'))).toBe('Arriving today, 8:00 AM - 9:00 AM');
    expect(arrivalLabel(order, ist('2026-10-30T23:59:00'))).toBe('Arriving tomorrow, 8:00 AM - 9:00 AM');
    expect(arrivalLabel(order, ist('2026-10-31T08:10:00'))).toBe('Arriving by 9:00 AM');
    expect(arrivalLabel(order, ist('2026-10-31T09:05:00'))).toBe('Arriving shortly');
    expect(isTrackable(order, ist('2026-10-31T05:00:00'))).toBe(true);
    expect(isTrackable(order, ist('2026-10-31T09:44:00'))).toBe(true);
    expect(isTrackable(order, ist('2026-10-31T09:46:00'))).toBe(false);
  });
});
