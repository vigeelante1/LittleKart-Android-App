// Data access contracts. Screens call these through hooks; never `fetch` from a screen.
// Two implementations: ./mock (sample data) and ./http (our backend in ../api).
import type {
  Address,
  AiMessage,
  AiReply,
  AppConfig,
  Banner,
  CartLine,
  Category,
  Coupon,
  AuthErrorCode,
  Id,
  Order,
  OrderAddress,
  OtpPurpose,
  PaymentType,
  Product,
  RelatedProducts,
  Section,
  SwapLine,
  SwapOffer,
  Store,
  SubCategory,
  User,
} from '@littlekart/shared';

export interface HomeData {
  categories: Category[];
  sections: Section[];
  banners: Banner[];
  deals: Product[];
}

export interface CatalogRepo {
  getHome(): Promise<HomeData>;
  /** Left-rail sub-categories for a home tile. */
  getSubCategories(tileId: Id): Promise<SubCategory[]>;
  getProducts(subCategoryId: Id, query?: string): Promise<Product[]>;
  getProductsByIds(ids: readonly Id[]): Promise<Product[]>;
  /** "Often bought together" for the current cart. */
  getRecommendations(cartProductIds: readonly Id[]): Promise<Product[]>;
  /** "Swap & save": cheaper products of the same kind for cart lines (DECISIONS D-91). */
  getSwaps(lines: readonly SwapLine[]): Promise<SwapOffer[]>;
  /** Product page: similar and popular products (DECISIONS D-97). */
  getRelated(productId: Id): Promise<RelatedProducts>;
  search(query: string): Promise<Product[]>;
}

export interface AuthRepo {
  /** Does this number already have an account (and a name)? Decides login vs sign-up. */
  lookup(phone: string): Promise<{ exists: boolean; name: string }>;
  sendOtp(phone: string, purpose: OtpPurpose): Promise<void>;
  verifyOtp(input: { phone: string; otp: string; purpose: OtpPurpose; name: string }): Promise<{ user: User; token: string }>;
  logout(): Promise<void>;
}

export interface AddressRepo {
  list(): Promise<Address[]>;
  /** Rejects with DUPLICATE_LABEL_MESSAGE when the label is already used (live server behaviour). */
  save(address: Omit<Address, 'id'>): Promise<Address>;
  update(id: string, address: Omit<Address, 'id'>): Promise<Address>;
  remove(id: string): Promise<void>;
  reverseGeocode(lat: number, lng: number): Promise<string>;
  autocomplete(query: string): Promise<{ text: string; lat: number; lng: number }[]>;
}

export interface CouponRepo {
  list(): Promise<Coupon[]>;
}

/** The signed-in customer's cart on the server. Sample-data mode keeps the cart on the phone only. */
export interface CartRepo {
  get(): Promise<CartLine[]>;
  /** Saves the whole cart; returns it as the server keeps it (unknown items dropped, quantities capped). */
  replace(lines: readonly CartLine[]): Promise<CartLine[]>;
}

export interface ConfigRepo {
  get(): Promise<AppConfig>;
}

export interface NearestStore {
  store: Store;
  distanceKm: number;
  /** False when the point is outside the store's delivery radius ("Not deliverable — about 8.2 km away"). */
  inRadius: boolean;
}

export interface StoreRepo {
  /** The closest store and whether it delivers here. Null only when there are no stores. */
  nearest(lat: number, lng: number): Promise<NearestStore | null>;
}

export interface PlaceOrderInput {
  /** Same id when the request is sent again, so one tap never makes two orders. */
  requestId: string;
  lines: CartLine[];
  address: OrderAddress;
  tip: number;
  couponCode?: string;
  paymentType: PaymentType;
  /** Scheduled delivery (D-103): start of the chosen slot. */
  slotStart?: number;
}

/** What the Razorpay checkout needs (test mode keys start with rzp_test_). */
export interface RazorpayCheckout {
  keyId: string;
  orderId: string;
  /** In paise. */
  amount: number;
}

export interface PlacedOrder {
  order: Order;
  /** Present for UPI / card orders: open the checkout, then confirm. */
  razorpay?: RazorpayCheckout;
}

/** Razorpay's success response, checked by the server. */
export interface RazorpayResult {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface OrderRepo {
  place(input: PlaceOrderInput): Promise<PlacedOrder>;
  confirmPayment(orderId: Id, result: RazorpayResult): Promise<Order>;
  /** The checkout was closed or the payment failed: the order becomes Payment Failed. */
  paymentFailed(orderId: Id): Promise<Order>;
  /** Newest first. */
  list(): Promise<Order[]>;
  get(orderId: Id): Promise<Order | null>;
}

/** An order the server refused, with its message (cod_unavailable, items_unavailable, not_deliverable, ...). */
export class OrderError extends Error {
  constructor(
    readonly code: string,
    message: string,
    /** Extra lines (the "Store Closed" answer lists the hours and the store's time). */
    readonly details: string[] = [],
  ) {
    super(message);
    this.name = 'OrderError';
  }
}

/** Ask AI (iteration 2, DECISIONS D-102): one chat turn. */
export interface AiRepo {
  chat(messages: readonly AiMessage[]): Promise<AiReply>;
}

export interface Repositories {
  catalog: CatalogRepo;
  ai: AiRepo;
  auth: AuthRepo;
  address: AddressRepo;
  coupons: CouponRepo;
  cart: CartRepo;
  config: ConfigRepo;
  stores: StoreRepo;
  orders: OrderRepo;
}

/** Login failures with a known reason, so the screen can show the live app's message. */
export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
  }
}
