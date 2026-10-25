// Domain types shared by the app and the API.
import type { PricingSettings } from './pricing';
// Shapes follow the live LittleKart API (DECISIONS D-24), simplified where the app does not need a field.

export type Id = string;

/** How long a product takes to pack. Matches the live "delivery-eta-settings" item types. */
export type ItemType = 'food' | 'meat' | 'print' | 'product';

/** A top-level category in the home strip ("Pooja & Flowers", "Food & Meat", ...). */
export interface Category {
  id: Id;
  name: string;
  imageUrl: string;
  isNew?: boolean;
}

/** A tile in a home section grid. Opens the category list screen for `categoryId`. */
export interface Tile {
  id: Id;
  label: string;
  imageUrl: string;
  isNew?: boolean;
  categoryId: Id;
}

/** A home section: green accent bar, title, then a 4-column tile grid. */
export interface Section {
  id: Id;
  title: string;
  /** The strip category this section belongs to (drives the strip highlight). */
  categoryId: Id;
  tiles: Tile[];
}

/** A sub-category in the left rail of the category list screen ("Chicken", "Mutton", ...). */
export interface SubCategory {
  id: Id;
  name: string;
  imageUrl: string;
}

/** One sellable size of a product ("1kg", "500g"). Every product has at least one. */
export interface Variant {
  id: Id;
  label: string;
  price: number;
  mrp?: number;
  imageUrl?: string;
  /** Units in stock at the selected store. */
  stock: number;
}

export interface Product {
  id: Id;
  /** Sub-category the product is listed under. */
  categoryId: Id;
  /** Multi-language name, e.g. "అల్లం | Allam | अदरक | Ginger". */
  name: string;
  /** Optional grey line under the name (e.g. "Classmate 300 pages"). */
  subtitle?: string;
  imageUrl: string;
  itemType: ItemType;
  /** Variants in display order; the first is the default shown on cards. */
  variants: Variant[];
  /** Exempt categories (meat) do not count toward coupon minimums. */
  couponExempt: boolean;
}

/** A line in the cart. Quantity limits are enforced by `limits.ts`. */
export interface CartLine {
  productId: Id;
  variantId: Id;
  qty: number;
  /** Epoch ms; the cart shows the most recently added line first. */
  addedAt: number;
}

export interface Banner {
  id: Id;
  imageUrl: string;
  /** Home tile (category) the banner opens, if any. */
  targetTileId?: Id;
}

export interface Coupon {
  code: string;
  /** "₹50 Limited Offer" */
  title: string;
  /** Discount in rupees. */
  discount: number;
  /** Minimum order value, counting only non-exempt items. */
  minOrder: number;
}

/** The three preset chips; "Other" lets the user type their own label ("Save as"). */
export type AddressLabel = 'Home' | 'Work' | 'Hotel';

export interface Address {
  id: Id;
  /** "Home", "Work", "Hotel" or the user's own label. */
  label: string;
  /** Address text from the map pin. */
  text: string;
  houseNo: string;
  landmark?: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
}

export interface User {
  id: Id;
  name: string;
  /** 10-digit Indian mobile number without +91. */
  phone: string;
}

export interface Store {
  id: Id;
  name: string;
  lat: number;
  lng: number;
  deliveryRadiusKm: number;
  /** "6:00 AM" */
  openTime: string;
  /** "12:00 AM" (midnight) */
  closeTime: string;
}

/** Packing profile per item type (from the live "delivery-eta-settings"). */
export interface EtaProfile {
  itemType: ItemType;
  packingMinutes: number;
  /** The number shown on product chips ("15 MINS", "30 MINS"). */
  maxMinutes: number;
  /** Minutes added on the tracking page (site default: 5 for groceries and print, 18 for meat and food). */
  trackingBufferMinutes?: number;
}

export interface EtaSettings {
  minutesPerKm: number;
  profiles: EtaProfile[];
}

export interface AppConfig {
  /** Delivery and platform fee rules (pricing.ts). */
  pricing: PricingSettings;
  tipOptions: number[];
  minCustomTip: number;
  maxCustomTip: number;
  maxUnitsPerProduct: number;
  eta: EtaSettings;
  /** Rolling words in the home search placeholder. */
  searchHints: string[];
  /** Number in "Contact customer support to cancel" (DECISIONS D-71: ours, not the live company's). */
  supportPhone?: string;
}
