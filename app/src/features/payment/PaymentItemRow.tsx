import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ProductImage } from '@/components/ProductImage';
import type { ResolvedLine } from '@/hooks/useCartProducts';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';

/** One item on the payment page: an MUI Paper with the picture, name, size, quantity and unit price. */
export function PaymentItemRow({ item }: { item: ResolvedLine }) {
  const { product, variant, line } = item;
  const showMrp = variant.mrp !== undefined && variant.mrp > variant.price;
  return (
    <View style={styles.paper}>
      <ProductImage uri={variant.imageUrl ?? product.imageUrl} style={styles.image} contentFit="contain" />
      <View style={styles.text}>
        <AppText variant="productName" numberOfLines={2} style={styles.name}>
          {product.name}
        </AppText>
        {variant.label ? <AppText variant="muiBody2Muted">{strings.payment.weight(variant.label)}</AppText> : null}
        <AppText variant="muiBody2Muted">{strings.payment.qty(line.qty)}</AppText>
      </View>
      <View style={styles.prices}>
        {showMrp ? (
          <AppText variant="paymentMrp" strike align="right">
            {`₹${variant.mrp}`}
          </AppText>
        ) : null}
        <AppText variant="paymentPrice" align="right">{`₹${variant.price}`}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    marginBottom: 16,
    borderRadius: 4,
    backgroundColor: colors.surface,
    boxShadow: shadows.muiElevation1,
  },
  image: { width: 60, height: 60, borderRadius: 4 },
  text: { flex: 1, minWidth: 0 },
  // `.product-name`: two lines tall even for short names.
  name: { marginTop: 4, minHeight: 34.56 },
  prices: { alignItems: 'flex-end' },
});
