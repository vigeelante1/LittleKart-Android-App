import { formatRupee } from '@littlekart/shared';
import { StyleSheet, View } from 'react-native';
import { colors, radius, shadows } from '@/theme';
import { AppText } from './AppText';

interface Props {
  price: number;
  /** Struck-through MRP shown beside the chip when higher than the price. */
  mrp?: number;
}

/** Green rectangle with the white bold price, plus the struck MRP. */
export function PriceChip({ price, mrp }: Props) {
  const showMrp = mrp !== undefined && mrp > price;
  return (
    <View style={styles.row}>
      <View style={styles.chip}>
        <AppText variant="priceChip">{formatRupee(price)}</AppText>
      </View>
      {showMrp ? (
        <AppText variant="cardMrp" strike>
          {formatRupee(mrp)}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3.6 },
  chip: {
    height: 21,
    justifyContent: 'center',
    paddingHorizontal: 5.6,
    borderRadius: radius.chipSmall,
    backgroundColor: colors.primary,
    boxShadow: shadows.priceChip,
  },
});
