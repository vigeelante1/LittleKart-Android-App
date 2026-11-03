import { create } from 'zustand';

/** Whether the "Add to your order" sheet is open (D-105). Not saved. */
export const useAddOnStore = create<{ open: boolean; setOpen: (open: boolean) => void }>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
