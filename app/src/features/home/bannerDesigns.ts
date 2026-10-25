// Our own offer banner designs (iteration 2, DECISIONS D-81), keyed by banner id from the catalog.
// Photos are free-licensed Wikimedia Commons images bundled in assets/banners, credited in CREDITS.md.
import { strings } from '@/strings';
import { colors } from '@/theme';

export interface BannerDesign {
  copy: { kicker: string; title: string; sub: string; cta: string };
  gradient: readonly [string, string];
  /** Bundled image (require). */
  photo: number;
}


export const bannerDesigns: Record<string, BannerDesign> = {
  'b-fresh-meat': {
    copy: strings.banners.meat,
    gradient: colors.bannerMeat,
    photo: require('@/assets/banners/meat.webp'),
  },
  'b-flowers': {
    copy: strings.banners.flowers,
    gradient: colors.bannerFlowers,
    photo: require('@/assets/banners/flowers.webp'),
  },
  'b-sweets': {
    copy: strings.banners.sweets,
    gradient: colors.bannerSweets,
    photo: require('@/assets/banners/sweets.webp'),
  },
  'b-veggies': {
    copy: strings.banners.veggies,
    gradient: colors.bannerVeggies,
    photo: require('@/assets/banners/veggies.webp'),
  },
  'b-diwali': {
    copy: strings.banners.diwali,
    gradient: colors.bannerDiwali,
    photo: require('@/assets/banners/diwali.webp'),
  },
};
