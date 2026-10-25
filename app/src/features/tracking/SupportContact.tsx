import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors } from '@/theme';
import { strings } from '@/strings';

interface Props {
  phone: string;
  onCopied: () => void;
  onCopyFailed: () => void;
}

/** "Contact customer support to cancel" box with the number, Copy and Call. */
export function SupportContact({ phone, onCopied, onCopyFailed }: Props) {
  const copy = async () => {
    try {
      await Clipboard.setStringAsync(phone);
      onCopied();
    } catch {
      onCopyFailed();
    }
  };
  return (
    <View style={styles.box}>
      <AppText variant="muiSubtitle2Bold" style={styles.title}>
        {strings.tracking.supportTitle}
      </AppText>
      <AppText variant="muiBody2Muted" style={styles.body}>
        {strings.tracking.supportBody}
      </AppText>
      <View style={styles.row}>
        <AppText variant="supportNumber">{phone}</AppText>
        <View style={styles.buttons}>
          <Pressable onPress={() => void copy()} accessibilityRole="button" accessibilityLabel={strings.tracking.copy} style={[styles.icon, styles.copy]}>
            <MaterialIcons name="content-copy" size={20} color={colors.textSlate} />
          </Pressable>
          <Pressable
            onPress={() => void Linking.openURL(`tel:${phone}`).catch(() => undefined)}
            accessibilityRole="button"
            accessibilityLabel={strings.tracking.call}
            style={[styles.icon, styles.call]}
          >
            <MaterialIcons name="call" size={20} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { marginTop: 8, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.supportBorder, backgroundColor: colors.surface2 },
  title: { marginBottom: 4 },
  body: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  buttons: { flexDirection: 'row', gap: 4 },
  icon: { padding: 5, borderRadius: 10 },
  copy: { borderWidth: 1, borderColor: colors.closeButtonBorder, padding: 4 },
  call: { backgroundColor: colors.brightGreen },
});
