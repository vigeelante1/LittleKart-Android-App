// Small text helpers for the assistant (D-102).

/** True when the text has Telugu letters. */
export const isTelugu = (text: string): boolean => /[ఀ-౿]/.test(text);

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, fifteen: 15, twenty: 20,
  okkaru: 1, iddaru: 2, mugguru: 3, naluguru: 4, aiduguru: 5, aruguru: 6,
  ఒక్కరు: 1, ఒకరు: 1, ఇద్దరు: 2, ముగ్గురు: 3, నలుగురు: 4, ఐదుగురు: 5, ఆరుగురు: 6, ఏడుగురు: 7, ఎనిమిది: 8, పది: 10,
};

/**
 * How many people the message mentions: "for 4 people", "4 members", "4 mandi", "4 మంది", "నలుగురు", or a bare
 * number when `bare` (the reply to "how many people?"). 1–50, else undefined.
 */
export function servingsIn(text: string, bare = false): number | undefined {
  const t = text.toLowerCase().trim();
  const m =
    /(\d{1,2})\s*(?:people|persons?|members?|pax|guests?|ppl|mandi\w*|మంది\w*|వాళ్ళ\w*|కి\b)/u.exec(t) ??
    /\bfor\s+(\d{1,2})\b/.exec(t) ??
    (bare ? /^(\d{1,2})\s*\.?$/.exec(t) : null);
  let n = m ? Number(m[1]) : NaN;
  if (Number.isNaN(n)) {
    for (const [w, v] of Object.entries(WORD_NUMBERS)) {
      const re = /^[a-z]+$/.test(w) ? new RegExp(`\\b${w}\\b`) : new RegExp(w);
      if (re.test(t) && (bare || /people|members|persons|mandi|మంది|guests|for/.test(t) || !/^[a-z]+$/.test(w))) { n = v; break; }
    }
  }
  return n >= 1 && n <= 50 ? n : undefined;
}
