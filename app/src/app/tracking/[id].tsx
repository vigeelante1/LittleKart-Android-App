import { arrivalLabel, isTrackable, SUPPORT_PHONE_FALLBACK } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { SuccessSnackbar } from '@/components/SuccessSnackbar';
import { useOrder, useOrders } from '@/features/orders/useOrders';
import { ActiveOrdersCard } from '@/features/tracking/ActiveOrdersCard';
import { CancelOrderDialog } from '@/features/tracking/CancelOrderDialog';
import { DeliveryCard } from '@/features/tracking/DeliveryCard';
import { DeliveryStatusCard } from '@/features/tracking/DeliveryStatusCard';
import { MapSection } from '@/features/tracking/MapSection';
import { SummaryCard } from '@/features/tracking/SummaryCard';
import { TrackingHero } from '@/features/tracking/TrackingHero';
import { useOrderStore } from '@/features/tracking/useOrderStore';
import { useConfig } from '@/hooks/useConfig';
import { AddOnBanner } from '@/features/addon/AddOnBanner';
import { useAddOnWindow } from '@/features/addon/useAddOnWindow';
import { useNow } from '@/hooks/useNow';
import { useAuthStore } from '@/store';
import { colors } from '@/theme';
import { strings } from '@/strings';

/** Order tracking (littlekart.com /tracking/:id, phone layout). */
export default function TrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const config = useConfig();
  const now = useNow();
  const addOnWindow = useAddOnWindow();
  const order = useOrder(id);
  const { orders } = useOrders();
  const store = useOrderStore(order);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const active = useMemo(() => orders.filter((o) => isTrackable(o, now)), [orders, now]);

  if (!user) return <Redirect href="/login" />;

  if (order === undefined) {
    return (
      <Shell>
        <View style={[styles.center, { paddingTop: insets.top }]}>
          <ActivityIndicator size={44} color={colors.primary} />
          <AppText variant="trackingCount">{strings.tracking.loading}</AppText>
        </View>
      </Shell>
    );
  }
  if (order === null) {
    return (
      <Shell>
        <View style={[styles.notFound, { paddingTop: 16 + insets.top }]}>
          <AppText variant="muiH6Bold">{strings.tracking.notFoundTitle}</AppText>
          <AppText variant="muiBody2Muted">{strings.tracking.notFoundBody}</AppText>
          <Pressable onPress={() => router.replace({ pathname: '/tracking/[id]', params: { id } })} style={styles.retry}>
            <AppText variant="muiTextButton">{strings.tracking.retry}</AppText>
          </Pressable>
        </View>
      </Shell>
    );
  }
  const addOn = addOnWindow;
  // Delivered, failed, cancelled or older than 45 minutes: the site moves on to the order details.
  if (!isTrackable(order, now)) return <Redirect href={{ pathname: '/orders/[id]', params: { id: order.id } }} />;

  const eta = arrivalLabel(order, now);
  return (
    <Shell>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <TrackingHero order={order} eta={eta} />
        {addOn?.order.id === order.id ? (
          <View style={styles.addOn}>
            <AddOnBanner
              title={strings.addOn.bannerTitle}
              sub={strings.addOn.bannerSub(addOn.left)}
              button={strings.addOn.addItems}
              onPress={() => router.navigate('/')}
            />
          </View>
        ) : null}
        <View style={styles.content}>
          <MapSection order={order} eta={eta} store={store} />
          <View style={styles.info}>
            {active.length >= 1 ? <ActiveOrdersCard orders={active} currentId={order.id} /> : null}
            <DeliveryCard order={order} eta={eta} onCancel={() => setCancelOpen(true)} />
            <SummaryCard
              order={order}
              eta={eta}
              onPress={() => router.push({ pathname: '/orders/[id]', params: { id: order.id } })}
            />
            <DeliveryStatusCard order={order} />
          </View>
        </View>
      </ScrollView>
      <CancelOrderDialog
        visible={cancelOpen}
        phone={config.supportPhone || SUPPORT_PHONE_FALLBACK}
        onClose={() => setCancelOpen(false)}
        onCopied={(ok) => setCopied(ok ? strings.tracking.copied : strings.tracking.copyFailed)}
      />
      <SuccessSnackbar visible={copied !== null} message={copied ?? ''} durationMs={3500} bottom={8} onHide={() => setCopied(null)} />
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <LinearGradient
      colors={[colors.trackingShellTop, colors.trackingShellBottom, colors.trackingShellBottom]}
      locations={[0, 0.32, 1]}
      style={styles.shell}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  addOn: { paddingHorizontal: 12, marginTop: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFound: { padding: 16, gap: 8 },
  retry: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 8 },
  content: { padding: 12, gap: 12 },
  info: { gap: 12 },
});
