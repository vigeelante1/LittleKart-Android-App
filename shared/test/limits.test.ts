import { describe, expect, it } from 'vitest';
import { canIncrement, maxQtyForVariant, unitsOfProduct } from '../src/limits';
import type { CartLine } from '../src/types';

const line = (productId: string, variantId: string, qty: number): CartLine => ({ productId, variantId, qty, addedAt: 0 });

describe('30 units per product per user (D-17)', () => {
  it('counts all variants of a product together', () => {
    const lines = [line('chicken', '1kg', 20), line('chicken', '500g', 10), line('eggs', '6pc', 4)];
    expect(unitsOfProduct(lines, 'chicken')).toBe(30);
    expect(canIncrement(lines, 'chicken', '1kg', 99)).toBe(false);
    expect(canIncrement(lines, 'chicken', '500g', 99)).toBe(false);
    expect(canIncrement(lines, 'eggs', '6pc', 99)).toBe(true);
  });

  it('allows up to 30 of a single variant', () => {
    expect(maxQtyForVariant([], 'p', 'v', 100)).toBe(30);
    expect(canIncrement([line('p', 'v', 29)], 'p', 'v', 100)).toBe(true);
    expect(canIncrement([line('p', 'v', 30)], 'p', 'v', 100)).toBe(false);
  });

  it('is capped by stock when stock is lower', () => {
    expect(maxQtyForVariant([], 'p', 'v', 12)).toBe(12);
    expect(canIncrement([line('p', 'v', 12)], 'p', 'v', 12)).toBe(false);
    expect(canIncrement([], 'p', 'v', 0)).toBe(false);
  });
});

describe('cart merge at login', () => {
  it('joins both carts and keeps the larger quantity of the same size', async () => {
    const { mergeCarts, sameCart } = await import('../src/limits');
    const local = [{ productId: 'a', variantId: 'a1', qty: 2, addedAt: 5 }];
    const server = [
      { productId: 'a', variantId: 'a1', qty: 3, addedAt: 1 },
      { productId: 'b', variantId: 'b1', qty: 1, addedAt: 2 },
    ];
    const merged = mergeCarts(local, server);
    expect(merged).toEqual([
      { productId: 'a', variantId: 'a1', qty: 3, addedAt: 5 },
      { productId: 'b', variantId: 'b1', qty: 1, addedAt: 2 },
    ]);
    expect(sameCart(merged, [...merged].reverse())).toBe(true);
    expect(sameCart(merged, local)).toBe(false);
  });
});
