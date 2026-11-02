import { describe, expect, it } from 'vitest';
import { cardTags, energyConsistent, formatNutrient, nutritionTags, type Nutrition } from '../src';
import { nutritionById, products } from '../src/seed';

const base: Nutrition = { per: '100g', energyKcal: 400, protein: 10, carbs: 70, fat: 10, source: 'test' };

describe('nutritionTags (FSSAI claim rules, D-101)', () => {
  it('high protein needs 10.8 g per 100 g (5.4 g per 100 ml)', () => {
    expect(nutritionTags({ ...base, protein: 10.8 })).toContain('highProtein');
    expect(nutritionTags({ ...base, protein: 10.7 })).not.toContain('highProtein');
    expect(nutritionTags({ ...base, per: '100ml', energyKcal: 60, protein: 5.4, carbs: 5, fat: 1 })).toContain('highProtein');
    // Coriander is protein-rich for its few calories, but 2 g per 100 g is not "high protein".
    expect(nutritionTags(nutritionById['coriander'])).not.toContain('highProtein');
  });
  it('high fibre at 6 g per 100 g, or 3 g per 100 kcal', () => {
    expect(nutritionTags({ ...base, fibre: 6 })).toContain('highFibre');
    expect(nutritionTags({ ...base, energyKcal: 40, protein: 1, carbs: 8, fat: 0.2, fibre: 1.2 })).toContain('highFibre');
    expect(nutritionTags({ ...base, fibre: 5.9 })).not.toContain('highFibre');
  });
  it('low fat and low sugar use the drink limits per 100 ml', () => {
    expect(nutritionTags({ ...base, fat: 3, sugars: 5 })).toEqual(expect.arrayContaining(['lowFat', 'lowSugar']));
    const drink = { ...base, per: '100ml' as const, energyKcal: 60, protein: 3, carbs: 5, fat: 2, sugars: 3 };
    expect(nutritionTags(drink)).not.toContain('lowFat');
    expect(nutritionTags(drink)).not.toContain('lowSugar');
    expect(nutritionTags({ ...drink, fat: 1.5, sugars: 2.5 })).toEqual(expect.arrayContaining(['lowFat', 'lowSugar']));
  });
  it('no trans-fat only when trans fat is reported and at most 0.2 g', () => {
    expect(nutritionTags({ ...base, transFat: 0.2 })).toContain('noTransFat');
    expect(nutritionTags({ ...base, transFat: 0.3 })).not.toContain('noTransFat');
    expect(nutritionTags(base)).not.toContain('noTransFat');
  });
  it('makes "low" claims only where the nutrient matters', () => {
    expect(nutritionTags(nutritionById['amul-ghee'])).not.toContain('lowSugar');
    expect(nutritionTags(nutritionById['chicken-boneless'])).not.toContain('lowSugar');
    expect(nutritionTags(nutritionById['thums-up'])).not.toContain('lowFat');
    expect(nutritionTags(nutritionById['tata-toor-dal'])).toContain('lowFat');
  });
  it('unknown sugars give no low-sugar claim; near-zero energy gives only the diet tag', () => {
    expect(nutritionTags({ ...base, sugars: undefined })).not.toContain('lowSugar');
    expect(nutritionTags({ ...base, energyKcal: 0, protein: 0, carbs: 0, fat: 0, diet: 'veg' })).toEqual(['veg']);
  });
  it('orders tags and keeps two on cards; diet comes last', () => {
    const egg = nutritionById['sneha-brown-eggs']!;
    expect(nutritionTags(egg)).toEqual(['highProtein', 'noTransFat', 'nonVeg']);
    const p = products.find((x) => x.id === 'sneha-brown-eggs')!;
    expect(cardTags(p)).toEqual(['highProtein', 'noTransFat']);
    expect(cardTags(products.find((x) => x.id === 'ariel-matic')!)).toEqual([]);
  });
});

describe('nutrition data', () => {
  const ids = new Set(products.map((p) => p.id));
  it.each(Object.entries(nutritionById))('%s is a real food product with sensible numbers', (id, n) => {
    expect(ids.has(id), id).toBe(true);
    expect(energyConsistent(n), `${id}: ${n.energyKcal} kcal`).toBe(true);
    for (const v of [n.protein, n.carbs, n.fat, n.sugars ?? 0, n.saturatedFat ?? 0, n.transFat ?? 0, n.fibre ?? 0]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
    expect(n.protein + n.carbs + n.fat).toBeLessThanOrEqual(101);
    if (n.sugars !== undefined) expect(n.sugars).toBeLessThanOrEqual(n.carbs + 0.5);
    if (n.saturatedFat !== undefined) expect(n.saturatedFat).toBeLessThanOrEqual(n.fat + 0.5);
    expect(n.source).toMatch(/^(Open Food Facts, product \d+|USDA FoodData Central \(SR Legacy \d+\): .+)$/);
    expect(['veg', 'nonVeg']).toContain(n.diet);
  });
  it('marks meat, fish and eggs non-veg and everything else veg', () => {
    for (const p of products) {
      if (!p.nutrition) continue;
      const nonVeg = ['chicken', 'mutton', 'fish'].includes(p.categoryId) || /egg/i.test(p.id);
      expect(p.nutrition.diet, p.id).toBe(nonVeg ? 'nonVeg' : 'veg');
    }
  });
  it('covers at least 100 products, and never non-food shelves', () => {
    const withData = products.filter((p) => p.nutrition);
    expect(withData.length).toBeGreaterThanOrEqual(100);
    const nonFood = ['household-essentials', 'bath-body', 'oral-care', 'stationery-items', 'pens-pencils', 'electronics', 'first-aid'];
    expect(withData.filter((p) => nonFood.includes(p.categoryId))).toEqual([]);
  });
  it('formats numbers for display', () => {
    expect(formatNutrient(203.84)).toBe('203.8');
    expect(formatNutrient(25.2)).toBe('25');
    expect(formatNutrient(5.67)).toBe('5.7');
  });
});
