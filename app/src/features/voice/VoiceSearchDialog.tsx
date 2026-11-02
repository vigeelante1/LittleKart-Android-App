import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Easing, Linking, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { DialogActions } from '@/components/dialog/DialogActions';
import { DialogButton } from '@/components/dialog/DialogButton';
import { DialogShell } from '@/components/dialog/DialogShell';
import { colors } from '@/theme';
import { strings } from '@/strings';
import { useVoiceRecognition } from './useVoiceRecognition';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** The finished sentence; the dialog closes itself after calling this. */
  onResult: (text: string) => void;
  /** Ask AI uses the same pop-up with its own hint and button (DECISIONS D-102). */
  hint?: string;
  actionLabel?: string;
}

/** "Listening…" pop-up for voice search (DECISIONS D-86), in the shared pop-up style (D-83). */
export function VoiceSearchDialog({ visible, onClose, onResult, hint = strings.voice.hint, actionLabel = strings.voice.search }: Props) {
  const [lang, setLang] = useState<string>(strings.voice.languages[0].code);
  const voice = useVoiceRecognition((text) => {
    onResult(text);
    onClose();
  });
  const { start, cancel } = voice;
  const [pulse] = useState(() => new Animated.Value(0));

  // Start listening as soon as the pop-up opens, and again when the language changes.
  useEffect(() => {
    if (!visible) return;
    void start(lang);
    return () => cancel();
  }, [visible, lang, start, cancel]);

  const listening = voice.state === 'listening';
  useEffect(() => {
    if (!listening) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [listening, pulse]);

  const message =
    voice.state === 'denied'
      ? strings.voice.denied
      : voice.state === 'noSpeech'
        ? strings.voice.noSpeech
        : voice.state === 'failed'
          ? strings.voice.failed
          : null;

  return (
    <DialogShell visible={visible} onClose={onClose}>
      <Pressable
        onPress={() => (listening ? voice.stop() : void start(lang))}
        accessibilityRole="button"
        accessibilityLabel={strings.category.voiceSearch}
        style={styles.micWrap}
      >
        <Animated.View
          style={[
            styles.ripple,
            {
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
            },
          ]}
        />
        <View style={[styles.mic, voice.state === 'denied' || voice.state === 'failed' ? styles.micOff : null]}>
          <MaterialIcons name={listening ? 'mic' : 'mic-none'} size={36} color={colors.white} />
        </View>
      </Pressable>

      <AppText variant="savedCartTitle" align="center">
        {listening ? strings.voice.title : voice.text ? strings.voice.heard : strings.category.voiceSearch}
      </AppText>
      {voice.text ? (
        <AppText variant="voiceTranscript" align="center" style={styles.transcript}>
          “{voice.text}”
        </AppText>
      ) : (
        <AppText variant="savedCartBody" align="center" style={styles.transcript}>
          {message ?? hint}
        </AppText>
      )}

      <View style={styles.langs}>
        {strings.voice.languages.map((l) => {
          const active = l.code === lang;
          return (
            <Pressable
              key={l.code}
              onPress={() => setLang(l.code)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <AppText variant={active ? 'voiceChipActive' : 'voiceChip'}>{l.label}</AppText>
            </Pressable>
          );
        })}
      </View>

      <DialogActions>
        <DialogButton kind="secondary" label={strings.voice.cancel} onPress={onClose} />
        {voice.state === 'denied' ? (
          <DialogButton kind="primary" icon="settings" label={strings.voice.openSettings} onPress={() => void Linking.openSettings()} />
        ) : voice.text && !listening ? (
          <DialogButton
            kind="primary"
            icon="search"
            label={actionLabel}
            onPress={() => {
              onResult(voice.text);
              onClose();
            }}
          />
        ) : (
          <DialogButton kind="primary" icon="mic" label={strings.voice.tryAgain} disabled={listening} onPress={() => void start(lang)} />
        )}
      </DialogActions>
    </DialogShell>
  );
}

const styles = StyleSheet.create({
  micWrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  ripple: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary },
  mic: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  micOff: { backgroundColor: colors.textSlateMuted },
  transcript: { marginTop: 6, minHeight: 26 },
  langs: { flexDirection: 'row', gap: 8, marginTop: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
});
