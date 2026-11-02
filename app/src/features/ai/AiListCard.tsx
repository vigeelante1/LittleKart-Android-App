import type { Id, Product } from '@littlekart/shared';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';
import { AiItemRow } from './AiItemRow';
import type { AiList } from './askAiStore';
import { REVEAL_STAGGER_MS, RevealRow } from './RevealRow';

interface Props {
  list: AiList;
  products: Record<Id, Product>;
  onToggle: (productId: Id) => void;
  onQty: (productId: Id, delta: number) => void;
  /** Slide the rows in one after another, then call `onShown`. */
  animate?: boolean;
  onShown?: () => void;
}

/** The assistant's list: ingredients (ticked) and optional "goes well with" items (unticked). */
export function AiListCard({ list, products, onToggle, onQty, animate = false, onShown }: Props) {
  const items = list.lines.filter((l) => !l.extra && products[l.productId]);
  const extras = list.lines.filter((l) => l.extra && products[l.productId]);
  // Section titles count as rows, so everything slides in top to bottom.
  const rows = items.length + extras.length + (items.length ? 1 : 0) + (extras.length ? 1 : 0);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => onShown?.(), rows * REVEAL_STAGGER_MS + 220);
    return () => clearTimeout(timer);
    // onShown is called once per list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, rows]);

  let row = 0;
  const section = (title: string, lines: typeof items) =>
    lines.length ? (
      <View style={styles.section}>
        <RevealRow index={row++} animate={animate}>
          <AppText variant="aiSection" style={styles.title}>
            {title}
          </AppText>
        </RevealRow>
        {lines.map((l) => (
          <RevealRow key={l.productId} index={row++} animate={animate}>
            <AiItemRow line={l} product={products[l.productId]} onToggle={() => onToggle(l.productId)} onQty={(d) => onQty(l.productId, d)} />
          </RevealRow>
        ))}
      </View>
    ) : null;
  return (
    <View style={styles.card}>
      {section(strings.ai.items, items)}
      {section(strings.ai.extras, extras)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: hairline,
    borderColor: colors.recBorder,
    backgroundColor: colors.surface,
    boxShadow: shadows.recCard,
  },
  section: { gap: 2 },
  title: { marginBottom: 4 },
});
