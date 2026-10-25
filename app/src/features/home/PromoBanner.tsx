import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors } from '@/theme';
import type { BannerDesign } from './bannerDesigns';

interface Props {
  design: BannerDesign;
  /** Side slides are shorter; the text block shrinks to the kicker and title. */
  compact: boolean;
}

/** One home offer banner: gradient card, headline, call to action and a photo (iteration 2). */
export function PromoBanner({ design, compact }: Props) {
  const { copy } = design;
  return (
    <LinearGradient colors={design.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.text}>
        <View style={styles.kicker}>
          <AppText variant="bannerKicker" numberOfLines={1}>
            {copy.kicker}
          </AppText>
        </View>
        <AppText variant="bannerTitle" numberOfLines={2}>
          {copy.title}
        </AppText>
        {compact ? null : (
          <AppText variant="bannerSub" numberOfLines={2} style={styles.sub}>
            {copy.sub}
          </AppText>
        )}
        {compact ? null : (
          <View style={styles.cta}>
            <AppText variant="bannerCta">{copy.cta}</AppText>
            <MaterialIcons name="chevron-right" size={18} color={colors.bannerCtaText} />
          </View>
        )}
      </View>
      <View style={styles.photoRing}>
        <Image source={design.photo} contentFit="cover" style={styles.photo} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: 16, gap: 12 },
  text: { gap: 8, alignItems: 'flex-start' },
  kicker: { backgroundColor: colors.bannerKickerBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  sub: { opacity: 0.92 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 7,
    marginTop: 2,
  },
  photoRing: { flex: 1, borderRadius: 14, padding: 3, backgroundColor: colors.bannerPhotoRing },
  photo: { flex: 1, borderRadius: 11 },
});
