import { MaterialIcons } from '@expo/vector-icons';
import { arrivalLabel, type Order } from '@littlekart/shared';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { TRACKING_STRIP_HEIGHT } from './useDock';

/** Slim white strip for the order on its way: ETA, delivery OTP and "Track ›" (replaces the floating card). */
export function TrackingStrip({ order, now }: { order: Order; now: number }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/tracking/[id]', params: { id: order.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${strings.tracking.viewTracking}, ${arrivalLabel(order, now)}`}
      style={({ pressed }) => [styles.strip, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <MaterialIcons name="delivery-dining" size={22} color={colors.primary} />
      </View>
      <View style={styles.text}>
        <AppText variant="dockEta" numberOfLines={1}>
          {arrivalLabel(order, now)}
        </AppText>
        {order.deliveryOtp ? (
          <AppText variant="dockOtp" numberOfLines={1}>
            {strings.tracking.otp}{' '}
            <AppText variant="dockOtpValue">{order.deliveryOtp}</AppText>
          </AppText>
        ) : null}
      </View>
      <View style={styles.action}>
        <AppText variant="dockTrack">{strings.dock.track}</AppText>
        <MaterialIcons name="chevron-right" size={22} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    height: TRACKING_STRIP_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.otpBorder,
    backgroundColor: colors.surface,
    boxShadow: shadows.dockStrip,
  },
  pressed: { opacity: 0.92 },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenTint12, marginRight: 10 },
  text: { flex: 1, minWidth: 0 },
  action: { flexDirection: 'row', alignItems: 'center' },
});
