import { codAllowed as codAllowedFor, codRestrictedItems, codUnavailableMessage, deliverySlots, formatOrderDate, scheduleSlots } from '@littlekart/shared';
import { useState } from 'react';
import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { BackPill } from '@/components/BackPill';
import { CodNotice } from '@/features/payment/CodNotice';
import { OrderErrorDialog } from '@/features/payment/OrderErrorDialog';
import { OrderSubmittedDialog } from '@/features/payment/OrderSubmittedDialog';
import { PaymentBill } from '@/features/payment/PaymentBill';
import { PaymentItemRow } from '@/features/payment/PaymentItemRow';
import { PaymentMethodCard } from '@/features/payment/PaymentMethodCard';
import { RazorpaySheet } from '@/features/payment/RazorpaySheet';
import { StoreClosedNotice } from '@/features/payment/StoreClosedNotice';
import { SuggestedProducts } from '@/features/payment/SuggestedProducts';
import { useLiveCheckout } from '@/features/payment/useLiveCheckout';
import { ScheduledSlotCard } from '@/features/schedule/ScheduledSlotCard';
import { SlotSheet } from '@/features/schedule/SlotSheet';
import { useNearestStore } from '@/hooks/useNearestStore';
import { useStoreClosed } from '@/hooks/useStoreClosed';
import { usePlaceOrder } from '@/features/payment/usePlaceOrder';
import { useAuthStore, useCheckoutStore, useLocationStore, type CheckoutSnapshot, type DeliveryLocation } from '@/store';
import { colors, shadows } from '@/theme';
import type { User } from '@littlekart/shared';
import { strings } from '@/strings';

/** Payment page (littlekart.com /payment, "Order Summary"). Opened from the cart's Proceed To Pay. */
export default function PaymentScreen() {
  const snapshot = useCheckoutStore((s) => s.snapshot);
  const user = useAuthStore((s) => s.user);
  const location = useLocationStore((s) => s.selected);
  if (!user) return <Redirect href="/login" />;
  if (!snapshot || !location) return <Redirect href="/" />;
  return <Payment snapshot={snapshot} user={user} location={location} />;
}

function Payment({ snapshot, user, location }: { snapshot: CheckoutSnapshot; user: User; location: DeliveryLocation }) {
  const insets = useSafeAreaInsets();
  const clearCheckout = useCheckoutStore((s) => s.clear);
  const itemTypes = snapshot.items.map((i) => i.product.itemType);
  const codAllowed = codAllowedFor(snapshot.bill.itemsTotal, itemTypes);
  const [slotOpen, setSlotOpen] = useState(false);
  const order = usePlaceOrder({ snapshot, location, phone: user.phone, name: user.name, codAllowed, onSlotUnavailable: () => setSlotOpen(true) });
  const closedStore = useStoreClosed();
  // Schedule for later (D-103): a slot picked in the cart, or one to pick here if the store closed meanwhile.
  const setSlot = useCheckoutStore((s) => s.setSlot);
  const { nearest } = useNearestStore();
  const store = nearest?.inRadius ? nearest.store : null;
  const slot = snapshot.slot;
  const slots = store ? (slot ? deliverySlots(store) : scheduleSlots(store)) : [];
  const needsSlot = closedStore !== null && !slot && slots.length > 0;
  const blocked = order.submitting || (closedStore !== null && !slot && !needsSlot);
  useLiveCheckout(snapshot, order.submitting || order.placed !== null || order.checkout !== null);

  const openTracking = () => {
    const id = order.placed?.id;
    clearCheckout();
    if (id) router.replace({ pathname: '/tracking/[id]', params: { id } });
    else router.replace('/');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        <View style={styles.paper}>
          <View style={styles.header}>
            <BackPill />
            <AppText variant="muiH5Bold">{strings.payment.title}</AppText>
          </View>

          {snapshot.items.map((item) => (
            <PaymentItemRow key={`${item.product.id}-${item.variant.id}`} item={item} />
          ))}

          <SuggestedProducts cartProductIds={snapshot.items.map((i) => i.product.id)} />

          <PaymentBill bill={snapshot.bill} couponCode={snapshot.couponCode} />

          <View style={styles.delivery}>
            <AppText variant="muiH6Bold" style={styles.sectionTitle}>
              {strings.payment.deliveryDetails}
            </AppText>
            <AppText variant="muiBody2">{strings.payment.name(user.name)}</AppText>
            <AppText variant="muiBody2">{strings.payment.phone(user.phone)}</AppText>
            <AppText variant="muiBody2">{strings.payment.orderDate(formatOrderDate(snapshot.orderDate))}</AppText>
            <AppText variant="muiBody2">{strings.payment.address(location.text)}</AppText>
            <AppText variant="muiBody2">{strings.payment.latitude(location.lat)}</AppText>
            <AppText variant="muiBody2">{strings.payment.longitude(location.lng)}</AppText>

            {slot ? <ScheduledSlotCard slot={slot} onChange={() => setSlotOpen(true)} /> : null}

            <View style={styles.methods}>
              <AppText variant="muiBody1Bold" style={styles.sectionTitle}>
                {strings.payment.method}
              </AppText>
              <View style={styles.methodList}>
                <PaymentMethodCard
                  label={strings.payment.upiLabel}
                  helper={strings.payment.upiHelper}
                  selected={order.method === 'UPI'}
                  onPress={() => order.setMethod('UPI')}
                />
                {codAllowed ? (
                  <PaymentMethodCard
                    label={strings.payment.codLabel}
                    helper={strings.payment.codHelper}
                    selected={order.method === 'Cash on Delivery'}
                    onPress={() => order.setMethod('Cash on Delivery')}
                  />
                ) : null}
              </View>
              {codAllowed ? null : <CodNotice message={codUnavailableMessage(codRestrictedItems(itemTypes))} />}
            </View>
          </View>

          {closedStore && !slot && !needsSlot ? <StoreClosedNotice store={closedStore} /> : null}

          <Pressable
            onPress={() => (needsSlot ? setSlotOpen(true) : void order.submit())}
            disabled={blocked}
            accessibilityRole="button"
            accessibilityState={{ disabled: blocked }}
            style={({ pressed }) => [styles.submit, blocked && styles.submitDisabled, pressed && styles.pressed]}
          >
            <AppText variant={blocked ? 'submitOrderDisabled' : 'submitOrder'}>
              {order.submitting
                ? strings.payment.submitting
                : slot
                  ? strings.schedule.submit
                  : needsSlot
                    ? strings.schedule.pick
                    : closedStore
                      ? strings.storeClosed.button
                      : strings.payment.submit}
            </AppText>
          </Pressable>
        </View>
      </ScrollView>

      {store && slots.length > 0 ? (
        <SlotSheet
          visible={slotOpen}
          store={store}
          slots={slots}
          selected={slot?.start}
          confirmLabel={strings.schedule.confirm}
          onConfirm={(s) => {
            setSlot(s);
            setSlotOpen(false);
          }}
          onClose={() => setSlotOpen(false)}
        />
      ) : null}
      <OrderSubmittedDialog visible={order.placed !== null} onDone={openTracking} />
      <OrderErrorDialog error={order.error} onClose={order.closeError} />
      <RazorpaySheet
        checkout={order.checkout}
        name={strings.payment.checkoutName}
        description={strings.payment.checkoutDescription}
        customerName={user.name}
        phone={user.phone}
        onResult={(message) => void order.onCheckout(message)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  // The site's 12 px page gutter, then the Paper's 32 px top margin.
  scroll: { paddingHorizontal: 12, paddingTop: 32 },
  paper: { padding: 24, borderRadius: 4, backgroundColor: colors.surface, boxShadow: shadows.muiElevation1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  delivery: { marginTop: 32 },
  sectionTitle: { marginBottom: 8 },
  methods: { marginTop: 16 },
  methodList: { gap: 12 },
  submit: {
    marginTop: 20,
    paddingVertical: 8.8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.primary,
    boxShadow: shadows.submitOrder,
  },
  submitDisabled: { backgroundColor: colors.muiDisabledBg, boxShadow: shadows.none },
  pressed: { opacity: 0.9 },
});
