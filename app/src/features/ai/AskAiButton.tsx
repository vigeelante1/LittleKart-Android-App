import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { ASK_AI_HEIGHT, useDock } from '@/features/dock/useDock';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { useAskAiStore } from './askAiStore';

/** Floating "✦ Ask AI" pill, bottom-right above the cart bar, on Home and the category screens (D-102). */
export function AskAiButton() {
  const { askAi, bottom, height } = useDock();
  const open = useAskAiStore((s) => s.open);
  const setOpen = useAskAiStore((s) => s.setOpen);
  if (!askAi || open) return null;
  return (
    <Pressable
      onPress={() => setOpen(true)}
      accessibilityRole="button"
      accessibilityLabel={strings.ai.fabLabel}
      style={({ pressed }) => [styles.fab, { bottom: bottom + (height > 0 ? height + 12 : 0) }, pressed && styles.pressed]}
    >
      <MaterialIcons name="auto-awesome" size={18} color={colors.white} />
      <AppText variant="aiFab">{strings.ai.fab}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 12,
    height: ASK_AI_HEIGHT,
    paddingHorizontal: 16,
    borderRadius: ASK_AI_HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    boxShadow: shadows.pdpAdd,
    zIndex: 31,
  },
  pressed: { backgroundColor: colors.primaryDark },
});
