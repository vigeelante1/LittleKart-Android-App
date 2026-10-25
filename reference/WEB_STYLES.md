# Measured styles from littlekart.com (mobile, 412 px wide)

Captured 23 Oct 2026 with the browser's computed styles at a 412×915 viewport.
CSS px on a phone-width page equal Android dp, so these numbers go into the app **as is** (see DECISIONS D-25).
Font everywhere: **Inter**. The site loads only weights 500, 600, 700, 800, so text styled 400 actually renders as Inter 500 (DECISIONS D-26).

## Global tokens (`:root` in the site's stylesheet)
| Token | Value |
|---|---|
| primary | `#0c831f` |
| primary dark | `#076317` |
| primary light | `#ebf9ee` |
| accent (orange) | `#f97316` |
| accent light | `#fff3e8` |
| info | `#2563eb` |
| text | `#1f2937` |
| text muted | `#6b7280` |
| border | `#e5e7eb` |
| app background | `#f7f8fa` |
| surface 2 | `#f8fafc` |
| error | `#dc2626` |
| warning | `#f59e0b` |
| card radius | 14 |
| shadow soft | `0 2px 10px #0f172a0f` |
| shadow raised | `0 8px 22px #0f172a14` |

## Home
- **Page background:** `#fffaf3`. Body (other screens): `#f7f8fa`.
- **Header block:** sticky, gradient 135° `#e8f6ff` 0% → `#cfeeff` 50% → `#bde3ff` 100%, bottom border 0.8 `rgba(59,130,246,0.22)`, shadow `0 4 12 rgba(15,23,42,0.06)`. Toolbar padding 0 16; inner padding 8 8 0; content padding 4 16 0.
- **Greeting** "Good afternoon": 14.4 / 600, color `#114a7a`, opacity 0.72, letter-spacing −0.072, line-height 14.4, margin-bottom 1.6.
- **Headline** "Delivery in about 15 minutes": 20.16 / 800, `#114a7a`, letter-spacing −0.4032. Sun icon 18, margin-right 6, same color.
- **Login** text button: 15.2 / 700, `#114a7a`, padding 2 4.
- **Search pill:** height 44, background `#f7f7f7`, border 0.8 `#e1e1e1`, radius 14, padding 0 12.8. Search icon 26, color `#222831`, opacity 0.95, margin-right 11.2. Placeholder text `#4f7ca1`, weight 500, rolling line height 44. Mic button 32 (icon 22, `#444444`).
- **Rolling placeholder order:** Mango, Milk, Rice, Shampoo, IceCream, Spinach (loops).
- **Category strip:** white, border 0.8 `#e5e7eb`, shadow `0 2 10 rgba(15,23,42,0.05)`, padding 9 4 11, gap 8. Item 82 wide, padding 6 4 10, radius 16. Active item background `#eef2f7`, underline 46×3 `#0c831f` radius 999 at left 18. Thumb 46×46 radius 14, background `rgba(255,255,255,0.82)` (active white), shadow `0 3 10 rgba(15,23,42,0.05)` (active `0 6 14 rgba(12,131,31,0.14)`), margin 0 14 6. Label color `#374151` (active `#222831` weight 500), two lines.
- **"New" badge:** background `#ef233c`, radius 999, padding 1 6, text 9.28 / 800 white, letter-spacing 0.0928, shadow `0 2 6 rgba(239,35,60,0.3)`.
- **Banner carousel:** margin-top 18, slide 291 wide × 355 tall (active), neighbors scaled to 255 tall, radius 9, shadow `0 8 18 rgba(15,23,42,0.12)`.
- **Deals header:** margin 28 0 16, padding 0 5.6. Title "Limited Time Deals 🔥" 16.8 / 700, letter-spacing −0.168, padding-left 11.2 (accent bar). "View all >" 14 / 600 `#2e7d32`.
- **Deal card:** 142.4 wide, white, border 0.8 `#eceff3`, radius 12, shadow `0 2 8 rgba(15,23,42,0.08)`, padding 4 6 12. Image frame ~154 tall. Name 13 / 700 one line. Weight 12 `#6b7280` margin-top 6. "% OFF" 12 / 800 `#e11d48`. Price 15 / 800; MRP 12 / 500 `#9ca3af` struck, gap 6. "+" button 34×34, `#4caf50`, radius 10, "+" 24 / 500 white, shadow `0 2 6 rgba(15,23,42,0.16)`.
- **Section title** ("Food & Meat"): 24 / 800, `#17351d`, letter-spacing −0.48; left bar 4.8 solid `#076317`, padding-left 12, margin-bottom 18. Section margin 32 0.
- **Tile grid:** 4 columns, gap 8. Tile 91×91, white, border 0.8 `#e5e7eb`, radius 12, shadow `0 6 16 rgba(120,53,15,0.08)`. Label 11.52 / 500 `#444444`, margin-top 10, centered, 2 lines.

## Category list (e.g. Chicken)
- **Header row:** white, height 58, padding 0 8, gap 10.
- **Back pill:** height 32, white, border 0.8 `#e5e7eb`, radius 999, padding 4 10, text 13.12 / 650 `#1f2937`, chevron icon 17.6.
- **Title:** 17.92 / 750, `#111827`, letter-spacing −0.358.
- **Left rail:** 77 wide, padding 6 0 10. Item padding 8 2, radius 8, gap 5, margin-bottom 6; selected background `#e5e7eb`. Image 46 circle white. Label 11.2 / 500 `#374151` (selected 700 `#111827`).
- **Search box:** height 42, background `rgba(255,255,255,0.88)`, border 0.8 `rgba(0,0,0,0.12)`, radius 10, padding 2 10. Icon 24 `#64748b`. Mic 20 `#64748b`.
- **Filter chips:** height 35.5, background `#f1f5f9`, border 0.8 `#dce3ec`, radius 10, padding 7.2 12, text 13 / 600 `#1f2937`, gap 4; row gap 6.

## Product card (grid, also "Often bought together")
- Card: white, border 0.8 `rgba(15,23,42,0.08)`, radius 10 (grid) / 14 (cart), shadow `0 8 24 rgba(15,23,42,0.08)`.
- Image section padding 10 12 2 (grid) / 8 8 0 (cart); image clip radius 8, ~126 tall.
- **OFF ribbon:** top-left, 36×28, gradient `#3b82f6` → `#2563eb`, radius 10 0 5 0, shadow `0 6 14 rgba(37,99,235,0.28)`. "32%" 8.64 / 900 white, "OFF" 7.68 / 900. Zig-zag bottom: 4 tall strip, 5 teeth.
- Content padding 6 8 (8 bottom on cart).
- **ETA chip:** height 22, background `#f7efe1`, radius 7, padding 0 5.76, text 10.56 / 800 `#7a4d03` uppercase letter-spacing 0.1056, clock icon 12.8 `#8a650f`, gap 2.88, margin-bottom 3.6.
- **Price chip:** height 21, `#0c831f`, radius 3, padding 0 5.6, text 11.84 / 800 white, shadow `0 2 6 rgba(12,131,31,0.25)`. MRP beside it 10.88 `#9ca3af` struck, gap 3.6.
- **"₹X OFF":** 10.24 / 800 `#076317`, margin-top 2.8.
- **Name:** 12.16 / 700 `#111827`, letter-spacing −0.146, 2 lines, margin-top 4.
- **Weight:** 11.52 / 500 `#6b7280`. "(2 options)" follows the weight.
- **Stock line** ("Only 9 left"): 11.2 / 600, height 20 row.
- **Bottom bar of card:** gradient fade to `#f8fafc`, top border 0.8 `rgba(15,23,42,0.06)`, padding 4 8 5.2.
- **ADD button:** 92×36 (fills narrower cards), white, border 0.8 `#279643`, radius 6, text 14.4 / 600 `#22853c` uppercase, shadow `0 2 6 rgba(15,23,42,0.07)`. With options: "ADD" 15.68 / 600 over "2 options" 12 / 600 `#64748b`.
- **Card stepper (after ADD):** 92×36, white, border 0.8 `#0c831f`, radius 20, shadow `0 6 14 rgba(1,163,42,0.14)`; − and + 34×34 icon 20 `rgba(0,0,0,0.54)`; count 14.4 / 700.

## Floating View Cart pill
- `#0c831f`, radius 30, padding 4 14, height ~60, shadow `0 4 8 rgba(0,0,0,0.15)`, centered.
- Left: white capsule (`rgba(255,255,255,0.96)`, radius 999, padding 3 6 3 3) with overlapping 26×26 circular thumbnails (white 1.6 border).
- Right: "View Cart" 16 / 500 white letter-spacing 0.16 + chevron 24; below it "N items" 16 `rgba(255,255,255,0.92)`. Two lines, not three.

## Cart
- Page padding: content 360 wide (26 side margins at 412).
- **Title "My Cart":** 21.6 / 800, letter-spacing −0.432; header margin-bottom 16.
- **Cart line:** white, border 0.8 `#e5e7eb`, radius 12, shadow `0 2 10 rgba(15,23,42,0.05)`, padding 12, gap 12. Thumb 60×60, background `#f3f4f6`, border 0.8 `#eceff3`, radius 10. Name 14.4 / 700, 2 lines. "Wt: 500g" 14 `#64748b`. Price 14 / 700 `#076317`.
- **Green stepper:** 68×26, `#0c831f`, radius 8, shadow `0 3 8 rgba(12,131,31,0.2)`; icons 15.2 white; count 12.16 / 800 white.
- **Remove:** 11 / 700 `#dc2626`, padding 2 8.
- **"Often bought together" card:** white, border 0.8 `rgba(15,23,42,0.07)`, radius 14, shadow `0 4 16 rgba(15,23,42,0.04)`, padding 10, margin-top 14. Title 20 / 800 `#0f172a` letter-spacing −0.3. Grid 3 columns, gap 8.
- **Bill Details card:** white, border 0.8 `#e5e7eb`, radius 12, padding 12 20, margin-top 15. Title 16 / 800 (bottom divider). Rows 14 / 500, margin-bottom 8; icons 16 `#076317`; info icons 20 `rgba(0,0,0,0.54)`. Items Total amount `#ff4500`. Grand Total row: top border 0.8 `#e5e7eb`, margin-top 16, padding-top 8.
- **Tip card / Cancellation Policy card:** background `#fefefe`, border 0.8 `#dddddd`, radius 8, padding 16, shadow `0 2 4 rgba(0,0,0,0.05)`, margin-bottom 16. Tip title 18 / 700; quote 13 `#6b7280`, margin-bottom 20. Chips: 4 equal, height 37, radius 999, padding 8 6, text 13 / 600, white with border `#d1d5db`, shadow `0 1 4 rgba(15,23,42,0.08)`. **"Custom" is always orange** (`#f97316`, white text, shadow `0 3 7 rgba(255,123,15,0.28)`): it is the custom-amount button, not a selected state. Policy title 20 / 600; text 14 `#64748b`.
- **Bottom bar:** background `rgba(255,255,255,0.98)`, border 0.8 `#e4e4e4`, radius 18 18 0 0, shadow `0 -8 20 rgba(0,0,0,0.08)`, padding 9.6 12 0. Button height 42, `#0c831f`, radius 12, text 700 white.
- **Guest state:** the button reads "Login to Proceed", and the coupon card and "Delivering to" row are hidden.

## Copy seen on the site that differs from the screenshots
- "Wt:500g" in the DOM but rendered "Wt: 500g" → we show "Wt: 500g".
- "1items" / "₹41OFF" in the DOM (spaces come from layout) → we show "1 item" / "₹41 OFF".

---

# M4 measurements (23 Oct 2026, from the site's code and computed styles at 412 px)

## Category screen layout
- **Header:** white, 58 tall, padding 0 8, gap 10: Back pill + title (the **selected sub-category's** name, 17.92 / 750).
- **Left rail:** column 78 wide, background `#f8fafc`, scrolls on its own. List padding 6 0 10. Item: padding 8 2, gap 5, margin-bottom 6, radius 8, 2 px transparent side borders; selected background `#e5e7eb`. Image 46 round, white. Label 11.2, line-height 1.15, padding 0 2, centered, `#374151` 500 (selected `#111827` 700).
- **Main panel:** background `#eef1f5`, padding 4 4 128 2, scrolls.
- **Search hero** (shown when the screen is opened from a Home tile): sticky at top −6, margin −6 −6 0, padding 8, gradient `#f8fafc` → `#ffffff`, border 1 `#e5e7eb`, shadow `0 6 18 rgba(15,23,42,0.05)`. Box: min-height 42, radius 10, border 1 `rgba(0,0,0,0.12)`, background `rgba(255,255,255,0.88)`, padding 2 10; search icon 24 `#64748b` margin-right 8; input 16 px, placeholder "Search in {name}..."; mic 20 `#64748b` (an × replaces it while typing).
- **Chip row wrapper:** white, sticky at top 46, padding 2 0. Row: padding 2 4, gap 6, margin-bottom 4. Chips: Filters (tune icon 17), Sort, Price; on phones Size and Brand chips are not shown.
- **Chip:** padding 7.2 12, radius 10, border 1, 13 / 600, arrow 18 at 0.75 opacity. Normal: `#f1f5f9` fill, `#dce3ec` border, `#1f2937` text, inset `0 1 0 rgba(255,255,255,0.85)`. **Active** (a sort or filter set): `#f0fdf4` fill, `#00a82d` border, `#00642e` text, inset `0 0 0 1 rgba(0,168,45,0.12)`. Sort chip then reads the chosen sort's name; Price chip reads the chosen band.
- **Grid:** 2 columns, gap 4, padding 2 (148 wide cards in the category panel, 181 in search).

## Product card (category and search grid)
- Card: white, border 1 `rgba(15,23,42,0.08)`, radius 10, shadow `0 8 24 rgba(15,23,42,0.08)`, flex column.
- Image section: padding 10 12 2, min-height 138, white, top radius 12. Image clip: 126 tall, radius 8, overflow hidden. Image: contain, 126 tall, **scaled 1.45** (zoomed in).
- Ribbon (only when there is a saving): "{N}%" (or "₹{saving}" when the percent rounds to 0) over "OFF".
- Content: padding 4 8 2.8; inner block min-height 104.
  - ETA chip (margin-bottom 3.6), price chip + struck MRP (gap 3.6), "₹X OFF" (10.24 / 800 `#076317`, margin-top 2.8, only with a saving).
  - Name: 12.16 / 650 (drawn 700), line-height 1.16, **always 2 lines tall** (min/max 2.4em), margin-top 3.6, letter-spacing −0.012em.
  - Weight row: min-height 16, margin-top 1.2, gap 4; label 11.52 / 500 `#6b7280` (max 68% wide with options); "(N options)" 11.52 / 500 `#64748b`, tappable (opens the size picker).
  - Spacer: min-height 20, margin-top 1.2 (holds an invisible "Only 9 left"; nothing visible).
- Bottom bar: margin-top auto, min-height 44, padding 4 8 5.2, gradient `rgba(248,250,252,0)` → `#f8fafc` at 28%, top border 1 `rgba(15,23,42,0.06)`.
  - One size: ADD (92 × 36, radius 6, border 1.2 `#279643`, 14.4 / 600 `#22853c`) → after adding, stepper 92 × 36, radius 20, border 1 primary, white, shadow `0 6 14 rgba(1,163,42,0.14)`; − and + 34 × 34 with a 1 px primary divider next to the count; count 24 wide, 14.4 bold.
  - Several sizes: always "ADD" (15.68 / 600) over "N options" (12 `#64748b`), even when a size is in the cart; it opens the size picker.

## Size picker (dialog)
- Paper: max 444 wide (348 on a 412 screen), radius 16, MUI elevation 24, backdrop `rgba(0,0,0,0.5)`.
- Title: padding 16 20 8, product name 16.8 / 700, line-height 1.3, padding-right 32. Close: top 8 right 8, icon 20 `#94a3b8`.
- Rows: column, gap 10, padding 0 16 20. Row: padding 10, gap 10, radius 12, border 1 `rgba(15,23,42,0.08)`, fill `#f8faf9`, shadow `0 1 4 rgba(15,23,42,0.06)`. Image box 52 × 52 white radius 8, image 48. Label 14 / 700. Price chip (margin-top 2.8, gap 4.8): fill `#076317`, radius 3, padding 0 6.56, height 22, 11.84 / 800 white. Right: ADD 88 × 36 (padding 4 12) or stepper 92 × 36 radius 18 with 32 × 32 buttons and dividers.

## Filters / Sort / Price sheet (bottom sheet)
- Height: screen height − 212, top radius 18.
- Header: padding 12 16 8, bottom border 1 `#eef2f7`; title 16.8 / 800 `#111827` ("Filters", "Sort", "Price", "Size"); close icon button.
- **Filters** mode: left tab column 36% (max 148), fill `#fafbfc`, right border 1 `#eef2f7`, padding-y 4. Tab: padding 10.8 12, 14.72; active fill `#f0fdf4`, text `#00642e` 700, 3 px right border `#00a82d`; inactive `#374151` 500. Right panel padding 6 12. Tabs: Sort, Price, Size (Size only when products have sizes).
- **Sort/Price** mode: one panel, padding 12 16.
- Option row: padding 9.2 2, bottom border 1 `#f1f5f9`, label 15.2 (500, selected 700 `#00642e`, else `#111827`), "(count)" after price bands. Radio 20 round, border 2 (`#00a82d` selected / `#cbd5e1`), inner dot 10. Size uses checkboxes (radius 5, filled green with a white tick).
- Size panel note: "Select one or more sizes" 13.12 `#64748b`.
- Footer: 2 equal buttons, gap 8, padding 12 16, top border 1 `#eef2f7`. "Clear filter" outlined (radius 12, border `#cbd5e1`, text `#334155` 700). "Apply" filled `#00a82d`, white 700, radius 12.
- Sorts: Recommended (catalog order), Stock: High to Low (most units first), Price: Low to High, Price: High to Low, Discount (largest rupee saving first). Always by the **first size**. Out-of-stock products always last.
- Price bands by first-size price: "Below ₹99" (≤ 99), "₹100-199", "Above ₹200" (≥ 200), each with its count.
- Messages: "No products match your filters." / "No products in the selected price range."

## Search screen
- Page: background `#f7f8fa`, container margin 24 12, padding 7.2 8.8 11.2.
- Header: sticky, fill `rgba(243,244,246,0.95)`, padding 4 0 8, margin-bottom 5.6. Bar: white, height 45, radius 10, border 1 `#e5e7eb`, shadow `0 3 12 rgba(15,23,42,0.06)`, padding 0 12. Back pill inside it (margin-right 8). Input 16 px, placeholder "Search for products", focused on open. × clears the text; mic 32 (icon 22 `#444444`).
- Results: the same chip row and product card, grid 2 columns (181 wide), gap 4, padding 2.
- No results: 'No results found for "{q}".' (16 / 600 `#111827`) and "Can't find what you need? Tell us what you're looking for." (14 `#6b7280`, margin-top 8), centred, padding-top 16.


## M5 measurements (littlekart.com /cart, 412 px, guest; signed-in parts from the site's code)
- Page (phone): background `#f4f5f7` inside the 12 px container; padding 14, bottom padding 84 (guest) / 116 (signed in) + safe area.
- Header: Back pill + "My Cart" 21.6 / 800, letter-spacing −0.02em, line 28.8; gap 10; margin-bottom 16.
- Line card: row, gap 12, padding 12, border 1 `#e5e7eb`, radius 12, shadow `0 2 10 rgba(15,23,42,0.05)`, white; lines 16 apart. Thumb 60 × 60, radius 10, fill `#f3f4f6`, border 1 `#eceff3`. Name 14.4 / 700 / 17.28, margin-top 4, 2 lines (min-height 2.4em). "Wt: …" 14 `#64748b` / 21. Price block margin-top 4, gap 2.4: struck "M.R.P.₹N" 12 grey, price 14 / 700 `#076317`. Stepper 68 × 26, radius 8, `#0c831f`, shadow `0 3 8 rgba(12,131,31,0.2)`, buttons 24 × 26 (icons 15.2), count 12.16 / 800 white. "Remove" 11 / 700 `#dc2626`, padding 2 8, full width (68). Right column gap 8. Out of stock: badge padding 6 12, `#ffebee`, `#d32f2f` bold 12, radius 6; Remove 12 bold red; card at 72% opacity.
- Often bought together: margin-top 14, padding 10, border 1 `rgba(15,23,42,0.07)`, radius 14, shadow `0 4 16 rgba(15,23,42,0.04)`. Title 20 / 800 `#0f172a` / 22, margin-bottom 10. Grid 3 columns, gap 8, padding 2; cards radius 14, image box 118 (image 110, radius 10, padding 8 8 0), shadow `0 6 18 rgba(15,23,42,0.08)`. 6 shown. "View more": margin-top 14, full width, padding 10 12, radius 12, border 1 `rgba(46,125,50,0.22)`, gradient `#f3fff6` → `#e8f8ec`, 3 overlapping 26 px thumbs (border 2 white, −8 overlap), label 14.4 / 800 `#166534`, chevron 20. Sheet: height = screen − 96, radius 18 18 0 0, handle 36 × 4 `#d1d5db` (margin-top 10), header padding 14 12 with gradient and bottom border `rgba(1,163,42,0.14)`, round white close 42 (border `rgba(15,23,42,0.12)`), body `#fbfffc` padding 10.
- Summary block: 40 below the suggestions.
- Coupon card (signed in): margin-top 15, padding 12 16, radius 12, border `#e5e7eb`. Row padding 6.4 4, radius 10; tile 30 × 30 radius 9 `#d9f4e2` border `rgba(1,163,42,0.22)`, tag icon 18 `#166534`; "View Coupons & Offers" 16 / 700; "Unlock best savings on this order" 12 `#466b53`; chevron 22. Applied box: margin-top 16, padding 12, radius 8, border `#e5e7eb`, fill `#f8fafc`; "<CODE> applied" 700 `#076317`; caption "<title> · You saved ₹N"; text buttons Change / Remove (red).
- Free delivery: margin-top 15, fill `#f0fdf4`, border `#bbf7d0`, radius 12, padding 12 16; 🚚 + "Add **₹N** more for **FREE delivery!**" 14 / 600 `#166534`; bar 8 high `#dcfce7` with `#22c55e` fill. Unlocked: padding 10 16, "✅ Yay! You've unlocked **FREE delivery!**".
- Bill Details: margin-top 15, padding 12 20, border `#e5e7eb`, radius 12. Title 16 / 800 / 24.8, letter-spacing −0.01em, bottom border, padding-bottom 6, margin-bottom 12. Row: icon 16 `#076317`, gap 4, label 14 / 500 / 21, "i" button 30 (icon 20 `rgba(0,0,0,0.54)`, margin-left −2), margin-bottom 8. Items Total `#ff4500` 500 (struck "M.R.P.₹N" 12 grey before it); MRP Savings "- ₹N" `#0c831f` 600; free fee: struck "₹30" 12 grey + "FREE" `#0c831f` 700 (gap 6). Yellow hint inside the bill: `#fef3c7`, radius 6, padding 6 10, "💡 Add **₹N** more to get FREE delivery" 12 `#92400e`. Grand Total: top border, margin-top 16, padding-top 8, 16 / 700. Icons (MUI outlined): ShoppingBag, LocalOffer, LocalShipping, Storefront, DarkMode, Route, VolunteerActivism, ConfirmationNumber, Payments.
- Info popup: backdrop 0.5, white box 90% (max 400), padding 24, radius 8, elevation 24; round white × (40) 50 px above it; text 16 / 24.8.
- Tip card: margin-top 20 (from the bill), margin-bottom 16, padding 16, radius 8, border 1 `#dddddd`, fill `#fefefe`, shadow `0 2 4 rgba(0,0,0,0.05)`. Title 18 / 700 centred, margin-bottom 5. Quote 13 italic `#6b7280`, margin-bottom 20. Chips row min-height 42, margin-bottom 15, gap 6, equal widths; chip padding 8 6, radius 999, border `#d1d5db`, 13 / 600 black, shadow `0 1 4 rgba(15,23,42,0.08)`; selected `#0c831f` white, shadow `0 4 10 rgba(12,131,31,0.24)`; Custom `#f97316` white, shadow `0 3 7 rgba(255,123,15,0.28)`. Custom row: field height 38, radius 10, border `#cccccc`, 14 centred, placeholder "Enter amount" `#757575`; Apply height 38, padding 0 10, radius 30, `#0c831f`, 13 / 500, 60% when disabled; × 28 grey; gap 8.
- Cancellation Policy: same card; title 20 / 600 / 32 centred (margin-bottom 7); text 14 `#64748b` centred.
- Bottom bar: fixed, fill `rgba(255,255,255,0.98)`, top border `#e4e4e4`, radius 18 18 0 0, shadow `0 -8 20 rgba(0,0,0,0.08)`, padding 9.6 12 + safe area. Button min-height 42, radius 12, 16 / 700, `#0c831f` (disabled `#cccccc`). Signed in: "Delivering to : " 14 / 700 + name in `#f97316`; address caption one line; "Change" 13 / 600 `#01a32a`; "Pay" caption over "₹ N" 18 / 700.
- Empty: "Your cart is empty." 20 / 800 centred (padding 32 0); "Start shopping" `#01a32a`, radius 18, padding 6 24, 14 / 700, margin-top 16.
- Apply Coupons (phone): sheet at the bottom, radius 18 18 0 0, max height screen − 64. Title bar padding 16 24 9.6, bottom border `#edf1f5`; tile 28 radius 8 `#ebf9ee`, tag 17 `#076317`; "Apply Coupons" 17.28 / 700; close 20. Content padding 14 24 16. Field height 40, radius 12, fill `#f8fafc`, search icon 18 `#94a3b8`, "Search" caption at the end; Apply min-width 84, radius 12, 700, `#01a32a` (disabled `rgba(0,0,0,0.12)` / `rgba(0,0,0,0.26)`). "Available Coupons" 14 / 700, margin-bottom 9.6. Cards gap 8, padding 12.8, border `#e7edf3`, radius 14, left border 4 (`#22c55e` applicable / `#d1d5db`), fill white + shadow `0 4 14 rgba(15,23,42,0.06)` / `#f8f9fb`. Code chip: dashed `#9ca3af`, fill `#f8fafc`, radius 7, padding 2 7.2, 12 / 800. "Save ₹N" `#bbf7d0` / `#14532d`. Title 15.2 / 800 (14 / 800 in the "nothing applies" list). Hint 12 `#64748b`; "Add ₹N more to apply" 12 / 700 `#b45309`. Button min-width 86, radius 10, `#15803d` with shadow `0 5 12 rgba(22,163,74,0.28)`, or outlined grey "Not Eligible".
- Snackbar: MUI standard Alert 10% above the bottom, 3 s (success `#edf7ed` / `#1e4620`, info `#e5f6fd` / `#014361`).


## M6 measurements (littlekart.com profile stylesheet and code, phone layout)
- Page `#f7f8fa` inside the 12 px container. Header: sticky, min-height 52, padding 8 12, fill `rgba(255,255,255,0.94)`, bottom border `#e5e7eb`, gap 8; Back pill, title 1.08rem (17.28) / 800, letter-spacing −0.02em, centred; 40 px spacer (72 here, D-61).
- Hero: margin 12 12 16, padding 18 16, radius 16, gradient 145° `#ffffff` → `#f8fafc` 45% → `#eef2ff`, border `#e2e8f0`, shadow `0 4 18 rgba(15,23,42,0.06)`; gap 14. Avatar 56 round, fill `#e0e7ff`, border 2 `#c7d2fe`, AccountCircle 34 `#4f46e5`. Name 1.12rem / 750 / 1.2, −0.02em. Phone 0.84rem / 500 `#64748b`, margin-top 4.
- Section label: margin 0 16 8, 0.72rem / 700, letter-spacing 0.06em, capitals, `#6b7280`.
- Menu card: margin 0 12 12, radius 14, white, border `#e5e7eb`, shadow `0 2 10 rgba(15,23,42,0.06)`. Row: padding 14, gap 12, bottom border `#f1f5f9` (none on the last), pressed `#f8fafc`. Icon tile 38, radius 11, icon 20. Label 0.92rem / 600 `#111827`, −0.01em. Chevron 20 `#9ca3af`.
- Tiles: Orders ShoppingBag `#017400` on `#edf7ed`; Saved Addresses LocationOn `#2563eb` on `#eff6ff`; E-gift Cards CardGiftcard `#ea580c` on `#fff7ed`; Refer a Friend GroupAdd `#7c3aed` on `#f5f3ff`; Account Privacy Lock `#e11d48` on `#fff1f2`; Help HelpOutline `#0d9488` on `#f0fdfa`; About Us Info `#0891b2` on `#ecfeff`; Rate the App Star `#ea580c` on `#fff7ed`; Share the App Share `#0284c7` on `#e0f2fe`.
- Logout: margin 4 12 16, min-height 46, padding 10 16, radius 12, border `#fecaca`, white, `#dc2626` 0.92rem / 700, Logout icon 20, gap 8, shadow soft; pressed `#fef2f2`.


## M7 measurements (littlekart.com address modal stylesheet and code, phone layout)
- Theme: primary `#01A32A`, error `#DC2626`, warning `#F59E0B`, text `#111827` / `#64748B`; buttons not capitalised, weight 700.
- Map step: full screen, white, safe-area top. Search box absolute top 14, left 12, right 60; MUI small outlined field (40 high, no fill), placeholder "Search for a location"; list under it max 180 high, border `#e5e7eb`, radius 4, white. Close: 36 round, white, top 14, right 12, shadow `0 8 20 rgba(15,23,42,0.18)`, Close icon 20.
- Pin: Room icon 35 `#DC2626`, tip at the map centre; label above it: `#313131`, radius 8, padding 6 10, 12 / 500 white, nowrap, shadow `0 2 6 rgba(255,255,255,0.5)`; hidden while dragging.
- "Use Current Location": MUI outlined, 12 px / 700, text `#0c831f`, fill `rgba(255,255,255,0.87)`, shadow `0 2 8 rgba(15,23,42,0.18)`, MyLocation icon; left 12, bottom safe + 208. While locating: "Fetching your location..." and disabled.
- Bottom panel: left/right 12, bottom safe + 20, padding 10 12 12, gap 10, radius 24, `rgba(255,255,255,0.96)`, shadow `0 16 40 rgba(15,23,42,0.18)`. Handle 42 × 5 `rgba(107,114,128,0.35)`. "Delivering your order to:" body2 `#64748B`; row: Room icon 20 red + caption (red when it's a message, else `#111827`). Confirm: MUI contained warning `#F59E0B` (dark text), min-height 52, radius 16, 700, letter-spacing 0.02em, shadow `0 12 28 rgba(249,115,22,0.28)`; disabled grey.
- Form step: white, padding 20 16; title h6 600 ("Add New Address" / "Edit Address") with × (back to map). "Save address as *" caption, margin-bottom 4. Chips: gap 10, wrap, margin-bottom 16; chip min-height 42, padding 9 14, radius 999, border `rgba(17,24,39,0.12)`, gradient `#ffffff` → `#f8fafc`, shadow `0 4 14 rgba(15,23,42,0.06)`, 13 / 600, gap 6, outlined icons 20 `#F59E0B` (Home, WorkOutline, LocationCity, LocationOn); selected: gradient 135° `#076317` → `#0c831f`, white, shadow `0 10 22 rgba(46,125,50,0.24)`. Error: 1 px red box, padding 8, radius 8. "Save as" field: 140 × 38, radius 10, border `#cccccc`, 15 centred.
- Address box: padding 10, margin-bottom 16, border `#cccccc`, radius 4, fill `#f9f9f9`, 14 / 1.5.
- Fields: MUI outlined TextField (56 high), margin-bottom 16, floating labels.
- Actions: sticky at the bottom, white, padding 10 0; Cancel `#cccccc`, Save `#0c831f` white; padding 8 16, radius 4, 16 px.
- Saved Addresses (profile): body padding 0 12 20. "+ Add New Address": margin 16 12 14, padding 12 16, radius 12, border 1.5 `#fdba74`, gradient `#fff7ed` → `#ffedd5`, `#c2410c` 0.9rem / 700, shadow `0 2 8 rgba(249,115,22,0.12)`. Card: margin-bottom 10, padding 14, radius 12, border `#e5e7eb`, shadow soft. Icon tile 36 radius 10 (Home orange, Work blue, Hotel violet, other teal). Title "Name · Label" 0.88rem / 700 / 1.25; details 0.8rem `#6b7280` / 1.35, margin-top 3. Actions 32 × 32 radius 9: edit `#2563eb` on `#eff6ff`, delete `#dc2626` on `#fef2f2`, gap 6.

## M9 — payment, tracking, orders (read from the site's code 24 Oct 2026; signed-in pages can't be rendered without an OTP, so sizes come from the code + MUI defaults)
Theme: h5 24/800 (bold prop → 700) ls −0.02em lh 1.334; h6 20/800 ls −0.015em lh 1.6; body1 16 lh 1.55; body2 14 lh 1.5; caption 12 lh 1.66 ls 0.4; subtitle2 14/500 lh 1.57. `--color-primary` #0c831f, `--color-primary-dark` #076317, `--color-accent` #f97316, `--color-text` #1f2937, `--color-text-muted` #6b7280. CSS "green" #008000, "gray" #808080, "red" #ff0000. MUI success #2e7d32, warning #F59E0B, error #DC2626 (dark #9a1b1b), info alert #e5f6fd / #014361 / icon #0288d1.
- **Proceed To Pay** (cart): no address → Change Location dialog; out of stock / not deliverable / checking → warning snackbar; else `/payment` with the cart snapshot (orderDate = now).
- **Payment** (`/payment`): Paper max 600, margin-top 32, padding 24 (elevation 1, radius 4) inside the 12 px page gutter. Header: Back pill + "Order Summary" h5 bold, gap 10, mb 16. Item rows: Paper p 16 mb 16 gap 16; img 60×60 contain radius 4; `.product-name` 14.4 lh 1.2 two lines (min 2.4em, mt 4); "Wt: …", "Qty: N" body2 secondary; right: struck MRP body2 grey, price body1 #008000. Bill Details mt 24, h6 bold mb 8; rows (cart bill row, mb 6): Items Total (struck "M.R.P. ₹N" 12 grey), MRP Savings (#0c831f 600), Delivery Fee (base fee, only if > 0), Late Night Fee (NightlightOutlined), Long Distance Fee, Platform Fee (if > 0), Coupon Discount (CODE), Tip; Grand Total box mt 8 pt 8 top border #e5e7eb, body1 700. Delivery Details mt 32 (h6 bold mb 8): body2 lines "Name: ", "Phone: ", "Order Date: D MMM at h:mm A", "Address: ", "Latitude: ", "Longitude: ". "Payment Method" body1 bold mb 8 (mt 16). Cards stacked gap 12: radius 8 padding 12, label 14.4 bold, helper caption opacity 0.8; selected #fc7507 fill, #ff7b0f border, white, shadow 0 6 16 rgba(1,163,42,0.25); idle white, #ddd border. "UPI / Card Payment — Pay securely with UPI, debit or credit card"; "Cash on Delivery — Pay at your doorstep" (only when COD allowed). Else info alert mt 16 radius 8 #f0f7ff / #1e3a5f / icon #2563eb: "UPI / card payment required" body2 700 + message. Submit: mt 20, py 8.8, full width, radius 8, #0c831f, 15.2/800, shadow 0 4 10 rgba(1,163,42,0.2); "Submitting...".
- **Order Submitted** dialog (xs, radius 4): title "✅ Order Submitted!" centred bold primary, × top-right; body1 "Your order is being confirmed. You will see live updates shortly." + body2 secondary mt 8 "Redirecting to tracking page..."; contained success "View Tracking" (centre, pb 16). Closing goes to /tracking/:id.
- **Error dialog** (xs, radius 8, elevation 3): title centred 16.8/600 #9a1b1b on rgba(220,38,38,0.08), padding 18 40 14 24; body2 lh 1.6, padding 20 22 8; detail strings as a bullet list; actions centred, full-width buttons (gap 8, padding 0 16 20): first contained #0c831f, others outlined primary; 600, radius 8.
- Razorpay options: name "Littlekart", description "Order Payment", theme #01a32a, confirm_close; test keys: prefill "Test User" / +919999999999 (read-only), retry off. Dismiss → server told "cancelled", no dialog. payment.failed → dialog "UPI payment unsuccessful" / "Online payment unsuccessful" with Razorpay's text, buttons "Try another payment method" (+ "Choose Cash on Delivery").
- **Tracking** (`/tracking/:id`): shell gradient #eef1f8 → #f6f7fb (32%). Hero: gradient #fff → #f3fbf5, padding 16 12 14, bottom border rgba(1,163,42,0.18), shadow 0 6 18 rgba(15,23,42,0.06), radius 0 0 22 22; Back pill, gap 12; text column gap 4: "ORDER TRACKING" 14.72/600 ls 0.3 #476356; status 18.56/700 lh 1.2 #0b3d1d; "Arriving in N minutes" 13.6/700 #0c831f mt 6; "Order #ID" 13.6/600 opacity 0.92 ls 0.27 mt 6; OTP pill mt 6 (gap 6, padding 3 8 3 9, rgba(1,163,42,0.1) fill, rgba(1,163,42,0.26) border; label 9.92/700 #1d6f3a; value pill white min-width 36 padding 1 7 #046c1f 11.52/800 ls 0.06em). Content padding 12 gap 12. Map section: white radius 16 padding 8, shadow 0 4 20 rgba(15,23,42,0.06), border rgba(15,23,42,0.06). Status box mb 10 padding 12 14 radius 14, gradient 135° rgba(1,163,42,0.1)→0.04, border rgba(1,163,42,0.18), gap 2: "ORDER STATUS" 11.2/700 ls 0.08em #64748b; value 16.8/800 #0f172a lh 1.3; eta 13.12/600 primary mt 2. Header padding 2 4 10: "LIVE MAP" 12.48/700 ls 0.06em #475569; "Updates live" 11.52/700 primary on rgba(1,163,42,0.1), padding 4 10, pill. Map: min(42vh, 320) tall, min 220, radius 16, #e8edf4; store pin blue #2563eb (house), delivery pin orange #ff7b0f (person), 44×56 teardrop with white ring; pre-assignment line store→address #5b8def 5 px 0.85.
  Cards (radius 16, shadow 0 2 12 rgba(15,23,42,0.06), border rgba(15,23,42,0.06), content padding 12 at ≤420 px): "Active orders" + "N total" (12/600 #64748b), subtitle "Swipe sideways on the chips below to see every order.", chips 32 tall 12.48/600 ("…" + last 10 chars when longer than 14; current "ID • live" filled success). Delivery card (left border 3 primary): 44 tiles radius 12 (muted rgba(15,23,42,0.06)/#475569 AccessTime; accent rgba(1,163,42,0.12)/primary LocationOn), gap 12; overline 10.4/700 ls 0.1em #64748b ("ESTIMATE", "DELIVER TO"); title 15.2/600 #1b1b1b ("Arriving in N minutes"); subtitle 12.8 #6b7280 ("to reach your address."); address 14.4/600 #0f172a lh 1.45; dividers my 16 rgba(15,23,42,0.08); "Cancel order" outlined error full width radius 12 py 8.8 700 (disabled + reason once accepted). Summary card: "Order summary" + "#ID"; status pill (padding 3.2 8, rgba(1,163,42,0.1), #076317, 11.52/700) + chevron 22 #94a3b8; box padding 8.4 radius 14 gradient #fbfdfb→#f8fafc border #edf2f7: up to 3 thumbs 40 radius 12 (ml −8, border #edf2f7, shadow 0 2 6 rgba(15,23,42,0.06), image 68%) + "+N" dashed #cbd5e1; "N items" 13.12/700, "Total qty N" 11.52 #64748b; "Open summary" pill below (padding 5.76 10.8, primary, 12/700, shadow 0 6 14 rgba(1,163,42,0.18)); "Tap for full bill and items" 11.2 #94a3b8 centred mt 8. Delivery status card padding 16: "Delivery status" 15.2/700 #1b1b1b mb 12; caption "Swipe sideways on the steps below to see the full journey." mb 8; steps Pending · Accepted · Assigned · Nearby · Delivered: 56 wide, dot 26 (primary / #d8dde6, "✓" when done, current ring 0 0 0 3 rgba(1,163,42,0.14)), label 9.92 (700 current / 600) #1f2937 or #6b7280, connector 12×3 mt 11; "Order placed at 01:05 AM" body2 secondary mt 16.
  Cancel dialog: "Cancel order"; "Please contact customer support to cancel this order."; box (mt 8 p 12 radius 8 border rgba(15,23,42,0.1) #f8fafc): "Contact customer support to cancel" subtitle2 700, "Self-serve cancellation is not available. Call us and we will help cancel your order.", number 17.6/800 ls 0.4, copy (outlined square radius 10) and call (primary) buttons; "Close". Snackbar "Phone number copied".
  Tracking ends 45 min after the order (or when delivered/failed) → order details.
- **Floating tracking card** (all pages except tracking, signed in, active order): right 12, bottom 100 + max(48, safe) (112 on the cart), width 176, min-height 56, padding 10 12, radius 18, gradient 135° #0c831f → #076317 70% → #f97316 180%, shadow 0 12 24 rgba(1,163,42,0.26); "View Tracking" 14.4/700 white; "Arriving in N minutes" 10.88 lh 1.2 opacity 0.85; OTP pill mt 6 (rgba(255,255,255,0.2), border 0.26, 10.56/600; label 9.6 opacity 0.9; value white pill #046c1f 11.52/800); chevron 20 white.
- **My Orders** (profile section, body padding 12, top 8): "All" / "Scheduled" small pill buttons gap 8 mb 16; cards Paper p 16 mb 16 radius 8: status icon 24 mr 8 (CheckCircle #2e7d32 / HourglassEmpty #F59E0B / Cancel #DC2626) + bold label (warning / error colour for those), MoreVert → "Share Order Items" → "Order Items" dialog ("Name × qty"); "₹N • 24 Oct at 1:05 AM" 14 secondary mb 8; thumbs 60×60 radius 4 border #ddd gap 8; "Reorder" outlined (14, padding 6 18, radius 18, #0c831f) enabled only when delivered. "No orders found." / "No scheduled orders." Statuses: Pending, Accepted, Delivery partner assigned, Delivery partner nearby, Delivered, Payment Failed, Cancelled.
- **Order details**: padding 12. Hero card (radius 12, shadow 0 4 16 rgba(15,23,42,0.08), border rgba(1,163,42,0.2), gradient #fff → #f3fbf5, mb 16, padding 12): Back pill (outside the profile) mb 8; "ORDER DETAILS" 12.8/700 #476356; "#ID" 18.88/700 #0b3d1d mt 2.8; status line body1 #2e7d32 / error mt 3.6 ("Placed at 01:05 AM", "This payment did not go through, so the order was marked as Payment Failed."). "N items" bold mb 12; item cards (padding 10.8, gap 12): img 60, name bold, "500 g × 2" body2 secondary, "₹63.00". Divider my 20. Cancellation card (border #fde6d8): h6 700 "Cancellation", "Current status: **Pending**", "Waiting for the store to accept your order. To cancel this order, please contact customer support.", contained error "Cancel Order" radius 18. Bill Details card: h6 600; body1 rows mb 8: Items MRP, Product Discount (−₹, #008000 bold), Items Total, Delivery Charge (> 0), Late Night Fee, Long Distance Fee, Platform Fee, Tip Amount, Coupon Discount (−₹, #ff0000 bold); divider; Grand Total h6 bold. Order Details card: label body2 secondary / value body1: Payment Type, Order ID, Placed on (toLocaleString), Phone number, Order status, Delivered to; info alert "Delivery OTP: **1234**. Share this with the delivery partner."; Coupon code. Buttons: "Reorder" (outlined; enabled after delivery, or for failed orders) and "Rate your order" (contained, after delivery).
