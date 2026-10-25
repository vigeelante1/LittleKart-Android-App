// Maps image references to sources. Real images are https URLs; until the founder provides them,
// the seed catalog uses "asset:<role>" keys that point at the neutral files in ./placeholders.
// The logo and login illustration are the live app's own artwork (DECISIONS D-38).
import type { ImageSource } from 'expo-image';
import { productImages } from './productImages';

const placeholders = {
  product: require('./placeholders/product.png'),
  category: require('./placeholders/category.png'),
  banner: require('./placeholders/banner.png'),
} as const;

/** The live app's artwork, at 3× its on-screen size (logo 150 × 44, illustration 300 × 200). */
export const brandImages = {
  logo: require('./brand/logo.webp'),
  loginIllustration: require('./brand/login-illustration.webp'),
} as const;

export type PlaceholderRole = keyof typeof placeholders;

const ASSET_PREFIX = 'asset:';
const PRODUCT_PREFIX = 'asset:p/';

export function resolveImage(uri: string): ImageSource | number {
  // Bundled product image ("asset:p/<product id>", DECISIONS D-82).
  if (uri.startsWith(PRODUCT_PREFIX)) return productImages[uri.slice(PRODUCT_PREFIX.length)] ?? placeholders.product;
  if (uri.startsWith(ASSET_PREFIX)) {
    const role = uri.slice(ASSET_PREFIX.length) as PlaceholderRole;
    return placeholders[role] ?? placeholders.product;
  }
  return { uri };
}
