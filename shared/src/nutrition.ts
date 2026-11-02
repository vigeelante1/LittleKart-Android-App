// Nutrition tags and summary (iteration 2, DECISIONS D-101), like Zepto's "High protein · No trans-fat".
// A tag is shown only when the product's own numbers meet the claim rules of the Food Safety and Standards
// (Advertising and Claims) Regulations, 2018 (FSSAI), Schedule I.
import type { Nutrition, Product } from './types';

export type NutritionTag = 'highProtein' | 'highFibre' | 'lowFat' | 'lowSugar' | 'noTransFat' | 'veg' | 'nonVeg';

/** Most useful first; cards show at most two. */
const ORDER: NutritionTag[] = ['highProtein', 'highFibre', 'lowFat', 'lowSugar', 'noTransFat', 'veg', 'nonVeg'];
export const MAX_CARD_TAGS = 2;
export const HIGH_PROTEIN_PER_100G = 10.8;
export const HIGH_PROTEIN_PER_100ML = 5.4;

/**
 * Claims the numbers support:
 * - High protein: at least twice the "source of protein" level, i.e. 10.8 g per 100 g (5.4 g per 100 ml), from
 *   10% of the ICMR reference protein intake (54 g a day) per 100 g.
 * - High fibre: at least 6 g per 100 g (or 3 g per 100 kcal).
 * - Low fat: at most 3 g per 100 g (1.5 g per 100 ml for drinks).
 * - Low sugar: at most 5 g per 100 g (2.5 g per 100 ml).
 * - No trans-fat (trans-fat free): at most 0.2 g per 100 g, only when the trans fat is actually reported.
 * - Veg / Non-veg: from the product's food type (Indian green / brown dot), shown last.
 * Foods with almost no energy (under 10 kcal, e.g. water) get no nutrient claims, and a "low" claim is only made
 * where the nutrient matters for that food: "Low sugar" needs at least 5 g carbohydrate (no "low sugar" ghee or
 * chicken), "Low fat" needs at least 3 g protein and fat together (no "low fat" cola or cucumber).
 */
export function nutritionTags(n: Nutrition | undefined): NutritionTag[] {
  if (!n) return [];
  const diet: NutritionTag[] = n.diet === 'veg' ? ['veg'] : n.diet === 'nonVeg' ? ['nonVeg'] : [];
  if (n.energyKcal < 10) return diet;
  const liquid = n.per === '100ml';
  const tags = new Set<NutritionTag>();
  if (n.protein >= (liquid ? HIGH_PROTEIN_PER_100ML : HIGH_PROTEIN_PER_100G)) tags.add('highProtein');
  for (const d of diet) tags.add(d);
  if (n.fibre !== undefined && (n.fibre >= 6 || (n.fibre * 100) / n.energyKcal >= 3)) tags.add('highFibre');
  if (n.fat <= (liquid ? 1.5 : 3) && n.protein + n.fat >= 3) tags.add('lowFat');
  if (n.sugars !== undefined && n.carbs >= 5 && n.sugars <= (liquid ? 2.5 : 5)) tags.add('lowSugar');
  if (n.transFat !== undefined && n.transFat <= 0.2) tags.add('noTransFat');
  return ORDER.filter((t) => tags.has(t));
}

/** The tags a product card shows (at most two). */
export const cardTags = (p: Product): NutritionTag[] => nutritionTags(p.nutrition).slice(0, MAX_CARD_TAGS);

/** Rounds a nutrient for display: one decimal under 10, whole numbers above ("5.7", "25", "203.8" kcal kept). */
export function formatNutrient(value: number): string {
  if (value >= 100) return String(Math.round(value * 10) / 10);
  if (value >= 10) return String(Math.round(value));
  return String(Math.round(value * 10) / 10);
}

/** True when the reported energy roughly matches protein, carbs and fat (4/4/9 kcal per g, ±25% or ±25 kcal). */
export function energyConsistent(n: Nutrition): boolean {
  const expected = n.protein * 4 + n.carbs * 4 + n.fat * 9;
  return Math.abs(expected - n.energyKcal) <= Math.max(25, n.energyKcal * 0.25);
}
