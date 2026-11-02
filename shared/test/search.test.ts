import { describe, expect, it } from 'vitest';
import { matchesSearch, queryWords } from '../src/search';

const tomato = 'Tomato | టమాటా';
const maggi = 'Maggi 2-Minute Masala Noodles';
const ginger = 'అల్లం | Allam | अदरक | Ginger';

describe('search matching (D-85)', () => {
  it('matches word by word, in any order', () => {
    expect(matchesSearch(maggi, 'maggi noodles')).toBe(true);
    expect(matchesSearch(maggi, 'noodles maggi')).toBe(true);
    expect(matchesSearch(maggi, 'maggi pasta')).toBe(false);
  });
  it('handles plurals and a small typo', () => {
    expect(matchesSearch(tomato, 'tomatoes')).toBe(true);
    expect(matchesSearch('Amul Salted Butter', 'amull butter')).toBe(true);
    expect(matchesSearch('Lemon | నిమ్మకాయ', 'lemons')).toBe(true);
  });
  it('ignores sizes and filler words from spoken queries', () => {
    expect(queryWords('Amul butter 500 gram please')).toEqual(['amul', 'butter']);
    expect(matchesSearch('Amul Salted Butter', 'I want amul butter 100g')).toBe(true);
    expect(matchesSearch(tomato, '500 g')).toBe(false);
  });
  it('matches Telugu and Hindi words in the name', () => {
    expect(matchesSearch(tomato, 'టమాటా')).toBe(true);
    expect(matchesSearch(ginger, 'अदरक')).toBe(true);
    expect(matchesSearch(ginger, 'allam')).toBe(true);
  });
  it('keeps search-as-you-type working and empty queries open', () => {
    expect(matchesSearch(tomato, 'tom')).toBe(true);
    expect(matchesSearch(tomato, '')).toBe(true);
    expect(matchesSearch(tomato, 'xyz')).toBe(false);
  });
});

describe('search precision', () => {
  it('does not treat a different first letter as a typo', () => {
    expect(matchesSearch('Lady Finger | బెండకాయ', 'ginger')).toBe(false);
  });
});
