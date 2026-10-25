import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartProducts } from '@/hooks/useCartProducts';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { AppText } from './AppText';
import { ProductImage } from './ProductImage';

const MAX_THUMBS = 3;

/** Space to leave at the bottom of a scrolling page so the pill never covers content (DECISIONS D-21 fix 2). */
export function useViewCartPillSpace(): number {
  const insets = useSafeAreaInsets();
  return pillBottom(insets.bottom) + PILL_HEIGHT + 12;
}

const PILL_HEIGHT = 59.6;
const pillBottom = (safeBottom: number) => 12 + Math.max(48, safeBottom);

/**
 * Floating green "View Cart" pill on Home and category screens while the cart has items
 * (littlekart.com floating-cart-card). Text is laid out as on the site: "View Cart ›" over "N items",
 * instead of the three staggered lines in the phone screenshots (DECISIONS D-21 fix 1).
 */
export function ViewCartPill() {
  const insets = useSafeAreaInsets();
  const items = useCartProducts();
  if (items.length === 0) return null;

  return (
    <Pressable
      onPress={() => router.push('/cart')}
      accessibilityRole="button"
      accessibilityLabel={`${strings.cart.viewCart}, ${strings.cart.items(items.length)}`}
      style={[styles.pill, { bottom: pillBottom(insets.bottom) }]}
    >
      <View style={styles.thumbs}>
        {items.slice(0, MAX_THUMBS).map(({ product, variant }, i) => (
          <View key={`${product.id}-${variant.id}`} style={[styles.avatar, i > 0 && styles.overlap]}>
            <ProductImage uri={variant.imageUrl ?? product.imageUrl} style={styles.avatarImage} />
          </View>
        ))}
      </View>
      <View style={styles.right}>
        <View style={styles.titleRow}>
          <AppText variant="pillTitle">{strings.cart.viewCart}</AppText>
          <MaterialIcons name="chevron-right" size={24} color={colors.white} />
        </View>
        <AppText variant="pillCount" style={styles.count}>
          {strings.cart.items(items.length)}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    width: '54%',
    height: PILL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 30,
    backgroundColor: colors.primary,
    boxShadow: shadows.cartPill,
    zIndex: 20,
  },
  thumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 3,
    paddingRight: 6,
    borderRadius: 999,
    backgroundColor: colors.pillCapsule,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.6,
    borderColor: colors.white,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  overlap: { marginLeft: -8 },
  avatarImage: { width: '100%', height: '100%' },
  right: { alignItems: 'center', gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  count: { opacity: 0.92 },
});
