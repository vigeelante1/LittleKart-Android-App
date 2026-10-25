import { useEffect, useRef } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';
import { OutlinedInput } from '@/components/OutlinedInput';
import { interFamily, textVariants } from '@/theme';

interface Props {
  boxes: readonly string[];
  focusIndex: number | null;
  disabled: boolean;
  error: boolean;
  onChange: (index: number, text: string) => void;
  onBackspace: (index: number) => void;
}

/** Four separate OTP boxes (48 wide, 4 apart). Paste fills all of them. */
export function OtpBoxes({ boxes, focusIndex, disabled, error, onChange, onBackspace }: Props) {
  const refs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (focusIndex !== null) refs.current[focusIndex]?.focus();
  }, [focusIndex]);

  const v = textVariants.otpDigit;
  return (
    <View style={styles.row}>
      {boxes.map((digit, index) => (
        <OutlinedInput
          // Boxes have a fixed order and count, so the index is a stable key.
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          value={digit}
          onChangeText={(text) => onChange(index, text)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace') onBackspace(index);
          }}
          editable={!disabled}
          error={error}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={4}
          autoComplete={index === 0 ? 'sms-otp' : 'off'}
          textContentType={index === 0 ? 'oneTimeCode' : 'none'}
          selectTextOnFocus
          height={52.75}
          containerStyle={styles.box}
          inputStyle={[styles.input, { fontFamily: interFamily(v.weight), fontSize: v.size }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginBottom: 16 },
  box: { width: 48 },
  input: { textAlign: 'center', paddingLeft: 0, paddingRight: 0 },
});
