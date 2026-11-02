import { MaterialIcons } from '@expo/vector-icons';
import type { SwapOffer } from '@littlekart/shared';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ProductImage } from '@/components/ProductImage';
import { colors, hairline } from '@/theme';
import { strings } from '@/strings';
import { englishName } from './englishName';

interface Props {
  offer: SwapOffer;
  onPress: () => void;
}

/** "Swap & save ₹X" under a cart line (iteration 2, DECISIONS D-91): opens the side-by-side comparison. */
export function SwapStrip({ offer, onPress }: Props) {
  const variant = offer.product.variants.find((v) => v.id === offer.variantId);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={strings.cart.swapStrip(offer.saving)}
      style={({ pressed }) => [styles.strip, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <MaterialIcons name="swap-horiz" size={18} color={colors.primary} />
      </View>
      <View style={styles.text}>
        <AppText variant="swapStrip" numberOfLines={1}>
          {strings.cart.swapStrip(offer.saving)}
        </AppText>
        <AppText variant="swapHint" numberOfLines={1}>
          {strings.cart.swapStripHint(englishName(offer.product.name))}
        </AppText>
      </View>
      <View style={styles.thumb}>
        <ProductImage uri={variant?.imageUrl ?? offer.product.imageUrl} style={styles.image} />
      </View>
      <MaterialIcons name="chevron-right" size={20} color={colors.greenDeep} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 10,
    borderWidth: hairline,
    borderColor: colors.seeAllBorder,
    backgroundColor: colors.primaryLight,
  },
  pressed: { opacity: 0.85 },
  icon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  text: { flex: 1, minWidth: 0 },
  thumb: {
    width: 34,
    height: 34,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: hairline,
    borderColor: colors.borderCard,
    backgroundColor: colors.surface,
  },
  image: { width: 34, height: 34 },
});
