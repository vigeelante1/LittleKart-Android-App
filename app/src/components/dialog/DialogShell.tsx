import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';

interface Props {
  visible: boolean;
  /** Back button, a tap outside and the × all call this. */
  onClose: () => void;
  children: ReactNode;
  /** Shows the round × in the top-right corner. */
  showClose?: boolean;
  /** Extra card style (padding, width). */
  style?: StyleProp<ViewStyle>;
}

/**
 * Iteration-2 pop-up card (DECISIONS D-83): rounded white card that rises in gently over the dimmed screen.
 * Same colours and text styles as before; only the shape, spacing and buttons changed.
 */
export function DialogShell({ visible, onClose, children, showClose = true, style }: Props) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!visible) {
      progress.setValue(0);
      return;
    }
    Animated.timing(progress, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [visible, progress]);

  const cardMotion = {
    opacity: progress,
    transform: [
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
    ],
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="none" />
        <Animated.View style={[styles.card, cardMotion, style]} accessibilityRole="alert">
          {showClose ? (
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={strings.common.close}
              style={({ pressed }) => [styles.close, pressed && styles.closePressed]}
            >
              <MaterialIcons name="close" size={20} color={colors.textSlateMuted} />
            </Pressable>
          ) : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: colors.modalBackdrop },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: colors.surface,
    boxShadow: shadows.successDialog,
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.thumbBg,
    zIndex: 1,
  },
  closePressed: { opacity: 0.7 },
});
