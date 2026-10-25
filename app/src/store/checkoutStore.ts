import type { Bill } from '@littlekart/shared';
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
}

interface CheckoutState {
  snapshot: CheckoutSnapshot | null;
  start: (snapshot: CheckoutSnapshot) => void;
  clear: () => void;
}

/** Not persisted: like the site, reopening the app without it sends the payment page back home. */
export const useCheckoutStore = create<CheckoutState>()((set) => ({
  snapshot: null,
  start: (snapshot) => set({ snapshot }),
  clear: () => set({ snapshot: null }),
}));
