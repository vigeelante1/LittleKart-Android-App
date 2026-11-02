import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { MicButton } from '@/features/voice/MicButton';
import { colors, hairline, interFamily } from '@/theme';
import { MAX_AI_MESSAGE } from '@littlekart/shared';
import { strings } from '@/strings';

interface Props {
  busy: boolean;
  onSend: (text: string) => void;
}

/** Message box with the voice mic (English and Telugu) and a send button. */
export function AiComposer({ busy, onSend }: Props) {
  const [text, setText] = useState('');
  const send = (value: string) => {
    if (!value.trim() || busy) return;
    onSend(value);
    setText('');
  };
  const canSend = text.trim().length > 0 && !busy;
  return (
    <View style={styles.row}>
      <View style={styles.box}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={strings.ai.placeholder}
          placeholderTextColor={colors.inputPlaceholder}
          style={styles.input}
          multiline
          textAlignVertical="top"
          // The web preview's text area starts two lines tall; phones start at one line and grow.
          {...(Platform.OS === 'web' ? { numberOfLines: 1 } : {})}
          maxLength={MAX_AI_MESSAGE}
          submitBehavior="blurAndSubmit"
          returnKeyType="send"
          onSubmitEditing={() => send(text)}
          accessibilityLabel={strings.ai.placeholder}
        />
        <MicButton
          size={22}
          color={colors.primary}
          onResult={send}
          hint={strings.ai.voiceHint}
          actionLabel={strings.ai.voiceSend}
          accessibilityLabel={strings.ai.voice}
        />
      </View>
      <Pressable
        onPress={() => send(text)}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel={strings.ai.send}
        style={[styles.send, !canSend && styles.sendOff]}
      >
        <MaterialIcons name="send" size={20} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  box: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 22,
    borderWidth: hairline,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, minWidth: 0, maxHeight: 96, paddingTop: 11, paddingBottom: 11, fontFamily: interFamily(500), fontSize: 15, color: colors.text },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  sendOff: { backgroundColor: colors.muiDisabledFill },
});
