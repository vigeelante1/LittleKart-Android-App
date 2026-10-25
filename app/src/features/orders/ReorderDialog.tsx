import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { MuiDialog } from '@/components/MuiDialog';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import type { ReorderSummary } from './useReorder';

/** "Reorder update": how many items went back into the cart. */
export function ReorderDialog({ summary, onClose }: { summary: ReorderSummary | null; onClose: () => void }) {
  const rows: [string, number, boolean][] = summary
    ? [
        [strings.orders.requested, summary.requested, false],
        [strings.orders.added, summary.added, true],
        [strings.orders.partial, summary.partial, false],
        [strings.orders.unavailable, summary.unavailable.length, false],
      ]
    : [];
  return (
    <MuiDialog visible={summary !== null} onClose={onClose}>
      <View style={styles.title}>
        <AppText variant="muiH6Dialog">{strings.orders.reorderTitle}</AppText>
      </View>
      <View style={styles.content}>
        <AppText variant="muiBody2Muted" style={styles.message}>
          {strings.orders.reorderMessage}
        </AppText>
        <View style={styles.box}>
          {rows.map(([label, value, green]) => (
            <View key={label} style={styles.row}>
              <AppText variant="muiBody2">{label}</AppText>
              <AppText variant={green ? 'reorderAdded' : 'muiBody2Semi'}>{String(value)}</AppText>
            </View>
          ))}
        </View>
        {summary && summary.unavailable.length > 0 ? (
          <>
            <AppText variant="muiBody2Semi" style={styles.heading}>
              {strings.orders.unavailableHeading}
            </AppText>
            {summary.unavailable.slice(0, 3).map((name, i) => (
              <AppText key={`${name}-${i}`} variant="muiBody2Muted" style={styles.item}>
                {name}
              </AppText>
            ))}
          </>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onClose} accessibilityRole="button" style={styles.text}>
          <AppText variant="muiTextButton">{strings.orders.close}</AppText>
        </Pressable>
        {summary && summary.added + summary.partial > 0 ? (
          <Pressable
            onPress={() => {
              onClose();
              router.push('/cart');
            }}
            accessibilityRole="button"
            style={styles.contained}
          >
            <AppText variant="orderActionContained">{strings.orders.goToCart}</AppText>
          </Pressable>
        ) : null}
      </View>
    </MuiDialog>
  );
}

const styles = StyleSheet.create({
  title: { paddingVertical: 16, paddingHorizontal: 24 },
  content: { paddingHorizontal: 24, paddingBottom: 20 },
  message: { marginBottom: 8 },
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  heading: { marginTop: 12, marginBottom: 4 },
  item: { paddingVertical: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
  text: { paddingVertical: 6, paddingHorizontal: 8 },
  contained: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 4, backgroundColor: colors.primary, boxShadow: shadows.muiElevation2 },
});
