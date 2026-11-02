import { MaterialIcons } from '@expo/vector-icons';
import { formatRupee, type Product } from '@littlekart/shared';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ProductImage } from '@/components/ProductImage';
import { colors, hairline } from '@/theme';
import { strings } from '@/strings';
import type { AiLine } from './askAiStore';

interface Props {
  line: AiLine;
  product: Product | undefined;
  onToggle: () => void;
  onQty: (delta: number) => void;
}

/** One suggested product: tick box, picture, name, size and use, price and a small − qty + stepper. */
export function AiItemRow({ line, product, onToggle, onQty }: Props) {
  const variant = product?.variants.find((v) => v.id === line.variantId);
  if (!product || !variant) return null;
  const soldOut = variant.stock <= 0;
  return (
    <View style={[styles.row, !line.selected && styles.off]}>
      <Pressable
        onPress={onToggle}
        disabled={soldOut}
        accessibilityRole="checkbox"
        aria-checked={line.selected}
        aria-disabled={soldOut}
        accessibilityLabel={product.name}
        hitSlop={6}
        style={styles.main}
      >
        <MaterialIcons name={line.selected ? 'check-box' : 'check-box-outline-blank'} size={22} color={line.selected ? colors.primary : colors.radioIdle} />
        <ProductImage uri={variant.imageUrl ?? product.imageUrl} style={styles.image} />
        <View style={styles.text}>
          <AppText variant="aiItemName" numberOfLines={2}>
            {product.name}
          </AppText>
          <AppText variant="aiItemMeta" numberOfLines={1}>
            {soldOut ? strings.ai.soldOut : line.note ? `${variant.label} · ${line.note}` : variant.label}
          </AppText>
          <AppText variant="aiItemPrice">{formatRupee(variant.price * line.qty)}</AppText>
        </View>
      </Pressable>
      <View style={styles.stepper}>
        <Pressable onPress={() => onQty(-1)} disabled={line.qty <= 1} accessibilityRole="button" accessibilityLabel={strings.ai.decrease} hitSlop={6} style={styles.step}>
          <MaterialIcons name="remove" size={16} color={line.qty <= 1 ? colors.radioIdle : colors.primaryDark} />
        </Pressable>
        <AppText variant="aiQty">{line.qty}</AppText>
        <Pressable onPress={() => onQty(1)} accessibilityRole="button" accessibilityLabel={strings.ai.increase} hitSlop={6} style={styles.step}>
          <MaterialIcons name="add" size={16} color={colors.primaryDark} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderTopWidth: hairline, borderTopColor: colors.optionDivider },
  off: { opacity: 0.6 },
  main: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
  image: { width: 44, height: 44, borderRadius: 8, backgroundColor: colors.surface2 },
  text: { flex: 1, minWidth: 0, gap: 1 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    height: 30,
    borderRadius: 15,
    borderWidth: hairline,
    borderColor: colors.addGreenBorder,
    backgroundColor: colors.primaryLight,
  },
  step: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
});
