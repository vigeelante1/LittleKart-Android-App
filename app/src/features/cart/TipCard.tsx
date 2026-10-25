import { MaterialIcons } from '@expo/vector-icons';
import {
  applyCustom,
  canApplyCustom,
  formatRupee,
  tapPreset,
  toggleCustom,
  typeCustom,
  type TipState,
} from '@littlekart/shared';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, hairline, interFamily, shadows } from '@/theme';
import { strings } from '@/strings';

interface Props {
  options: readonly number[];
  tip: TipState;
  onChange: (tip: TipState) => void;
}

/** "Tip to your delivery partner" card (littlekart.com /cart). Rules live in shared/src/tip.ts. */
export function TipCard({ options, tip, onChange }: Props) {
  const canApply = canApplyCustom(tip);
  return (
    <View style={styles.card}>
      <AppText variant="tipTitle" align="center" style={styles.title}>
        {strings.tip.title}
      </AppText>
      <AppText variant="tipQuote" align="center" style={styles.quote}>
        {strings.tip.quote}
      </AppText>

      {tip.customOpen ? (
        // The site leaves a 16 px margin under the field, which pushes it above Apply and ×; here they line up (D-57).
        <View style={styles.customRow}>
          <TextInput
            value={tip.customText}
            onChangeText={(text) => onChange(typeCustom(tip, text))}
            placeholder={strings.tip.amountPlaceholder}
            placeholderTextColor={colors.customTipPlaceholder}
            keyboardType="number-pad"
            maxLength={4}
            allowFontScaling={false}
            selectionColor={colors.primary}
            style={styles.input}
          />
          <Pressable
            onPress={() => onChange(applyCustom(tip))}
            disabled={!canApply}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canApply }}
            style={[styles.apply, !canApply && styles.applyDisabled]}
          >
            <AppText variant="tipApply">{strings.tip.apply}</AppText>
          </Pressable>
          <Pressable
            onPress={() => onChange(toggleCustom(tip))}
            accessibilityRole="button"
            accessibilityLabel={strings.tip.closeCustom}
            hitSlop={6}
          >
            <MaterialIcons name="close" size={28} color={colors.footerGrey} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.options}>
          {options.map((value) => {
            const selected = tip.preset === value;
            return (
              <Pressable
                key={value}
                onPress={() => onChange(tapPreset(tip, value))}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <AppText variant={selected ? 'tipChipSelected' : 'tipChip'} numberOfLines={1}>
                  {formatRupee(value)}
                </AppText>
              </Pressable>
            );
          })}
          <Pressable onPress={() => onChange(toggleCustom(tip))} accessibilityRole="button" style={[styles.chip, styles.chipCustom]}>
            <AppText variant="tipChipSelected" numberOfLines={1}>
              {strings.tip.custom}
            </AppText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: hairline,
    borderColor: colors.borderPolicy,
    backgroundColor: colors.softCard,
    boxShadow: shadows.policyCard,
  },
  title: { marginBottom: 5 },
  quote: { marginBottom: 20 },
  options: {
    minHeight: 42,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  chip: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 999,
    borderWidth: hairline,
    borderColor: colors.borderTip,
    backgroundColor: colors.surface,
    boxShadow: shadows.tipChip,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primary, boxShadow: shadows.tipSelected },
  chipCustom: { borderColor: colors.accent, backgroundColor: colors.accent, boxShadow: shadows.tipCustom },
  customRow: { minHeight: 42, marginBottom: 15, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1,
    minWidth: 0,
    height: 38,
    paddingVertical: 0,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: hairline,
    borderColor: colors.customTipBorder,
    backgroundColor: colors.surface,
    boxShadow: shadows.customTip,
    textAlign: 'center',
    fontFamily: interFamily(400),
    fontSize: 14,
    color: colors.black,
  },
  apply: {
    height: 38,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    borderWidth: hairline,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    boxShadow: shadows.tipApply,
  },
  applyDisabled: { opacity: 0.6 },
});
