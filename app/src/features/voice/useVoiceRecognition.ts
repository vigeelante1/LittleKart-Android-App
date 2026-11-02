import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceState = 'idle' | 'listening' | 'noSpeech' | 'failed' | 'denied';

/** True when this phone has a speech service (almost every Android phone with Google apps). */
export function voiceAvailable(): boolean {
  try {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
}

/**
 * Speech to text through the phone's own recogniser (expo-speech-recognition, DECISIONS D-86).
 * `onFinal` gets the finished sentence; `text` updates live while the user speaks.
 */
export function useVoiceRecognition(onFinal: (text: string) => void) {
  const [state, setState] = useState<VoiceState>('idle');
  const [text, setText] = useState('');
  const finalRef = useRef(onFinal);
  useEffect(() => {
    finalRef.current = onFinal;
  }, [onFinal]);

  useSpeechRecognitionEvent('start', () => setState('listening'));
  useSpeechRecognitionEvent('result', (event) => {
    const heard = event.results[0]?.transcript?.trim() ?? '';
    setText(heard);
    if (event.isFinal && heard) {
      setState('idle');
      finalRef.current(heard);
    }
  });
  useSpeechRecognitionEvent('end', () => setState((s) => (s === 'listening' ? 'idle' : s)));
  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'aborted') return;
    if (event.error === 'not-allowed') setState('denied');
    else if (event.error === 'no-speech' || event.error === 'speech-timeout') setState('noSpeech');
    else setState('failed');
  });

  const start = useCallback(async (lang: string) => {
    setText('');
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setState('denied');
      return;
    }
    setState('listening');
    ExpoSpeechRecognitionModule.start({
      lang,
      interimResults: true,
      continuous: false,
      maxAlternatives: 1,
      androidIntentOptions: { EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 1500 },
    });
  }, []);

  const stop = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      // Already stopped.
    }
  }, []);

  const cancel = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      // Already stopped.
    }
    setState('idle');
    setText('');
  }, []);

  return { state, text, start, stop, cancel };
}
