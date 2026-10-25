import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '@/theme';
import { AppText } from './AppText';

interface Props {
  visible: boolean;
  message: string;
  onHide: () => void;
  /** The live app hides it after 1.5 s. */
  durationMs?: number;
  /** Distance from the bottom; default 20 % of the screen (login). MUI's own Snackbar sits 8 px up. */
  bottom?: number;
}

/** Green "OTP sent successfully!" toast, 20% of the screen height above the bottom (MUI filled success Alert). */
export function SuccessSnackbar({ visible, message, onHide, durationMs = 1500, bottom }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Created once; kept in state so it is a stable render value (React Compiler rule).
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!visible) return;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 225, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(progress, { toValue: 0, duration: 195, useNativeDriver: true }).start(() => onHide());
    }, durationMs);
    return () => clearTimeout(timer);
  }, [visible, durationMs, onHide, progress]);

  if (!visible) return null;
  return (
    <View pointerEvents="none" style={[styles.wrap, { bottom: (bottom ?? height * 0.2) + insets.bottom }]}>
      <Animated.View
        accessibilityRole="alert"
        style={[
          styles.alert,
          { opacity: progress, transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }) }] },
        ]}
      >
        <MaterialIcons name="check-circle-outline" size={22} color={colors.white} style={styles.icon} />
        <AppText variant="snackbar" align="center">
          {message}
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 10 },
  alert: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.snackbarSuccess,
    boxShadow: shadows.snackbar,
  },
  icon: { marginRight: 12, opacity: 0.9 },
});
