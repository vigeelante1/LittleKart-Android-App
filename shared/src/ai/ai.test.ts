import { describe, expect, it } from 'vitest';
import { products } from '../seed';
import { aiProducts, catalogText } from './catalog';
import { aiChat, tidyMessages } from './chat';
import { builtinReply, languageOf } from './builtin';
import { askGemini, parseGeminiReply, type FetchLike } from './gemini';
import { declinedExtras } from './intent';
import { contentsOf, systemPrompt } from './prompt';
import { ING, RECIPES, lineOf } from './recipes';
import { servingsIn } from './text';
import type { AiMessage } from './types';
import { cleanItems } from './validate';

const u = (text: string): AiMessage => ({ role: 'user', text });
const a = (text: string): AiMessage => ({ role: 'assistant', text });
const ids = (items: { productId: string }[]) => items.map((i) => i.productId);

describe('ai catalog', () => {
  it('holds food and pooja shelves only, in stock', () => {
    const list = aiProducts(products);
    expect(list.length).toBeGreaterThan(150);
    expect(list.some((p) => p.categoryId === 'bath-body' || p.categoryId === 'cold-cough-fever' || p.categoryId === 'sexual-wellness')).toBe(false);
    expect(catalogText(products)).toContain('cbc-1kg=1kg');
  });
  it('every built-in ingredient is a real product and size on an AI shelf', () => {
    const byId = new Map(aiProducts(products).map((p) => [p.id, p]));
    for (const [k, i] of Object.entries(ING)) {
      const p = byId.get(i.productId);
      expect(p, k).toBeDefined();
      expect(p?.variants.some((v) => v.id === i.variantId), k).toBe(true);
      if (i.half) expect(p?.variants.some((v) => v.id === i.half), k).toBe(true);
    }
    for (const r of RECIPES) for (const l of [...r.items, ...r.extras]) expect(ING[lineOf(l).key], r.key).toBeDefined();
  });
});

describe('servingsIn', () => {
  it.each([
    ['for 4 people', 4], ['6 members', 6], ['10 mandi ki', 10], ['5 మందికి', 5], ['నలుగురు', 4], ['for two people', 2], ['iddaru', 2],
  ])('%s → %d', (t, n) => expect(servingsIn(t, true)).toBe(n));
  it('a bare number counts only as an answer', () => {
    expect(servingsIn('8', true)).toBe(8);
    expect(servingsIn('8', false)).toBeUndefined();
    expect(servingsIn('500g rice')).toBeUndefined();
    expect(servingsIn('for 99 people')).toBeUndefined();
  });
});

describe('declinedExtras', () => {
  it.each(["no suggestions please", "don't suggest anything", 'only the ingredients', 'suggestions vaddu', 'సూచనలు వద్దు'])('%s', (t) =>
    expect(declinedExtras([u(t)])).toBe(true));
  it('is false for ordinary messages', () => expect(declinedExtras([u('chicken biryani for 4'), u('no onions')])).toBe(false));
});

describe('builtin assistant', () => {
  it('asks for the dish, then the people', () => {
    expect(builtinReply([u('hi')], products).items).toEqual([]);
    const r = builtinReply([u('chicken biryani')], products);
    expect(r.text).toMatch(/How many people/);
    expect(r.items).toEqual([]);
  });
  it('lists everything once dish and people are known; extras are separate', () => {
    const r = builtinReply([u('chicken biryani'), a('How many?'), u('4')], products);
    expect(r.servings).toBe(4);
    expect(ids(r.items)).toEqual(expect.arrayContaining(['chicken-biryani-cut', 'india-gate-basmati', 'onion', 'heritage-curd']));
    expect(r.items.find((i) => i.productId === 'chicken-biryani-cut')).toMatchObject({ variantId: 'cbc-1kg', qty: 1 });
    expect(ids(r.extras)).toContain('thums-up');
    expect(ids(r.extras).some((id) => ids(r.items).includes(id))).toBe(false);
    expect(r.unavailable).toContain('garlic');
    expect(r.source).toBe('builtin');
  });
  it('scales the main ingredients with people and uses the half pack for 2', () => {
    const r8 = builtinReply([u('chicken biryani for 8 people')], products);
    expect(r8.items.find((i) => i.productId === 'chicken-biryani-cut')?.qty).toBe(2);
    const r2 = builtinReply([u('chicken biryani for 2 people')], products);
    expect(r2.items.find((i) => i.productId === 'chicken-biryani-cut')).toMatchObject({ variantId: 'cbc-500', qty: 1 });
  });
  it('leaves out what the shopper already has, but not the dish itself', () => {
    const r = builtinReply([u('chicken biryani for 4, I already have rice and onions')], products);
    expect(ids(r.items)).not.toContain('india-gate-basmati');
    expect(ids(r.items)).not.toContain('onion');
    expect(ids(r.items)).toContain('chicken-biryani-cut');
    const te = builtinReply([u('చికెన్ బిర్యానీ 4 మందికి'), a('...'), u('నా దగ్గర బియ్యం, పెరుగు ఉంది')], products);
    expect(te.language).toBe('te');
    expect(ids(te.items)).not.toContain('india-gate-basmati');
    expect(ids(te.items)).not.toContain('heritage-curd');
  });
  it('"I have to make" is not "I have"', () => {
    expect(ids(builtinReply([u('I have to make chicken curry for 4')], products).items)).toContain('chicken-curry-skinless');
  });
  it('adds no extras after "no suggestions"', () => {
    const r = builtinReply([u('mutton curry for 5'), a('...'), u('no suggestions please')], products);
    expect(r.items.length).toBeGreaterThan(3);
    expect(r.extras).toEqual([]);
  });
  it('answers in Telugu when asked in Telugu', () => {
    expect(languageOf('sambar kavali 4 mandiki')).toBe('te');
    const r = builtinReply([u('సాంబార్ 6 మందికి')], products);
    expect(r.language).toBe('te');
    expect(r.text).toContain('6 మందికి');
    expect(r.unavailable).toContain('చింతపండు');
  });
  it('a pooja needs no number of people', () => {
    const r = builtinReply([u('Vinayaka pooja items')], products);
    expect(ids(r.items)).toEqual(expect.arrayContaining(['camphor-tablets', 'coconut-pooja']));
  });
  it.each([
    ['mutton biryani', 'mutton biryani'], ['veg pulao', 'veg pulao'], ['biryani', 'chicken biryani'], ['chicken 65', 'chicken fry'],
    ['chicken curry', 'chicken curry'], ['mutton', 'mutton curry'], ['fish pulusu', 'fish curry'], ['prawns', 'prawns curry'],
    ['egg curry', 'egg curry'], ['sambar', 'sambar'], ['palakura pappu', 'palakura pappu'], ['palak paneer', 'palak paneer'],
    ['paneer butter masala', 'paneer butter masala'], ['pappu', 'tomato pappu'], ['pesarattu', 'pesarattu'], ['dosa', 'idli and dosa'],
    ['upma', 'upma'], ['lemon rice', 'lemon rice'], ['curd rice', 'curd rice'], ['aloo fry', 'aloo fry'], ['bhindi', 'bhindi fry'],
    ['vankaya kura', 'brinjal curry'], ['semiya payasam', 'semiya payasam'], ['gulab jamun', 'gulab jamun'], ['maggi', 'masala noodles'],
    ['bread omelette', 'bread omelette'], ['french fries', 'french fries'], ['fruit salad', 'fruit salad'], ['tea', 'tea'],
    ['filter coffee', 'filter coffee'], ['birthday party', 'party snacks'], ['satyanarayana vratham', 'pooja'],
  ])('"%s for 4 people" → %s with a full list', (dish, name) => {
    const r = builtinReply([u(`${dish} for 4 people`)], products);
    expect(r.dish).toBe(name);
    expect(r.items.length).toBeGreaterThanOrEqual(2);
  });
});

describe('gemini', () => {
  const okReply = (json: unknown): FetchLike => async () => ({
    ok: true,
    status: 200,
    json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(json) }] } }] }),
  });

  it('keeps only real products and sizes, fixes quantities and drops duplicates', () => {
    const r = parseGeminiReply(
      JSON.stringify({
        reply: 'Here you go', language: 'en', dish: 'biryani', servings: 4,
        items: [
          { productId: 'chicken-biryani-cut', variantId: 'cbc-1kg', qty: 1 },
          { productId: 'onion', variantId: 'nope', qty: 2.6 },
          { productId: 'made-up', variantId: 'x', qty: 1 },
          { productId: 'onion', variantId: 'onion-1', qty: 1 },
          { productId: 'tomato', variantId: 'tomato-1', qty: 400 },
          { productId: 'dove-soap', variantId: 'dove-soap-1', qty: 1 },
        ],
        extras: [{ productId: 'onion', variantId: 'onion-1', qty: 1 }, { productId: 'thums-up', variantId: 'thums-up-2', qty: 1 }],
        unavailable: ['garlic', 'garlic', ''],
      }),
      products,
      [u('biryani for 4')],
    );
    expect(r.items).toEqual([
      { productId: 'chicken-biryani-cut', variantId: 'cbc-1kg', qty: 1 },
      { productId: 'onion', variantId: 'onion-1', qty: 3 },
      { productId: 'tomato', variantId: 'tomato-1', qty: 10 },
    ]);
    expect(ids(r.extras)).toEqual(['thums-up']);
    expect(r.unavailable).toEqual(['garlic']);
  });

  it('drops extras when the shopper declined them, whatever the model says', async () => {
    const r = await askGemini([u('dal for 2'), a('ok'), u('no suggestions')], products, 'k',
      okReply({ reply: 'ok', language: 'en', items: [], extras: [{ productId: 'thums-up', variantId: 'thums-up-2', qty: 1 }], unavailable: [] }));
    expect(r.extras).toEqual([]);
    expect(systemPrompt(products, true)).toContain('MUST be empty');
  });

  it('sends the key in a header, never in the URL, and tries the second model when the first is busy', async () => {
    const calls: { url: string; headers: Record<string, string> }[] = [];
    const fetchFn: FetchLike = async (url, init) => {
      calls.push({ url, headers: init.headers });
      if (calls.length === 1) return { ok: false, status: 429, json: async () => ({}) };
      return okReply({ reply: 'hi', language: 'en', items: [], extras: [], unavailable: [] })(url, init);
    };
    const r = await askGemini([u('hi')], products, 'secret', fetchFn);
    expect(r.source).toBe('gemini');
    expect(calls).toHaveLength(2);
    expect(calls.every((c) => !c.url.includes('secret') && c.headers['x-goog-api-key'] === 'secret')).toBe(true);
  });

  it('falls back to the built-in list when Gemini fails or there is no key', async () => {
    const down: FetchLike = async () => { throw new Error('offline'); };
    expect((await aiChat([u('sambar for 4')], products, { apiKey: 'k', fetchFn: down })).source).toBe('builtin');
    expect((await aiChat([u('sambar for 4')], products)).items.length).toBeGreaterThan(3);
  });

  it('history starts at the first user message and carries earlier lists', () => {
    const c = contentsOf([a('What are you preparing?'), u('dal'), { role: 'assistant', text: 'ok', items: [{ productId: 'onion', variantId: 'onion-1', qty: 1 }] }, u('4')]);
    expect(c.map((x) => x.role)).toEqual(['user', 'model', 'user']);
    expect(c[1]?.parts[0]?.text).toContain('onion-1');
  });

  it('tidyMessages drops junk and trims', () => {
    expect(tidyMessages([null, { role: 'x', text: 'a' }, { role: 'user', text: '  ' }, { role: 'user', text: 'x'.repeat(900) }])).toEqual([
      { role: 'user', text: 'x'.repeat(500) },
    ]);
  });

  it('cleanItems ignores non-arrays', () => expect(cleanItems('nope', products)).toEqual([]));
});

describe('notInCatalog', () => {
  it('keeps only what the shop really lacks', async () => {
    const { notInCatalog } = await import('./validate');
    expect(notInCatalog(['ginger', 'garlic', 'cumin seeds', 'Mint leaves', 'jeera', 'sugar'], products)).toEqual(['garlic', 'Mint leaves', 'sugar']);
  });
});
