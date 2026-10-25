import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors } from '@/theme';
import { strings } from '@/strings';

/** "Delivery OTP [1234]" pill in the tracking header. */
export function OtpPill({ otp }: { otp: string }) {
  return (
    <View style={styles.pill}>
      <AppText variant="otpLabel">{strings.tracking.otp}</AppText>
      <View style={styles.value}>
        <AppText variant="otpValue" align="center">
          {otp}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
    paddingLeft: 9,
    paddingRight: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.otpBorder,
    backgroundColor: colors.greenTint10,
  },
  value: { minWidth: 36, paddingVertical: 1, paddingHorizontal: 7, borderRadius: 999, backgroundColor: colors.white },
});
