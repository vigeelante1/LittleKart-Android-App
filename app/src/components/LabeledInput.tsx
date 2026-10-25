import { useEffect, useState } from 'react';
import { Animated, StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { colors, interFamily, textVariants } from '@/theme';
import { AppText } from './AppText';

interface Props extends Omit<TextInputProps, 'style' | 'placeholder'> {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * MUI outlined TextField with a floating label (the site's address form): the label sits inside the
 * field and moves onto the outline, three-quarter size, when the field is focused or filled.
 */
export function LabeledInput({ label, error, containerStyle, value, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const raised = focused || !!value;
  const [anim] = useState(() => new Animated.Value(raised ? 1 : 0));

  useEffect(() => {
    Animated.timing(anim, { toValue: raised ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [anim, raised]);

  const accent = error ? colors.error : focused ? colors.brightGreen : null;
  const v = textVariants.fieldLabel;

  return (
    <View style={containerStyle}>
      <View style={[styles.field, { borderColor: accent ?? colors.inputOutline, borderWidth: focused || error ? 2 : 1 }]}>
        <TextInput
          value={value}
          allowFontScaling={false}
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
          style={[styles.input, { fontFamily: interFamily(400), color: colors.text, marginLeft: focused || error ? -1 : 0 }]}
          {...rest}
        />
      </View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.labelBox,
          {
            top: anim.interpolate({ inputRange: [0, 1], outputRange: [16.5, -9] }),
            left: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 9] }),
            paddingHorizontal: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }),
          },
        ]}
      >
        <Animated.Text
          allowFontScaling={false}
          numberOfLines={1}
          style={{
            fontFamily: interFamily(v.weight),
            lineHeight: v.lineHeight,
            color: accent ?? colors[v.color],
            fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
          }}
        >
          {label}
        </Animated.Text>
      </Animated.View>
      {error ? (
        <AppText variant="loginHelper" style={styles.helper}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { height: 56, borderRadius: 4, backgroundColor: colors.surface, justifyContent: 'center' },
  input: { height: '100%', paddingHorizontal: 14, paddingVertical: 0, fontSize: 16 },
  // The white backing hides the outline behind the raised label, like MUI's notch.
  labelBox: { position: 'absolute', backgroundColor: colors.surface, maxWidth: '90%' },
  helper: { marginTop: 3, marginHorizontal: 14 },
});
