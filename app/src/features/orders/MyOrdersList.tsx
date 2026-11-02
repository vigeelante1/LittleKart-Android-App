import type { Order } from '@littlekart/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { PopupMenu } from '@/components/PopupMenu';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { OrderCard } from './OrderCard';
import { OrderItemsDialog } from './OrderItemsDialog';
import { ReorderDialog } from './ReorderDialog';
import { useOrders } from './useOrders';
import { useReorder } from './useReorder';

type Filter = 'all' | 'scheduled';

/** My Orders (inside the profile at /profile/orders, or on its own at /orders). */
export function MyOrdersList({ embedded }: { embedded: boolean }) {
  const { orders, loading } = useOrders();
  const [filter, setFilter] = useState<Filter>('all');
  const [menu, setMenu] = useState<{ x: number; y: number; order: Order } | null>(null);
  const [itemsOf, setItemsOf] = useState<Order | null>(null);
  const { reorder, busyId, summary, closeSummary } = useReorder();
  // "Scheduled": orders placed for a delivery slot while the store was closed (D-103).
  const shown = filter === 'scheduled' ? orders.filter((o) => o.scheduledFor) : orders;

  const open = (order: Order) =>
    router.push(
      embedded
        ? { pathname: '/profile/orders/[id]', params: { id: order.id } }
        : { pathname: '/orders/[id]', params: { id: order.id } },
    );

  return (
    <View style={embedded ? styles.embedded : styles.page}>
      {!loading && orders.length > 0 ? (
        <View style={styles.filters}>
          <FilterButton label={strings.orders.all} active={filter === 'all'} onPress={() => setFilter('all')} />
          <FilterButton label={strings.orders.scheduled} active={filter === 'scheduled'} onPress={() => setFilter('scheduled')} />
        </View>
      ) : null}

      {loading ? (
        <View>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <View style={[styles.bone, { width: 140, height: 20 }]} />
              <View style={[styles.bone, { width: 190, height: 14, marginTop: 12 }]} />
              <View style={styles.skeletonThumbs}>
                {[0, 1, 2, 3].map((j) => (
                  <View key={j} style={[styles.bone, styles.skeletonThumb]} />
                ))}
              </View>
              <View style={[styles.bone, { width: 100, height: 34, borderRadius: 4 }]} />
            </View>
          ))}
        </View>
      ) : orders.length === 0 ? (
        <AppText variant="muiBody1">{strings.orders.none}</AppText>
      ) : shown.length === 0 ? (
        <AppText variant="muiBody1">{strings.orders.noneScheduled}</AppText>
      ) : (
        shown.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            reordering={busyId === order.id}
            onOpen={() => open(order)}
            onMenu={(x, y) => setMenu({ x, y, order })}
            onReorder={() => void reorder(order)}
          />
        ))
      )}

      <PopupMenu
        at={menu ? { x: menu.x, y: menu.y } : null}
        items={[{ label: strings.orders.share, onPress: () => setItemsOf(menu?.order ?? null) }]}
        onClose={() => setMenu(null)}
      />
      <OrderItemsDialog order={itemsOf} onClose={() => setItemsOf(null)} />
      <ReorderDialog summary={summary} onClose={closeSummary} />
    </View>
  );
}

function FilterButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }} style={[styles.filter, active ? styles.filterOn : styles.filterOff]}>
      <AppText variant={active ? 'filterButton' : 'filterButtonIdle'}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  embedded: { padding: 12, paddingTop: 8 },
  page: { padding: 16 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filter: { borderRadius: 999 },
  filterOn: { paddingVertical: 4, paddingHorizontal: 10, backgroundColor: colors.brightGreen },
  filterOff: { paddingVertical: 3, paddingHorizontal: 9, borderWidth: 1, borderColor: colors.muiPrimaryOutline },
  skeletonCard: { marginBottom: 16, padding: 16, borderRadius: 8, backgroundColor: colors.surface, boxShadow: shadows.muiElevation1 },
  bone: { borderRadius: 4, backgroundColor: colors.skeleton },
  skeletonThumbs: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  skeletonThumb: { width: 60, height: 60 },
});
