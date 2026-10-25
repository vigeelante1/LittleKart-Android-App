import { Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, hairline, shadows } from '@/theme';

interface Props {
  label: string;
  helper: string;
  selected: boolean;
  onPress: () => void;
}

/** A payment option button (orange when chosen, as on the site). */
export function PaymentMethodCard({ label, helper, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.card, selected ? styles.selected : styles.idle, pressed && styles.pressed]}
    >
      <AppText variant={selected ? 'methodLabelSelected' : 'methodLabel'}>{label}</AppText>
      <AppText variant={selected ? 'methodHelperSelected' : 'methodHelper'} style={styles.helper}>
        {helper}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, borderRadius: 8, borderWidth: hairline, alignItems: 'flex-start' },
  selected: { backgroundColor: colors.paymentSelectedBg, borderColor: colors.paymentSelectedBorder, boxShadow: shadows.paymentSelected },
  idle: { backgroundColor: colors.surface, borderColor: colors.paymentIdleBorder },
  helper: { opacity: 0.8 },
  pressed: { opacity: 0.9 },
});
