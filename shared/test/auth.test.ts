import { describe, expect, it } from 'vitest';
import { applyOtpInput, formatCountdown, isValidIndianMobile, sanitizeNameInput, sanitizePhoneInput } from '../src/auth';

describe('login rules', () => {
  it('accepts 10-digit numbers starting 6–9 only', () => {
    expect(isValidIndianMobile('9876543210')).toBe(true);
    expect(isValidIndianMobile('6000000000')).toBe(true);
    expect(isValidIndianMobile('5876543210')).toBe(false);
    expect(isValidIndianMobile('987654321')).toBe(false);
  });

  it('cleans the phone and name fields like the site', () => {
    expect(sanitizePhoneInput('+91 98765-43210')).toBe('9198765432');
    expect(sanitizePhoneInput('98a76')).toBe('9876');
    expect(sanitizeNameInput('S.V. Rao 2')).toBe('SV Rao ');
  });

  it('fills boxes one digit at a time and moves focus', () => {
    const r = applyOtpInput(['', '', '', ''], 0, '1');
    expect(r.boxes).toEqual(['1', '', '', '']);
    expect(r.focus).toBe(1);
  });

  it('spreads a pasted code across all boxes', () => {
    const r = applyOtpInput(['', '', '', ''], 2, 'Your OTP is 1234.');
    expect(r.boxes).toEqual(['1', '2', '3', '4']);
    expect(r.focus).toBe(3);
  });

  it('clears a box when its digit is deleted', () => {
    expect(applyOtpInput(['1', '2', '', ''], 1, '').boxes).toEqual(['1', '', '', '']);
  });

  it('formats the resend countdown', () => {
    expect(formatCountdown(56)).toBe('0:56');
    expect(formatCountdown(60)).toBe('1:00');
    expect(formatCountdown(5)).toBe('0:05');
  });
});
