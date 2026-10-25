// Login flow, step for step as the live page (littlekart.com, mobile_login):
// phone → (lookup) → existing user: send OTP | new user: ask Full Name, "Send OTP" → OTP step (60 s resend timer,
// auto-verify on the 4th digit) → "Logged in successfully!" for 2 s → Home.
import {
  applyOtpInput,
  isValidIndianMobile,
  OTP_LENGTH,
  OTP_RESEND_SECONDS,
  sanitizeNameInput,
  sanitizePhoneInput,
  type OtpPurpose,
} from '@littlekart/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthError, repos } from '@/services';
import { useAuthStore } from '@/store';
import { strings } from '@/strings';

const emptyBoxes = () => Array.from({ length: OTP_LENGTH }, () => '');
const SUCCESS_DIALOG_MS = 2000;

interface Errors {
  mobile?: string;
  name?: string;
  otp?: string;
}

function sendErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    switch (error.code) {
      case 'invalid_phone_number':
        return 'Enter a valid Indian mobile number.';
      case 'rate_limited':
        return strings.login.errors.tooManyAttempts;
      case 'otp_not_configured':
        return strings.login.errors.notConfigured;
      default:
        break;
    }
  }
  return strings.login.errors.cannotSend;
}

function verifyErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    if (error.code === 'invalid_otp' || error.code === 'otp_session_missing') return strings.login.errors.incorrectOtp;
    if (error.code === 'rate_limited') return strings.login.errors.tooManyAttempts;
  }
  return strings.login.errors.verifyFailed;
}

export function useLoginFlow(onDone: () => void) {
  const signIn = useAuthStore((s) => s.signIn);

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhoneRaw] = useState('');
  const [name, setNameRaw] = useState('');
  /** The number belongs to an account with a name: log in. Otherwise sign up. */
  const [knownUser, setKnownUser] = useState(false);
  /** Show the Full Name field (new user, or account without a name). */
  const [askName, setAskName] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [boxes, setBoxes] = useState<string[]>(emptyBoxes);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [success, setSuccess] = useState(false);

  const sendingRef = useRef(false);
  const verifyingRef = useRef(false);
  const verifiedRef = useRef(false);
  const lastCodeRef = useRef('');

  const purpose: OtpPurpose = knownUser ? 'login' : 'signup';

  // Resend countdown, one tick per second while the OTP step is open.
  useEffect(() => {
    if (step !== 'otp' || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [step, countdown]);

  // After a successful login the dialog stays for 2 s, then the app moves on.
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(onDone, SUCCESS_DIALOG_MS);
    return () => clearTimeout(timer);
  }, [success, onDone]);

  const setPhone = useCallback((text: string) => {
    setPhoneRaw(sanitizePhoneInput(text));
    setNameRaw('');
    setKnownUser(false);
    setAskName(false);
    setErrors((e) => ({ ...e, mobile: undefined, name: undefined }));
  }, []);

  const setName = useCallback((text: string) => setNameRaw(sanitizeNameInput(text)), []);

  const sendOtp = useCallback(
    async (otpPurpose: OtpPurpose) => {
      if (sendingRef.current || countdown > 0) return;
      sendingRef.current = true;
      setSending(true);
      try {
        await repos.auth.sendOtp(phone.trim(), otpPurpose);
        setStep('otp');
        setCountdown(OTP_RESEND_SECONDS);
        lastCodeRef.current = '';
        setErrors((e) => ({ ...e, mobile: undefined, name: undefined }));
        setToastVisible(true);
      } catch (error) {
        setErrors((e) => ({ ...e, mobile: sendErrorMessage(error) }));
      } finally {
        sendingRef.current = false;
        setSending(false);
      }
    },
    [phone, countdown],
  );

  /** "Continue" / "Send OTP". */
  const submitPhone = useCallback(async () => {
    if (sendingRef.current || checking || countdown > 0) return;
    if (!isValidIndianMobile(phone)) {
      setErrors((e) => ({ ...e, mobile: strings.login.errors.invalidMobile }));
      return;
    }
    setErrors((e) => ({ ...e, mobile: undefined }));
    if (askName) {
      if (!name.trim()) {
        setErrors((e) => ({ ...e, name: strings.login.errors.nameRequired }));
        return;
      }
      setErrors((e) => ({ ...e, name: undefined }));
      await sendOtp('signup');
      return;
    }
    setChecking(true);
    let result: { exists: boolean; name: string };
    try {
      result = await repos.auth.lookup(phone);
    } catch {
      setErrors((e) => ({ ...e, mobile: strings.login.errors.cannotCheckUser }));
      return;
    } finally {
      setChecking(false);
    }
    if (result.exists && result.name.trim()) {
      setKnownUser(true);
      setAskName(false);
      setNameRaw(result.name.trim());
      await sendOtp('login');
      return;
    }
    setKnownUser(false);
    setAskName(true);
    setErrors((e) => ({ ...e, name: result.exists ? strings.login.errors.nameToComplete : undefined }));
  }, [askName, checking, countdown, name, phone, sendOtp]);

  const verify = useCallback(
    async (code: string) => {
      if (verifiedRef.current || verifyingRef.current) return;
      if (code.length !== OTP_LENGTH) {
        setErrors((e) => ({ ...e, otp: strings.login.errors.enterFullOtp }));
        return;
      }
      verifyingRef.current = true;
      setVerifying(true);
      try {
        const { user, token } = await repos.auth.verifyOtp({ phone: phone.trim(), otp: code, purpose, name: name.trim() });
        verifiedRef.current = true;
        setErrors({});
        signIn(user, token);
        setBoxes(emptyBoxes());
        // The live page returns to the phone step behind the success dialog (screenshot 17).
        setStep('phone');
        setSuccess(true);
      } catch (error) {
        setErrors((e) => ({ ...e, otp: verifyErrorMessage(error) }));
      } finally {
        verifyingRef.current = false;
        setVerifying(false);
      }
    },
    [name, phone, purpose, signIn],
  );

  /** Typing or pasting into OTP box `index`. Verifies automatically once all 4 digits are in. */
  const changeOtp = useCallback(
    (index: number, text: string) => {
      const next = applyOtpInput(boxes, index, text);
      setBoxes(next.boxes);
      setFocusIndex(next.focus);
      const code = next.boxes.join('');
      const complete = code.length === OTP_LENGTH && /^\d+$/.test(code);
      const previous = lastCodeRef.current;
      const wasComplete = previous.length === OTP_LENGTH;
      lastCodeRef.current = code;
      if (complete && (!wasComplete || previous !== code)) void verify(code);
    },
    [boxes, verify],
  );

  /** Backspace on an empty box moves to the previous box. */
  const backspaceOtp = useCallback(
    (index: number) => {
      if (!boxes[index] && index > 0) setFocusIndex(index - 1);
    },
    [boxes],
  );

  const resend = useCallback(async () => {
    if (sendingRef.current || resending || countdown > 0) return;
    if (!knownUser && !name.trim()) {
      setErrors((e) => ({ ...e, name: strings.login.errors.nameRequired }));
      return;
    }
    setResending(true);
    setBoxes(emptyBoxes());
    lastCodeRef.current = '';
    try {
      await sendOtp(purpose);
    } finally {
      setResending(false);
    }
    setTimeout(() => setFocusIndex(0), 100);
  }, [countdown, knownUser, name, purpose, resending, sendOtp]);

  /** Android back on the OTP step returns to the phone step, as the live page does. */
  const backToPhone = useCallback(() => {
    setStep('phone');
    setBoxes(emptyBoxes());
    lastCodeRef.current = '';
    verifyingRef.current = false;
    setErrors((e) => ({ ...e, otp: undefined }));
    setKnownUser(false);
    setAskName(false);
    setNameRaw('');
  }, []);

  const hideToast = useCallback(() => setToastVisible(false), []);

  return {
    step,
    phone,
    name,
    askName,
    errors,
    checking,
    sending,
    verifying,
    countdown,
    boxes,
    focusIndex,
    toastVisible,
    success,
    setPhone,
    setName,
    submitPhone,
    changeOtp,
    backspaceOtp,
    resend,
    backToPhone,
    hideToast,
    /** True while Continue / Send OTP must not be pressed. */
    phoneBusy: sending || checking || countdown > 0,
    resendDisabled: countdown > 0 || resending || sending || verifying,
  };
}

export type LoginFlow = ReturnType<typeof useLoginFlow>;
