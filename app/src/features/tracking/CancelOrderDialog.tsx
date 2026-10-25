import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { DialogActions } from '@/components/dialog/DialogActions';
import { DialogBadge } from '@/components/dialog/DialogBadge';
import { DialogButton } from '@/components/dialog/DialogButton';
import { DialogShell } from '@/components/dialog/DialogShell';
import { strings } from '@/strings';
import { SupportContact } from './SupportContact';

interface Props {
  visible: boolean;
  phone: string;
  onClose: () => void;
  onCopied: (ok: boolean) => void;
}

/** "Cancel order": cancelling is done by customer support, so the pop-up shows their number (D-83 design). */
export function CancelOrderDialog({ visible, phone, onClose, onCopied }: Props) {
  return (
    <DialogShell visible={visible} onClose={onClose}>
      <DialogBadge icon="support-agent" tone="danger" />
      <AppText variant="muiH6Dialog" align="center">
        {strings.tracking.cancelOrder}
      </AppText>
      <AppText variant="muiBody2Muted" align="center" style={styles.lead}>
        {strings.tracking.pleaseContact}
      </AppText>
      <View style={styles.contact}>
        <SupportContact phone={phone} onCopied={() => onCopied(true)} onCopyFailed={() => onCopied(false)} />
      </View>
      <DialogActions>
        <DialogButton kind="secondary" label={strings.tracking.close} onPress={onClose} />
      </DialogActions>
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  lead: { marginTop: 4, marginBottom: 12 },
  contact: { alignSelf: 'stretch' },
});
