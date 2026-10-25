// Add / Edit Address form rules, as on littlekart.com (address modal, read 24 Oct 2026).
import type { Address } from './types';

export const ADDRESS_PRESETS = ['Home', 'Work', 'Hotel'] as const;

/** Keeps the last 10 digits typed; a pasted "+91…" or "91…" number loses its country code. */
export function normalizeAddressPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits.slice(0, 10);
}

/** The name field accepts letters and spaces only. */
export function filterAddressName(input: string): string {
  return input.replace(/[^A-Za-z\s]/g, '');
}

export interface AddressForm {
  label: string;
  /** Address text from the map pin; empty when the pin is not deliverable. */
  text: string;
  houseNo: string;
  landmark: string;
  name: string;
  phone: string;
}

export type AddressFormErrors = Partial<Record<'label' | 'houseNo' | 'name' | 'phone' | 'text', string>>;

/** The live form's checks and messages. */
export function validateAddressForm(form: AddressForm): AddressFormErrors {
  const errors: AddressFormErrors = {};
  if (!form.label.trim()) errors.label = 'Please select an address type.';
  if (!form.houseNo.trim()) errors.houseNo = 'House / Flat / Building is required';
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!/^[6-9]\d{9}$/.test(normalizeAddressPhone(form.phone))) errors.phone = 'Enter a valid 10-digit Indian mobile number';
  if (!form.text.trim()) errors.text = 'Valid address selection is required';
  return errors;
}

export const DUPLICATE_LABEL_MESSAGE =
  'You already have an address with this label. Choose a different label (for example Other) to save this address, or ask the backend to allow several addresses with the same label.';

/** Labels are compared without regard to case or spaces ("home" = "Home"). */
export function sameLabel(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** True when another saved address already uses this label. */
export function labelTaken(addresses: readonly Address[], label: string, exceptId?: string): boolean {
  return addresses.some((a) => a.id !== exceptId && sameLabel(a.label, label));
}
