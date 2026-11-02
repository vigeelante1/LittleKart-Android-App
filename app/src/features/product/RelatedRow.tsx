import { MaterialIcons } from '@expo/vector-icons';
import type { Product } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ProductCard } from '@/components/ProductCard';
import { ProductImage } from '@/components/ProductImage';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';

interface Props {
  title: string;
  products: readonly Product[];
  /** Width available inside the page's padding. */
  width: number;
  onOpenOptions: (product: Product) => void;
  /** "View more" (opens the category); hidden when absent. */
  onViewMore?: () => void;
}

const GAP = 12;

/** "Similar products" / "Popular in this category": a sideways row of cards with ‹ › buttons and "View more". */
export function RelatedRow({ title, products, width, onOpenOptions, onViewMore }: Props) {
  const scroller = useRef<ScrollView>(null);
  const [x, setX] = useState(0);
  if (products.length === 0) return null;

  const inner = width - 28;
  const cardWidth = (inner - GAP) / 2;
  const step = cardWidth + GAP;
  const maxX = Math.max(0, products.length * step - GAP - inner);
  const go = (dir: 1 | -1) => scroller.current?.scrollTo({ x: Math.min(maxX, Math.max(0, x + dir * step * 2)), animated: true });

  return (
    <View style={styles.section}>
      <AppText variant="pdpSection" style={styles.title}>
        {title}
      </AppText>
      <View>
        <ScrollView
          ref={scroller}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={step}
          decelerationRate="fast"
          onScroll={(e) => setX(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={32}
          contentContainerStyle={styles.row}
        >
          {products.map((p) => (
            <View key={p.id} style={{ width: cardWidth }}>
              <ProductCard product={p} onOpenOptions={onOpenOptions} layout="compact" />
            </View>
          ))}
        </ScrollView>
        {x > 4 ? (
          <Pressable onPress={() => go(-1)} accessibilityRole="button" accessibilityLabel={strings.productPage.previous} style={[styles.arrow, styles.left]}>
            <MaterialIcons name="chevron-left" size={26} color={colors.textBody} />
          </Pressable>
        ) : null}
        {x < maxX - 4 ? (
          <Pressable onPress={() => go(1)} accessibilityRole="button" accessibilityLabel={strings.productPage.next} style={[styles.arrow, styles.right]}>
            <MaterialIcons name="chevron-right" size={26} color={colors.textBody} />
          </Pressable>
        ) : null}
      </View>

      {onViewMore ? (
        <Pressable onPress={onViewMore} accessibilityRole="button" style={styles.moreWrap}>
          <LinearGradient colors={colors.seeAllGradient} style={styles.more}>
            <View style={styles.thumbs}>
              {products.slice(0, 3).map((p, i) => (
                <View key={p.id} style={[styles.thumb, i > 0 && styles.thumbOverlap, { zIndex: 3 - i }]}>
                  <ProductImage uri={p.variants[0]?.imageUrl ?? p.imageUrl} contentFit="cover" />
                </View>
              ))}
            </View>
            <AppText variant="seeAll" style={styles.moreLabel}>
              {strings.productPage.viewMore}
            </AppText>
            <MaterialIcons name="chevron-right" size={20} color={colors.greenDeep} />
          </LinearGradient>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    padding: 14,
    borderRadius: 18,
    borderWidth: hairline,
    borderColor: colors.recBorder,
    backgroundColor: colors.surface,
    boxShadow: shadows.recSection,
  },
  title: { marginBottom: 12 },
  row: { gap: GAP, paddingVertical: 4 },
  arrow: {
    position: 'absolute',
    top: '42%',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadows.pdpRound,
  },
  left: { left: -6 },
  right: { right: -6 },
  moreWrap: { marginTop: 14, borderRadius: 12, boxShadow: shadows.seeAll },
  more: {
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
  moreLabel: { flex: 1, minWidth: 0 },
});
