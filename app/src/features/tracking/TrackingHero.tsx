import { statusLabel, type Order } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { BackPill } from '@/components/BackPill';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { OtpPill } from './OtpPill';

/** Top sheet of the tracking page: Back, then centred "ORDER TRACKING", status, ETA, order number and delivery OTP. */
export function TrackingHero({ order, eta }: { order: Order; eta: string }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={[colors.white, colors.heroGreenTint]} style={[styles.hero, { paddingTop: 16 + insets.top }]}>
      <View style={styles.backRow}>
        <BackPill onPress={() => router.navigate('/')} />
      </View>
      <View style={styles.text}>
        <AppText variant="heroKicker" align="center">{strings.tracking.title}</AppText>
        <AppText variant="heroStatus" align="center">{statusLabel(order.status)}</AppText>
        <AppText variant="heroArriving" align="center" style={styles.line}>
          {eta}
        </AppText>
        <AppText variant="heroOrderId" align="center" style={[styles.line, styles.dim]}>
          {strings.tracking.orderNumber(order.id)}
        </AppText>
        {order.deliveryOtp ? <OtpPill otp={order.deliveryOtp} /> : null}
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
  // Iteration 2: Back on its own row, everything else centred.
  backRow: { flexDirection: 'row', marginBottom: 8 },
  text: { alignItems: 'center', gap: 4 },
  line: { marginTop: 6 },
  dim: { opacity: 0.92 },
});
