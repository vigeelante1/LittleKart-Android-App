// Login rules, copied from the live login page (littlekart.com, mobile_login).

export const OTP_LENGTH = 4;
export const OTP_RESEND_SECONDS = 60;

/** Indian mobile: 10 digits starting with 6–9. */
export function isValidIndianMobile(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

/** The phone field keeps digits only, at most 10. */
export function sanitizePhoneInput(text: string): string {
  return text.replace(/\D/g, '').slice(0, 10);
}

/** The name field keeps letters and spaces only. */
export function sanitizeNameInput(text: string): string {
  return text.replace(/[^A-Za-z\s]/g, '');
}

/**
 * Applies typed or pasted text to the OTP boxes, like the live page:
 * a 4-digit run anywhere in the text fills every box; otherwise the digits go from `index` onwards.
 * Returns the new boxes and the box that should get focus.
 */
export function applyOtpInput(boxes: readonly string[], index: number, text: string): { boxes: string[]; focus: number } {
  const run = text.match(new RegExp(`\\d{${OTP_LENGTH}}`));
  const digits = (run ? run[0] : text.replace(/\D/g, '')).slice(0, boxes.length);
  const next = [...boxes];
  if (!digits) {
    next[index] = '';
    return { boxes: next, focus: index };
  }
  if (digits.length > 1) {
    digits.split('').forEach((d, i) => {
      next[i] = d;
    });
    return { boxes: next, focus: boxes.length - 1 };
  }
  next[index] = digits;
  return { boxes: next, focus: Math.min(index + 1, boxes.length - 1) };
}

/** "0:56" */
export function formatCountdown(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export type OtpPurpose = 'login' | 'signup';

/** Error codes shared by the API and the app. */
export type AuthErrorCode =
  | 'invalid_phone_number'
  | 'invalid_otp'
  | 'otp_session_missing'
  | 'rate_limited'
  | 'otp_not_configured'
  | 'name_required';
