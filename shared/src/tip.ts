// Delivery-partner tip, as the live cart handles it (littlekart.com cart, read 23 Oct 2026).

export const TIP_OPTIONS = [10, 20, 30] as const;
/** The custom field accepts 10 to 1000 (the live input's min/max). */
export const CUSTOM_TIP_MIN = 10;
export const CUSTOM_TIP_MAX = 1000;

export interface TipState {
  /** The selected preset chip, if any. */
  preset: number | null;
  /** The custom amount row is open (it replaces the chips). */
  customOpen: boolean;
  /** Digits typed in the custom field. */
  customText: string;
  /** Rupees added to the bill. */
  amount: number;
}

export const NO_TIP: TipState = { preset: null, customOpen: false, customText: '', amount: 0 };

/** Tapping ₹10/₹20/₹30: selects it, or clears it when it is already selected. */
export function tapPreset(state: TipState, value: number): TipState {
  if (state.preset === value) return { ...state, preset: null, amount: 0 };
  return { preset: value, customOpen: false, customText: '', amount: value };
}

/** "Custom" opens the field (and drops any tip); the × closes it and clears the field. */
export function toggleCustom(state: TipState): TipState {
  if (state.customOpen) return { ...state, customOpen: false, customText: '', amount: 0 };
  return { ...state, customOpen: true, preset: null, amount: 0 };
}

/** Typing in the custom field: digits only, capped at 1000; amounts under 10 add nothing yet. */
export function typeCustom(state: TipState, text: string): TipState {
  if (text === '') return { ...state, customText: '', amount: 0 };
  if (!/^\d+$/.test(text)) return state;
  const value = Math.min(Number(text), CUSTOM_TIP_MAX);
  return { ...state, customText: String(value), amount: value < CUSTOM_TIP_MIN ? 0 : value };
}

export function canApplyCustom(state: TipState): boolean {
  const value = Number(state.customText);
  return state.customText !== '' && value >= CUSTOM_TIP_MIN && value <= CUSTOM_TIP_MAX;
}

/** "Apply" closes the field and keeps the amount. */
export function applyCustom(state: TipState): TipState {
  return { ...state, customOpen: false, preset: null };
}
