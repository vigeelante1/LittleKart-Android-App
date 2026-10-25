import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { DialogActions } from '@/components/dialog/DialogActions';
import { DialogBadge } from '@/components/dialog/DialogBadge';
import { DialogButton } from '@/components/dialog/DialogButton';
import { DialogShell } from '@/components/dialog/DialogShell';
import { colors } from '@/theme';
import { strings } from '@/strings';
import type { ReorderSummary } from './useReorder';

/** "Reorder update": how many items went back into the cart (D-83 design). */
export function ReorderDialog({ summary, onClose }: { summary: ReorderSummary | null; onClose: () => void }) {
  const rows: [string, number, boolean][] = summary
    ? [
        [strings.orders.requested, summary.requested, false],
        [strings.orders.added, summary.added, true],
        [strings.orders.partial, summary.partial, false],
        [strings.orders.unavailable, summary.unavailable.length, false],
      ]
    : [];
  const canGo = summary !== null && summary.added + summary.partial > 0;
  return (
    <DialogShell visible={summary !== null} onClose={onClose}>
      <DialogBadge icon="replay" tone="success" />
      <AppText variant="muiH6Dialog" align="center">
        {strings.orders.reorderTitle}
      </AppText>
      <AppText variant="muiBody2Muted" align="center" style={styles.message}>
        {strings.orders.reorderMessage}
      </AppText>
      <View style={styles.box}>
        {rows.map(([label, value, green], i) => (
          <View key={label} style={[styles.row, i > 0 && styles.rowLine]}>
            <AppText variant="muiBody2">{label}</AppText>
            <AppText variant={green ? 'reorderAdded' : 'muiBody2Semi'}>{String(value)}</AppText>
          </View>
        ))}
      </View>
      {summary && summary.unavailable.length > 0 ? (
        <View style={styles.missing}>
          <AppText variant="muiBody2Semi" style={styles.heading}>
            {strings.orders.unavailableHeading}
          </AppText>
          {summary.unavailable.slice(0, 3).map((name, i) => (
            <AppText key={`${name}-${i}`} variant="muiBody2Muted" numberOfLines={1}>
              {name}
            </AppText>
          ))}
        </View>
      ) : null}
      <DialogActions>
        <DialogButton kind="secondary" label={strings.orders.close} onPress={onClose} />
        {canGo ? (
          <DialogButton
            kind="primary"
            icon="shopping-cart"
            label={strings.orders.goToCart}
            onPress={() => {
              onClose();
              router.push('/cart');
            }}
          />
        ) : null}
      </DialogActions>
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  message: { marginTop: 4, marginBottom: 14 },
  box: { alignSelf: 'stretch', borderRadius: 12, paddingHorizontal: 14, backgroundColor: colors.thumbBg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9 },
  rowLine: { borderTopWidth: 1, borderTopColor: colors.border },
  missing: { alignSelf: 'stretch', marginTop: 12, gap: 2 },
  heading: { marginBottom: 2 },
});
