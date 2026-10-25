import {
  deliveryFeeInfo,
  formatRupee,
  freeDeliveryNudge,
  lateNightFeeInfo,
  longDistanceFeeInfo,
  PLATFORM_FEE_INFO,
} from '@littlekart/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';
import { BillRow } from './BillRow';
import { InfoDialog } from './InfoDialog';
import type { CartBill } from './useCartBill';

interface Props {
  cart: CartBill;
  coupon: { code: string; discount: number } | null;
}

/** Struck price then a value, e.g. "₹30 FREE" or "M.R.P.₹444 ₹364". */
function Struck({ struck, value, valueVariant, gap }: { struck: string; value: string; valueVariant: 'billFree' | 'billItemsTotal'; gap: number }) {
  return (
    // Items Total lines the two up at the bottom; "₹30 FREE" centres them (site styles).
    <View style={[styles.struckRow, { gap, alignItems: valueVariant === 'billItemsTotal' ? 'flex-end' : 'center' }]}>
      <AppText variant="billStruck" strike>
        {struck}
      </AppText>
      <AppText variant={valueVariant}>{value}</AppText>
    </View>
  );
}

/** "Bill Details" card (littlekart.com /cart). Rows appear under the same conditions as on the site. */
export function BillDetails({ cart, coupon }: Props) {
  const [info, setInfo] = useState<string | null>(null);
  const { bill, fees, outOfStockCount, allUnavailable } = cart;
  const showMrp = bill.mrpTotal > bill.itemsTotal;
  const nudge = freeDeliveryNudge(fees, bill.itemsTotal);
  const canCharge = !allUnavailable;

  return (
    <View style={styles.card}>
      <AppText variant="billTitle" style={styles.title}>
        {strings.bill.title}
      </AppText>

      {outOfStockCount > 0 ? (
        <View style={styles.warning}>
          <AppText variant="billWarning">
            {allUnavailable ? strings.bill.allUnavailable : strings.bill.outOfStockExcluded(outOfStockCount)}
          </AppText>
        </View>
      ) : null}

      <BillRow
        icon="shoppingBag"
        label={strings.bill.itemsTotal}
        amountNode={
          showMrp ? (
            <Struck struck={strings.cart.mrp(bill.mrpTotal)} value={formatRupee(bill.itemsTotal)} valueVariant="billItemsTotal" gap={4} />
          ) : (
            <AppText variant="billItemsTotal">{formatRupee(bill.itemsTotal)}</AppText>
          )
        }
      />
      {showMrp && bill.mrpSavings > 0 ? (
        <BillRow icon="localOffer" label={strings.bill.mrpSavings} amount={strings.bill.minus(bill.mrpSavings)} amountVariant="billSaving" />
      ) : null}

      {canCharge ? (
        <BillRow
          icon="localShipping"
          label={strings.bill.deliveryFee}
          onInfo={() => setInfo(deliveryFeeInfo(fees))}
          amount={bill.deliveryFee > 0 ? formatRupee(bill.deliveryFee) : undefined}
          amountNode={
            bill.deliveryFee > 0 ? undefined : (
              <Struck struck={formatRupee(fees.baseDeliveryFee)} value={strings.bill.free} valueVariant="billFree" gap={6} />
            )
          }
        />
      ) : null}

      {nudge?.kind === 'add-more' ? (
        <View style={styles.nudge}>
          <AppText variant="nudge">
            {strings.freeDelivery.nudgeAdd}
            <AppText variant="nudgeStrong">{formatRupee(nudge.amount)}</AppText>
            {strings.freeDelivery.nudgeMore}
          </AppText>
        </View>
      ) : null}

      {canCharge ? (
        <BillRow
          icon="storefront"
          label={strings.bill.platformFee}
          onInfo={() => setInfo(PLATFORM_FEE_INFO)}
          amount={bill.platformFee > 0 ? formatRupee(bill.platformFee) : undefined}
          amountNode={
            bill.platformFee > 0 ? undefined : (
              <Struck struck={formatRupee(fees.baseHandlingFee)} value={strings.bill.free} valueVariant="billFree" gap={6} />
            )
          }
        />
      ) : null}

      {canCharge && bill.lateNightFee > 0 ? (
        <BillRow
          icon="darkMode"
          label={strings.bill.lateNightFee}
          onInfo={() => setInfo(lateNightFeeInfo(fees))}
          amount={formatRupee(bill.lateNightFee)}
        />
      ) : null}

      {canCharge && bill.longDistanceFee > 0 ? (
        <BillRow
          icon="route"
          label={strings.bill.longDistanceFee}
          onInfo={() => setInfo(longDistanceFeeInfo(fees))}
          amount={formatRupee(bill.longDistanceFee)}
        />
      ) : null}

      {bill.tip > 0 ? (
        <BillRow
          icon="volunteerActivism"
          label={strings.bill.tip}
          onInfo={() => setInfo(strings.bill.tipInfo)}
          amount={formatRupee(bill.tip)}
        />
      ) : null}

      {coupon ? (
        <BillRow
          icon="confirmationNumber"
          label={strings.bill.couponDiscount}
          onInfo={() => setInfo(strings.bill.couponInfo(coupon.code, bill.couponDiscount))}
          amount={strings.bill.minus(bill.couponDiscount)}
          amountVariant="billSaving"
        />
      ) : null}

      <View style={styles.total}>
        <BillRow
          icon="payments"
          label={strings.bill.grandTotal}
          labelVariant="billTotal"
          amount={formatRupee(bill.grandTotal)}
          amountVariant="billTotal"
          last
        />
      </View>

      <InfoDialog text={info} onClose={() => setInfo(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: hairline,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    boxShadow: shadows.cartLine,
  },
  title: { marginBottom: 12, paddingBottom: 6, borderBottomWidth: hairline, borderBottomColor: colors.border },
  warning: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: hairline,
    borderColor: colors.billWarningBorder,
    backgroundColor: colors.billWarningBg,
  },
  struckRow: { flexDirection: 'row' },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.nudgeBg,
  },
  // 16 on the site, where the row above's 8 px bottom margin collapses into it.
  total: { marginTop: 8, paddingTop: 8, borderTopWidth: hairline, borderTopColor: colors.border },
});
