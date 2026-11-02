// Data layer on PostgreSQL (Neon in production; DECISIONS D-65). Same answers as memory.ts.
import {
  findSwaps,
  matchesQuery,
  relatedProducts,
  suggestProducts,
  OTP_LENGTH,
  OTP_RESEND_SECONDS,
  type Address,
  type AppConfig,
  type Banner,
  type CartLine,
  type Category,
  type Coupon,
  type ItemType,
  type Product,
  type Section,
  type Store,
  type SubCategory,
  type Tile,
  type User,
} from '@littlekart/shared';
import { drawnCardIds, nutritionById, swapGroupOf } from '@littlekart/shared/seed';
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { MAX_SENDS_PER_HOUR, MAX_VERIFY_ATTEMPTS, OTP_TTL_MS } from '../auth/otpStore.js';
import type { Sql } from '../db/client.js';
import { pgOrders } from './pgOrders.js';
import type { DataLayer, NewAddress } from './types.js';

const SESSION_DAYS = 90;
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

interface ProductRow {
  id: string;
  sub_category_id: string;
  name: string;
  subtitle: string | null;
  image_url: string;
  item_type: ItemType;
  coupon_exempt: boolean;
  variants: { id: string; label: string; price: number; mrp: number | null; imageUrl: string | null; stock: number }[];
}

const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  categoryId: r.sub_category_id,
  name: r.name,
  ...(r.subtitle ? { subtitle: r.subtitle } : {}),
  imageUrl: r.image_url,
  itemType: r.item_type,
  couponExempt: r.coupon_exempt,
  variants: r.variants.map((v) => ({
    id: v.id,
    label: v.label,
    price: v.price,
    ...(v.mrp !== null ? { mrp: v.mrp } : {}),
    ...(v.imageUrl ? { imageUrl: v.imageUrl } : {}),
    stock: Math.max(0, v.stock),
  })),
  // Nutrition is reference data kept with the catalog source (DECISIONS D-101), not in the database.
  ...(nutritionById[r.id] ? { nutrition: nutritionById[r.id] } : {}),
});

interface AddressRow {
  id: string;
  label: string;
  text: string;
  house_no: string;
  landmark: string | null;
  name: string;
  phone: string;
  lat: number;
  lng: number;
}

const toAddress = (r: AddressRow): Address => ({
  id: r.id,
  label: r.label,
  text: r.text,
  houseNo: r.house_no,
  ...(r.landmark ? { landmark: r.landmark } : {}),
  name: r.name,
  phone: r.phone,
  lat: r.lat,
  lng: r.lng,
});

const isUniqueViolation = (error: unknown) => (error as { code?: string } | null)?.code === '23505';

export function pgData(sql: Sql): DataLayer {
  /** Active products with their variants and free stock, in catalog order. `where` filters the products. */
  const loadProducts = async (where: ReturnType<Sql>) => {
    const rows = await sql<ProductRow[]>`
      select p.id, p.sub_category_id, p.name, p.subtitle, p.image_url, p.item_type, p.coupon_exempt,
        coalesce(
          json_agg(json_build_object(
            'id', v.id, 'label', v.label, 'price', v.price, 'mrp', v.mrp, 'imageUrl', v.image_url,
            'stock', coalesce(i.quantity - i.reserved, 0)
          ) order by v.sort_order) filter (where v.id is not null),
          '[]'
        ) as variants
      from products p
      left join variants v on v.product_id = p.id
      left join inventory i on i.variant_id = v.id
      where p.is_active and ${where}
      group by p.id
      order by p.sort_order`;
    return rows.map(toProduct);
  };

  /** Products in the order of `ids`. */
  const byIds = async (ids: readonly string[]) => {
    if (ids.length === 0) return [];
    const found = await loadProducts(sql`p.id in ${sql(ids as string[])}`);
    const map = new Map(found.map((p) => [p.id, p]));
    return ids.flatMap((id) => map.get(id) ?? []);
  };

  const list = async (name: 'deals' | 'recommendations') =>
    (await sql<{ product_id: string }[]>`select product_id from product_lists where list = ${name} order by sort_order`).map(
      (r) => r.product_id,
    );

  return {
    catalog: {
      async home() {
        const [cats, secs, tiles, bans, dealIds] = await Promise.all([
          sql<{ id: string; name: string; image_url: string; is_new: boolean }[]>`
            select id, name, image_url, is_new from categories order by sort_order`,
          sql<{ id: string; title: string; category_id: string }[]>`select id, title, category_id from sections order by sort_order`,
          sql<{ id: string; section_id: string; label: string; image_url: string; is_new: boolean }[]>`
            select id, section_id, label, image_url, is_new from tiles order by sort_order`,
          sql<{ id: string; image_url: string; target_tile_id: string | null }[]>`
            select id, image_url, target_tile_id from banners order by sort_order`,
          list('deals'),
        ]);
        const categories: Category[] = cats.map((c) => ({ id: c.id, name: c.name, imageUrl: c.image_url, ...(c.is_new ? { isNew: true } : {}) }));
        const tileOf = (t: (typeof tiles)[number]): Tile => ({
          id: t.id,
          label: t.label,
          imageUrl: t.image_url,
          isNew: t.is_new,
          categoryId: t.id,
        });
        const sections: Section[] = secs.map((s) => ({
          id: s.id,
          title: s.title,
          categoryId: s.category_id,
          tiles: tiles.filter((t) => t.section_id === s.id).map(tileOf),
        }));
        const banners: Banner[] = bans.map((b) => ({ id: b.id, imageUrl: b.image_url, ...(b.target_tile_id ? { targetTileId: b.target_tile_id } : {}) }));
        return { categories, sections, banners, deals: await byIds(dealIds) };
      },

      async subCategories(tileId) {
        const rows = await sql<{ id: string; name: string; image_url: string }[]>`
          select id, name, image_url from sub_categories where tile_id = ${tileId} order by sort_order`;
        return rows.map((r): SubCategory => ({ id: r.id, name: r.name, imageUrl: r.image_url }));
      },

      async products(subCategoryId, query) {
        const found = await loadProducts(sql`p.sub_category_id = ${subCategoryId}`);
        return found.filter((p) => matchesQuery(p.name, query ?? ''));
      },

      byIds,

      async recommendations(cartIds) {
        // Same rule as sample mode; the catalog is small enough to rank in memory.
        const [all, popular] = await Promise.all([loadProducts(sql`true`), list('recommendations')]);
        return suggestProducts(cartIds, all, popular);
      },

      async swaps(lines) {
        const ids = [...new Set(lines.flatMap((l) => swapGroupOf(l.productId)))];
        const found = await byIds([...new Set([...ids, ...lines.map((l) => l.productId)])]);
        return findSwaps(lines, new Map(found.map((p) => [p.id, p])), swapGroupOf, (p) => !drawnCardIds.has(p.id));
      },

      async related(productId) {
        const all = await loadProducts(sql`true`);
        const product = all.find((p) => p.id === productId);
        if (!product) return { similar: [], popular: [], tileId: null };
        const shelf = await sql<{ tile_id: string }[]>`select tile_id from sub_categories where id = ${product.categoryId}`;
        const tileId = shelf[0]?.tile_id;
        const shelves = tileId
          ? [tileId, ...(await sql<{ id: string }[]>`select id from sub_categories where tile_id = ${tileId}`).map((r) => r.id)]
          : [product.categoryId];
        return relatedProducts(product, all, shelves);
      },

      async search(query) {
        if (!query.trim()) return [];
        // Names hold several languages; the shared matcher keeps search identical to sample mode.
        return (await loadProducts(sql`true`)).filter((p) => matchesQuery(p.name, query));
      },

      all: () => loadProducts(sql`true`),
    },

    otps: {
      async issue(phone, fixedCode) {
        const sends = await sql<{ sent_at: Date }[]>`
          select sent_at from otp_sends where phone = ${phone} and sent_at > now() - interval '1 hour' order by sent_at`;
        const last = sends[sends.length - 1];
        if (last && Date.now() - last.sent_at.getTime() < OTP_RESEND_SECONDS * 1000) return { ok: false, reason: 'cooldown' };
        if (sends.length >= MAX_SENDS_PER_HOUR) return { ok: false, reason: 'hourly_limit' };
        const code = fixedCode ?? String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');
        const salt = randomBytes(8).toString('hex');
        const expires = new Date(Date.now() + OTP_TTL_MS);
        await sql.begin(async (tx) => {
          await tx`insert into otp_codes (phone, code_hash, salt, expires_at, attempts)
            values (${phone}, ${sha256(`${salt}:${code}`)}, ${salt}, ${expires}, 0)
            on conflict (phone) do update set code_hash = excluded.code_hash, salt = excluded.salt,
              expires_at = excluded.expires_at, attempts = 0`;
          await tx`insert into otp_sends (phone) values (${phone})`;
          await tx`delete from otp_sends where sent_at < now() - interval '1 day'`;
        });
        return { ok: true, code };
      },

      async check(phone, code) {
        const [row] = await sql<{ code_hash: string; salt: string; expires_at: Date; attempts: number }[]>`
          select code_hash, salt, expires_at, attempts from otp_codes where phone = ${phone}`;
        if (!row || row.expires_at.getTime() < Date.now()) {
          await sql`delete from otp_codes where phone = ${phone}`;
          return 'missing';
        }
        const expected = Buffer.from(row.code_hash, 'hex');
        const candidate = Buffer.from(sha256(`${row.salt}:${code}`), 'hex');
        if (candidate.length === expected.length && timingSafeEqual(candidate, expected)) {
          await sql`delete from otp_codes where phone = ${phone}`;
          return 'ok';
        }
        if (row.attempts + 1 >= MAX_VERIFY_ATTEMPTS) await sql`delete from otp_codes where phone = ${phone}`;
        else await sql`update otp_codes set attempts = attempts + 1 where phone = ${phone}`;
        return 'wrong';
      },
    },

    accounts: {
      async findByPhone(phone) {
        const [row] = await sql<User[]>`select id::text, phone, name from users where phone = ${phone}`;
        return row;
      },
      async upsert(phone, name) {
        const [row] = await sql<User[]>`
          insert into users (phone, name) values (${phone}, ${name})
          on conflict (phone) do update set name = case when users.name = '' then excluded.name else users.name end
          returning id::text, phone, name`;
        if (!row) throw new Error('could not save the account');
        return row;
      },
      async createSession(user) {
        const token = randomBytes(32).toString('base64url');
        await sql`insert into sessions (token_hash, user_id, expires_at)
          values (${sha256(token)}, ${user.id}, now() + make_interval(days => ${SESSION_DAYS}))`;
        return token;
      },
      async userForToken(token) {
        if (!token) return undefined;
        const [row] = await sql<User[]>`
          select u.id::text, u.phone, u.name from sessions s join users u on u.id = s.user_id
          where s.token_hash = ${sha256(token)} and s.expires_at > now()`;
        return row;
      },
      async endSession(token) {
        await sql`delete from sessions where token_hash = ${sha256(token)}`;
      },
    },

    addresses: {
      async list(userId) {
        const rows = await sql<AddressRow[]>`
          select id::text, label, text, house_no, landmark, name, phone, lat, lng from addresses
          where user_id = ${userId} order by created_at desc`;
        return rows.map(toAddress);
      },
      async create(userId, a: NewAddress) {
        try {
          const [row] = await sql<AddressRow[]>`
            insert into addresses (user_id, label, text, house_no, landmark, name, phone, lat, lng)
            values (${userId}, ${a.label}, ${a.text}, ${a.houseNo}, ${a.landmark ?? null}, ${a.name}, ${a.phone}, ${a.lat}, ${a.lng})
            returning id::text, label, text, house_no, landmark, name, phone, lat, lng`;
          if (!row) throw new Error('could not save the address');
          return toAddress(row);
        } catch (error) {
          if (isUniqueViolation(error)) return 'duplicate';
          throw error;
        }
      },
      async update(userId, id, a: NewAddress) {
        try {
          const [row] = await sql<AddressRow[]>`
            update addresses set label = ${a.label}, text = ${a.text}, house_no = ${a.houseNo}, landmark = ${a.landmark ?? null},
              name = ${a.name}, phone = ${a.phone}, lat = ${a.lat}, lng = ${a.lng}
            where id::text = ${id} and user_id = ${userId}
            returning id::text, label, text, house_no, landmark, name, phone, lat, lng`;
          return row ? toAddress(row) : 'missing';
        } catch (error) {
          if (isUniqueViolation(error)) return 'duplicate';
          throw error;
        }
      },
      async remove(userId, id) {
        const rows = await sql`delete from addresses where id::text = ${id} and user_id = ${userId} returning id`;
        return rows.length > 0;
      },
    },

    carts: {
      async get(userId) {
        const rows = await sql<{ product_id: string; variant_id: string; qty: number; added_at: Date }[]>`
          select product_id, variant_id, qty, added_at from cart_items where user_id = ${userId} order by added_at desc`;
        return rows.map((r): CartLine => ({ productId: r.product_id, variantId: r.variant_id, qty: r.qty, addedAt: r.added_at.getTime() }));
      },
      async replace(userId, lines) {
        await sql.begin(async (tx) => {
          await tx`delete from cart_items where user_id = ${userId}`;
          for (const l of lines) {
            await tx`insert into cart_items (user_id, product_id, variant_id, qty, added_at)
              values (${userId}, ${l.productId}, ${l.variantId}, ${l.qty}, ${new Date(l.addedAt)})`;
          }
        });
        return [...lines];
      },
    },

    meta: {
      async config() {
        const [row] = await sql<{ value: AppConfig }[]>`select value from app_settings where key = 'config'`;
        if (!row) throw new Error('settings missing: run npm run db:seed');
        return row.value;
      },
      async stores() {
        const rows = await sql<
          { id: string; name: string; lat: number; lng: number; delivery_radius_km: number; open_time: string; close_time: string }[]
        >`select id, name, lat, lng, delivery_radius_km, open_time, close_time from stores where is_online order by id`;
        return rows.map(
          (r): Store => ({
            id: r.id,
            name: r.name,
            lat: r.lat,
            lng: r.lng,
            deliveryRadiusKm: r.delivery_radius_km,
            openTime: r.open_time,
            closeTime: r.close_time,
          }),
        );
      },
      async coupons() {
        const rows = await sql<{ code: string; title: string; discount: number; min_order: number }[]>`
          select code, title, discount, min_order from coupons where is_active order by min_order`;
        return rows.map((r): Coupon => ({ code: r.code, title: r.title, discount: r.discount, minOrder: r.min_order }));
      },
    },

    orders: pgOrders(sql),

    close: () => sql.end(),
  };
}
