import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { BackPill } from '@/components/BackPill';
import { colors, hairline } from '@/theme';

/** Width of the Back pill, mirrored on the right so the title sits in the true centre (D-61). */
const BACK_PILL_WIDTH = 72;

/** Sticky white bar: Back pill, centred title (littlekart.com profile header). */
export function ProfileHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        <BackPill onPress={onBack} />
      </View>
      <AppText variant="profileTitle" align="center" numberOfLines={1} style={styles.title}>
        {title}
      </AppText>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: colors.border,
    backgroundColor: colors.profileHeaderBg,
  },
  side: { width: BACK_PILL_WIDTH },
  title: { flex: 1 },
});
