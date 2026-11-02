import { MaterialIcons } from '@expo/vector-icons';
import type { Product } from '@littlekart/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { BackPill } from '@/components/BackPill';
import { VariantDialog } from '@/features/category/VariantDialog';
import { useDock } from '@/features/dock/useDock';
import { NutritionInfo } from '@/features/product/NutritionInfo';
import { ProductDetails } from '@/features/product/ProductDetails';
import { ProductGallery } from '@/features/product/ProductGallery';
import { ProductSummary } from '@/features/product/ProductSummary';
import { RelatedRow } from '@/features/product/RelatedRow';
import { useProduct, useRelated } from '@/features/product/useProduct';
import { useShelfName } from '@/features/product/useShelfName';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';

/**
 * Product page (iteration 2, DECISIONS D-97), laid out like the live LittleKart app: pictures, name, net quantity,
 * price with MRP and saving, "Select Unit", Add to cart, Fast delivery, Description, View more info, then
 * "Similar products" and "Popular in this category". Opened from any product card, deal or cart line.
 */
export default function ProductScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const { product, missing } = useProduct(id);
  const related = useRelated(id);
  const shelfName = useShelfName(product?.categoryId ?? null, related?.tileId ?? null);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [options, setOptions] = useState<Product | null>(null);
  const dockSpace = useDock().space;
  const openOptions = useCallback((p: Product) => setOptions(p), []);

  const variant = product?.variants.find((v) => v.id === variantId) ?? product?.variants.find((v) => v.stock > 0) ?? product?.variants[0];
  const pageWidth = width - 24;

  const share = () => {
    if (!product || !variant) return;
    void Share.share({ message: strings.productPage.shareMessage(product.name, variant.label, variant.price) }).catch(() => undefined);
  };
  const viewMore = related?.tileId ? () => router.push({ pathname: '/category/[id]', params: { id: related.tileId ?? '', from: 'tile' } }) : undefined;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <BackPill />
        <View style={styles.actions}>
          <Pressable onPress={() => router.push('/search')} accessibilityRole="button" accessibilityLabel={strings.productPage.search} style={styles.round}>
            <MaterialIcons name="search" size={24} color={colors.textBody} />
          </Pressable>
          <Pressable onPress={share} accessibilityRole="button" accessibilityLabel={strings.productPage.share} style={styles.round}>
            <MaterialIcons name="ios-share" size={22} color={colors.textBody} />
          </Pressable>
        </View>
      </View>

      {product && variant ? (
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 24 + dockSpace }]} showsVerticalScrollIndicator={false}>
          <ProductGallery product={product} variant={variant} width={pageWidth} />
          <View style={styles.paper}>
            <ProductSummary product={product} variant={variant} onSelectVariant={setVariantId} />
            <ProductDetails product={product} shelfName={shelfName} />
          </View>
          {product.nutrition ? <NutritionInfo nutrition={product.nutrition} /> : null}
          {related ? (
            <>
              <RelatedRow title={strings.productPage.similar} products={related.similar} width={pageWidth} onOpenOptions={openOptions} onViewMore={viewMore} />
              <RelatedRow title={strings.productPage.popular} products={related.popular} width={pageWidth} onOpenOptions={openOptions} onViewMore={viewMore} />
            </>
          ) : null}
        </ScrollView>
      ) : missing ? (
        <View style={styles.center}>
          <AppText variant="pdpBody">{strings.productPage.notFound}</AppText>
        </View>
      ) : (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
      <VariantDialog product={options} onClose={() => setOptions(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  actions: { flexDirection: 'row', gap: 12 },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadows.pdpRound,
  },
  scroll: { paddingHorizontal: 12, paddingTop: 8 },
  paper: { padding: 20, borderRadius: 18, backgroundColor: colors.surface, boxShadow: shadows.recSection },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
