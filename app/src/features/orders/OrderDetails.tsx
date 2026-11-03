import { canCancel, cannotCancelReason, formatRupee, payAtDoor, formatOrderTime, formatPlacedOn, isFailedOrder, slotLabel, stageMessage, statusLabel, SUPPORT_PHONE_FALLBACK, type Order } from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { BackPill } from '@/components/BackPill';
import { ProductImage } from '@/components/ProductImage';
import { SuccessSnackbar } from '@/components/SuccessSnackbar';
import { CancelOrderDialog } from '@/features/tracking/CancelOrderDialog';
import { useConfig } from '@/hooks/useConfig';
import { colors, hairline, shadows, type TextVariantName } from '@/theme';
import { strings } from '@/strings';
import { ReorderDialog } from './ReorderDialog';
import { useReorder } from './useReorder';

/** Order details (littlekart.com /orders/:id and /profile/orders/:id). */
export function OrderDetails({ order, embedded }: { order: Order; embedded: boolean }) {
  const config = useConfig();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { reorder, busyId, summary, closeSummary } = useReorder();
  const { bill } = order;
  const failed = isFailedOrder(order.status);
  const delivered = order.status === 'delivered';
  const cancelled = order.status === 'cancelled';
  const showCancellation = !failed && !delivered;
  const cancellable = canCancel(order.status);
  const statusText = delivered ? strings.orders.deliveredLine : cancelled ? strings.orders.cancelledLine : order.status === 'payment_failed' ? strings.orders.failedLine : order.scheduledFor ? strings.schedule.detailsLine(slotLabel(order.scheduledFor)) : strings.orders.placedAtLine(formatOrderTime(order.createdAt));
  const reordering = busyId === order.id;

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.white, colors.heroGreenTint]} style={[styles.card, styles.hero]}>
        {embedded ? null : (
          <View style={styles.back}>
            <BackPill onPress={() => router.navigate('/orders')} />
          </View>
        )}
        <AppText variant="detailsKicker" style={embedded ? undefined : styles.kicker}>
          {strings.orders.detailsKicker}
        </AppText>
        <AppText variant="detailsId" style={styles.id}>
          {strings.tracking.hashId(order.id)}
        </AppText>
        <AppText variant={failed ? 'detailsFailed' : 'detailsPlaced'} style={styles.statusLine}>
          {statusText}
        </AppText>
      </LinearGradient>

      <AppText variant="muiBody1Bold" style={styles.count}>
        {strings.orders.itemCount(order.items.length)}
      </AppText>
      <View style={styles.items}>
        {order.items.map((item, i) => (
          <View key={`${item.productId}-${i}`} style={[styles.card, styles.item]}>
            <ProductImage uri={item.imageUrl} style={styles.image} />
            <View style={styles.flex}>
              <AppText variant="muiBody1Bold" style={styles.itemName}>
                {item.name}
              </AppText>
              <AppText variant="muiBody2Muted">{strings.orders.itemQty(item.label, item.qty)}</AppText>
              {item.addedLater ? <AppText variant="swapLabelNew">{strings.addOn.addedLater}</AppText> : null}
            </View>
            <AppText variant="muiBody1">{strings.orders.unitPrice(item.price)}</AppText>
          </View>
        ))}
      </View>
      {order.addOns?.length && payAtDoor(order) > 0 ? (
        <AppText variant="muiBody1Bold" style={styles.count}>
          {strings.addOn.payAtDoor(formatRupee(payAtDoor(order)))}
        </AppText>
      ) : null}
      <View style={styles.divider} />

      {showCancellation ? (
        <View style={[styles.card, styles.cancelCard]}>
          <AppText variant="muiH6Bold" style={styles.gutter}>
            {strings.orders.cancellation}
          </AppText>
          <AppText variant="muiBody2Muted" style={styles.currentStatus}>
            {strings.orders.currentStatus}
            <AppText variant="muiBody2Bold" color="textSlateMuted">
              {statusLabel(order.status)}
            </AppText>
          </AppText>
          <AppText variant={cancellable ? 'muiBody2Muted' : 'muiBody2MutedSemi'} style={styles.cancelNote}>
            {cancellable ? `${stageMessage(order.status)}${strings.orders.contactToCancel}` : cannotCancelReason(order.status) || stageMessage(order.status)}
          </AppText>
          <Pressable
            onPress={() => setCancelOpen(true)}
            disabled={!cancellable}
            accessibilityRole="button"
            style={[styles.cancelButton, !cancellable && styles.disabledFill]}
          >
            <AppText variant={cancellable ? 'orderActionContained' : 'orderActionDisabled'}>{strings.orders.cancelOrder}</AppText>
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.card, styles.content, styles.spaced]}>
        <AppText variant="muiH6Semi" style={styles.gutter}>
          {strings.orders.bill}
        </AppText>
        <BillLine label={strings.orders.itemsMrp} value={strings.orders.rupee(bill.mrpTotal)} />
        <BillLine label={strings.orders.productDiscount} value={strings.orders.minusRupee(bill.mrpSavings)} valueVariant="billDiscount" />
        <BillLine label={strings.orders.itemsTotal} value={strings.orders.rupee(bill.itemsTotal)} />
        {bill.deliveryFee > 0 ? <BillLine label={strings.orders.deliveryCharge} value={strings.orders.rupee(bill.deliveryFee)} /> : null}
        {bill.lateNightFee > 0 ? <BillLine label={strings.orders.lateNightFee} value={strings.orders.rupee(bill.lateNightFee)} /> : null}
        {bill.longDistanceFee > 0 ? <BillLine label={strings.orders.longDistanceFee} value={strings.orders.rupee(bill.longDistanceFee)} /> : null}
        <BillLine label={strings.orders.platformFee} value={strings.orders.rupee(bill.platformFee)} />
        <BillLine label={strings.orders.tipAmount} value={strings.orders.rupee(bill.tip)} />
        <BillLine label={strings.orders.couponDiscount} value={strings.orders.minusRupee(bill.couponDiscount)} valueVariant="billCoupon" />
        <View style={styles.billDivider} />
        <View style={styles.billRow}>
          <AppText variant="muiH6Bold">{strings.orders.grandTotal}</AppText>
          <AppText variant="muiH6Bold">{strings.orders.rupee(bill.grandTotal)}</AppText>
        </View>
      </View>

      <View style={[styles.card, styles.content]}>
        <AppText variant="muiH6Semi" style={styles.gutter}>
          {strings.orders.details}
        </AppText>
        <Field label={strings.orders.paymentType}>{order.paymentType}</Field>
        <Field label={strings.orders.orderId}>{order.id}</Field>
        <Field label={strings.orders.placedOn}>{formatPlacedOn(order.createdAt)}</Field>
        <Field label={strings.orders.phoneNumber}>{order.address.phone ? `+91${order.address.phone}` : '-'}</Field>
        <Field label={strings.orders.orderStatus}>{statusLabel(order.status)}</Field>
        <Field label={strings.orders.deliveredTo}>{order.address.text}</Field>
        {order.deliveryOtp && !delivered ? (
          <View style={styles.otpAlert}>
            <AppText variant="alertInfoBody">
              {strings.orders.otpLine}
              <AppText variant="alertInfoStrong">{order.deliveryOtp}</AppText>
              {strings.orders.otpShare}
            </AppText>
          </View>
        ) : null}
        {order.couponCode ? <Field label={strings.orders.couponCode}>{order.couponCode}</Field> : null}
      </View>

      <View style={styles.actions}>
        {failed ? (
          <Pressable onPress={() => void reorder(order)} disabled={reordering} accessibilityRole="button" style={styles.plainOutlined}>
            <AppText variant="muiButton" color="brightGreen">
              {reordering ? strings.orders.reordering : strings.orders.reorder}
            </AppText>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={() => void reorder(order)}
              disabled={!delivered || reordering}
              accessibilityRole="button"
              style={[styles.pill, styles.pillOutlined, (!delivered || reordering) && styles.pillOutlinedDisabled]}
            >
              <AppText variant={delivered && !reordering ? 'orderAction' : 'orderActionDisabled'}>
                {reordering ? strings.orders.reordering : strings.orders.reorder}
              </AppText>
            </Pressable>
            <View style={[styles.pill, delivered ? styles.pillContained : styles.disabledFill]}>
              <AppText variant={delivered ? 'orderActionContained' : 'orderActionDisabled'}>{strings.orders.rate}</AppText>
            </View>
          </>
        )}
      </View>

      <CancelOrderDialog
        visible={cancelOpen}
        phone={config.supportPhone || SUPPORT_PHONE_FALLBACK}
        onClose={() => setCancelOpen(false)}
        onCopied={(ok) => setCopied(ok ? strings.tracking.copied : strings.tracking.copyFailed)}
      />
      <SuccessSnackbar visible={copied !== null} message={copied ?? ''} durationMs={3500} bottom={8} onHide={() => setCopied(null)} />
      <ReorderDialog summary={summary} onClose={closeSummary} />
    </View>
  );
}

function BillLine({ label, value, valueVariant = 'muiBody1' }: { label: string; value: string; valueVariant?: TextVariantName }) {
  return (
    <View style={[styles.billRow, styles.billSpaced]}>
      <AppText variant="muiBody1">{label}</AppText>
      <AppText variant={valueVariant}>{value}</AppText>
    </View>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <AppText variant="muiBody2Muted">{label}</AppText>
      <AppText variant="muiBody1">{children}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { padding: 12 },
  card: {
    borderRadius: 12,
    borderWidth: hairline,
    borderColor: colors.borderFaint,
    backgroundColor: colors.surface,
    boxShadow: shadows.orderCard,
    overflow: 'hidden',
  },
  hero: { marginBottom: 16, padding: 12, borderColor: colors.orderBorderGreen },
  back: { alignSelf: 'flex-start' },
  kicker: { marginTop: 8 },
  id: { marginTop: 2.8 },
  statusLine: { marginTop: 3.6 },
  count: { marginBottom: 12, paddingHorizontal: 2.4 },
  items: { gap: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10.8 },
  image: { width: 60, height: 60, borderRadius: 4 },
  flex: { flex: 1, minWidth: 0 },
  itemName: { paddingRight: 8 },
  divider: { height: hairline, marginVertical: 20, backgroundColor: colors.border },
  content: { padding: 16, paddingBottom: 24 },
  spaced: { marginBottom: 16 },
  cancelCard: { marginBottom: 16, padding: 16, paddingBottom: 24, borderColor: colors.cancelCardBorder },
  gutter: { marginBottom: 7 },
  currentStatus: { marginBottom: 6 },
  cancelNote: { marginBottom: 12 },
  cancelButton: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 18, backgroundColor: colors.error, boxShadow: shadows.muiElevation2 },
  disabledFill: { backgroundColor: colors.muiDisabledBg, boxShadow: shadows.none },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billSpaced: { marginBottom: 8 },
  billDivider: { height: hairline, marginVertical: 8, backgroundColor: colors.border },
  field: { marginBottom: 8 },
  otpAlert: { marginBottom: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.alertInfoBg },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  plainOutlined: { paddingVertical: 5, paddingHorizontal: 15, borderRadius: 4, borderWidth: hairline, borderColor: colors.muiPrimaryOutline },
  pill: { paddingVertical: 6, paddingHorizontal: 18, borderRadius: 18 },
  pillOutlined: { paddingVertical: 5, paddingHorizontal: 17, borderWidth: hairline, borderColor: colors.muiPrimaryOutline },
  pillOutlinedDisabled: { borderColor: colors.muiDisabledBg },
  pillContained: { backgroundColor: colors.primary },
});
