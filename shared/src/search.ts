// Product search matching (iteration 2, DECISIONS D-85). Used by typed and voice search, on the phone and the server.
// The query is split into words; every meaningful word must appear in the product name, allowing plurals
// ("tomatoes" → "tomato"), small typos ("amull" → "amul") and ignoring sizes and filler words ("500 gram", "please").

const UNIT_WORDS = new Set([
  'g', 'gm', 'gms', 'gram', 'grams', 'kg', 'kgs', 'kilo', 'kilos', 'kilogram', 'kilograms', 'ml', 'l', 'ltr', 'litre', 'litres',
  'liter', 'liters', 'pc', 'pcs', 'piece', 'pieces', 'pack', 'packet', 'packets', 'dozen', 'half', 'one', 'two', 'three',
]);
const FILLER_WORDS = new Set(['a', 'an', 'the', 'of', 'and', 'for', 'with', 'some', 'please', 'want', 'need', 'buy', 'get', 'show', 'me', 'i', 'my']);

/** Lower-case words in any script (Latin, Telugu, Devanagari...); digits kept, punctuation dropped. */
export function words(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFC')
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter(Boolean);
}

/** The words of a query that should be matched (sizes, numbers and filler words removed). */
export function queryWords(query: string): string[] {
  return words(query).filter((w) => !UNIT_WORDS.has(w) && !FILLER_WORDS.has(w) && !/^\d+(\.\d+)?[a-z]*$/.test(w));
}

/** Singular forms worth trying: tomatoes → tomato, chips → chip, berries → berry. */
function stems(word: string): string[] {
  const out = [word];
  if (word.length > 4 && word.endsWith('ies')) out.push(`${word.slice(0, -3)}y`);
  if (word.length > 3 && word.endsWith('es')) out.push(word.slice(0, -2));
  if (word.length > 2 && word.endsWith('s')) out.push(word.slice(0, -1));
  return out;
}

/** True when a and b differ by at most one letter (inserted, removed or changed). */
function oneEditApart(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

function wordMatches(queryWord: string, nameWords: readonly string[], nameText: string): boolean {
  for (const q of stems(queryWord)) {
    // Prefix match keeps search-as-you-type working ("tom" finds "tomato").
    if (nameWords.some((w) => w.startsWith(q))) return true;
    if (q.length >= 3 && nameText.includes(q)) return true;
  }
  // One typo allowed in longer words only, and never in the first letter ("ginger" must not find "finger").
  return queryWord.length >= 5 && nameWords.some((w) => w[0] === queryWord[0] && oneEditApart(queryWord, w));
}

/** Does a product name match a typed or spoken query? An empty query matches everything. */
export function matchesSearch(name: string, query: string): boolean {
  const q = queryWords(query);
  // An empty query matches everything; a query of only sizes or filler words ("500 g") matches nothing.
  if (q.length === 0) return words(query).length === 0;
  const nameWords = words(name);
  const nameText = nameWords.join(' ');
  return q.every((w) => wordMatches(w, nameWords, nameText));
}
