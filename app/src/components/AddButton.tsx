import { Pressable, StyleSheet, View } from 'react-native';
import { addBorder, colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { AppText } from './AppText';

interface Props {
  onPress: () => void;
  /** When the product has more than one size, the button also reads "N options". */
  optionsCount?: number;
  disabled?: boolean;
  /** The size picker's ADD: 88 wide with 12 px side padding. */
  compact?: boolean;
}

/** Outlined green ADD button on product cards. */
export function AddButton({ onPress, optionsCount = 1, disabled, compact }: Props) {
  const hasOptions = optionsCount > 1;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={strings.product.add}
      style={({ pressed }) => [styles.button, compact && styles.compact, pressed && styles.pressed, disabled && styles.disabled]}
    >
      {hasOptions ? (
        <View style={styles.stack}>
          <AppText variant="addLabelWithOptions" numberOfLines={1}>
            {strings.product.add}
          </AppText>
          <AppText variant="addOptions" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.options}>
            {strings.product.optionsShort(optionsCount)}
          </AppText>
        </View>
      ) : (
        <AppText variant="addLabel" numberOfLines={1}>
          {strings.product.add}
        </AppText>
      )}
    </Pressable>
  );
}

export const ADD_BUTTON_WIDTH = 92;
export const ADD_BUTTON_HEIGHT = 36;

const styles = StyleSheet.create({
  button: {
    width: '100%',
    maxWidth: ADD_BUTTON_WIDTH,
    height: ADD_BUTTON_HEIGHT,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    // Narrow cards (three in a row on small phones) leave little room: keep the side padding small so
    // "ADD" and "2 options" always stay on one line each, and no vertical padding so both lines fit.
    paddingHorizontal: 4,
    paddingVertical: 0,
    borderRadius: 6,
    borderWidth: addBorder,
    borderColor: colors.addGreenBorder,
    backgroundColor: colors.surface,
    boxShadow: shadows.addButton,
  },
  compact: { width: 88, maxWidth: 88 },
  stack: { alignItems: 'center', alignSelf: 'stretch' },
  options: { marginTop: 1.2, alignSelf: 'stretch', textAlign: 'center' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
