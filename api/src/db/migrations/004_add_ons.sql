-- "Forgot something?" (DECISIONS D-105): items added in the 40 seconds after an order is placed.

-- When the order was placed for good (Cash on Delivery: at once; online: when paid). Starts the window.
alter table orders add column placed_at timestamptz;
update orders set placed_at = created_at where status not in ('pending_payment', 'payment_failed');

alter table order_items add column added_later boolean not null default false;

-- One row per "Add to order". Online add-ons wait for their own payment; Cash on Delivery ones are added at once.
-- Items are copied into order_items only once the add-on is confirmed.
create table order_addons (
  id                   text primary key,
  order_id             text not null references orders(id) on delete cascade,
  request_id           text not null unique,
  status               text not null check (status in ('pending_payment', 'added', 'payment_failed')),
  payment_type         text not null check (payment_type in ('UPI', 'Cash on Delivery')),
  items                jsonb not null,
  amount               int not null,
  razorpay_order_id    text unique,
  razorpay_payment_id  text,
  created_at           timestamptz not null default now()
);
create index order_addons_order_idx on order_addons (order_id);
