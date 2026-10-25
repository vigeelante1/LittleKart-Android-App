import { describe, expect, it } from 'vitest';
import { chipMinutes, DEFAULT_ETA_SETTINGS, distanceKm, headerMinutes } from '../src/eta';
import { discountPercent, formatRupee, itemsLabel, savingsAmount } from '../src/money';

describe('eta', () => {
  it('shows 15 MINS for products and 30 MINS for meat and food', () => {
    expect(chipMinutes(DEFAULT_ETA_SETTINGS, 'product')).toBe(15);
    expect(chipMinutes(DEFAULT_ETA_SETTINGS, 'meat')).toBe(30);
    expect(chipMinutes(DEFAULT_ETA_SETTINGS, 'food')).toBe(30);
  });

  it('gives 15–20 for groceries, from the distance in metres (live formula)', () => {
    expect(headerMinutes(DEFAULT_ETA_SETTINGS, 3, ['product'])).toBe(15); // 3000 mod 6 = 0
    expect(headerMinutes(DEFAULT_ETA_SETTINGS, 2.401, ['product'])).toBe(16); // 2401 mod 6 = 1
    expect(headerMinutes(DEFAULT_ETA_SETTINGS, 2.405, [])).toBe(20); // empty cart counts as groceries
  });

  it('gives "about 35" with meat at ~3 km and rounds up to 5', () => {
    expect(headerMinutes(DEFAULT_ETA_SETTINGS, 3, ['product', 'meat'])).toBe(35); // 9 + 25 = 34 → 35
    expect(headerMinutes(DEFAULT_ETA_SETTINGS, 0.2, ['meat'])).toBe(30); // 1 + 25 = 26 → 30
  });

  it('has no header time without a distance', () => {
    expect(headerMinutes(DEFAULT_ETA_SETTINGS, null, ['meat'])).toBe(null);
  });

  it('computes distance between two Nalgonda points', () => {
    const d = distanceKm(17.034491, 79.272718, 17.0557, 79.2745);
    expect(d).toBeGreaterThan(2.2);
    expect(d).toBeLessThan(2.5);
  });
});

describe('money', () => {
  it('formats rupees and discounts like the cards', () => {
    expect(formatRupee(45)).toBe('₹45');
    expect(discountPercent(45, 50)).toBe(10);
    expect(discountPercent(70, 80)).toBe(13);
    expect(discountPercent(120, 160)).toBe(25);
    expect(discountPercent(169)).toBe(0);
    expect(savingsAmount(89, 130)).toBe(41);
  });

  it('uses singular "item" for one', () => {
    expect(itemsLabel(1)).toBe('1 item');
    expect(itemsLabel(3)).toBe('3 items');
  });
});
