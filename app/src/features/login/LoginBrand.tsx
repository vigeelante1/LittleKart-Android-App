import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { brandImages } from '@/assets/resolveImage';
import { strings } from '@/strings';

interface Props {
  onSkip: () => void;
}

/** "Skip" at the top right, the logo and "Fresh & Fast". */
export function LoginBrand({ onSkip }: Props) {
  return (
    <View>
      <View style={styles.skipRow}>
        <Pressable onPress={onSkip} accessibilityRole="button" hitSlop={8} style={styles.skip}>
          <AppText variant="skip">{strings.login.skip}</AppText>
        </Pressable>
      </View>
      <View style={styles.logoRow}>
        <Image source={brandImages.logo} style={styles.logo} contentFit="contain" accessibilityLabel="Littlekart" />
      </View>
      <AppText variant="tagline" align="center" style={styles.tagline}>
        {strings.login.tagline}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  skipRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  skip: { paddingVertical: 6, paddingHorizontal: 4 },
  logoRow: { alignItems: 'center', marginTop: 8 },
  // The live logo is 150 wide; its artwork is 150 × 44.5.
  logo: { width: 150, height: 44.5 },
  tagline: { marginTop: 8, marginBottom: 24 },
});
