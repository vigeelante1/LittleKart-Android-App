import { isTrackable, type Order } from '@littlekart/shared';
import { usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BAR_SPACE } from '@/features/cart/CartBottomBar';
import { useCartProducts } from '@/hooks/useCartProducts';
import { useNow } from '@/hooks/useNow';
import { useAuthStore, useTrackingStore } from '@/store';

/** Screens that show the cart bar while the cart has items. */
const CART_ROUTES = [/^\/$/, /^\/category\//, /^\/deals$/, /^\/search$/, /^\/product\//];
/** Screens with the floating "Ask AI" button (DECISIONS D-102). */
const ASK_AI_ROUTES = [/^\/$/, /^\/category\//];
/** Screens where the tracking strip would be in the way. */
const NO_TRACKING = [/^\/tracking/, /^\/login/, /^\/add-address/, /^\/payment/];

export const CART_BAR_HEIGHT = 60;
export const TRACKING_STRIP_HEIGHT = 54;
export const DOCK_GAP = 8;
export const ASK_AI_HEIGHT = 44;

export interface DockState {
  showCart: boolean;
  order: Order | null;
  /** Distance of the dock's bottom edge from the screen's bottom. */
  bottom: number;
  /** Height of the cart bar and tracking strip together (0 when neither shows). */
  height: number;
  /** The "Ask AI" button shows above the dock on this screen. */
  askAi: boolean;
  /** Space a scrolling page leaves at its end so the dock never covers content (0 when the dock is empty). */
  space: number;
  now: number;
}

/**
 * The bottom dock (iteration 2): a full-width cart bar and, above it, a slim strip for the order on its way.
 * Both pages and the dock use this, so the space pages leave always matches what the dock draws.
 */
export function useDock(): DockState {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const now = useNow();
  const items = useCartProducts();
  const user = useAuthStore((s) => s.user);
  const active = useTrackingStore((s) => s.active);

  const hasItems = items.length > 0;
  const showCart = hasItems && CART_ROUTES.some((re) => re.test(pathname));
  const order = user && active && isTrackable(active, now) && !NO_TRACKING.some((re) => re.test(pathname)) ? active : null;

  // On the cart page the dock sits on top of the cart's own bottom bar.
  const onCart = pathname === '/cart' && hasItems;
  const base = insets.bottom + 12;
  const bottom = onCart ? (user ? BAR_SPACE.signedIn : BAR_SPACE.guest) + insets.bottom + DOCK_GAP : base;
  const height = (showCart ? CART_BAR_HEIGHT : 0) + (order ? TRACKING_STRIP_HEIGHT : 0) + (showCart && order ? DOCK_GAP : 0);
  const askAi = ASK_AI_ROUTES.some((re) => re.test(pathname));
  const stack = height + (askAi ? ASK_AI_HEIGHT + (height > 0 ? 12 : 0) : 0);
  return { showCart, order, bottom, height, askAi, space: stack > 0 ? stack + base + 12 : 0, now };
}
