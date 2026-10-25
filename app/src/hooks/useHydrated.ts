import { useSyncExternalStore } from 'react';

interface PersistApi {
  persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void };
}

/** True once a persisted Zustand store has loaded its saved state from the phone. */
export function useHydrated(store: PersistApi): boolean {
  return useSyncExternalStore(
    (onChange) => store.persist.onFinishHydration(onChange),
    () => store.persist.hasHydrated(),
  );
}
