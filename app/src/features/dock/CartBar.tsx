import { MaterialIcons } from '@expo/vector-icons';
import { formatRupee } from '@littlekart/shared';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ProductImage } from '@/components/ProductImage';
import { useCartProducts } from '@/hooks/useCartProducts';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { useAddOnStore } from '@/features/addon/addOnStore';
import { useAddOnWindow } from '@/features/addon/useAddOnWindow';
import { CART_BAR_HEIGHT } from './useDock';

const MAX_THUMBS = 3;

/** Full-width green cart bar: product pictures, "N items · ₹total" and "View Cart ›" (replaces the pill). */
export function CartBar() {
  const items = useCartProducts();
  const units = items.reduce((sum, i) => sum + i.line.qty, 0);
  const total = items.filter((i) => i.variant.stock > 0).reduce((sum, i) => sum + i.variant.price * i.line.qty, 0);
  // In the 40 seconds after ordering, the bar adds these items to that order (D-105).
  const addOn = useAddOnWindow();
  const openAddOn = useAddOnStore((s) => s.setOpen);
  const action = addOn ? `${strings.addOn.cartBar} · ${addOn.left}` : strings.cart.viewCart;
  return (
    <Pressable
      onPress={() => (addOn ? openAddOn(true) : router.push('/cart'))}
      accessibilityRole="button"
      accessibilityLabel={`${action}, ${strings.dock.items(units)}, ${formatRupee(total)}`}
      style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
    >
      <View style={styles.thumbs}>
        {items.slice(0, MAX_THUMBS).map(({ product, variant }, i) => (
          <View key={`${product.id}-${variant.id}`} style={[styles.thumb, i > 0 && styles.overlap, { zIndex: MAX_THUMBS - i }]}>
            <ProductImage uri={variant.imageUrl ?? product.imageUrl} style={styles.thumbImage} />
          </View>
        ))}
      </View>
      <View style={styles.text}>
        <AppText variant="dockItems">{strings.dock.items(units)}</AppText>
        <AppText variant="dockTotal">{formatRupee(total)}</AppText>
      </View>
      <View style={styles.action}>
        <AppText variant="dockAction">{action}</AppText>
        <MaterialIcons name="chevron-right" size={24} color={colors.white} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: CART_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 8,
    borderRadius: 16,
    backgroundColor: colors.primary,
    boxShadow: shadows.dockCart,
  },
  pressed: { opacity: 0.92 },
  thumbs: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  thumb: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlap: { marginLeft: -12 },
  thumbImage: { width: '86%', height: '86%' },
  text: { flex: 1, minWidth: 0 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingLeft: 12, paddingVertical: 8, borderLeftWidth: 1, borderLeftColor: colors.whiteTint26 },
});
