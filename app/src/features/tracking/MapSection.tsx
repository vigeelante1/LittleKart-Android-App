import { arrivingIn, statusLabel, type Order } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { TrackingMap } from './TrackingMap';

interface Props {
  order: Order;
  minutes: number;
  store: { lat: number; lng: number } | null;
}

/** "ORDER STATUS" box, "LIVE MAP · Updates live" and the map. */
export function MapSection({ order, minutes, store }: Props) {
  return (
    <View style={styles.section}>
      <LinearGradient
        colors={[colors.greenTint10, colors.greenTint04]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.status}
        accessibilityRole="summary"
      >
        <AppText variant="statusKicker">{strings.tracking.statusKicker}</AppText>
        <AppText variant="statusValue">{statusLabel(order.status)}</AppText>
        <AppText variant="statusEta" style={styles.eta}>
          {arrivingIn(minutes)}
        </AppText>
      </LinearGradient>
      <View style={styles.header}>
        <AppText variant="mapTitle">{strings.tracking.liveMap}</AppText>
        <View style={styles.badge}>
          <AppText variant="mapBadge">{strings.tracking.updatesLive}</AppText>
        </View>
      </View>
      <TrackingMap store={store} delivery={{ lat: order.address.lat, lng: order.address.lng }} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderFaint,
    backgroundColor: colors.surface,
    boxShadow: shadows.trackingSection,
  },
  status: {
    gap: 2,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.heroGreenBorder,
  },
  eta: { marginTop: 2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 2, paddingHorizontal: 4, paddingBottom: 10 },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.greenTint10 },
});
