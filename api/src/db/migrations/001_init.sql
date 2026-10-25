-- LittleKart database, first version (DECISIONS D-65). PostgreSQL 16 (Neon in production).
-- Money is stored in whole rupees (integers), times in UTC.

-- ---------- Catalog ----------

create table categories (
  id          text primary key,
  name        text not null,
  image_url   text not null,
  is_new      boolean not null default false,
  sort_order  int not null default 0
);

create table sections (
  id          text primary key,
  title       text not null,
  category_id text not null references categories(id),
  sort_order  int not null default 0
);

create table tiles (
  id          text primary key,
  section_id  text not null references sections(id) on delete cascade,
  label       text not null,
  image_url   text not null,
  is_new      boolean not null default false,
  sort_order  int not null default 0
);

create table sub_categories (
  id          text primary key,
  tile_id     text not null references tiles(id) on delete cascade,
  name        text not null,
  image_url   text not null,
  sort_order  int not null default 0
);

create table products (
  id              text primary key,
  sub_category_id text not null references sub_categories(id),
  name            text not null,
  subtitle        text,
  image_url       text not null,
  item_type       text not null check (item_type in ('food', 'meat', 'print', 'product')),
  coupon_exempt   boolean not null default false,
  is_active       boolean not null default true,
  sort_order      int not null default 0
);
create index products_sub_category_idx on products (sub_category_id, sort_order);

create table variants (
  id          text primary key,
  product_id  text not null references products(id) on delete cascade,
  label       text not null,
  price       int not null check (price >= 0),
  mrp         int check (mrp >= 0),
  image_url   text,
  sort_order  int not null default 0
);
create index variants_product_idx on variants (product_id, sort_order);

create table banners (
  id             text primary key,
  image_url      text not null,
  target_tile_id text references tiles(id),
  sort_order     int not null default 0
);

-- "Limited Time Deals" and "Often bought together" lists.
create table product_lists (
  list        text not null check (list in ('deals', 'recommendations')),
  product_id  text not null references products(id) on delete cascade,
  sort_order  int not null default 0,
  primary key (list, product_id)
);

-- ---------- Stores and stock ----------

create table stores (
  id                 text primary key,
  name               text not null,
  lat                double precision not null,
  lng                double precision not null,
  delivery_radius_km double precision not null default 6,
  open_time          text not null default '6:00 AM',
  close_time         text not null default '12:00 AM',
  is_online          boolean not null default true
);

-- One virtual stock per variant for now (every store sells the same stock; D-03).
create table inventory (
  variant_id  text primary key references variants(id) on delete cascade,
  quantity    int not null default 0 check (quantity >= 0),
  reserved    int not null default 0 check (reserved >= 0)
);

-- ---------- Customers ----------

create table users (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null unique check (phone ~ '^[6-9][0-9]{9}$'),
  name        text not null default '',
  created_at  timestamptz not null default now()
);

-- Only a hash of each session token is stored.
create table sessions (
  token_hash  text primary key,
  user_id     uuid not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);
create index sessions_user_idx on sessions (user_id);

-- One-time codes, hashed, with expiry and attempt count (D-12).
create table otp_codes (
  phone       text primary key,
  code_hash   text not null,
  salt        text not null,
  expires_at  timestamptz not null,
  attempts    int not null default 0
);

-- Every code sent, for the resend cooldown and the hourly limit.
create table otp_sends (
  phone    text not null,
  sent_at  timestamptz not null default now()
);
create index otp_sends_phone_idx on otp_sends (phone, sent_at);

create table addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  label       text not null,
  text        text not null,
  house_no    text not null,
  landmark    text,
  name        text not null,
  phone       text not null,
  lat         double precision not null,
  lng         double precision not null,
  created_at  timestamptz not null default now()
);
-- One address per label for each customer (the live server refuses a second "Home").
create unique index addresses_user_label_idx on addresses (user_id, lower(btrim(label)));

-- The signed-in customer's cart, kept on the server so it follows them to another phone.
create table cart_items (
  user_id     uuid not null references users(id) on delete cascade,
  product_id  text not null references products(id) on delete cascade,
  variant_id  text not null references variants(id) on delete cascade,
  qty         int not null check (qty > 0),
  added_at    timestamptz not null default now(),
  primary key (user_id, variant_id)
);

-- ---------- Offers and settings ----------

create table coupons (
  code            text primary key,
  title           text not null,
  discount        int not null check (discount > 0),
  min_order       int not null default 0,
  is_active       boolean not null default true,
  per_user_limit  int not null default 1
);

-- App settings as JSON documents ("config": fees, tips, delivery-time settings, search words).
create table app_settings (
  key    text primary key,
  value  jsonb not null
);
