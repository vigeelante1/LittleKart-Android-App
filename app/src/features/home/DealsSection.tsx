import type { Product } from '@littlekart/shared';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors } from '@/theme';
import { strings } from '@/strings';
import { DEAL_CARD_HEIGHT, DealCard } from './DealCard';

interface Props {
  title: string;
  products: readonly Product[];
  /** Width available (screen minus the page's 12 px side padding). */
  width: number;
  onViewAll?: () => void;
}

// littlekart.com deals grid: 3 rows, filled column by column, columns (width − 32) / 2.5 wide,
// 16 apart, rows 22 apart, scrolling sideways with each column snapping to the start.
const ROWS = 3;
const COLUMN_GAP = 16;
const ROW_GAP = 22;

/** "Limited Time Deals 🔥" with "View all >" and the sideways deals grid. */
export function DealsSection({ title, products, width, onViewAll }: Props) {
  if (products.length === 0) return null;
  const columnWidth = (width - 32) / 2.5;
  const columns: Product[][] = [];
  products.forEach((p, i) => {
    const col = Math.floor(i / ROWS);
    (columns[col] ??= []).push(p);
  });

  return (
    <View>
      <View style={styles.header}>
        <View style={styles.titleBox}>
          <AppText variant="dealsTitle">{title}</AppText>
        </View>
        <Pressable onPress={onViewAll} hitSlop={6} style={styles.viewAll} accessibilityRole="button">
          <AppText variant="viewAll">{strings.home.viewAll}</AppText>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={columnWidth + COLUMN_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.grid}
      >
        {columns.map((column, c) => (
          <View key={column[0]?.id ?? c} style={[styles.column, { width: columnWidth }]}>
            {column.map((p) => (
              <DealCard key={p.id} product={p} width={columnWidth} />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 28,
    marginBottom: 16,
    paddingHorizontal: 5.6,
  },
  titleBox: { borderLeftWidth: 4, borderLeftColor: colors.primary, paddingLeft: 11.2, flexShrink: 1 },
  viewAll: { paddingVertical: 5.6, paddingHorizontal: 2.4 },
  // The 16 px bottom padding also leaves room for the last row's "+" buttons (14 px below their cards).
  grid: { gap: COLUMN_GAP, paddingBottom: 16 },
  column: { gap: ROW_GAP, height: ROWS * DEAL_CARD_HEIGHT + (ROWS - 1) * ROW_GAP },
});
