// Things the code reads from the user's words itself, so they never depend on the model (D-102).
import type { AiMessage } from './types';

/** "no suggestions", "only the ingredients", "suggestions vaddu", "సూచనలు వద్దు" … */
const NO_EXTRAS =
  /\b(no|don'?t|do not|without|stop|skip)\b[^.!?]{0,25}\b(suggest|suggestions?|extras?|recommend\w*|add[- ]?ons?)\b|\bonly\s+(the\s+)?(ingredients|items|recipe|what i (asked|need))\b|\b(suggestions?|extras?)\s*(vaddu|vadhu|avasaram ledu|not needed|no thanks)\b|(సూచనలు|సజెషన్స్?|ఎక్స్‌?ట్రా\w*)\s*(వద్దు|అవసరం\s*లేదు)/i;

/** True once the user has said they don't want "goes well with" suggestions in this chat. */
export const declinedExtras = (messages: readonly AiMessage[]): boolean =>
  messages.some((m) => m.role === 'user' && NO_EXTRAS.test(m.text));
