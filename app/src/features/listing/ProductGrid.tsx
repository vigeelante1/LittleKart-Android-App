import type { Product } from '@littlekart/shared';
import { StyleSheet, View } from 'react-native';
import { ProductCard, type ProductCardLayout } from '@/components/ProductCard';

interface Props {
  products: readonly Product[];
  onOpenOptions: (product: Product) => void;
  /** 2 on category and search pages (gap 4); 3 in the cart's "Often bought together" (gap 8). */
  columns?: 2 | 3;
  layout?: ProductCardLayout;
}

/** Product grid (padding 2). Cards in a row share the taller card's height, as in a CSS grid. */
export function ProductGrid({ products, onOpenOptions, columns = 2, layout = 'grid' }: Props) {
  const rows: Product[][] = [];
  for (let i = 0; i < products.length; i += columns) rows.push(products.slice(i, i + columns));
  const gap = columns === 3 ? 8 : 4;
  return (
    <View style={[styles.grid, { gap }]}>
      {rows.map((row) => (
        <View key={row.map((p) => p.id).join('|')} style={[styles.row, { gap }]}>
          {row.map((p) => (
            <View key={p.id} style={styles.cell}>
              <ProductCard product={p} onOpenOptions={onOpenOptions} layout={layout} />
            </View>
          ))}
          {Array.from({ length: columns - row.length }, (_, i) => (
            <View key={`empty-${i}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { padding: 2 },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  cell: { flex: 1, minWidth: 0 },
});
