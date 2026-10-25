# LittleKart Android — exact replica

**Read first, in this order:** `DECISIONS.md` (wins over everything else), `LITTLEKART_CONTEXT.md`, `reference/WEB_STYLES.md`, `DESIGN_SPEC.md`, `ARCHITECTURE.md`, `BUILD_PROMPTS.md`.
**Then look at the images** in `reference/` and at **littlekart.com** (same app as the Android app, DECISIONS D-20) for the screens the milestone covers.

## Mission
Rebuild the live LittleKart Android app so it looks and behaves the same. Iteration 1 (the exact replica) is finished. **Iteration 2 is under way (D-76):** fixes and improvements the owner asks for may differ from the live app; record each one in DECISIONS.md and FIDELITY_NOTES.md. Don't add anything not asked for.
Source of truth, in order: littlekart.com's computed styles and behavior → the screenshots → ask.

## Fidelity rules
1. Colors come only from the tokens in `app/src/theme/colors.ts` (values measured on the site). Never hard-code a hex value in a screen or component.
2. Font is **Inter**, loaded in weights 500/600/700/800 only, mapped the way the browser draws them (D-26). Telugu falls back to the system font automatically.
3. Sizes come from the site's computed styles at 412 px width (`reference/WEB_STYLES.md`) and are used **directly as dp** (D-25). Measure on the site before building a screen.
4. All text goes through `AppText` (`allowFontScaling={false}`) with a variant from `app/src/theme/typography.ts`.
5. Keep text exactly as in the live app **except** spelling mistakes and misalignments, which are fixed (D-21, D-31). Keep wording such as "Goto Cart".
6. UI language is English only. No i18n framework, no Telugu UI, no language switch. All strings live in `app/src/strings.ts`.
7. Do not add screens, buttons, animations, haptics, skeleton loaders, empty states or settings the live app doesn't have. Loading and error states stay minimal and neutral; note them in `FIDELITY_NOTES.md`.
8. Placeholder assets live in `app/src/assets/placeholders/`, named by role, neutral, with no text.

## Stack
- Expo SDK 57 + React Native + TypeScript (strict), Expo Router in `app/src/app/`, **development build** (D-27). Use `npx expo install` for app libraries.
- Our own backend in `api/` (Fastify + PostgreSQL on Neon), free tiers only, nothing that needs a card on file (D-04 to D-15).
- Business rules (bill, coupons, 30-unit limit, delivery time) live in `shared/` and are used by both app and API (D-28).
- State: Zustand stores persisted with AsyncStorage. Data only through the repository interfaces in `app/src/services/`; never `fetch` from a screen.
- Icons: Material Icons via `@expo/vector-icons` (same set as the site). Images: `expo-image`.
- Builds: EAS cloud builds. No Android Studio.

## Code rules
- TypeScript strict, no `any`. One component per file. Screens stay thin: layout plus calls to hooks.
- Do not add a library without saying why first.
- Do not edit `android/` or `ios/` by hand; native settings go in `app.json` and config plugins.
- Never touch `.env` files except to read variable names.

## Workflow
- One milestone at a time from `BUILD_PROMPTS.md`.
- After every change: `npm run typecheck`, `npm test`, `npx expo lint` (in `app/`), and fix what they report.
- End of a milestone: (1) files changed, (2) every place the match may not be exact and why, (3) exactly what to test on the phone and what to compare it with, (4) commit.
- Every decision goes into `DECISIONS.md` with the next number; uncertain values and guessed behavior into `FIDELITY_NOTES.md`.

## Scope
Iteration 1 covers the customer app as it exists on the live app and littlekart.com. Screens not in the screenshots are built from the website in later milestones. No rider app, no warehouse app, no admin panel (D-03).
