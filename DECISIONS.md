# LittleKart — Decisions log

Every decision I make while planning and writing the code is recorded here, so you can track it.
New decisions are added at the bottom with the next number. A decision is never deleted: if it changes, it is marked **Replaced by D-xx** and the new one explains why.

**Status values**
- **Confirmed**: you (or the founder) said so.
- **Made**: my call, based on the docs and screenshots. Tell me if you disagree.
- **Proposed**: a default I picked that still needs your or the founder's answer.

---

## Project scope

### D-01 · Exact replica first, improvements later
- **Status:** Confirmed (you, 23 Oct 2026)
- **Decision:** Iteration 1 is a pixel-faithful copy of the live app. Nothing is added unless you explicitly ask. My own improvements come only in later iterations.

### D-02 · Android only
- **Status:** Confirmed (you, 23 Oct 2026)
- **Decision:** Build and test for Android only. No iOS or web work, testing or config.

### D-03 · Customer side only
- **Status:** Confirmed (you, 23 Oct 2026)
- **Decision:** No rider app, no warehouse or store app, no admin panel. One **virtual dark store** in the database stands in for the real stores (its stock, location and opening hours).

### D-04 · We write our own backend
- **Status:** Confirmed (you, 23 Oct 2026)
- **Decision:** Build our own backend instead of waiting for the live app's API.
- **Replaces:** the "mock data until the founder shares the API" plan in `ARCHITECTURE.md` and the "No backend yet" line in `CLAUDE.md`. The app keeps its repository layer; the mock repositories stay for offline development and tests, and `src/services/http/` talks to our backend.

### D-05 · Free tiers only, and no card on file
- **Status:** Confirmed (you, 23 Oct 2026)
- **Decision:** Every outside service must be free. I also avoid any service that needs a credit card on file even when usage stays inside the free allowance, so a surprise bill is impossible.
- **Effect:** rules out Firebase phone login (needs the paid Blaze plan) and Google Maps (needs a billing account). See D-12 and D-13.

### D-06 · One reusable category screen
- **Status:** Confirmed (you, 23 Oct 2026)
- **Decision:** Every category (Chicken, Books & Charts, and the rest) opens the same `category/[id]` screen: back pill + title, left sub-category rail, search-in-category field, Filters / Sort / Price chips, 2-column product grid. Only the data changes. One shared product card is used across the grid screens. If a category in your screenshots looks different, it becomes an option on the same component, not a new screen.

---

## Backend stack

### D-07 · TypeScript on Node.js
- **Status:** Made
- **Why:** same language as the app, so types and the bill/coupon/limit calculations are shared and the app and server always agree on totals; one language for one developer; the work is mostly waiting on the database and outside services, which Node.js handles well; best SDK support from the free services we use.
- **Rejected:** Python/FastAPI (second language, no shared types), Java/Spring (heavy, slow to start on free hosts), Go (second language), Firebase/Supabase as the whole backend (business rules would scatter across cloud functions; vendor lock-in).

### D-08 · Fastify as the web framework
- **Status:** Made
- **Why:** light and quick to start, which matters because the free host sleeps and wakes on the first request; built-in validation, rate limiting and Swagger plugins.
- **Rejected:** NestJS (too much boilerplate for this size), Express (older, slower, weaker TypeScript support).

### D-09 · PostgreSQL on Neon, accessed with Prisma
- **Status:** Made; the Prisma part is replaced by D-65
- **Why:** orders, stock and coupons are relational, and placing an order must be one all-or-nothing transaction so stock is never oversold. Postgres also gives free product search (full-text + pg_trgm).
- **Host:** Neon free plan (1 GB per project, no card; compute sleeps after 5 minutes idle and wakes in under a second).
- **Rejected:** Render's free Postgres, because it is deleted 30 days after creation.

### D-10 · Redis on Upstash for OTPs, rate limits and cache
- **Status:** Replaced by D-65 (codes and limits are kept in PostgreSQL; one service fewer)
- **Free limit:** 500K commands/month, 256 MB. Idle for 30 days = archived, so it must stay in use. Never add a card (that switches it to pay-as-you-go).

### D-11 · Hosting on Render's free web service
- **Status:** Made
- **Known limit:** sleeps after 15 minutes without traffic; the first request then takes about a minute. Before a demo, open the app a minute early.

### D-12 · Our own 4-digit OTP login (no Firebase)
- **Status:** Made
- **Why:** the live app shows **4** OTP boxes, Firebase sends **6**-digit codes, and Firebase phone login needs the paid plan (D-05).
- **How:** 4-digit code stored hashed in Redis for 5 minutes, 60-second resend timer (matches the UI), 5 wrong tries max, max 5 sends per hour per number. Login gives a short-lived access token plus a refresh token; the phone stores them encrypted (expo-secure-store).
- **Review mode:** no SMS is sent. A list of approved test numbers gets a fixed code. A real SMS provider can be plugged in later without changing the app.

### D-13 · OpenStreetMap-based map instead of Google Maps
- **Status:** Made (needs founder OK on the look, see Q-05)
- **Decision:** Map = MapLibre with OpenFreeMap tiles (no key, no card). Address from the pin = Nominatim (max 1 request per second).
- **Trade-off:** the map tiles look slightly different from the live app's Google map. Logged in `FIDELITY_NOTES.md` when that screen is built.
- **Note:** the map needs a development build; it does not run in Expo Go.

### D-14 · Payments with Razorpay in test mode
- **Status:** Made
- **Why:** free, no real money moves, test cards and test UPI. The server verifies every payment signature and confirms it by webhook. Needs a development build (not Expo Go).
- **Note:** the payment screen was not captured, so this is built only after you send those screenshots.

### D-15 · Other free tools
- **Status:** Made
- Product images: Supabase Storage (1 GB); Cloudinary free plan as fallback, because Supabase pauses projects idle for a week.
- Push notifications: Expo Push (free).
- Background jobs (for example releasing stock held for an abandoned payment): pg-boss, which runs on the same Postgres.
- Error reports: Sentry free plan.
- Tests and deploys: GitHub Actions + Render auto-deploy.
- API documentation: Swagger/OpenAPI generated from the code, for the founder to browse.
- Catalog data: seed scripts from CSV/JSON + Prisma Studio for edits (no admin panel, per D-03).

---

## Business rules (all enforced by the server)

### D-16 · The server is the authority
- **Status:** Made
- **Decision:** prices, stock, quantity limits, coupons, fees and the delivery area are checked on the server. The server re-prices the cart at checkout. The app's totals are for display only, so a modified app can't order more than allowed or at a wrong price.

### D-17 · 30 units per product per user
- **Status:** Confirmed (you, 23 Oct 2026)
- **Decision:** one user can't have more than **30 units of a product** in their cart.
- **My interpretation (Made):** all variants of a product count together (e.g. 20 × 1kg + 10 × 500g of the same chicken = 30, so no more can be added). The limit applies to one cart/order, not to a running total across past orders. It is also capped by stock: if only 12 are left, the limit is 12. Tell me if you meant it differently.
- **UI:** the live app's "limit reached" message was not captured, so the + on the stepper simply stops working at the limit. No new message is added (D-01).

### D-18 · Other limits (defaults until the founder answers)
- **Status:** Proposed. Delivery area, store hours and ETA are now replaced by real values in D-23.

| Rule | Default |
|---|---|
| Stock | Per product and per variant in the virtual store |
| Max distinct items per order | 30 |
| Max order value | ₹10,000 |
| Minimum order value | None (none seen in the app) |
| Delivery area | 5 km around the virtual store (Nalgonda) |
| Store hours | 6 AM to 11 PM |
| Stock held during payment | 10 minutes, then released |
| Coupons | Minimum excludes exempt categories (meat); one coupon per order; one use per user |
| Fees | Delivery ₹30, platform ₹10; free-delivery threshold unknown |
| Custom tip cap | ₹200 |
| Guest cart | Kept on the phone, merged into the account on login |

---

## Code organisation

### D-19 · One repository with three parts
- **Status:** Proposed (decided when coding starts)
- **Decision:** `app/` (the Expo Android app), `api/` (the Fastify backend), `shared/` (types and the bill, coupon and limit calculations used by both).

---

## From the screenshots and littlekart.com (23 Oct 2026)

### D-20 · littlekart.com is the source of truth for exact values
- **Status:** Confirmed (you, 23 Oct 2026: "the website and the Android app are exactly the same")
- **Decision:** colors, font, radii and shadows are taken from the website's real stylesheet, not estimated from photos. Screenshots stay the reference for layout and text. Where the website and `DESIGN_SPEC.md` disagree, the website wins and the difference is logged here.
- **Exact values read from the site:** font **Inter** (500/600/700/800); primary green `#0c831f`, primary dark `#076317`, primary light `#ebf9ee`; accent orange `#f97316`; text `#1f2937`, muted `#6b7280`, border `#e5e7eb`; app background `#f7f8fa`; home background `#fffaf3`; "+" button green `#4caf50`; "New" badge `#ef233c`; "% OFF" text `#e11d48`; card radius 14px; soft shadow `0 2px 10px #0f172a0f`, raised shadow `0 8px 22px #0f172a14`.
- **Replaces:** the estimated hex values in `DESIGN_SPEC.md` section 1 (e.g. green `#0B8220` → `#0c831f`, crimson `#CE1642` → `#e11d48`). The remaining tokens get checked screen by screen on the site.

### D-21 · Fix typos and misalignments; keep everything else identical
- **Status:** Confirmed (you, 23 Oct 2026)
- **Replaces:** the "keep typos exactly" rule in `CLAUDE.md` rule 5 and `LITTLEKART_CONTEXT.md` section 5.
- **Typos to fix:** Resturants → Restaurants · Stationary Items → Stationery Items · Umbrella's & Raincoat's → Umbrellas & Raincoats · Femine hygiene → Feminine Hygiene · Groooming → Grooming · Icecream & Deserts → Ice Cream & Desserts · Pet's Food → Pet Food · "House No / Flat No / Building Name \* \*" (double asterisk) → single \* on each required field · "Rs 50" in coupons → "₹50" (same currency sign as the rest of the app).
- **Alignment fixes seen so far:**
  1. The floating View Cart pill text wraps into three staggered lines ("View" / "Cart" / "3 items"); it becomes one clean block: "View Cart" over "3 items", centered vertically.
  2. The pill covers the "Limited Time Deals" title on Home; it gets bottom spacing so content can scroll clear of it.
  3. The home search placeholder ("Search "Mango"") sits low and gets clipped while rolling; it is centered vertically in the pill.
  4. In Change Location, "Saved Addresses" and "+ Add New Address" each wrap to two lines; they become single lines on one row.
  5. Coupon input placeholder "Enter c…" is cut by a "Search" hint; the field shows "Enter coupon code" in full.
  6. "Delivering to :" has a stray space before the colon → "Delivering to:".
- Every other font, color and layout stays the same. Each fix is listed in `FIDELITY_NOTES.md` when it is built.

### D-22 · New screen found: "Welcome to Littlekart" location dialog
- **Status:** Made
- **Decision:** the site shows this dialog on first open when no delivery location is set: title "Welcome to Littlekart", subtitle "Set your delivery location to see fresh picks near you.", a green info box "Please provide your delivery location to start shopping.", the green "Use Current Location" button, "OR", and "Search delivery location". It goes into the build (it is part of the live app, not an addition).

### D-23 · Real business rules taken from the live system
- **Status:** Made (replaces several defaults in D-18)
- **Stores:** real dark stores in Nalgonda, each with a **6 km delivery radius** and hours **6:00 AM – 12:00 AM**. Our seed data copies these locations and rules (D-03's "virtual store" becomes these stores).
- **Delivery time:** computed, not fixed. 3 minutes per km from the store, plus packing time by item type: food and meat 25 min (max 30), print and other products 3 min (max 15). This explains the "15 MINS" / "30 MINS" chips and "about 15 / 35 minutes" in the header.
- **Time windows by group:** some categories sell only in set hours, e.g. Chicken 8:00 AM – 9:30 PM, Fish 8:00 AM – 8:00 PM; each group can also be paused manually.
- **Product variants:** each product has a list of weights, each with its own label, price, MRP and barcode.
- **Home deals and rows:** come from configurable sections ("Limited Time Deals 🔥", category rows with a product limit of 22).

### D-24 · We copy data shapes, not the live servers
- **Status:** Made
- **Decision:** our backend mirrors the live API's data shapes so the founder recognises them, but the app never calls `api.littlekart.com` and we don't copy its data in bulk. Product images use placeholders until the founder provides them.

---

## Development (M1 foundation, 23 Oct 2026)

### D-25 · Sizes come straight from the website, in dp; no `u(px)` scale
- **Status:** Made
- **Decision:** the website's CSS pixels at phone width equal Android dp, so measured values (e.g. ADD button 92×36, card radius 14) go into the app unchanged.
- **Replaces:** the `u(px) = px × width / 1080` rule in `CLAUDE.md` rule 3 and `DESIGN_SPEC.md` section 0. That rule existed only because we had screenshots and no source values.

### D-26 · Inter weights drawn exactly as the website draws them
- **Status:** Made
- **Decision:** the site loads only Inter 500, 600, 700 and 800, so the browser draws CSS weight 400 as 500, 650 as 700, 750 and 900 as 800. The app loads the same four files and maps weights the same way (`app/src/theme/fonts.ts`).

### D-27 · Expo SDK 57 with a development build, not Expo Go
- **Status:** Made
- **Why:** the Play Store's Expo Go lags behind the latest Expo version, and the map (D-13) and Razorpay (D-14) need native code that Expo Go can't run. A development build is your own debug copy of the app, built free on Expo's servers, and hot reload works the same. A rebuild is needed only when a native library is added.

### D-28 · One repository with npm workspaces: `app/`, `api/`, `shared/`
- **Status:** Made (D-19 confirmed)
- **Decision:** the business rules (bill, coupons, 30-unit limit, delivery time) live once in `shared/` and are used by both the app and the API. 16 tests cover them, including the screenshot bill (364 / 444 / 80 / 30 / 10 / 404) and the coupon hints (550 / 1300 / 1800 more).

### D-29 · Styles and state choices
- **Status:** Made
- Shadows use React Native's `boxShadow` style, which takes the website's CSS shadow values as they are.
- Icons: Material Icons (`@expo/vector-icons`), the same icon set the website uses through MUI.
- State: small Zustand stores saved on the phone (cart, login, delivery location). Data goes through repository interfaces, with a sample-data version (default) and an HTTP version for our API.
- The cart line's "−" at quantity 1 removes the line (behavior not captured; logged in `FIDELITY_NOTES.md`).

### D-30 · Two greens kept
- **Status:** Made
- **Decision:** primary green `#0c831f` (site token). The brighter green on login "Continue" and "Use Current Location" (`#01a32a`, seen in the site's stepper shadow and the screenshots) stays a separate token. Its exact value is re-measured on the login page in M2.

### D-31 · More findings from the website
- **Status:** Made
- **"Custom" tip chip is always orange:** it's the button for a custom amount, not a selected state (the site gives it a fixed `custom` class).
- **Guest cart:** a guest can open the cart. The bottom button reads "Login to Proceed", and the coupon card and the "Delivering to" row are hidden.
- **Stock line:** product cards show "Only N left" when stock is low.
- **Search placeholder words:** Mango, Milk, Rice, Shampoo, IceCream, Spinach.
- **More typo fixes:** "1 items" → "1 item"; "Briyani" → "Biryani" in product names; "Wt:500g" → "Wt: 500g".
- **Left as is:** lowercase product names from the catalog ("sneha brown eggs", "classmate 300 pages") and lower-case words in some tile names ("First aid", "Oral care"). These are capitalization, not spelling. Tell me if you want them title-cased.

### D-32 · Expo SDK 57, not the brand-new SDK 58
- **Status:** Made
- **Why:** SDK 58 was released on 21 Oct 2026, two days before we started, while SDK 57 has four months of fixes (57.0.31). Moving to 58 later is a routine upgrade. React Native 0.86.3, React 19.2.3. Every app library is pinned to the SDK 57 version that Expo chose.

### D-33 · Security warnings from npm
- **Status:** Made
- **Decision:** the test runner was updated to vitest 5 to remove its 2 critical warnings. The remaining warnings (21 high, 3 moderate) are all in build and development tools (Metro bundler, Expo command-line tools, Prisma's command-line tool). None of that code ships in the app or runs on the server in production. npm's suggested "fixes" are downgrades to years-old versions (e.g. Expo 44), so they are not applied. To be rechecked with each SDK upgrade.

### D-34 · How M1 was verified
- **Status:** Made
- Type check: 0 errors in `shared`, `api` and `app`. Lint: 0 problems. Tests: 16 shared + 3 API pass.
- Prisma schema validated with Prisma's own schema checker.
- Full Android bundle builds with Metro (3.4 MB), including fonts, images and the `shared` package.
- Component look: the gallery was rendered in a headless browser at 412 px wide and compared with littlekart.com. The Back pill was stretching to full width; fixed. The OFF ribbon, chips, ADD buttons and steppers match.
- Not verifiable from here: the look on a real Android phone. That needs your development build.

## M2: Login, OTP, success dialog (23 Oct 2026)

### D-35 · Login copied from the live page's own code
- **Status:** Made
- **Source:** littlekart.com's login code (the same flow as the Android app), not only the screenshots. It shows steps the screenshots never captured, and they are built:
  - **Continue first checks the number.** Known customer with a name → the code is sent. New number → a **"Full Name"** field appears (letters and spaces only) and the button becomes **"Send OTP"**. An account without a name shows "Please enter your name to complete login."
  - **Button states:** "Checking..." while looking the number up, "Sending OTP..." while sending. The button stays green and only its text greys out, as on the site.
  - **"OTP sent successfully!"** green toast for 1.5 s, 20% of the screen height above the bottom.
  - **OTP step:** 4 boxes (48 wide, 4 apart), paste fills all four, Backspace on an empty box moves back, the 4th digit verifies automatically (no button), "Verifying…" while checking, "Resend OTP in 0:56" counting down from 1:00. Android Back returns to the phone step.
  - **Messages, word for word:** "Enter a valid 10-digit Indian mobile number", "Name is required", "Incorrect OTP. Try again or tap Resend for a new code.", "Too many attempts. Please try later.", and the others in `app/src/strings.ts`.
  - **Success:** dialog with a green check, "Logged in successfully!" and "Taking you to your account...". It closes itself after 2 s, or at once on a tap outside, then goes to Home. Behind it the page returns to the phone step (as in screenshot 17).
- **Exact values from the site:** bright green `#01A32A` (the site's theme primary), Continue 50 tall with radius 14 and text 16/600, Skip 18/700 `#6b7280`, page padding 20 × 24, logo 150 wide, illustration 300 × 200, footer 12 px `#808080` with blue `#0d6efd` underlined links.
- **"Fresh & Fast"** uses the phone's system font: the site requests Poppins but never loads it.

### D-36 · Login API (review mode)
- **Status:** Made
- `GET /customers/:phone`, `POST /auth/otp/send`, `POST /auth/otp/verify`, `POST /auth/logout`, `GET /me`, using the same error codes as the live app.
- Rules: 4-digit code stored hashed, valid 5 minutes, 5 wrong tries ends it, 60 s between sends, at most 5 sends per hour per number. A new account needs a name.
- **Review mode:** no SMS provider (free tier, D-05), so every number (`REVIEW_PHONES=*`) uses the code `1234`. Narrow this to listed numbers before sharing widely; add a real SMS provider later without app changes.
- Codes and sessions are in memory for now (lost on restart); they move to Redis and PostgreSQL in the database milestone. 6 API tests cover sign-up, wrong code, resend timer, invalid numbers and the 5-try limit.
- In sample-data mode (the default) the app accepts `1234` too, and any new number goes through the Full Name step.

### D-37 · Text inputs styled like the site's fields
- **Status:** Made
- One `OutlinedInput` component: 1 px `rgba(0,0,0,0.23)` outline, 4 px corners, 2 px green outline when focused, red outline and 12 px red helper text on error. Used for the phone, name and OTP fields now, and the address form later.

### D-38 · Real logo and login illustration
- **Status:** Made (approved by you)
- The live app's logo and login illustration are used, resized for phones (`app/src/assets/brand/`). The splash screen uses the logo.

### D-39 · Delivery time in the header (live formula)
- **Status:** Made
- Read from the site's code. Groceries and other products: 15 to 20 minutes, picked from the distance (15 + metres mod 6), the same number the site shows for the same address.
- Food, meat and print: travel at 3 min per km plus packing time, rounded up to the next 5 minutes.
- Distance is a straight line to the nearest store. The site uses road distance, so the minutes can differ by a few at some addresses (FIDELITY_NOTES).

### D-40 · Header colours by time of day
- **Status:** Made
- Four header themes as on the site: morning 6–12, afternoon 12–16, evening 16–19, night (with stars) otherwise. The greeting uses the site's own hours (5–12, 12–17, 17–21, late night).
- The header collapses to the address bar as soon as the page is scrolled, like the site. Tapping the greeting or the address opens Change Location.

### D-41 · Location messages say "phone", not "browser"
- **Status:** Made (wording fix for an app)
- The site's messages say "browser" (for example when location is blocked). In the Android app this reads "phone". Everything else in those messages is word for word.

### D-42 · No amber focus ring
- **Status:** Made
- The amber border visible in some screenshots is the Android WebView's focus highlight, not part of the design. It is not drawn.

### D-43 · Location dialogs
- **Status:** Made
- **Welcome** (first open, no address yet): cannot be closed until a deliverable location is chosen. **Change Location** (from the header): closes with X or a tap outside.
- Use Current Location, search with suggestions from 3 letters, saved addresses for the signed-in user, and the site's messages for "outside delivery area" and errors.
- While the keyboard is open the dialog becomes a bottom sheet so the field stays visible.

### D-44 · Address search and pin lookup through free OpenStreetMap services
- **Status:** Made
- `GET /geo/reverse` uses Nominatim (1 request per second, answers cached). `GET /geo/autocomplete` uses Photon, which is built for search-as-you-type. No key, no card.
- Results are biased towards Nalgonda. Tests use a fake network, so they never call these services.

### D-45 · Home screen
- **Status:** Made
- **Deals:** horizontal grid of 3 rows, cards with the site's sizes, "ADD" turning into the stepper, 30-unit limit (D-18).
- **Banners:** auto-scrolling carousel. A banner opens its category screen when it has one.
- **Saved cart:** when you come back with items in the cart, the "You have items in your cart" dialog appears once per visit. X, the backdrop and "Goto Cart" all go to the cart, as on the site.
- **View Cart pill** at the bottom once the cart has items.
- **Not yet built (later milestones):** "View all" does nothing yet (M4), tapping a deal card does nothing yet, the mic opens search (the site's voice search is not built), the grey loading picture of Home is not drawn.
- Cart, Search, Profile, Category and Add Address are placeholder screens until their milestones.

### D-46 · Nearest store says whether it delivers
- **Status:** Made
- `GET /stores/nearest` returns the nearest store with `distanceKm` and `inRadius` (6 km), so the app can show "outside delivery area" with the distance instead of nothing.

### D-47 · Catalog API
- **Status:** Made
- `GET /home`, `/tiles/:id/subcategories`, `/subcategories/:id/products?q=`, `/products?ids=`, `/recommendations?cart=`, `/search?q=`, `/coupons`. They serve the same sample catalog as the app (now in `shared/src/seed/`) until the database milestone.

### D-48 · M3 check against the live site (23 Oct 2026, evening)
- **Status:** Made
- **Two broken references fixed** (they would have crashed the app or shown blank images on your phone): the login screen still pointed at the old placeholder logo, and the image loader didn't understand the catalog's `asset:` image keys.
- **Welcome dialog spacing:** the site's dialog library removes the top padding of the content under the title; ours kept 8 px. Removed, so the dialog is now 348 × 384 like the site's and every part sits at the site's position.
- **Colour rule:** 13 shadow and colour values typed directly into components were moved into the theme files (`colors.ts`, `layout.ts`), so every colour is defined in one place again.
- **Confirmed identical to the site:** deal cards (142 × 250, 3-row grid, same columns), the deal-card stepper after "+" (70 × 34, 13 px heavy count), the location dialog (radius 24, its shadow, 26 px heavy title, X hidden while a location is required), the header (two-line headline with the address tucked behind the search bar), and the saved-cart dialog text, which is word for word "You have a saved existing cart" / "You have N items in your saved cart. What would you like to do?" (D-45 paraphrased it).
- **Saved-cart dialog only for signed-in users:** on the site it is part of the server cart sync, so guests never see it. Same here.
- **Header minutes:** with chicken in the cart the header reads "about 35 minutes", as in your screenshot; with groceries only it reads 15 to 20 (17 at the Nalgonda bus stand, the same as the site's formula).

## M4: Category screen, size picker, filters, search (23 Oct 2026)

### D-49 · Thin borders are 1 px, not 0.8
- **Status:** Made (corrects D-20/WEB_STYLES values)
- The measuring browser reported every 1 px border as 0.8 px because of its zoom; the site's code says `1px` (and `1.2px` for the outlined ADD button). On a phone these draw at 1 dp. The theme's border width is now 1, and ADD uses 1.2.

### D-50 · Category screen copied from the site's code
- **Status:** Made
- One screen for every category (D-06): white header with Back pill and the **selected sub-category's** name, left rail (78 wide), grey product panel, 2-column grid (gap 4).
- **"Search in Chicken..."** shows when the screen is opened from a Home tile, as on the site; opened from a banner it is hidden. Typing filters the sub-category's products by name; × clears it.
- **Product card:** exactly the site's: blue ribbon only when there is a saving ("6%" or "₹3" when the percent rounds to 0), ETA chip, price chip with struck MRP, "₹X OFF", name always two lines tall, grey brand line, weight with "(2 options)", and the bottom bar with ADD. Photos are zoomed to 145% inside their frame, as on the site.
- **One size:** ADD turns into the "− 1 +" stepper with thin green dividers. **Several sizes:** the button always reads "ADD / 2 options" and opens the size picker, even when a size is already in the cart (site behaviour).
- **Size picker:** dialog with one tinted row per size (picture, size, dark-green price chip, MRP, "₹X OFF", ADD or stepper).
- **Products with two sizes list 1 kg first** (₹328, as the site shows); the sample data was reordered.

### D-51 · Filters, Sort and Price sheets
- **Status:** Made (not in your screenshots; part of the live app)
- The chips open the site's bottom sheet. **Filters**: tabs Sort / Price / Size on the left, options on the right. **Sort** and **Price** open their panel alone.
- Sorts: Recommended, Stock: High to Low, Price: Low to High, Price: High to Low, Discount. Price bands: Below ₹99 / ₹100-199 / Above ₹200 with counts. Size: multi-select. "Clear filter" resets the sheet; "Apply" applies and closes.
- Every rule uses the product's first size; out-of-stock products always go last. A chip turns green and shows the chosen value when set. Picking another sub-category clears the filters. 7 tests cover these rules (`shared/src/listing.ts`).
- On phones the site hides the separate Size and Brand chips; same here. Brand filtering is not built because the sample catalog has no brands.

### D-52 · Search screen
- **Status:** Made
- White bar with the Back pill inside, "Search for products" (keyboard opens), × to clear; results with the same chips and card in a 2-column grid; "No results found for "…"." with the site's second line when nothing matches.
- Results update a quarter-second after typing stops.
- The View Cart pill shows on search too (the site shows it; DESIGN_SPEC S11 assumed it didn't).

### D-53 · Every Home tile opens a working screen
- **Status:** Made
- Tiles without their own sub-category list in the sample data open with the tile itself as the only sub-category and its products (e.g. Dairy, Bread & Eggs shows eggs, butter and curd). Catla Fish (seen on the site) was added so Fish isn't empty. The app's sample mode and the API now share one set of catalog lookups.

### D-54 · Correction to D-31: no "Only N left" on cards
- **Status:** Made
- The "Only 9 left" measured on the site is **invisible placeholder text** that reserves a 20 px row. Cards keep the empty row and show nothing.

### D-55 · Cart screen copied from the site's code
- **Status:** Made
- Built from littlekart.com's cart code and measured styles (phone layout, 412 px): "‹ Back" + "My Cart", one card per line (thumbnail, name in 2 lines, "Wt: …", struck M.R.P. when there is one, green price, small green "− 1 +" stepper, red "Remove"), then "Often bought together" (3-column cards, 6 shown, "View more" opens every suggestion in a sheet), then — 40 px lower — the coupon card (signed in only), the free-delivery card, Bill Details, the tip card and the Cancellation Policy card.
- **Bottom bar:** guests get one green "Login to Proceed" (opens Login, which comes back to the cart). Signed-in users get "Delivering to: <name>" with the address under it and "Change" (opens Change Location), then "Pay ₹ N" and "Proceed To Pay".
- **Empty cart:** "Your cart is empty." and a green "Start shopping" button back to Home.
- **Stock:** at a line's stock limit "+" dims and shows "Only N units left" under the price (site behaviour). At the 30-unit limit "+" just stops (D-17). Out-of-stock lines get the red "Out of Stock" badge, drop out of the bill and change the button to "Remove Out of Stock Items to Proceed".
- **Proceed To Pay** does nothing yet: payment comes with orders (M9).

### D-56 · Real delivery fee rules (answers part of Q-02)
- **Status:** Made (replaces the "Fees" and "Custom tip cap" rows of D-18)
- The site loads its fee rules from a public settings endpoint; we copied the values (not the server):
  - Groceries below **₹99**: delivery ₹30 + platform ₹10. From ₹99 both show struck through with "FREE", and the cart shows "Add ₹N more for FREE delivery!" with a progress bar, then "Yay! You've unlocked FREE delivery!".
  - **Meat in the cart:** delivery ₹30 + platform ₹10 whatever the total (this is why the screenshot bill charges both on ₹364). Restaurant food: delivery ₹40, no platform fee.
  - After **10 PM** (India time): "Late Night Fee" ₹20. Beyond **5 km** with less than ₹499 of shopping: "Long Distance Fee" ₹30.
  - Every fee row has the site's "i" popup text. The grand total is never below ₹1.
- **Tip:** ₹10 / ₹20 / ₹30 chips (tap again to remove) and "Custom" (10 to 1000, digits only). The custom amount counts as soon as it is 10 or more; "Apply" closes the field.
- Rules and 15 tests are in `shared/src/pricing.ts` and `shared/src/tip.ts`. Rain-surge and special-event fees exist on the site but are switched off there, so they are not built.

### D-57 · Fixes on the cart (D-21)
- **Status:** Made
- "Delivering to : SV" → "Delivering to: SV" (no space before the colon).
- Custom tip row: the site leaves a 16 px margin under the amount field, so it sits higher than "Apply" and ×. They now line up.
- The bill's tip row showed the typed amount even when it was under ₹10 and not charged; it now shows only the tip that is actually added.
- Coupon copy writes "₹" instead of "Rs" (D-21): "Add non-exempt products worth ₹550 more to apply", "Add ₹550 more to apply".

### D-58 · Coupons
- **Status:** Made
- "View Coupons & Offers" (signed-in users) opens "Apply Coupons" as a bottom sheet: code field (typed in capitals; it also filters the list), "Apply" (grey until something is typed), "Available Coupons".
- When nothing applies: the grey note, then grey cards with the code chip, "₹50 Limited Offer" and the hint (or "Not available for exempt categories in this cart." when only meat is in the cart). When something applies: green-edged cards with "Save ₹50" and a green "Apply"; the rest say "Not Eligible".
- Applying shows "FESTIVE50 applied! You saved ₹50" and a box under the coupon card with Change / Remove; the bill gets "Coupon Discount − ₹50". If the cart later drops below the minimum, the coupon is removed with the site's message ("Coupon FESTIVE50 removed — non-exempt items are below ₹750").
- The check runs in the app with the shared rules for now; the server repeats it when the order is placed (D-16, M9). Coupons gained a `title`.

### D-59 · "Often bought together" has 10 sample suggestions
- **Status:** Made
- The live cart asks for up to 20 and shows 6 on a phone. The sample list now has 10 so "View more" (with its three small photos) appears.

### D-60 · Profile screen copied from the site's code
- **Status:** Made
- Header: "‹ Back" (goes to Home), "Profile" centred. Card with the round avatar, name and "+91…" number. "ACCOUNT": Orders, Saved Addresses, E-gift Cards, Refer a Friend, Account Privacy, Help. "MORE": About Us, Rate the App, Share the App. Red-outlined "Logout". Icons and tile colours are the site's (filled Material icons on light tinted tiles).
- **Rows** open /profile/<section> with the same header and the row's name, as on the site. Their contents arrive with their milestones: Saved Addresses (M7), Orders (M9). E-gift Cards, Refer a Friend, Account Privacy, Help and About Us show the header only for now (FIDELITY_NOTES).
- **Rate the App** opens the live LittleKart page on Google Play. **Share the App** opens the phone's share sheet with the site's text ("Download & shop daily essentials on Littlekart." + Android, iOS and web links).
- **Logout** signs out at once, with no confirmation (the site asks none), and opens Login, as the site does. This overrides BUILD_PROMPTS' "after confirming".
- Signed-out visitors who reach /profile are sent to Login (site behaviour).

### D-61 · Fix on the profile header (D-21)
- **Status:** Made
- The site balances the 72 px Back pill with a 40 px spacer, so "Profile" sits 16 px right of centre. The spacer now matches the pill, so the title is centred.

### D-62 · The map runs in a WebView (refines D-13)
- **Status:** Made
- **Decision:** the address map is MapLibre GL JS (pinned 5.9.0) with OpenFreeMap tiles, shown in `react-native-webview` (13.16.1, the version Expo SDK 57 ships with). Still no key and no card.
- **Why not the native MapLibre package:** this project runs React Native 0.86 with the New Architecture. The WebView module is tested by Expo for SDK 57; a native map SDK is one more native build that can break and that I can't test here. The look is the same (same tiles).
- **Needs:** a new development build, because the WebView is native code (one-time, same as before). The map loads its script and tiles from the internet.
- New library: `react-native-webview` (only for the map).

### D-63 · Add / Edit Address copied from the site's code
- **Status:** Made
- **Step 1, map (full screen):** search "Search for a location" with suggestions, round × (top right), fixed red pin with the dark "Your order will be delivered here" label (hidden while the map is dragged), "Use Current Location", and the bottom panel "Delivering your order to:" + address, and the orange **"Confirm Location & Proceed"**.
  - Opening Add New Address starts with the phone's location, as on the site. A fix worse than 55 m shows "GPS is ~Nm approximate — drag the pin to your exact doorstep, then confirm." and keeps Confirm grey until the pin is moved. Moving or tapping the map, or picking a suggestion, re-checks the point: outside every store's 6 km → "Not deliverable".
- **Step 2, form:** "Add New Address" (× goes back to the map), "Save address as *" chips Home / Work / Hotel / Other (Other opens a "Save as" field for your own label), the address box, then House No / Flat No / Building Name *, Nearby Landmark (optional), Name * (letters only, pre-filled), Phone Number * (10 digits, pre-filled), Cancel / Save ("Saving...").
  - The site's checks and messages: "Please select an address type." (red box round the chips), "House / Flat / Building is required", "Name is required", "Enter a valid 10-digit Indian mobile number". A label already used gives the site's "You already have an address with this label…" message.
- **Profile → Saved Addresses** now lists addresses ("SV · Home", address, blue edit and red delete buttons) under the orange "+ Add New Address" button; "No saved addresses yet." when empty. Edit opens the same screen as "Edit Address" / "Update".
- From the Change Location dialog, Save or Cancel brings the dialog back (site behaviour), with the new address in "Saved Addresses".
- Addresses live in the app's memory until the backend milestone (M8) stores them; they are lost when the app restarts.

### D-64 · Fixes on the address screens (D-21)
- **Status:** Made
- Field labels show one asterisk: "House No / Flat No / Building Name *", "Name *", "Phone Number *" (the live app shows "* *").
- The "Save as" field for a custom label had a 16 px bottom margin that lifted it above the chips; it now lines up with them.

### D-65 · Database layer: plain SQL with postgres.js (replaces Prisma and Upstash)
- **Status:** Made
- **Decision:** the API talks to PostgreSQL through `postgres.js` (one small library, no engine download) with numbered SQL files in `api/src/db/migrations/`. Prisma was dropped: its engines are downloaded from Prisma's servers, which my build environment can't reach, so I couldn't have run or tested it. One-time codes, resend cooldowns and the hourly limit live in PostgreSQL too, so Upstash (D-10) isn't needed. One free service fewer.
- **Tables:** catalog (categories, sections, tiles, sub-categories, products, sizes, banners, deal and suggestion lists), stores, stock, customers, sessions (only token hashes), one-time codes, addresses (one per label per customer, enforced by the database), cart items, coupons, settings. Orders and payments were added in M9 (D-68).
- **Two storage versions, same behaviour:** PostgreSQL in production; an in-memory version for quick runs and tests. The same 6 API tests run against both, including a check that the database answers every catalog request exactly like the sample data.
- **Start-up:** the server applies pending migrations; an empty database is filled with the sample catalog, stores, coupons and settings (`npm run db:seed` does the same by hand, and never resets stock or customers).

### D-66 · Deploying the API: Neon + Render + GitHub, all free, no card
- **Status:** Made (needs you to create the three free accounts; steps in README "Put the API online")
- `render.yaml` describes the API service (free plan, Singapore region, health check on /health). Render installs only the API and shared code, not the app.
- GitHub Actions (`.github/workflows/ci.yml`) runs type checks, lint and all tests, with a real PostgreSQL, on every push.
- `tsx` moved to the API's runtime dependencies so Render can run the TypeScript directly (no build step).

### D-67 · The cart follows the customer (signed in, backend mode)
- **Status:** Made
- With the backend on, a signed-in customer's cart is saved on the server: at login the phone's cart is joined with the saved one (same size in both → the larger quantity), then each change is saved about half a second later. The server drops unknown items and caps quantities by stock and the 30-unit limit.
- The "You have a saved existing cart" dialog now waits for this join, so it also appears when the saved cart came from another phone (site behaviour).
- Guests' carts stay on the phone. Sample-data mode keeps the cart on the phone only.
- Addresses go to the server too (`/addresses`), with the duplicate-label message coming from the server.

### D-68 · Orders and payments (M9)
- **Status:** Made
- **Order flow, copied from the site's code:** Proceed To Pay (cart) → **Order Summary** payment page → Submit Order → "✅ Order Submitted!" → tracking. Proceed To Pay asks for an address first, and stops with the site's warnings for out-of-stock items or an address outside the delivery area.
- **The server prices every order again** (items, sizes, stock, fees, tip, coupon) and refuses with the live messages; the phone's numbers are never trusted (D-16). Stock is taken when the order is created, in one database transaction, so two customers can't buy the last unit. Repeating the same request returns the same order, so a double tap can't order twice.
- **Cash on Delivery** only below ₹1000 of items and without meat or restaurant food (the live rule and wording). Otherwise the payment page shows the blue "UPI / card payment required" note.
- **UPI / card: Razorpay Standard Checkout in test mode** (free, no card needed). The app opens Razorpay's own payment sheet in a web view with the site's options (name "Littlekart", green theme; test keys prefill Razorpay's test contact). The server creates the Razorpay order, checks the payment signature and marks the order paid; Razorpay's webhook (optional) confirms payments even if the app is closed. Closing or failing the payment marks the order **Payment Failed** and puts the stock back; unpaid orders are given up after 15 minutes.
- Without Razorpay keys the server accepts Cash on Delivery only and answers UPI with the site's "Online payment is currently unavailable…" message. In **sample-data mode** there is no gateway: a UPI order is treated as paid at once.

### D-69 · Order statuses, as the live server names them (answers Q-04)
- **Status:** Made — please confirm
- Pending → Accepted → Delivery partner assigned → Delivery partner nearby → Delivered, plus Payment Failed and Cancelled; the tracking page shows the five steps Pending · Accepted · Assigned · Nearby · Delivered.
- There is no store or rider app in iteration 1 (D-03), so a new order **stays Pending**: nothing moves it forward automatically. "Arriving in N minutes" counts down from the site's estimate (store → address distance × 3 min/km + 5 min for groceries / 18 min for meat and food, capped at 15 / 30). Like the site, the tracking page and the floating card stop 45 minutes after the order and the order details take over.

### D-70 · Tracking page map
- **Status:** Made
- Same free map as the address screen (MapLibre + OpenFreeMap, D-62) instead of the site's map, with the site's store pin (blue house) and delivery pin (orange person) and the blue store → address line it shows before a partner is assigned. No live rider position (no rider app).

### D-71 · Things not copied because they belong to the real company
- **Status:** Made
- **Customer-support number** in "Cancel order": the site shows the live company's phone numbers. Ours comes from the settings (`supportPhone`), set to the placeholder 9999999999 until you give me the number to use.
- **Download Invoice** (order details) is not built: the site's invoice is a GST tax invoice with the company's legal name, GSTIN, PAN, CIN, FSSAI number and an authorised signatory's signature. Making that for a copy would mean producing tax documents in someone else's name. If you want an invoice, tell me whose details to print on it.
- Return / Replace requests, order rating and scheduled (next-morning slot) orders only appear after delivery or with slots, which this build doesn't have, so they are left for later.

### D-72 · Fidelity pass (M10): dev-only parts removed
- **Status:** Made
- The temporary component gallery (`/gallery`), the placeholder screen used before each screen was built, and three files nothing used any more (an old dialog, an old button, a duplicate sample-catalog file) are deleted. There were no other dev-only switches left: sample data vs our API is chosen only by `EXPO_PUBLIC_DATA_SOURCE` in `app/.env`.
- Unused texts, text styles and colours were removed. The two remaining hard-coded colours (inside the map and Razorpay web pages) now come from the theme.

### D-73 · Store hours: the "Sorry, we're CLOSED" sign and closed-store checkout
- **Status:** Made
- Found during the M10 check: after midnight littlekart.com shows an orange "Sorry, we're CLOSED — We'll be back at 6:00 AM" sign at the top of Home and the cart, and won't take orders. Copied from the site's code and measured at 412 px: the same hours rule (India time, 6:00 AM – 12:00 AM, both ends included), the sign, the cart's "Sorry, we're closed — We'll be back at 6:00 AM" warning on Proceed To Pay, the payment page's "Store is closed right now" note with a disabled "Store closed" button, and the server's "Store Closed" answer (store hours and the store's current time).
- **New dependency:** `@expo-google-fonts/dancing-script` (free font, no native code), for the handwritten "Sorry," as the site draws it.
- Not built: the site's next-morning delivery slots ("Choose a delivery slot", "Schedule Order"), which it offers only when slots are switched on in its settings.

### D-74 · Limited Time Deals page
- **Status:** Made
- "View all >" on Home's deals row did nothing; on the site it opens the deals page. Built from littlekart.com/deals at 412 px: category-style header with Back and the title, a title card, the 2-column product grid, and "Load more" every 20 deals.

### D-75 · Builds: test APK and Play Store bundle on EAS (M11)
- **Status:** Made — package name needs your answer (Q-09)
- `app/eas.json` has four profiles: **development** (the debug build you use with `npm start`), **preview** (installable APK with the sample data, no server needed), **preview-api** (installable APK using our API on Render) and **production** (Play Store `.aab`, signed with the keystore EAS creates, version code increased automatically). All are built free on Expo's servers (Free plan: 15 Android builds a month). Commands and what to expect are in README "Build an APK you can install".
- **App ID:** `in.littlekart.app` (placeholder). The live app's ID is `com.littlekart.shoppingcart`; reusing it would clash with the real app on a phone that has it and can't be published by anyone but its owner, so we keep our own ID until you decide.
- **Permissions:** location (delivery address) and internet only. Expo's default storage, "draw over other apps" and vibration permissions are removed, since the app doesn't use them.
- **Icon:** replaced by the LittleKart logo icon (D-88).
- Release builds only call `https://` addresses (Android's default), which our Render API is.

### D-76 · Iteration 2 begins: fixes from the first phone test
- **Status:** Made (your go-ahead, 25 Oct 2026: "copied is done, now we start moving forward")
- Iteration 1 (exact replica) is finished. From iteration 2 the live app is a reference, not a rule: where the phone test showed a problem, we fix it even if the live app has it too. D-01's "no redesign" applies only to iteration 1.
- Fixed from the test: home header text overlapping the search box (taller lines, height measured instead of fixed), the rolling search word spilling out of the box (now one word at a time, clipped), the cart's bottom bar and "Login to Proceed" running under the phone's navigation bar (now sit above it with a 12 px gap), and order-tracking texts now centred with the Back button on its own row.

### D-77 · New bottom dock: cart bar and tracking strip (replaces "View Cart" pill and the floating tracking card)
- **Status:** Made — a deliberate change from the live app
- One dock pinned to the bottom of Home, categories, deals and search: a full-width green **cart bar** (first three product photos, item count, total, "View Cart ›") and, when you have an active order, a white **tracking strip** above it (ETA, delivery OTP, "Track ›"). On other screens only the tracking strip shows; it hides on tracking, login, add-address and payment. Pages leave room for the dock so nothing hides behind it.
- When the estimate runs out, the ETA reads "Arriving shortly" instead of "Arriving in 0 minutes".

### D-78 · Real brand names in the catalog
- **Status:** Made (your instruction: "Yes use real Indian brand names")
- Products use real brand names (Amul, Haldiram's, Aashirvaad, Priya, Heritage, Vijaya, Parle, Britannia, ...) at prices close to Nalgonda shelf prices in Oct 2026. Restaurant and home-food sellers ("Nalgonda Spice Hub", "Sri Lakshmi Tiffins", "Annapurna Mess", "Amma Kitchen") are invented local names, not real businesses.
- Brand names and pack photos only identify the product; the app doesn't claim any partnership. Before a public launch the founder should make sure LittleKart is allowed to sell each brand it lists.

### D-79 · Assortment: every tile and sub-category has products
- **Status:** Made
- `shared/src/seed/assortment.ts` adds 364 products (393 in total, 2–12 per sub-category, many with two sizes) to the replica's 29. The live products keep their ids and come first. Limited Time Deals grows to 14 products and "Often bought together" to 16.
- The API database gets them with `npm run db:seed` (safe to re-run; removed banners are deleted, stock levels already in the database are kept).

### D-80 · Product photos: free-licensed images, loaded from their sources
- **Status:** Replaced by D-82 (photos are now bundled and cleaned up)
- 301 of 393 products have a photo: packaged goods from **Open Food Facts** (CC BY-SA), and fresh food, flowers, meat, dishes and non-food items from **Wikimedia Commons** (each file's own free licence). Every photo was checked by eye; unclear or wrong-brand photos were left out, so those products keep the neutral placeholder. Authors and licences are in `CREDITS.md`, which must ship with any public release.
- Photos are loaded over the internet and cached on the phone. If a photo can't load (offline, file removed), the placeholder shows instead. Home tiles, sub-category icons and the top category strip use the photo of one of their products.
- Fresh items show a typical photo of the item, not the exact pack the store sells. When the founder provides real photos (Q-07), they replace these by product id.

### D-81 · Home offer banners: our own designs
- **Status:** Made — a deliberate change from the live app
- The live banners are the company's artwork (D-71), so iteration 1 showed blank placeholders. Now each banner is drawn by the app: a coloured gradient, a short headline, a one-line description, a button and a photo. Five banners, each opening its category: Fresh Meat & Fish, Diwali Store (decoration kits), Pooja Flowers, Sweets, Veggies & Fruits. The live "Refer" banner is dropped because the app has no referral programme.
- Banner text lives in `app/src/strings.ts` (`banners`), designs in `app/src/features/home/bannerDesigns.ts`. To change the order or targets, edit `banners` in the seed catalog.

### D-82 · Product photos cleaned up and bundled in the app
- **Status:** Made (your request: "make the photos look more professional and sorted")
- Every product now has an image bundled in the app (`app/src/assets/products/<id>.webp`, about 5 MB in total), so pictures show instantly and work offline; nothing is loaded from other websites any more.
- 267 products use a free-licensed photo with the background removed (or, for loose items like dal and spices, a neat cropped square), centred on white at the same size with a soft shadow. Photos that showed hands, shop shelves, the wrong brand or were blurry were dropped.
- The other 126 products use a **drawn card**: a soft green tile with a matching icon and the brand name (for example Manforce, Lifree, Heritage). These replace the grey placeholder everywhere, including Sexual Wellness and Adult Diapers, which now have real pack photos for Durex, Skore and Friends.
- Inside each category, products with photos come first and products of the same brand sit together.
- The free photo service the app used before (D-80) is replaced; credits for the edited photos are in `CREDITS.md` and must ship with any public release. The home banners' photos are bundled too.

### D-83 · Pop-ups redesigned
- **Status:** Made (your request: redesign the pop-ups, keeping the platform's colours and text sizes)
- One shared pop-up style (`app/src/components/dialog/`): a rounded white card that rises in gently, a round tinted icon badge at the top (green for good news, red for problems), centred title and message, and full-width rounded buttons side by side. Same colour tokens and text styles as before.
- Applied to: saved cart after login (cart badge with item count; "Clear Cart" outlined red, "Goto Cart" filled green), order submitted (the ✅ emoji is replaced by a green check badge), payment errors, cancel order, reorder update, order items, login success and the bill's "i" explanation (now with a "Got it" button instead of the floating ×).
- The location, size picker, coupons, filters and Razorpay sheets keep their existing design.

### D-84 · Login button in the header
- **Status:** Made
- "Login" is now a pill button (person icon + Login) in the same place, height and outline as the round profile button you see after signing in, centred against the greeting block. The header looks the same whether you're signed in or not.

### D-85 · Smarter search (word by word)
- **Status:** Made (needed for voice search)
- Search now matches each word of the query on its own, in any order: "maggi noodles" finds "Maggi 2-Minute Masala Noodles", "tomatoes" finds "Tomato", one small typo is forgiven in longer words ("amull butter"), and sizes or filler words are ignored ("I want amul butter 500 gram"). Telugu and Hindi words in names match too. The same rule runs in the app and on the server (`shared/src/search.ts`).

### D-86 · Voice search
- **Status:** Made (your request)
- The mic in the Home search bar, the search page and every category search box now opens a "Listening…" pop-up (shared pop-up style, D-83): a pulsing green mic, the words appearing as you speak, and language chips for English, Telugu and Hindi (Hindi removed later, D-92). When you stop talking the words go into the search box and results show; from Home it opens the search page with the results.
- Uses the phone's own speech service through `expo-speech-recognition` (free, no account; needs internet on most phones). The app now asks for the microphone, with the message "LittleKart uses the microphone only for voice search. No audio is stored." If permission is refused, the pop-up offers "Open Settings"; on phones without a speech service the mic is hidden.
- Play Store: the listing's privacy section must say the microphone is used only for voice search and no audio is kept.

### D-87 · Order bill uses the server's clock
- **Status:** Made (bug found while testing)
- The late-night fee was worked out from a different clock than the store-hours check. Both now use the server's clock, so an order can never get the night fee at noon, or miss it at night.

### D-88 · App icon: the LittleKart logo
- **Status:** Made (your instruction: "put the littlekart logo on the icon, nothing else")
- The "littlekart" wordmark (green and orange, as on the website) centred on white. Files in `app/src/assets/icon/`: `adaptive-foreground.png` + white background (Android 8+, every launcher shape), `monochrome.png` (Android 13+ themed icons), `icon.png` (older phones) and `play-store-512.png` (the Play Store listing). The name under the icon stays "LittleKart".
- The wordmark sits inside Android's safe zone so circle, rounded-square and squircle launchers never clip it. If the founder later sends a dedicated icon file, it replaces these.

### D-89 · Tidier product photos, tested category by category
- **Status:** Made (your request: photos looked clustered and unprofessional)
- Every image is now built the same way on a 480 × 480 white square with the same margin all round:
  - **Cut-out items**: one main item only (a heap of cashews becomes one clear cashew group, scattered pieces are dropped), scaled so the longest side is 78% of the square, centred, soft shadow.
  - **Loose items** (dal, spices, flowers, dishes): a round crop of the photo, like a bowl seen from above, 80% wide.
  - **Packs that couldn't be cut out cleanly** (Bingo, Dairy Milk, Corn Flakes…): a rounded-square crop of the pack, 80% wide.
  - **Drawn cards** (128 products): centred and the same size as the photos.
- Tests: `shared/test/catalog-categories.test.ts` checks every home category one by one (51 categories, 59 sub-category screens): each has products, valid names, sizes and prices, and every product has its own registered 480 × 480 image; photos come before drawn cards. `tools/check_product_images.py` checks every image's pixels: white margin, centred, not too small. A screen test opened all 59 category screens in the web preview: every product card showed, no broken images.

### D-90 · Smart suggestions in the cart and on the payment page
- **Status:** Made (your request: "Smart Suggestions on the cart page and a new row on the payment page")
- "Often bought together" in the cart is no longer a fixed list. It now looks at what is in the cart and suggests what usually goes with it: bread → jam, butter, biscuits, tea; noodles → sauces, cool drinks; chips → cool drinks, namkeen; flowers → pooja items, sweets; chicken → masalas, oil. It takes turns between cart items (most recently added first), gives at most 3 products from one shelf, then adds more from the cart's own shelves, then the popular list. Cart items and sold-out items never show. Meat, sexual wellness and adult diapers are never pushed from another shelf.
- The payment page gets a "Suggested products" row between the items and the bill: up to 10 of the same suggestions in one sideways row, using the cart's small cards. ADD puts the product in the cart, and the items list and the bill on the payment page update straight away.
- One rule for the app and the server: `shared/src/suggest.ts` (the shelf pairings are the `COMPLEMENTS` table there). Tests in `shared/test/suggest.test.ts`.

### D-91 · Swap & save (cheaper only, like Zepto)
- **Status:** Made (your request: "Cheaper one just like Zepto has exactly, as littlekart audience is tier 3 they are price conscious")
- Under a cart item, a light-green strip "Swap & save ₹X · Try <product>" appears when a cheaper product of the same kind exists. Tapping it opens a pop-up (D-83 design) with the two products side by side, the total saving for the quantity in the cart, and "No thanks" / "Swap". Swap replaces the item in the same spot and keeps the quantity (within its stock and the 30-unit limit); a snackbar says how much was saved and offers "Undo" for 5 seconds. "No thanks" hides that offer until the app is opened again.
- A swap is offered only when it really saves: at least ₹3 and 3% of the price, a similar pack size (80% to 150% of the size in the cart), and never more per gram/ml/piece. At most one offer per item and three per cart, biggest savings first. Products with a photo are preferred over drawn cards.
- Which products count as "the same kind" is a hand-picked list (`shared/src/seed/swaps.ts`: sunflower oils, basmati rice, atta, milk, tea, health drinks, instant noodles, juices, bhujia, biscuits, cones, protein bars, parotas, hand wash, toothpaste, soaps, deodorants, pads, adult diapers, condoms, pencils, face wash, dog food). Medicines, meat, vegetables, flowers and loose items are never swapped. With the founder's real catalog, these groups would come from its categories.
- Logic in `shared/src/swap.ts`, used by the app and by the new API endpoint `GET /swaps`. Tests in `shared/test/swap.test.ts` and `api/test/catalog.test.ts`.

### D-92 · Voice search: English and Telugu only
- **Status:** Made (your instruction: remove Hindi)
- The voice pop-up's language chips are now English and తెలుగు. Search still matches Hindi words inside product names when typed.

### D-93 · Alignment fixes from the phone test
- **Status:** Made (your phone screenshots)
- ADD buttons on the small three-in-a-row cards (cart, "View more" sheet, payment row): "ADD" and "2 options" now always stay on one line each inside the button.
- Apply Coupons: the code box shows "Enter coupon code" on one line; the extra "Search" word inside the box was removed (the search icon stays), and the box and Apply button are the same height.
- Cart bottom bar: "Delivering to" and Change sit on one centre line; the Pay amount and Proceed To Pay share one 48-dp row with even spacing.

### D-94 · One picture style: drawn home tiles and drawn products
- **Status:** Made (your request: the photos looked random and taken from different websites; you approved the sample style)
- **Home tiles, top-strip categories and sub-categories (61 pictures)**: drawn for this app in one style: a soft tinted background (each tile's own pastel from the app's tone colours), two or three simple items standing on one floor line, the same side shading, highlight and floor shadow, no brand logos. Source: `tools/tiles/lib.mjs` (drawing kit) and `tools/tiles/tiles.mjs`; `node tools/tiles/build.mjs` renders them to `app/src/assets/tiles/` and writes `tileImages.ts`. The catalog points at them as `asset:t/<id>`.
- **Products**: the 128 icon cards and 27 weak photos (blurry, cropped, dark or thin, e.g. Ariel, Rin, Wild Stone, pens, foil) are replaced by drawn pictures in the same style (`tools/tiles/products.mjs`, `build-products.mjs`), framed exactly like the photos (`frame.py`: 78% of a white 480 × 480 square, centred, same shadow). Clean photos stay. Their credits were removed from CREDITS.md.
- Product cards zoom the picture to 122% instead of the site's 145%, so an item is never cut off at the edges.
- Nothing else changed: tile shapes, sizes, labels, grid, colours and fonts are as before. Tests check every tile, category and sub-category has its registered 480 × 480 picture; the pixel check passes for all 393 product pictures.

### D-95 · One-step import of LittleKart's own catalog
- **Status:** Made (ready for when the founder shares his product export)
- `node tools/import-catalog.mjs <products.csv> [<images folder>]` reads a CSV (tile, sub_category, name, size, mrp, price, stock, image), groups sizes into products, frames every photo like ours (`tools/frame-photo.py`), and writes `shared/src/seed/founderCatalog.ts`. When that file has products, the app and the API use it instead of the sample catalog: home tiles without products are hidden, and deals / popular lists are taken from the imported products until the founder picks them. It lists rows it could not place (unknown tile, missing price, missing image).
- After an import, the tests written for the sample products (ids such as `india-gate-basmati`) need updating to the real ids, and Swap & save groups (D-91) need regrouping with the real products.

### D-96 · Every product picture drawn in one style
- **Status:** Made (your request: "remove the random images and implement the new style")
- The remaining 238 product photos are replaced by drawn pictures in the same style as the home tiles (`tools/tiles/products2.mjs`), so all 393 products are drawn and framed the same way (78% of a white 480 × 480 square, centred, same shadow). Each keeps its brand colours (a red Thums Up bottle, a yellow Maggi pack), with no logos or brand artwork.
- CREDITS.md now lists only the five home-banner photos.

### D-97 · Product page
- **Status:** Made (your request, laid out from your screenshots of the live LittleKart app)
- Tapping a product card's picture or text, a deal's picture or a cart line's picture opens `/product/<id>`, which shows, top to bottom:
  - Back, with round Search and Share buttons.
  - The picture, swipeable, with dots when there is more than one.
  - Name, "Net quantity", price with the struck MRP, "₹X OFF" and "(Incl. of all taxes)".
  - "Select Unit" chips, one per size.
  - "Add to cart", which becomes a full-width − 1 + bar once added.
  - The "Fast delivery" card with the delivery time.
  - "Description" and a "View more info" panel: category, available sizes, type.
  - "Similar products": same shelf, closest price first.
  - "Popular in this category": every shelf of the tile, biggest discount first.
- Each row of cards has ‹ › buttons and "View more", which opens the category. The View Cart bar shows on this page too.
- One rule for the app and the server: `shared/src/related.ts`, with the new API endpoint `GET /products/:id/related`. Tests in `shared/test/related.test.ts` and `api/test/catalog.test.ts`.

### D-98 · End-to-end test of the whole app
- **Status:** Done for this iteration
- `tools/e2e-web.mjs` walks through the web preview of the app in 20 steps. It passed at phone widths 360 and 400 with no errors:
  - Login with OTP.
  - Home tiles, a category, switching sub-category, Sort and Filters.
  - ADD from a card.
  - The product page: add, +, −, sizes, more info, similar and popular rows, View more, and a missing product.
  - Search, and opening a deal.
  - The cart: Swap & save with Undo, suggestions, coupons.
  - Proceed To Pay, with the payment-page suggestion updating the bill.
  - Cash on delivery, the submitted order, tracking, and the orders list.
  - Every home section's categories.
- All 395 unit tests pass, all 393 product pictures pass the picture check, and lint, type checks and the Android bundle build are clean.

### D-99 · Banner pictures drawn too
- **Status:** Made (your request: the home banners still showed photos)
- The five home offer banners (Fresh Meat & Fish, Pooja Flowers, Sweets, Veggies & Fruits, Diwali Store) now use drawn scenes in the same style as the tiles and products (`tools/tiles/banners.mjs`, `node tools/tiles/build-banners.mjs`). The banner cards, colours, text and carousel are unchanged. No photos are left in the app; CREDITS.md says so.

### D-100 · Location pop-up alignment, tested
- **Status:** Made (your request: the location pop-up must be perfectly aligned)
- Fixed: in "Change Location", "Saved Addresses" was cut to "Saved Addre…" on phones under about 400 px wide. Both labels now always show in full: side by side when they fit, otherwise "+ Add New Address" moves under the heading. On very narrow phones (under 350 px, e.g. 320) the pop-up keeps 20 px from the screen edges instead of 32, so "Use Current Location" and the search hint stay on one line.
- `tools/location-test.mjs` measures the pop-ups at 320, 360, 393 and 412 px wide, 29 checks per width, all passing (116/116):
  - The card is the same distance from both screen edges and centred top to bottom.
  - The info box, button and search field line up with the card's 24 px padding, and so does the suggestion list.
  - Nothing sticks out of the card, nothing is cut off with "…", and the search hint fits its field.
  - The close button sits 16 px inside the top-right corner and the title is clear of it.
  - "Use Current Location" is centred in "Change Location".
  - Choosing a suggestion or using the GPS saves the address and closes the pop-up.
  - The cart's "Change" opens the same pop-up, and "+ Add New Address" opens its page with no sideways scrolling.
- The end-to-end test (D-98) now runs its clock at 12:30 IST, so checkout is not blocked by the store-hours rule when it is run at night. It still passes 20/20 at 360 and 400 px.

### D-101 · Nutrition tags and Nutritional info (like Zepto)
- **Status:** Made (your request; your choices: public data, the nutrition-based tag set)
- **Cards**: the row under the size that the site keeps empty now shows up to two tags when the product's numbers support them, e.g. "High protein · Non-veg" on chicken and "Low sugar · No trans-fat" on chips. No layout change.
- **Product page**: the same tags as small chips under the price, and a "Nutritional info" card under the details. It has a summary ("This product has 120 calories, 23g protein, 0g carbs, 2.6g fats in every 100 g.") in coloured pills, and "View more" for the full table (energy, protein, carbohydrates, sugars, fat, saturated fat, trans fat, fibre, sodium) with its source.
- **Tags follow India's FSSAI claim rules (2018)**:

  | Tag | Rule |
  |---|---|
  | High protein | ≥ 10.8 g per 100 g (5.4 g per 100 ml) |
  | High fibre | ≥ 6 g per 100 g, or 3 g per 100 kcal |
  | Low fat | ≤ 3 g per 100 g (1.5 g per 100 ml) |
  | Low sugar | ≤ 5 g per 100 g (2.5 g per 100 ml) |
  | No trans-fat | ≤ 0.2 g, and only when trans fat is reported |
  | Veg / Non-veg | the product's food type |

  "Low" claims are only made where the nutrient matters, so there is no "low sugar" ghee and no "low fat" cola.
- **Data (103 food products, nothing made up)**: `shared/src/seed/nutrition.ts`.
  - **Packaged foods (46)**: the same product's label data on Open Food Facts. Each entry was checked by hand to be that product, and its energy checked against its protein, carbs and fat. Entries for a different product or with inconsistent numbers were left out.
  - **Fresh and loose foods (57)**: USDA FoodData Central reference values for the named food (vegetables, fruit, chicken, goat meat as mutton, carp for rohu/catla, king mackerel for seer fish, shrimp, eggs, dals, rice, rava, nuts, dates, cumin, oils, ghee, honey).
  - **No nutrition section**: non-food items and foods without trustworthy data (restaurant dishes, sweets without a matching entry, etc.).
- **LittleKart's own data**: the catalog import (D-95) now reads optional nutrition columns and uses them instead.
- **Tests**: rules, data sanity and a new end-to-end step (`shared/test/nutrition.test.ts`, `tools/e2e-web.mjs`).

### D-102 · Ask AI: plan a dish, get the ingredients, confirm, then cart
- **Status:** Made (your request and choices: Google Gemini free tier, English and Telugu, everyone can use it, guests log in after confirming)
- **Button**: a green "✦ Ask AI" pill, bottom-right on Home and the category screens, 12 px above the cart bar (or at the bottom when the cart is empty). Pages leave room for it at the end. Not shown on the product, cart, payment or login screens.
- **Chat**: a bottom sheet in the "View more" style. It opens with "What are you preparing today?…" and a Telugu line, plus four quick prompts. The shopper types or speaks (the same voice pop-up as search, English and Telugu). The assistant asks for the dish, then the number of people, one question at a time.
- **The list**: ingredients with picture, size, use, price and a − qty + stepper, all ticked. "Goes well with (optional)" items (at most 3) are never ticked. Ingredients the shop doesn't sell are left out quietly: no other product is swapped in, and the chat never says something is missing (your call after the phone test: a "not sold here" line feels negative).
- **Feels like an AI answering** (your request after the phone test): "Thinking…" while it works, then the reply types out word by word with a blinking green cursor (at most 1.6 s), then the list rows slide in one after another, then the "Add to cart" button appears. Sending a new message shows the current answer in full at once.
- **Text box**: the hint is "Type a dish…" on one line and the cursor starts top-left; the box grows as you type.
  - "I already have rice and curd" removes those items. Unticked items and changed quantities stay as the shopper set them when the list updates.
  - "No suggestions" (English or Telugu) removes the extras for the rest of the chat. This is checked in code, not left to the model.
- **Nothing reaches the cart until "Add N items to cart · ₹total"**. Then the cart opens. A guest goes to Login first and lands on the cart after logging in.
- **Answers**: Google Gemini (`gemini-flash-lite-latest`, then `gemini-3.5-flash-lite` when busy; about 1–3 s), with JSON output. Every product, size and quantity it returns is checked against the catalog. Unknown or sold-out products are dropped, quantities stay within 1–10 and the stock, and "not sold" names the shop does sell are removed. Only food, drink, kitchen and pooja shelves are offered.
- **Backup**: when Gemini can't be reached (no key, no internet, free-tier limit), a built-in list of 32 dishes answers in English or Telugu. It covers biryanis, curries, fish, prawns, egg, sambar, pappu, paneer, idli/dosa, pesarattu, upma, rice dishes, fries, sweets, tea/coffee, a party and pooja.
- **Where the key lives**:
  - Server builds (`preview-api`, `production`): `GEMINI_API_KEY` on the API server, which serves `POST /ai/chat`. Each address may send 30 messages per 10 minutes.
  - Sample-data builds (`preview`, the phone build): there is no server, so the app calls Gemini with `EXPO_PUBLIC_GEMINI_API_KEY`, an EAS environment variable (`preview` environment). It is never written in the repository.
- **Files**:
  - shared: `shared/src/ai/*` (catalog, prompt, Gemini client, checks, recipes, built-in answers) and its tests.
  - API: `api/src/routes/ai.ts` and `api/test/ai.test.ts`.
  - App: `app/src/features/ai/*`. The voice pop-up now takes its hint and button text as props.
  - Tools: `tools/ask-ai-test.mjs` (13 browser checks).

### D-103 · Schedule for later while the store is closed (like Swiggy Instamart); Ask AI renamed "Ask Little"
- **Status:** Made (your request)
- **When**: only while the store is closed (12:00 AM – 6:00 AM, store hours D-73). In opening hours ordering works exactly as before.
- **Cart**: the closed sign stays, and the button reads "Schedule Delivery". It opens "Schedule delivery", a bottom sheet in the "View more" style, with one-hour slots for the next opening hours, grouped by day ("Today" after midnight). The slots run 6:00 AM - 7:00 AM … 11:00 PM - 12:00 AM, written like the site's own slots. The button reads "Choose a delivery slot" until one is picked, then "Schedule & Proceed".
- **Payment page**: a "Scheduled delivery · Today, 8:00 AM - 9:00 AM" card with Change, and the button reads "Schedule Order". Bill, fees, coupons and payment methods are unchanged. If the store closes while someone is on this page, the button reads "Choose a delivery slot".
- **Checks**: the server (and sample mode) accept an order while closed only with a slot that can still be booked. A slot picked at 5:59 AM still works after 6:00 until the slot ends. Otherwise the answer is "Slot unavailable", with "Choose another slot".
- **After ordering**:
  - The tracking strip and page say "Arriving today, 8:00 AM - 9:00 AM", then "Arriving by 9:00 AM" during the slot.
  - Tracking runs until 45 minutes after the slot.
  - My Orders → "Scheduled" lists these orders, and the order details say "Scheduled for Today, 8:00 AM - 9:00 AM".
- **Database**: migration `003_scheduled.sql` adds `scheduled_start` / `scheduled_end` to `orders`. The server applies it by itself at start-up.
- **Ask AI is now "Ask Little"**: the button, the chat title and the labels. Nothing else changed.
- **Files**:
  - shared: `shared/src/schedule.ts` and its tests.
  - API: `api/src/routes/orders.ts`, `api/src/data/pgOrders.ts`.
  - App: `app/src/features/schedule/*`, cart, payment, orders and checkout store.
  - Tools: `tools/schedule-test.mjs` (9 browser checks).

---

## Open questions (answers become decisions above)

- **Q-01** Confirm or change the numbers in D-18.
- **Q-02** Is there a minimum order value? (The free-delivery threshold is ₹99, D-56.)
- **Q-03** ~~Online payment only, or cash on delivery too?~~ Both, with the live COD rule (D-68).
- **Q-04** With no rider, orders stay "Pending" (D-69). Tell me if you'd rather have them move through the statuses automatically for a demo.
- **Q-05** Is the small visual difference of an OpenStreetMap-based map acceptable (D-13)?
- **Q-06** Are fixed OTPs for approved test numbers fine for the review (D-12)?
- **Q-07** Can the founder share the real catalog (products, prices, images), or do we seed it from the screenshots?
- **Q-08** Which customer-support number should "Cancel order" show (D-71)?
- **Q-09** What should the Android package name (app ID) be for the Play Store? It can't be changed after the first upload (D-75).
