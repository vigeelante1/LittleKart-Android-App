import type { Banner } from '@littlekart/shared';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { ProductImage } from '@/components/ProductImage';
import { colors, shadows } from '@/theme';

interface Props {
  banners: readonly Banner[];
  /** Width available (screen minus the page's 12 px side padding). */
  width: number;
  onPress?: (banner: Banner) => void;
}

// littlekart.com mobile banner: keen-slider, 1.32 slides per view, 12 px apart, centred, looping,
// next slide every 2.2 s. Container 3.7in tall (355.2); side slides 2.66in (255.4); radius 9.
const PER_VIEW = 1.32;
const SPACING = 12;
const HEIGHT = 355.2;
const SIDE_HEIGHT = 255.4;
const AUTOPLAY_MS = 2200;
/** Copies of the list used to make the loop feel endless. */
const COPIES = 200;

export function BannerCarousel({ banners, width, onPress }: Props) {
  const listRef = useRef<FlatList<{ key: string; banner: Banner }>>(null);
  const slideWidth = (width - SPACING * (PER_VIEW - 1)) / PER_VIEW;
  const interval = slideWidth + SPACING;
  const sidePad = (width - slideWidth) / 2;
  const loop = banners.length > 1;

  const data = useMemo(() => {
    const copies = loop ? COPIES : 1;
    return Array.from({ length: banners.length * copies }, (_, i) => {
      const banner = banners[i % banners.length] as Banner;
      return { key: `${banner.id}-${i}`, banner };
    });
  }, [banners, loop]);

  const startIndex = loop ? banners.length * Math.floor(COPIES / 2) : 0;
  const [active, setActive] = useState(startIndex);
  const activeRef = useRef(startIndex);

  const goTo = useCallback(
    (index: number) => {
      listRef.current?.scrollToOffset({ offset: index * interval, animated: true });
    },
    [interval],
  );

  // Autoplay: restart the 2.2 s timer whenever the active slide changes (by swipe or by timer).
  useEffect(() => {
    if (!loop) return;
    const timer = setTimeout(() => goTo(activeRef.current + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [active, loop, goTo]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / interval);
      if (index !== activeRef.current) {
        activeRef.current = index;
        setActive(index);
      }
    },
    [interval],
  );

  if (banners.length === 0) return null;

  return (
    <View style={[styles.wrap, { height: HEIGHT }]}>
      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        decelerationRate="fast"
        disableIntervalMomentum
        initialScrollIndex={startIndex}
        // Offsets exclude the side padding so index i lands centred at scroll x = i × interval.
        getItemLayout={(_, index) => ({ length: interval, offset: index * interval, index })}
        contentContainerStyle={{ paddingHorizontal: sidePad }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        windowSize={3}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        renderItem={({ item, index }) => {
          const isActive = index === active;
          return (
            <View style={[styles.cell, { width: interval }]}>
              <Pressable
                onPress={() => onPress?.(item.banner)}
                style={[styles.slide, { width: slideWidth, height: isActive ? HEIGHT : SIDE_HEIGHT }]}
              >
                <ProductImage uri={item.banner.imageUrl} contentFit="cover" style={styles.image} />
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 18, marginBottom: 8 },
  cell: { height: HEIGHT, justifyContent: 'center' },
  slide: { borderRadius: 9, overflow: 'hidden', backgroundColor: colors.surface, boxShadow: shadows.banner },
  image: { width: '100%', height: '100%' },
});
