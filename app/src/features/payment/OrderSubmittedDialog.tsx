import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { DialogClose, MuiDialog } from '@/components/MuiDialog';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';

/** "✅ Order Submitted!" with View Tracking. Closing it also goes to the tracking page (site behaviour). */
export function OrderSubmittedDialog({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  return (
    <MuiDialog visible={visible} onClose={onDone}>
      <View style={styles.title}>
        <AppText variant="submittedTitle" align="center">
          {strings.payment.submittedTitle}
        </AppText>
        <DialogClose onPress={onDone} />
      </View>
      <View style={styles.content}>
        <AppText variant="muiBody1" align="center">
          {strings.payment.submittedBody}
        </AppText>
        <AppText variant="muiBody2Muted" align="center" style={styles.redirect}>
          {strings.payment.redirecting}
        </AppText>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onDone} accessibilityRole="button" style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <AppText variant="muiSuccessButton">{strings.payment.viewTracking}</AppText>
        </Pressable>
      </View>
    </MuiDialog>
  );
}

const styles = StyleSheet.create({
  title: { paddingVertical: 16, paddingLeft: 24, paddingRight: 40 },
  content: { paddingHorizontal: 24, paddingBottom: 20 },
  redirect: { marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'center', padding: 8, paddingBottom: 16 },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: colors.muiSuccess,
    boxShadow: shadows.muiElevation2,
  },
  pressed: { opacity: 0.85 },
});
