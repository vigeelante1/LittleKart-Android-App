import { storeClosedLines, type Store } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { AppText } from './AppText';

interface Props {
  store: Store;
  /** Status-bar height when the sign is the first thing on the screen. */
  topInset?: number;
}

/**
 * "Sorry, we're CLOSED / We'll be back at 6:00 AM": the orange sign at the top of Home and the cart while the
 * store is outside its hours (littlekart.com lk-store-closed-ribbon, phone layout).
 */
export function StoreClosedRibbon({ store, topInset = 0 }: Props) {
  const { backAt } = storeClosedLines(store);
  return (
    <LinearGradient
      colors={[colors.closedRibbonTop, colors.closedRibbonBottom]}
      style={[styles.ribbon, { paddingTop: 10 + topInset }]}
      accessibilityRole="alert"
      accessibilityLabel={strings.storeClosed.label(backAt)}
    >
      <View style={styles.tagShadow}>
        <LinearGradient
          colors={[colors.closedTagA, colors.closedTagB, colors.closedTagC]}
          locations={[0, 0.45, 1]}
          // 165°: mostly top to bottom, leaning slightly left.
          start={{ x: 0.37, y: 0 }}
          end={{ x: 0.63, y: 1 }}
          style={styles.tag}
        >
          <Rivet side="left" />
          <Rivet side="right" />
          <View style={styles.body}>
            <View style={styles.row1}>
              <AppText variant="closedSorry" style={styles.sorry}>
                {strings.storeClosed.sorry}
              </AppText>
              <AppText variant="closedWere" style={styles.were}>
                {strings.storeClosed.were}
                <AppText variant="closedWord" style={styles.word}>
                  {strings.storeClosed.closed}
                </AppText>
              </AppText>
            </View>
            <View style={styles.row2}>
              <AppText variant="closedBack" style={styles.back}>
                {backAt}
              </AppText>
            </View>
          </View>
        </LinearGradient>
      </View>
    </LinearGradient>
  );
}

function Rivet({ side }: { side: 'left' | 'right' }) {
  return (
    <View style={[styles.rivetWrap, side === 'left' ? styles.left : styles.right]}>
      <LinearGradient colors={[colors.rivetLight, colors.rivetMid, colors.rivetDark]} locations={[0, 0.55, 1]} start={{ x: 0.3, y: 0.3 }} end={{ x: 1, y: 1 }} style={styles.rivet} />
    </View>
  );
}

const styles = StyleSheet.create({
  ribbon: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.closedRibbonBorder,
    zIndex: 5,
  },
  tagShadow: { borderRadius: 14, boxShadow: shadows.closedTag },
  tag: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 2.4, borderColor: colors.closedTagBorder, boxShadow: shadows.closedTagRing },
  rivetWrap: { position: 'absolute', top: 8, width: 9, height: 9, borderRadius: 4.5, boxShadow: shadows.rivet },
  left: { left: 10 },
  right: { right: 10 },
  rivet: { width: 9, height: 9, borderRadius: 4.5 },
  body: { paddingHorizontal: 6 },
  row1: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 6, paddingTop: 2, marginBottom: 4 },
  sorry: { textShadowColor: colors.closedSorryShadow, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  were: { opacity: 0.96 },
  word: { marginLeft: 3, textShadowColor: colors.closedWordShadow, textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 0 },
  row2: { marginTop: 2, paddingTop: 2, paddingBottom: 1, borderTopWidth: 1, borderTopColor: colors.closedDivider },
  back: { opacity: 0.95 },
});
