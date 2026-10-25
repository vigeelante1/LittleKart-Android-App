import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors } from '@/theme';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

interface Props {
  icon: IconName;
  tone: 'success' | 'danger';
  /** Small number on the badge's corner (e.g. items in a saved cart). */
  count?: number;
}

/** Round tinted icon at the top of a pop-up: green for good news, red for problems. */
export function DialogBadge({ icon, tone, count }: Props) {
  const danger = tone === 'danger';
  return (
    <View style={[styles.ring, { backgroundColor: danger ? colors.errorTint : colors.primaryLight }]}>
      <MaterialIcons name={icon} size={34} color={danger ? colors.muiError : colors.primary} />
      {count !== undefined && count > 0 ? (
        <View style={styles.count}>
          <AppText variant="dialogCount">{count > 99 ? '99+' : String(count)}</AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  count: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});
