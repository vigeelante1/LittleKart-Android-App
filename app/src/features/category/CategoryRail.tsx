import type { Id, SubCategory } from '@littlekart/shared';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ProductImage } from '@/components/ProductImage';
import { colors } from '@/theme';

interface Props {
  items: readonly SubCategory[];
  selectedId: Id | null;
  onSelect: (id: Id) => void;
}

/** Left rail of sub-categories: round picture and label, grey tile on the selected one (littlekart.com, phone layout). */
export function CategoryRail({ items, selectedId, onSelect }: Props) {
  return (
    <ScrollView style={styles.rail} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      {items.map((item) => {
        const selected = item.id === selectedId;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.item, selected && styles.itemSelected]}
          >
            <View style={styles.image}>
              <ProductImage uri={item.imageUrl} contentFit="contain" />
            </View>
            <AppText variant={selected ? 'railLabelSelected' : 'railLabel'} align="center" style={styles.label}>
              {item.name}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: { width: 78, flexGrow: 0, backgroundColor: colors.railBg },
  list: { paddingTop: 6, paddingBottom: 10 },
  item: {
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 2,
    marginBottom: 6,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: 'transparent',
  },
  itemSelected: { backgroundColor: colors.railSelected },
  image: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', backgroundColor: colors.surface },
  label: { paddingHorizontal: 2 },
});
