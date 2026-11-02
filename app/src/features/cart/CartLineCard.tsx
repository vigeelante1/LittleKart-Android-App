import { formatRupee } from '@littlekart/shared';
import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ProductImage } from '@/components/ProductImage';
import { QuantityStepper } from '@/components/QuantityStepper';
import type { ResolvedLine } from '@/hooks/useCartProducts';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';

interface Props {
  item: ResolvedLine;
  canIncrement: boolean;
  /** True when "+" is stopped by the stock (not by the 30-unit limit): tapping it shows the note. */
  stockLimited: boolean;
  /** "Only N units left" under the price, after "+" was tapped at the stock limit. */
  stockMessage: string | null;
  onIncrement: () => void;
  onDecrement: () => void;
  onBlockedIncrement: () => void;
  onRemove: () => void;
  /** Shown under the line inside the card (the Swap & save strip, D-91). */
  footer?: ReactNode;
}

/** One cart line (littlekart.com /cart "cart-line-item"). */
export function CartLineCard({
  item,
  canIncrement,
  stockLimited,
  stockMessage,
  onIncrement,
  onDecrement,
  onBlockedIncrement,
  onRemove,
  footer,
}: Props) {
  const { product, variant, line } = item;
  const outOfStock = variant.stock <= 0;
  const showMrp = variant.mrp !== undefined && variant.mrp > variant.price;

  return (
    <View style={[styles.card, outOfStock && styles.unavailable]}>
      <View style={styles.row}>
      <Pressable
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
        accessibilityRole="button"
        accessibilityLabel={product.name}
        style={styles.thumb}
      >
        <ProductImage uri={variant.imageUrl ?? product.imageUrl} style={styles.image} accessibilityLabel={product.name} />
      </Pressable>

      <View style={styles.info}>
        <View style={styles.nameBox}>
          <AppText variant="cartName" numberOfLines={2}>
            {product.name}
          </AppText>
        </View>
        {variant.label ? <AppText variant="cartWeight">{strings.cart.weight(variant.label)}</AppText> : null}
        <View style={styles.prices}>
          {showMrp && variant.mrp !== undefined ? (
            <AppText variant="cartMrp" strike>
              {strings.cart.mrp(variant.mrp)}
            </AppText>
          ) : null}
          <AppText variant="cartPrice">{formatRupee(variant.price)}</AppText>
          {stockMessage ? (
            <AppText variant="cartStockMessage" style={styles.stockMessage}>
              {stockMessage}
            </AppText>
          ) : null}
        </View>
      </View>

      {outOfStock ? (
        <View style={[styles.actions, styles.actionsUnavailable]}>
          <View style={styles.badge}>
            <AppText variant="cartOutOfStock" align="center">
              {strings.cart.outOfStock}
            </AppText>
          </View>
          <Pressable onPress={onRemove} accessibilityRole="button" style={styles.remove}>
            <AppText variant="removeUnavailable" align="center">
              {strings.cart.remove}
            </AppText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.actions}>
          <QuantityStepper
            variant="cart"
            qty={line.qty}
            canIncrement={canIncrement}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onBlockedIncrement={stockLimited ? onBlockedIncrement : undefined}
          />
          <Pressable onPress={onRemove} accessibilityRole="button" style={styles.remove}>
            <AppText variant="remove" align="center">
              {strings.cart.remove}
            </AppText>
          </Pressable>
        </View>
      )}
      </View>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderWidth: hairline,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    boxShadow: shadows.cartLine,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  unavailable: { opacity: 0.72 },
  thumb: {
    width: 60,
    height: 60,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: hairline,
    borderColor: colors.borderCard,
    backgroundColor: colors.thumbBg,
  },
  image: { width: 60, height: 60 },
  info: { flex: 1, minWidth: 0 },
  // Two lines are always reserved (min-height 2.4em), as on the site.
  nameBox: { marginTop: 4, minHeight: 34.56 },
  prices: { marginTop: 4, gap: 2.4 },
  stockMessage: { marginTop: 4 },
  actions: { flexShrink: 0, alignItems: 'flex-end', gap: 8, width: 68 },
  actionsUnavailable: { width: undefined, maxWidth: 120 },
  badge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: colors.outOfStockBg },
  remove: { alignSelf: 'stretch', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4, alignItems: 'center' },
});
