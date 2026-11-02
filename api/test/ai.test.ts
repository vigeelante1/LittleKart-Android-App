import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import type { FetchLike } from '@littlekart/shared';

const post = (app: Awaited<ReturnType<typeof buildApp>>, messages: unknown) =>
  app.inject({ method: 'POST', url: '/ai/chat', payload: { messages } });

describe('Ask AI API', () => {
  it('answers from the built-in recipes without a key', async () => {
    const app = await buildApp({ ai: { apiKey: undefined } });
    const res = await post(app, [{ role: 'assistant', text: 'What are you preparing?' }, { role: 'user', text: 'chicken curry for 4 people' }]);
    expect(res.statusCode).toBe(200);
    const body = res.json() as { source: string; items: { productId: string }[] };
    expect(body.source).toBe('builtin');
    expect(body.items.map((i) => i.productId)).toContain('chicken-curry-skinless');
  });

  it('uses Gemini with the server key and checks its answer', async () => {
    let sentKey = '';
    const fetchFn: FetchLike = async (_url, init) => {
      sentKey = init.headers['x-goog-api-key'] ?? '';
      const text = JSON.stringify({ reply: 'Sure', language: 'en', items: [{ productId: 'onion', variantId: 'onion-1', qty: 2 }, { productId: 'fake', variantId: 'x', qty: 1 }], extras: [], unavailable: [] });
      return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) };
    };
    const app = await buildApp({ ai: { apiKey: 'server-key', fetchFn } });
    const body = (await post(app, [{ role: 'user', text: 'onion pakoda' }])).json() as { source: string; items: unknown[] };
    expect(sentKey).toBe('server-key');
    expect(body).toMatchObject({ source: 'gemini', items: [{ productId: 'onion', variantId: 'onion-1', qty: 2 }] });
  });

  it('needs a user message and limits how often one address may ask', async () => {
    const app = await buildApp({ ai: { apiKey: undefined, limit: 2 } });
    expect((await post(app, [])).statusCode).toBe(400);
    expect((await post(app, [{ role: 'user', text: 'tea' }])).statusCode).toBe(200);
    expect((await post(app, [{ role: 'user', text: 'tea' }])).statusCode).toBe(429);
  });
});
