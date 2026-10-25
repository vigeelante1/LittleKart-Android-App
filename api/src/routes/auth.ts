// Login endpoints. Codes and messages match the live app's login page.
//   GET  /customers/:phone   → { exists, name }
//   POST /auth/otp/send      { phone, purpose }              → 204
//   POST /auth/otp/verify    { phone, otp, purpose, name }   → { user, token }
//   POST /auth/logout        (Bearer token)                  → 204
//   GET  /me                 (Bearer token)                  → User
import { isValidIndianMobile, OTP_LENGTH, sanitizeNameInput, type AuthErrorCode } from '@littlekart/shared';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { AccountStore, OtpStore } from '../data/types.js';
import { bearer } from './session.js';

export interface AuthOptions {
  /** Numbers that log in with `reviewOtp` and get no SMS. "*" = every number (review mode, DECISIONS D-12). */
  reviewPhones: ReadonlySet<string>;
  reviewOtp: string;
  otps: OtpStore;
  accounts: AccountStore;
}

const fail = (reply: FastifyReply, status: number, error: AuthErrorCode) => reply.code(status).send({ error });

const sendBody = z.object({ phone: z.string(), purpose: z.enum(['login', 'signup']) });
const verifyBody = z.object({
  phone: z.string(),
  otp: z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`)),
  purpose: z.enum(['login', 'signup']),
  name: z.string().max(80).default(''),
});

export async function authRoutes(app: FastifyInstance, options: AuthOptions) {
  const { otps, accounts } = options;
  const isReviewPhone = (phone: string) => options.reviewPhones.has('*') || options.reviewPhones.has(phone);

  app.get<{ Params: { phone: string } }>('/customers/:phone', async (request, reply) => {
    const { phone } = request.params;
    if (!isValidIndianMobile(phone)) return fail(reply, 400, 'invalid_phone_number');
    const user = await accounts.findByPhone(phone);
    return { exists: !!user, name: user?.name ?? '' };
  });

  app.post('/auth/otp/send', async (request, reply) => {
    const parsed = sendBody.safeParse(request.body);
    if (!parsed.success || !isValidIndianMobile(parsed.data.phone)) return fail(reply, 400, 'invalid_phone_number');
    const { phone } = parsed.data;
    // No SMS provider yet (free tier, D-05): only review numbers can receive a code.
    if (!isReviewPhone(phone)) return fail(reply, 503, 'otp_not_configured');
    const issued = await otps.issue(phone, options.reviewOtp);
    if (!issued.ok) return fail(reply, 429, 'rate_limited');
    return reply.code(204).send();
  });

  app.post('/auth/otp/verify', async (request, reply) => {
    const parsed = verifyBody.safeParse(request.body);
    if (!parsed.success) return fail(reply, 400, 'invalid_otp');
    const { phone, otp } = parsed.data;
    const name = sanitizeNameInput(parsed.data.name).trim();
    if (!isValidIndianMobile(phone)) return fail(reply, 400, 'invalid_phone_number');
    const existing = await accounts.findByPhone(phone);
    // A new account needs a name (the live app asks for "Full Name").
    if (!name && !existing?.name) return fail(reply, 400, 'name_required');
    const result = await otps.check(phone, otp);
    if (result === 'missing') return fail(reply, 400, 'otp_session_missing');
    if (result === 'wrong') return fail(reply, 400, 'invalid_otp');
    const user = await accounts.upsert(phone, name);
    return { user, token: await accounts.createSession(user) };
  });

  app.post('/auth/logout', async (request, reply) => {
    const token = bearer(request);
    if (token) await accounts.endSession(token);
    return reply.code(204).send();
  });

  app.get('/me', async (request, reply) => {
    const user = await accounts.userForToken(bearer(request));
    if (!user) return reply.code(401).send({ error: 'unauthorized' });
    return user;
  });
}
