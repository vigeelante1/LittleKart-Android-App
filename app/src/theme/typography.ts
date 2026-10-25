// Text styles measured on littlekart.com (size / CSS weight / color / letter-spacing).
// Used through <AppText variant="..."/>. Add a variant here rather than styling text inline.
import type { ColorToken } from './colors';
import type { CssWeight } from './fonts';

export interface TextVariant {
  size: number;
  weight: CssWeight;
  color: ColorToken;
  letterSpacing?: number;
  lineHeight?: number;
  uppercase?: boolean;
  /** Slanted, as the browser draws "font-style: italic" without an italic font file. */
  italic?: boolean;
  /** Use the phone's system font instead of Inter. */
  system?: boolean;
  /** Dancing Script (only "Sorry," on the store-closed sign). */
  script?: boolean;
}

export const textVariants = {
  // Home header
  greeting: { size: 14.4, weight: 600, color: 'headerText', letterSpacing: -0.072, lineHeight: 19 },
  headline: { size: 20.16, weight: 800, color: 'headerText', letterSpacing: -0.4032, lineHeight: 25 },
  headerAddress: { size: 14, weight: 500, color: 'headerText', letterSpacing: -0.0912, lineHeight: 19 },
  headerLogin: { size: 15.2, weight: 700, color: 'headerText', lineHeight: 22.8 },
  searchPlaceholder: { size: 16, weight: 500, color: 'searchPlaceholder' },

  // Category strip and home sections
  stripLabel: { size: 16, weight: 400, color: 'textLabel', lineHeight: 24.8 },
  stripLabelActive: { size: 16, weight: 500, color: 'textStrong', lineHeight: 24.8 },
  newBadge: { size: 9.28, weight: 800, color: 'white', letterSpacing: 0.0928, lineHeight: 11.136 },
  sectionTitle: { size: 24, weight: 800, color: 'sectionTitle', letterSpacing: -0.48, lineHeight: 26.4 },
  tileLabel: { size: 11.52, weight: 500, color: 'textGrey', lineHeight: 13.82 },
  dealsTitle: { size: 16.8, weight: 700, color: 'text', letterSpacing: -0.168, lineHeight: 21 },
  viewAll: { size: 14, weight: 600, color: 'viewAllGreen', lineHeight: 21 },

  // Deal card (home)
  dealName: { size: 13, weight: 700, color: 'text', lineHeight: 14.95 },
  dealWeight: { size: 12, weight: 400, color: 'textMuted', lineHeight: 14.4 },
  dealOff: { size: 12, weight: 800, color: 'offText', lineHeight: 14.4 },
  dealPrice: { size: 15, weight: 800, color: 'text', lineHeight: 16.5 },
  dealMrp: { size: 12, weight: 500, color: 'mrp', lineHeight: 18 },
  plus: { size: 24, weight: 500, color: 'white', lineHeight: 28 },
  dealQtySign: { size: 18, weight: 400, color: 'white', lineHeight: 22 },
  dealQtyCount: { size: 13, weight: 800, color: 'white' },

  // Grid product card
  etaChip: { size: 10.56, weight: 800, color: 'etaChipText', letterSpacing: 0.1056, uppercase: true },
  priceChip: { size: 11.84, weight: 800, color: 'white', lineHeight: 21 },
  cardMrp: { size: 10.88, weight: 400, color: 'mrp' },
  cardSavings: { size: 10.24, weight: 800, color: 'primaryDark', lineHeight: 11.3 },
  // 0.76rem, line-height 1.16, box always 2 lines (2.4em) tall.
  cardName: { size: 12.16, weight: 700, color: 'text', letterSpacing: -0.146, lineHeight: 14.1 },
  cardBrand: { size: 10.24, weight: 400, color: 'mrp', lineHeight: 11.3 },
  cardOptions: { size: 11.52, weight: 500, color: 'textSlateMuted', letterSpacing: -0.046, lineHeight: 13.8 },
  cardWeight: { size: 11.52, weight: 500, color: 'textMuted', letterSpacing: -0.046, lineHeight: 13.8 },
  addLabel: { size: 14.4, weight: 600, color: 'addGreenText', uppercase: true },
  addLabelWithOptions: { size: 15.68, weight: 600, color: 'addGreenText', letterSpacing: 0.1, lineHeight: 15.7, uppercase: true },
  addOptions: { size: 12, weight: 600, color: 'textSlateMuted', lineHeight: 14.4 },
  stepperCount: { size: 14.4, weight: 700, color: 'text' },
  ribbonPercent: { size: 8.64, weight: 900, color: 'white', lineHeight: 10.4, uppercase: true },
  ribbonOff: { size: 7.68, weight: 900, color: 'white', lineHeight: 8.1, uppercase: true },

  // Screen headers
  backPill: { size: 13.12, weight: 650, color: 'textBody' },
  categoryTitle: { size: 17.92, weight: 750, color: 'text', letterSpacing: -0.3584, lineHeight: 20.6 },

  // Category list
  railLabel: { size: 11.2, weight: 500, color: 'textLabel', letterSpacing: -0.112, lineHeight: 12.9 },
  railLabelSelected: { size: 11.2, weight: 700, color: 'text', letterSpacing: -0.112, lineHeight: 12.9 },
  filterChip: { size: 13, weight: 600, color: 'textBody' },
  categorySearchHint: { size: 16, weight: 400, color: 'inputPlaceholder', lineHeight: 22 },

  // Cart (littlekart.com /cart, M5)
  cartPageTitle: { size: 21.6, weight: 800, color: 'text', letterSpacing: -0.432, lineHeight: 28.8 },
  cartName: { size: 14.4, weight: 700, color: 'text', lineHeight: 17.28 },
  cartWeight: { size: 14, weight: 400, color: 'textSlateMuted', lineHeight: 21 },
  cartMrp: { size: 12, weight: 400, color: 'footerGrey', lineHeight: 18 },
  cartPrice: { size: 14, weight: 700, color: 'primaryDark', lineHeight: 21 },
  cartStockMessage: { size: 14, weight: 500, color: 'accent', lineHeight: 21 },
  cartOutOfStock: { size: 12, weight: 700, color: 'muiError', lineHeight: 18 },
  cartStepperCount: { size: 12.16, weight: 800, color: 'white', lineHeight: 14.6 },
  remove: { size: 11, weight: 700, color: 'error', lineHeight: 19.25 },
  removeUnavailable: { size: 12, weight: 700, color: 'cssRed', lineHeight: 21 },
  recTitle: { size: 20, weight: 800, color: 'textSlate', lineHeight: 22 },
  seeAll: { size: 14.4, weight: 800, color: 'greenDeep', lineHeight: 21.6 },
  emptyCart: { size: 20, weight: 800, color: 'text', lineHeight: 32 },
  couponEntryTitle: { size: 16, weight: 700, color: 'text', lineHeight: 24.8 },
  couponEntrySub: { size: 12, weight: 400, color: 'couponEntrySub', lineHeight: 19.92 },
  couponApplied: { size: 16, weight: 700, color: 'primaryDark', lineHeight: 24.8 },
  muiCaption: { size: 12, weight: 400, color: 'textSlateMuted', lineHeight: 19.92 },
  muiSmallButton: { size: 13, weight: 700, color: 'brightGreen', lineHeight: 22.75 },
  freeDelivery: { size: 14, weight: 600, color: 'greenDeep', lineHeight: 21 },
  freeDeliveryStrong: { size: 14, weight: 700, color: 'greenDeep', lineHeight: 21 },
  nudge: { size: 12, weight: 400, color: 'nudgeText', lineHeight: 19.92 },
  nudgeStrong: { size: 12, weight: 700, color: 'nudgeText', lineHeight: 19.92 },
  billTitle: { size: 16, weight: 800, color: 'text', letterSpacing: -0.16, lineHeight: 24.8 },
  billWarning: { size: 14, weight: 400, color: 'billWarningText', lineHeight: 21 },
  billRow: { size: 14, weight: 500, color: 'text', lineHeight: 21 },
  billItemsTotal: { size: 14, weight: 500, color: 'itemsTotalOrange', lineHeight: 21 },
  billSaving: { size: 14, weight: 600, color: 'primary', lineHeight: 21 },
  billFree: { size: 14, weight: 700, color: 'primary', lineHeight: 21 },
  billStruck: { size: 12, weight: 400, color: 'footerGrey', lineHeight: 18 },
  billTotal: { size: 16, weight: 700, color: 'text', lineHeight: 24.8 },
  infoText: { size: 16, weight: 400, color: 'text', lineHeight: 24.8 },
  tipTitle: { size: 18, weight: 700, color: 'text', letterSpacing: -0.18, lineHeight: 21.6 },
  tipQuote: { size: 13, weight: 400, color: 'textMuted', lineHeight: 19.5, italic: true },
  tipChip: { size: 13, weight: 600, color: 'black', lineHeight: 19.5 },
  tipChipSelected: { size: 13, weight: 600, color: 'white', lineHeight: 19.5 },
  tipApply: { size: 13, weight: 500, color: 'white', lineHeight: 19.5 },
  customTip: { size: 14, weight: 400, color: 'black' },
  policyTitle: { size: 20, weight: 600, color: 'text', lineHeight: 32 },
  policyBody: { size: 14, weight: 400, color: 'textSlateMuted', lineHeight: 21 },
  button: { size: 16, weight: 700, color: 'white', lineHeight: 28 },
  barDelivering: { size: 14, weight: 700, color: 'text', lineHeight: 16.8 },
  alertMessage: { size: 14, weight: 400, color: 'alertSuccessText', lineHeight: 20.02 },
  barChange: { size: 13, weight: 600, color: 'brightGreen', lineHeight: 22.75 },
  barPayAmount: { size: 18, weight: 700, color: 'text', lineHeight: 19.8 },
  couponDialogTitle: { size: 17.28, weight: 700, color: 'text', lineHeight: 27.65 },
  couponSection: { size: 14, weight: 700, color: 'text', lineHeight: 21 },
  couponError: { size: 12, weight: 400, color: 'muiError', lineHeight: 19.92 },
  couponNote: { size: 14, weight: 400, color: 'textSlateMuted', lineHeight: 21 },
  couponCode: { size: 12, weight: 800, color: 'text', letterSpacing: 0.24, lineHeight: 19.92 },
  couponSave: { size: 12, weight: 800, color: 'couponSaveText', lineHeight: 19.92 },
  couponTitle: { size: 15.2, weight: 800, color: 'text', lineHeight: 22.8 },
  couponTitleIdle: { size: 14, weight: 800, color: 'text', lineHeight: 21 },
  couponMessage: { size: 12, weight: 400, color: 'textSlateMuted', lineHeight: 16.2 },
  couponHint: { size: 12, weight: 700, color: 'couponHint', lineHeight: 19.92 },
  couponApplyDisabled: { size: 14, weight: 700, color: 'disabledText', lineHeight: 24.5 },
  couponButton: { size: 13, weight: 700, color: 'white', lineHeight: 22.75 },
  couponButtonDisabled: { size: 13, weight: 700, color: 'disabledText', lineHeight: 22.75 },

  // Profile (littlekart.com /profile, M6)
  profileTitle: { size: 17.28, weight: 800, color: 'text', letterSpacing: -0.3456, lineHeight: 26.8 },
  profileName: { size: 17.92, weight: 750, color: 'text', letterSpacing: -0.3584, lineHeight: 21.5 },
  profilePhone: { size: 13.44, weight: 500, color: 'textSlateMuted', lineHeight: 20.8 },
  profileSection: { size: 11.52, weight: 700, color: 'textMuted', letterSpacing: 0.6912, lineHeight: 17.28, uppercase: true },
  profileMenu: { size: 14.72, weight: 600, color: 'text', letterSpacing: -0.1472, lineHeight: 22.08 },
  logout: { size: 14.72, weight: 700, color: 'error', lineHeight: 22.08 },

  // Add / Edit Address (littlekart.com address modal, M7)
  suggestionPrimary: { size: 14, weight: 400, color: 'text', lineHeight: 20 },
  pinLabel: { size: 12, weight: 500, color: 'white', lineHeight: 18 },
  currentLocation: { size: 12, weight: 700, color: 'primary', lineHeight: 21 },
  mapPanelTitle: { size: 14, weight: 400, color: 'textSlateMuted', lineHeight: 21 },
  mapPanelAddress: { size: 12, weight: 400, color: 'text', lineHeight: 19.92 },
  confirmLocation: { size: 14, weight: 700, color: 'muiContainedText', letterSpacing: 0.28, lineHeight: 24.5 },
  formTitle: { size: 20, weight: 600, color: 'text', lineHeight: 32 },
  labelTag: { size: 13, weight: 600, color: 'text', lineHeight: 19.5 },
  labelTagSelected: { size: 13, weight: 600, color: 'white', lineHeight: 19.5 },
  addressBox: { size: 14, weight: 400, color: 'text', lineHeight: 21 },
  fieldLabel: { size: 16, weight: 400, color: 'textSlateMuted', lineHeight: 23 },
  formButton: { size: 16, weight: 400, color: 'text', lineHeight: 24 },
  alertError: { size: 14, weight: 400, color: 'alertErrorText', lineHeight: 20.02 },
  addressTitle: { size: 14.08, weight: 700, color: 'text', lineHeight: 17.6 },
  addressDetails: { size: 12.8, weight: 400, color: 'textMuted', lineHeight: 17.28 },
  addAddress: { size: 14.4, weight: 700, color: 'addAddressText', lineHeight: 21.6 },

  // View Cart pill
  pillTitle: { size: 16, weight: 500, color: 'white', letterSpacing: 0.16, lineHeight: 24.8 },
  pillCount: { size: 16, weight: 400, color: 'white', letterSpacing: 0.192, lineHeight: 24.8 },

  // Login (littlekart.com /login)
  skip: { size: 18, weight: 700, color: 'textMuted', lineHeight: 31.5 },
  loginInput: { size: 16, weight: 400, color: 'text', lineHeight: 23 },
  loginAdornment: { size: 16, weight: 400, color: 'inputAdornment', lineHeight: 23 },
  loginButton: { size: 16, weight: 600, color: 'white', lineHeight: 28 },
  loginHelper: { size: 12, weight: 400, color: 'error', lineHeight: 19.9 },
  verifyTitle: { size: 18, weight: 600, color: 'text', lineHeight: 27.9 },
  /** "Fresh & Fast": the site asks for Poppins but never loads it, so phones draw the system font (Roboto). */
  tagline: { size: 14, weight: 600, color: 'tagline', lineHeight: 21.7, system: true },
  verifySub: { size: 13, weight: 400, color: 'footerGrey', lineHeight: 20.15 },
  otpDigit: { size: 20, weight: 400, color: 'text' },
  otpError: { size: 13, weight: 400, color: 'error', lineHeight: 20.15 },
  verifying: { size: 14, weight: 600, color: 'textMuted', lineHeight: 21.7 },
  resend: { size: 14, weight: 700, color: 'brightGreen', lineHeight: 24.5 },
  footer: { size: 12, weight: 400, color: 'footerGrey', lineHeight: 18.6 },
  footerLink: { size: 12, weight: 400, color: 'link', lineHeight: 18.6 },
  snackbar: { size: 14, weight: 600, color: 'white', lineHeight: 20 },
  successTitle: { size: 20, weight: 800, color: 'brightGreen', lineHeight: 31 },
  successSub: { size: 13, weight: 400, color: 'textSlateMuted', lineHeight: 20.15 },

  // Saved-cart dialog (MUI h6 bold, body2 secondary, Button text)
  savedCartTitle: { size: 20, weight: 700, color: 'text', lineHeight: 32 },
  savedCartBody: { size: 14, weight: 400, color: 'textSlateMuted', lineHeight: 20 },
  muiButton: { size: 14, weight: 700, color: 'primary', lineHeight: 24.5 },

  // Location dialogs (littlekart.com location dialog)
  welcomeTitle: { size: 26, weight: 900, color: 'text', letterSpacing: -0.78, lineHeight: 29.12 },
  welcomeSub: { size: 15, weight: 400, color: 'textMuted', lineHeight: 23.25 },
  welcomeInfo: { size: 14.5, weight: 700, color: 'welcomeInfoText', lineHeight: 22.5 },
  welcomeButton: { size: 15.2, weight: 800, color: 'white', lineHeight: 26.6 },
  welcomeOr: { size: 12.8, weight: 800, color: 'textMuted', lineHeight: 19.8 },
  dialogHeading: { size: 20, weight: 600, color: 'text', lineHeight: 32 },
  changeButton: { size: 12, weight: 700, color: 'white', lineHeight: 21 },
  changeOr: { size: 12, weight: 400, color: 'textSlateMuted', lineHeight: 18.6 },
  savedHeading: { size: 14, weight: 600, color: 'text', lineHeight: 20 },
  addNew: { size: 13, weight: 500, color: 'brightGreen', lineHeight: 22.75 },
  listPrimary: { size: 16, weight: 400, color: 'text', lineHeight: 24 },
  listSecondary: { size: 14, weight: 400, color: 'textSlateMuted', lineHeight: 20 },
  caption: { size: 12, weight: 400, color: 'textSlateMuted', lineHeight: 19.9 },
  locationError: { size: 14, weight: 600, color: 'error', lineHeight: 20 },

  // Category screen extras, size picker, filter sheets, search (M4)
  filterChipActive: { size: 13, weight: 600, color: 'filterActiveText' },
  variantTitle: { size: 16.8, weight: 700, color: 'text', lineHeight: 21.84 },
  variantLabel: { size: 14, weight: 700, color: 'text', lineHeight: 16.8 },
  variantPrice: { size: 11.84, weight: 800, color: 'white', lineHeight: 13.6 },
  variantMrp: { size: 11.52, weight: 400, color: 'variantMrp' },
  variantSaving: { size: 10.88, weight: 700, color: 'primaryDark', lineHeight: 12 },
  sheetTitle: { size: 16.8, weight: 800, color: 'text', lineHeight: 24 },
  sheetTab: { size: 14.72, weight: 500, color: 'textLabel', lineHeight: 22 },
  sheetTabActive: { size: 14.72, weight: 700, color: 'filterActiveText', lineHeight: 22 },
  sheetOption: { size: 15.2, weight: 500, color: 'text', lineHeight: 22.8 },
  sheetOptionSelected: { size: 15.2, weight: 700, color: 'filterActiveText', lineHeight: 22.8 },
  sheetNote: { size: 13.12, weight: 400, color: 'textSlateMuted', lineHeight: 19.7 },
  sheetClear: { size: 14, weight: 700, color: 'clearFilterText', lineHeight: 24.5 },
  sheetApply: { size: 14, weight: 700, color: 'white', lineHeight: 24.5 },
  listMessage: { size: 16, weight: 400, color: 'text', lineHeight: 24 },
  searchEmptyTitle: { size: 16, weight: 600, color: 'text', lineHeight: 24 },
  searchEmptySub: { size: 14, weight: 400, color: 'textMuted', lineHeight: 21 },

  // Payment page (MUI h5/h6/body1/body2/caption with the site's theme, M9)
  muiH5Bold: { size: 24, weight: 700, color: 'text', letterSpacing: -0.48, lineHeight: 32 },
  muiH6Bold: { size: 20, weight: 700, color: 'text', letterSpacing: -0.3, lineHeight: 32 },
  muiH6Semi: { size: 20, weight: 600, color: 'text', letterSpacing: -0.3, lineHeight: 32 },
  muiH6Dialog: { size: 20, weight: 800, color: 'text', letterSpacing: -0.3, lineHeight: 32 },
  muiBody1: { size: 16, weight: 400, color: 'text', lineHeight: 24.8 },
  muiBody1Bold: { size: 16, weight: 700, color: 'text', lineHeight: 24.8 },
  muiBody2: { size: 14, weight: 400, color: 'text', lineHeight: 21 },
  muiBody2Muted: { size: 14, weight: 400, color: 'textSlateMuted', lineHeight: 21 },
  muiBody2Bold: { size: 14, weight: 700, color: 'text', lineHeight: 21 },
  muiBody2MutedSemi: { size: 14, weight: 600, color: 'textSlateMuted', lineHeight: 21 },
  muiSubtitle2Bold: { size: 14, weight: 700, color: 'text', lineHeight: 21.98 },
  productName: { size: 14.4, weight: 400, color: 'text', lineHeight: 17.28 },
  paymentPrice: { size: 16, weight: 400, color: 'cssGreen', lineHeight: 24.8 },
  paymentMrp: { size: 14, weight: 400, color: 'footerGrey', lineHeight: 21 },
  methodLabel: { size: 14.4, weight: 700, color: 'text', lineHeight: 25.2 },
  methodLabelSelected: { size: 14.4, weight: 700, color: 'white', lineHeight: 25.2 },
  methodHelper: { size: 12, weight: 400, color: 'text', letterSpacing: 0.4, lineHeight: 19.92 },
  methodHelperSelected: { size: 12, weight: 400, color: 'white', letterSpacing: 0.4, lineHeight: 19.92 },
  codNoticeTitle: { size: 14, weight: 700, color: 'codNoticeText', lineHeight: 21 },
  codNoticeBody: { size: 14, weight: 400, color: 'codNoticeText', lineHeight: 21 },
  submitOrder: { size: 15.2, weight: 800, color: 'white', lineHeight: 26.6 },
  submitOrderDisabled: { size: 15.2, weight: 800, color: 'disabledText', lineHeight: 26.6 },
  submittedTitle: { size: 20, weight: 700, color: 'primary', letterSpacing: -0.3, lineHeight: 32 },
  muiSuccessButton: { size: 14, weight: 700, color: 'white', lineHeight: 24.5 },
  errorDialogTitle: { size: 16.8, weight: 600, color: 'errorDark', letterSpacing: 0.168, lineHeight: 26.88 },
  errorDialogBody: { size: 14, weight: 400, color: 'text', lineHeight: 22.4 },
  errorDialogButton: { size: 14, weight: 600, color: 'white', lineHeight: 24.5 },
  errorDialogButtonOutlined: { size: 14, weight: 600, color: 'primary', lineHeight: 24.5 },

  // Tracking page
  heroKicker: { size: 14.72, weight: 600, color: 'heroKicker', letterSpacing: 0.3, lineHeight: 22.8, uppercase: true },
  heroStatus: { size: 18.56, weight: 700, color: 'heroEta', lineHeight: 22.27 },
  heroArriving: { size: 13.6, weight: 700, color: 'primary', letterSpacing: 0.272, lineHeight: 21 },
  heroOrderId: { size: 13.6, weight: 600, color: 'textSlate', letterSpacing: 0.272, lineHeight: 21 },
  otpLabel: { size: 9.92, weight: 700, color: 'otpLabel', lineHeight: 12 },
  otpValue: { size: 11.52, weight: 800, color: 'otpValue', letterSpacing: 0.69, lineHeight: 17.3 },
  statusKicker: { size: 11.2, weight: 700, color: 'textSlateMuted', letterSpacing: 0.9, lineHeight: 13.44, uppercase: true },
  statusValue: { size: 16.8, weight: 800, color: 'textSlate', lineHeight: 21.84 },
  statusEta: { size: 13.12, weight: 600, color: 'primary', lineHeight: 17.06 },
  mapTitle: { size: 12.48, weight: 700, color: 'slate600', letterSpacing: 0.75, lineHeight: 18.7, uppercase: true },
  mapBadge: { size: 11.52, weight: 700, color: 'primary', lineHeight: 17.3 },
  trackingCardTitle: { size: 15.2, weight: 600, color: 'cardTitle', lineHeight: 23.6 },
  trackingCardSub: { size: 12.8, weight: 400, color: 'textMuted', lineHeight: 19.8 },
  trackingCount: { size: 12, weight: 600, color: 'textSlateMuted', lineHeight: 18.6 },
  trackingOverline: { size: 10.4, weight: 700, color: 'textSlateMuted', letterSpacing: 1.04, lineHeight: 16.1, uppercase: true },
  trackingAddress: { size: 14.4, weight: 600, color: 'textSlate', lineHeight: 20.88 },
  chipLabel: { size: 12.48, weight: 600, color: 'text', lineHeight: 18.7 },
  chipLabelLive: { size: 12.48, weight: 600, color: 'white', lineHeight: 18.7 },
  outlinedError: { size: 14, weight: 700, color: 'error', lineHeight: 24.5 },
  outlinedErrorDisabled: { size: 14, weight: 700, color: 'disabledText', lineHeight: 24.5 },
  summaryPill: { size: 11.52, weight: 700, color: 'primaryDark', lineHeight: 17.3 },
  summaryItems: { size: 13.12, weight: 700, color: 'text', lineHeight: 15.74 },
  summaryQty: { size: 11.52, weight: 400, color: 'textSlateMuted', lineHeight: 13.82 },
  summaryMore: { size: 11.2, weight: 700, color: 'slate600', lineHeight: 17.4 },
  openSummary: { size: 12, weight: 700, color: 'white', lineHeight: 18.6 },
  tapForBill: { size: 11.2, weight: 400, color: 'dialogClose', lineHeight: 17.4 },
  stepsTitle: { size: 15.2, weight: 700, color: 'cardTitle', lineHeight: 23.6 },
  stepsCaption: { size: 12, weight: 400, color: 'textSlateMuted', letterSpacing: 0.4, lineHeight: 15.6 },
  stepDot: { size: 11.52, weight: 700, color: 'white', lineHeight: 13.8 },
  stepLabel: { size: 9.92, weight: 600, color: 'textMuted', lineHeight: 11.9 },
  stepLabelDone: { size: 9.92, weight: 600, color: 'textBody', lineHeight: 11.9 },
  stepLabelCurrent: { size: 9.92, weight: 700, color: 'textBody', lineHeight: 11.9 },
  supportNumber: { size: 17.6, weight: 800, color: 'text', letterSpacing: 0.4, lineHeight: 27.3 },
  muiTextButton: { size: 14, weight: 700, color: 'brightGreen', lineHeight: 24.5 },

  // Bottom dock (iteration 2)
  dockItems: { size: 14, weight: 700, color: 'white', lineHeight: 18 },
  dockTotal: { size: 13, weight: 600, color: 'white', lineHeight: 17 },
  dockAction: { size: 15, weight: 700, color: 'white', lineHeight: 20 },
  dockEta: { size: 14, weight: 700, color: 'text', lineHeight: 18 },
  dockOtp: { size: 12, weight: 500, color: 'textSlateMuted', lineHeight: 16 },
  dockOtpValue: { size: 12, weight: 800, color: 'otpValue', letterSpacing: 0.6, lineHeight: 16 },
  dockTrack: { size: 14, weight: 700, color: 'primary', lineHeight: 18 },

  // Home offer banners (iteration 2)
  bannerKicker: { size: 11, weight: 800, color: 'white', letterSpacing: 0.8, lineHeight: 14, uppercase: true },
  bannerTitle: { size: 26, weight: 800, color: 'white', letterSpacing: -0.5, lineHeight: 30 },
  bannerSub: { size: 13.5, weight: 500, color: 'white', lineHeight: 18 },
  // Pop-ups (iteration 2)
  dialogCount: { size: 11, weight: 800, color: 'white', lineHeight: 14 },
  bannerCta: { size: 13.5, weight: 800, color: 'bannerCtaText', lineHeight: 18 },

  // Floating tracking card
  floatTitle: { size: 14.4, weight: 700, color: 'white', lineHeight: 22.3 },
  floatSub: { size: 10.88, weight: 400, color: 'white', lineHeight: 13.06 },
  floatOtpLabel: { size: 9.6, weight: 600, color: 'white', lineHeight: 11.6 },
  floatOtpValue: { size: 11.52, weight: 800, color: 'otpValue', letterSpacing: 0.69, lineHeight: 17.3 },

  // My Orders and order details
  orderStatus: { size: 16, weight: 700, color: 'text', lineHeight: 24.8 },
  orderMeta: { size: 14, weight: 400, color: 'textSlateMuted', lineHeight: 21.7 },
  filterButton: { size: 13, weight: 700, color: 'white', lineHeight: 22.75 },
  filterButtonIdle: { size: 13, weight: 700, color: 'brightGreen', lineHeight: 22.75 },
  orderAction: { size: 14, weight: 700, color: 'primary', lineHeight: 24.5 },
  orderActionDisabled: { size: 14, weight: 700, color: 'disabledText', lineHeight: 24.5 },
  orderActionContained: { size: 14, weight: 700, color: 'white', lineHeight: 24.5 },
  detailsKicker: { size: 12.8, weight: 700, color: 'heroKicker', lineHeight: 19.84, uppercase: true },
  detailsId: { size: 18.88, weight: 700, color: 'heroEta', lineHeight: 29.26 },
  detailsPlaced: { size: 16, weight: 400, color: 'muiSuccess', lineHeight: 24.8 },
  detailsFailed: { size: 16, weight: 400, color: 'error', lineHeight: 24.8 },
  billDiscount: { size: 16, weight: 700, color: 'cssGreen', lineHeight: 24.8 },
  billCoupon: { size: 16, weight: 700, color: 'cssRed', lineHeight: 24.8 },
  alertInfoBody: { size: 14, weight: 400, color: 'alertInfoText', lineHeight: 21 },
  alertInfoStrong: { size: 14, weight: 700, color: 'alertInfoText', lineHeight: 21 },
  noImage: { size: 12, weight: 400, color: 'text', lineHeight: 18.6 },
  reorderAdded: { size: 14, weight: 600, color: 'reorderGreen', lineHeight: 21 },
  muiBody2Semi: { size: 14, weight: 600, color: 'text', lineHeight: 21 },

  // Store-closed sign (littlekart.com lk-store-closed-tag, phone layout)
  closedSorry: { size: 24, weight: 700, color: 'white', lineHeight: 30, script: true },
  closedWere: { size: 15, weight: 600, color: 'white', letterSpacing: 0.3, lineHeight: 22.5 },
  closedWord: { size: 24.8, weight: 800, color: 'white', letterSpacing: 1.984, lineHeight: 37.2, uppercase: true },
  closedBack: { size: 13, weight: 600, color: 'white', letterSpacing: 0.325, lineHeight: 17.55 },
  storeClosedTitle: { size: 14, weight: 700, color: 'alertWarningText', lineHeight: 21 },
  storeClosedBody: { size: 14, weight: 400, color: 'alertWarningText', lineHeight: 21 },

  // Generic
  body: { size: 16, weight: 400, color: 'text', lineHeight: 24 },
  bodyMuted: { size: 14, weight: 400, color: 'textMuted', lineHeight: 21 },
} satisfies Record<string, TextVariant>;

export type TextVariantName = keyof typeof textVariants;
