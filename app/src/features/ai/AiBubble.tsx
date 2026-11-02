import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, hairline } from '@/theme';
import { useTypewriter } from './useTypewriter';

interface Props {
  role: 'user' | 'assistant';
  text: string;
  /** Second, smaller line (the Telugu hint under the greeting). */
  sub?: string;
  /** Type the text out word by word (the newest answer), then call `onTyped`. */
  animate?: boolean;
  onTyped?: () => void;
}

/** One chat message: the shopper's on the right in LittleKart green, the assistant's on the left in white. */
export function AiBubble({ role, text, sub, animate = false, onTyped }: Props) {
  const user = role === 'user';
  const { shown, typing } = useTypewriter(text, animate, onTyped);
  const [blink] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!typing) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [typing, blink]);

  return (
    <View style={[styles.bubble, user ? styles.user : styles.bot]}>
      <AppText variant={user ? 'aiMessageUser' : 'aiMessage'}>
        {shown}
        {typing ? (
          <Animated.Text style={[styles.caret, { opacity: blink }]} accessibilityElementsHidden>
            {' ▍'}
          </Animated.Text>
        ) : null}
      </AppText>
      {sub ? (
        <AppText variant="aiMessageMuted" style={styles.sub}>
          {sub}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '86%', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 16 },
  user: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bot: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.heroBorder,
    borderBottomLeftRadius: 4,
  },
  caret: { color: colors.primary },
  sub: { marginTop: 6 },
});
