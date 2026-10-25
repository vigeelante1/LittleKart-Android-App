import { MaterialIcons } from '@expo/vector-icons';
import { canCancel, cannotCancelReason, type Order } from '@littlekart/shared';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors } from '@/theme';
import { strings } from '@/strings';
import { TrackingCard } from './TrackingCard';

interface Props {
  order: Order;
  /** "Arriving in 12 minutes" or "Arriving shortly". */
  eta: string;
  onCancel: () => void;
}

/** "ESTIMATE / Arriving in N minutes", "DELIVER TO / address" and the Cancel order button. */
export function DeliveryCard({ order, eta, onCancel }: Props) {
  const cancellable = canCancel(order.status);
  return (
    <TrackingCard style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.tile, styles.tileMuted]}>
          <MaterialIcons name="access-time" size={22} color={colors.slate600} />
        </View>
        <View style={styles.flex}>
          <AppText variant="trackingOverline">{strings.tracking.estimate}</AppText>
          <AppText variant="trackingCardTitle" style={styles.title}>
            {eta}
          </AppText>
          <AppText variant="trackingCardSub">{strings.tracking.toReach}</AppText>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <View style={[styles.tile, styles.tileAccent]}>
          <MaterialIcons name="location-on" size={22} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText variant="trackingOverline">{strings.tracking.deliverTo}</AppText>
          <AppText variant="trackingAddress" style={styles.address}>
            {order.address.text}
          </AppText>
        </View>
      </View>
      <View style={styles.divider} />
      <Pressable
        onPress={onCancel}
        disabled={!cancellable}
        accessibilityRole="button"
        accessibilityState={{ disabled: !cancellable }}
        style={({ pressed }) => [styles.cancel, !cancellable && styles.cancelDisabled, pressed && styles.pressed]}
      >
        <AppText variant={cancellable ? 'outlinedError' : 'outlinedErrorDisabled'}>{strings.tracking.cancelOrder}</AppText>
      </Pressable>
      {cancellable ? null : (
        <AppText variant="muiBody2MutedSemi" align="center" style={styles.reason}>
          {cannotCancelReason(order.status)}
        </AppText>
      )}
    </TrackingCard>
  );
}

const styles = StyleSheet.create({
  card: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tile: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tileMuted: { backgroundColor: colors.borderFaint },
  tileAccent: { backgroundColor: colors.greenTint12 },
  flex: { flex: 1, minWidth: 0 },
  title: { marginTop: 2, marginBottom: 4 },
  address: { marginTop: 4 },
  divider: { height: 1, marginVertical: 16, backgroundColor: colors.borderSoft },
  cancel: {
    alignItems: 'center',
    paddingVertical: 7.8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  cancelDisabled: { borderColor: colors.muiDisabledBg },
  reason: { marginTop: 8 },
  pressed: { opacity: 0.85 },
});
