import { Image } from 'expo-image';
import { Linking, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { brandImages } from '@/assets/resolveImage';
import { strings } from '@/strings';

// The live app's legal pages.
const TERMS_URL = 'https://www.littlekart.com/terms-and-conditions.html';
const PRIVACY_URL = 'https://www.littlekart.com/privacy_policy.html';

/** Cart illustration and the Terms & Conditions / Privacy Policy line at the bottom of the login page. */
export function LoginFooter() {
  return (
    <View style={styles.wrap}>
      <Image
        source={brandImages.loginIllustration}
        style={styles.illustration}
        contentFit="contain"
        accessibilityLabel="Login illustration"
      />
      <AppText variant="footer" align="center" style={styles.text}>
        {strings.login.termsPrefix}
        <AppText variant="footerLink" style={styles.link} onPress={() => void Linking.openURL(TERMS_URL)}>
          {strings.login.terms}
        </AppText>
        {strings.login.and}
        <AppText variant="footerLink" style={styles.link} onPress={() => void Linking.openURL(PRIVACY_URL)}>
          {strings.login.privacy}
        </AppText>
        .
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 360, alignSelf: 'center', alignItems: 'center', marginTop: 24 },
  // The live illustration is 300 × 200.
  illustration: { width: '100%', maxWidth: 300, aspectRatio: 3 / 2 },
  text: { marginTop: 8 },
  link: { textDecorationLine: 'underline' },
});
