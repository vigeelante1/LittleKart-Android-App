import { formatRupee } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { colors, shadows } from '@/theme';
import { strings } from '@/strings';
import { AppText } from './AppText';

interface Props {
  percent: number;
  /** Rupees saved; shown instead of the percent when the percent rounds to 0 (as on the site). */
  saving?: number;
}

const WIDTH = 36;
const HEIGHT = 28;
const TEETH_HEIGHT = 4;
// Same polygon as the site's ::after clip-path: 5 teeth along the bottom edge.
const TEETH = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  .map((p, i) => `${(p / 100) * WIDTH},${i % 2 === 0 ? 0 : TEETH_HEIGHT}`)
  .concat([`${WIDTH},${TEETH_HEIGHT}`, `0,${TEETH_HEIGHT}`])
  .join(' ');

/** Blue "32% OFF" ribbon in the top-left corner of grid product cards. */
export function OffRibbon({ percent, saving = 0 }: Props) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <LinearGradient colors={[colors.ribbonTop, colors.ribbonBottom]} style={styles.box}>
        <AppText variant="ribbonPercent">{percent > 0 ? `${percent}%` : formatRupee(saving)}</AppText>
        <AppText variant="ribbonOff">{strings.product.off}</AppText>
      </LinearGradient>
      <Svg width={WIDTH} height={TEETH_HEIGHT} style={styles.teeth}>
        <Polygon points={TEETH} fill={colors.ribbonBottom} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, zIndex: 2, boxShadow: shadows.ribbon, borderTopLeftRadius: 10, borderBottomRightRadius: 5 },
  box: {
    width: WIDTH,
    height: HEIGHT,
    paddingHorizontal: 1.76,
    paddingVertical: 1.44,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 5,
  },
  teeth: { position: 'absolute', left: 0, bottom: -3 },
});
