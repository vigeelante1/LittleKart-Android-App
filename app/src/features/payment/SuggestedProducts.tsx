import type { Id, Product } from '@littlekart/shared';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ProductCard } from '@/components/ProductCard';
import { useRecommendations } from '@/features/cart/useRecommendations';
import { VariantDialog } from '@/features/category/VariantDialog';
import { strings } from '@/strings';

/** Ten cards in one swipeable row; the cart page already shows the full list. */
const MAX_ON_PAYMENT = 10;

/**
 * "Suggested products" row on the payment page (iteration 2, DECISIONS D-90): the same smart suggestions as
 * the cart, as one sideways row of the cart's compact cards. ADD puts the product in the cart, and the
 * bill above updates (useLiveCheckout).
 */
export function SuggestedProducts({ cartProductIds }: { cartProductIds: readonly Id[] }) {
  // Asked once for the cart as it was when the page opened, so the row doesn't reshuffle while adding.
  const [ids] = useState(() => [...cartProductIds]);
  const products = useRecommendations(ids, MAX_ON_PAYMENT);
  const [options, setOptions] = useState<Product | null>(null);
  if (products.length === 0) return null;

  return (
    <View style={styles.section}>
      <AppText variant="muiH6Bold" style={styles.title}>
        {strings.payment.suggested}
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {products.map((p) => (
          <View key={p.id} style={styles.card}>
            <ProductCard product={p} onOpenOptions={setOptions} layout="compact" />
          </View>
        ))}
      </ScrollView>
      <VariantDialog product={options} onClose={() => setOptions(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  title: { marginBottom: 8 },
  // Room for the cards' shadows on both sides of the row.
  row: { gap: 8, paddingVertical: 4, paddingHorizontal: 2 },
  card: { width: 124 },
});
