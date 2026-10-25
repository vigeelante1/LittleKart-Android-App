import { MaterialIcons } from '@expo/vector-icons';
import { arrivingIn, minutesLeft } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { useNow } from '@/hooks/useNow';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { useActiveOrder } from './useActiveOrder';

/** Pages where the card is not drawn: the tracking page itself, and the full-screen login and map. */
const HIDDEN = [/^\/tracking/, /^\/login/, /^\/add-address/];

/**
 * Small green "View Tracking" card on the right, above the View Cart pill, while an order is on its way
 * (littlekart.com tracking-floating-card--dock, phone layout).
 */
export function FloatingTrackingCard() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const now = useNow();
  const order = useActiveOrder(now);
  if (!order || HIDDEN.some((re) => re.test(pathname))) return null;

  const bottom = (pathname === '/cart' ? 112 : 100) + Math.max(48, insets.bottom);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/tracking/[id]', params: { id: order.id } })}
      accessibilityRole="button"
      accessibilityLabel={strings.tracking.viewTracking}
      style={[styles.wrap, { bottom }]}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark, colors.accent]}
        // 135°: primary at 0, primary-dark at 70 %, accent at 180 % (so only its start shows).
        locations={[0, 0.39, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.8, y: 1.8 }}
        style={styles.card}
      >
        <View style={styles.text}>
          <AppText variant="floatTitle">{strings.tracking.viewTracking}</AppText>
          <AppText variant="floatSub" style={styles.sub}>
            {arrivingIn(minutesLeft(order, now))}
          </AppText>
          {order.status !== 'delivered' && order.deliveryOtp ? (
            <View style={styles.otp}>
              <AppText variant="floatOtpLabel" style={styles.otpLabel}>
                {strings.tracking.otp}
              </AppText>
              <View style={styles.otpValue}>
                <AppText variant="floatOtpValue" align="center">
                  {order.deliveryOtp}
                </AppText>
              </View>
            </View>
          ) : null}
        </View>
        <MaterialIcons name="chevron-right" size={20} color={colors.white} style={styles.chevron} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 12, width: 176, borderRadius: 18, boxShadow: shadows.floatingTracking, zIndex: 30 },
  card: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  text: { flexShrink: 1 },
  sub: { marginTop: 2, opacity: 0.85 },
  otp: {
    marginTop: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingLeft: 9,
    paddingRight: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.whiteTint26,
    backgroundColor: colors.whiteTint20,
  },
  otpLabel: { opacity: 0.9 },
  otpValue: { minWidth: 36, paddingVertical: 1, paddingHorizontal: 7, borderRadius: 999, backgroundColor: colors.white },
  chevron: { marginTop: 2, alignSelf: 'center' },
});
