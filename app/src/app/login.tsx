import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SuccessSnackbar } from '@/components/SuccessSnackbar';
import { LoginBrand } from '@/features/login/LoginBrand';
import { LoginFooter } from '@/features/login/LoginFooter';
import { LoginSuccessDialog } from '@/features/login/LoginSuccessDialog';
import { OtpStep } from '@/features/login/OtpStep';
import { PhoneStep } from '@/features/login/PhoneStep';
import { useLoginFlow } from '@/features/login/useLoginFlow';
import { colors } from '@/theme';
import { strings } from '@/strings';

// Back to where Login was opened from (Home), or Home when Login is the first screen.
const goHome = () => (router.canGoBack() ? router.back() : router.replace('/'));

/** Login: phone → OTP → success dialog (DESIGN_SPEC S1, S9, S10; littlekart.com /login). */
export default function LoginScreen() {
  const flow = useLoginFlow(goHome);
  const { step, backToPhone } = flow;

  // Android back on the OTP step returns to the phone step instead of leaving.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 'otp') {
        backToPhone();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [step, backToPhone]);

  const skip = useCallback(() => router.replace('/'), []);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.top}>
          <LoginBrand onSkip={skip} />
          {step === 'phone' ? <PhoneStep flow={flow} /> : <OtpStep flow={flow} />}
        </View>
        <LoginFooter />
      </ScrollView>

      {/* While verifying, the live app covers the page in white (its home skeleton is added in M3). */}
      {flow.verifying ? <View style={styles.verifyingCover} pointerEvents="auto" /> : null}

      <SuccessSnackbar visible={flow.toastVisible} message={strings.login.otpSentToast} onHide={flow.hideToast} />
      <LoginSuccessDialog visible={flow.success} onDismiss={goHome} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 20 },
  top: { width: '100%', maxWidth: 360, alignSelf: 'center' },
  verifyingCover: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.surface },
});
