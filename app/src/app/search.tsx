import type { Product } from '@littlekart/shared';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { useDock } from '@/features/dock/useDock';
import { VariantDialog } from '@/features/category/VariantDialog';
import { ListingChips } from '@/features/listing/ListingChips';
import { ProductGrid } from '@/features/listing/ProductGrid';
import { useListing } from '@/features/listing/useListing';
import { SearchBar } from '@/features/search/SearchBar';
import { useProductSearch } from '@/features/search/useProductSearch';
import { colors } from '@/theme';
import { strings } from '@/strings';

/** Search (DESIGN_SPEC S13; littlekart.com /search): bar with Back pill, then filter chips and the product grid. */
export default function SearchScreen() {
  const [text, setText] = useState('');
  const search = useProductSearch(text);
  const listing = useListing(search.products, search.query);
  const [options, setOptions] = useState<Product | null>(null);
  const pillSpace = useDock().space;
  const openOptions = useCallback((p: Product) => setOptions(p), []);

  const hasResults = search.products.length > 0;
  const noResults = search.done && !hasResults;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        stickyHeaderIndices={[0]}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.container, { paddingBottom: pillSpace }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <SearchBar value={text} onChange={setText} />
        </View>

        {hasResults ? (
          <>
            <ListingChips listing={listing} />
            {listing.emptyMessage ? (
              <AppText variant="listMessage" align="center" style={styles.message}>
                {listing.emptyMessage}
              </AppText>
            ) : (
              <ProductGrid products={listing.visible} onOpenOptions={openOptions} />
            )}
          </>
        ) : null}

        {noResults ? (
          <View style={styles.empty}>
            <AppText variant="searchEmptyTitle" align="center">
              {strings.search.noResults(search.query)}
            </AppText>
            <AppText variant="searchEmptySub" align="center" style={styles.emptySub}>
              {strings.search.noResultsSub}
            </AppText>
          </View>
        ) : null}
      </ScrollView>
      <VariantDialog product={options} onClose={() => setOptions(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  // The site's container: 24 px top margin, 12 px sides, padding 7.2 / 8.8.
  container: { marginHorizontal: 12, marginTop: 24, paddingHorizontal: 8.8, paddingTop: 7.2 },
  header: { paddingTop: 4, paddingBottom: 8, marginBottom: 5.6, backgroundColor: colors.searchHeaderBg },
  message: { paddingTop: 12 },
  empty: { paddingTop: 16, paddingHorizontal: 16 },
  emptySub: { marginTop: 8 },
});
