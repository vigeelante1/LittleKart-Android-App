// Delivery time, as the live app computes it (littlekart.com, read 23 Oct 2026; DECISIONS D-39).
// - Product cards show the item type's maxMinutes ("15 MINS" / "30 MINS").
// - The home header picks the slowest item type in the cart (by maxMinutes, then packingMinutes) and:
//     groceries ("product"):  15 + (round(distance × 1000) mod 6)  → 15–20 minutes
//     anything else:          round up to 5 of max(ceil(distance × minutesPerKm) + packing, packing)
import type { EtaProfile, EtaSettings, ItemType } from './types';

/** The live server's settings (GET /api/public/delivery-eta-settings). */
export const DEFAULT_ETA_SETTINGS: EtaSettings = {
  minutesPerKm: 3,
  profiles: [
    { itemType: 'food', packingMinutes: 25, maxMinutes: 30 },
    { itemType: 'meat', packingMinutes: 25, maxMinutes: 30 },
    { itemType: 'print', packingMinutes: 3, maxMinutes: 15 },
    { itemType: 'product', packingMinutes: 3, maxMinutes: 15 },
  ],
};

export function profileFor(settings: EtaSettings, itemType: ItemType): EtaProfile {
  return (
    settings.profiles.find((p) => p.itemType === itemType) ??
    settings.profiles.find((p) => p.itemType === 'product') ?? { itemType, packingMinutes: 3, maxMinutes: 15 }
  );
}

/** Minutes on a product's ETA chip. */
export function chipMinutes(settings: EtaSettings, itemType: ItemType): number {
  return profileFor(settings, itemType).maxMinutes;
}

/** The slowest profile among the cart's item types ("product" when the cart is empty). */
export function slowestProfile(settings: EtaSettings, itemTypes: readonly ItemType[]): EtaProfile {
  const types: readonly ItemType[] = itemTypes.length > 0 ? itemTypes : ['product'];
  let best = profileFor(settings, types[0] ?? 'product');
  for (const type of types) {
    const p = profileFor(settings, type);
    if (p.maxMinutes > best.maxMinutes || (p.maxMinutes === best.maxMinutes && p.packingMinutes > best.packingMinutes)) {
      best = p;
    }
  }
  return best;
}

/** Minutes in "Delivery in about N minutes". Null when the distance is unknown. */
export function headerMinutes(settings: EtaSettings, distanceKm: number | null, itemTypes: readonly ItemType[]): number | null {
  if (distanceKm === null || !Number.isFinite(distanceKm) || distanceKm < 0) return null;
  const profile = slowestProfile(settings, itemTypes);
  if (profile.itemType === 'product') return 15 + (Math.abs(Math.round(distanceKm * 1000)) % 6);
  const travel = Math.ceil(distanceKm * settings.minutesPerKm);
  return 5 * Math.ceil(Math.max(travel + profile.packingMinutes, profile.packingMinutes) / 5);
}

/** Great-circle distance in km. */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const DEFAULT_TRACKING_BUFFER: Record<ItemType, number> = { product: 5, print: 5, meat: 18, food: 18 };

/**
 * "Arriving in N minutes" on the tracking page before a partner is assigned (site: store → address distance):
 * ceil(ceil(km × minutesPerKm) + buffer), capped at the slowest item type's maxMinutes; groceries win unless
 * the order has meat or food.
 */
export function trackingMinutes(settings: EtaSettings, distanceKm: number, itemTypes: readonly ItemType[]): number {
  const special = itemTypes.filter((t) => t !== 'product' && t !== 'print');
  const profile = slowestProfile(settings, special.length > 0 ? special : ['product']);
  const buffer = profile.trackingBufferMinutes ?? DEFAULT_TRACKING_BUFFER[profile.itemType] ?? 5;
  const minutes = Math.max(1, Math.ceil(Math.ceil(Math.max(0, distanceKm) * settings.minutesPerKm) + buffer));
  return profile.maxMinutes > 0 ? Math.min(minutes, profile.maxMinutes) : minutes;
}
