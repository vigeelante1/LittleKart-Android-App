-- Orders and online payments (DECISIONS D-68).

create table orders (
  id                   text primary key,
  user_id              uuid not null references users(id),
  -- The app sends a fresh id per "Submit Order" tap; a repeated request returns the same order.
  request_id           text not null unique,
  status               text not null check (status in
                         ('pending_payment', 'pending', 'accepted', 'assigned', 'nearby', 'delivered', 'payment_failed', 'cancelled')),
  payment_type         text not null check (payment_type in ('UPI', 'Cash on Delivery')),
  store_id             text not null references stores(id),
  address              jsonb not null,
  bill                 jsonb not null,
  coupon_code          text,
  delivery_otp         text not null,
  eta_minutes          int not null,
  razorpay_order_id    text unique,
  razorpay_payment_id  text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index orders_user_idx on orders (user_id, created_at desc);
create index orders_pending_idx on orders (created_at) where status = 'pending_payment';

-- Name, size and prices are copied at order time, so later catalog changes don't alter old orders.
create table order_items (
  order_id    text not null references orders(id) on delete cascade,
  position    int not null,
  product_id  text not null,
  variant_id  text not null,
  name        text not null,
  label       text not null,
  image_url   text not null,
  item_type   text not null,
  price       int not null,
  mrp         int,
  qty         int not null check (qty > 0),
  primary key (order_id, position)
);
