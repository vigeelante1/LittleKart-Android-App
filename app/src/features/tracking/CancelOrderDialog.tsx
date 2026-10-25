import { StyleSheet, Pressable, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { MuiDialog } from '@/components/MuiDialog';
import { strings } from '@/strings';
import { SupportContact } from './SupportContact';

interface Props {
  visible: boolean;
  phone: string;
  onClose: () => void;
  onCopied: (ok: boolean) => void;
}

/** "Cancel order": cancelling is done by customer support, so the dialog shows their number. */
export function CancelOrderDialog({ visible, phone, onClose, onCopied }: Props) {
  return (
    <MuiDialog visible={visible} onClose={onClose}>
      <View style={styles.title}>
        <AppText variant="muiH6Dialog">{strings.tracking.cancelOrder}</AppText>
      </View>
      <View style={styles.content}>
        <AppText variant="muiBody2Muted" style={styles.lead}>
          {strings.tracking.pleaseContact}
        </AppText>
        <SupportContact phone={phone} onCopied={() => onCopied(true)} onCopyFailed={() => onCopied(false)} />
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onClose} accessibilityRole="button" style={styles.close}>
          <AppText variant="muiTextButton">{strings.tracking.close}</AppText>
        </Pressable>
      </View>
    </MuiDialog>
  );
}

const styles = StyleSheet.create({
  title: { paddingVertical: 16, paddingHorizontal: 24 },
  content: { paddingHorizontal: 24, paddingBottom: 20 },
  lead: { marginBottom: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 16, paddingTop: 8 },
  close: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 4 },
});
