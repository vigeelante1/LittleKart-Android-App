// Customer accounts and session tokens, in memory (tests and runs without a database).
// The PostgreSQL version is in data/pg.ts.
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { User } from '@littlekart/shared';
import type { AccountStore } from '../data/types.js';

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

export class Accounts implements AccountStore {
  private readonly users = new Map<string, User>();
  /** token hash → user id. Only hashes are stored, never the token itself. */
  private readonly sessions = new Map<string, string>();

  async findByPhone(phone: string): Promise<User | undefined> {
    return this.users.get(phone);
  }

  /** Creates the account, or fills in a missing name. */
  async upsert(phone: string, name: string): Promise<User> {
    const existing = this.users.get(phone);
    if (existing) {
      if (!existing.name && name) existing.name = name;
      return existing;
    }
    const user: User = { id: randomUUID(), phone, name };
    this.users.set(phone, user);
    return user;
  }

  async createSession(user: User): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    this.sessions.set(sha256(token), user.id);
    return token;
  }

  async userForToken(token: string): Promise<User | undefined> {
    const id = this.sessions.get(sha256(token));
    if (!id) return undefined;
    for (const user of this.users.values()) if (user.id === id) return user;
    return undefined;
  }

  async endSession(token: string): Promise<void> {
    this.sessions.delete(sha256(token));
  }
}
