import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { OutlinedInput } from '@/components/OutlinedInput';
import { colors } from '@/theme';
import { strings } from '@/strings';
import type { LoginFlow } from './useLoginFlow';

interface Props {
  flow: LoginFlow;
}

/** "+91 Mobile Number", the Full Name field for new users, and the bright green Continue / Send OTP button. */
export function PhoneStep({ flow }: Props) {
  const label = flow.sending
    ? strings.login.sendingOtp
    : flow.checking
      ? strings.login.checking
      : flow.askName
        ? strings.login.sendOtp
        : strings.login.continue;

  return (
    <View>
      <OutlinedInput
        value={flow.phone}
        onChangeText={flow.setPhone}
        placeholder={strings.login.mobilePlaceholder}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={10}
        autoComplete="tel"
        textContentType="telephoneNumber"
        returnKeyType="done"
        onSubmitEditing={() => void flow.submitPhone()}
        error={!!flow.errors.mobile}
        helperText={flow.errors.mobile}
        adornment={<AppText variant="loginAdornment">{strings.login.countryCode}</AppText>}
        containerStyle={flow.askName ? styles.gapBelow : undefined}
      />
      {flow.askName ? (
        <OutlinedInput
          value={flow.name}
          onChangeText={flow.setName}
          placeholder={strings.login.namePlaceholder}
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="done"
          onSubmitEditing={() => void flow.submitPhone()}
          error={!!flow.errors.name}
          helperText={flow.errors.name}
          containerStyle={styles.nameField}
        />
      ) : flow.errors.name ? (
        <AppText variant="loginHelper" style={styles.nameError}>
          {flow.errors.name}
        </AppText>
      ) : null}
      <Pressable
        onPress={() => void flow.submitPhone()}
        disabled={flow.phoneBusy}
        accessibilityRole="button"
        accessibilityState={{ disabled: flow.phoneBusy, busy: flow.sending || flow.checking }}
        style={({ pressed }) => [styles.button, pressed && !flow.phoneBusy && styles.pressed]}
      >
        <AppText variant="loginButton" color={flow.phoneBusy ? 'disabledText' : 'white'}>
          {label}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  gapBelow: { marginBottom: 16 },
  nameField: { marginTop: 16 },
  nameError: { marginTop: 3, marginHorizontal: 14 },
  // The site keeps the green fill when the button is disabled; only the text greys out.
  button: {
    height: 50,
    marginTop: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: colors.brightGreen,
  },
  pressed: { opacity: 0.9 },
});
