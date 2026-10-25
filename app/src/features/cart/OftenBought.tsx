import { MaterialIcons } from '@expo/vector-icons';
import type { Product } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ProductImage } from '@/components/ProductImage';
import { ProductGrid } from '@/features/listing/ProductGrid';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';
import { RecommendationsSheet } from './RecommendationsSheet';

/** Six cards on a phone; the rest open in a sheet from "View more". */
const VISIBLE = 6;

interface Props {
  products: readonly Product[];
  onOpenOptions: (product: Product) => void;
}

/** "Often bought together" card in the cart (littlekart.com cart-recommendations-section). */
export function OftenBought({ products, onOpenOptions }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  if (products.length === 0) return null;
  const visible = products.slice(0, VISIBLE);
  const thumbs = products.slice(VISIBLE, VISIBLE + 3);

  return (
    <View style={styles.section}>
      <AppText variant="recTitle" style={styles.title}>
        {strings.cart.oftenBought}
      </AppText>
      <ProductGrid products={visible} onOpenOptions={onOpenOptions} columns={3} layout="compact" />

      {products.length > VISIBLE ? (
        <Pressable onPress={() => setSheetOpen(true)} accessibilityRole="button" style={styles.seeAllWrap}>
          <LinearGradient colors={colors.seeAllGradient} style={styles.seeAll}>
            <View style={styles.thumbs}>
              {thumbs.map((p, i) => (
                <View key={p.id} style={[styles.thumb, i > 0 && styles.thumbOverlap, { zIndex: 3 - i }]}>
                  <ProductImage uri={p.variants[0]?.imageUrl ?? p.imageUrl} contentFit="cover" />
                </View>
              ))}
            </View>
            <AppText variant="seeAll" style={styles.seeAllLabel}>
              {strings.cart.viewMore}
            </AppText>
            <MaterialIcons name="chevron-right" size={20} color={colors.greenDeep} />
          </LinearGradient>
        </Pressable>
      ) : null}

      <RecommendationsSheet
        visible={sheetOpen}
        products={products}
        onClose={() => setSheetOpen(false)}
        onOpenOptions={onOpenOptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 14,
    padding: 10,
    borderWidth: hairline,
    borderColor: colors.recBorder,
    borderRadius: 14,
    backgroundColor: colors.surface,
    boxShadow: shadows.recSection,
  },
  title: { marginBottom: 10 },
  seeAllWrap: { marginTop: 14, borderRadius: 12, boxShadow: shadows.seeAll },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.seeAllBorder,
  },
  thumbs: { flexDirection: 'row', alignItems: 'center', minWidth: 52 },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.border,
    overflow: 'hidden',
    boxShadow: shadows.seeAllThumb,
  },
  thumbOverlap: { marginLeft: -8 },
  seeAllLabel: { flex: 1, minWidth: 0 },
});
