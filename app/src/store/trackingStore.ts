import type { Order } from '@littlekart/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './storage';

interface TrackingState {
  /** The order shown on the floating tracking card (site: tracking.active). */
  active: Order | null;
  setActive: (order: Order | null) => void;
}

export const useTrackingStore = create<TrackingState>()(
  persist(
    (set) => ({
      active: null,
      setActive: (order) => set({ active: order }),
    }),
    { name: 'lk-tracking', storage: persistStorage, version: 1 },
  ),
);
