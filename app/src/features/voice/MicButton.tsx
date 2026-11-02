import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { strings } from '@/strings';
import { voiceAvailable } from './useVoiceRecognition';
import { VoiceSearchDialog } from './VoiceSearchDialog';

interface Props {
  size: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  onResult: (text: string) => void;
  hint?: string;
  actionLabel?: string;
  accessibilityLabel?: string;
}

/** The search boxes' mic: opens voice search; hidden on phones without a speech service (DECISIONS D-86). */
export function MicButton({ size, color, style, onResult, hint, actionLabel, accessibilityLabel = strings.category.voiceSearch }: Props) {
  const [open, setOpen] = useState(false);
  const [available] = useState(voiceAvailable);
  if (!available) return null;
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={8}
        style={({ pressed }) => [style, pressed && styles.pressed]}
      >
        <MaterialIcons name="mic" size={size} color={color} />
      </Pressable>
      {open ? <VoiceSearchDialog visible onClose={() => setOpen(false)} onResult={onResult} hint={hint} actionLabel={actionLabel} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.6 },
});
