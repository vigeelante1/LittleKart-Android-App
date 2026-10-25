import { MaterialIcons } from '@expo/vector-icons';
import { DEFAULT_SORT, SORT_OPTIONS, toggleSize, type ListingFilters, type PriceBand, type SortValue } from '@littlekart/shared';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';

export type SheetMode = 'all' | 'sort' | 'price' | 'weight';

interface Option<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface Props {
  mode: SheetMode | null;
  filters: ListingFilters;
  priceOptions: readonly { value: Exclude<PriceBand, 'all'>; label: string; count: number }[];
  sizeOptions: readonly { label: string; count: number }[];
  onApply: (filters: ListingFilters) => void;
  onClose: () => void;
}

/** "Filters", "Sort", "Price" bottom sheet (littlekart.com category and search pages). */
export function FilterSheet(props: Props) {
  const { mode, onClose } = props;
  const { height } = useWindowDimensions();
  return (
    <Modal visible={mode !== null} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="none" />
      <View style={[styles.sheet, { height: Math.max(320, height - 212) }]}>
        {/* Mounted per opening, so every opening starts from the applied filters. */}
        {mode ? <SheetBody {...props} mode={mode} /> : null}
      </View>
    </Modal>
  );
}

function SheetBody({ mode, filters, priceOptions, sizeOptions, onApply, onClose }: Props & { mode: SheetMode }) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<ListingFilters>(filters);
  const tabs: { id: Exclude<SheetMode, 'all'>; label: string }[] = [
    { id: 'sort', label: strings.filters.sort },
    { id: 'price', label: strings.filters.price },
    ...(sizeOptions.length > 0 ? [{ id: 'weight' as const, label: strings.filters.size }] : []),
  ];
  const [tab, setTab] = useState<Exclude<SheetMode, 'all'>>(mode === 'all' ? 'sort' : mode);

  const title =
    mode === 'all'
      ? strings.filters.filters
      : mode === 'sort'
        ? strings.filters.sort
        : mode === 'price'
          ? strings.filters.price
          : strings.filters.size;

  const radio = <T extends string>(options: readonly Option<T>[], selected: T, onSelect: (v: T) => void) =>
    options.map((o) => (
      <OptionRow
        key={o.value}
        label={o.label}
        count={o.count}
        selected={selected === o.value}
        kind="radio"
        onPress={() => onSelect(o.value)}
      />
    ));

  const panel = (which: Exclude<SheetMode, 'all'>) => {
    if (which === 'sort') {
      return radio<SortValue>(SORT_OPTIONS, draft.sort, (sort) => setDraft((d) => ({ ...d, sort })));
    }
    if (which === 'price') {
      return radio<PriceBand>([{ value: 'all', label: strings.filters.allPrices }, ...priceOptions], draft.price, (price) =>
        setDraft((d) => ({ ...d, price })),
      );
    }
    return (
      <>
        <AppText variant="sheetNote" style={styles.note}>
          {strings.filters.sizeNote}
        </AppText>
        {sizeOptions.map((o) => (
          <OptionRow
            key={o.label}
            label={o.label}
            count={o.count}
            kind="check"
            selected={draft.sizes.some((s) => s.toLowerCase() === o.label.toLowerCase())}
            onPress={() => setDraft((d) => ({ ...d, sizes: toggleSize(d.sizes, o.label) }))}
          />
        ))}
      </>
    );
  };

  return (
    <>
      <View style={styles.header}>
        <AppText variant="sheetTitle">{title}</AppText>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={strings.filters.close} hitSlop={8} style={styles.close}>
          <MaterialIcons name="close" size={20} color={colors.iconMuted} />
        </Pressable>
      </View>

      {mode === 'all' ? (
        <View style={styles.split}>
          <ScrollView style={styles.tabs} contentContainerStyle={styles.tabsContent}>
            {tabs.map((t) => (
              <Pressable key={t.id} onPress={() => setTab(t.id)} style={[styles.tab, tab === t.id && styles.tabActive]}>
                <AppText variant={tab === t.id ? 'sheetTabActive' : 'sheetTab'}>{t.label}</AppText>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView style={styles.flex} contentContainerStyle={styles.panelSplit}>
            {panel(tab)}
          </ScrollView>
        </View>
      ) : (
        <ScrollView style={styles.flex} contentContainerStyle={styles.panelSingle}>
          {panel(mode)}
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        <Pressable
          onPress={() => setDraft({ sort: DEFAULT_SORT, price: 'all', sizes: [] })}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, styles.clear, pressed && styles.pressed]}
        >
          <AppText variant="sheetClear">{strings.filters.clear}</AppText>
        </Pressable>
        <Pressable
          onPress={() => {
            onApply(draft);
            onClose();
          }}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, styles.apply, pressed && styles.pressed]}
        >
          <AppText variant="sheetApply">{strings.filters.apply}</AppText>
        </Pressable>
      </View>
    </>
  );
}

interface RowProps {
  label: string;
  count?: number;
  selected: boolean;
  kind: 'radio' | 'check';
  onPress: () => void;
}

function OptionRow({ label, count, selected, kind, onPress }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={kind === 'radio' ? 'radio' : 'checkbox'}
      accessibilityState={{ checked: selected }}
      style={styles.option}
    >
      <AppText variant={selected ? 'sheetOptionSelected' : 'sheetOption'} style={styles.flex}>
        {count !== undefined ? `${label} (${count})` : label}
      </AppText>
      {kind === 'radio' ? (
        <View style={[styles.radio, selected && styles.markOn]}>{selected ? <View style={styles.dot} /> : null}</View>
      ) : (
        <View style={[styles.check, selected ? styles.checkOn : null, selected && styles.markOn]}>
          {selected ? <MaterialIcons name="check" size={14} color={colors.white} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.dialogBackdrop },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: colors.surface,
    boxShadow: shadows.muiElevation16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: hairline,
    borderBottomColor: colors.sheetDivider,
  },
  close: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  split: { flex: 1, flexDirection: 'row', minHeight: 0 },
  tabs: {
    width: '36%',
    maxWidth: 148,
    flexGrow: 0,
    borderRightWidth: hairline,
    borderRightColor: colors.sheetDivider,
    backgroundColor: colors.sheetTabsBg,
  },
  tabsContent: { paddingVertical: 4 },
  tab: { paddingHorizontal: 12, paddingVertical: 10.8, borderRightWidth: 3, borderRightColor: 'transparent' },
  tabActive: { backgroundColor: colors.filterActiveBg, borderRightColor: colors.filterActiveBorder },
  flex: { flex: 1 },
  panelSplit: { paddingHorizontal: 12, paddingVertical: 6 },
  panelSingle: { paddingHorizontal: 16, paddingVertical: 12 },
  note: { marginBottom: 8, paddingHorizontal: 2 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 2,
    paddingVertical: 9.2,
    borderBottomWidth: hairline,
    borderBottomColor: colors.optionDivider,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.radioIdle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.filterActiveBorder },
  check: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.radioIdle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkOn: { backgroundColor: colors.filterActiveBorder },
  markOn: { borderColor: colors.filterActiveBorder },
  footer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: hairline,
    borderTopColor: colors.sheetDivider,
    backgroundColor: colors.surface,
  },
  button: { flex: 1, height: 36.5, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  clear: { borderWidth: 1, borderColor: colors.radioIdle },
  apply: { backgroundColor: colors.filterActiveBorder, boxShadow: shadows.muiElevation2 },
  pressed: { opacity: 0.85 },
});
