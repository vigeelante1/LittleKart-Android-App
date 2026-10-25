import { StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { DialogActions } from '@/components/dialog/DialogActions';
import { DialogBadge } from '@/components/dialog/DialogBadge';
import { DialogButton } from '@/components/dialog/DialogButton';
import { DialogShell } from '@/components/dialog/DialogShell';
import { strings } from '@/strings';

/** "Order Submitted!" with View Tracking. Closing it also goes to the tracking page (site behaviour). */
export function OrderSubmittedDialog({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  return (
    <DialogShell visible={visible} onClose={onDone}>
      <DialogBadge icon="check-circle" tone="success" />
      <AppText variant="submittedTitle" align="center" style={styles.title}>
        {strings.payment.submittedTitle}
      </AppText>
      <AppText variant="muiBody1" align="center">
        {strings.payment.submittedBody}
      </AppText>
      <AppText variant="muiBody2Muted" align="center" style={styles.redirect}>
        {strings.payment.redirecting}
      </AppText>
      <DialogActions>
        <DialogButton kind="primary" icon="delivery-dining" label={strings.payment.viewTracking} onPress={onDone} />
      </DialogActions>
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 6 },
  redirect: { marginTop: 6 },
});
