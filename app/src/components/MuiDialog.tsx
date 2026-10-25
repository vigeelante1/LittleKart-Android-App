import { MaterialIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Paper style: radius 4 and elevation 24 by default (MUI Dialog, maxWidth "xs", fullWidth). */
  style?: StyleProp<ViewStyle>;
}

/** The site's plain MUI dialogs (order submitted, payment errors, cancel order, order items). */
export function MuiDialog({ visible, onClose, children, style }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="none" />
        <View style={[styles.paper, style]}>{children}</View>
      </View>
    </Modal>
  );
}

/** The small × in the top-right corner of a dialog title. */
export function DialogClose({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={strings.common.close}
      hitSlop={6}
      style={({ pressed }) => [styles.close, pressed && styles.pressed]}
    >
      <MaterialIcons name="close" size={20} color={colors.textSlateMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, backgroundColor: colors.modalBackdrop },
  paper: { width: '100%', maxWidth: 444, maxHeight: '90%', borderRadius: 4, backgroundColor: colors.surface, boxShadow: shadows.muiElevation24 },
  close: { position: 'absolute', top: 8, right: 8, padding: 5, borderRadius: 15, zIndex: 1 },
  pressed: { backgroundColor: colors.thumbBg },
});
