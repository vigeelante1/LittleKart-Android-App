import { MaterialIcons } from '@expo/vector-icons';
import { MAX_UNITS_PER_PRODUCT, formatRupee, maxQtyForVariant, savingsAmount, type Product, type Variant } from '@littlekart/shared';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { qtyInCart, useCartStore } from '@/store';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { NutritionChips } from './NutritionInfo';

interface Props {
  product: Product;
  variant: Variant;
  onSelectVariant: (variantId: string) => void;
}

/** Name, size, price, MRP, saving, "Select Unit" chips and Add to cart / quantity (live app's product page). */
export function ProductSummary({ product, variant, onSelectVariant }: Props) {
  const lines = useCartStore((s) => s.lines);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const qty = qtyInCart(lines, product.id, variant.id);
  const canAdd = qty < maxQtyForVariant(lines, product.id, variant.id, variant.stock, MAX_UNITS_PER_PRODUCT);
  const saving = savingsAmount(variant.price, variant.mrp);
  const soldOut = variant.stock <= 0;
  const add = () => increment(product.id, variant.id, variant.stock);

  return (
    <View>
      <AppText variant="pdpName">{product.name}</AppText>
      <AppText variant="pdpNetQty" style={styles.gapS}>
        {strings.productPage.netQuantity(variant.label)}
      </AppText>
      <View style={[styles.prices, styles.gapM]}>
        <AppText variant="pdpPrice">{formatRupee(variant.price)}</AppText>
        {saving > 0 && variant.mrp !== undefined ? (
          <AppText variant="pdpMrp" strike>
            {strings.productPage.mrp(variant.mrp)}
          </AppText>
        ) : null}
      </View>
      {saving > 0 ? (
        <AppText variant="pdpOff" style={styles.gapS}>
          {strings.productPage.off(saving)}
        </AppText>
      ) : null}
      <AppText variant="pdpTaxes" style={styles.gapS}>
        {strings.productPage.taxes}
      </AppText>
      <NutritionChips nutrition={product.nutrition} />

      <AppText variant="pdpLabel" style={styles.gapL}>
        {strings.productPage.selectUnit}
      </AppText>
      <View style={styles.units}>
        {product.variants.map((v) => {
          const selected = v.id === variant.id;
          return (
            <Pressable
              key={v.id}
              onPress={() => onSelectVariant(v.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.unit, selected && styles.unitSelected, v.stock <= 0 && styles.unitSoldOut]}
            >
              <AppText variant={selected ? 'pdpUnitSelected' : 'pdpUnit'}>{v.label}</AppText>
            </Pressable>
          );
        })}
      </View>

      {qty === 0 ? (
        <Pressable
          onPress={add}
          disabled={soldOut || !canAdd}
          accessibilityRole="button"
          style={({ pressed }) => [styles.add, (soldOut || !canAdd) && styles.addOff, pressed && styles.pressed]}
        >
          <AppText variant="pdpAdd">{soldOut ? strings.productPage.outOfStock : strings.productPage.addToCart}</AppText>
        </Pressable>
      ) : (
        <View style={[styles.add, styles.stepper]}>
          <Pressable onPress={() => decrement(product.id, variant.id)} accessibilityRole="button" accessibilityLabel={strings.product.decrease} style={styles.stepButton}>
            <MaterialIcons name="remove" size={26} color={colors.white} />
          </Pressable>
          <AppText variant="pdpStepper">{qty}</AppText>
          <Pressable
            onPress={add}
            disabled={!canAdd}
            accessibilityRole="button"
            accessibilityLabel={strings.product.increase}
            style={[styles.stepButton, !canAdd && styles.dimmed]}
          >
            <MaterialIcons name="add" size={26} color={colors.white} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gapS: { marginTop: 6 },
  gapM: { marginTop: 12 },
  gapL: { marginTop: 22 },
  prices: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  units: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  unit: {
    minWidth: 72,
    height: 44,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  unitSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  unitSoldOut: { opacity: 0.5 },
  add: {
    marginTop: 24,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    boxShadow: shadows.pdpAdd,
  },
  addOff: { backgroundColor: colors.muiDisabledBg, boxShadow: shadows.none },
  pressed: { opacity: 0.9 },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6 },
  stepButton: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center' },
  dimmed: { opacity: 0.4 },
});
