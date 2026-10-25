import type { Order } from '@littlekart/shared';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { MuiDialog } from '@/components/MuiDialog';
import { strings } from '@/strings';

/** "Order Items" (from the card's ⋮ menu → Share Order Items): one line per item, "Name × qty". */
export function OrderItemsDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  return (
    <MuiDialog visible={order !== null} onClose={onClose}>
      <View style={styles.title}>
        <AppText variant="muiH6Dialog">{strings.orders.orderItems}</AppText>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {order?.items.map((item, i) => (
          <AppText key={`${item.productId}-${i}`} variant="productName" numberOfLines={2} style={styles.line}>
            {strings.orders.itemTimes(item.name, item.qty)}
          </AppText>
        ))}
      </ScrollView>
    </MuiDialog>
  );
}

const styles = StyleSheet.create({
  title: { paddingVertical: 16, paddingHorizontal: 24 },
  content: { paddingHorizontal: 24, paddingBottom: 20 },
  line: { marginTop: 4, minHeight: 34.56 },
});
