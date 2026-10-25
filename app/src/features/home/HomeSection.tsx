import type { Section, Tile } from '@littlekart/shared';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { NewBadge } from '@/components/NewBadge';
import { ProductImage } from '@/components/ProductImage';
import { colors, hairline, shadows } from '@/theme';

interface Props {
  section: Section;
  /** Width available (screen minus the page's 12 px side padding). */
  width: number;
  onTilePress: (tile: Tile) => void;
}

const COLUMNS = 4;
const GAP = 8;

/** A home section: dark-green bar + title, then a 4-column grid of square tiles (littlekart.com home-section). */
export function HomeSection({ section, width, onTilePress }: Props) {
  const tileWidth = (width - GAP * (COLUMNS - 1)) / COLUMNS;
  return (
    <View style={styles.section}>
      <View style={styles.titleBox}>
        <AppText variant="sectionTitle">{section.title}</AppText>
      </View>
      <View style={styles.grid}>
        {section.tiles.map((tile) => (
          <Pressable
            key={tile.id}
            onPress={() => onTilePress(tile)}
            accessibilityRole="button"
            accessibilityLabel={tile.label}
            style={({ pressed }) => [{ width: tileWidth }, pressed && styles.pressed]}
          >
            <View style={styles.card}>
              {tile.isNew ? <NewBadge style={styles.badge} /> : null}
              <ProductImage uri={tile.imageUrl} contentFit="cover" />
            </View>
            <AppText variant="tileLabel" align="center" numberOfLines={2} style={styles.label}>
              {tile.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginVertical: 32 },
  titleBox: {
    alignSelf: 'flex-start',
    marginBottom: 18,
    paddingLeft: 12,
    paddingRight: 2,
    paddingVertical: 1.2,
    borderLeftWidth: 5,
    borderLeftColor: colors.primaryDark,
  },
  grid: { marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  card: {
    aspectRatio: 1,
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadows.tile,
  },
  badge: { top: 4, right: 4 },
  label: { marginTop: 10, minHeight: 40 },
  pressed: { opacity: 0.85 },
});
