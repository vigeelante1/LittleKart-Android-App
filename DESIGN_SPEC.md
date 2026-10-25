# LittleKart live Android app — Design spec (reverse-engineered from 10 screenshots)

**Assignment:** rebuild the live LittleKart Android app so it looks and behaves the same. No redesign, no "improvements".
Source: two batches.
- **Batch 1:** 10 phone screenshots (`reference/screens/`). All colors and measurements come from these.
- **Batch 2:** 17 WhatsApp photos of a phone screen showing the live app (`reference/photos/`, numbers 01 to 17), plus 3 later images (numbers 18 to 20). They are photos (glare, tilt, washed-out whites), so **do not take colors or exact sizes from them**. They are used only for extra screens, copy and behavior (sections S9 to S18).

## 0. Read this first: how the numbers were obtained
- The original screenshots were captured with a uniform dim (about 30% black). Pure white showed as `#B2B2B2`. I divided every pixel by 178/255 to restore the true colors. The restored files are in `reference/screens/`. **Use the restored files as the visual reference, not the original PDF.**
- Colors are measured from flat fills and are accurate to about ±2 per channel (JPEG noise). Text colors are measured from anti-aliased pixels, so they are slightly less certain (marked ≈).
- Screenshots are **1080×2400 px**. The phone's density is unknown. **All sizes below are in px at 1080 px width.** In code, do not convert to dp by guessing. Use one helper so everything scales with the screen:
  `const u = Dimensions.get('window').width / 1080;  // size = px * u`
  Font sizes are the same: `fontSize = px * u`. Once the app runs, compare side by side with a screenshot from the same phone and adjust one global scale if everything is a few percent off.
- Sizes marked ≈ are estimates (±10%). Verify them in the side-by-side comparison.

## 1. Colors (restored, true values)

### Brand and actions
| Token | Hex | Where it is used |
|---|---|---|
| `green` (primary) | `#0B8220` | Proceed To Pay button, cart stepper, price chips, section accent bars, category-selected underline, ADD outline/text, bill icons |
| `greenLogin` | `#01A42A` | Login screen "Continue" button only. It is clearly brighter than `green`. Keep both. |
| `greenPlus` | `#4CAF50` (measured `#4AAF51`) | The "+" add button on home deal cards |
| `greenText` | `#2E7D32` (measured `#2D7B33`) | "View all >", "Change" (≈ `#039F27`, brighter, check), ADD label |
| `greenDark` | `#046C1A` ≈ | Cart item prices (₹164), MRP savings, ₹20 OFF text |
| `greenSection` | `#123018` ≈ | Big section titles on home ("Pooja & Flowers" …) very dark green |
| `orange` | `#F97316` (measured `#FA7216`) | "Custom" tip chip, address label "SV" (≈ `#E17521`), Items Total price (≈ `#E5481A`) |
| `red` | `#D22F2F` | Clear Cart button, "Remove" text (≈ `#C32727`) |
| `crimson` | `#CE1642` | "% OFF" text on home deal cards |
| `badgeRed` | `#EF233C` | "New" badges |
| `badgeBlue` | `#367AF2` | "xx% OFF" ribbon on "Often bought together" cards (white text, zig-zag bottom edge) |
| `amber` | `#D8961B` | Border around the saved-cart dialog (see open questions) |
| `link` | `#2163BD` ≈ | Terms & Conditions / Privacy Policy links (underlined) |

### Surfaces
| Token | Hex | Where |
|---|---|---|
| `headerBlue` | `#CCECFF` (very subtle gradient `#D5EFFD` top → `#C8E9FD` bottom) | Home header block |
| `searchFill` | `#F6F6F6` | Search pill |
| `homeBg` | `#FFFAF3` | Home page background (warm cream) |
| `screenBg` | `#F6F7FA` | Cart / bill screens background (cool light grey) |
| `card` | `#FFFFFF` | Cards, bottom sheet, strips |
| `selectedTile` | `#ECF2F6` | Selected category tile in the top strip |
| `etaChip` | `#F4EFDF` (text `#6F4B03` ≈) | "15 MINS" / "30 MINS" chips |
| `ringGreen` | `#B6CEAE` ≈ | Thin green ring around the "Food & Meat" icon (artwork, not UI) |

### Text
| Token | Hex | Where |
|---|---|---|
| `text` | `#0F172A` (measured `#0A0E1A`–`#0F151B`) | Titles, product names, prices |
| `textSecondary` | `#64748B` (measured `#636F7B`) | Weights/units, addresses, dialog body, Skip |
| `textTile` | `#3F3F46` (measured `#3F3F39`) | Home grid tile labels |
| `catLabel` | `#334155` ≈ (selected: `#0F172A`) | Top category strip labels |
| `headerHeadline` | `#0C4A6E` (measured `#0F4569`) | "Delivery in about 15 minutes", "Login" |
| `headerGreeting` | `#456F8D` ≈ | "Good afternoon" |
| `searchPlaceholder` | `#57758D` ≈ | Rolling placeholder in the home search |
| `mrpStrike` | `#96969E` ≈ (cart: `#757575`) | Struck-through MRP |
| `placeholderLogin` | `#999999` | "Mobile Number" placeholder; "+91" `#6F6F6F` |
| `onGreen` | `#FFFFFF` | Text on green/red buttons and chips |

### Logo
- Wordmark "littlekart": "little" green ≈ `#03903F`, "kart" orange ≈ `#F8930F`. Tagline "Fresh & Fast" brown ≈ `#9F754B`.
- It is artwork (rounded geometric lowercase letters), not typed text. **Get the logo as SVG/PNG from the founder.** Do not retype it in a font.

## 2. Typography
- **UI font: Inter.** All Latin text, digits and the ₹ symbol are Inter (identified from letterforms: "Proceed To Pay", "Bill Details", "Limited Time Deals", "Continue"). Load with `@expo-google-fonts/inter`, weights 400, 500, 600, 700, 800.
- **Telugu text:** rendered with the Android system Telugu font (Noto Sans Telugu look), bold weight in product names. Leave it to the OS fallback. Do not set Inter on Telugu characters.
- **Logo tagline "Fresh & Fast":** looks like Roboto Bold, but it is part of the logo artwork.
- Emoji are used in copy (🔥 after "Limited Time Deals") and render as the system emoji.
- No other font is used anywhere in the app.

### Approximate type scale (px at 1080 width; size ≈ cap height ÷ 0.727)
| Element | Size ≈ | Weight | Color |
|---|---|---|---|
| Home section title ("Pooja & Flowers") | 80 | 800 | `greenSection` |
| Cart screen title ("My Cart"), Chicken screen title | 62 | 700 | `text` |
| Header headline "Delivery in about 15 minutes" | 58 | 700 | `headerHeadline` |
| Top category label | 56 | 400 (selected 500) | `catLabel` |
| "Proceed To Pay" | 55 | 600 | white |
| "Limited Time Deals", "Often bought together", "Bill Details", dialog title | 52 | 700 | `text` |
| Login "Continue" | 52 | 600 | white |
| Search placeholder | 50 | 400 | `searchPlaceholder` |
| "View all >" | 46 | 600 | `greenText` |
| Cart item name | 47 | 700 | `text` |
| "Good afternoon" | 42 | 500 | `headerGreeting` |
| Product name on cards | 42 | 700 | `text` |
| Weights/units, "Wt: 500g", addresses | 40 | 400 | `textSecondary` |
| Home tile labels | 38 | 400 | `textTile` |
| "% OFF" on cards | 38 | 700 | `crimson` |
| ADD label | 48 | 600 | `greenText` |

## 3. Shape and spacing (px at 1080 width)
- Side margin: about 40 on cart/bill screens, about 55 on home (accent bar starts at x≈55). Login content inset 73 each side.
- Header block (light blue) starts under the status bar at y=115 and is about 382 tall including greeting and search. Search pill ≈ 929×100, fully rounded, 76 from the left edge.
- Home section accent bar: green, 9 wide × 59 tall, directly left of the section title.
- Selected category: tinted rounded tile (`#ECF2F6`, radius ≈ 40) plus a green underline 133×6 under the label.
- Cards: white, radius ≈ 40, hairline border `#EDEDED` ≈ and a very soft shadow (blur ≈ 20, opacity ≈ 8%). Bottom "Delivering to" sheet: white, rounded top corners ≈ 50, soft shadow upward.
- Buttons: "Proceed To Pay" ≈ 741×124, radius ≈ 36. Login Continue ≈ 934×148, radius ≈ 36. Clear Cart ≈ 366×91. Cart stepper ≈ 202×76, pill. Small ADD buttons ≈ 280×100 outline 3px, radius ≈ 24. "+" on deal cards ≈ 104×104, radius ≈ 22, overlaps the card's bottom-right edge.
- Chips: fully rounded; price chip is a green rectangle with radius ≈ 12 and white bold text; ETA chip is beige with a clock icon.
- Icons: filled/rounded Material-style icons for search, mic, cart, close, user; thin line icons (Lucide/Feather look) in the bill rows (shopping bag, tag, truck, store, banknote, info circle).

## 4. Screens seen (10 screenshots)

### S1 Login — `08-login.jpg`
White background. "Skip" top-right (Inter 600, `textSecondary`). Centered logo + tagline. Phone input: border `#C9C9C9` ≈ 2px, radius ≈ 14, "+91" then placeholder "Mobile Number". Green "Continue" button (`greenLogin`) directly under it. Large grocery-cart illustration near the bottom (artwork, get from founder). Footer: "By continuing, you agree to our **Terms & Conditions** and **Privacy Policy**." (links blue, underlined). The OTP screen was not captured.

### S2 Home top — `10-home-top.jpg`
Light-blue header: sun icon + "Good afternoon" (greeting changes with time of day), bold headline "Delivery in about 15 minutes" (wraps to two lines), **"Login"** text button at top-right when logged out. When logged in a round profile icon button appears instead (see S4). Search pill with search icon, rolling placeholder text (animated vertical slide through: Search "Milk", "Shampoo", "IceCream", "Rice") and a mic icon.
Under the header a white sticky strip with horizontally scrolling categories: Pooja & Flowers (has a "New" badge), Food & Meat, Groceries & Kitchen, Snacks & Drinks, more off-screen. Each item: rounded-square image ≈ 140 px, label below in two lines. Active one has the tinted tile and green underline and follows the scroll position of the page below.
Then a banner carousel on the cream background: centered banner with the neighbors peeking from both sides (promo artwork). Below: "Limited Time Deals 🔥" with "View all >" on the right.

### S3 Home deals — `09-deals.jpg`
Product cards in a horizontally scrolling grid of two rows. Card: white, radius ≈ 40, large product image, name in one line with ellipsis (Telugu | English), unit, "10% OFF" in crimson bold, price in bold with struck-through MRP, and the green "+" button (`greenPlus`) at the bottom-right edge. Names mix languages: `చిక్కుడు | Chikkudu`, `అల్లం | Allam | अदरक | Ginger` (Telugu | English | Hindi | English).

### S4 Home category sections — `07-home-sections-1.jpg`, `01-home-sections-2.jpg`
Vertical sections, each with a green accent bar and a big dark-green title, followed by a grid of 4 tiles per row (white rounded squares ≈ 270×270 with the image filling the tile, label under it, 2-line max). Some tiles have a red "New" badge on the top-right.
- Pooja & Flowers: Flowers, Pooja Store
- Food & Meat: Fresh Meat & Fish, Resturants *(sic, spelled this way in the live app)*, Sweets, Homemade Batters (New), Home Made Snacks & Pickles (New)
- Stationery & Sports: Stationery, Print Zone, Sports, Tissues & Disposable, Electronics, Decoration Kits & Items, Crackers
- Health & Wellness: Cold Cough & …, First aid, Gut Care, Hand wash & …
The top strip highlights the section currently in view (Snacks & Drinks highlighted while scrolled).
Note: the dark pill "Calls and notifications will vibrate" in `01-home-sections-2.jpg` is an Android system toast. Do not build it.

### S5 Saved-cart dialog — `02-saved-cart-dialog.jpg`
Shown on opening the app when a cart exists. Header now shows a round profile button (logged in). Centered white dialog, radius ≈ 40, amber border, close "X" top-right, large green cart icon, title **"You have a saved existing cart"** (700, ≈ 56), body "You have 5 items in your saved cart. What would you like to do?" (`textSecondary`). Two buttons side by side: outlined green **"Goto Cart"** with cart icon, red filled **"Clear Cart"** with trash icon (red button has a soft shadow). Background is dimmed.

### S6 Category product list (Chicken) — `06-category-chicken-variants.jpg`
Top row: pill "‹ Back" button (white, hairline border) + title "Chicken". Left rail (≈ 180 wide) of sub-categories with circular images and labels (Chicken selected with grey tile, Mutton, …). Right side: search bar "Search in Chicken…" with mic, a row of chips "Filters ⌄", "Sort ⌄", "Price …" (scrolls horizontally), then a 2-column product grid. Cards show the ETA chip ("30 MINS"), green price chip, name, unit and "(2 options)" when there are variants. Tapping ADD on a product with options opens a **centered dialog**: product title, X close, one row per option (small image, size "1kg" / "500g", green price chip, outlined ADD).

### S7 Cart — `04-cart.jpg`, `03-cart-often-bought.jpg`
Top: "‹ Back" pill + "My Cart". One white card per item: thumbnail (rounded square, hairline border), bold name (up to 2 lines, ellipsis), "Wt: 500g", optional struck "M.R.P.₹120", price in dark green bold. Right side: green pill stepper "− 1 +" with white icons, red "Remove" text under it.
Then a white card "Often bought together": 3-column product grid. Each card: blue ribbon "29% OFF" top-left with zig-zag bottom edge, image, beige "⏱ 15 MINS" chip, green price chip with struck MRP beside it, "₹20 OFF" in green, name (2 lines), unit, a hairline divider, outlined **ADD** button.
Sticky bottom sheet: **"Delivering to : <label>"** (label in orange, bold) with **"Change"** in green on the right, address line below in grey (single line, ellipsis), then "Pay" small grey label over "₹ 404" bold, and the green **"Proceed To Pay"** button.

### S8 Bill — `05-bill-tip.jpg`
Card: green tag icon tile + **"View Coupons & Offers"** / "Unlock best savings on this order" (green-grey) + chevron.
Card "Bill Details" with a divider, rows with a green line icon, label, value right-aligned:
- Items Total — struck `M.R.P.₹444` then orange **₹364**
- MRP Savings — green `- ₹80`
- Delivery Fee (info icon) — ₹30
- Platform Fee (info icon) — ₹10
- divider, then **Grand Total** (bold, banknote icon) — **₹404**
(Check: 364 + 30 + 10 = 404. MRP 444 − selling 364 = savings 80.)
Card "Tip to your delivery partner": centered bold title, italic quote *"Your small gesture makes a big difference for those who deliver happiness to your door."*, four pill chips ₹10, ₹20, ₹30, Custom (Custom shown filled orange with white text). Then a "Cancellation Policy" card (centered bold title; content not captured).

## 4b. More screens (from the batch 2 photos)

### S9 Login, OTP step
Same page as S1 (Skip, logo, tagline, cart illustration, Terms/Privacy footer). The phone field is replaced by:
- Bold title **"Verify your number"**
- Subtext "Enter the 4-digit OTP sent to +91 XXXXXXXXXX" (centered, grey)
- **4 separate square boxes** (not 6): white, thin grey border, small radius, about 150 px square with gaps
- Grey text "Resend OTP in 0:56" (countdown)
No Continue button is visible on this step. Verification probably happens when the 4th digit is entered. **OTP length is 4 digits.**

### S10 Login success dialog
Centered white dialog over the dimmed login page: solid green circle with a white check, **"Logged in successfully!"** (green, bold) and **"Taking you to your account..."** (grey). No buttons. It disappears by itself. The saved-cart dialog (S5) is already visible behind it.

### S11 Home with floating cart pill
- The header headline is dynamic: **"Delivery in about 35 minutes"** here, **"about 15 minutes"** in batch 1. The number comes from the server.
- Search placeholder rolls through more words: "Milk", "Shampoo", "IceCream", "Rice", "Mango".
- Banner carousel images seen: *Fresh Meat Now! 15 minutes delivery* (Fish / Mutton / Chicken tags), *Fresh Flowers Now!*, *Sweets Now!* (with "Download littlekart" Google Play / App Store badges), *Refer a Friend, get ₹50 cashback*. Banners are plain images, about 5:7 portrait, centered with neighbors peeking, rounded corners.
- **Floating "View Cart" pill** (shown on home and category screens when the cart has items): dark green (`green`), fully rounded, floats above the bottom edge and is horizontally centered, about 1/3 of the screen wide. Left: a white capsule with 3 small overlapping product thumbnails of the items in the cart. Text on the right wraps into staggered lines: "View", "Cart", "3 items", with a white chevron ">" at the far right. This wrapping looks like a layout quirk of the live app. Replicate as seen, and confirm with the founder.
- Not shown on cart, bill, profile or search screens.

### S12 Change Location dialog (shown over Home in the photo; the trigger is not captured, the cart bar's "Change" opens it too) — `04-change-location-dialog.jpg`
Centered white dialog, radius ≈ 40, title **"Change Location"** (700) with X at top-right. Green button with a crosshair icon: **"Use Current Location"**. Text "OR". Input with border, placeholder **"Search delivery location"**. Bottom row: **"Saved Addresses"** (left, bold) and green **"+ Add New Address"** (right, wraps to 2 lines). The saved addresses list is empty or hidden in this capture.

### S13 Search screen
Opens from the home search bar. Top: "‹ Back" pill + search field with placeholder **"Search for products"** and mic icon, keyboard open automatically (autofocus). Results state not captured.

### S14 Category screen, second example: Books & Charts
Same layout as S6: "‹ Back" pill + title "Books & Charts", left rail of sub-categories with circular images: **Books & Charts** (selected, grey tile), **Pens & Pencils**, **Stationary Items** *(sic)*, **Toys**, **Umbrella's & Raincoat's** *(sic)*, **Gift Wrap**, **Lunch & Hydration**. Search "Search in Books & Ch…", chips Filters / Sort / Price. 2-column grid. In this grid each card has a **blue ribbon "6% OFF"** at the top-left of the image (same as "Often bought together"), then the "⏱ 15 MINS" chip, green price chip with struck MRP (₹45 ₹48), "₹3 OFF" in green, name (2 lines, ellipsis), grey subtitle/unit, outlined **ADD**. Products with no weight show "1 U" or "1".
Note: home deal cards (S3) show "% OFF" in crimson text instead, while list/grid cards use the blue ribbon.

### S15 Profile (account) screen
"‹ Back" pill, centered title **"Profile"** (700). User card: round avatar (blue person icon on a light-blue circle) with the **name** (e.g. "SV") and **phone number** (+91…). Section label **ACCOUNT** (small, grey, uppercase, letter-spaced). White grouped card with rows, each: colored rounded-square icon tile, label, grey chevron, thin dividers:
1. **Orders** (green bag icon)
2. **Saved Addresses** (blue location pin)
3. **E-gift Cards** (orange gift)
4. **Refer a Friend** (purple user-plus)
5. **Account Privacy** (red lock)
6. **Help** (teal question circle)
Section label **MORE**, second card: **About Us** (blue info), **Rate the App** (orange star), **Share the App** (blue share icon).
Bottom: **Logout** button, white, thin red-tinted border, red text with a logout icon. The page scrolls.

### S16 Bill screen additions
- **Cancellation Policy** card text: "Once an order has been packed for delivery, it cannot be cancelled. In case of unforeseen delays, eligible refunds will be processed as per our refund policy." (centered, grey, with bold centered title)
- The bottom bar and Custom tip chip match batch 1.

### S17 Cart "Often bought together" (photo)
Same as S7. Product data differs between sessions (different eggs and prices), so it comes from a live recommendations API.

### S18 Saved-cart dialog during login
After a successful login the saved-cart dialog (S5) appears on top of the login/home transition.

### S19 Apply Coupons (opened from "View Coupons & Offers" in the cart) — `18-apply-coupons.png`
Tall white dialog/sheet over the cart, radius ≈ 40, scrollable.
- Header: green tag icon in a light-green rounded tile, title **"Apply Coupons"** (700), X at the right, thin divider below.
- Input row: rounded field with a search icon and placeholder "Enter coupon code" (truncated in the capture) next to a **"Apply"** button. The Apply button is **grey and disabled** while the field is empty (it turns green when enabled, assumed).
- Section title **"Available Coupons"** (700).
- Info text (grey): "No coupons can be applied on the current eligible items. Exempt categories (like meat) do not count toward the coupon minimum." (shown when nothing is applicable).
- Coupon cards (light grey = not yet usable): left accent bar, code in a small chip with a **dashed border** (monospace-looking caps, e.g. `FESTIVE50`), title "Rs 50 Limited Offer" (700), and the hint "Add non-exempt products worth Rs 550 more to apply".
  - FESTIVE50 — Rs 50 Limited Offer — 550 more
  - FESTIVE100 — Rs 100 Limited Offer — 1300 more
  - FESTIVE150 — Rs 150 Limited Offer — 1800 more
  - FESTIVE200 — (cut off, same pattern)
- Rules visible here: each coupon has a minimum order value; **exempt categories (meat) do not count toward the minimum**; the card shows how much more non-exempt shopping is needed. The "applied" state and the "applicable" (green) card style were **not captured**.
- Note the copy writes the currency as "Rs", while the rest of the app uses "₹".

### S20 Add New Address — `20-add-address-web.png`
This capture is a **wide (desktop/web) layout**: map on the left, form on the right. The phone layout was **not captured** (assume map on top, form below; confirm).
- **Map** (Google Maps, labels follow the map's language): search field **"Search for a location"** at the top; a red pin in the center with a dark tooltip **"Your order will be delivered here"**; a white button with a crosshair icon **"Use Current Location"** (green text, thin green outline) at the bottom-left; the user drags the pin to adjust.
- **Bottom info bar** over the map: "Delivering your order to:" then a red pin icon with red text **"GPS is ~106m approximate — drag the pin to your exact doorstep, then confirm."** (the number is the GPS accuracy).
- **Form:** title **"Add New Address"** (700). Label **"Save address as *"** with four pill chips with icons: **Home** (house), **Work** (briefcase), **Hotel** (building), **Other** (pin). Then a read-only grey field holding the selected address text from the map, then outlined fields with floating labels:
  - **"House No / Flat No / Building Name \* \*"** (the live app shows two asterisks)
  - **"Nearby Landmark (optional)"**
  - **"Name \* \*"** (floating label sits on the border when focused; focused border is dark/black, 1–2 px)
  - **"Phone Number \* \*"**
- Buttons at the bottom: **"Cancel"** (grey fill, dark text) on the left, **"Save"** (green fill, white text) on the right.
- Fields are rectangular with a small radius (≈ 8 px at this web scale) and a thin grey border.

### Cart item order (from `19-cart-photo-2.png`)
The same three items appear in a different order than in batch 1 (Allam, Keera Dosakaya, Chicken, versus Chicken, Keera Dosakaya, Allam). Assume **most recently added first**. Confirm with the founder.

## 4c. Language of the app
All interface text (buttons, titles, labels, messages) is **English**. Telugu appears only inside product names (`Telugu | English | Hindi | English`). No language switch was seen in the Profile screen. Do **not** build a Telugu UI or a language toggle.

## 5. Behaviors implied by the screenshots
- Guests can browse (Skip on login; "Login" button on home). Logged-in users get a profile button.
- Cart persists across sessions and the app asks what to do on launch (saved-cart dialog).
- Delivery estimate is per product ("15 MINS", "30 MINS"), and the header says "Delivery in about 15 minutes".
- Prices: selling price + struck MRP + % OFF (+ "₹X OFF" in some cards). Fees: delivery fee ₹30, platform fee ₹10 (rules for free delivery unknown).
- Products can have several weight options; the picker opens in a dialog.
- Product names are multi-language strings joined by " | " (Telugu | English | Hindi | English).
- Delivery address has a label (e.g. a name or tag shown in orange) and a free-text line.
- Login is phone number + **4-digit OTP**, with a 60-second resend countdown. Skip is allowed.
- The headline delivery time is dynamic (15 or 35 minutes seen).
- Home search placeholder cycles through example products.
- The address on the cart/bill bar opens a Change Location dialog (current location, search, saved addresses, add new).
- Profile has Orders, Saved Addresses, E-gift Cards, Refer a Friend (₹50 cashback banner), Account Privacy, Help, About Us, Rate the App, Share the App, Logout.
- Cart pill appears on browsing screens while the cart has items.

## 6. Not captured yet (need screenshots or the founder)
Mobile layout of Add New Address, saved-addresses list, coupon applied state and applicable-coupon card style, search results (typing state), product detail page, Orders list and order detail/tracking, payment screen and order success, E-gift Cards, Refer a Friend, Account Privacy, Help, About Us pages, empty cart, empty search, "View all" list for deals, Filters / Sort / Price sheets, the remaining home sections (Groceries & Kitchen, Snacks & Drinks), delivery/platform fee info popups, Terms/Privacy pages, splash screen and app icon, notification permission and location permission prompts.

## 7. Assets to request from the founder (cannot be recreated from screenshots)
- Logo (SVG or PNG), app icon, login illustration, empty-state illustrations.
- Category icons/images, banner images, product images (or the API that serves them).
- Confirmation of Inter + exact weights, the green values above, and any design tokens or Figma file.
- API documentation or access to the backend that the live app uses. (The "no change" requirement implies the same data.)

## 8. Open questions
1. The amber border around the saved-cart dialog: intentional design or an Android accessibility/focus ring that appeared in the capture? Confirm on the phone.
2. Why the login "Continue" green (`#01A42A`) differs from the app's primary green (`#0B8220`): intentional or a different screen version?
3. The spelling "Resturants" in the live app: replicate exactly or fix? (Default: replicate.)
4. Screenshot dim: please retake screenshots without the dim if possible, so colors can be confirmed directly.
