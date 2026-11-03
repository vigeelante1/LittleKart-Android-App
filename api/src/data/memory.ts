// Data layer without a database: the shared seed catalog plus in-memory customers, addresses and carts.
// Used by the tests and when DATABASE_URL is not set. Everything is lost on restart.
import { orderWithAddOn, sameLabel, type Address, type CartLine, type Order } from '@littlekart/shared';
import { coupons, products as seedProducts, seedCatalog } from '@littlekart/shared/seed';
import { randomUUID } from 'node:crypto';
import { Accounts } from '../auth/accounts.js';
import { OtpStore } from '../auth/otpStore.js';
import { appConfig, stores } from '../settings.js';
import type { AddOnRecord, AccountStore, AddressStore, CartStore, DataLayer, OrderStore, OtpStore as OtpStoreContract } from './types.js';

export interface MemoryOptions {
  otps?: OtpStoreContract;
  accounts?: AccountStore;
}

class MemoryAddresses implements AddressStore {
  private readonly byUser = new Map<string, Address[]>();

  async list(userId: string) {
    return [...(this.byUser.get(userId) ?? [])];
  }

  async create(userId: string, address: Omit<Address, 'id'>) {
    const list = this.byUser.get(userId) ?? [];
    if (list.some((a) => sameLabel(a.label, address.label))) return 'duplicate' as const;
    const saved: Address = { ...address, id: randomUUID() };
    this.byUser.set(userId, [saved, ...list]);
    return saved;
  }

  async update(userId: string, id: string, address: Omit<Address, 'id'>) {
    const list = this.byUser.get(userId) ?? [];
    const i = list.findIndex((a) => a.id === id);
    if (i < 0) return 'missing' as const;
    if (list.some((a) => a.id !== id && sameLabel(a.label, address.label))) return 'duplicate' as const;
    const updated: Address = { ...address, id };
    list[i] = updated;
    return updated;
  }

  async remove(userId: string, id: string) {
    const list = this.byUser.get(userId) ?? [];
    const next = list.filter((a) => a.id !== id);
    this.byUser.set(userId, next);
    return next.length !== list.length;
  }
}

class MemoryCarts implements CartStore {
  private readonly byUser = new Map<string, CartLine[]>();

  async get(userId: string) {
    return [...(this.byUser.get(userId) ?? [])];
  }

  async replace(userId: string, lines: readonly CartLine[]) {
    this.byUser.set(userId, [...lines]);
    return [...lines];
  }
}

/** Orders in memory. The sample catalog's stock is fixed, so stock is not reduced here (it is in PostgreSQL). */
class MemoryOrders implements OrderStore {
  private readonly orders = new Map<string, { userId: string; requestId: string; order: Order; gatewayOrderId?: string }>();
  private readonly addOns = new Map<string, { userId: string; record: AddOnRecord; status: 'pending_payment' | 'added' | 'payment_failed'; gatewayOrderId?: string }>();

  async create(userId: string, requestId: string, order: Order) {
    for (const o of this.orders.values()) if (o.requestId === requestId) return o.order;
    this.orders.set(order.id, { userId, requestId, order });
    return order;
  }

  async list(userId: string) {
    return [...this.orders.values()]
      .filter((o) => o.userId === userId)
      .map((o) => o.order)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async get(userId: string, id: string) {
    const o = this.orders.get(id);
    return o && o.userId === userId ? o.order : undefined;
  }

  async attachGatewayOrder(id: string, gatewayOrderId: string) {
    const o = this.orders.get(id);
    if (o) o.gatewayOrderId = gatewayOrderId;
  }

  async findByGatewayOrder(gatewayOrderId: string) {
    for (const o of this.orders.values()) if (o.gatewayOrderId === gatewayOrderId) return { id: o.order.id, userId: o.userId };
    return undefined;
  }

  private move(id: string, to: Order['status'], from: readonly Order['status'][] = ['pending_payment']) {
    const o = this.orders.get(id);
    if (!o || !from.includes(o.order.status)) return false;
    o.order = { ...o.order, status: to };
    return true;
  }

  async markPaid(id: string, _paymentId: string, placedAt: number) {
    if (!this.move(id, 'pending', ['pending_payment', 'payment_failed'])) return false;
    const o = this.orders.get(id);
    if (o) o.order = { ...o.order, placedAt };
    return true;
  }

  async addItems(userId: string, record: AddOnRecord, confirm: boolean) {
    const o = this.orders.get(record.orderId);
    if (!o || o.userId !== userId) return 'out_of_stock' as const;
    if ([...this.addOns.values()].some((a) => a.record.requestId === record.requestId)) return o.order;
    this.addOns.set(record.id, { userId, record, status: confirm ? 'added' : 'pending_payment' });
    if (confirm) o.order = orderWithAddOn(o.order, record, record.items);
    return o.order;
  }

  async attachAddOnGateway(addOnId: string, gatewayOrderId: string) {
    const a = this.addOns.get(addOnId);
    if (a) a.gatewayOrderId = gatewayOrderId;
  }

  async findAddOnByGateway(gatewayOrderId: string) {
    for (const a of this.addOns.values()) {
      if (a.gatewayOrderId === gatewayOrderId) return { addOnId: a.record.id, orderId: a.record.orderId, userId: a.userId };
    }
    return undefined;
  }

  async markAddOnPaid(addOnId: string) {
    const a = this.addOns.get(addOnId);
    const o = a && this.orders.get(a.record.orderId);
    if (!a || !o || a.status === 'added') return false;
    a.status = 'added';
    o.order = orderWithAddOn(o.order, a.record, a.record.items);
    return true;
  }

  async markAddOnFailed(addOnId: string) {
    const a = this.addOns.get(addOnId);
    if (!a || a.status !== 'pending_payment') return false;
    a.status = 'payment_failed';
    return true;
  }

  async markPaymentFailed(id: string) {
    return this.move(id, 'payment_failed');
  }

  async expirePending(olderThanMs: number) {
    let n = 0;
    for (const o of this.orders.values()) {
      if (o.order.status === 'pending_payment' && Date.now() - o.order.createdAt > olderThanMs && this.move(o.order.id, 'payment_failed')) n += 1;
    }
    for (const a of this.addOns.values()) {
      if (a.status === 'pending_payment' && Date.now() - a.record.createdAt > olderThanMs) a.status = 'payment_failed';
    }
    return n;
  }
}

export function memoryData(options: MemoryOptions = {}): DataLayer {
  return {
    catalog: {
      home: async () => seedCatalog.home(),
      subCategories: async (tileId) => seedCatalog.subCategories(tileId),
      products: async (subCategoryId, query) => seedCatalog.products(subCategoryId, query),
      byIds: async (ids) => seedCatalog.byIds(ids),
      recommendations: async (cartIds) => seedCatalog.recommendations(cartIds),
      swaps: async (lines) => seedCatalog.swaps(lines),
      related: async (productId) => seedCatalog.related(productId),
      search: async (query) => seedCatalog.search(query),
      all: async () => seedProducts,
    },
    otps: options.otps ?? new OtpStore(),
    accounts: options.accounts ?? new Accounts(),
    addresses: new MemoryAddresses(),
    carts: new MemoryCarts(),
    meta: {
      config: async () => appConfig,
      stores: async () => stores,
      coupons: async () => coupons,
    },
    orders: new MemoryOrders(),
    close: async () => undefined,
  };
}
