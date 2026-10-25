// Bearer-token helpers shared by the routes that need a signed-in customer.
import type { User } from '@littlekart/shared';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AccountStore } from '../data/types.js';

export const bearer = (request: FastifyRequest) => {
  const header = request.headers.authorization ?? '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
};

/** The signed-in customer, or a 401 reply (then returns undefined and the route should stop). */
export async function requireUser(request: FastifyRequest, reply: FastifyReply, accounts: AccountStore): Promise<User | undefined> {
  const user = await accounts.userForToken(bearer(request));
  if (!user) {
    await reply.code(401).send({ error: 'unauthorized' });
    return undefined;
  }
  return user;
}
