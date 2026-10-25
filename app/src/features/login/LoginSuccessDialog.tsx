import { MaterialIcons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';

interface Props {
  visible: boolean;
  /** Tapping outside the card skips the 2-second wait, as on the live page. */
  onDismiss: () => void;
}

/** Green check, "Logged in successfully!" and "Taking you to your account...". No buttons. */
export function LoginSuccessDialog({ visible, onDismiss }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss} accessibilityRole="none">
        <Pressable style={styles.card} onPress={() => undefined} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <MaterialIcons name="check-circle" size={64} color={colors.brightGreen} style={styles.icon} />
          <AppText variant="successTitle" align="center">
            {strings.login.successTitle}
          </AppText>
          <AppText variant="successSub" align="center" style={styles.sub}>
            {strings.login.successSub}
          </AppText>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.successBackdrop,
  },
  card: {
    width: '100%',
    maxWidth: 300,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
    boxShadow: shadows.successDialog,
  },
  icon: { marginBottom: 12 },
  sub: { marginTop: 8 },
});
