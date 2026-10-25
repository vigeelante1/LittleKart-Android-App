import { MaterialIcons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';

interface Props {
  text: string | null;
  onClose: () => void;
}

/** The bill's "i" popup: white box in the middle, round × floating above it (littlekart.com /cart). */
export function InfoDialog({ text, onClose }: Props) {
  return (
    <Modal visible={text !== null} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="none" />
        <View style={styles.box}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={strings.common.close}
            style={({ pressed }) => [styles.close, pressed && styles.closePressed]}
          >
            <MaterialIcons name="close" size={24} color={colors.iconMuted} />
          </Pressable>
          <AppText variant="infoText">{text}</AppText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dialogBackdrop },
  box: {
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 8,
    backgroundColor: colors.surface,
    boxShadow: shadows.muiElevation24,
  },
  close: {
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    boxShadow: shadows.muiElevation1,
  },
  closePressed: { backgroundColor: colors.infoDialogClosePressed },
});
