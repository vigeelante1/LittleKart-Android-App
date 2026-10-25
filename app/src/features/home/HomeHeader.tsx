import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { AppText } from '@/components/AppText';
import { ArrowDropDownIcon, PersonIcon, TimeOfDayIcon } from '@/components/icons/HeaderIcons';
import { useAuthStore, useLocationStore } from '@/store';
import { colors, hairline, shadows } from '@/theme';
import type { HeaderTheme } from '@/theme/headerThemes';
import { strings } from '@/strings';
import { RollingSearchHint } from './RollingSearchHint';

interface Props {
  /** The store-closed sign sits above the header and takes the status-bar space. */
  belowSign?: boolean;
  theme: HeaderTheme;
  greeting: string;
  deliveryLabel: string;
  searchWords: readonly string[];
  /** True while the page is scrolled to the very top: the greeting row is shown. */
  expanded: boolean;
  onOpenLocation: () => void;
}

const TOP_ROW = 66;

/**
 * Home header (littlekart.com mobile navbar): greeting, "Delivery in about N minutes", the clipped address
 * line, Login or the round profile button, and the search pill with the rolling hint. The greeting row
 * folds away as soon as the page scrolls (the site checks `scrollY <= 0`).
 */
export function HomeHeader({ theme, greeting, deliveryLabel, searchWords, expanded, onOpenLocation, belowSign }: Props) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const address = useLocationStore((s) => s.selected?.text) || strings.home.selectLocation;
  const [height] = useState(() => new Animated.Value(TOP_ROW));
  // The greeting block is as tall as its text needs (the headline can take two lines on a phone), so its
  // height is measured instead of fixed; it folds to 0 while the page is scrolled.
  const [topHeight, setTopHeight] = useState(TOP_ROW);

  useEffect(() => {
    Animated.timing(height, {
      toValue: expanded ? topHeight : 0,
      duration: 250,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [expanded, height, topHeight]);

  const accent = theme.accent;
  return (
    <View style={[styles.wrap, { borderBottomColor: theme.borderColor }]}>
      <LinearGradient
        colors={theme.gradient.map(([c]) => c) as unknown as readonly [string, string, ...string[]]}
        locations={theme.gradient.map(([, p]) => p) as unknown as readonly [number, number, ...number[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {theme.stars ? (
        <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
          {theme.stars.map(([x, y, r, a, c]) => (
            <Circle key={`${x}-${y}`} cx={`${x}%`} cy={`${y}%`} r={r} fill={c} fillOpacity={a} />
          ))}
        </Svg>
      ) : null}

      <View style={[styles.inner, { paddingTop: (belowSign ? 0 : insets.top) + 8 }]}>
        <Animated.View style={[styles.topRowClip, { height }]}>
          <View
            style={styles.topRow}
            onLayout={(e) => {
              const h = Math.ceil(e.nativeEvent.layout.height);
              if (Math.abs(h - topHeight) > 1) setTopHeight(h);
            }}
          >
            <Pressable onPress={onOpenLocation} style={styles.location} accessibilityRole="button">
              <AppText variant="greeting" style={[styles.greeting, { color: accent }]} numberOfLines={1}>
                {greeting}
              </AppText>
              <View style={styles.headlineRow}>
                <View style={styles.headlineIcon}>
                  <TimeOfDayIcon mode={theme.icon} size={18} color={accent} />
                </View>
                <AppText variant="headline" style={[styles.headline, { color: accent }]}>
                  {deliveryLabel}
                </AppText>
              </View>
              <View style={styles.addressRow}>
                <AppText variant="headerAddress" style={[styles.address, { color: accent }]} numberOfLines={1}>
                  {address}
                </AppText>
                <ArrowDropDownIcon size={24} color={accent} />
              </View>
            </Pressable>
            {user ? (
              <Pressable
                onPress={() => router.push('/profile')}
                accessibilityRole="button"
                accessibilityLabel={strings.home.account}
                style={[
                  styles.profile,
                  theme.night
                    ? styles.profileNight
                    : { borderColor: theme.searchBorder, boxShadow: theme.searchShadow },
                ]}
              >
                <PersonIcon size={22} color={accent} />
              </Pressable>
            ) : (
              // Same slot, height and outline as the profile button, so the header looks the same signed in or out.
              <Pressable
                onPress={() => router.push('/login')}
                accessibilityRole="button"
                style={[
                  styles.profile,
                  styles.login,
                  theme.night
                    ? styles.profileNight
                    : { borderColor: theme.searchBorder, boxShadow: theme.searchShadow },
                ]}
              >
                <PersonIcon size={18} color={accent} />
                <AppText variant="headerLogin" style={{ color: accent }}>
                  {strings.home.login}
                </AppText>
              </Pressable>
            )}
          </View>
        </Animated.View>

        <Pressable
          onPress={() => router.push('/search')}
          accessibilityRole="search"
          accessibilityLabel={strings.home.searchLabel}
          style={[styles.search, { backgroundColor: theme.searchFill, borderColor: theme.searchOutline }]}
        >
          <MaterialIcons name="search" size={26} color={theme.searchIcon} style={styles.searchIcon} />
          <View style={styles.flex} />
          <View style={styles.mic}>
            <MaterialIcons name="mic" size={22} color={theme.micIcon} />
          </View>
          <RollingSearchHint words={searchWords} color={theme.searchPlaceholder} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: hairline, boxShadow: shadows.header, zIndex: 10 },
  inner: { paddingHorizontal: 24 },
  topRowClip: { overflow: 'hidden' },
  // Taken out of the flow so it keeps its natural height inside the folding clip.
  topRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // Login / profile button sits centred against the greeting, headline and address block.
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  location: { flexShrink: 1, justifyContent: 'center' },
  greeting: { opacity: 0.72, marginBottom: 1.6 },
  headlineRow: { flexDirection: 'row', alignItems: 'center' },
  headlineIcon: { marginRight: 6 },
  headline: { flexShrink: 1 },
  addressRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center' },
  address: { marginRight: 4, flexShrink: 1 },
  profile: {
    width: 36,
    marginLeft: 12,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.headerProfileBg,
  },
  profileNight: {
    backgroundColor: colors.headerProfileNightBg,
    borderColor: colors.headerProfileNightBorder,
    boxShadow: shadows.headerProfileNight,
  },
  login: { width: undefined, flexDirection: 'row', gap: 4, paddingLeft: 10, paddingRight: 14, marginLeft: 12 },
  search: {
    height: 44,
    marginBottom: 8.8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12.8,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  searchIcon: { marginRight: 11.2, opacity: 0.95 },
  flex: { flex: 1 },
  mic: { width: 32, height: 32, marginLeft: 4, alignItems: 'center', justifyContent: 'center' },
});
