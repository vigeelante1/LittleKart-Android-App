import type { User } from '@littlekart/shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistStorage } from './storage';

interface AuthState {
  user: User | null;
  /** Session token from the API (empty in mock mode). Moved to encrypted storage when the real API lands. */
  token: string | null;
  signIn: (user: User, token: string) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      signIn: (user, token) => set({ user, token }),
      signOut: () => set({ user: null, token: null }),
    }),
    { name: 'lk-auth', storage: persistStorage, version: 1 },
  ),
);

export const useIsLoggedIn = () => useAuthStore((s) => s.user !== null);
