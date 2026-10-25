import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, shadows, type ColorToken } from '@/theme';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

interface Props {
  label: string;
  onPress: () => void;
  /** primary: filled green · danger: outlined red · secondary: outlined green · plain: text only. */
  kind?: 'primary' | 'danger' | 'secondary' | 'plain';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
}

const LOOK: Record<NonNullable<Props['kind']>, { text: ColorToken; fill?: ColorToken; border?: ColorToken }> = {
  primary: { text: 'white', fill: 'primary', border: 'primary' },
  danger: { text: 'muiError', border: 'muiError' },
  secondary: { text: 'primary', border: 'primary' },
  plain: { text: 'primary' },
};

/** Full-height pop-up button. Several in a row share the width equally. */
export function DialogButton({ label, onPress, kind = 'primary', icon, loading, disabled }: Props) {
  const look = LOOK[kind];
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        look.fill ? { backgroundColor: colors[look.fill], boxShadow: shadows.muiElevation2 } : null,
        look.border ? { borderWidth: 1.5, borderColor: colors[look.border] } : null,
        off && styles.off,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size={18} color={colors[look.text]} />
      ) : icon ? (
        <MaterialIcons name={icon} size={19} color={colors[look.text]} />
      ) : null}
      <AppText variant="muiButton" color={look.text} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  off: { opacity: 0.6 },
  pressed: { opacity: 0.85 },
});
