import { create } from 'zustand';

interface UiState {
  /** "+ Add New Address" was opened from the location dialog: show the dialog again when back (site behaviour). */
  reopenLocationDialog: boolean;
  setReopenLocationDialog: (value: boolean) => void;
  /** The user whose cart has been joined with the server's cart (null before that or when signed out). */
  cartSyncedFor: string | null;
  setCartSyncedFor: (userId: string | null) => void;
}

/** Small cross-screen UI flags. Not persisted. */
export const useUiStore = create<UiState>()((set) => ({
  reopenLocationDialog: false,
  setReopenLocationDialog: (value) => set({ reopenLocationDialog: value }),
  cartSyncedFor: null,
  setCartSyncedFor: (userId) => set({ cartSyncedFor: userId }),
}));
