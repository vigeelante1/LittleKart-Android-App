import {
  canIncrement,
  couponRemovedMessage,
  freeDeliveryNudge,
  MAX_UNITS_PER_PRODUCT,
  NO_TIP,
  storeClosedLines,
  validateCoupon,
  type Product,
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
import { TipCard } from '@/features/cart/TipCard';
import { billableLines, toPricedLines, useCartBill } from '@/features/cart/useCartBill';
import { useCoupons } from '@/features/cart/useCoupons';
import { useRecommendations } from '@/features/cart/useRecommendations';
import { VariantDialog } from '@/features/category/VariantDialog';
import { LocationDialog } from '@/features/location/LocationDialog';
import { useReopenLocationDialog } from '@/hooks/useReopenLocationDialog';
import { useCartProducts } from '@/hooks/useCartProducts';
import { useConfig } from '@/hooks/useConfig';
import { useNearestStore } from '@/hooks/useNearestStore';
import { useStoreClosed } from '@/hooks/useStoreClosed';
import { DOCK_GAP, TRACKING_STRIP_HEIGHT, useDock } from '@/features/dock/useDock';
import { StoreClosedRibbon } from '@/components/StoreClosedRibbon';
import { useAuthStore, useCartStore, useCheckoutStore, useLocationStore } from '@/store';
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
  const dock = useDock();
  const productIds = useMemo(() => items.map((i) => i.product.id), [items]);
  const recommendations = useRecommendations(productIds);
  const hideAlert = useCallback(() => setAlert(null), []);
  const openOptions = useCallback((p: Product) => setOptions(p), []);

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
      setAlert({ message: storeClosedLines(closedStore).snackbar, severity: 'warning' });
      return;
    }
    startCheckout({
      items: billableLines(items),
      bill: cart.bill,
      tip: tip.amount,
      couponCode: applied?.code ?? null,
      orderDate: Date.now(),
    });
    router.push('/payment');
  };

  const empty = items.length === 0;
  const blocked = cart.outOfStockCount > 0;
  const buttonLabel = cart.allUnavailable ? strings.cart.cannotProceed : blocked ? strings.cart.removeOutOfStock : strings.cart.proceedToPay;
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
              <View style={styles.lines}>
                {items.map((item) => {
                  const { product, variant, line } = item;
                  const note =
                    stockNote && stockNote.productId === product.id && stockNote.variantId === variant.id ? stockNote.message : null;
                  const clearNote = () => note && setStockNote(null);
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

      <AlertSnackbar alert={alert} onHide={hideAlert} />
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
  // 40 on the site, where the first card's 15 px top margin collapses into it.
  summary: { marginTop: 25 },
  extras: { marginTop: 20 },
});
