// Loads the catalog, stores, coupons and settings into the database (the same data the app's sample mode shows).
// Safe to run again: rows are updated in place, customers and stock levels are kept. Run: npm run db:seed
// (it applies any pending migrations first).
import {
  banners,
  categories,
  config,
  coupons,
  dealProductIds,
  products,
  recommendationIds,
  sections,
  seedCatalog,
  stores,
} from '@littlekart/shared/seed';
import { fileURLToPath } from 'node:url';
import { connect, type Sql } from './client.js';
import { migrate } from './migrate.js';

export async function seed(sql: Sql): Promise<void> {
  await sql.begin(async (tx) => {
    for (const [i, c] of categories.entries()) {
      await tx`insert into categories (id, name, image_url, is_new, sort_order)
        values (${c.id}, ${c.name}, ${c.imageUrl}, ${c.isNew ?? false}, ${i})
        on conflict (id) do update set name = excluded.name, image_url = excluded.image_url,
          is_new = excluded.is_new, sort_order = excluded.sort_order`;
    }
    for (const [i, s] of sections.entries()) {
      await tx`insert into sections (id, title, category_id, sort_order) values (${s.id}, ${s.title}, ${s.categoryId}, ${i})
        on conflict (id) do update set title = excluded.title, category_id = excluded.category_id, sort_order = excluded.sort_order`;
      for (const [j, t] of s.tiles.entries()) {
        await tx`insert into tiles (id, section_id, label, image_url, is_new, sort_order)
          values (${t.id}, ${s.id}, ${t.label}, ${t.imageUrl}, ${t.isNew ?? false}, ${j})
          on conflict (id) do update set section_id = excluded.section_id, label = excluded.label,
            image_url = excluded.image_url, is_new = excluded.is_new, sort_order = excluded.sort_order`;
        // Tiles without their own rail get themselves as the only sub-category (DECISIONS D-53).
        for (const [k, sc] of seedCatalog.subCategories(t.id).entries()) {
          await tx`insert into sub_categories (id, tile_id, name, image_url, sort_order)
            values (${sc.id}, ${t.id}, ${sc.name}, ${sc.imageUrl}, ${k})
            on conflict (id) do update set tile_id = excluded.tile_id, name = excluded.name,
              image_url = excluded.image_url, sort_order = excluded.sort_order`;
        }
      }
    }
    for (const [i, b] of banners.entries()) {
      await tx`insert into banners (id, image_url, target_tile_id, sort_order) values (${b.id}, ${b.imageUrl}, ${b.targetTileId ?? null}, ${i})
        on conflict (id) do update set image_url = excluded.image_url, target_tile_id = excluded.target_tile_id, sort_order = excluded.sort_order`;
    }
    for (const [i, p] of products.entries()) {
      await tx`insert into products (id, sub_category_id, name, subtitle, image_url, item_type, coupon_exempt, sort_order)
        values (${p.id}, ${p.categoryId}, ${p.name}, ${p.subtitle ?? null}, ${p.imageUrl}, ${p.itemType}, ${p.couponExempt}, ${i})
        on conflict (id) do update set sub_category_id = excluded.sub_category_id, name = excluded.name,
          subtitle = excluded.subtitle, image_url = excluded.image_url, item_type = excluded.item_type,
          coupon_exempt = excluded.coupon_exempt, sort_order = excluded.sort_order`;
      for (const [j, v] of p.variants.entries()) {
        await tx`insert into variants (id, product_id, label, price, mrp, image_url, sort_order)
          values (${v.id}, ${p.id}, ${v.label}, ${v.price}, ${v.mrp ?? null}, ${v.imageUrl ?? null}, ${j})
          on conflict (id) do update set product_id = excluded.product_id, label = excluded.label, price = excluded.price,
            mrp = excluded.mrp, image_url = excluded.image_url, sort_order = excluded.sort_order`;
        // Stock is only set the first time, so re-seeding never undoes sales.
        await tx`insert into inventory (variant_id, quantity) values (${v.id}, ${v.stock}) on conflict (variant_id) do nothing`;
      }
    }
    await tx`delete from product_lists`;
    for (const [list, ids] of [
      ['deals', dealProductIds],
      ['recommendations', recommendationIds],
    ] as const) {
      for (const [i, id] of ids.entries()) {
        await tx`insert into product_lists (list, product_id, sort_order) values (${list}, ${id}, ${i})`;
      }
    }
    for (const s of stores) {
      await tx`insert into stores (id, name, lat, lng, delivery_radius_km, open_time, close_time)
        values (${s.id}, ${s.name}, ${s.lat}, ${s.lng}, ${s.deliveryRadiusKm}, ${s.openTime}, ${s.closeTime})
        on conflict (id) do update set name = excluded.name, lat = excluded.lat, lng = excluded.lng,
          delivery_radius_km = excluded.delivery_radius_km, open_time = excluded.open_time, close_time = excluded.close_time`;
    }
    for (const c of coupons) {
      await tx`insert into coupons (code, title, discount, min_order) values (${c.code}, ${c.title}, ${c.discount}, ${c.minOrder})
        on conflict (code) do update set title = excluded.title, discount = excluded.discount, min_order = excluded.min_order`;
    }
    await tx`insert into app_settings (key, value) values ('config', ${tx.json(JSON.parse(JSON.stringify(config)))})
      on conflict (key) do update set value = excluded.value`;
  });
}

// Command-line use.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set (see api/.env.example).');
    process.exit(1);
  }
  const sql = connect(url);
  await migrate(sql);
  await seed(sql);
  console.log('Seeded catalog, stores, coupons and settings.');
  await sql.end();
}
