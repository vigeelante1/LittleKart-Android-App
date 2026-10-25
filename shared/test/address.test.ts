import { describe, expect, it } from 'vitest';
import { filterAddressName, labelTaken, normalizeAddressPhone, validateAddressForm } from '../src/address';

const ok = { label: 'Home', text: 'Bus stand, Nalgonda', houseNo: '12-3', landmark: '', name: 'SV', phone: '9718141441' };

describe('address form', () => {
  it('accepts a complete form', () => {
    expect(validateAddressForm(ok)).toEqual({});
  });

  it('gives the live messages for missing fields', () => {
    expect(validateAddressForm({ ...ok, label: '', houseNo: ' ', name: '', phone: '12345', text: '' })).toEqual({
      label: 'Please select an address type.',
      houseNo: 'House / Flat / Building is required',
      name: 'Name is required',
      phone: 'Enter a valid 10-digit Indian mobile number',
      text: 'Valid address selection is required',
    });
  });

  it('cleans phone and name input', () => {
    expect(normalizeAddressPhone('+91 97181 41441')).toBe('9718141441');
    expect(normalizeAddressPhone('97181414419999')).toBe('9718141441');
    expect(filterAddressName('S.V. 2')).toBe('SV ');
  });

  it('finds a label already in use', () => {
    const saved = [{ id: 'a1', label: 'Home', text: '', houseNo: '', name: '', phone: '', lat: 0, lng: 0 }];
    expect(labelTaken(saved, 'home')).toBe(true);
    expect(labelTaken(saved, 'home', 'a1')).toBe(false);
    expect(labelTaken(saved, 'Work')).toBe(false);
  });
});
