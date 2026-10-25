// Repositories backed by our own API (../api). Endpoint list: api/README.md.
import type { Address, AppConfig, AuthErrorCode, CartLine, Coupon, Order, Product, SubCategory, User } from '@littlekart/shared';
import { AuthError, OrderError, type HomeData, type NearestStore, type PlacedOrder, type Repositories } from '../repositories';
import { api, ApiError, query } from './client';

const authCodes: readonly AuthErrorCode[] = [
  'invalid_phone_number',
  'invalid_otp',
  'otp_session_missing',
  'rate_limited',
  'otp_not_configured',
  'name_required',
];

/** Turns the API's login error codes into AuthError so the screen shows the right message. */
async function withAuthErrors<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && (authCodes as readonly string[]).includes(error.code)) {
      throw new AuthError(error.code as AuthErrorCode);
    }
    throw error;
  }
}

/** The server's order refusals carry the live app's message; network failures keep a generic one. */
async function withOrderErrors<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && error.status < 500 && error.code !== 'request_failed') {
      throw new OrderError(error.code, error.message, error.details);
    }
    if (error instanceof ApiError && error.code === 'payment_unavailable') throw new OrderError(error.code, error.message);
    throw error;
  }
}

const orderPath = (id: string) => `/orders/${encodeURIComponent(id)}`;

export const httpRepositories: Repositories = {
  catalog: {
    getHome: () => api<HomeData>('/home'),
    getSubCategories: (tileId) => api<SubCategory[]>(`/tiles/${encodeURIComponent(tileId)}/subcategories`),
    getProducts: (subCategoryId, q) =>
      api<Product[]>(`/subcategories/${encodeURIComponent(subCategoryId)}/products${query({ q })}`),
    getProductsByIds: (ids) => api<Product[]>(`/products${query({ ids: ids.join(',') })}`),
    getRecommendations: (cartIds) => api<Product[]>(`/recommendations${query({ cart: cartIds.join(',') })}`),
    search: (q) => api<Product[]>(`/search${query({ q })}`),
  },
  auth: {
    lookup: (phone) => api<{ exists: boolean; name: string }>(`/customers/${encodeURIComponent(phone)}`),
    sendOtp: (phone, purpose) => withAuthErrors(api<void>('/auth/otp/send', { method: 'POST', body: { phone, purpose } })),
    verifyOtp: (input) =>
      withAuthErrors(api<{ user: User; token: string }>('/auth/otp/verify', { method: 'POST', body: input })),
    logout: () => api<void>('/auth/logout', { method: 'POST' }),
  },
  address: {
    list: () => api<Address[]>('/addresses'),
    save: (address) => api<Address>('/addresses', { method: 'POST', body: address }),
    update: (id, address) => api<Address>(`/addresses/${encodeURIComponent(id)}`, { method: 'PUT', body: address }),
    remove: async (id) => {
      await api<unknown>(`/addresses/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
    reverseGeocode: async (lat, lng) =>
      (await api<{ text: string }>(`/geo/reverse${query({ lat: String(lat), lng: String(lng) })}`)).text,
    autocomplete: (q) => api<{ text: string; lat: number; lng: number }[]>(`/geo/autocomplete${query({ q })}`),
  },
  coupons: { list: () => api<Coupon[]>('/coupons') },
  cart: {
    get: async () => (await api<{ lines: CartLine[] }>('/cart')).lines,
    replace: async (lines) => (await api<{ lines: CartLine[] }>('/cart', { method: 'PUT', body: { lines } })).lines,
  },
  config: { get: () => api<AppConfig>('/config') },
  stores: {
    nearest: (lat, lng) => api<NearestStore | null>(`/stores/nearest${query({ lat: String(lat), lng: String(lng) })}`),
  },
  orders: {
    place: (input) => withOrderErrors(api<PlacedOrder>('/orders', { method: 'POST', body: input })),
    confirmPayment: async (id, result) =>
      (await withOrderErrors(api<{ order: Order }>(`${orderPath(id)}/payment`, { method: 'POST', body: result }))).order,
    paymentFailed: async (id) => (await withOrderErrors(api<{ order: Order }>(`${orderPath(id)}/payment-failed`, { method: 'POST' }))).order,
    list: () => api<Order[]>('/orders'),
    get: async (id) => {
      try {
        return await api<Order>(orderPath(id));
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  },
};
