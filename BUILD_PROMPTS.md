# LittleKart Android — Build prompts (exact replica of the captured screens)

How to use: give Claude Code **one prompt at a time**. After each one: test on your phone, compare with the reference image named in the prompt, tell Claude Code what differs, then commit and `/clear` before the next prompt.
All prompts assume `CLAUDE.md`, `LITTLEKART_CONTEXT.md`, `DESIGN_SPEC.md`, `ARCHITECTURE.md` and the `reference/` folder are in the project root.

---

## Setup (once, on your Windows PC)
```bash
npx create-expo-app@latest littlekart-app --template blank-typescript
cd littlekart-app
git init
npx expo install expo-router react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated @react-native-async-storage/async-storage expo-font expo-image expo-linear-gradient expo-location react-native-svg @expo-google-fonts/inter lucide-react-native @expo/vector-icons zustand
npx eas-cli login
```
1. Unzip the reference pack **into the project root** (the `littlekart-app` folder). It already contains `CLAUDE.md`, `LITTLEKART_CONTEXT.md`, `DESIGN_SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md` and the `reference/screens/` and `reference/photos/` folders in the right places.
2. Install **Expo Go** on your Android phone. Run `npx expo start`, scan the QR code (same Wi-Fi; if it fails use `npx expo start --tunnel`).
3. Open the folder in Claude Code.

---

## M0. Read everything and report (no code)
```
Read CLAUDE.md, LITTLEKART_CONTEXT.md, DESIGN_SPEC.md and ARCHITECTURE.md fully. Then open and look at every image in reference/screens/ and reference/photos/.
Do not write any code yet. Reply with:
1. A list of every screen and dialog you will build, each mapped to the reference images that show it.
2. Anything in the spec that is ambiguous or contradicts an image (quote the spec section).
3. The list of assets you will need as placeholders (file names).
4. Your proposed order of work (it should match BUILD_PROMPTS.md).
Keep it to one page.
```

## M1. Foundation
```
Set up the foundation exactly as described in CLAUDE.md and ARCHITECTURE.md:
- Folder structure from ARCHITECTURE.md section 1 (empty screens are fine).
- src/theme: colors.ts with every token from DESIGN_SPEC.md section 1 (use the exact hex values), scale.ts with `u(px)` = px * windowWidth / 1080, typography.ts with the type scale from section 2, spacing.ts.
- Load Inter 400/500/600/700/800 in _layout.tsx and keep the splash screen until fonts are ready.
- AppText component (allowFontScaling false) with variants from the type scale.
- Components: Button (green, red, outline variants), PillBack ("‹ Back" pill), Chip, PriceChip (green rectangle with white bold price), EtaChip (beige with clock icon), OffRibbon (blue ribbon with zig-zag bottom edge), QuantityStepper (green pill "− 1 +"), AddButton (outlined green ADD), PlusButton (green "+" square with rounded corners), Dialog (centered white modal with dim backdrop, optional X), ImageWithPlaceholder.
- Stores: cartStore (persisted, most recently added first), authStore, locationStore. Pure bill functions with unit tests for the worked example in ARCHITECTURE.md section 5 (364 / 444 / 80 / 30 / 10 / 404).
- Repositories and mock implementations from ARCHITECTURE.md sections 3, 4 and 6.
- A temporary dev screen at /gallery that shows every component next to its reference crop so I can compare.
Run tsc, lint and the unit tests. Tell me what to check in Expo Go.
```

## M2. Login (phone, OTP, success)
```
Build login.tsx with three steps, matching DESIGN_SPEC.md S1, S9, S10 and reference/screens/08-login.jpg, reference/photos/15-login.jpg, 16-otp.jpg, 17-login-success-dialog.jpg.
- Step 1: Skip (top right), logo, "Fresh & Fast", +91 phone field, green Continue (the brighter login green `greenLogin`), cart illustration, Terms & Conditions / Privacy Policy footer with blue underlined links. Continue is only active for a valid 10-digit number.
- Step 2: "Verify your number", subtext with the entered number, 4 OTP boxes (auto-advance, backspace goes back, paste support), "Resend OTP in 0:56" countdown that counts down and becomes tappable at 0.
- Step 3: after the 4th digit, call authRepo.verifyOtp (mock accepts 1234; show the same wrong-OTP feedback you think is minimal and tell me what you chose), then show the "Logged in successfully!" dialog for about 1.5 seconds and go to Home.
- Skip goes to Home as a guest.
Use placeholder images for the logo and illustration (src/assets/placeholders).
```

## M3. Home
```
Build the Home screen (index.tsx) matching DESIGN_SPEC.md S2, S3, S4, S5, S11, S12 and reference/screens/10-home-top.jpg, 09-deals.jpg, 07-home-sections-1.jpg, 01-home-sections-2.jpg, 02-saved-cart-dialog.jpg plus reference/photos/01, 04, 06, 07, 08, 12, 13.
- Light-blue header: sun icon, time-based greeting ("Good morning/afternoon/evening"), headline "Delivery in about {config.deliveryEtaMinutes} minutes", "Login" text button when logged out and a round profile button when logged in (profile opens /profile).
- Search pill with a vertically rolling placeholder (Search "Milk" / "Shampoo" / "IceCream" / "Rice" / "Mango", change every ~2.5 s) and mic icon; tapping opens /search.
- Sticky horizontal category strip (Pooja & Flowers with "New" badge, Food & Meat, Groceries & Kitchen, Snacks & Drinks) with selected tint + green underline. Tapping scrolls the page to that section; scrolling the page updates the selected item.
- Banner carousel (centered, neighbors peeking, snap, rounded).
- "Limited Time Deals 🔥" with "View all >" and a horizontal two-row grid of deal cards with the "+" button.
- Sections with green accent bar, dark-green title and 4-column tile grids exactly as listed in DESIGN_SPEC.md S4.
- Floating "View Cart" pill (S11) when the cart has items.
- Saved-cart dialog on app start when a cart exists (S5) with Goto Cart and Clear Cart.
- Build the Change Location dialog (S12, UI only, reference/photos/04-change-location-dialog.jpg). The photo shows it over Home, but how it is opened from Home is not captured. Do not invent a trigger on Home: wire it to the cart's "Change" link in M5 and note the open question in FIDELITY_NOTES.md.
Seed the mock cart with 5 items for testing and add a dev switch to clear it.
```

## M4. Category list, variants dialog, search
```
Build category/[id].tsx and search.tsx matching DESIGN_SPEC.md S6, S13, S14 and reference/screens/06-category-chicken-variants.jpg, reference/photos/02-category-books-charts.jpg, 03-search-keyboard.jpg.
- Back pill + title, left sub-category rail with circular images (selected = grey tile), search-in-category field with mic, Filters / Sort / Price chips (UI only, they do nothing yet), 2-column product grid with the blue OFF ribbon, EtaChip, price chip with struck MRP, "₹X OFF", name (2 lines, ellipsis), unit, ADD button.
- ADD on a product with variants opens the variant dialog (title, X, one row per option with image, size, price chip, ADD). ADD on a simple product turns into the quantity stepper.
- "(2 options)" subtitle for variant products.
- Floating View Cart pill on this screen.
- search.tsx: Back pill, search field that autofocuses with the keyboard, placeholder "Search for products", mic icon. Results are not captured: show a plain list of matching products using the same grid card, and note this in FIDELITY_NOTES.md.
```

## M5. Cart, bill, tip, coupons
```
Build cart.tsx matching DESIGN_SPEC.md S7, S8, S16, S17, S19 and reference/screens/04-cart.jpg, 03-cart-often-bought.jpg, 05-bill-tip.jpg and reference/photos/05, 09, 10, 18-apply-coupons.png, 19-cart-photo-2.png.
- Back pill + "My Cart"; one card per cart line (thumbnail, name, "Wt:", struck "M.R.P.₹", green price, green stepper, red "Remove"); most recently added first.
- "Often bought together" card with 3-column product cards (blue ribbon, EtaChip, price chip, "₹X OFF", name, unit, ADD).
- "View Coupons & Offers" card opens the Apply Coupons dialog (S19): header with tag icon + X, code input + Apply button (disabled grey when empty), "Available Coupons", the exempt-category info text, coupon cards with dashed code chip and "Add non-exempt products worth Rs N more to apply" computed from the cart using the rules in ARCHITECTURE.md section 5.
- Bill Details card with the exact rows, icons and colors from S8 (Items Total with struck MRP and orange price, MRP Savings in green, Delivery Fee ⓘ, Platform Fee ⓘ, Grand Total). The ⓘ icons do nothing yet.
- "Tip to your delivery partner" card with the italic quote and chips ₹10 / ₹20 / ₹30 / Custom (selected chip is filled orange; the tip adds to the grand total; Custom opens a simple number prompt, note your choice).
- "Cancellation Policy" card with the exact text from S16.
- Sticky bottom sheet: "Delivering to : {label}" (label orange), "Change" (opens Change Location dialog), address line (one line, ellipsis), "Pay ₹ {total}" and the green "Proceed To Pay" button (does nothing yet: show a short neutral message "Payment is not part of this build" and note it).
```

## M6. Profile
```
Build profile.tsx matching DESIGN_SPEC.md S15 and reference/photos/11-profile-top.jpg and 14-profile-bottom.jpg.
Back pill, centered "Profile" title, user card (avatar, name, phone), "ACCOUNT" label and the grouped card with rows Orders, Saved Addresses, E-gift Cards, Refer a Friend, Account Privacy, Help; "MORE" label and the card with About Us, Rate the App, Share the App; Logout button. Each row has a colored rounded-square icon tile, label and chevron. Rows open /placeholder/[title] (plain page with Back pill and the title), except Share the App (use the system share sheet) and Logout (clears auth and returns to Home after confirming, note your choice).
```

## M7. Add New Address  (map: may need a development build)
```
Build add-address.tsx matching DESIGN_SPEC.md S20 and reference/photos/20-add-address-web.png. The capture is a wide web layout, so design the phone layout as: map on top (about 45% of the height) with the search field, "Use Current Location" button, center pin with the "Your order will be delivered here" tooltip and the red GPS-accuracy line, and the form below in a scrolling card: "Add New Address", "Save address as *" chips (Home, Work, Hotel, Other with icons), read-only address text from the pin, "House No / Flat No / Building Name * *", "Nearby Landmark (optional)", "Name * *", "Phone Number * *", and Cancel / Save at the bottom. Keep every label exactly as written. Validate required fields (house, name, phone) with minimal messages and note your choices.
Use Google Maps via react-native-maps and expo-location. Check the current Expo docs: if the map does not work in Expo Go on Android, tell me and walk me through creating a development build and where to put the Google Maps API key. Reverse geocoding comes from addressRepo (mock for now).
```

## M8. Fidelity pass
```
Do a fidelity pass over every screen. For each screen: open the matching reference image, render the screen, and list every visible difference (spacing, size, weight, color, radius, shadow, text). Fix them using the spec values. Where the spec has only an estimate (marked ≈), choose the value that matches the screenshot better and write the value you chose in FIDELITY_NOTES.md so I can verify it on my phone.
Remove the temporary /gallery screen and every dev-only switch (mock cart seed, ETA switch) or move them behind a `__DEV__` check that is off in release builds.
Then check: Inter weights, all strings and typos, text truncation (ellipsis rules), safe-area insets at top and bottom, keyboard handling on login and add-address, and that nothing from CLAUDE.md "Out of scope" crept in. Run tsc, lint and the tests.
```

## M9. Build a test APK and a release build
```
Prepare EAS: eas.json with a "preview" profile that builds an installable APK and a "production" profile that builds an AAB. Set the app name "LittleKart", the Android package name placeholder in.littlekart.app (ask me for the real package name before the production build), version, icon and splash placeholders. Give me the exact commands for: `npx eas-cli build -p android --profile preview` (APK I can install on my phone) and later the production build. Do not run builds that need my login; just tell me the commands and what to expect.
```

---

## After the build works
- Compare each screen with the reference on your phone and note differences in `FIDELITY_NOTES.md`.
- Send the founder the open questions from `DESIGN_SPEC.md` section 8 and the missing-assets list (logo, illustration, banners, category and product images, API docs).
- When the API docs arrive, ask Claude Code to implement `src/services/http/*` (ARCHITECTURE.md section 7).
- Send me new screenshots (orders, payment, product page, etc.) and I will extend the spec and add milestones.
