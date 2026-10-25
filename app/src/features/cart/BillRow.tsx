import { MaterialIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { CartIcon, type CartIconName } from '@/components/icons/CartIcons';
import { colors, type TextVariantName } from '@/theme';
import { strings } from '@/strings';

interface Props {
  icon: CartIconName;
  label: string;
  onInfo?: () => void;
  /** Plain amount text, or `amountNode` for struck-through prices. */
  amount?: string;
  amountVariant?: TextVariantName;
  amountNode?: ReactNode;
  labelVariant?: TextVariantName;
  last?: boolean;
  /** Space under the row (cart 8; the payment page uses 6). */
  spacing?: number;
}

/** One bill line: green outlined icon, label, optional "i", amount on the right (littlekart.com bill row). */
export function BillRow({
  icon,
  label,
  onInfo,
  amount,
  amountVariant = 'billRow',
  amountNode,
  labelVariant = 'billRow',
  last,
  spacing = 8,
}: Props) {
  return (
    <View style={[styles.row, !last && { marginBottom: spacing }]}>
      <View style={styles.left}>
        <CartIcon name={icon} size={16} color={colors.primaryDark} />
        <AppText variant={labelVariant}>{label}</AppText>
        {onInfo ? (
          <Pressable
            onPress={onInfo}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${strings.bill.moreInfo}`}
            style={styles.info}
          >
            <MaterialIcons name="info-outline" size={20} color={colors.iconMuted} />
          </Pressable>
        ) : null}
      </View>
      {amountNode ?? <AppText variant={amountVariant}>{amount}</AppText>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 0, flexShrink: 1 },
  info: { width: 30, height: 30, marginLeft: -2, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
