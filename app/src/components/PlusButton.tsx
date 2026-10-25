import { Pressable, StyleSheet } from 'react-native';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { AppText } from './AppText';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

/** Green "+" square on home deal cards, overlapping the card's bottom-right edge. */
export function PlusButton({ onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={strings.product.add}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <AppText variant="plus" align="center">
        +
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.plusGreen,
    boxShadow: shadows.plus,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
