// Checks the assistant's answer against the real catalog (D-102): unknown products, sold-out sizes and odd
// quantities never reach the chat.
import { MAX_UNITS_PER_PRODUCT } from '../limits';
import type { Id, Product } from '../types';
import { aiProducts } from './catalog';
import type { AiItem } from './types';

/** Most packs of one product the assistant may suggest at once. */
export const MAX_AI_QTY = 10;

interface RawItem {
  productId?: unknown;
  variantId?: unknown;
  qty?: unknown;
  note?: unknown;
}

/**
 * Keeps the items that name a real, in-stock product and size; quantity rounded into 1..MAX_AI_QTY (and stock).
 * A wrong size id falls back to the product's first in-stock size. Duplicates and `skip` products are dropped.
 */
export function cleanItems(raw: unknown, products: readonly Product[], skip: ReadonlySet<Id> = new Set()): AiItem[] {
  if (!Array.isArray(raw)) return [];
  const byId = new Map(aiProducts(products).map((p) => [p.id, p]));
  const seen = new Set<Id>(skip);
  const out: AiItem[] = [];
  for (const r of raw as RawItem[]) {
    if (!r || typeof r !== 'object' || typeof r.productId !== 'string') continue;
    const p = byId.get(r.productId);
    if (!p || seen.has(p.id)) continue;
    const inStock = p.variants.filter((v) => v.stock > 0);
    const v = inStock.find((x) => x.id === r.variantId) ?? inStock[0];
    if (!v) continue;
    const n = typeof r.qty === 'number' && Number.isFinite(r.qty) ? Math.round(r.qty) : 1;
    const qty = Math.max(1, Math.min(n, MAX_AI_QTY, v.stock, MAX_UNITS_PER_PRODUCT));
    const note = typeof r.note === 'string' && r.note.trim() ? r.note.trim().slice(0, 60) : undefined;
    seen.add(p.id);
    out.push({ productId: p.id, variantId: v.id, qty, ...(note ? { note } : {}) });
  }
  return out;
}

export const cleanStrings = (raw: unknown, max = 8): string[] =>
  Array.isArray(raw)
    ? [...new Set(raw.filter((s): s is string => typeof s === 'string').map((s) => s.trim()).filter(Boolean))].slice(0, max)
    : [];

/**
 * Drops "not sold here" entries the shop does sell (the model sometimes misses "Allam | Ginger"), so the
 * chat never claims a product is missing when it isn't.
 */
export function notInCatalog(names: readonly string[], products: readonly Product[]): string[] {
  const parts = aiProducts(products).flatMap((p) => p.name.toLowerCase().split(/[|()]/).map((s) => s.replace(/\s+/g, ' ').trim()));
  const word = (hay: string, needle: string) =>
    /^[\x20-\x7e]+$/.test(needle) ? new RegExp(`(^|[^a-z])${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?([^a-z]|$)`).test(hay) : hay.includes(needle);
  return names.filter((n) => {
    const e = n.toLowerCase().trim();
    return !parts.some((part) => part.length >= 3 && (word(part, e) || (part.length >= 4 && word(e, part))));
  });
}
