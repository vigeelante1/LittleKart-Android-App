import type { Order } from '@littlekart/shared';
import { ScrollView, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { DialogBadge } from '@/components/dialog/DialogBadge';
import { DialogShell } from '@/components/dialog/DialogShell';
import { colors } from '@/theme';
import { strings } from '@/strings';

/** "Order Items" (from the card's ⋮ menu → Share Order Items): one line per item, "Name × qty" (D-83 design). */
export function OrderItemsDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  return (
    <DialogShell visible={order !== null} onClose={onClose}>
      <DialogBadge icon="receipt-long" tone="success" />
      <AppText variant="muiH6Dialog" align="center" style={styles.title}>
        {strings.orders.orderItems}
      </AppText>
      <ScrollView style={styles.list} contentContainerStyle={styles.content}>
        {order?.items.map((item, i) => (
          <AppText key={`${item.productId}-${i}`} variant="productName" numberOfLines={2} style={[styles.line, i > 0 && styles.lineBorder]}>
            {strings.orders.itemTimes(item.name, item.qty)}
          </AppText>
        ))}
      </ScrollView>
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 12 },
  list: { alignSelf: 'stretch', borderRadius: 12, backgroundColor: colors.thumbBg },
  content: { paddingHorizontal: 14, paddingVertical: 4 },
  line: { paddingVertical: 8 },
  lineBorder: { borderTopWidth: 1, borderTopColor: colors.border },
});
