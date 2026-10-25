// Radii, shadows and spacing measured on littlekart.com. Units are dp (= CSS px on a phone, DECISIONS D-25).
// Shadows use React Native's `boxShadow` style, which takes the same syntax as CSS.

export const radius = {
  chipSmall: 3,
  card: 14,
  pill: 999,
} as const;

export const shadows = {
  none: '0px 0px 0px rgba(0, 0, 0, 0)',
  mapClose: '0px 8px 20px rgba(15, 23, 42, 0.18)',
  pinLabel: '0px 2px 6px rgba(255, 255, 255, 0.5)',
  currentLocation: '0px 2px 8px rgba(15, 23, 42, 0.18)',
  mapPanel: '0px 16px 40px rgba(15, 23, 42, 0.18)',
  confirmLocation: '0px 12px 28px rgba(249, 115, 22, 0.28)',
  labelTag: '0px 4px 14px rgba(15, 23, 42, 0.06)',
  labelTagSelected: '0px 10px 22px rgba(46, 125, 50, 0.24)',
  addAddress: '0px 2px 8px rgba(249, 115, 22, 0.12)',
  profileHero: '0px 4px 18px rgba(15, 23, 42, 0.06)',
  soft: '0px 2px 10px rgba(15, 23, 42, 0.06)',
  raised: '0px 8px 22px rgba(15, 23, 42, 0.08)',
  cartLine: '0px 2px 10px rgba(15, 23, 42, 0.05)',
  dealCard: '0px 2px 8px rgba(15, 23, 42, 0.08)',
  gridCard: '0px 8px 24px rgba(15, 23, 42, 0.08)',
  recCard: '0px 6px 18px rgba(15, 23, 42, 0.08)',
  recSection: '0px 4px 16px rgba(15, 23, 42, 0.04)',
  tile: '0px 6px 16px rgba(120, 53, 15, 0.08)',
  header: '0px 4px 12px rgba(15, 23, 42, 0.06)',
  strip: '0px 2px 10px rgba(15, 23, 42, 0.05)',
  stripThumb: '0px 3px 10px rgba(15, 23, 42, 0.05)',
  stripThumbActive: '0px 6px 14px rgba(12, 131, 31, 0.14)',
  banner: '0px 8px 18px rgba(15, 23, 42, 0.12)',
  newBadge: '0px 2px 6px rgba(239, 35, 60, 0.3)',
  plus: '0px 2px 6px rgba(15, 23, 42, 0.16)',
  addButton: '0px 2px 6px rgba(15, 23, 42, 0.07)',
  cardStepper: '0px 6px 14px rgba(1, 163, 42, 0.14)',
  dialogStepper: '0px 4px 10px rgba(1, 163, 42, 0.12)',
  cartStepper: '0px 3px 8px rgba(12, 131, 31, 0.2)',
  priceChip: '0px 2px 6px rgba(12, 131, 31, 0.25)',
  ribbon: '0px 6px 14px rgba(37, 99, 235, 0.28)',
  cartPill: '0px 4px 8px rgba(0, 0, 0, 0.15)',
  bottomBar: '0px -8px 20px rgba(0, 0, 0, 0.08)',
  policyCard: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  tipChip: '0px 1px 4px rgba(15, 23, 42, 0.08)',
  tipCustom: '0px 3px 7px rgba(255, 123, 15, 0.28)',
  dialog: '0px 8px 22px rgba(15, 23, 42, 0.08)',
  locationDialog: '0px 24px 70px rgba(17, 24, 39, 0.24)',
  welcomeButton: '0px 10px 22px rgba(0, 168, 45, 0.22)',
  savedAddress: '0px 1px 4px rgba(0, 0, 0, 0.06)',
  headerProfileNight: '0px 8px 18px rgba(15, 23, 42, 0.12)',
  chipInset: 'inset 0px 1px 0px rgba(255, 255, 255, 0.85)',
  chipActiveInset: 'inset 0px 0px 0px 1px rgba(0, 168, 45, 0.12)',
  categoryHero: '0px 6px 18px rgba(15, 23, 42, 0.05)',
  variantRow: '0px 1px 4px rgba(15, 23, 42, 0.06)',
  searchBar: '0px 3px 12px rgba(15, 23, 42, 0.06)',
  seeAll: '0px 0px 0px 1px rgba(46, 125, 50, 0.08), 0px 0px 18px rgba(46, 125, 50, 0.16), 0px 4px 12px rgba(46, 125, 50, 0.08)',
  seeAllThumb: '0px 1px 3px rgba(15, 23, 42, 0.1)',
  closeButton: '0px 4px 12px rgba(15, 23, 42, 0.08)',
  tipSelected: '0px 4px 10px rgba(12, 131, 31, 0.24)',
  tipApply: '0px 3px 7px rgba(1, 163, 42, 0.28)',
  customTip: '0px 2px 6px rgba(0, 0, 0, 0.1)',
  couponCard: '0px 4px 14px rgba(15, 23, 42, 0.06)',
  couponApply: '0px 5px 12px rgba(22, 163, 74, 0.28)',
  // MUI elevation 1 (the info popup's round close button).
  muiElevation1: '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
  // MUI elevation 16 (bottom sheets).
  muiElevation16: '0px 8px 10px -5px rgba(0, 0, 0, 0.2), 0px 16px 24px 2px rgba(0, 0, 0, 0.14), 0px 6px 30px 5px rgba(0, 0, 0, 0.12)',
  // MUI elevations used by the site's dialogs and buttons.
  muiElevation2: '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)',
  muiElevation24: '0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12)',
  // Store-closed sign: white inner ring, deep red glow, small drop shadow.
  closedTag: '0px 8px 24px 0px rgba(99, 17, 17, 0.35), 0px 2px 6px 0px rgba(0, 0, 0, 0.12)',
  closedTagRing: 'inset 0px 0px 0px 2px rgba(255, 255, 255, 0.92)',
  rivet: 'inset 0px 1px 1px 0px rgba(255, 255, 255, 0.65), 0px 1px 2px 0px rgba(0, 0, 0, 0.35)',
  // Bottom dock
  dockCart: '0px 8px 20px rgba(12, 131, 31, 0.3)',
  dockStrip: '0px 6px 18px rgba(15, 23, 42, 0.12)',
  // M9: payment, tracking, orders
  muiElevation8: '0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)',
  paymentSelected: '0px 6px 16px rgba(1, 163, 42, 0.25)',
  submitOrder: '0px 4px 10px rgba(1, 163, 42, 0.2)',
  trackingHero: '0px 6px 18px rgba(15, 23, 42, 0.06)',
  trackingSection: '0px 4px 20px rgba(15, 23, 42, 0.06)',
  trackingCard: '0px 2px 12px rgba(15, 23, 42, 0.06)',
  summaryThumb: '0px 2px 6px rgba(15, 23, 42, 0.06)',
  openSummary: '0px 6px 14px rgba(1, 163, 42, 0.18)',
  stepRing: '0px 0px 0px 3px rgba(1, 163, 42, 0.14)',
  floatingTracking: '0px 12px 24px rgba(1, 163, 42, 0.26)',
  orderCard: '0px 4px 16px rgba(15, 23, 42, 0.08)',
  successDialog: '0px 18px 50px rgba(15, 23, 42, 0.2)',
  // MUI elevation 3, used by the "OTP sent successfully!" snackbar.
  snackbar: '0px 3px 3px -2px rgba(0, 0, 0, 0.2), 0px 3px 4px 0px rgba(0, 0, 0, 0.14), 0px 1px 8px 0px rgba(0, 0, 0, 0.12)',
} as const;

/**
 * Thin borders: 1 px in the site's CSS (the measuring browser reported 0.8 because of its zoom; DECISIONS D-49).
 */
export const hairline = 1;
/** The outlined ADD button's border is 1.2 px in the site's CSS. */
export const addBorder = 1.2;
