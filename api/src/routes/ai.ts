// Ask AI (iteration 2, DECISIONS D-102).
//   POST /ai/chat  { messages: AiMessage[] }  → AiReply
// The Gemini key stays on the server (GEMINI_API_KEY). Without a key, or when Gemini fails, the built-in
// recipe list answers. Each address may send 30 messages per 10 minutes, to keep inside the free tier.
import { aiChat, tidyMessages, type FetchLike } from '@littlekart/shared';
import type { FastifyInstance } from 'fastify';
import type { CatalogStore } from '../data/types.js';

export interface AiOptions {
  apiKey?: string;
  fetchFn?: FetchLike;
  /** Messages per address per window (default 30 per 10 minutes). */
  limit?: number;
  windowMs?: number;
}

export async function aiRoutes(app: FastifyInstance, options: AiOptions & { catalog: CatalogStore }) {
  const limit = options.limit ?? 30;
  const windowMs = options.windowMs ?? 10 * 60 * 1000;
  const hits = new Map<string, number[]>();

  app.post<{ Body: { messages?: unknown } }>('/ai/chat', async (req, reply) => {
    const now = Date.now();
    const recent = (hits.get(req.ip) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) return reply.code(429).send({ error: 'too_many_messages' });
    hits.set(req.ip, [...recent, now]);
    if (hits.size > 10000) hits.clear();

    const messages = tidyMessages(Array.isArray(req.body?.messages) ? req.body.messages : []);
    if (messages[messages.length - 1]?.role !== 'user') return reply.code(400).send({ error: 'needs_a_message' });
    return aiChat(messages, await options.catalog.all(), { apiKey: options.apiKey, fetchFn: options.fetchFn });
  });
}
