import { formatRupee, type FreeDeliveryNudge } from '@littlekart/shared';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, hairline } from '@/theme';
import { strings } from '@/strings';

/** Green card above the bill: progress to free delivery, or "Yay! You've unlocked FREE delivery!" (littlekart.com). */
export function FreeDeliveryCard({ nudge }: { nudge: FreeDeliveryNudge }) {
  if (!nudge) return null;
  if (nudge.kind === 'unlocked') {
    return (
      <View style={[styles.card, styles.unlocked]}>
        <AppText variant="freeDelivery">✅</AppText>
        <AppText variant="freeDelivery" style={styles.flex}>
          {strings.freeDelivery.unlocked}
          <AppText variant="freeDeliveryStrong">{strings.freeDelivery.free}</AppText>
        </AppText>
      </View>
    );
  }
  return (
    <View style={[styles.card, styles.progressCard]}>
      <View style={styles.row}>
        <AppText variant="freeDelivery">🚚</AppText>
        <AppText variant="freeDelivery" style={styles.flex}>
          {strings.freeDelivery.addMore}
          <AppText variant="freeDeliveryStrong">{formatRupee(nudge.amount)}</AppText>
          {strings.freeDelivery.moreFor}
          <AppText variant="freeDeliveryStrong">{strings.freeDelivery.free}</AppText>
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${nudge.progressPercent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 15,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.freeDeliveryBorder,
    backgroundColor: colors.filterActiveBg,
  },
  progressCard: { paddingVertical: 12 },
  unlocked: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  flex: { flex: 1 },
  track: { height: 8, borderRadius: 999, backgroundColor: colors.freeDeliveryTrack, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 999, backgroundColor: colors.freeDeliveryFill },
});
