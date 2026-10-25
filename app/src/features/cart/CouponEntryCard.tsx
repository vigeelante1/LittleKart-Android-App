import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { CartIcon } from '@/components/icons/CartIcons';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';

export interface AppliedCoupon {
  code: string;
  title: string;
  discount: number;
}

interface Props {
  applied: AppliedCoupon | null;
  onOpen: () => void;
  onRemove: () => void;
}

/** "View Coupons & Offers" card, with the applied coupon under it (signed-in users only, as on the site). */
export function CouponEntryCard({ applied, onOpen, onRemove }: Props) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onOpen} accessibilityRole="button" style={({ pressed }) => [styles.entry, pressed && styles.entryPressed]}>
        <View style={styles.left}>
          <View style={styles.tile}>
            <CartIcon name="localOffer" size={18} color={colors.greenDeep} />
          </View>
          <View>
            <AppText variant="couponEntryTitle">{strings.coupons.entry}</AppText>
            <AppText variant="couponEntrySub">{strings.coupons.entrySub}</AppText>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={colors.textSlateMuted} />
      </Pressable>

      {applied ? (
        <View style={styles.applied}>
          <View style={styles.flex}>
            <AppText variant="couponApplied">{strings.coupons.applied(applied.code)}</AppText>
            <AppText variant="muiCaption">{strings.coupons.savedLine(applied.title, applied.discount)}</AppText>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={onOpen} accessibilityRole="button" style={styles.textButton}>
              <AppText variant="muiSmallButton">{strings.coupons.change}</AppText>
            </Pressable>
            <Pressable onPress={onRemove} accessibilityRole="button" style={styles.textButton}>
              <AppText variant="muiSmallButton" color="muiError">
                {strings.coupons.remove}
              </AppText>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadows.cartLine,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 6.4,
    borderRadius: 10,
  },
  entryPressed: { backgroundColor: colors.variantRowBg },
  left: { flexDirection: 'row', alignItems: 'center', gap: 9.6 },
  tile: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: hairline,
    borderColor: colors.couponTileBorder,
    backgroundColor: colors.couponTileBg,
  },
  applied: {
    marginTop: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  flex: { flex: 1, minWidth: 0 },
  actions: { flexDirection: 'row', gap: 4 },
  textButton: { minWidth: 64, paddingVertical: 4, paddingHorizontal: 5, borderRadius: 4, alignItems: 'center' },
});
