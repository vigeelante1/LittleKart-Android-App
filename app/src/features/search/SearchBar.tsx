import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { BackPill } from '@/components/BackPill';
import { colors, hairline, interFamily, shadows } from '@/theme';
import { MicButton } from '@/features/voice/MicButton';
import { strings } from '@/strings';

interface Props {
  value: string;
  onChange: (text: string) => void;
  /** Opened from a voice search elsewhere: don't pop the keyboard over the results. */
  autoFocus?: boolean;
}

/** White search bar with the Back pill inside it, "Search for products", × and mic (littlekart.com /search). */
export function SearchBar({ value, onChange, autoFocus = true }: Props) {
  return (
    <View style={styles.bar}>
      <View style={styles.back}>
        <BackPill />
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={strings.search.placeholder}
        placeholderTextColor={colors.inputPlaceholder}
        autoFocus={autoFocus}
        allowFontScaling={false}
        returnKeyType="search"
        selectionColor={colors.brightGreen}
        cursorColor={colors.brightGreen}
        style={styles.input}
      />
      {value ? (
        <Pressable onPress={() => onChange('')} accessibilityRole="button" accessibilityLabel={strings.category.clearSearch} hitSlop={6} style={styles.icon}>
          <MaterialIcons name="close" size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
      <MicButton size={22} color={colors.textGrey} style={[styles.icon, styles.mic]} onResult={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadows.searchBar,
  },
  back: { marginRight: 8 },
  input: { flex: 1, minWidth: 0, height: 32, paddingVertical: 0, fontFamily: interFamily(400), fontSize: 16, color: colors.text },
  icon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  mic: { marginLeft: 4 },
});
