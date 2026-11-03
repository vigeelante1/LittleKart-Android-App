// Orders on PostgreSQL. Placing an order and taking its items out of stock happen in one transaction,
// with the stock rows locked, so two customers can never buy the last unit twice (D-09, D-16).
import { billWithAddOn, type Bill, type Order, type OrderAddOn, type OrderAddress, type OrderItem, type OrderStatus, type PaymentType } from '@littlekart/shared';
import type { Sql } from '../db/client.js';
import type { OrderStore } from './types.js';

interface OrderRow {
  id: string;
  status: OrderStatus;
  payment_type: PaymentType;
  store_id: string;
  address: OrderAddress;
  bill: Bill;
  coupon_code: string | null;
  delivery_otp: string;
  eta_minutes: number;
  scheduled_start: Date | null;
  scheduled_end: Date | null;
  placed_at: Date | null;
  add_ons: { id: string; createdAt: string; paymentType: PaymentType; amount: number }[];
  created_at: Date;
  items: {
    productId: string;
    variantId: string;
    name: string;
    label: string;
    imageUrl: string;
    itemType: OrderItem['itemType'];
    price: number;
    mrp: number | null;
    qty: number;
    addedLater: boolean;
  }[];
}

const toOrder = (r: OrderRow): Order => ({
  id: r.id,
  createdAt: r.created_at.getTime(),
  status: r.status,
  paymentType: r.payment_type,
  items: r.items.map(({ mrp, addedLater, ...rest }) => ({ ...rest, ...(mrp === null ? {} : { mrp }), ...(addedLater ? { addedLater: true } : {}) })),
  bill: r.bill,
  ...(r.coupon_code ? { couponCode: r.coupon_code } : {}),
  address: r.address,
  storeId: r.store_id,
  deliveryOtp: r.delivery_otp,
  etaMinutes: r.eta_minutes,
  ...(r.scheduled_start && r.scheduled_end ? { scheduledFor: { start: r.scheduled_start.getTime(), end: r.scheduled_end.getTime() } } : {}),
  ...(r.placed_at ? { placedAt: r.placed_at.getTime() } : {}),
  ...(r.add_ons.length ? { addOns: r.add_ons.map((a): OrderAddOn => ({ ...a, createdAt: Date.parse(a.createdAt) })) } : {}),
});

export function pgOrders(sql: Sql): OrderStore {
  const select = (where: ReturnType<Sql>) => sql<OrderRow[]>`
    select o.id, o.status, o.payment_type, o.store_id, o.address, o.bill, o.coupon_code, o.delivery_otp, o.eta_minutes, o.scheduled_start, o.scheduled_end, o.placed_at, o.created_at,
      coalesce((select json_agg(json_build_object('id', a.id, 'createdAt', a.created_at, 'paymentType', a.payment_type, 'amount', a.amount) order by a.created_at)
        from order_addons a where a.order_id = o.id and a.status = 'added'), '[]') as add_ons,
      coalesce(json_agg(json_build_object(
        'productId', i.product_id, 'variantId', i.variant_id, 'name', i.name, 'label', i.label, 'imageUrl', i.image_url,
        'itemType', i.item_type, 'price', i.price, 'mrp', i.mrp, 'qty', i.qty, 'addedLater', i.added_later
      ) order by i.position) filter (where i.order_id is not null), '[]') as items
    from orders o left join order_items i on i.order_id = o.id
    where ${where}
    group by o.id
    order by o.created_at desc`;

  /** Puts a failed order's items back in stock. Runs inside the caller's transaction. */
  const restock = async (tx: Sql, id: string) => {
    await tx`update inventory v set quantity = v.quantity + i.qty
      from order_items i where i.order_id = ${id} and v.variant_id = i.variant_id`;
  };

  const fail = async (id: string) =>
    sql.begin(async (tx) => {
      const rows = await tx`update orders set status = 'payment_failed', updated_at = now()
        where id = ${id} and status = 'pending_payment' returning id`;
      if (rows.length === 0) return false;
      await restock(tx as unknown as Sql, id);
      return true;
    });

  /** Copies a confirmed add-on's items into the order and grows its bill. Runs inside the caller's transaction. */
  const joinAddOn = async (tx: Sql, addOnId: string, paymentId: string | null) => {
    const [a] = await tx<{ order_id: string; items: OrderItem[] }[]>`select order_id, items from order_addons where id = ${addOnId}`;
    if (!a) return;
    const [o] = await tx<{ bill: Bill; next: number }[]>`
      select o.bill, coalesce((select max(position) + 1 from order_items where order_id = o.id), 0) as next from orders o where o.id = ${a.order_id} for update`;
    if (!o) return;
    for (const [n, i] of a.items.entries()) {
      await tx`insert into order_items (order_id, position, product_id, variant_id, name, label, image_url, item_type, price, mrp, qty, added_later)
        values (${a.order_id}, ${o.next + n}, ${i.productId}, ${i.variantId}, ${i.name}, ${i.label}, ${i.imageUrl}, ${i.itemType},
          ${i.price}, ${i.mrp ?? null}, ${i.qty}, true)`;
    }
    await tx`update orders set bill = ${tx.json(JSON.parse(JSON.stringify(billWithAddOn(o.bill, a.items))))}, updated_at = now() where id = ${a.order_id}`;
    await tx`update order_addons set status = 'added', razorpay_payment_id = ${paymentId} where id = ${addOnId}`;
  };

  /** An add-on that wasn't paid: its stock goes back. */
  const failAddOn = async (addOnId: string) =>
    sql.begin(async (tx) => {
      const [a] = await tx<{ items: OrderItem[] }[]>`select items from order_addons where id = ${addOnId} and status = 'pending_payment' for update`;
      if (!a) return false;
      for (const i of a.items) await tx`update inventory set quantity = quantity + ${i.qty} where variant_id = ${i.variantId}`;
      await tx`update order_addons set status = 'payment_failed' where id = ${addOnId}`;
      return true;
    });

  return {
    async create(userId, requestId, order) {
      const [existing] = await select(sql`o.request_id = ${requestId} and o.user_id = ${userId}`);
      if (existing) return toOrder(existing);
      try {
        return await sql.begin(async (tx) => {
          for (const item of order.items) {
            const taken = await tx`update inventory set quantity = quantity - ${item.qty}
              where variant_id = ${item.variantId} and quantity - reserved >= ${item.qty} returning variant_id`;
            if (taken.length === 0) throw new OutOfStock();
          }
          await tx`insert into orders (id, user_id, request_id, status, payment_type, store_id, address, bill, coupon_code, delivery_otp, eta_minutes, scheduled_start, scheduled_end, placed_at, created_at)
            values (${order.id}, ${userId}, ${requestId}, ${order.status}, ${order.paymentType}, ${order.storeId},
              ${tx.json(JSON.parse(JSON.stringify(order.address)))}, ${tx.json(JSON.parse(JSON.stringify(order.bill)))},
              ${order.couponCode ?? null}, ${order.deliveryOtp}, ${order.etaMinutes},
              ${order.scheduledFor ? new Date(order.scheduledFor.start) : null}, ${order.scheduledFor ? new Date(order.scheduledFor.end) : null},
              ${order.placedAt ? new Date(order.placedAt) : null}, ${new Date(order.createdAt)})`;
          for (const [position, i] of order.items.entries()) {
            await tx`insert into order_items (order_id, position, product_id, variant_id, name, label, image_url, item_type, price, mrp, qty)
              values (${order.id}, ${position}, ${i.productId}, ${i.variantId}, ${i.name}, ${i.label}, ${i.imageUrl}, ${i.itemType},
                ${i.price}, ${i.mrp ?? null}, ${i.qty})`;
          }
          return order;
        });
      } catch (error) {
        if (error instanceof OutOfStock) return 'out_of_stock';
        throw error;
      }
    },

    async list(userId) {
      return (await select(sql`o.user_id = ${userId}`)).map(toOrder);
    },

    async get(userId, id) {
      const [row] = await select(sql`o.user_id = ${userId} and o.id = ${id}`);
      return row ? toOrder(row) : undefined;
    },

    async attachGatewayOrder(id, gatewayOrderId) {
      await sql`update orders set razorpay_order_id = ${gatewayOrderId}, updated_at = now() where id = ${id}`;
    },

    async findByGatewayOrder(gatewayOrderId) {
      const [row] = await sql<{ id: string; user_id: string }[]>`
        select id, user_id::text from orders where razorpay_order_id = ${gatewayOrderId}`;
      return row ? { id: row.id, userId: row.user_id } : undefined;
    },

    async markPaid(id, paymentId, placedAt) {
      return sql.begin(async (tx) => {
        const [row] = await tx<{ status: OrderStatus }[]>`select status from orders where id = ${id} for update`;
        if (!row || (row.status !== 'pending_payment' && row.status !== 'payment_failed')) return false;
        // A payment that arrives after the order was given up still counts: take the items out of stock again.
        if (row.status === 'payment_failed') {
          await tx`update inventory v set quantity = greatest(0, v.quantity - i.qty)
            from order_items i where i.order_id = ${id} and v.variant_id = i.variant_id`;
        }
        await tx`update orders set status = 'pending', razorpay_payment_id = ${paymentId}, placed_at = ${new Date(placedAt)}, updated_at = now() where id = ${id}`;
        return true;
      });
    },

    markPaymentFailed: fail,

    async expirePending(olderThanMs) {
      const rows = await sql<{ id: string }[]>`
        select id from orders where status = 'pending_payment' and created_at < now() - make_interval(secs => ${olderThanMs / 1000})`;
      let n = 0;
      for (const r of rows) if (await fail(r.id)) n += 1;
      const addOns = await sql<{ id: string }[]>`
        select id from order_addons where status = 'pending_payment' and created_at < now() - make_interval(secs => ${olderThanMs / 1000})`;
      for (const a of addOns) await failAddOn(a.id);
      return n;
    },

    async addItems(userId, addOn, confirm) {
      const [existing] = await sql`select 1 from order_addons where request_id = ${addOn.requestId}`;
      try {
        await sql.begin(async (tx) => {
          if (existing) return;
          const [owner] = await tx`select 1 from orders where id = ${addOn.orderId} and user_id = ${userId} for update`;
          if (!owner) throw new OutOfStock();
          for (const item of addOn.items) {
            const taken = await tx`update inventory set quantity = quantity - ${item.qty}
              where variant_id = ${item.variantId} and quantity - reserved >= ${item.qty} returning variant_id`;
            if (taken.length === 0) throw new OutOfStock();
          }
          await tx`insert into order_addons (id, order_id, request_id, status, payment_type, items, amount, created_at)
            values (${addOn.id}, ${addOn.orderId}, ${addOn.requestId}, 'pending_payment', ${addOn.paymentType},
              ${tx.json(JSON.parse(JSON.stringify(addOn.items)))}, ${addOn.items.reduce((s, i) => s + i.price * i.qty, 0)}, ${new Date(addOn.createdAt)})`;
          if (confirm) await joinAddOn(tx as unknown as Sql, addOn.id, null);
        });
      } catch (error) {
        if (error instanceof OutOfStock) return 'out_of_stock';
        throw error;
      }
      const [row] = await select(sql`o.id = ${addOn.orderId} and o.user_id = ${userId}`);
      return row ? toOrder(row) : 'out_of_stock';
    },

    async attachAddOnGateway(addOnId, gatewayOrderId) {
      await sql`update order_addons set razorpay_order_id = ${gatewayOrderId} where id = ${addOnId}`;
    },

    async findAddOnByGateway(gatewayOrderId) {
      const [row] = await sql<{ id: string; order_id: string; user_id: string }[]>`
        select a.id, a.order_id, o.user_id::text from order_addons a join orders o on o.id = a.order_id where a.razorpay_order_id = ${gatewayOrderId}`;
      return row ? { addOnId: row.id, orderId: row.order_id, userId: row.user_id } : undefined;
    },

    async markAddOnPaid(addOnId, paymentId) {
      return sql.begin(async (tx) => {
        const [row] = await tx<{ status: string }[]>`select status from order_addons where id = ${addOnId} for update`;
        if (!row || row.status === 'added') return false;
        // A payment that arrives after the add-on was given up still counts: take its items out of stock again.
        if (row.status === 'payment_failed') {
          const [a] = await tx<{ items: OrderItem[] }[]>`select items from order_addons where id = ${addOnId}`;
          for (const i of a?.items ?? []) await tx`update inventory set quantity = greatest(0, quantity - ${i.qty}) where variant_id = ${i.variantId}`;
        }
        await joinAddOn(tx as unknown as Sql, addOnId, paymentId);
        return true;
      });
    },

    markAddOnFailed: failAddOn,
  };
}

class OutOfStock extends Error {}
