// One-time codes, kept hashed with an expiry (DECISIONS D-12).
// In-memory version (tests and runs without a database). The PostgreSQL version in data/pg.ts follows the same rules.
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { OTP_LENGTH, OTP_RESEND_SECONDS } from '@littlekart/shared';

export const OTP_TTL_MS = 5 * 60 * 1000;
export const MAX_VERIFY_ATTEMPTS = 5;
export const MAX_SENDS_PER_HOUR = 5;

interface Entry {
  hash: Buffer;
  salt: string;
  expiresAt: number;
  attempts: number;
}

const hashCode = (code: string, salt: string) => createHash('sha256').update(`${salt}:${code}`).digest();

import type { CheckResult, IssueResult, OtpStore as OtpStoreContract } from '../data/types.js';

export type { CheckResult, IssueResult };

export class OtpStore implements OtpStoreContract {
  private readonly entries = new Map<string, Entry>();
  private readonly sends = new Map<string, number[]>();

  constructor(private readonly now: () => number = Date.now) {}

  /** Creates a code for this phone. `fixedCode` is used in review mode instead of a random one. */
  async issue(phone: string, fixedCode?: string): Promise<IssueResult> {
    const now = this.now();
    const recent = (this.sends.get(phone) ?? []).filter((t) => now - t < 60 * 60 * 1000);
    const last = recent[recent.length - 1];
    if (last !== undefined && now - last < OTP_RESEND_SECONDS * 1000) return { ok: false, reason: 'cooldown' };
    if (recent.length >= MAX_SENDS_PER_HOUR) return { ok: false, reason: 'hourly_limit' };
    const code = fixedCode ?? String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');
    const salt = randomBytes(8).toString('hex');
    this.entries.set(phone, { hash: hashCode(code, salt), salt, expiresAt: now + OTP_TTL_MS, attempts: 0 });
    this.sends.set(phone, [...recent, now]);
    return { ok: true, code };
  }

  /** Checks a code. A correct code is used up; 5 wrong tries or expiry removes the session. */
  async check(phone: string, code: string): Promise<CheckResult> {
    const entry = this.entries.get(phone);
    if (!entry || entry.expiresAt < this.now()) {
      this.entries.delete(phone);
      return 'missing';
    }
    const candidate = hashCode(code, entry.salt);
    if (candidate.length === entry.hash.length && timingSafeEqual(candidate, entry.hash)) {
      this.entries.delete(phone);
      return 'ok';
    }
    entry.attempts += 1;
    if (entry.attempts >= MAX_VERIFY_ATTEMPTS) this.entries.delete(phone);
    return 'wrong';
  }
}
