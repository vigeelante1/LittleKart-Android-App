import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { DialogClose, MuiDialog } from '@/components/MuiDialog';
import { colors, hairline, shadows } from '@/theme';

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

/** The payment page's error dialog (red-tinted title, message, optional list, full-width buttons). */
export function OrderErrorDialog({ error, onClose }: Props) {
  const details = error?.details ?? [];
  const actions = error?.actions ?? [];
  return (
    <MuiDialog visible={error !== null} onClose={onClose} style={styles.paper}>
      <View style={styles.title}>
        <AppText variant="errorDialogTitle" align="center">
          {error?.title}
        </AppText>
        <DialogClose onPress={onClose} />
      </View>
      <View style={styles.content}>
        <AppText variant="errorDialogBody" style={details.length > 0 && styles.messageSpaced}>
          {error?.message}
        </AppText>
        {details.map((line, i) => (
          <View key={`${line}-${i}`} style={styles.bullet}>
            <AppText variant="muiBody2">{'•'}</AppText>
            <AppText variant="muiBody2" style={styles.bulletText}>
              {line}
            </AppText>
          </View>
        ))}
      </View>
      {actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((action, i) => (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, i === 0 ? styles.contained : styles.outlined, pressed && styles.pressed]}
            >
              <AppText variant={i === 0 ? 'errorDialogButton' : 'errorDialogButtonOutlined'}>{action.label}</AppText>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.noActions} />
      )}
    </MuiDialog>
  );
}

const styles = StyleSheet.create({
  paper: { borderRadius: 8, overflow: 'hidden', boxShadow: shadows.snackbar },
  title: { paddingTop: 18, paddingBottom: 14, paddingLeft: 24, paddingRight: 40, backgroundColor: colors.errorTint },
  content: { paddingTop: 20, paddingHorizontal: 22, paddingBottom: 8 },
  messageSpaced: { marginBottom: 12 },
  bullet: { flexDirection: 'row', gap: 8, paddingLeft: 4, marginBottom: 4 },
  bulletText: { flex: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 20 },
  noActions: { height: 8 },
  button: { width: '100%', alignItems: 'center', borderRadius: 8, borderWidth: hairline },
  contained: { paddingVertical: 6, paddingHorizontal: 16, backgroundColor: colors.primary, borderColor: colors.primary, boxShadow: shadows.muiElevation2 },
  outlined: { paddingVertical: 5, paddingHorizontal: 15, borderColor: colors.primary },
  pressed: { opacity: 0.85 },
});
