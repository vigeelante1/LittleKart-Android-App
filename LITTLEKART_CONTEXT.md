# LittleKart — Project context

Read this first, then `DESIGN_SPEC.md`, `ARCHITECTURE.md`, `CLAUDE.md` and `BUILD_PROMPTS.md`.

## 1. The task
LittleKart already has a **live Android app**. My job (an assignment from LittleKart's founder) is to **rebuild that app so it looks and behaves exactly the same: "the same, no change."**
- It is a pixel-faithful replica, not a redesign. No new features, no "improvements", no different colors or fonts.
- Source of truth: the screenshots and photos in `reference/` plus the measurements in `DESIGN_SPEC.md`.
- Scope right now: **only the screens captured so far** (listed in `DESIGN_SPEC.md`, sections S1 to S20). Anything not captured is out of scope until I send screenshots.
- I work on this with Claude Code writing most of the code. I test on my phone and report what looks different.

## 2. What LittleKart is
- Quick-commerce grocery delivery from local dark stores, active in Telangana (Telugu-speaking customers; the shown address is in Nalgonda district).
- The app sells groceries and also food and meat, pooja and flowers, snacks and drinks, stationery and sports, health and wellness, and more.
- Delivery estimates vary: the home header says "about 15 minutes" or "about 35 minutes" (set by the server), and each product shows a "15 MINS" or "30 MINS" chip.
- Fees seen: delivery fee ₹30 and platform fee ₹10; optional tip ₹10 / ₹20 / ₹30 / custom.
- Coupons have minimum order values, and exempt categories (like meat) do not count toward the minimum.

## 3. Language
- **The interface is in English.** Telugu appears only inside product names (`Telugu | English | Hindi | English`).
- Do not build a Telugu UI, a language switch, or any translation system. Keep all UI strings in one `strings.ts` file so they are easy to change later, but only in English.

## 4. What I do not have yet (do not guess these; ask me)
- **The backend and its API.** The live app has one, but I don't have its documentation. Build against a repository layer with mock data (see `ARCHITECTURE.md`) and swap it later.
- **Real assets:** logo, app icon, login illustration, banner images, category and product images, the map pin. Use clearly named placeholders until I provide them.
- **Screens not captured:** orders list and tracking, payment, order success, product detail, search results, saved-addresses list, mobile layout of Add New Address, filters/sort/price sheets, E-gift Cards, Refer a Friend, Account Privacy, Help, About Us.
- **Exact sizes:** font sizes and spacings in the spec are estimates from screenshots (±10%). I will compare on my phone and tell you what to adjust.

## 5. Facts worth knowing
- The screenshots in `reference/screens/` are color-corrected. The photos in `reference/photos/` are phone-screen photos, so they are good for layout and text but not for colors.
- The live app has some typos ("Resturants", "Stationary Items", "Umbrella's & Raincoat's"). **Keep them exactly.**
- Where two screens look inconsistent (two different greens, blue ribbon vs crimson % OFF text), the spec records both. Keep both.

## 6. Working style
- One milestone at a time from `BUILD_PROMPTS.md`.
- Make reasonable assumptions and deliver finished work. Ask only about items in section 4 that block progress, and put one clear question at the end of your message.
- Small files: data, styles, components and logic separated. No single giant file.
- Never show developer text ("demo", "mock", "TODO") in the UI.
