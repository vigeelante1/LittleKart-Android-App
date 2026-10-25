import type { Product } from '@littlekart/shared';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { BackPill } from '@/components/BackPill';
import { ViewCartPill, useViewCartPillSpace } from '@/components/ViewCartPill';
import { VariantDialog } from '@/features/category/VariantDialog';
import { ProductGrid } from '@/features/listing/ProductGrid';
import { useHomeData } from '@/hooks/useHomeData';
import { colors, hairline } from '@/theme';
import { strings } from '@/strings';

/** The site shows deals 20 at a time, with "Load more" under the grid. */
const PAGE = 20;

/** "View all >" on the Home deals row (littlekart.com /deals/:id): header, title card, 2-column grid. */
export default function DealsScreen() {
  const { data } = useHomeData();
  const deals = data?.deals ?? [];
  const [count, setCount] = useState(PAGE);
  const [options, setOptions] = useState<Product | null>(null);
  const pillSpace = useViewCartPillSpace();
  const openOptions = useCallback((p: Product) => setOptions(p), []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.page}>
        <View style={styles.header}>
          <BackPill />
          <AppText variant="muiH6Semi" numberOfLines={1} style={styles.title}>
            {strings.home.dealsTitle}
          </AppText>
        </View>
        <ScrollView
          style={styles.main}
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(240, pillSpace) }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <AppText variant="muiH6Bold">{strings.home.dealsTitle}</AppText>
          </View>
          <ProductGrid products={deals.slice(0, count)} onOpenOptions={openOptions} />
          {deals.length > count ? (
            <View style={styles.more}>
              <Pressable onPress={() => setCount((c) => c + PAGE)} accessibilityRole="button" style={styles.moreButton}>
                <AppText variant="viewAll">{strings.home.loadMore}</AppText>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </View>
      <ViewCartPill />
      <VariantDialog product={options} onClose={() => setOptions(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  page: { flex: 1, marginHorizontal: 12 },
  header: { height: 58, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, backgroundColor: colors.surface },
  title: { flexShrink: 1 },
  main: { flex: 1, backgroundColor: colors.categoryPanel },
  content: { paddingTop: 4, paddingRight: 4, paddingLeft: 2 },
  hero: {
    marginBottom: 16,
    padding: 10,
    borderRadius: 14,
    borderWidth: hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  more: { alignItems: 'center', marginTop: 16 },
  moreButton: { paddingVertical: 5.6, paddingHorizontal: 2.4 },
});
