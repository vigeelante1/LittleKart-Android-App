import { LinearGradient } from 'expo-linear-gradient';
import {
  cardTags,
  chipMinutes,
  discountPercent,
  isOutOfStock,
  MAX_UNITS_PER_PRODUCT,
  maxQtyForVariant,
  savingsAmount,
  type Product,
} from '@littlekart/shared';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useConfig } from '@/hooks/useConfig';
import { qtyInCart, useCartStore } from '@/store';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';
import { AddButton } from './AddButton';
import { AppText } from './AppText';
import { EtaChip } from './EtaChip';
import { OffRibbon } from './OffRibbon';
import { PriceChip } from './PriceChip';
import { ProductImage } from './ProductImage';
import { QuantityStepper } from './QuantityStepper';

export type ProductCardLayout = 'grid' | 'compact';

interface Props {
  product: Product;
  /** Opens the size picker (products with more than one size). */
  onOpenOptions: (product: Product) => void;
  /**
   * "grid": category and search grids (radius 10, image 126).
   * "compact": "Often bought together" in the cart (radius 14, image 110).
   */
  layout?: ProductCardLayout;
}

/** Product card from littlekart.com's product grid (reference/WEB_STYLES.md, "Product card"). */
export function ProductCard({ product, onOpenOptions, layout = 'grid' }: Props) {
  const config = useConfig();
  const lines = useCartStore((s) => s.lines);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const variant = product.variants[0];
  if (!variant) return null;

  const options = product.variants.length;
  const percent = discountPercent(variant.price, variant.mrp);
  const saving = savingsAmount(variant.price, variant.mrp);
  const qty = qtyInCart(lines, product.id, variant.id);
  const canAdd = qty < maxQtyForVariant(lines, product.id, variant.id, variant.stock, MAX_UNITS_PER_PRODUCT);
  const soldOut = isOutOfStock(product);
  const tags = cardTags(product);
  const compact = layout === 'compact';
  const openOptions = () => onOpenOptions(product);
  // Tapping the picture or the text opens the product page (iteration 2, DECISIONS D-97).
  const openProduct = () => router.push({ pathname: '/product/[id]', params: { id: product.id } });

  return (
    <View style={[styles.card, compact ? styles.cardCompact : styles.cardGrid, soldOut && styles.soldOut]}>
      <Pressable
        onPress={openProduct}
        accessibilityRole="button"
        accessibilityLabel={product.name}
        style={[styles.imageSection, compact && styles.imageSectionCompact]}
      >
        <View style={[styles.imageClip, compact && styles.imageClipCompact]}>
          <ProductImage
            uri={variant.imageUrl ?? product.imageUrl}
            style={[styles.image, compact && styles.imageCompact]}
            accessibilityLabel={product.name}
          />
        </View>
        {saving > 0 ? <OffRibbon percent={percent} saving={saving} /> : null}
      </Pressable>

      <View style={[styles.content, compact && styles.contentCompact]}>
        <Pressable onPress={openProduct} accessibilityRole="none" style={styles.info}>
          <EtaChip minutes={chipMinutes(config.eta, product.itemType)} />
          <PriceChip price={variant.price} mrp={variant.mrp} />
          {saving > 0 ? (
            <AppText variant="cardSavings" style={styles.savings}>
              {strings.product.rupeesOff(saving)}
            </AppText>
          ) : null}
          <View style={styles.nameBox}>
            <AppText variant="cardName" numberOfLines={2}>
              {product.name}
            </AppText>
          </View>
          {/* Grey line under the name (the site's brand line, e.g. "Classmate 300 pages"). */}
          {product.subtitle ? (
            <AppText variant="cardBrand" numberOfLines={1} style={styles.brand}>
              {product.subtitle}
            </AppText>
          ) : null}
          <View style={styles.weightRow}>
            <AppText variant="cardWeight" numberOfLines={1} style={options > 1 ? styles.weightWithOptions : undefined}>
              {variant.label}
            </AppText>
            {options > 1 ? (
              <AppText variant="cardOptions" onPress={openOptions} suppressHighlighting>
                {strings.product.options(options)}
              </AppText>
            ) : null}
          </View>
          {/* The site reserves this row with invisible text ("Only 9 left"). Iteration 2 (D-101): it shows the
              product's nutrition tags, e.g. "High protein · No trans-fat", when its numbers support them. */}
          <View style={styles.spacer}>
            {tags.length > 0 ? (
              <AppText variant="cardTags" numberOfLines={1}>
                {tags.map((t) => strings.nutritionTags[t]).join(' · ')}
              </AppText>
            ) : null}
          </View>
        </Pressable>

        <LinearGradient
          colors={[colors.cardBarFadeStart, colors.surface2, colors.surface2]}
          locations={[0, 0.28, 1]}
          style={[styles.bar, compact && styles.barCompact]}
        >
          {options > 1 ? (
            <AddButton onPress={openOptions} optionsCount={options} disabled={soldOut} />
          ) : qty > 0 ? (
            <QuantityStepper
              variant="card"
              qty={qty}
              canIncrement={canAdd}
              onIncrement={() => increment(product.id, variant.id, variant.stock)}
              onDecrement={() => decrement(product.id, variant.id)}
            />
          ) : (
            <AddButton onPress={() => increment(product.id, variant.id, variant.stock)} disabled={soldOut || !canAdd} />
          )}
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.surface, borderWidth: hairline, borderColor: colors.borderSoft },
  cardGrid: { borderRadius: 10, boxShadow: shadows.gridCard },
  cardCompact: { borderRadius: 14, boxShadow: shadows.recCard, overflow: 'hidden' },
  soldOut: { opacity: 0.55 },
  imageSection: {
    minHeight: 138,
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imageSectionCompact: { minHeight: 118, maxHeight: 118, paddingTop: 8, paddingHorizontal: 8, paddingBottom: 0 },
  imageClip: { width: '100%', height: 126, borderRadius: 8, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  imageClipCompact: { height: 110, borderRadius: 10 },
  // The site zooms product photos to 145% inside the clip; our pictures already fill 78% of their square,
  // so 122% shows the whole item without cutting its edges (iteration 2, DECISIONS D-94).
  image: { width: '100%', height: 126, transform: [{ scale: 1.22 }] },
  imageCompact: { height: 110 },
  content: { flex: 1, paddingHorizontal: 8, paddingTop: 4, paddingBottom: 2.8 },
  contentCompact: { paddingBottom: 8 },
  info: { flexGrow: 1, minHeight: 104, alignItems: 'flex-start', marginTop: 0.8 },
  savings: { marginTop: 2.8 },
  nameBox: { height: 29.18, marginTop: 3.6, alignSelf: 'stretch' },
  brand: { marginBottom: 0.8, alignSelf: 'stretch' },
  weightRow: { minHeight: 16, marginTop: 1.2, flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'stretch' },
  weightWithOptions: { maxWidth: '68%' },
  spacer: { minHeight: 20, marginTop: 1.2, justifyContent: 'center', alignSelf: 'stretch' },
  bar: {
    minHeight: 44,
    marginTop: 'auto',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 5.2,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: hairline,
    borderTopColor: colors.cardBarTop,
  },
  // Small cards (three in a row): the ADD button uses the card's full inner width so its text fits.
  barCompact: { paddingHorizontal: 0 },
});
