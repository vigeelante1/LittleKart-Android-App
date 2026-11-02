// Calls Google Gemini (free tier) for the assistant's answer (D-102). Works in the app (sample-data mode) and the API.
import type { Product } from '../types';
import { declinedExtras } from './intent';
import { RESPONSE_SCHEMA, contentsOf, systemPrompt } from './prompt';
import { languageOf } from './builtin';
import { isTelugu } from './text';
import type { AiMessage, AiReply } from './types';
import { cleanItems, cleanStrings, notInCatalog } from './validate';

/** Fast free-tier models, tried in order (the second when the first is busy). */
export const GEMINI_MODELS = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite'] as const;
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = 20000;

export type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal }) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

export class GeminiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

const lastUserText = (messages: readonly AiMessage[]): string => [...messages].reverse().find((m) => m.role === 'user')?.text ?? '';

/** Turns Gemini's JSON text into a checked reply. */
export function parseGeminiReply(text: string, products: readonly Product[], messages: readonly AiMessage[]): AiReply {
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new GeminiError('Gemini returned something that is not JSON');
  }
  const reply = typeof raw.reply === 'string' ? raw.reply.trim() : '';
  if (!reply) throw new GeminiError('Gemini returned an empty reply');
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.text ?? '';
  const language = raw.language === 'te' || raw.language === 'en' ? raw.language : isTelugu(lastUser) ? 'te' : 'en';
  const items = cleanItems(raw.items, products);
  const extras = declinedExtras(messages) ? [] : cleanItems(raw.extras, products, new Set(items.map((i) => i.productId))).slice(0, 3);
  const servings = typeof raw.servings === 'number' && raw.servings >= 1 && raw.servings <= 50 ? Math.round(raw.servings) : undefined;
  const dish = typeof raw.dish === 'string' && raw.dish.trim() ? raw.dish.trim().slice(0, 40) : undefined;
  return {
    text: reply.slice(0, 600),
    language,
    ...(dish ? { dish } : {}),
    ...(servings ? { servings } : {}),
    items,
    extras,
    unavailable: notInCatalog(cleanStrings(raw.unavailable), products),
    source: 'gemini',
  };
}

export async function askGemini(
  messages: readonly AiMessage[],
  products: readonly Product[],
  apiKey: string,
  fetchFn: FetchLike = fetch as unknown as FetchLike,
): Promise<AiReply> {
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt(products, declinedExtras(messages), languageOf(lastUserText(messages))) }] },
    contents: contentsOf(messages, languageOf(lastUserText(messages))),
    generationConfig: { temperature: 0.3, responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA },
  });
  let lastError: unknown;
  for (const model of GEMINI_MODELS) {
    const controller = typeof AbortController === 'undefined' ? undefined : new AbortController();
    const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : undefined;
    try {
      const res = await fetchFn(`${ENDPOINT}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body,
        ...(controller ? { signal: controller.signal } : {}),
      });
      if (!res.ok) throw new GeminiError(`Gemini ${model} answered ${res.status}`, res.status);
      const data = (await res.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
      return parseGeminiReply(text, products, messages);
    } catch (e) {
      lastError = e;
      // A bad key or bad request won't get better with the other model.
      if (e instanceof GeminiError && (e.status === 400 || e.status === 401 || e.status === 403)) break;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  throw lastError instanceof Error ? lastError : new GeminiError('Gemini is not reachable');
}
