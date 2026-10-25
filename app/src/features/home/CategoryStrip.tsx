import type { Category } from '@littlekart/shared';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { NewBadge } from '@/components/NewBadge';
import { ProductImage } from '@/components/ProductImage';
import { colors, hairline, radius, shadows } from '@/theme';

interface Props {
  categories: readonly Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

const ITEM_WIDTH = 82;
const GAP = 8;
const PAD_LEFT = 4;

/** Sticky row of category shortcuts under the header. The active one follows the section in view. */
export function CategoryStrip({ categories, activeId, onSelect }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  // Keep the active item in view, as the site does when the page scrolls to another section.
  useEffect(() => {
    const index = categories.findIndex((c) => c.id === activeId);
    if (index < 0) return;
    scrollRef.current?.scrollTo({ x: Math.max(0, index * (ITEM_WIDTH + GAP) - ITEM_WIDTH), animated: true });
  }, [activeId, categories]);

  return (
    <View style={styles.bar}>
      <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {categories.map((c) => {
          const active = c.id === activeId;
          return (
            <Pressable
              key={c.id}
              onPress={() => onSelect(c.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && styles.pressed]}
            >
              {c.isNew ? <NewBadge style={styles.badge} /> : null}
              <View style={[styles.thumb, active && styles.thumbActive]}>
                <ProductImage uri={c.imageUrl} style={styles.thumbImage} contentFit="cover" />
              </View>
              <AppText variant={active ? 'stripLabelActive' : 'stripLabel'} align="center" numberOfLines={2} style={styles.label}>
                {c.name}
              </AppText>
              {active ? <View style={styles.underline} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.border,
    boxShadow: shadows.strip,
  },
  row: { gap: GAP, paddingTop: 9, paddingBottom: 11, paddingLeft: PAD_LEFT, paddingRight: 4 },
  item: { width: ITEM_WIDTH, paddingTop: 6, paddingHorizontal: 4, paddingBottom: 10, borderRadius: 16 },
  itemActive: { backgroundColor: colors.stripActive },
  pressed: { transform: [{ scale: 0.97 }] },
  badge: { top: 2, right: 4 },
  thumb: {
    width: 46,
    height: 46,
    alignSelf: 'center',
    marginBottom: 6,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.translucentWhite,
    boxShadow: shadows.stripThumb,
  },
  thumbActive: { backgroundColor: colors.surface, boxShadow: shadows.stripThumbActive },
  thumbImage: { transform: [{ scale: 1.08 }] },
  // "Groceries" is 75 px wide in a 74 px label; the browser lets it overflow instead of breaking the word.
  label: { alignSelf: 'center', width: ITEM_WIDTH - 2, maxWidth: ITEM_WIDTH - 2 },
  underline: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 0,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});
