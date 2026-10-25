import { arrivingIn, statusLabel, type Order } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { BackPill } from '@/components/BackPill';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { OtpPill } from './OtpPill';

/** Top sheet of the tracking page: Back, "ORDER TRACKING", status, ETA, order number and delivery OTP. */
export function TrackingHero({ order, minutes }: { order: Order; minutes: number }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={[colors.white, colors.heroGreenTint]} style={[styles.hero, { paddingTop: 16 + insets.top }]}>
      <View style={styles.row}>
        <BackPill onPress={() => router.navigate('/')} />
        <View style={styles.text}>
          <AppText variant="heroKicker">{strings.tracking.title}</AppText>
          <AppText variant="heroStatus">{statusLabel(order.status)}</AppText>
          <AppText variant="heroArriving" style={styles.line}>
            {arrivingIn(minutes)}
          </AppText>
          <AppText variant="heroOrderId" style={[styles.line, styles.dim]}>
            {strings.tracking.orderNumber(order.id)}
          </AppText>
          {order.deliveryOtp ? <OtpPill otp={order.deliveryOtp} /> : null}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.heroGreenBorder,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    boxShadow: shadows.trackingHero,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { flex: 1, minWidth: 0, gap: 4 },
  line: { marginTop: 6 },
  dim: { opacity: 0.92 },
});
