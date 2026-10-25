import { StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { DialogBadge } from '@/components/dialog/DialogBadge';
import { DialogShell } from '@/components/dialog/DialogShell';
import { strings } from '@/strings';

interface Props {
  visible: boolean;
  /** Tapping outside the card skips the 2-second wait, as on the live page. */
  onDismiss: () => void;
}

/** Green check, "Logged in successfully!" and "Taking you to your account...". No buttons (D-83 design). */
export function LoginSuccessDialog({ visible, onDismiss }: Props) {
  return (
    <DialogShell visible={visible} onClose={onDismiss} showClose={false} style={styles.card}>
      <DialogBadge icon="check-circle" tone="success" />
      <AppText variant="successTitle" align="center">
        {strings.login.successTitle}
      </AppText>
      <AppText variant="successSub" align="center" style={styles.sub}>
        {strings.login.successSub}
      </AppText>
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  card: { maxWidth: 320 },
  sub: { marginTop: 6 },
});
