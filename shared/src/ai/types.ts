// "Ask AI" meal planner (iteration 2, DECISIONS D-102): types shared by the app and the API.
import type { Id } from '../types';

export interface AiMessage {
  role: 'user' | 'assistant';
  text: string;
  /** Assistant turns: the list it suggested, so the next turn can change it ("I already have rice"). */
  items?: AiItem[];
  extras?: AiItem[];
}

/** One product line the assistant suggests. */
export interface AiItem {
  productId: Id;
  variantId: Id;
  qty: number;
  /** Short reason or use, e.g. "for the gravy". */
  note?: string;
}

export interface AiReply {
  /** Message shown in the chat, in the user's language (English or Telugu). */
  text: string;
  language: 'en' | 'te';
  dish?: string;
  servings?: number;
  /** Ingredients for the dish, ticked by default. */
  items: AiItem[];
  /** "Goes well with" extras, never ticked by default (empty when the user doesn't want suggestions). */
  extras: AiItem[];
  /** Ingredients the shop doesn't sell (named, never invented as products). */
  unavailable: string[];
  /** Who answered: Gemini, or the built-in recipe list when Gemini isn't available. */
  source: 'gemini' | 'builtin';
}
