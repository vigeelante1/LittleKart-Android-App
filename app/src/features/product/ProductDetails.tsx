import { MaterialIcons } from '@expo/vector-icons';
import { chipMinutes, type Product } from '@littlekart/shared';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { englishName } from '@/features/cart/englishName';
import { useConfig } from '@/hooks/useConfig';
import { colors, hairline } from '@/theme';
import { strings } from '@/strings';

interface Props {
  product: Product;
  /** Name of the shelf the product is on ("Biscuits & Cookies"), when known. */
  shelfName: string | null;
}

/** "Fast delivery" card, Description and the "View more info" panel (live app's product page). */
export function ProductDetails({ product, shelfName }: Props) {
  const config = useConfig();
  const [open, setOpen] = useState(false);
  const minutes = chipMinutes(config.eta, product.itemType);
  const rows: [string, string][] = [
    ...(shelfName ? ([[strings.productPage.infoCategory, shelfName]] as [string, string][]) : []),
    [strings.productPage.infoSizes, product.variants.map((v) => v.label).join(', ')],
    [strings.productPage.infoType, strings.productPage.infoTypes[product.itemType]],
  ];

  return (
    <View>
      <View style={styles.fast}>
        <View style={styles.fastIcon}>
          <MaterialIcons name="bolt" size={24} color={colors.toneBlue} />
        </View>
        <AppText variant="pdpFast" style={styles.fastTitle}>
          {strings.productPage.fastDelivery}
        </AppText>
        <AppText variant="pdpFastNote">{strings.productPage.fastDeliveryEta(minutes)}</AppText>
      </View>

      <AppText variant="pdpHeading" style={styles.heading}>
        {strings.productPage.description}
      </AppText>
      <AppText variant="pdpBody" style={styles.body}>
        {product.subtitle ?? englishName(product.name)}
      </AppText>

      <View style={styles.more}>
        <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={styles.moreHeader}>
          <View style={styles.moreIcon}>
            <MaterialIcons name="info-outline" size={20} color={colors.primary} />
          </View>
          <AppText variant="pdpMore" style={styles.moreLabel}>
            {open ? strings.productPage.lessInfo : strings.productPage.moreInfo}
          </AppText>
          <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={26} color={colors.primary} />
        </Pressable>
        {open ? (
          <View style={styles.rows}>
            {rows.map(([key, value]) => (
              <View key={key} style={styles.row}>
                <AppText variant="pdpInfoKey" style={styles.key}>
                  {key}
                </AppText>
                <AppText variant="pdpInfoValue" style={styles.value}>
                  {value}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fast: {
    marginTop: 24,
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: hairline,
    borderColor: colors.toneSkyBg,
    backgroundColor: colors.toneBlueBg,
  },
  fastIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  fastTitle: { marginTop: 10 },
  heading: { marginTop: 26 },
  body: { marginTop: 8 },
  more: { marginTop: 16, borderRadius: 14, borderWidth: hairline, borderColor: colors.border, backgroundColor: colors.surface },
  moreHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 14 },
  moreIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  moreLabel: { flex: 1 },
  rows: { paddingHorizontal: 16, paddingBottom: 14, gap: 10 },
  row: { flexDirection: 'row', gap: 12 },
  key: { width: 120 },
  value: { flex: 1 },
});
