import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { strings } from '@/strings';

interface Props {
  words: readonly string[];
  color: string;
}

const SHOW_MS = 2200;

/**
 * Search "Mango" → "Milk" → …: one word at a time, fading in place inside the search box.
 * (A scrolling list relied on the box clipping its overflow, which Android didn't always do, so words
 * showed above and below the box.)
 */
export function RollingSearchHint({ words, color }: Props) {
  const [index, setIndex] = useState(0);
  const [progress] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (words.length < 2) return;
    const timer = setInterval(() => {
      Animated.timing(progress, { toValue: 0, duration: 180, easing: Easing.in(Easing.ease), useNativeDriver: true }).start(() => {
        setIndex((i) => (i + 1) % words.length);
        Animated.timing(progress, { toValue: 1, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
      });
    }, SHOW_MS);
    return () => clearInterval(timer);
  }, [words.length, progress]);

  const word = words[index % Math.max(1, words.length)] ?? '';
  return (
    <View style={styles.window} pointerEvents="none">
      <Animated.View
        style={{ opacity: progress }}
      >
        <AppText variant="searchPlaceholder" style={{ color }} numberOfLines={1}>
          {strings.home.searchHint(word)}
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  window: { position: 'absolute', left: 56, right: 56, top: 0, bottom: 0, justifyContent: 'center', overflow: 'hidden' },
});
