import { forwardRef, useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';
import { colors, interFamily, textVariants } from '@/theme';
import { AppText } from './AppText';

interface Props extends Omit<TextInputProps, 'style'> {
  /** Text or element at the start of the field (e.g. "+91"). */
  adornment?: ReactNode;
  error?: boolean;
  /** Red helper line under the field (MUI helperText). */
  helperText?: string;
  height?: number;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

/**
 * The site's MUI outlined text field: 1 px grey outline, 4 px corners, 2 px green outline when focused,
 * red outline and helper text on error.
 */
export const OutlinedInput = forwardRef<TextInput, Props>(function OutlinedInput(
  { adornment, error, helperText, height = 56, containerStyle, inputStyle, onFocus, onBlur, editable = true, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const outlineColor = error ? colors.error : focused ? colors.brightGreen : colors.inputOutline;
  const outlineWidth = focused || error ? 2 : 1;
  const v = textVariants.loginInput;
  return (
    <View style={containerStyle}>
      <View
        style={[
          styles.field,
          { height, borderColor: outlineColor, borderWidth: outlineWidth, paddingLeft: adornment ? 14 - (outlineWidth - 1) : 0 },
        ]}
      >
        {adornment ? <View style={styles.adornment}>{adornment}</View> : null}
        <TextInput
          ref={ref}
          allowFontScaling={false}
          editable={editable}
          placeholderTextColor={colors.inputPlaceholder}
          selectionColor={colors.brightGreen}
          cursorColor={colors.brightGreen}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            { fontFamily: interFamily(v.weight), fontSize: v.size, color: colors[v.color], paddingLeft: adornment ? 0 : 14 },
            inputStyle,
          ]}
          {...rest}
        />
      </View>
      {helperText ? (
        <AppText variant="loginHelper" style={styles.helper}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  adornment: { marginRight: 8, flexDirection: 'row', alignItems: 'center' },
  // minWidth 0 lets the field shrink to narrow boxes (the 48-wide OTP boxes) instead of its default width.
  input: { flex: 1, minWidth: 0, height: '100%', paddingRight: 14, paddingVertical: 0 },
  helper: { marginTop: 3, marginHorizontal: 14 },
});
