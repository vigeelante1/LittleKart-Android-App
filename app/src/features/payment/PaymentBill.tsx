import { formatRupee, type Bill } from '@littlekart/shared';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { BillRow } from '@/features/cart/BillRow';
import { colors, hairline } from '@/theme';
import { strings } from '@/strings';

interface Props {
  bill: Bill;
  couponCode: string | null;
}

/** "Bill Details" on the payment page: the cart's rows without the "i" buttons, shown only when non-zero. */
export function PaymentBill({ bill, couponCode }: Props) {
  const showMrp = bill.mrpTotal > bill.itemsTotal;
  return (
    <View style={styles.root}>
      <AppText variant="muiH6Bold" style={styles.title}>
        {strings.payment.billTitle}
      </AppText>
      <BillRow
        icon="shoppingBag"
        label={strings.bill.itemsTotal}
        spacing={6}
        amountNode={
          <View style={styles.itemsTotal}>
            {showMrp ? (
              <AppText variant="billStruck" strike>
                {`M.R.P. ${formatRupee(bill.mrpTotal)}`}
              </AppText>
            ) : null}
            <AppText variant="muiBody1">{formatRupee(bill.itemsTotal)}</AppText>
          </View>
        }
      />
      {showMrp && bill.mrpSavings > 0 ? (
        <BillRow icon="localOffer" label={strings.bill.mrpSavings} spacing={6} amount={strings.bill.minus(bill.mrpSavings)} amountVariant="billSaving" />
      ) : null}
      {bill.deliveryFee > 0 ? (
        <BillRow icon="localShipping" label={strings.bill.deliveryFee} spacing={6} amount={formatRupee(bill.deliveryFee)} />
      ) : null}
      {bill.lateNightFee > 0 ? (
        <BillRow icon="darkMode" label={strings.bill.lateNightFee} spacing={6} amount={formatRupee(bill.lateNightFee)} />
      ) : null}
      {bill.longDistanceFee > 0 ? (
        <BillRow icon="route" label={strings.bill.longDistanceFee} spacing={6} amount={formatRupee(bill.longDistanceFee)} />
      ) : null}
      {bill.platformFee > 0 ? (
        <BillRow icon="storefront" label={strings.bill.platformFee} spacing={6} amount={formatRupee(bill.platformFee)} />
      ) : null}
      {bill.couponDiscount > 0 ? (
        <BillRow
          icon="confirmationNumber"
          label={strings.payment.couponDiscount(couponCode ?? '')}
          spacing={6}
          amount={strings.bill.minus(bill.couponDiscount)}
          amountVariant="billSaving"
        />
      ) : null}
      {bill.tip > 0 ? <BillRow icon="volunteerActivism" label={strings.bill.tip} spacing={6} amount={formatRupee(bill.tip)} /> : null}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginTop: 24 },
  title: { marginBottom: 8 },
  itemsTotal: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  total: { marginTop: 8, paddingTop: 8, borderTopWidth: hairline, borderTopColor: colors.border },
});
