import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { colors, shadows } from '@/theme';
import { AppText } from './AppText';

interface Props {
  /** Where to open (the tapped point); null hides the menu. */
  at: { x: number; y: number } | null;
  items: { label: string; onPress: () => void }[];
  onClose: () => void;
}

const WIDTH = 200;

/** A small MUI-style menu opened from a ⋮ button. */
export function PopupMenu({ at, items, onClose }: Props) {
  const { width } = useWindowDimensions();
  if (!at) return null;
  const left = Math.max(16, Math.min(at.x - WIDTH, width - WIDTH - 16));
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="none" />
      <View style={[styles.menu, { top: at.y, left }]}>
        {items.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => {
              onClose();
              item.onPress();
            }}
            accessibilityRole="menuitem"
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <AppText variant="muiBody1">{item.label}</AppText>
          </Pressable>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    minWidth: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
    boxShadow: shadows.muiElevation8,
  },
  item: { minHeight: 48, justifyContent: 'center', paddingVertical: 6, paddingHorizontal: 16 },
  pressed: { backgroundColor: colors.thumbBg },
});
