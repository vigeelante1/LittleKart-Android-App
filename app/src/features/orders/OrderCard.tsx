import { MaterialIcons } from '@expo/vector-icons';
import { formatOrderDate, type Order } from '@littlekart/shared';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ProductImage } from '@/components/ProductImage';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { OrderStatusLine } from './OrderStatusLine';

interface Props {
  order: Order;
  reordering: boolean;
  onOpen: () => void;
  /** Where the ⋮ button was tapped (the menu opens there). */
  onMenu: (x: number, y: number) => void;
  onReorder: () => void;
}

/** One order in My Orders: status, total and date, item pictures, Reorder (after delivery). */
export function OrderCard({ order, reordering, onOpen, onMenu, onReorder }: Props) {
  const canReorder = order.status === 'delivered' && !reordering;
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <OrderStatusLine status={order.status} />
        <Pressable onPress={(e) => onMenu(e.nativeEvent.pageX, e.nativeEvent.pageY)} accessibilityRole="button" accessibilityLabel={strings.orders.more} style={styles.menu}>
          <MaterialIcons name="more-vert" size={24} color={colors.iconMuted} />
        </Pressable>
      </View>
      <AppText variant="orderMeta" style={styles.meta}>
        {strings.orders.totalAndDate(order.bill.grandTotal, formatOrderDate(order.createdAt))}
      </AppText>
      <Pressable onPress={onOpen} accessibilityRole="button">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs} style={styles.thumbRow}>
          {order.items.map((item, i) => (
            <Pressable key={`${item.productId}-${i}`} onPress={onOpen} style={styles.thumb}>
              {item.imageUrl ? (
                <ProductImage uri={item.imageUrl} style={styles.image} contentFit="cover" />
              ) : (
                <AppText variant="noImage" align="center">
                  {strings.orders.noImage}
                </AppText>
              )}
            </Pressable>
          ))}
        </ScrollView>
      </Pressable>
      <View style={styles.actions}>
        <Pressable
          onPress={onReorder}
          disabled={!canReorder}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canReorder }}
          style={[styles.reorder, !canReorder && styles.reorderDisabled]}
        >
          <AppText variant={canReorder ? 'orderAction' : 'orderActionDisabled'}>
            {reordering ? strings.orders.reordering : strings.orders.reorder}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16, padding: 16, borderRadius: 8, backgroundColor: colors.surface, boxShadow: shadows.muiElevation1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  menu: { padding: 8, borderRadius: 20, marginRight: -8 },
  meta: { marginBottom: 8 },
  thumbRow: { marginTop: 8, marginBottom: 8 },
  thumbs: { gap: 8 },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.paymentIdleBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reorder: { paddingVertical: 5, paddingHorizontal: 17, borderRadius: 18, borderWidth: 1, borderColor: colors.muiPrimaryOutline },
  reorderDisabled: { borderColor: colors.muiDisabledBg },
});
