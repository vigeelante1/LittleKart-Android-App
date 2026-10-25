import { StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { DialogActions } from '@/components/dialog/DialogActions';
import { DialogBadge } from '@/components/dialog/DialogBadge';
import { DialogButton } from '@/components/dialog/DialogButton';
import { DialogShell } from '@/components/dialog/DialogShell';
import { strings } from '@/strings';

interface Props {
  text: string | null;
  onClose: () => void;
}

/** The bill's "i" explanation (D-83 design): info badge, the text, and an OK button. */
export function InfoDialog({ text, onClose }: Props) {
  return (
    <DialogShell visible={text !== null} onClose={onClose}>
      <DialogBadge icon="info-outline" tone="success" />
      <AppText variant="infoText" align="center" style={styles.text}>
        {text}
      </AppText>
      <DialogActions>
        <DialogButton kind="primary" label={strings.common.ok} onPress={onClose} />
      </DialogActions>
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  text: { alignSelf: 'stretch' },
});
