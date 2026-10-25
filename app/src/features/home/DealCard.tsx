import { discountPercent, formatRupee, MAX_UNITS_PER_PRODUCT, maxQtyForVariant, type Product } from '@littlekart/shared';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { PlusButton } from '@/components/PlusButton';
import { ProductImage } from '@/components/ProductImage';
import { qtyInCart, useCartStore } from '@/store';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';

interface Props {
  product: Product;
  width: number;
}

export const DEAL_CARD_HEIGHT = 249.6;

/** "Limited Time Deals" card (littlekart.com product-card--deal): image, one-line name, weight, % OFF, price, "+". */
export function DealCard({ product, width }: Props) {
  const variant = product.variants[0];
  const lines = useCartStore((s) => s.lines);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  if (!variant) return null;

  const qty = qtyInCart(lines, product.id, variant.id);
  const percent = discountPercent(variant.price, variant.mrp);
  const canAdd = qty < maxQtyForVariant(lines, product.id, variant.id, variant.stock, MAX_UNITS_PER_PRODUCT);
  const add = () => increment(product.id, variant.id, variant.stock);

  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.imageFrame}>
        <ProductImage uri={variant.imageUrl ?? product.imageUrl} style={styles.image} accessibilityLabel={product.name} />
      </View>
      <AppText variant="dealName" numberOfLines={1} style={styles.name}>
        {product.name}
      </AppText>
      <AppText variant="dealWeight" numberOfLines={1} style={styles.weight}>
        {variant.label}
      </AppText>
      {/* The site keeps this line's space even without a discount (visibility: hidden). */}
      <AppText variant="dealOff" numberOfLines={1} style={[styles.off, percent === 0 && styles.hidden]}>
        {strings.product.percentOff(percent)}
      </AppText>
      <View style={styles.prices}>
        <AppText variant="dealPrice">{formatRupee(variant.price)}</AppText>
        {variant.mrp !== undefined && variant.mrp > variant.price ? (
          <AppText variant="dealMrp" strike>
            {formatRupee(variant.mrp)}
          </AppText>
        ) : null}
      </View>

      <View style={styles.action}>
        {qty === 0 ? (
          <PlusButton onPress={add} disabled={variant.stock <= 0} />
        ) : (
          <View style={styles.qty}>
            <Pressable
              onPress={() => decrement(product.id, variant.id)}
              accessibilityRole="button"
              accessibilityLabel={strings.product.decrease}
              style={styles.qtyButton}
            >
              <AppText variant="dealQtySign">−</AppText>
            </Pressable>
            <AppText variant="dealQtyCount" align="center" style={styles.qtyCount}>
              {qty}
            </AppText>
            <Pressable
              onPress={add}
              disabled={!canAdd}
              accessibilityRole="button"
              accessibilityLabel={strings.product.increase}
              style={[styles.qtyButton, !canAdd && styles.dimmed]}
            >
              <AppText variant="dealQtySign">+</AppText>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: DEAL_CARD_HEIGHT,
    paddingTop: 4,
    paddingHorizontal: 6,
    paddingBottom: 12,
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.borderCard,
    backgroundColor: colors.surface,
    boxShadow: shadows.dealCard,
  },
  imageFrame: { flex: 1, minHeight: 0, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  // The site scales deal images to 140% inside their frame.
  image: { transform: [{ scale: 1.4 }] },
  name: { marginTop: 6 },
  weight: { marginTop: 6 },
  off: { marginTop: 2, minHeight: 15 },
  hidden: { opacity: 0 },
  prices: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 },
  action: { position: 'absolute', right: 8, bottom: -14, zIndex: 2 },
  qty: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: colors.plusGreen,
    boxShadow: shadows.plus,
  },
  qtyButton: { width: 28, height: 34, alignItems: 'center', justifyContent: 'center' },
  qtyCount: { minWidth: 14 },
  dimmed: { opacity: 0.4 },
});
