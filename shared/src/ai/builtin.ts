// The assistant without Gemini (D-102): reads the dish, the number of people and "I already have …" from the
// chat and answers from the built-in recipe list. Same answer shape as Gemini.
import type { Id, Product } from '../types';
import { aiProducts } from './catalog';
import { declinedExtras } from './intent';
import { ING, RECIPES, lineOf, type Recipe } from './recipes';
import { isTelugu, servingsIn } from './text';
import type { AiItem, AiMessage, AiReply } from './types';
import { MAX_AI_QTY } from './validate';

/** Telugu written in English letters. */
const TENGLISH = /\b(kavali|kaavali|enti|emi|cheyyali|cheyali|vandali|vanta|mandi|mandiki|undi|unnayi|ledu|vaddu|naaku|naku|chestunna|chesthunna|vandutunna|kosam|koraku)\b/i;

export const languageOf = (text: string): 'en' | 'te' => (isTelugu(text) || TENGLISH.test(text) ? 'te' : 'en');

/** "I already have", "got", "no onions", "without", "undi", "ఉంది", "వద్దు" … (not "I have to make"). */
const HAVE_EN = /\b(already|have(?!\s+to\b)|got|i've|ive|no|without|remove|skip|except|don'?t need|do not need|minus)\b/i;
const HAVE_TE = /(undi|unnayi|unnai|vaddu|ledu\s*avasaram|ఉంది|ఉన్నాయి|ఉన్నది|వద్దు|తీసేయ|అవసరం\s*లేదు)/i;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const mentions = (text: string, word: string): boolean =>
  /^[\x20-\x7e]+$/.test(word) ? new RegExp(`\\b${escape(word)}s?\\b`, 'i').test(text) : text.includes(word);

/** Product ids the shopper said they have or don't want, across the chat. */
export function removedIds(messages: readonly AiMessage[], recipe: Recipe): Set<Id> {
  const out = new Set<Id>();
  const keys = [...recipe.items, ...recipe.extras].map((l) => lineOf(l).key);
  for (const m of messages) {
    if (m.role !== 'user') continue;
    const en = HAVE_EN.exec(m.text);
    // English: what comes after "I have"; Telugu puts "ఉంది" after the thing, so the whole message counts.
    const part = HAVE_TE.test(m.text) ? m.text : en ? m.text.slice(en.index) : '';
    if (!part) continue;
    // The dish's own words ("chicken" in "chicken biryani, I have rice") don't remove its main ingredient.
    const withoutDish = part.replace(recipe.match, ' ');
    for (const k of keys) if (ING[k].say.some((w) => mentions(withoutDish, w))) out.add(ING[k].productId);
  }
  return out;
}

function lines(recipeLines: Recipe['items'], servings: number, removed: ReadonlySet<Id>, products: ReadonlyMap<Id, Product>): AiItem[] {
  const out: AiItem[] = [];
  for (const l of recipeLines) {
    const { key, qty, scale } = lineOf(l);
    const i = ING[key];
    if (removed.has(i.productId) || out.some((o) => o.productId === i.productId)) continue;
    const p = products.get(i.productId);
    if (!p) continue;
    const need = scale ? (qty * servings) / 4 : qty * Math.max(1, Math.ceil(servings / 10));
    const useHalf = scale && i.half && need <= 0.5;
    const v = p.variants.find((x) => x.id === (useHalf ? i.half : i.variantId) && x.stock > 0) ?? p.variants.find((x) => x.stock > 0);
    if (!v) continue;
    out.push({ productId: p.id, variantId: v.id, qty: Math.max(1, Math.min(Math.ceil(useHalf ? 1 : need), MAX_AI_QTY, v.stock)) });
  }
  return out;
}

const T = {
  askDish: {
    en: 'Tell me the dish, like chicken biryani, sambar, pappu, dosa or a pooja, and I\'ll list everything you need.',
    te: 'ఏ వంటకం చేస్తున్నారో చెప్పండి, ఉదా: చికెన్ బిర్యానీ, సాంబార్, పప్పు, దోస లేదా పూజ. కావలసినవన్నీ చూపిస్తాను.',
  },
  unknown: {
    en: 'I don\'t have that one in my recipe list right now. Try a dish like biryani, chicken curry, sambar, pappu, dosa, upma or a pooja.',
    te: 'ఆ వంటకం ఇప్పుడు నా జాబితాలో లేదు. బిర్యానీ, చికెన్ కూర, సాంబార్, పప్పు, దోస, ఉప్మా లేదా పూజ లాంటివి ప్రయత్నించండి.',
  },
  askServings: (r: Recipe) => ({
    en: `Nice, ${r.en}! How many people are you cooking for?`,
    te: `బాగుంది, ${r.te}! ఎంత మందికి వండుతున్నారు?`,
  }),
  list: (r: Recipe, n: number, removedSome: boolean) => ({
    en: `${r.noServings ? `Here's everything for the ${r.en}.` : `Here's everything for ${r.en} for ${n} ${n === 1 ? 'person' : 'people'}.`}${removedSome ? ' I\'ve left out what you already have.' : ''} Untick anything you don't need.`,
    te: `${r.noServings ? `${r.te} కోసం కావలసినవి ఇవి.` : `${n} మందికి ${r.te} కోసం కావలసినవి ఇవి.`}${removedSome ? ' మీ దగ్గర ఉన్నవి తీసేశాను.' : ''} అవసరం లేనివాటిని అన్‌టిక్ చేయండి.`,
  }),
};

export function builtinReply(messages: readonly AiMessage[], products: readonly Product[]): AiReply {
  const users = messages.filter((m) => m.role === 'user');
  const last = users[users.length - 1]?.text ?? '';
  const language = languageOf(last);
  const base = { language, items: [], extras: [], unavailable: [], source: 'builtin' as const };

  // The most recent dish the shopper named wins ("make it mutton biryani instead").
  let recipe: Recipe | undefined;
  for (let i = users.length - 1; i >= 0 && !recipe; i--) recipe = RECIPES.find((r) => r.match.test(users[i]?.text ?? ''));
  if (!recipe) return { ...base, text: (users.length && last.trim().length > 2 ? T.unknown : T.askDish)[language] };

  let servings: number | undefined;
  for (let i = users.length - 1; i >= 0 && servings === undefined; i--) servings = servingsIn(users[i]?.text ?? '', true);
  if (recipe.noServings) servings ??= 4;
  if (servings === undefined) return { ...base, dish: recipe[language], text: T.askServings(recipe)[language] };

  const byId = new Map(aiProducts(products).map((p) => [p.id, p]));
  const removed = removedIds(messages, recipe);
  const items = lines(recipe.items, servings, removed, byId);
  const taken = new Set([...removed, ...items.map((i) => i.productId)]);
  const extras = declinedExtras(messages) ? [] : lines(recipe.extras, servings, taken, byId).slice(0, 3);
  const removedSome = recipe.items.some((l) => removed.has(ING[lineOf(l).key].productId));
  return {
    ...base,
    text: T.list(recipe, servings, removedSome)[language],
    dish: recipe[language],
    servings,
    items,
    extras,
    unavailable: [...recipe.missing[language]],
  };
}
