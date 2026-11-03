// What the routes need from storage. Two implementations: memory.ts (no database: tests and quick local runs)
// and pg.ts (PostgreSQL on Neon; DECISIONS D-65). Routes don't know which one they use.
import type {
  Address,
  AppConfig,
  Banner,
  CartLine,
  Category,
  Coupon,
  Id,
  Order,
  OrderItem,
  PaymentType,
  Product,
  RelatedProducts,
  Section,
  Store,
  SubCategory,
  SwapLine,
  SwapOffer,
  User,
} from '@littlekart/shared';

export interface HomeData {
  categories: Category[];
  sections: Section[];
  banners: Banner[];
  deals: Product[];
}

export interface CatalogStore {
  home(): Promise<HomeData>;
  subCategories(tileId: Id): Promise<SubCategory[]>;
  products(subCategoryId: Id, query?: string): Promise<Product[]>;
  byIds(ids: readonly Id[]): Promise<Product[]>;
  /** Smart suggestions for a cart (DECISIONS D-90). */
  recommendations(cartIds: readonly Id[]): Promise<Product[]>;
  /** Swap & save offers for cart lines (DECISIONS D-91). */
  swaps(lines: readonly SwapLine[]): Promise<SwapOffer[]>;
  /** Similar and popular products for the product page (DECISIONS D-97). */
  related(productId: Id): Promise<RelatedProducts>;
  search(query: string): Promise<Product[]>;
  /** Every product (the Ask AI assistant chooses from the food shelves, DECISIONS D-102). */
  all(): Promise<Product[]>;
}

export type IssueResult = { ok: true; code: string } | { ok: false; reason: 'cooldown' | 'hourly_limit' };
export type CheckResult = 'ok' | 'wrong' | 'missing';

export interface OtpStore {
  /** Creates a code for this phone. `fixedCode` is used in review mode instead of a random one. */
  issue(phone: string, fixedCode?: string): Promise<IssueResult>;
  /** Checks a code. A correct code is used up; 5 wrong tries or expiry removes it. */
  check(phone: string, code: string): Promise<CheckResult>;
}

export interface AccountStore {
  findByPhone(phone: string): Promise<User | undefined>;
  /** Creates the account, or fills in a missing name. */
  upsert(phone: string, name: string): Promise<User>;
  createSession(user: User): Promise<string>;
  userForToken(token: string): Promise<User | undefined>;
  endSession(token: string): Promise<void>;
}

export type NewAddress = Omit<Address, 'id'>;

export interface AddressStore {
  list(userId: Id): Promise<Address[]>;
  /** 'duplicate' when this customer already has an address with the same label. */
  create(userId: Id, address: NewAddress): Promise<Address | 'duplicate'>;
  update(userId: Id, id: Id, address: NewAddress): Promise<Address | 'duplicate' | 'missing'>;
  remove(userId: Id, id: Id): Promise<boolean>;
}

export interface CartStore {
  get(userId: Id): Promise<CartLine[]>;
  /** Replaces the whole cart (the app sends its cart after every change). */
  replace(userId: Id, lines: readonly CartLine[]): Promise<CartLine[]>;
}

export interface MetaStore {
  config(): Promise<AppConfig>;
  stores(): Promise<Store[]>;
  coupons(): Promise<Coupon[]>;
}

/** Items added to a placed order (D-105), before they are confirmed. */
export interface AddOnRecord {
  id: Id;
  orderId: Id;
  /** Same id when the request is sent again, so one tap never adds twice. */
  requestId: string;
  paymentType: PaymentType;
  items: OrderItem[];
  createdAt: number;
}

export interface OrderStore {
  /**
   * Saves the order and takes its items out of stock, all or nothing. 'out_of_stock' when stock ran out meanwhile.
   * A repeated `requestId` returns the order already saved for it.
   */
  create(userId: Id, requestId: string, order: Order): Promise<Order | 'out_of_stock'>;
  list(userId: Id): Promise<Order[]>;
  get(userId: Id, id: Id): Promise<Order | undefined>;
  attachGatewayOrder(id: Id, gatewayOrderId: string): Promise<void>;
  findByGatewayOrder(gatewayOrderId: string): Promise<{ id: Id; userId: Id } | undefined>;
  /**
   * pending_payment (or payment_failed, when the money arrives late) → placed.
   * Returns false when the order wasn't waiting for payment.
   */
  markPaid(id: Id, paymentId: string, placedAt: number): Promise<boolean>;
  /** pending_payment → payment_failed, with the stock put back. */
  markPaymentFailed(id: Id): Promise<boolean>;
  /** Unpaid orders older than `olderThanMs` become payment_failed (stock put back). */
  expirePending(olderThanMs: number): Promise<number>;
  /**
   * Takes the add-on's items out of stock, all or nothing ('out_of_stock' otherwise). `confirm` adds them to the
   * order at once (Cash on Delivery); otherwise the add-on waits for its payment. A repeated `requestId` changes nothing.
   */
  addItems(userId: Id, addOn: AddOnRecord, confirm: boolean): Promise<Order | 'out_of_stock'>;
  attachAddOnGateway(addOnId: Id, gatewayOrderId: string): Promise<void>;
  findAddOnByGateway(gatewayOrderId: string): Promise<{ addOnId: Id; orderId: Id; userId: Id } | undefined>;
  /** Paid: the add-on's items join the order. False when it wasn't waiting for payment. */
  markAddOnPaid(addOnId: Id, paymentId: string): Promise<boolean>;
  /** Not paid: its stock is put back. */
  markAddOnFailed(addOnId: Id): Promise<boolean>;
}

export interface DataLayer {
  catalog: CatalogStore;
  otps: OtpStore;
  accounts: AccountStore;
  addresses: AddressStore;
  carts: CartStore;
  meta: MetaStore;
  orders: OrderStore;
  /** Closes database connections (no-op in memory). */
  close(): Promise<void>;
}
