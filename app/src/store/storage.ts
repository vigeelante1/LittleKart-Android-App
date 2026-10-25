import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Device storage for persisted stores (cart, login, delivery location). */
export const persistStorage = createJSONStorage(() => AsyncStorage);
