// Inter, the only font the live app uses.
// The site loads Inter 500, 600, 700 and 800 only, so the browser renders other weights with the nearest
// loaded one: 400 → 500, 650 → 700, 750 → 800, 900 → 800 (DECISIONS D-26). We load the same four.
import {
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { DancingScript_700Bold } from '@expo-google-fonts/dancing-script';

export const fontAssets = {
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  // The handwritten "Sorry," on the store-closed sign (the site loads Dancing Script 600/700).
  DancingScript_700Bold,
};

export const SCRIPT_FONT = 'DancingScript_700Bold';

/** Weights as written in the site's CSS. */
export type CssWeight = 400 | 500 | 600 | 650 | 700 | 750 | 800 | 900;

const families = {
  500: 'Inter_500Medium',
  600: 'Inter_600SemiBold',
  700: 'Inter_700Bold',
  800: 'Inter_800ExtraBold',
} as const;

/** The font family the browser actually draws for a CSS weight. */
export function interFamily(weight: CssWeight): string {
  switch (weight) {
    case 400:
    case 500:
      return families[500];
    case 600:
      return families[600];
    case 650:
    case 700:
      return families[700];
    default:
      return families[800];
  }
}
