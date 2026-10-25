// Seed coupons, settings and stores, shared by the app's sample-data mode and the API.
import { DEFAULT_ETA_SETTINGS } from '../eta';
import { MAX_UNITS_PER_PRODUCT } from '../limits';
import { DEFAULT_PRICING_SETTINGS } from '../pricing';
import { CUSTOM_TIP_MAX, CUSTOM_TIP_MIN, TIP_OPTIONS } from '../tip';
import type { AppConfig, Coupon, Store } from '../types';
import { searchHints } from './catalog';

import { SUPPORT_PHONE_FALLBACK } from '../orders';

/** Placeholder support number (the dummy number Razorpay uses in test mode); set your own before going live. */
export const SUPPORT_PHONE = SUPPORT_PHONE_FALLBACK;

/** Minimums worked out from the screenshot hints (ARCHITECTURE section 6). FESTIVE200's minimum is assumed. */
export const coupons: Coupon[] = [
  { code: 'FESTIVE50', title: '₹50 Limited Offer', discount: 50, minOrder: 750 },
  { code: 'FESTIVE100', title: '₹100 Limited Offer', discount: 100, minOrder: 1500 },
  { code: 'FESTIVE150', title: '₹150 Limited Offer', discount: 150, minOrder: 2000 },
  { code: 'FESTIVE200', title: '₹200 Limited Offer', discount: 200, minOrder: 2500 },
];

export const config: AppConfig = {
  pricing: DEFAULT_PRICING_SETTINGS,
  tipOptions: [...TIP_OPTIONS],
  minCustomTip: CUSTOM_TIP_MIN,
  maxCustomTip: CUSTOM_TIP_MAX,
  maxUnitsPerProduct: MAX_UNITS_PER_PRODUCT,
  eta: DEFAULT_ETA_SETTINGS,
  searchHints,
  supportPhone: SUPPORT_PHONE,
};

/** Dark stores (Nalgonda), 6 km radius, 6:00 AM – 12:00 AM (DECISIONS D-23). */
export const stores: Store[] = [
  { id: 'lks-dharani', name: 'LKS-Dharani', lat: 17.034491, lng: 79.272718, deliveryRadiusKm: 6, openTime: '6:00 AM', closeTime: '12:00 AM' },
  { id: 'lks-vtc', name: 'LKS-VTC', lat: 17.072087, lng: 79.2641885, deliveryRadiusKm: 6, openTime: '6:00 AM', closeTime: '12:00 AM' },
];
