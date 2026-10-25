import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './storage';

/** The delivery location shown in "Delivering to:" and used for stock and delivery time. */
export interface DeliveryLocation {
  /** Short name shown in orange (the saved address's name, e.g. "SV"). Empty for a picked point. */
  label: string;
  addressLabel?: string;
  text: string;
  lat: number;
  lng: number;
}

interface LocationState {
  selected: DeliveryLocation | null;
  select: (location: DeliveryLocation) => void;
  clear: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selected: null,
      select: (location) => set({ selected: location }),
      clear: () => set({ selected: null }),
    }),
    { name: 'lk-location', storage: persistStorage, version: 1 },
  ),
);
