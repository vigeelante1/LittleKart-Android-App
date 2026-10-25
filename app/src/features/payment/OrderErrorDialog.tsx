import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { DialogActions } from '@/components/dialog/DialogActions';
import { DialogBadge } from '@/components/dialog/DialogBadge';
import { DialogButton } from '@/components/dialog/DialogButton';
import { DialogShell } from '@/components/dialog/DialogShell';
import { colors } from '@/theme';

export interface ErrorAction {
  label: string;
  onPress: () => void;
}

export interface OrderErrorState {
  title: string;
  message: string;
  details?: string[];
  actions?: ErrorAction[];
}

interface Props {
  error: OrderErrorState | null;
  onClose: () => void;
}

/** The payment page's error pop-up: red badge, title, message, optional list, then its buttons (D-83). */
export function OrderErrorDialog({ error, onClose }: Props) {
  const details = error?.details ?? [];
  const actions = error?.actions ?? [];
  return (
    <DialogShell visible={error !== null} onClose={onClose}>
      <DialogBadge icon="error-outline" tone="danger" />
      <AppText variant="errorDialogTitle" align="center" style={styles.title}>
        {error?.title}
      </AppText>
      <AppText variant="errorDialogBody" align="center">
        {error?.message}
      </AppText>
      {details.length > 0 ? (
        <View style={styles.details}>
          {details.map((line, i) => (
            <View key={`${line}-${i}`} style={styles.bullet}>
              <View style={styles.dot} />
              <AppText variant="muiBody2" style={styles.bulletText}>
                {line}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}
      {actions.length > 0 ? (
        <DialogActions stacked={actions.length > 1}>
          {actions.map((action, i) => (
            <DialogButton key={action.label} kind={i === 0 ? 'primary' : 'secondary'} label={action.label} onPress={action.onPress} />
          ))}
        </DialogActions>
      ) : null}
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 6 },
  details: { alignSelf: 'stretch', marginTop: 14, padding: 12, gap: 6, borderRadius: 12, backgroundColor: colors.errorTint },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 8, backgroundColor: colors.muiError },
  bulletText: { flex: 1 },
});
