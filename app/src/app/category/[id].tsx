import type { Product } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { BackPill } from '@/components/BackPill';
import { ViewCartPill, useViewCartPillSpace } from '@/components/ViewCartPill';
import { CategoryRail } from '@/features/category/CategoryRail';
import { CategorySearch } from '@/features/category/CategorySearch';
import { useCategory } from '@/features/category/useCategory';
import { VariantDialog } from '@/features/category/VariantDialog';
import { ListingChips } from '@/features/listing/ListingChips';
import { ProductGrid } from '@/features/listing/ProductGrid';
import { useListing } from '@/features/listing/useListing';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';

/**
 * Category product list: one screen for every category (DECISIONS D-06; DESIGN_SPEC S6, S14; littlekart.com /category).
 * Params: id = home tile, title = tile label (shown until the sub-categories load), from = "tile" | "banner".
 */
export default function CategoryScreen() {
  const params = useLocalSearchParams<{ id: string; title?: string; from?: string }>();
  const category = useCategory(params.id);
  const selectedId = category.selected?.id ?? null;
  // Picking another sub-category starts with no filters.
  const listing = useListing(category.products, selectedId ?? '');
  const [options, setOptions] = useState<Product | null>(null);
  const pillSpace = useViewCartPillSpace();

  const title = category.selected?.name ?? params.title ?? '';
  // The site shows the search box only when the page is opened from a Home tile.
  const showSearch = params.from !== 'banner';
  const openOptions = useCallback((p: Product) => setOptions(p), []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.page}>
        <View style={styles.header}>
          <BackPill />
          <AppText variant="categoryTitle" numberOfLines={1} style={styles.title}>
            {title}
          </AppText>
        </View>

        <View style={styles.body}>
          <CategoryRail items={category.subCategories} selectedId={selectedId} onSelect={category.select} />

          <ScrollView
            style={styles.main}
            contentContainerStyle={[styles.mainContent, { paddingBottom: Math.max(128, pillSpace) }]}
            stickyHeaderIndices={[0]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.sticky}>
              {showSearch ? (
                <LinearGradient colors={[colors.surface2, colors.surface]} style={styles.hero}>
                  <CategorySearch value={category.query} onChange={category.setQuery} placeholder={strings.category.searchIn(title)} />
                </LinearGradient>
              ) : null}
              <View style={styles.chips}>
                <ListingChips listing={listing} />
              </View>
            </View>

            {listing.emptyMessage ? (
              <AppText variant="listMessage" align="center" style={styles.message}>
                {listing.emptyMessage}
              </AppText>
            ) : (
              <ProductGrid products={listing.visible} onOpenOptions={openOptions} />
            )}
          </ScrollView>
        </View>
      </View>

      <ViewCartPill />
      <VariantDialog product={options} onClose={() => setOptions(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  // The site's page container leaves 12 px on each side.
  page: { flex: 1, marginHorizontal: 12 },
  header: { height: 58, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, backgroundColor: colors.surface },
  title: { flexShrink: 1 },
  body: { flex: 1, flexDirection: 'row' },
  main: { flex: 1, backgroundColor: colors.categoryPanel },
  mainContent: { paddingTop: 4, paddingRight: 4, paddingLeft: 2 },
  sticky: { marginTop: -4, marginLeft: -2, marginRight: -4 },
  hero: {
    padding: 8,
    borderWidth: hairline,
    borderColor: colors.heroBorder,
    boxShadow: shadows.categoryHero,
  },
  chips: { paddingVertical: 2, paddingLeft: 2, paddingRight: 4, backgroundColor: colors.surface },
  message: { paddingTop: 12 },
});
