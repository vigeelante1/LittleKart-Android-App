import { formatNutrient, nutritionTags, type Nutrition } from '@littlekart/shared';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText';
import { colors, hairline, type ColorToken } from '@/theme';
import { strings } from '@/strings';

const t = strings.productPage;

/** Nutrition tags as small chips under the price (product page, DECISIONS D-101). */
export function NutritionChips({ nutrition }: { nutrition?: Nutrition }) {
  const tags = nutritionTags(nutrition);
  if (tags.length === 0) return null;
  return (
    <View style={styles.chips}>
      {tags.map((tag) => (
        <View key={tag} style={styles.chip}>
          <AppText variant="pdpTag">{strings.nutritionTags[tag]}</AppText>
        </View>
      ))}
    </View>
  );
}

function Pill({ bg, dot, label }: { bg: ColorToken; dot: ColorToken; label: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: colors[bg] }]}>
      <View style={[styles.dot, { backgroundColor: colors[dot] }]} />
      <AppText variant="nutriPill">{label}</AppText>
    </View>
  );
}

/** "Nutritional info": a one-line summary in coloured pills, then the full table behind "View more". */
export function NutritionInfo({ nutrition }: { nutrition: Nutrition }) {
  const [open, setOpen] = useState(false);
  const n = nutrition;
  const g = (v: number) => formatNutrient(v);
  const rows: [string, string, boolean][] = [
    [t.nutrients.energy, `${g(n.energyKcal)} kcal`, false],
    [t.nutrients.protein, `${g(n.protein)} g`, false],
    [t.nutrients.carbs, `${g(n.carbs)} g`, false],
    ...(n.sugars !== undefined ? ([[t.nutrients.sugars, `${g(n.sugars)} g`, true]] as [string, string, boolean][]) : []),
    [t.nutrients.fat, `${g(n.fat)} g`, false],
    ...(n.saturatedFat !== undefined ? ([[t.nutrients.saturatedFat, `${g(n.saturatedFat)} g`, true]] as [string, string, boolean][]) : []),
    ...(n.transFat !== undefined ? ([[t.nutrients.transFat, `${g(n.transFat)} g`, true]] as [string, string, boolean][]) : []),
    ...(n.fibre !== undefined ? ([[t.nutrients.fibre, `${g(n.fibre)} g`, false]] as [string, string, boolean][]) : []),
    ...(n.sodiumMg !== undefined ? ([[t.nutrients.sodium, `${g(n.sodiumMg)} mg`, false]] as [string, string, boolean][]) : []),
  ];

  return (
    <View style={styles.card}>
      <AppText variant="pdpSection">{t.nutrition}</AppText>
      <View style={styles.rule} />
      <View style={styles.summaryHead}>
        <MaterialIcons name="receipt-long" size={16} color={colors.textSlateMuted} />
        <AppText variant="nutriSummaryLabel">{t.nutritionSummary}</AppText>
      </View>
      <View style={styles.summary}>
        <AppText variant="nutriText">{t.nutritionHas}</AppText>
        <Pill bg="toneOrangeBg" dot="toneOrange" label={t.kcal(g(n.energyKcal))} />
        <Pill bg="toneVioletBg" dot="toneViolet" label={t.grams(g(n.protein), t.protein)} />
        <Pill bg="toneSkyBg" dot="toneSky" label={t.grams(g(n.carbs), t.carbs)} />
        <Pill bg="toneRoseBg" dot="toneRose" label={t.grams(g(n.fat), t.fats)} />
        <AppText variant="nutriText">{t.nutritionEvery(n.per)}</AppText>
      </View>

      {open ? (
        <View style={styles.table}>
          <View style={[styles.row, styles.rowHead]}>
            <AppText variant="nutriRowValue">{t.nutritionPer(n.per)}</AppText>
          </View>
          {rows.map(([key, value, sub]) => (
            <View key={key} style={styles.row}>
              <AppText variant="nutriRowKey" style={sub ? styles.sub : undefined}>
                {key}
              </AppText>
              <AppText variant="nutriRowValue">{value}</AppText>
            </View>
          ))}
          <AppText variant="nutriSource" style={styles.source}>
            {t.nutritionSource(n.source)}
          </AppText>
        </View>
      ) : null}

      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={styles.more}>
        <AppText variant="pdpMore">{open ? t.nutritionLess : t.nutritionMore}</AppText>
        <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={24} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, backgroundColor: colors.primaryLight },
  card: {
    marginTop: 20,
    padding: 20,
    borderRadius: 18,
    borderWidth: hairline,
    borderColor: colors.recBorder,
    backgroundColor: colors.surface,
  },
  rule: { height: 1, marginTop: 12, backgroundColor: colors.border },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  summary: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 6, rowGap: 6, marginTop: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  table: { marginTop: 16, borderRadius: 12, borderWidth: hairline, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 9, borderTopWidth: hairline, borderTopColor: colors.border },
  rowHead: { borderTopWidth: 0, backgroundColor: colors.thumbBg },
  sub: { paddingLeft: 12 },
  source: { paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: hairline, borderTopColor: colors.border },
  more: {
    marginTop: 16,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
