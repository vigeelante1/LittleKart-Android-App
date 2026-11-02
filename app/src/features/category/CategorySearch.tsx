import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, interFamily } from '@/theme';
import { MicButton } from '@/features/voice/MicButton';
import { strings } from '@/strings';

interface Props {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
}

/** "Search in Chicken..." box at the top of the product panel (littlekart.com category-transition-hero). */
export function CategorySearch({ value, onChange, placeholder }: Props) {
  return (
    <View style={styles.box}>
      <MaterialIcons name="search" size={24} color={colors.textSlateMuted} style={styles.icon} />
      {/* Our own one-line hint: Android wraps a long native placeholder onto a second, cut-off line. */}
      {value ? null : (
        <AppText variant="categorySearchHint" numberOfLines={1} style={styles.hint} pointerEvents="none">
          {placeholder}
        </AppText>
      )}
      <TextInput
        value={value}
        onChangeText={onChange}
        accessibilityLabel={placeholder}
        allowFontScaling={false}
        returnKeyType="search"
        selectionColor={colors.brightGreen}
        cursorColor={colors.brightGreen}
        style={styles.input}
      />
      {value ? (
        <Pressable onPress={() => onChange('')} accessibilityRole="button" accessibilityLabel={strings.category.clearSearch} hitSlop={6} style={styles.trailing}>
          <MaterialIcons name="close" size={20} color={colors.textSlateMuted} />
        </Pressable>
      ) : (
        <MicButton size={20} color={colors.textSlateMuted} style={styles.trailing} onResult={onChange} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSearch,
    backgroundColor: colors.categorySearchBg,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    minWidth: 0,
    height: 32,
    paddingVertical: 0,
    fontFamily: interFamily(400),
    fontSize: 16,
    color: colors.text,
  },
  hint: { position: 'absolute', left: 42, right: 44 },
  trailing: { width: 30, height: 30, marginLeft: 4, alignItems: 'center', justifyContent: 'center' },
});
