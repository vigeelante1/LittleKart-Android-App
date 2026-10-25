import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, hairline, shadows } from '@/theme';
import type { ProfileMenuItem } from './menu';

interface Props {
  label: string;
  items: readonly ProfileMenuItem[];
  onPress: (item: ProfileMenuItem) => void;
}

/** Grey capitals label and a white card of rows: coloured icon tile, label, chevron (littlekart.com). */
export function ProfileMenu({ label, items, onPress }: Props) {
  return (
    <>
      <AppText variant="profileSection" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.card}>
        {items.map((item, i) => (
          <Pressable
            key={item.path}
            onPress={() => onPress(item)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, i < items.length - 1 && styles.divider, pressed && styles.pressed]}
          >
            <View style={[styles.icon, { backgroundColor: colors[item.tone.bg] }]}>
              <MaterialIcons name={item.icon} size={20} color={colors[item.tone.fg]} />
            </View>
            <AppText variant="profileMenu" style={styles.flex}>
              {item.label}
            </AppText>
            <MaterialIcons name="chevron-right" size={20} color={colors.menuChevron} />
          </Pressable>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: { marginHorizontal: 16, marginBottom: 8 },
  card: {
    marginHorizontal: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadows.soft,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: colors.surface },
  divider: { borderBottomWidth: hairline, borderBottomColor: colors.menuDivider },
  pressed: { backgroundColor: colors.surface2 },
  icon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
});
