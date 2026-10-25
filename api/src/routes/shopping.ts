// Signed-in customer data and coupons.
//   GET    /addresses              → Address[]
//   POST   /addresses              Address fields  → Address   (409 duplicate_label)
//   PUT    /addresses/:id          Address fields  → Address   (404, 409)
//   DELETE /addresses/:id          → 204
//   GET    /cart                   → { lines }
//   PUT    /cart                   { lines }       → { lines } (unknown items dropped, quantities capped)
//   GET    /coupons                → Coupon[]
//   POST   /coupons/validate       { code, lines } → { valid, discount } | { valid: false, reason, message }
import {
  DUPLICATE_LABEL_MESSAGE,
  MAX_UNITS_PER_PRODUCT,
  maxQtyForVariant,
  normalizeAddressPhone,
  validateAddressForm,
  validateCoupon,
  type CartLine,
  type PricedLine,
  type Product,
} from '@littlekart/shared';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { DataLayer } from '../data/types.js';
import { requireUser } from './session.js';

const addressBody = z.object({
  label: z.string().trim().min(1).max(40),
  text: z.string().trim().min(1).max(500),
  houseNo: z.string().trim().min(1).max(200),
  landmark: z.string().trim().max(200).optional(),
  name: z.string().trim().min(1).max(80),
  phone: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const lineSchema = z.object({
  productId: z.string().min(1).max(100),
  variantId: z.string().min(1).max(100),
  qty: z.number().int().min(1).max(MAX_UNITS_PER_PRODUCT),
  addedAt: z.number().int().nonnegative(),
});
const cartBody = z.object({ lines: z.array(lineSchema).max(100) });
const validateBody = z.object({ code: z.string().max(40), lines: z.array(lineSchema).max(100) });

/** Keeps only lines whose product and size exist, with quantities within stock and the 30-unit limit. */
function cleanLines(lines: readonly CartLine[], products: readonly Product[]): CartLine[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const kept: CartLine[] = [];
  for (const line of lines) {
    const variant = byId.get(line.productId)?.variants.find((v) => v.id === line.variantId);
    if (!variant || kept.some((k) => k.variantId === line.variantId)) continue;
    const max = maxQtyForVariant(kept, line.productId, line.variantId, variant.stock, MAX_UNITS_PER_PRODUCT);
    const qty = Math.min(line.qty, max);
    if (qty > 0) kept.push({ ...line, qty });
  }
  return kept;
}

/** Prices the lines with the server's own prices (D-16). */
function priceLines(lines: readonly CartLine[], products: readonly Product[]): PricedLine[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  return lines.flatMap((l) => {
    const product = byId.get(l.productId);
    const variant = product?.variants.find((v) => v.id === l.variantId);
    if (!product || !variant || variant.stock <= 0) return [];
    return [{ price: variant.price, mrp: variant.mrp, qty: l.qty, couponExempt: product.couponExempt }];
  });
}

export async function shoppingRoutes(app: FastifyInstance, { data }: { data: DataLayer }) {
  const { accounts, addresses, carts, catalog, meta } = data;

  app.get('/addresses', async (request, reply) => {
    const user = await requireUser(request, reply, accounts);
    if (!user) return;
    return addresses.list(user.id);
  });

  const parseAddress = (body: unknown) => {
    const parsed = addressBody.safeParse(body);
    if (!parsed.success) return null;
    const a = { ...parsed.data, phone: normalizeAddressPhone(parsed.data.phone), landmark: parsed.data.landmark || undefined };
    const errors = validateAddressForm({ ...a, landmark: a.landmark ?? '' });
    return Object.keys(errors).length ? null : a;
  };

  app.post('/addresses', async (request, reply) => {
    const user = await requireUser(request, reply, accounts);
    if (!user) return;
    const a = parseAddress(request.body);
    if (!a) return reply.code(400).send({ error: 'invalid_address' });
    const saved = await addresses.create(user.id, a);
    if (saved === 'duplicate') return reply.code(409).send({ error: 'duplicate_label', message: DUPLICATE_LABEL_MESSAGE });
    return reply.code(201).send(saved);
  });

  app.put<{ Params: { id: string } }>('/addresses/:id', async (request, reply) => {
    const user = await requireUser(request, reply, accounts);
    if (!user) return;
    const a = parseAddress(request.body);
    if (!a) return reply.code(400).send({ error: 'invalid_address' });
    const saved = await addresses.update(user.id, request.params.id, a);
    if (saved === 'missing') return reply.code(404).send({ error: 'not_found' });
    if (saved === 'duplicate') return reply.code(409).send({ error: 'duplicate_label', message: DUPLICATE_LABEL_MESSAGE });
    return saved;
  });

  app.delete<{ Params: { id: string } }>('/addresses/:id', async (request, reply) => {
    const user = await requireUser(request, reply, accounts);
    if (!user) return;
    const removed = await addresses.remove(user.id, request.params.id);
    return removed ? reply.code(204).send() : reply.code(404).send({ error: 'not_found' });
  });

  app.get('/cart', async (request, reply) => {
    const user = await requireUser(request, reply, accounts);
    if (!user) return;
    return { lines: await carts.get(user.id) };
  });

  app.put('/cart', async (request, reply) => {
    const user = await requireUser(request, reply, accounts);
    if (!user) return;
    const parsed = cartBody.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_cart' });
    const products = await catalog.byIds([...new Set(parsed.data.lines.map((l) => l.productId))]);
    return { lines: await carts.replace(user.id, cleanLines(parsed.data.lines, products)) };
  });

  app.get('/coupons', async () => meta.coupons());

  app.post('/coupons/validate', async (request, reply) => {
    const parsed = validateBody.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: 'invalid_request' });
    const products = await catalog.byIds([...new Set(parsed.data.lines.map((l) => l.productId))]);
    const result = validateCoupon(parsed.data.code, await meta.coupons(), priceLines(parsed.data.lines, products));
    return result.valid
      ? { valid: true, code: result.coupon.code, title: result.coupon.title, discount: result.discount }
      : { valid: false, reason: result.reason, message: result.message };
  });
}
