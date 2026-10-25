import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { OtpStore } from '../src/auth/otpStore.js';

const PHONE = '9876543210';

async function appWith(reviewPhones: string[] = ['*'], now?: () => number) {
  return buildApp({ auth: { reviewPhones: new Set(reviewPhones), reviewOtp: '1234', otpStore: new OtpStore(now) } });
}

describe('login API', () => {
  it('signs up a new number with a name, then knows it', async () => {
    const app = await appWith();
    expect((await app.inject({ method: 'GET', url: `/customers/${PHONE}` })).json()).toEqual({ exists: false, name: '' });

    const send = await app.inject({ method: 'POST', url: '/auth/otp/send', payload: { phone: PHONE, purpose: 'signup' } });
    expect(send.statusCode).toBe(204);

    const verify = await app.inject({
      method: 'POST',
      url: '/auth/otp/verify',
      payload: { phone: PHONE, otp: '1234', purpose: 'signup', name: 'SV' },
    });
    expect(verify.statusCode).toBe(200);
    const body = verify.json() as { user: { phone: string; name: string }; token: string };
    expect(body.user).toMatchObject({ phone: PHONE, name: 'SV' });

    const me = await app.inject({ method: 'GET', url: '/me', headers: { authorization: `Bearer ${body.token}` } });
    expect(me.json()).toMatchObject({ name: 'SV' });
    expect((await app.inject({ method: 'GET', url: `/customers/${PHONE}` })).json()).toEqual({ exists: true, name: 'SV' });
  });

  it('rejects a wrong code, then accepts the right one', async () => {
    const app = await appWith();
    await app.inject({ method: 'POST', url: '/auth/otp/send', payload: { phone: PHONE, purpose: 'signup' } });
    const wrong = await app.inject({ method: 'POST', url: '/auth/otp/verify', payload: { phone: PHONE, otp: '0000', purpose: 'signup', name: 'A' } });
    expect(wrong.json()).toEqual({ error: 'invalid_otp' });
    const right = await app.inject({ method: 'POST', url: '/auth/otp/verify', payload: { phone: PHONE, otp: '1234', purpose: 'signup', name: 'A' } });
    expect(right.statusCode).toBe(200);
  });

  it('requires a name for a new account', async () => {
    const app = await appWith();
    await app.inject({ method: 'POST', url: '/auth/otp/send', payload: { phone: PHONE, purpose: 'signup' } });
    const res = await app.inject({ method: 'POST', url: '/auth/otp/verify', payload: { phone: PHONE, otp: '1234', purpose: 'signup', name: '' } });
    expect(res.json()).toEqual({ error: 'name_required' });
  });

  it('enforces the 60-second resend timer', async () => {
    let now = 1_000_000;
    const app = await appWith(['*'], () => now);
    const send = () => app.inject({ method: 'POST', url: '/auth/otp/send', payload: { phone: PHONE, purpose: 'login' } });
    expect((await send()).statusCode).toBe(204);
    expect((await send()).json()).toEqual({ error: 'rate_limited' });
    now += 60_000;
    expect((await send()).statusCode).toBe(204);
  });

  it('rejects invalid numbers and numbers outside review mode', async () => {
    const app = await appWith(['9999999999']);
    const bad = await app.inject({ method: 'POST', url: '/auth/otp/send', payload: { phone: '12345', purpose: 'login' } });
    expect(bad.json()).toEqual({ error: 'invalid_phone_number' });
    const notReview = await app.inject({ method: 'POST', url: '/auth/otp/send', payload: { phone: PHONE, purpose: 'login' } });
    expect(notReview.json()).toEqual({ error: 'otp_not_configured' });
  });

  it('expires the code after 5 wrong tries', async () => {
    const app = await appWith();
    await app.inject({ method: 'POST', url: '/auth/otp/send', payload: { phone: PHONE, purpose: 'signup' } });
    for (let i = 0; i < 5; i += 1) {
      await app.inject({ method: 'POST', url: '/auth/otp/verify', payload: { phone: PHONE, otp: '0000', purpose: 'signup', name: 'A' } });
    }
    const after = await app.inject({ method: 'POST', url: '/auth/otp/verify', payload: { phone: PHONE, otp: '1234', purpose: 'signup', name: 'A' } });
    expect(after.json()).toEqual({ error: 'otp_session_missing' });
  });
});
