// Products that can stand in for each other in "Swap & save" (DECISIONS D-91). Hand-picked so a swap is
// always the same kind of thing (sunflower oil for sunflower oil, never a toilet cleaner for a detergent).
// Medicines, meat, fresh produce, flowers and loose items are never swapped.
import type { Id } from '../types';

export const swapGroups: readonly (readonly Id[])[] = [
  ['freedom-sunflower', 'gold-drop', 'fortune-sunflower'],
  ['aashirvaad-atta', 'pillsbury-atta'],
  ['india-gate-basmati', 'daawat-basmati'],
  ['amul-taaza', 'heritage-milk', 'vijaya-milk'],
  ['red-label', 'taj-mahal-tea', '3-roses', 'tata-tea-gold'],
  ['bournvita', 'horlicks'],
  ['maggi-masala', 'yippee-magic', 'top-ramen', 'chings-schezwan'],
  ['real-mixed', 'real-guava', 'tropicana-orange', 'b-natural-mango'],
  ['haldiram-aloo-bhujia', 'bikaji-bhujia', 'balaji-ratlami-sev'],
  ['marie-gold', 'parle-g'],
  ['bourbon', 'oreo'],
  ['good-day-cashew', 'hide-and-seek'],
  ['amul-choco-cone', 'kwality-cornetto'],
  ['yoga-bar-protein', 'whole-truth-peanut', 'ritebite-choco-almond'],
  ['sumeru-paratha', 'id-malabar-parota'],
  ['dettol-handwash', 'himalaya-handwash', 'palmolive-handwash'],
  ['colgate-strong', 'dabur-red', 'closeup-red'],
  ['lux-soap', 'santoor-soap', 'medimix-soap', 'dove-soap'],
  ['fogg-black', 'wild-stone-edge', 'park-avenue'],
  ['whisper-ultra', 'stayfree-secure', 'sofy-antibacteria'],
  ['friends-adult-m', 'lifree-pants'],
  ['durex-extra-thin', 'skore-pack', 'manforce-pack'],
  ['natraj-pencil', 'apsara-platinum'],
  ['himalaya-neem-face', 'mamaearth-vitc'],
  ['pedigree-adult', 'drools-adult'],
];

const groupById = new Map<Id, readonly Id[]>(swapGroups.flatMap((g) => g.map((id) => [id, g] as const)));

/** The products of the same kind as `productId` (including itself), or an empty list. */
export const swapGroupOf = (productId: Id): readonly Id[] => groupById.get(productId) ?? [];
