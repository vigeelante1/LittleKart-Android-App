import type { Order } from '@littlekart/shared';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors } from '@/theme';
import { strings } from '@/strings';
import { TrackingCard } from './TrackingCard';

/** Order numbers longer than 14 characters show their last 10 ("…1234567890"). */
const shortId = (id: string) => (id.length <= 14 ? id : `…${id.slice(-10)}`);

/** "Active orders" chips: every order that is still on its way; the open one is marked "• live". */
export function ActiveOrdersCard({ orders, currentId }: { orders: Order[]; currentId: string }) {
  return (
    <TrackingCard style={styles.card}>
      <View style={styles.titleRow}>
        <AppText variant="trackingCardTitle">{strings.tracking.activeOrders}</AppText>
        <AppText variant="trackingCount">{strings.tracking.total(orders.length)}</AppText>
      </View>
      <AppText variant="trackingCardSub" style={styles.sub}>
        {strings.tracking.swipeOrders}
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.scroll}>
        {orders.map((o) => {
          const live = o.id === currentId;
          return (
            <Pressable
              key={o.id}
              disabled={live}
              onPress={() => router.push({ pathname: '/tracking/[id]', params: { id: o.id } })}
              accessibilityRole="button"
              style={[styles.chip, live ? styles.chipLive : styles.chipIdle]}
            >
              <AppText variant={live ? 'chipLabelLive' : 'chipLabel'}>
                {live ? strings.tracking.live(shortId(o.id)) : shortId(o.id)}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </TrackingCard>
  );
}

const styles = StyleSheet.create({
  card: { paddingBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  sub: { marginTop: 2 },
  scroll: { marginTop: 8 },
  chips: { gap: 8, paddingTop: 10, paddingBottom: 14 },
  chip: { height: 32, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 16 },
  chipLive: { backgroundColor: colors.muiSuccess },
  chipIdle: { borderWidth: 1, borderColor: colors.closeButtonBorder, paddingHorizontal: 11 },
});
