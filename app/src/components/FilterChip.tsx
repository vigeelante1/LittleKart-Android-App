import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors, shadows } from '@/theme';
import { AppText } from './AppText';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

interface Props {
  label: string;
  /** Leading icon (Filters has a "tune" icon). */
  icon?: IconName;
  /** A sort or filter is set: green fill, border and text (littlekart.com). */
  active?: boolean;
  onPress?: () => void;
}

/** Rounded chip with a dropdown arrow: "Filters ⌄", "Sort ⌄", "Price ⌄". */
export function FilterChip({ label, icon, active = false, onPress }: Props) {
  const tint = active ? colors.filterActiveText : colors.textBody;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.chip, active ? styles.active : styles.idle, pressed && styles.pressed]}
    >
      {icon ? <MaterialIcons name={icon} size={17} color={tint} /> : null}
      <AppText variant={active ? 'filterChipActive' : 'filterChip'} numberOfLines={1}>
        {label}
      </AppText>
      <MaterialIcons name="keyboard-arrow-down" size={18} color={tint} style={styles.arrow} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7.2,
    borderRadius: 10,
    borderWidth: 1,
  },
  idle: { borderColor: colors.borderChip, backgroundColor: colors.chipBg, boxShadow: shadows.chipInset },
  active: { borderColor: colors.filterActiveBorder, backgroundColor: colors.filterActiveBg, boxShadow: shadows.chipActiveInset },
  arrow: { opacity: 0.75 },
  pressed: { opacity: 0.8 },
});
