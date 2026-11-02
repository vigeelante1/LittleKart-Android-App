-- Scheduled orders (DECISIONS D-103): the one-hour delivery slot chosen while the store was closed.
alter table orders
  add column scheduled_start timestamptz,
  add column scheduled_end timestamptz;
