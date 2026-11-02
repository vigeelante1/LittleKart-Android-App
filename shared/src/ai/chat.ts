// One turn of the "Ask AI" chat (D-102): Gemini when a key is set and it answers, else the built-in recipe list.
import type { Product } from '../types';
import { builtinReply } from './builtin';
import { askGemini, type FetchLike } from './gemini';
import type { AiMessage, AiReply } from './types';

/** Longest message and history the assistant takes. */
export const MAX_AI_MESSAGE = 500;
export const MAX_AI_HISTORY = 20;

/** Trims the chat to what is sent: real messages only, the latest MAX_AI_HISTORY, each at most MAX_AI_MESSAGE long. */
export function tidyMessages(messages: readonly unknown[]): AiMessage[] {
  const out: AiMessage[] = [];
  for (const m of messages) {
    if (!m || typeof m !== 'object') continue;
    const { role, text, items, extras } = m as Partial<AiMessage>;
    if ((role !== 'user' && role !== 'assistant') || typeof text !== 'string' || !text.trim()) continue;
    out.push({
      role,
      text: text.trim().slice(0, MAX_AI_MESSAGE),
      ...(role === 'assistant' && Array.isArray(items) ? { items: items.slice(0, 40) } : {}),
      ...(role === 'assistant' && Array.isArray(extras) ? { extras: extras.slice(0, 5) } : {}),
    });
  }
  return out.slice(-MAX_AI_HISTORY);
}

export async function aiChat(
  messages: readonly AiMessage[],
  products: readonly Product[],
  options: { apiKey?: string; fetchFn?: FetchLike } = {},
): Promise<AiReply> {
  const chat = tidyMessages(messages);
  if (options.apiKey) {
    try {
      return await askGemini(chat, products, options.apiKey, options.fetchFn);
    } catch {
      // Falls through to the built-in list (no network, free-tier limit reached, model busy).
    }
  }
  return builtinReply(chat, products);
}
