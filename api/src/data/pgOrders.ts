// Orders on PostgreSQL. Placing an order and taking its items out of stock happen in one transaction,
// with the stock rows locked, so two customers can never buy the last unit twice (D-09, D-16).
import type { Bill, Order, OrderAddress, OrderItem, OrderStatus, PaymentType } from '@littlekart/shared';
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
  }[];
}

const toOrder = (r: OrderRow): Order => ({
  id: r.id,
  createdAt: r.created_at.getTime(),
  status: r.status,
  paymentType: r.payment_type,
  items: r.items.map(({ mrp, ...rest }) => (mrp === null ? rest : { ...rest, mrp })),
  bill: r.bill,
  ...(r.coupon_code ? { couponCode: r.coupon_code } : {}),
  address: r.address,
  storeId: r.store_id,
  deliveryOtp: r.delivery_otp,
  etaMinutes: r.eta_minutes,
  ...(r.scheduled_start && r.scheduled_end ? { scheduledFor: { start: r.scheduled_start.getTime(), end: r.scheduled_end.getTime() } } : {}),
});

export function pgOrders(sql: Sql): OrderStore {
  const select = (where: ReturnType<Sql>) => sql<OrderRow[]>`
    select o.id, o.status, o.payment_type, o.store_id, o.address, o.bill, o.coupon_code, o.delivery_otp, o.eta_minutes, o.scheduled_start, o.scheduled_end, o.created_at,
      coalesce(json_agg(json_build_object(
        'productId', i.product_id, 'variantId', i.variant_id, 'name', i.name, 'label', i.label, 'imageUrl', i.image_url,
        'itemType', i.item_type, 'price', i.price, 'mrp', i.mrp, 'qty', i.qty
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
          await tx`insert into orders (id, user_id, request_id, status, payment_type, store_id, address, bill, coupon_code, delivery_otp, eta_minutes, scheduled_start, scheduled_end, created_at)
            values (${order.id}, ${userId}, ${requestId}, ${order.status}, ${order.paymentType}, ${order.storeId},
              ${tx.json(JSON.parse(JSON.stringify(order.address)))}, ${tx.json(JSON.parse(JSON.stringify(order.bill)))},
              ${order.couponCode ?? null}, ${order.deliveryOtp}, ${order.etaMinutes},
              ${order.scheduledFor ? new Date(order.scheduledFor.start) : null}, ${order.scheduledFor ? new Date(order.scheduledFor.end) : null}, ${new Date(order.createdAt)})`;
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

    async markPaid(id, paymentId) {
      return sql.begin(async (tx) => {
        const [row] = await tx<{ status: OrderStatus }[]>`select status from orders where id = ${id} for update`;
        if (!row || (row.status !== 'pending_payment' && row.status !== 'payment_failed')) return false;
        // A payment that arrives after the order was given up still counts: take the items out of stock again.
        if (row.status === 'payment_failed') {
          await tx`update inventory v set quantity = greatest(0, v.quantity - i.qty)
            from order_items i where i.order_id = ${id} and v.variant_id = i.variant_id`;
        }
        await tx`update orders set status = 'pending', razorpay_payment_id = ${paymentId}, updated_at = now() where id = ${id}`;
        return true;
      });
    },

    markPaymentFailed: fail,

    async expirePending(olderThanMs) {
      const rows = await sql<{ id: string }[]>`
        select id from orders where status = 'pending_payment' and created_at < now() - make_interval(secs => ${olderThanMs / 1000})`;
      let n = 0;
      for (const r of rows) if (await fail(r.id)) n += 1;
      return n;
    },
  };
}

class OutOfStock extends Error {}
