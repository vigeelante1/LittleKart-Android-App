import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';

/** "Your cart is empty." with "Start shopping" (littlekart.com /cart). */
export function EmptyCart() {
  return (
    <View style={styles.root}>
      <AppText variant="emptyCart" align="center">
        {strings.cart.empty}
      </AppText>
      <Pressable
        onPress={() => router.navigate('/')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <AppText variant="sheetApply">{strings.cart.startShopping}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', paddingVertical: 32 },
  button: {
    marginTop: 16,
    height: 36.5,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.brightGreen,
    boxShadow: shadows.muiElevation2,
  },
  pressed: { opacity: 0.85 },
});
