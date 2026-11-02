# Fidelity notes

Everything not yet confirmed against the live app: estimated values, guessed behavior, placeholder assets.
Each item is resolved by checking littlekart.com, your phone, or the founder.

## Values to verify
| Where | Current value | Source | How to confirm |
|---|---|---|---|
| Dialog corner radius | saved-cart 12, location dialogs 24 | **confirmed** from the site's code | done (other dialogs are measured when built) |
| Bright green (login, Use Current Location) | `#01a32a` | **confirmed** on the login page and site theme | done |
| Header delivery minutes | live formula (D-39) | **confirmed** from the site's code | distance is straight-line, the site uses road distance: compare at a few addresses |

## Behavior guessed (not captured)
- Cart line "−" at quantity 1 removes the line.
- At the 30-unit or stock limit the "+" dims and stops; no message (none seen in the live app).
- FESTIVE200 minimum order ₹2,500 (cut off in the screenshot).

## Login (M2)
- While the code is being verified, the live app covers the page in white with a loading picture of Home. We show the white cover; the Home loading picture is not drawn (rule 7, same as Home).
- The success dialog's backdrop on the site also blurs the page slightly (2 px). Not reproduced; the dimming colour is exact.
- The site doesn't put the cursor in the first OTP box when the step opens (only after "Resend"). Same here.
- The legal links open the live site's pages: littlekart.com/terms-and-conditions.html and /privacy_policy.html.

## Home (M3)
- The rolling search hint clips mid-scroll exactly as on the site (it is not a bug).
- Long addresses in the header are cut with "…" after one line, as on the site.
- The site shows a grey loading picture of Home while it loads. Not drawn yet (rule 7 keeps loading states minimal); to add later if you want it.
- "View all" in Deals opens the Limited Time Deals page (M10). Tapping a deal card's picture opens the product page (built from your app screenshots, D-97).
- The mic in the search bar opens Search; the site's voice search is not built.
- Delivery minutes use straight-line distance; the site uses road distance, so a few addresses may differ by a minute or two.

## Category and search (M4)
- **Voice search:** the mic in the category and search bars is shown but does nothing yet (the site starts voice search).
- **Tapping a product card** opens the product page (D-97), laid out from your screenshots of the live app; sizes are matched by eye, not measured on the site.
- **Search extras on the site not built yet:** "Did you mean …?" spelling help, the form to request a missing product, and the Print Zone link.
- **Search results:** the site's search sometimes shows "15 MINS" on meat and no "(2 options)", because its search returns less data than the category page. We show the same card as the category page (30 MINS for meat, sizes included).
- **Mutton and most sub-categories** have no products in the sample data, so their grids are empty until the real catalog is loaded.
- **Out-of-stock cards** are dimmed to 55% like the site; the site's overlay message isn't known yet.
- **Search field outline** in the web preview is the browser's focus box; Android doesn't draw it.

## Cart (M5)
- **Signed-in cart** was built from the site's code, not measured on screen: the site needs a real OTP to sign in. Guest cart, bill, tip, Custom row, info popup, "View more" sheet and the empty cart were measured.
- **Coupon messages** come from the live server, which we don't call. Ours: "Invalid coupon", "Please enter a coupon code", the shortfall hint and the exempt-only line. When some coupons apply, a grey card shows both the hint and the amber "Add ₹N more to apply" line, as the site's code does.
- **Coupon list while loading:** the site shows grey placeholder cards; ours shows nothing until the list arrives (rule 7).
- **"Often bought together" while loading:** the site shows shimmering placeholders; ours appears when the list arrives.
- **Proceed To Pay** opens the payment page (M9). Outside store hours (midnight – 6 AM) the closed sign, warning and disabled "Store closed" button follow the site (D-73). Closed hours now offer one-hour delivery slots (D-103).
- **Not built yet (site has them):** pick-up at store, the 100 kg cart weight limit, the referral-coupon banner, and the delivery-slot picker. (The out-of-stock and delivery-area checks on the button came with M9.)
- **Tapping a line's picture** opens the product page (D-97).
- **Delivery-fee distance** uses straight-line distance to the nearest store (the site uses its own distance); it only matters near 4.5 and 5 km.
- **Tip quote** is drawn slanted by the phone, as the browser does (Inter has no italic file loaded on the site either).
- **Web preview:** the black box around a focused text field is the browser's focus outline; Android doesn't draw it.

## Profile (M6)
- Built from the site's code and stylesheet; the signed-in page could not be opened on the site (it needs a real OTP).
- **Name weight:** the site's style asks for weight 750 (drawn as Inter 800), but in your phone photo "SV" looks regular. Kept the site value; please compare on the phone and tell me if it should be lighter.
- **Section pages** (E-gift Cards, Refer a Friend, Account Privacy, Help, About Us) show only the header for now. On the site: e-gift coupons list, referral code and share, a privacy page with account deletion, customer-support call / WhatsApp cards, and the About text. Built when you want them (their content isn't in the screenshots).
- Sharing uses the phone's share sheet; the site's copy-to-clipboard fallback isn't needed on Android.

## Add / Edit Address (M7)
- **Map look:** OpenStreetMap tiles (OpenFreeMap "liberty" style) instead of Google's (D-13, Q-05): same behaviour, different colours and labels.
- **Map not seen running here:** my test browser can't download map tiles, so the map itself was only checked loading its script and style. Please check on the phone: the map shows streets, drags smoothly, the pin's tip marks the address, and a tap moves the map there.
- **Search field over the map** has no white fill on the site (MUI's default), so it is see-through here too.
- **Where the map opens:** the site starts at a fixed point near Hyderabad and jumps to your location; ours starts at your delivery location (or Nalgonda bus stand) and then jumps to your location, so there is no "Not deliverable" flash.
- **Location accuracy:** the site keeps watching GPS for up to ~9 s to get a better fix; ours asks the phone once for its best fix.
- **Loading placeholders** (map skeleton, saved-address skeleton) are not drawn (rule 7).
- **Saved addresses** are kept on the server when the app uses the API (D-67); in sample-data mode they live in memory and are lost on restart.
- **Floating labels** on the form fields are drawn by our own field that copies MUI's (label moves up and shrinks on focus); the animation timing may differ slightly.

## Store-closed sign (M10)
- Measured on littlekart.com at 412 px after midnight. The sign's slanted 165° gradient and the round "rivets" are drawn with plain gradients, so the shading may differ very slightly. Check it on the phone between midnight and 6 AM.

## Limited Time Deals page (M10)
- Measured on littlekart.com/deals at 412 px: same header and grey panel as a category page, a "Limited Time Deals 🔥" title card, the 2-column product grid, and "Load more" after every 20 deals (the sample data has fewer, so it doesn't show).

## Payment, tracking and orders (M9)
- Built from the site's code (these pages need a signed-in account with an OTP, so they couldn't be opened and measured on the site). Sizes come from the site's styles and MUI's defaults; please compare on the phone.
- **Razorpay sheet** is Razorpay's own page inside the app; it looks as Razorpay draws it. In test mode, pick UPI/card/netbanking and use Razorpay's test details (success / failure). Real UPI apps open from it in live mode.
- **Sample-data mode:** UPI orders are treated as paid at once (no gateway), and orders live only while the app is open.
- **Snackbar warnings** (out of stock, not deliverable) use MUI's standard warning colours; the exact colours on the site weren't measured.
- **Floating tracking card**: the site's 135° gradient (green → dark green → orange) is drawn with a normal gradient, so the orange tint may sit slightly differently.
- **My Orders** loading placeholders are plain grey blocks (the site's pulse animation isn't drawn). "Scheduled" lists orders placed for a delivery slot (D-103).
- **Order details** "Download Invoice" is left out (D-71). "Placed on" uses the Indian date format (24/10/2026, 11:45:09 am), as an Indian phone's browser shows it.
- The tracking page's "Delivery partner" lines, call button, rider position and rating appear only with a rider app (not in iteration 1).

## Placeholder assets (in `app/src/assets/placeholders/`, neutral, no text)
`banner.png`, `category.png`, `product.png` (the app icon is now the LittleKart logo, D-88). Swap in the founder's files with the same names. The logo and login illustration are now the real ones (D-38).

## Intentional differences from the live app (typo and alignment fixes, DECISIONS D-21 / D-31)
Listed in `DECISIONS.md`. Each one is noted here again when the screen that shows it is built.

## Iteration 2 (phone-test fixes and catalog), DECISIONS D-76 to D-81
These are deliberate departures from the live app, not fidelity gaps:
- **Bottom dock** (cart bar + tracking strip) replaces the live "View Cart" pill and floating tracking card (D-77).
- **Order tracking** texts are centred and Back sits on its own row (D-76).
- **Offer banners** are our own designs, not the live artwork (D-81).
- **Catalog** is our own assortment (D-78, D-79); every product has a bundled image: 267 cleaned-up photos and 126 drawn cards (D-82).
- **Pop-ups** use our own design (D-83) and **Login** is a pill button (D-84).
- **Background removal** was done automatically and checked by eye at small size; a few cut-outs may have rough edges on a big screen. Tell me which ones and they can be switched to a drawn card.
- **Smart suggestions** (D-90) replace the live cart's fixed "Often bought together" list, and the payment page has a new "Suggested products" row.
- **Swap & save** (D-91) is new: the live app has no swap.
- **Home tile, category and all product pictures** are drawn in one style (D-94, D-96) instead of the live app's photos, until LittleKart's own catalog is imported (D-95).
- **Ask AI** (D-102) is new: the live app has no assistant. Telugu text uses the phone's Telugu font (Inter has no Telugu letters), as elsewhere.
