import { ScrollView, StyleSheet } from 'react-native';
import { FilterChip } from '@/components/FilterChip';
import { strings } from '@/strings';
import { FilterSheet } from './FilterSheet';
import type { Listing } from './useListing';

interface Props {
  listing: Listing;
}

/** "Filters ⌄  Sort ⌄  Price ⌄" and the sheet they open. On phones the site hides the Size and Brand chips. */
export function ListingChips({ listing }: Props) {
  const { chips } = listing;
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} style={styles.scroll}>
        <FilterChip label={strings.filters.filters} icon="tune" active={chips.filtersActive} onPress={() => listing.openSheet('all')} />
        <FilterChip label={chips.sortLabel} active={chips.sortActive} onPress={() => listing.openSheet('sort')} />
        <FilterChip label={chips.priceLabel} active={chips.priceActive} onPress={() => listing.openSheet('price')} />
      </ScrollView>
      <FilterSheet
        mode={listing.sheet}
        filters={listing.filters}
        priceOptions={listing.priceOptions}
        sizeOptions={listing.sizeOptions}
        onApply={listing.setFilters}
        onClose={listing.closeSheet}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, marginBottom: 4 },
  row: { gap: 6, paddingHorizontal: 4, paddingVertical: 2 },
});
