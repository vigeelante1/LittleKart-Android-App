import type { Product, Variant } from '@littlekart/shared';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ProductImage } from '@/components/ProductImage';
import { colors } from '@/theme';
import { strings } from '@/strings';

interface Props {
  product: Product;
  variant: Variant;
  width: number;
}

/** Product pictures, swiped sideways, with dots under them when there is more than one (live app's product page). */
export function ProductGallery({ product, variant, width }: Props) {
  const images = [...new Set([variant.imageUrl ?? product.imageUrl, product.imageUrl, ...product.variants.map((v) => v.imageUrl)].filter((u): u is string => !!u))];
  const [page, setPage] = useState(0);
  const size = Math.min(width, 360);

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ width }}
      >
        {images.map((uri, i) => (
          <View key={uri} style={[styles.page, { width }]}>
            <ProductImage uri={uri} style={{ width: size, height: size }} accessibilityLabel={strings.productPage.image(i + 1, images.length)} />
          </View>
        ))}
      </ScrollView>
      {images.length > 1 ? (
        <View style={styles.dots}>
          {images.map((uri, i) => (
            <View key={uri} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingBottom: 16 },
  page: { alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 6, marginTop: 12 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.radioIdle },
  dotActive: { backgroundColor: colors.text },
});
