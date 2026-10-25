import { formatCountdown } from '@littlekart/shared';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { strings } from '@/strings';
import { OtpBoxes } from './OtpBoxes';
import type { LoginFlow } from './useLoginFlow';

interface Props {
  flow: LoginFlow;
}

/** "Verify your number", the four boxes, messages and "Resend OTP in 0:56". No button: entering the 4th digit verifies. */
export function OtpStep({ flow }: Props) {
  const resendLabel = flow.countdown > 0 ? strings.login.resendIn(formatCountdown(flow.countdown)) : strings.login.resend;
  return (
    <View>
      <AppText variant="verifyTitle" align="center" style={styles.title}>
        {strings.login.verifyTitle}
      </AppText>
      <AppText variant="verifySub" align="center" style={styles.sub}>
        {strings.login.otpSentTo(flow.phone)}
      </AppText>
      <OtpBoxes
        boxes={flow.boxes}
        focusIndex={flow.focusIndex}
        disabled={flow.verifying}
        error={!!flow.errors.otp}
        onChange={flow.changeOtp}
        onBackspace={flow.backspaceOtp}
      />
      {flow.errors.otp ? (
        <AppText variant="otpError" style={styles.message}>
          {flow.errors.otp}
        </AppText>
      ) : null}
      {flow.verifying ? (
        <AppText variant="verifying" align="center" style={styles.verifying}>
          {strings.login.verifying}
        </AppText>
      ) : null}
      <Pressable
        onPress={() => void flow.resend()}
        disabled={flow.resendDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: flow.resendDisabled }}
        style={[styles.resend, (flow.verifying || !!flow.errors.otp) && styles.resendTight]}
      >
        <AppText variant="resend" color={flow.resendDisabled ? 'disabledText' : 'brightGreen'}>
          {resendLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 8 },
  sub: { marginBottom: 16 },
  message: { marginBottom: 16 },
  verifying: { marginBottom: 8 },
  // MUI text button: 6 × 8 padding, full width.
  resend: { marginTop: 8, paddingVertical: 6, paddingHorizontal: 8, alignItems: 'center', borderRadius: 4 },
  resendTight: { marginTop: 0 },
});
