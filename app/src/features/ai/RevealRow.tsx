import { useEffect, useState, type ReactNode } from 'react';
import { Animated } from 'react-native';

/** Gap between rows sliding in, and how long one row takes. */
export const REVEAL_STAGGER_MS = 70;
const REVEAL_MS = 220;

interface Props {
  /** Position in the list; row n starts n × REVEAL_STAGGER_MS after the first. */
  index: number;
  animate: boolean;
  children: ReactNode;
}

/** A list row that fades and slides up into place when the answer's list appears (D-102). */
export function RevealRow({ index, animate, children }: Props) {
  const [progress] = useState(() => new Animated.Value(animate ? 0 : 1));
  useEffect(() => {
    if (!animate) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const anim = Animated.timing(progress, { toValue: 1, duration: REVEAL_MS, delay: index * REVEAL_STAGGER_MS, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [animate, index, progress]);
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });
  return <Animated.View style={{ opacity: progress, transform: [{ translateY }] }}>{children}</Animated.View>;
}
