import {
  canIncrement,
  couponRemovedMessage,
  freeDeliveryNudge,
  MAX_UNITS_PER_PRODUCT,
  NO_TIP,
  scheduleSlots,
  storeClosedLines,
  validateCoupon,
  type DeliverySlot,
  type Product,
  type SwapOffer,
  type TipState,
} from '@littlekart/shared';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertSnackbar, type AlertMessage } from '@/components/AlertSnackbar';
import { AppText } from '@/components/AppText';
import { BackPill } from '@/components/BackPill';
import { ApplyCouponsDialog } from '@/features/cart/ApplyCouponsDialog';
import { BillDetails } from '@/features/cart/BillDetails';
import { CancellationPolicy } from '@/features/cart/CancellationPolicy';
import { BAR_SPACE, CartBottomBar } from '@/features/cart/CartBottomBar';
import { CartLineCard } from '@/features/cart/CartLineCard';
import { CouponEntryCard } from '@/features/cart/CouponEntryCard';
import { EmptyCart } from '@/features/cart/EmptyCart';
import { FreeDeliveryCard } from '@/features/cart/FreeDeliveryCard';
import { OftenBought } from '@/features/cart/OftenBought';
import { SwapDialog } from '@/features/cart/SwapDialog';
import { SwapStrip } from '@/features/cart/SwapStrip';
import { useSwaps } from '@/features/cart/useSwaps';
import { TipCard } from '@/features/cart/TipCard';
import { billableLines, toPricedLines, useCartBill } from '@/features/cart/useCartBill';
import { useCoupons } from '@/features/cart/useCoupons';
import { useRecommendations } from '@/features/cart/useRecommendations';
import { VariantDialog } from '@/features/category/VariantDialog';
import { LocationDialog } from '@/features/location/LocationDialog';
import { SlotSheet } from '@/features/schedule/SlotSheet';
import { AddOnBanner } from '@/features/addon/AddOnBanner';
import { useAddOnStore } from '@/features/addon/addOnStore';
import { useAddOnWindow } from '@/features/addon/useAddOnWindow';
import { useReopenLocationDialog } from '@/hooks/useReopenLocationDialog';
import { useCartProducts } from '@/hooks/useCartProducts';
import { useConfig } from '@/hooks/useConfig';
import { useNearestStore } from '@/hooks/useNearestStore';
import { useStoreClosed } from '@/hooks/useStoreClosed';
import { DOCK_GAP, TRACKING_STRIP_HEIGHT, useDock } from '@/features/dock/useDock';
import { StoreClosedRibbon } from '@/components/StoreClosedRibbon';
import { swapKey, useAuthStore, useCartStore, useCheckoutStore, useLocationStore, useSwapStore } from '@/store';
import type { ResolvedLine } from '@/hooks/useCartProducts';
import { colors } from '@/theme';
import { strings } from '@/strings';

interface StockNote {
  productId: string;
  variantId: string;
  message: string;
}

/** Cart (littlekart.com /cart, phone layout; DESIGN_SPEC S7, S8, S16, S17, S19). */
export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const config = useConfig();
  const items = useCartProducts();
  const lines = useCartStore((s) => s.lines);
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const remove = useCartStore((s) => s.remove);
  const swapLine = useCartStore((s) => s.swap);
  const replaceAll = useCartStore((s) => s.replaceAll);
  const dismissSwap = useSwapStore((s) => s.dismiss);
  const user = useAuthStore((s) => s.user);
  const location = useLocationStore((s) => s.selected);
  const signedIn = user !== null;

  const [tip, setTip] = useState<TipState>(NO_TIP);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [couponsOpen, setCouponsOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  useReopenLocationDialog(useCallback(() => setLocationOpen(true), []));
  const [alert, setAlert] = useState<AlertMessage | null>(null);
  const [stockNote, setStockNote] = useState<StockNote | null>(null);
  const [options, setOptions] = useState<Product | null>(null);
  const [swapping, setSwapping] = useState<{ item: ResolvedLine; offer: SwapOffer } | null>(null);

  const { coupons, failed: couponsFailed } = useCoupons(signedIn);
  const priced = useMemo(() => toPricedLines(items), [items]);

  // The applied coupon is re-checked whenever the cart changes; when it stops applying it is removed
  // with the live cart's message (state adjusted during render, React's pattern for derived resets).
  const check = appliedCode && coupons ? validateCoupon(appliedCode, coupons, priced) : null;
  if (appliedCode && check && !check.valid) {
    const minOrder = coupons?.find((c) => c.code === appliedCode)?.minOrder ?? 0;
    setAppliedCode(null);
    setAlert({ message: couponRemovedMessage(appliedCode, check, minOrder), severity: 'info' });
  }
  const applied = signedIn && check?.valid ? { code: check.coupon.code, title: check.coupon.title, discount: check.discount } : null;

  const cart = useCartBill(items, tip.amount, applied?.discount ?? 0);
  const { nearest, loading: checkingStore } = useNearestStore();
  const startCheckout = useCheckoutStore((s) => s.start);
  const closedStore = useStoreClosed();
  // Closed (12 AM – 6 AM): the order can be scheduled for a slot in the next opening hours (D-103).
  const slots = closedStore ? scheduleSlots(closedStore) : [];
  const [slotOpen, setSlotOpen] = useState(false);
  // "Forgot something?" (D-105): in the 40 s after ordering, these items can join that order.
  const addOn = useAddOnWindow();
  const openAddOn = useAddOnStore((s) => s.setOpen);
  const dock = useDock();
  const productIds = useMemo(() => items.map((i) => i.product.id), [items]);
  const recommendations = useRecommendations(productIds);
  const swaps = useSwaps(items);
  const hideAlert = useCallback(() => setAlert(null), []);
  const openOptions = useCallback((p: Product) => setOptions(p), []);

  // Swap & save (D-91): replace the line, keep the quantity, and offer Undo for a few seconds.
  const confirmSwap = () => {
    if (!swapping) return;
    const { item, offer } = swapping;
    const variant = offer.product.variants.find((v) => v.id === offer.variantId);
    const before = lines;
    setSwapping(null);
    if (!variant) return;
    const qty = swapLine(
      { productId: item.product.id, variantId: item.variant.id },
      { productId: offer.product.id, variantId: variant.id, stock: variant.stock },
    );
    if (qty === 0) return;
    setAlert({
      message: strings.cart.swapDone(offer.saving * qty),
      severity: 'success',
      action: { label: strings.cart.swapUndo, onPress: () => replaceAll(before) },
    });
  };
  const declineSwap = () => {
    if (swapping) dismissSwap(swapping.item.product.id, swapping.item.variant.id);
    setSwapping(null);
  };

  const applyCoupon = (code: string): string | null => {
    const result = validateCoupon(code, coupons ?? [], priced);
    if (!result.valid) return result.message;
    setAppliedCode(result.coupon.code);
    setCouponsOpen(false);
    setAlert({ message: strings.coupons.appliedToast(result.coupon.code, result.discount), severity: 'success' });
    return null;
  };

  // Proceed To Pay: the site's checks, then the payment page with the cart as it is now.
  const proceed = () => {
    if (!location) {
      setLocationOpen(true);
      return;
    }
    if (cart.outOfStockCount > 0) {
      setAlert({ message: strings.checkout.outOfStock, severity: 'warning' });
      return;
    }
    if (checkingStore) {
      setAlert({ message: strings.checkout.checkingDistance, severity: 'info' });
      return;
    }
    if (!nearest?.inRadius) {
      setAlert({ message: strings.checkout.deliveryUnavailable, severity: 'warning' });
      return;
    }
    if (closedStore) {
      if (slots.length > 0) setSlotOpen(true);
      else setAlert({ message: storeClosedLines(closedStore).snackbar, severity: 'warning' });
      return;
    }
    goToPayment();
  };
  const goToPayment = (slot?: DeliverySlot) => {
    setSlotOpen(false);
    startCheckout({
      items: billableLines(items),
      bill: cart.bill,
      tip: tip.amount,
      couponCode: applied?.code ?? null,
      orderDate: Date.now(),
      ...(slot ? { slot } : {}),
    });
    router.push('/payment');
  };

  const empty = items.length === 0;
  const blocked = cart.outOfStockCount > 0;
  const buttonLabel = cart.allUnavailable
    ? strings.cart.cannotProceed
    : blocked
      ? strings.cart.removeOutOfStock
      : slots.length > 0
        ? strings.schedule.cartButton
        : strings.cart.proceedToPay;
  // The order-tracking strip sits on top of the bottom bar while an order is on its way.
  const stripSpace = dock.order ? TRACKING_STRIP_HEIGHT + DOCK_GAP : 0;
  const barSpace = (empty ? 16 + insets.bottom : (signedIn ? BAR_SPACE.signedIn : BAR_SPACE.guest) + insets.bottom) + stripSpace;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {closedStore ? <StoreClosedRibbon store={closedStore} /> : null}
      <View style={styles.page}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: barSpace }]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <BackPill />
            <AppText variant="cartPageTitle">{strings.cart.title}</AppText>
          </View>

          {empty ? (
            <EmptyCart />
          ) : (
            <>
              {addOn && signedIn ? (
                <View style={styles.addOn}>
                  <AddOnBanner sub={strings.addOn.cartBanner(addOn.left)} button={strings.addOn.cartBar} onPress={() => openAddOn(true)} />
                </View>
              ) : null}
              <View style={styles.lines}>
                {items.map((item) => {
                  const { product, variant, line } = item;
                  const note =
                    stockNote && stockNote.productId === product.id && stockNote.variantId === variant.id ? stockNote.message : null;
                  const clearNote = () => note && setStockNote(null);
                  const offer = swaps.get(swapKey(product.id, variant.id));
                  return (
                    <CartLineCard
                      key={`${product.id}-${variant.id}`}
                      item={item}
                      canIncrement={canIncrement(lines, product.id, variant.id, variant.stock, MAX_UNITS_PER_PRODUCT)}
                      stockLimited={line.qty >= variant.stock}
                      stockMessage={note}
                      onIncrement={() => {
                        increment(product.id, variant.id, variant.stock);
                        clearNote();
                      }}
                      onDecrement={() => {
                        decrement(product.id, variant.id);
                        clearNote();
                      }}
                      onBlockedIncrement={() =>
                        setStockNote({ productId: product.id, variantId: variant.id, message: strings.cart.onlyLeft(variant.stock) })
                      }
                      onRemove={() => remove(product.id, variant.id)}
                      footer={offer ? <SwapStrip offer={offer} onPress={() => setSwapping({ item, offer })} /> : null}
                    />
                  );
                })}
                <OftenBought products={recommendations} onOpenOptions={openOptions} />
              </View>

              <View style={styles.summary}>
                {signedIn ? (
                  <CouponEntryCard applied={applied} onOpen={() => setCouponsOpen(true)} onRemove={() => setAppliedCode(null)} />
                ) : null}
                <FreeDeliveryCard nudge={cart.allUnavailable ? null : freeDeliveryNudge(cart.fees, cart.bill.itemsTotal)} />
                <BillDetails cart={cart} coupon={applied} />
                <View style={styles.extras}>
                  <TipCard options={config.tipOptions} tip={tip} onChange={setTip} />
                  <CancellationPolicy />
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>

      {empty ? null : signedIn ? (
        <CartBottomBar
          kind="signedIn"
          name={location?.label || user.name || strings.cart.user}
          address={location?.text.trim() || strings.cart.selectAddress}
          total={cart.bill.grandTotal}
          buttonLabel={buttonLabel}
          canProceed={!blocked}
          onChange={() => setLocationOpen(true)}
          onProceed={proceed}
        />
      ) : (
        <CartBottomBar kind="guest" onLogin={() => router.push('/login')} />
      )}

      {closedStore && slots.length > 0 ? (
        <SlotSheet
          visible={slotOpen}
          store={closedStore}
          slots={slots}
          confirmLabel={strings.schedule.proceed}
          onConfirm={goToPayment}
          onClose={() => setSlotOpen(false)}
        />
      ) : null}
      <AlertSnackbar alert={alert} onHide={hideAlert} durationMs={alert?.action ? 5000 : 3000} />
      <SwapDialog swap={swapping} onSwap={confirmSwap} onDecline={declineSwap} onClose={() => setSwapping(null)} />
      <ApplyCouponsDialog
        visible={couponsOpen}
        coupons={coupons}
        loadError={couponsFailed}
        lines={priced}
        onClose={() => setCouponsOpen(false)}
        onApply={applyCoupon}
      />
      <LocationDialog visible={locationOpen} variant="change" required={false} onClose={() => setLocationOpen(false)} />
      <VariantDialog product={options} onClose={() => setOptions(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  // The site's page container leaves 12 px on each side; the cart page itself is a light grey.
  page: { flex: 1, marginHorizontal: 12, backgroundColor: colors.cartPageBg },
  content: { padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  lines: { gap: 16 },
  addOn: { marginBottom: 16 },
  // 40 on the site, where the first card's 15 px top margin collapses into it.
  summary: { marginTop: 25 },
  extras: { marginTop: 20 },
});
