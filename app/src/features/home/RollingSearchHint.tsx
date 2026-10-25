import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { strings } from '@/strings';

interface Props {
  words: readonly string[];
  color: string;
}

const ROW = 44;
const LOOP_MS = 10000;

/**
 * Search "Mango" → "Milk" → … scrolling upwards without pause, one loop every 10 s
 * (the site's `infiniteScroll 10s linear infinite` over the list repeated twice).
 */
export function RollingSearchHint({ words, color }: Props) {
  const [offset] = useState(() => new Animated.Value(0));
  const distance = words.length * ROW;

  useEffect(() => {
    if (distance === 0) return;
    offset.setValue(0);
    const loop = Animated.loop(
      Animated.timing(offset, { toValue: -distance, duration: LOOP_MS, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [distance, offset]);

  return (
    <View style={styles.window} pointerEvents="none">
      <Animated.View style={{ transform: [{ translateY: offset }] }}>
        {[...words, ...words].map((word, i) => (
          // The list is a fixed repeat of the same words, so the index is a stable key.
          <View key={`${word}-${i}`} style={styles.row}>
            <AppText variant="searchPlaceholder" style={{ color }} numberOfLines={1}>
              {strings.home.searchHint(word)}
            </AppText>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  window: { position: 'absolute', left: 56, right: 56, top: 0, bottom: 0, overflow: 'hidden' },
  row: { height: ROW, justifyContent: 'center' },
});
