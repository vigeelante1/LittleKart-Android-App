import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';
import { colors, interFamily, SCRIPT_FONT, textVariants, type ColorToken, type TextVariantName } from '@/theme';

export interface AppTextProps extends TextProps {
  variant?: TextVariantName;
  /** Override the variant's color with another token. */
  color?: ColorToken;
  align?: TextStyle['textAlign'];
  strike?: boolean;
}

/** The only text component in the app. Font scaling is off so layouts match the live app exactly. */
export function AppText({ variant = 'body', color, align, strike, style, ...rest }: AppTextProps) {
  const v = textVariants[variant];
  const system = 'system' in v && v.system;
  const script = 'script' in v && v.script;
  const base: TextStyle = {
    fontFamily: system ? undefined : script ? SCRIPT_FONT : interFamily(v.weight),
    fontWeight: system ? (String(v.weight) as TextStyle['fontWeight']) : undefined,
    fontSize: v.size,
    color: colors[color ?? v.color],
    letterSpacing: 'letterSpacing' in v ? v.letterSpacing : undefined,
    lineHeight: 'lineHeight' in v ? v.lineHeight : undefined,
    textTransform: 'uppercase' in v && v.uppercase ? 'uppercase' : undefined,
    textAlign: align,
    fontStyle: 'italic' in v && v.italic ? 'italic' : undefined,
  };
  return (
    <Text
      allowFontScaling={false}
      style={[base, strike ? styles.strike : null, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  strike: { textDecorationLine: 'line-through' },
});
