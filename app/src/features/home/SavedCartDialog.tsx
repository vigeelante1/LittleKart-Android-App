import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';

interface Props {
  visible: boolean;
  count: number;
  clearing: boolean;
  /** "Goto Cart", the X and a tap outside all open the cart, as on the live site. */
  onGotoCart: () => void;
  onClear: () => void;
}

/**
 * "You have a saved existing cart" (littlekart.com, MUI Modal). The amber outline in the phone screenshot is the
 * Android WebView focus ring, not part of the design (DECISIONS D-42), so it is not drawn.
 */
export function SavedCartDialog({ visible, count, clearing, onGotoCart, onClear }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onGotoCart}>
      <Pressable style={styles.backdrop} onPress={onGotoCart} accessibilityRole="none">
        <Pressable style={styles.card} onPress={() => undefined} accessibilityRole="alert">
          <Pressable
            onPress={onGotoCart}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={strings.common.close}
            style={styles.close}
          >
            <MaterialIcons name="close" size={24} color={colors.closeGrey} />
          </Pressable>
          <MaterialIcons name="shopping-cart" size={48} color={colors.primary} style={styles.cartIcon} />
          <AppText variant="savedCartTitle" align="center" style={styles.title}>
            {strings.savedCart.title}
          </AppText>
          <AppText variant="savedCartBody" align="center" style={styles.body}>
            {strings.savedCart.body(count)}
          </AppText>
          <View style={styles.buttons}>
            <Pressable onPress={onGotoCart} accessibilityRole="button" style={({ pressed }) => [styles.outlined, pressed && styles.pressed]}>
              <MaterialIcons name="shopping-cart" size={20} color={colors.primary} style={styles.startIcon} />
              <AppText variant="muiButton" color="primary">
                {strings.savedCart.goto}
              </AppText>
            </Pressable>
            <Pressable
              onPress={onClear}
              disabled={clearing}
              accessibilityRole="button"
              style={({ pressed }) => [styles.danger, clearing && styles.dangerDisabled, pressed && styles.pressed]}
            >
              {clearing ? (
                <ActivityIndicator size={20} color={colors.white} style={styles.startIcon} />
              ) : (
                <MaterialIcons name="delete" size={20} color={colors.white} style={styles.startIcon} />
              )}
              <AppText variant="muiButton" color={clearing ? 'disabledText' : 'white'}>
                {clearing ? strings.savedCart.clearing : strings.savedCart.clear}
              </AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // MUI Modal backdrop.
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.modalBackdrop },
  card: {
    width: '90%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
    // MUI elevation 24.
    boxShadow: shadows.muiElevation24,
  },
  close: { position: 'absolute', top: 8, right: 8, padding: 8 },
  cartIcon: { marginBottom: 16 },
  title: { marginBottom: 7 },
  body: { marginBottom: 24 },
  buttons: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  startIcon: { marginLeft: -4, marginRight: 8 },
  outlined: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  danger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: colors.muiError,
    // MUI elevation 2.
    boxShadow: shadows.muiElevation2,
  },
  dangerDisabled: { backgroundColor: colors.muiDisabledFill },
  pressed: { opacity: 0.85 },
});
