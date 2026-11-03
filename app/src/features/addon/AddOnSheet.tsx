import { MaterialIcons } from '@expo/vector-icons';
import {
  addOnCodAllowed,
  codRestrictedItems,
  codUnavailableMessage,
  formatRupee,
  quoteAddOn,
  type Order,
  type PaymentType,
} from '@littlekart/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { ProductImage } from '@/components/ProductImage';
import { CodNotice } from '@/features/payment/CodNotice';
import { PaymentMethodCard } from '@/features/payment/PaymentMethodCard';
import { RazorpaySheet } from '@/features/payment/RazorpaySheet';
import { useCartProducts } from '@/hooks/useCartProducts';
import { useAuthStore } from '@/store';
import { colors, hairline, shadows } from '@/theme';
import { strings } from '@/strings';
import { useAddOnStore } from './addOnStore';
import { useAddItems } from './useAddItems';
import { useAddOnWindow } from './useAddOnWindow';

/** "Add to your order": the cart's items go into the order just placed, no extra fees (D-105). */
export function AddOnSheet() {
  const open = useAddOnStore((s) => s.open);
  const win = useAddOnWindow();
  const [last, setLast] = useState<Order | null>(null);
  // Keep the sheet's order once the window closes, so "Time's up" can be shown in place.
  if (win && win.order !== last) setLast(win.order);
  const order = win?.order ?? last;
  if (!open || !order) return null;
  return <Sheet order={order} left={win?.left ?? null} />;
}

function Sheet({ order, left }: { order: Order; left: string | null }) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const setOpen = useAddOnStore((s) => s.setOpen);
  const user = useAuthStore((s) => s.user);
  const lines = useCartProducts().filter((l) => l.variant.stock > 0);
  const add = useAddItems(order);
  const items = quoteAddOn(order, lines.map((l) => l.line), lines.map((l) => l.product)).items;
  const amount = items.reduce((s, i) => s + i.price * i.qty, 0);
  const codOk = addOnCodAllowed(order, items);
  const [chosen, setChosen] = useState<PaymentType>(order.paymentType);
  const method: PaymentType = chosen === 'Cash on Delivery' && !codOk ? 'UPI' : chosen;
  const closed = left === null;
  const close = () => setOpen(false);

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityRole="none" />
      <View style={[styles.sheet, { maxHeight: height - 96 }]}>
        <View style={styles.handle} />
        <LinearGradient colors={colors.recSheetHeaderGradient} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <View style={styles.badge}>
            <MaterialIcons name="add-shopping-cart" size={22} color={colors.white} />
          </View>
          <View style={styles.headText}>
            <AppText variant="recTitle">{strings.addOn.title}</AppText>
            <AppText variant="scheduleSub">{closed ? strings.addOn.timeUp : strings.addOn.sub(order.id, left)}</AppText>
          </View>
          <Pressable onPress={close} accessibilityRole="button" accessibilityLabel={strings.addOn.close} style={styles.close}>
            <MaterialIcons name="close" size={24} color={colors.iconMuted} />
          </Pressable>
        </LinearGradient>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {lines.map(({ product, variant, line }) => (
            <View key={`${product.id}-${variant.id}`} style={styles.row}>
              <ProductImage uri={variant.imageUrl ?? product.imageUrl} style={styles.image} />
              <View style={styles.rowText}>
                <AppText variant="aiItemName" numberOfLines={2}>
                  {product.name}
                </AppText>
                <AppText variant="aiItemMeta">{strings.orders.itemQty(variant.label, line.qty)}</AppText>
              </View>
              <AppText variant="aiItemPrice">{formatRupee(variant.price * line.qty)}</AppText>
            </View>
          ))}
          <View style={styles.totalRow}>
            <View style={styles.rowText}>
              <AppText variant="addOnTotal">{strings.addOn.total}</AppText>
              <AppText variant="scheduleSub">{strings.addOn.noFees}</AppText>
            </View>
            <AppText variant="addOnTotal">{formatRupee(amount)}</AppText>
          </View>
          <AppText variant="aiSection" style={styles.payTitle}>
            {strings.addOn.pay}
          </AppText>
          <View style={styles.methods}>
            <PaymentMethodCard label={strings.addOn.upi} helper={strings.addOn.upiHelper} selected={method === 'UPI'} onPress={() => setChosen('UPI')} />
            {codOk ? (
              <PaymentMethodCard
                label={strings.addOn.cod}
                helper={strings.addOn.codHelper}
                selected={method === 'Cash on Delivery'}
                onPress={() => setChosen('Cash on Delivery')}
              />
            ) : (
              <CodNotice message={codUnavailableMessage(codRestrictedItems([...order.items, ...items].map((i) => i.itemType)))} />
            )}
          </View>
          {add.error ? <AppText variant="addOnError">{add.error}</AppText> : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
          <Pressable
            onPress={() => void add.submit(lines, method)}
            disabled={closed || add.busy || items.length === 0}
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, (closed || add.busy || items.length === 0) && styles.buttonOff, pressed && styles.buttonPressed]}
          >
            <AppText variant="scheduleButton">{add.busy ? strings.addOn.adding : strings.addOn.confirm(formatRupee(amount))}</AppText>
          </Pressable>
        </View>
      </View>
      <RazorpaySheet
        checkout={add.checkout}
        name={strings.addOn.checkoutName}
        description={strings.addOn.checkoutDescription}
        customerName={user?.name ?? ''}
        phone={user?.phone ?? ''}
        onResult={(message) => void add.onCheckout(message)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.dialogBackdrop },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: colors.surface,
    boxShadow: shadows.muiElevation16,
  },
  handle: { width: 36, height: 4, borderRadius: 2, marginTop: 10, alignSelf: 'center', backgroundColor: colors.sheetHandle },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: hairline,
    borderBottomColor: colors.recSheetHeaderBorder,
  },
  badge: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  headText: { flex: 1, minWidth: 0, gap: 2 },
  close: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: hairline,
    borderColor: colors.closeButtonBorder,
    backgroundColor: colors.surface,
    boxShadow: shadows.closeButton,
  },
  body: { flexGrow: 0, backgroundColor: colors.recSheetBodyBg },
  bodyContent: { padding: 12, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 12, backgroundColor: colors.surface, borderWidth: hairline, borderColor: colors.recBorder },
  image: { width: 44, height: 44, borderRadius: 8, backgroundColor: colors.surface2 },
  rowText: { flex: 1, minWidth: 0, gap: 2 },
  totalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 4 },
  payTitle: { marginTop: 4 },
  methods: { gap: 8 },
  footer: { paddingTop: 12, paddingHorizontal: 12, borderTopWidth: hairline, borderTopColor: colors.sheetDivider, backgroundColor: colors.surface },
  button: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  buttonOff: { backgroundColor: colors.muiDisabledFill },
  buttonPressed: { backgroundColor: colors.primaryDark },
});
