import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, hairline } from '@/theme';

interface Props {
  title?: string;
  sub: string;
  button: string;
  onPress: () => void;
}

/** "Forgot something?" card with the countdown and one button (tracking page and cart, D-105). */
export function AddOnBanner({ title, sub, button, onPress }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <MaterialIcons name="add-shopping-cart" size={22} color={colors.primary} />
      </View>
      <View style={styles.text}>
        {title ? <AppText variant="addOnBannerTitle">{title}</AppText> : null}
        <AppText variant="addOnBannerSub">{sub}</AppText>
      </View>
      <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <AppText variant="addOnButton">{button}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: hairline,
    borderColor: colors.freeDeliveryBorder,
    backgroundColor: colors.welcomeInfoBg,
  },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenTint12 },
  text: { flex: 1, minWidth: 0, gap: 2 },
  button: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10, backgroundColor: colors.primary },
  pressed: { backgroundColor: colors.primaryDark },
});
