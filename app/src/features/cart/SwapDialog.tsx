import { MaterialIcons } from '@expo/vector-icons';
import { formatRupee, type Product, type SwapOffer, type Variant } from '@littlekart/shared';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { DialogActions } from '@/components/dialog/DialogActions';
import { DialogBadge } from '@/components/dialog/DialogBadge';
import { DialogButton } from '@/components/dialog/DialogButton';
import { DialogShell } from '@/components/dialog/DialogShell';
import { ProductImage } from '@/components/ProductImage';
import type { ResolvedLine } from '@/hooks/useCartProducts';
import { colors, hairline } from '@/theme';
import { strings } from '@/strings';

interface Props {
  /** The cart line and its offer; null hides the pop-up. */
  swap: { item: ResolvedLine; offer: SwapOffer } | null;
  onSwap: () => void;
  onDecline: () => void;
  onClose: () => void;
}

/** Side-by-side "Swap & save" comparison (iteration 2, DECISIONS D-91), in the D-83 pop-up design. */
export function SwapDialog({ swap, onSwap, onDecline, onClose }: Props) {
  const next = swap?.offer.product.variants.find((v) => v.id === swap.offer.variantId);
  return (
    <DialogShell visible={swap !== null && next !== undefined} onClose={onClose}>
      {swap && next ? (
        <>
          <DialogBadge icon="swap-horiz" tone="success" />
          <AppText variant="muiH6Dialog" align="center">
            {strings.cart.swapTitle}
          </AppText>
          <AppText variant="muiBody2Muted" align="center" style={styles.message}>
            {strings.cart.swapMessage}
          </AppText>

          <View style={styles.compare}>
            <Side label={strings.cart.swapNow} product={swap.item.product} variant={swap.item.variant} />
            <View style={styles.arrow}>
              <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
            </View>
            <Side label={strings.cart.swapNew} product={swap.offer.product} variant={next} highlight />
          </View>

          <View style={styles.saving}>
            <MaterialIcons name="savings" size={18} color={colors.couponSaveText} />
            <AppText variant="swapSaving">
              {strings.cart.swapTotalSaving(swap.offer.saving * swap.item.line.qty, swap.item.line.qty)}
            </AppText>
          </View>

          <DialogActions>
            <DialogButton kind="secondary" label={strings.cart.swapDecline} onPress={onDecline} />
            <DialogButton kind="primary" icon="swap-horiz" label={strings.cart.swapConfirm} onPress={onSwap} />
          </DialogActions>
        </>
      ) : null}
    </DialogShell>
  );
}

function Side({ label, product, variant, highlight }: { label: string; product: Product; variant: Variant; highlight?: boolean }) {
  return (
    <View style={[styles.side, highlight && styles.sideNew]}>
      <AppText variant={highlight ? 'swapLabelNew' : 'swapLabel'} align="center">
        {label}
      </AppText>
      <View style={styles.thumb}>
        <ProductImage uri={variant.imageUrl ?? product.imageUrl} style={styles.image} accessibilityLabel={product.name} />
      </View>
      <AppText variant="cartName" align="center" numberOfLines={2} style={styles.name}>
        {product.name}
      </AppText>
      <AppText variant="swapHint" align="center">
        {variant.label}
      </AppText>
      <AppText variant={highlight ? 'swapPriceNew' : 'swapPriceOld'} align="center" style={styles.price}>
        {formatRupee(variant.price)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  message: { marginTop: 4, marginBottom: 16 },
  compare: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 6 },
  arrow: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  side: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sideNew: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primaryLight },
  thumb: {
    width: 76,
    height: 76,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: hairline,
    borderColor: colors.borderCard,
    backgroundColor: colors.surface,
  },
  image: { width: 76, height: 76 },
  name: { marginTop: 8, minHeight: 34.56 },
  price: { marginTop: 4 },
  saving: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.couponSaveBg,
  },
});
