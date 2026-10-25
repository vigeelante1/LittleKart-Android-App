// Sample-data repositories: the shared seed catalog (also served by the API) plus local accounts and addresses.
import { distanceKm, DUPLICATE_LABEL_MESSAGE, isValidIndianMobile, labelTaken, type Address } from '@littlekart/shared';
import { seedCatalog } from '@littlekart/shared/seed';
import { config, coupons, MOCK_OTP, stores } from '@/data/mock/other';
import { AuthError, type Repositories } from '../repositories';
import { mockOrders } from './orders';

/** Small delay so loading states behave like a network call. */
const later = <T,>(value: T, ms = 120): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), ms));

const savedAddresses: Address[] = [];
/** Accounts created in this app session (phone → name). New numbers go through sign-up with a name. */
const accounts = new Map<string, string>();

export const mockRepositories: Repositories = {
  catalog: {
    getHome: () => later(seedCatalog.home()),
    getSubCategories: (tileId) => later(seedCatalog.subCategories(tileId)),
    getProducts: (subCategoryId, query) => later(seedCatalog.products(subCategoryId, query)),
    getProductsByIds: (ids) => later(seedCatalog.byIds(ids)),
    getRecommendations: (cartIds) => later(seedCatalog.recommendations(cartIds)),
    search: (query) => later(seedCatalog.search(query)),
  },
  auth: {
    lookup: (phone) => {
      const name = accounts.get(phone);
      return later({ exists: name !== undefined, name: name ?? '' }, 300);
    },
    sendOtp: async (phone) => {
      if (!isValidIndianMobile(phone)) throw new AuthError('invalid_phone_number');
      await later(undefined, 500);
    },
    verifyOtp: async ({ phone, otp, purpose, name }) => {
      await later(undefined, 500);
      if (otp !== MOCK_OTP) throw new AuthError('invalid_otp');
      if (purpose === 'signup') accounts.set(phone, name.trim());
      return { user: { id: `u-${phone}`, name: accounts.get(phone) ?? name.trim(), phone }, token: '' };
    },
    logout: () => later(undefined),
  },
  address: {
    list: () => later([...savedAddresses]),
    save: async (address) => {
      if (labelTaken(savedAddresses, address.label)) throw new Error(DUPLICATE_LABEL_MESSAGE);
      const saved: Address = { ...address, id: `a-${Date.now()}` };
      savedAddresses.unshift(saved);
      return later(saved);
    },
    update: async (id, address) => {
      if (labelTaken(savedAddresses, address.label, id)) throw new Error(DUPLICATE_LABEL_MESSAGE);
      const i = savedAddresses.findIndex((a) => a.id === id);
      const updated: Address = { ...address, id };
      if (i >= 0) savedAddresses[i] = updated;
      return later(updated);
    },
    remove: async (id) => {
      const i = savedAddresses.findIndex((a) => a.id === id);
      if (i >= 0) savedAddresses.splice(i, 1);
      await later(undefined);
    },
    reverseGeocode: () => later('Bus stand, Rahamath Nagar, Ramgiri, Nalgonda, Telangana 508001'),
    autocomplete: (query) =>
      later(
        query.trim().length < 2
          ? []
          : [{ text: 'Nalgonda Bus Stand, Rahamath Nagar, Ramgiri, Nalgonda, Telangana', lat: 17.0557, lng: 79.2745 }],
      ),
  },
  coupons: { list: () => later(coupons) },
  // Sample-data mode has no server cart: the phone's cart is the only one.
  cart: { get: () => later([]), replace: (lines) => later([...lines]) },
  config: { get: () => later(config) },
  stores: {
    nearest: (lat, lng) => {
      const ranked = stores
        .map((store) => {
          const km = distanceKm(lat, lng, store.lat, store.lng);
          return { store, distanceKm: km, inRadius: km <= store.deliveryRadiusKm };
        })
        .sort((a, b) => Number(b.inRadius) - Number(a.inRadius) || a.distanceKm - b.distanceKm);
      return later(ranked[0] ?? null);
    },
  },
  orders: mockOrders,
};
