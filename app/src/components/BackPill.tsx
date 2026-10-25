import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { colors, hairline, radius } from '@/theme';
import { strings } from '@/strings';
import { AppText } from './AppText';

interface Props {
  onPress?: () => void;
}

/** The white "‹ Back" pill at the top of inner screens. */
export function BackPill({ onPress }: Props) {
  const handlePress = onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));
  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={strings.common.back}
      hitSlop={8}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
    >
      <MaterialIcons name="chevron-left" size={17.6} color={colors.textBody} style={styles.icon} />
      <AppText variant="backPill">{strings.common.back}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  icon: { marginLeft: -2.8, marginRight: 2.8 },
  pressed: { opacity: 0.7 },
});
