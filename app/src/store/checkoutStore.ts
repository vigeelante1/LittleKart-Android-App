import type { Bill, DeliverySlot } from '@littlekart/shared';
import { create } from 'zustand';
import type { ResolvedLine } from '@/hooks/useCartProducts';

/** What the cart hands to the payment page ("Proceed To Pay"), like the site's navigation state. */
export interface CheckoutSnapshot {
  items: ResolvedLine[];
  bill: Bill;
  tip: number;
  couponCode: string | null;
  /** When Proceed To Pay was tapped ("Order Date" on the payment page). */
  orderDate: number;
  /** Scheduled delivery chosen while the store is closed (D-103). */
  slot?: DeliverySlot;
}

interface CheckoutState {
  snapshot: CheckoutSnapshot | null;
  start: (snapshot: CheckoutSnapshot) => void;
  setSlot: (slot: DeliverySlot) => void;
  clear: () => void;
}

/** Not persisted: like the site, reopening the app without it sends the payment page back home. */
export const useCheckoutStore = create<CheckoutState>()((set) => ({
  snapshot: null,
  start: (snapshot) => set({ snapshot }),
  setSlot: (slot) => set(({ snapshot }) => (snapshot ? { snapshot: { ...snapshot, slot } } : {})),
  clear: () => set({ snapshot: null }),
}));
