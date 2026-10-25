import type { Banner, Tile } from '@littlekart/shared';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useDock } from '@/features/dock/useDock';
import { BannerCarousel } from '@/features/home/BannerCarousel';
import { CategoryStrip } from '@/features/home/CategoryStrip';
import { DealsSection } from '@/features/home/DealsSection';
import { HomeHeader } from '@/features/home/HomeHeader';
import { HomeSection } from '@/features/home/HomeSection';
import { SavedCartDialog } from '@/features/home/SavedCartDialog';
import { useSavedCartPrompt } from '@/features/home/useSavedCartPrompt';
import { LocationDialog } from '@/features/location/LocationDialog';
import { useReopenLocationDialog } from '@/hooks/useReopenLocationDialog';
import { useConfig } from '@/hooks/useConfig';
import { useDeliveryEta } from '@/hooks/useDeliveryEta';
import { useHomeData } from '@/hooks/useHomeData';
import { useStoreClosed } from '@/hooks/useStoreClosed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StoreClosedRibbon } from '@/components/StoreClosedRibbon';
import { useHydrated } from '@/hooks/useHydrated';
import { useAuthStore, useLocationStore } from '@/store';
import { colors } from '@/theme';
import { greetingFor, headerThemeFor } from '@/theme/headerThemes';
import { strings } from '@/strings';

const PAGE_PADDING = 12;
/** Extra gap kept above a section when the strip scrolls to it (the site's scroll-margin-top). */
const SECTION_MARGIN = 18;

function useHour(): number {
  const [hour, setHour] = useState(() => new Date().getHours());
  useEffect(() => {
    const timer = setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => clearInterval(timer);
  }, []);
  return hour;
}

/** Home (DESIGN_SPEC S2–S5, S11, S12; littlekart.com home page). */
export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const contentWidth = width - PAGE_PADDING * 2;
  const hour = useHour();
  const theme = headerThemeFor(hour);
  const greeting = strings.greeting[greetingFor(hour)];
  const config = useConfig();
  const { label: deliveryLabel } = useDeliveryEta();
  const { data } = useHomeData();
  const closedStore = useStoreClosed();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const hasLocation = useLocationStore((s) => s.selected !== null);
  const locationReady = useHydrated(useLocationStore);
  const savedCart = useSavedCartPrompt();
  const pillSpace = useDock().space;

  const [expanded, setExpanded] = useState(true);
  const [locationOpen, setLocationOpen] = useState(false);
  useReopenLocationDialog(useCallback(() => setLocationOpen(true), []));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const stripHeight = useRef(0);
  const sectionTops = useRef<Record<string, number>>({});

  // No delivery location yet: the dialog opens by itself and can't be closed until one is chosen.
  const locationRequired = locationReady && !hasLocation;
  const showLocation = locationOpen || locationRequired;

  const sections = useMemo(() => data?.sections ?? [], [data]);
  // Before any scrolling, the first section is highlighted.
  const active = activeCategory ?? sections[0]?.categoryId ?? null;

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      setExpanded(y <= 0);
      // The strip highlights the last section whose top has passed under it; before the first section, the first.
      const line = y + stripHeight.current + SECTION_MARGIN + 1;
      let current = sections[0]?.categoryId ?? null;
      for (const s of sections) {
        const top = sectionTops.current[s.categoryId];
        if (top !== undefined && top <= line) current = s.categoryId;
      }
      setActiveCategory((prev) => (prev === current ? prev : current));
    },
    [sections],
  );

  const scrollToCategory = useCallback((categoryId: string) => {
    const top = sectionTops.current[categoryId];
    if (top === undefined) return;
    setActiveCategory(categoryId);
    scrollRef.current?.scrollTo({ y: Math.max(0, top - stripHeight.current - SECTION_MARGIN), animated: true });
  }, []);

  const openTile = useCallback((tile: Tile) => {
    router.push({ pathname: '/category/[id]', params: { id: tile.id, title: tile.label, from: 'tile' } });
  }, []);

  const openBanner = useCallback((banner: Banner) => {
    if (banner.targetTileId) router.push({ pathname: '/category/[id]', params: { id: banner.targetTileId, from: 'banner' } });
  }, []);

  return (
    <View style={styles.root}>
      {closedStore ? <StoreClosedRibbon store={closedStore} topInset={insets.top} /> : null}
      <HomeHeader
        belowSign={closedStore !== null}
        theme={theme}
        greeting={greeting}
        deliveryLabel={deliveryLabel}
        searchWords={config.searchHints}
        expanded={expanded}
        onOpenLocation={() => setLocationOpen(true)}
      />
      <ScrollView
        ref={scrollRef}
        stickyHeaderIndices={[0]}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(24, pillSpace) }}
      >
        <View onLayout={(e: LayoutChangeEvent) => (stripHeight.current = e.nativeEvent.layout.height)}>
          {data ? (
            <CategoryStrip categories={data.categories} activeId={active} onSelect={scrollToCategory} />
          ) : null}
        </View>
        <View style={styles.page}>
          {data ? <BannerCarousel banners={data.banners} width={contentWidth} onPress={openBanner} /> : null}
          {data ? <DealsSection title={strings.home.dealsTitle} products={data.deals} width={contentWidth} onViewAll={() => router.push('/deals')} /> : null}
        </View>
        {sections.map((section) => (
          <View
            key={section.id}
            style={styles.page}
            onLayout={(e: LayoutChangeEvent) => {
              sectionTops.current[section.categoryId] = e.nativeEvent.layout.y;
            }}
          >
            <HomeSection section={section} width={contentWidth} onTilePress={openTile} />
          </View>
        ))}
      </ScrollView>

      <LocationDialog
        visible={showLocation}
        variant={user ? 'change' : 'welcome'}
        required={locationRequired}
        onClose={() => setLocationOpen(false)}
      />
      <SavedCartDialog
        visible={savedCart.visible}
        count={savedCart.count}
        clearing={savedCart.clearing}
        onGotoCart={savedCart.gotoCart}
        onClear={savedCart.clearCart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.homeBg },
  page: { paddingHorizontal: PAGE_PADDING, backgroundColor: colors.homeBg },
});
