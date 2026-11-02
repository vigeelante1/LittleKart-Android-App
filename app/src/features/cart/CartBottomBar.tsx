import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';

/**
 * Height of the guest / signed-in bar without the safe area, for the page's bottom padding (site: 84 / 116,
 * plus 12 so the button never touches a phone's curved bottom edge or gesture bar — iteration 2).
 */
export const BAR_SPACE = { guest: 104, signedIn: 140 } as const;
/** Space under the button above the system inset. */
const BOTTOM_GAP = 12;

type Props =
  | { kind: 'guest'; onLogin: () => void }
  | {
      kind: 'signedIn';
      name: string;
      address: string;
      total: number;
      buttonLabel: string;
      canProceed: boolean;
      onChange: () => void;
      onProceed: () => void;
    };

/** Fixed bottom bar on the phone layout of littlekart.com /cart. */
export function CartBottomBar(props: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + BOTTOM_GAP }]}>
      {props.kind === 'guest' ? (
        <View style={styles.row}>
          <BarButton label={strings.cart.loginToProceed} enabled onPress={props.onLogin} />
        </View>
      ) : (
        <>
          <View style={styles.addressRow}>
            <View style={styles.addressText}>
              <AppText variant="barDelivering">
                {strings.cart.deliveringTo}
                <AppText variant="barDelivering" color="accent">
                  {props.name}
                </AppText>
              </AppText>
              <AppText variant="muiCaption" numberOfLines={1} style={styles.address}>
                {props.address}
              </AppText>
            </View>
            <Pressable onPress={props.onChange} accessibilityRole="button" style={styles.change}>
              <AppText variant="barChange">{strings.cart.change}</AppText>
            </Pressable>
          </View>
          <View style={styles.row}>
            <View style={styles.pay}>
              <AppText variant="muiCaption">{strings.cart.pay}</AppText>
              <AppText variant="barPayAmount" numberOfLines={1}>
                {strings.cart.payAmount(props.total)}
              </AppText>
            </View>
            <BarButton label={props.buttonLabel} enabled={props.canProceed} onPress={props.onProceed} />
          </View>
        </>
      )}
    </View>
  );
}

function BarButton({ label, enabled, onPress }: { label: string; enabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !enabled }}
      style={({ pressed }) => [styles.button, !enabled && styles.buttonDisabled, pressed && enabled && styles.pressed]}
    >
      <AppText variant="button" color={enabled ? 'white' : 'disabledText'} align="center" numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: hairline,
    borderTopColor: colors.borderBar,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: colors.bottomBarBg,
    boxShadow: shadows.bottomBar,
  },
  // Address block and "Change" share one centre line; then the amount and the button share the next.
  addressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  addressText: { flex: 1, minWidth: 0 },
  address: { marginTop: 2 },
  change: { paddingVertical: 6, paddingHorizontal: 10, marginRight: -10, borderRadius: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  pay: { minWidth: 88, height: 48, justifyContent: 'center' },
  button: {
    flex: 1,
    height: 48,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primary,
    boxShadow: shadows.muiElevation2,
  },
  buttonDisabled: { backgroundColor: colors.muiDisabledFill, boxShadow: shadows.none },
  pressed: { opacity: 0.85 },
});
