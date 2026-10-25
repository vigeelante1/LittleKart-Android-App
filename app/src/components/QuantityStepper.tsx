import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';
import { AppText } from './AppText';

export type StepperVariant = 'card' | 'dialog' | 'cart';

interface Props {
  qty: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** False when the 30-unit limit or the stock is reached: "+" stops working (DECISIONS D-17). */
  canIncrement: boolean;
  /**
   * "card": white outlined pill that replaces ADD on product cards (92 × 36, 34 px buttons, dividers).
   * "dialog": the same in the size picker (92 × 36, radius 18, 32 px buttons, dividers).
   * "cart": small filled green stepper on cart lines (68 × 26).
   */
  variant: StepperVariant;
  /** Cart only: "+" stays tappable at the stock limit and calls this instead (the "Only N units left" note). */
  onBlockedIncrement?: () => void;
}

const outlined: Record<'card' | 'dialog', { radius: number; button: number; count: number; shadow: string }> = {
  card: { radius: 20, button: 34, count: 24, shadow: shadows.cardStepper },
  dialog: { radius: 18, button: 32, count: 28, shadow: shadows.dialogStepper },
};

/** "− 1 +" quantity control (littlekart.com product card, size picker and cart). */
export function QuantityStepper({ qty, onIncrement, onDecrement, canIncrement, variant, onBlockedIncrement }: Props) {
  if (variant === 'cart') {
    return (
      <View style={styles.cart}>
        <Pressable onPress={onDecrement} accessibilityRole="button" accessibilityLabel={strings.product.decrease} hitSlop={4} style={styles.cartButton}>
          <MaterialIcons name="remove" size={15.2} color={colors.white} />
        </Pressable>
        <AppText variant="cartStepperCount" align="center" style={styles.cartCount}>
          {qty}
        </AppText>
        <Pressable
          onPress={canIncrement ? onIncrement : onBlockedIncrement}
          disabled={!canIncrement && !onBlockedIncrement}
          accessibilityRole="button"
          accessibilityLabel={strings.product.increase}
          accessibilityState={{ disabled: !canIncrement }}
          hitSlop={4}
          style={[styles.cartButton, !canIncrement && styles.cartDimmed]}
        >
          <MaterialIcons name="add" size={15.2} color={colors.white} />
        </Pressable>
      </View>
    );
  }

  const size = outlined[variant];
  const button: ViewStyle = { width: size.button, height: size.button, alignItems: 'center', justifyContent: 'center' };
  return (
    <View style={[styles.outlined, { borderRadius: size.radius, boxShadow: size.shadow }]}>
      <Pressable
        onPress={onDecrement}
        accessibilityRole="button"
        accessibilityLabel={strings.product.decrease}
        style={[button, styles.dividerRight]}
      >
        <MaterialIcons name="remove" size={20} color={colors.iconMuted} />
      </Pressable>
      <AppText variant="stepperCount" align="center" style={{ width: size.count }}>
        {qty}
      </AppText>
      <Pressable
        onPress={onIncrement}
        disabled={!canIncrement}
        accessibilityRole="button"
        accessibilityLabel={strings.product.increase}
        accessibilityState={{ disabled: !canIncrement }}
        style={[button, styles.dividerLeft, !canIncrement && styles.dimmed]}
      >
        <MaterialIcons name="add" size={20} color={colors.iconMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outlined: {
    width: 92,
    height: 36,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: hairline,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  dividerRight: { borderRightWidth: hairline, borderRightColor: colors.primary },
  dividerLeft: { borderLeftWidth: hairline, borderLeftColor: colors.primary },
  cart: {
    width: 68,
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    backgroundColor: colors.primary,
    boxShadow: shadows.cartStepper,
  },
  cartButton: { width: 24, height: 26, alignItems: 'center', justifyContent: 'center' },
  cartCount: { width: 20 },
  // The site greys "+" to 60% when the limit is reached.
  dimmed: { opacity: 0.6 },
  // The cart stepper dims "+" to 70% at the limit.
  cartDimmed: { opacity: 0.7 },
});
