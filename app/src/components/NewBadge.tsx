import { useEffect } from 'react';
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadows } from '@/theme';
import { strings } from '@/strings';
import { AppText } from './AppText';

interface Props {
  style?: StyleProp<ViewStyle>;
}

// One shared blink for every badge, like the site's `new-badge-flash 0.7s step-end infinite`:
// fully visible for the first half, 15% for the second.
const flash = new Animated.Value(1);
let started = false;
function startFlash() {
  if (started) return;
  started = true;
  Animated.loop(
    Animated.sequence([
      Animated.timing(flash, { toValue: 1, duration: 0, useNativeDriver: true }),
      Animated.delay(350),
      Animated.timing(flash, { toValue: 0.15, duration: 0, useNativeDriver: true }),
      Animated.delay(350),
    ]),
  ).start();
}

/** Red blinking "New" pill on category tiles and strip items. */
export function NewBadge({ style }: Props) {
  useEffect(startFlash, []);
  return (
    <Animated.View style={[styles.badge, { opacity: flash }, style]} pointerEvents="none">
      <AppText variant="newBadge">{strings.common.new}</AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    zIndex: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.newBadge,
    boxShadow: shadows.newBadge,
  },
});
