import { MaterialIcons } from '@expo/vector-icons';
import { isFailedOrder, isPendingOrder, statusLabel, type OrderStatus } from '@littlekart/shared';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors } from '@/theme';

/** Icon + bold status at the top of an order card (red for failed, amber while pending, green tick otherwise). */
export function OrderStatusLine({ status }: { status: OrderStatus }) {
  const failed = isFailedOrder(status);
  const pending = isPendingOrder(status);
  const icon = failed ? 'cancel' : pending ? 'hourglass-empty' : 'check-circle';
  const tint = failed ? colors.error : pending ? colors.warning : colors.muiSuccess;
  return (
    <View style={styles.row}>
      <MaterialIcons name={icon} size={24} color={tint} style={styles.icon} />
      <AppText variant="orderStatus" color={failed ? 'error' : pending ? 'warning' : 'text'}>
        {statusLabel(status)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 8 },
});
