// The same checks run on the in-memory data layer and, when TEST_DATABASE_URL is set, on PostgreSQL.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { memoryData } from '../src/data/memory.js';
import { pgData } from '../src/data/pg.js';
import type { DataLayer } from '../src/data/types.js';
import { connect } from '../src/db/client.js';
import { migrate } from '../src/db/migrate.js';
import { seed } from '../src/db/seed.js';

const PG_URL = process.env.TEST_DATABASE_URL;

async function freshPg(): Promise<DataLayer> {
  if (!PG_URL) throw new Error('TEST_DATABASE_URL missing');
  const sql = connect(PG_URL);
  await sql.unsafe('drop schema public cascade; create schema public;');
  await migrate(sql);
  await seed(sql);
  await seed(sql); // running the seed twice must be harmless
  return pgData(sql);
}

const layers: [string, () => Promise<DataLayer>][] = [['memory', async () => memoryData()]];
if (PG_URL) layers.push(['postgres', freshPg]);

describe.each(layers)('%s data layer', (_name, make) => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let token = '';
  const auth = () => ({ authorization: `Bearer ${token}` });

  beforeAll(async () => {
    app = await buildApp({ data: await make(), auth: { reviewPhones: new Set(['*']), reviewOtp: '1234' } });
    await app.inject({ method: 'POST', url: '/auth/otp/send', payload: { phone: '9718141441', purpose: 'signup' } });
    const verify = await app.inject({
      method: 'POST',
      url: '/auth/otp/verify',
      payload: { phone: '9718141441', otp: '1234', purpose: 'signup', name: 'SV' },
    });
    token = (verify.json() as { token: string }).token;
  });
  afterAll(async () => {
    await app.close();
  });

  it('serves the catalog the same way as the sample data', async () => {
    const reference = await buildApp();
    for (const url of [
      '/home',
      '/tiles/fresh-meat-fish/subcategories',
      '/tiles/dairy-bread-eggs/subcategories',
      '/subcategories/chicken/products',
      '/subcategories/dairy-bread-eggs/products?q=curd',
      '/products?ids=amul-butter,chicken-boneless,nope',
      '/recommendations?cart=amul-butter',
      '/search?q=chicken',
      '/config',
      '/coupons',
      '/stores/nearest?lat=17.0557&lng=79.2745',
    ]) {
      const ours = (await app.inject({ method: 'GET', url })).json();
      const expected = (await reference.inject({ method: 'GET', url })).json();
      expect(ours, url).toEqual(expected);
    }
    await reference.close();
  });

  it('keeps the account and session', async () => {
    const me = await app.inject({ method: 'GET', url: '/me', headers: auth() });
    expect(me.json()).toMatchObject({ name: 'SV', phone: '9718141441' });
    expect((await app.inject({ method: 'GET', url: '/customers/9718141441' })).json()).toEqual({ exists: true, name: 'SV' });
    expect((await app.inject({ method: 'GET', url: '/me', headers: { authorization: 'Bearer nope' } })).statusCode).toBe(401);
  });

  it('saves, edits and deletes addresses, one per label', async () => {
    const base = { label: 'Home', text: 'Bus stand, Nalgonda', houseNo: '12-3', name: 'SV', phone: '+91 97181 41441', lat: 17.0557, lng: 79.2745 };
    expect((await app.inject({ method: 'GET', url: '/addresses' })).statusCode).toBe(401);
    const created = await app.inject({ method: 'POST', url: '/addresses', headers: auth(), payload: base });
    expect(created.statusCode).toBe(201);
    const saved = created.json() as { id: string; phone: string };
    expect(saved.phone).toBe('9718141441');

    const dup = await app.inject({ method: 'POST', url: '/addresses', headers: auth(), payload: { ...base, label: ' home ' } });
    expect(dup.statusCode).toBe(409);
    expect(dup.json()).toMatchObject({ error: 'duplicate_label' });

    const bad = await app.inject({ method: 'POST', url: '/addresses', headers: auth(), payload: { ...base, label: 'Work', phone: '123' } });
    expect(bad.statusCode).toBe(400);

    const work = await app.inject({ method: 'POST', url: '/addresses', headers: auth(), payload: { ...base, label: 'Work' } });
    const workId = (work.json() as { id: string }).id;
    const edited = await app.inject({ method: 'PUT', url: `/addresses/${workId}`, headers: auth(), payload: { ...base, label: 'Office', landmark: 'Near temple' } });
    expect(edited.json()).toMatchObject({ label: 'Office', landmark: 'Near temple' });
    const clash = await app.inject({ method: 'PUT', url: `/addresses/${workId}`, headers: auth(), payload: { ...base, label: 'HOME' } });
    expect(clash.statusCode).toBe(409);

    const listed = (await app.inject({ method: 'GET', url: '/addresses', headers: auth() })).json() as { label: string }[];
    expect(listed.map((a) => a.label).sort()).toEqual(['Home', 'Office']);
    expect((await app.inject({ method: 'DELETE', url: `/addresses/${saved.id}`, headers: auth() })).statusCode).toBe(204);
    expect((await app.inject({ method: 'DELETE', url: `/addresses/${saved.id}`, headers: auth() })).statusCode).toBe(404);
  });

  it('stores the cart, dropping unknown items and capping quantities', async () => {
    const now = Date.now();
    const put = await app.inject({
      method: 'PUT',
      url: '/cart',
      headers: auth(),
      payload: {
        lines: [
          { productId: 'chicken-boneless', variantId: 'cb-500', qty: 12, addedAt: now },
          { productId: 'amul-butter', variantId: 'amul-100', qty: 2, addedAt: now - 1000 },
          { productId: 'nope', variantId: 'nope', qty: 1, addedAt: now },
        ],
      },
    });
    expect(put.statusCode).toBe(200);
    const lines = (put.json() as { lines: { productId: string; qty: number }[] }).lines;
    // Boneless 500g has 9 in stock in the sample data.
    expect(lines.map((l) => [l.productId, l.qty])).toEqual([
      ['chicken-boneless', 9],
      ['amul-butter', 2],
    ]);
    const got = (await app.inject({ method: 'GET', url: '/cart', headers: auth() })).json() as { lines: { productId: string }[] };
    expect(got.lines.map((l) => l.productId)).toEqual(['chicken-boneless', 'amul-butter']);
  });

  it('checks coupons with the server prices', async () => {
    const lines = [{ productId: 'vijaya-groundnut-oil', variantId: 'vgo-1l', qty: 4, addedAt: 1 }];
    const ok = await app.inject({ method: 'POST', url: '/coupons/validate', payload: { code: 'festive50', lines } });
    expect(ok.json()).toMatchObject({ valid: true, code: 'FESTIVE50', discount: 50 });
    const low = await app.inject({ method: 'POST', url: '/coupons/validate', payload: { code: 'FESTIVE100', lines } });
    expect(low.json()).toMatchObject({ valid: false, reason: 'min_order_amount', message: 'Add non-exempt products worth ₹712 more to apply' });
  });

  it('limits code requests (60 s cooldown)', async () => {
    await app.inject({ method: 'POST', url: '/auth/otp/send', payload: { phone: '9000000001', purpose: 'signup' } });
    const again = await app.inject({ method: 'POST', url: '/auth/otp/send', payload: { phone: '9000000001', purpose: 'signup' } });
    expect(again.json()).toEqual({ error: 'rate_limited' });
  });
});
