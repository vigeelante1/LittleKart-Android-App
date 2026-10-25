import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useUiStore } from '@/store';

/** Calls `open` when the screen comes back into view after "+ Add New Address" (the dialog reappears, as on the site). */
export function useReopenLocationDialog(open: () => void) {
  useFocusEffect(
    useCallback(() => {
      const { reopenLocationDialog, setReopenLocationDialog } = useUiStore.getState();
      if (!reopenLocationDialog) return;
      setReopenLocationDialog(false);
      open();
    }, [open]),
  );
}
