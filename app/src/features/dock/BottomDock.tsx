import { StyleSheet, View } from 'react-native';
import { useActiveOrderRefresh } from '@/features/tracking/useActiveOrder';
import { CartBar } from './CartBar';
import { TrackingStrip } from './TrackingStrip';
import { DOCK_GAP, useDock } from './useDock';

/** Bottom of the screen on every page: the tracking strip above the cart bar, 12 px from the edges. */
export function BottomDock() {
  useActiveOrderRefresh();
  const { showCart, order, bottom, now } = useDock();
  if (!showCart && !order) return null;
  return (
    <View style={[styles.dock, { bottom }]} pointerEvents="box-none">
      {order ? <TrackingStrip order={order} now={now} /> : null}
      {showCart ? <CartBar /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dock: { position: 'absolute', left: 12, right: 12, gap: DOCK_GAP, zIndex: 30 },
});
