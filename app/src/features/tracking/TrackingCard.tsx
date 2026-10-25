import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, shadows } from '@/theme';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** White rounded card of the tracking page (tracking-info-card; content padding 12 on a phone). */
export function TrackingCard({ children, onPress, style }: Props) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderFaint,
    backgroundColor: colors.surface,
    boxShadow: shadows.trackingCard,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.95 },
});
