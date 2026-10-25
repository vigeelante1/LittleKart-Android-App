import { MaterialIcons } from '@expo/vector-icons';
import {
  formatRupee,
  MAX_UNITS_PER_PRODUCT,
  maxQtyForVariant,
  savingsAmount,
  type Product,
} from '@littlekart/shared';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AddButton } from '@/components/AddButton';
import { AppText } from '@/components/AppText';
import { ProductImage } from '@/components/ProductImage';
import { QuantityStepper } from '@/components/QuantityStepper';
import { qtyInCart, useCartStore } from '@/store';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';

interface Props {
  product: Product | null;
  onClose: () => void;
}

/** Size picker: one row per size with image, label, price, ADD or stepper (littlekart.com product card dialog). */
export function VariantDialog({ product, onClose }: Props) {
  const lines = useCartStore((s) => s.lines);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);

  return (
    <Modal visible={product !== null} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="none" />
        {product ? (
          <View style={styles.paper}>
            <View style={styles.titleBox}>
              <AppText variant="variantTitle" style={styles.title}>
                {product.name}
              </AppText>
              <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={strings.common.close} hitSlop={6} style={styles.close}>
                <MaterialIcons name="close" size={20} color={colors.dialogClose} />
              </Pressable>
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.rows} bounces={false}>
              {product.variants.map((variant) => {
                const qty = qtyInCart(lines, product.id, variant.id);
                const canAdd = qty < maxQtyForVariant(lines, product.id, variant.id, variant.stock, MAX_UNITS_PER_PRODUCT);
                const saving = savingsAmount(variant.price, variant.mrp);
                const add = () => increment(product.id, variant.id, variant.stock);
                return (
                  <View key={variant.id} style={styles.row}>
                    <View style={styles.thumb}>
                      <ProductImage uri={variant.imageUrl ?? product.imageUrl} style={styles.thumbImage} />
                    </View>
                    <View style={styles.info}>
                      <AppText variant="variantLabel">{variant.label}</AppText>
                      <View style={styles.prices}>
                        <View style={styles.priceChip}>
                          <AppText variant="variantPrice">{formatRupee(variant.price)}</AppText>
                        </View>
                        {variant.mrp !== undefined && variant.mrp > variant.price ? (
                          <AppText variant="variantMrp" strike>
                            {formatRupee(variant.mrp)}
                          </AppText>
                        ) : null}
                      </View>
                      {saving > 0 ? (
                        <AppText variant="variantSaving" style={styles.saving}>
                          {strings.product.rupeesOff(saving)}
                        </AppText>
                      ) : null}
                    </View>
                    <View style={styles.action}>
                      {qty > 0 ? (
                        <QuantityStepper
                          variant="dialog"
                          qty={qty}
                          canIncrement={canAdd}
                          onIncrement={add}
                          onDecrement={() => decrement(product.id, variant.id)}
                        />
                      ) : (
                        <AddButton compact onPress={add} disabled={variant.stock <= 0 || !canAdd} />
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, backgroundColor: colors.dialogBackdrop },
  paper: {
    width: '100%',
    maxWidth: 444,
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    boxShadow: shadows.muiElevation24,
  },
  titleBox: { paddingTop: 16, paddingHorizontal: 20, paddingBottom: 8 },
  title: { paddingRight: 32 },
  close: { position: 'absolute', top: 8, right: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 0 },
  rows: { gap: 10, paddingHorizontal: 16, paddingBottom: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.borderSoft,
    backgroundColor: colors.variantRowBg,
    boxShadow: shadows.variantRow,
  },
  thumb: { width: 52, height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: colors.surface },
  thumbImage: { width: 48, height: 48 },
  info: { flex: 1, minWidth: 0 },
  prices: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4.8, marginTop: 2.8 },
  priceChip: { minHeight: 22, paddingHorizontal: 6.56, borderRadius: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryDark },
  saving: { marginTop: 2.4 },
  action: { width: 96, alignItems: 'center', justifyContent: 'center' },
});
