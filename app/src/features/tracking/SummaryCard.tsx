import { MaterialIcons } from '@expo/vector-icons';
import { arrivingIn, type Order } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ProductImage } from '@/components/ProductImage';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { TrackingCard } from './TrackingCard';

interface Props {
  order: Order;
  minutes: number;
  onPress: () => void;
}

/** "Order summary" card: status pill, up to three item pictures, counts and "Open summary". */
export function SummaryCard({ order, minutes, onPress }: Props) {
  const shown = order.items.slice(0, 3);
  const more = Math.max(0, order.items.length - shown.length);
  const qty = order.items.reduce((sum, i) => sum + i.qty, 0);
  return (
    <TrackingCard onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <AppText variant="trackingCardTitle">{strings.tracking.summary}</AppText>
          <AppText variant="trackingCardSub" style={styles.id}>
            {strings.tracking.hashId(order.id)}
          </AppText>
        </View>
        <View style={styles.right}>
          <View style={styles.pill}>
            <AppText variant="summaryPill" numberOfLines={1}>
              {arrivingIn(minutes)}
            </AppText>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.dialogClose} />
        </View>
      </View>
      <LinearGradient colors={[colors.summaryBoxTop, colors.surface2]} style={styles.box}>
        <View style={styles.items}>
          <View style={styles.thumbs}>
            {shown.map((item, i) => (
              <View key={`${item.productId}-${item.variantId}`} style={[styles.thumb, i > 0 && styles.overlap]}>
                <ProductImage uri={item.imageUrl} style={styles.thumbImage} />
              </View>
            ))}
            {more > 0 ? (
              <View style={[styles.thumb, styles.overlap, styles.more]}>
                <AppText variant="summaryMore">{`+${more}`}</AppText>
              </View>
            ) : null}
          </View>
          <View style={styles.flex}>
            <AppText variant="summaryItems">{strings.tracking.items(order.items.length)}</AppText>
            <AppText variant="summaryQty">{strings.tracking.totalQty(qty)}</AppText>
          </View>
        </View>
        <View style={styles.open}>
          <AppText variant="openSummary">{strings.tracking.openSummary}</AppText>
        </View>
      </LinearGradient>
      <AppText variant="tapForBill" align="center" style={styles.tap}>
        {strings.tracking.tapForBill}
      </AppText>
    </TrackingCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  flex: { flex: 1, minWidth: 0 },
  id: { marginTop: 2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  pill: { paddingVertical: 3.2, paddingHorizontal: 8, borderRadius: 999, backgroundColor: colors.greenTint10 },
  // flex-wrap: the 260 px item block takes the whole row on a phone, so "Open summary" goes below it.
  box: { gap: 10, padding: 8.4, marginBottom: 4, borderRadius: 14, borderWidth: 1, borderColor: colors.summaryBoxBorder },
  items: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  thumbs: { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  thumb: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.summaryBoxBorder,
    backgroundColor: colors.surface,
    boxShadow: shadows.summaryThumb,
    overflow: 'hidden',
  },
  overlap: { marginLeft: -8 },
  thumbImage: { width: '68%', height: '68%' },
  more: { borderStyle: 'dashed', borderColor: colors.radioIdle, boxShadow: shadows.none },
  open: {
    alignSelf: 'flex-start',
    paddingVertical: 5.76,
    paddingHorizontal: 10.8,
    borderRadius: 999,
    backgroundColor: colors.primary,
    boxShadow: shadows.openSummary,
  },
  tap: { marginTop: 8 },
});
