# LittleKart Android app

Exact replica of the live LittleKart app (iteration 1), with our own free-tier backend.

| Folder | What it is |
|---|---|
| `app/` | The Android app (Expo SDK 57, React Native, TypeScript, Expo Router) |
| `api/` | The backend (Fastify, TypeScript, PostgreSQL on Neon) |
| `shared/` | Business rules used by both: bill, coupons, 30-unit limit, delivery time |
| `reference/` | Screenshots and the styles measured on littlekart.com |
| `DECISIONS.md` | Every decision, numbered. Read this to follow the work. |
| `FIDELITY_NOTES.md` | Anything not yet confirmed against the live app |

## One-time setup on Windows

You need **Node.js 22 LTS** (https://nodejs.org) and **Git**. Open PowerShell in this folder:

```powershell
npm install                      # installs app, api and shared (versions are pinned for Expo SDK 57)
npm test                         # all shared and API tests should pass
npm run typecheck                # should print no errors
```
These already pass on my side (DECISIONS D-34).

## Run the app on your phone (development build)

The Play Store's Expo Go lags behind the latest Expo version, and the map and payments need native code later anyway, so we use a **development build**: your own debug copy of the app. It's built free on Expo's servers (DECISIONS D-27).

1. Create a free account at https://expo.dev (no card).
2. Build once (about 15 minutes; repeat only when native libraries change):
   ```powershell
   cd app
   npx eas-cli login
   npx eas-cli build -p android --profile development
   ```
3. Open the link Expo gives you on your phone, install the APK (allow "install unknown apps").
4. Start the code server on your PC and open the app on the phone (same Wi-Fi):
   ```powershell
   cd app
   npm start
   ```
   Scan the QR code with the phone camera, or type the shown URL in the app. If Wi-Fi blocks it: `npx expo start --dev-client --tunnel`.

Code changes then appear on the phone instantly.

## Run the API on your PC (optional)
```powershell
cd api
copy .env.example .env
npm run dev                      # http://localhost:4000/health
```
Without `DATABASE_URL` the API uses the sample data in memory (nothing is saved). With a Neon connection string in `api/.env` it creates its tables and loads the catalog by itself on first start.

The app uses its built-in sample data until `app/.env` says otherwise:
```
EXPO_PUBLIC_DATA_SOURCE=http
EXPO_PUBLIC_API_URL=http://<your PC's Wi-Fi IP>:4000      # or the Render address below
```

## Put the API online (free, no card)
1. **Database: Neon.** Sign up at https://neon.tech with GitHub or Google. Create a project (region: Singapore). Copy the **pooled** connection string (it contains `-pooler` and ends with `?sslmode=require`).
2. **Code: GitHub.** Create a private repository and push this folder to it (`git push`). GitHub Actions then runs all checks on every push (`.github/workflows/ci.yml`; if your copy has `github-ci.yml` in the main folder instead, move it to `.github/workflows/ci.yml` first: my tools can't write into `.github` folders on your PC).
3. **Server: Render.** Sign up at https://render.com with GitHub. New → **Blueprint** → pick the repository; Render reads `render.yaml`. Paste the Neon connection string as `DATABASE_URL` and confirm. The first deploy takes a few minutes; then `https://littlekart-api.onrender.com/health` answers `{"ok":true}` (the exact address is shown in Render).
4. **App:** in `app/.env` set `EXPO_PUBLIC_DATA_SOURCE=http` and `EXPO_PUBLIC_API_URL=<the Render address>`, then restart `npm start`.

5. **Payments (optional): Razorpay test mode.** Sign up at https://razorpay.com (no card needed), switch the dashboard to **Test Mode**, open Settings → API Keys → Generate Test Key. In Render → your service → Environment, add `RAZORPAY_KEY_ID` (starts with `rzp_test_`) and `RAZORPAY_KEY_SECRET`. Optional: Settings → Webhooks → add `<the Render address>/payments/webhook` with the events `payment.captured` and `order.paid`, and put its secret in `RAZORPAY_WEBHOOK_SECRET`. Without keys only Cash on Delivery works.

Free-plan limits: Render sleeps after 15 minutes without traffic (the first request then takes about a minute; open the app a minute before a demo). Neon sleeps after 5 minutes and wakes in under a second.

## Build an APK you can install (test build)

A normal app (no PC or code server needed), built free on Expo's servers. The free plan allows 15 Android builds a month, in a low-priority queue.

**Once:** EAS needs this folder to be a Git repository (it uploads what Git tracks; `node_modules` and `.env` stay out). Open PowerShell in the `Android App` folder:
```powershell
git init
git add -A
git commit -m "LittleKart iteration 1"
```
(If you already pushed it to GitHub in "Put the API online", skip this.) Commit again before each build so the build gets your latest files.

**Build:**
```powershell
cd app
npx eas-cli login                                     # your free expo.dev account
npx eas-cli build -p android --profile preview        # sample data, works without the server
# or, once the API is online:
npx eas-cli build -p android --profile preview-api    # uses https://littlekart-api.onrender.com
```
What to expect:
1. The first time, EAS asks to **create a project** for `@<you>/littlekart` → Yes. It adds the project ID to `app.json` (commit that change).
2. It asks to **generate a new Android keystore** → Yes. EAS keeps it safe; every later build (including the Play Store one) is signed with it.
3. It uploads the project and queues the build. The terminal shows a link; the build takes about 10–20 minutes (longer when the free queue is busy).
4. When it finishes, open the link (or scan the QR code) on your phone, download the `.apk` and install it (allow "install unknown apps" for your browser).

The test APK and the development build share the app ID, so installing one replaces the other; reinstall the development build when you go back to coding.

**Login in these builds:** any 10-digit number with OTP `1234` (sample data, and our API while `REVIEW_PHONES` is `*` in Render; D-12).

**API address:** `preview-api` and `production` point to `https://littlekart-api.onrender.com`. If Render gave you a different address, change `EXPO_PUBLIC_API_URL` in `app/eas.json` first. Release builds only talk to `https://` addresses, so a PC address like `http://192.168.x.x:4000` works only in the development build.

## Production build (Google Play), later
Before this one, decide the **package name** (Android app ID; it can never change after the first upload). It's `in.littlekart.app` now, a placeholder (DECISIONS D-75). Then:
```powershell
cd app
npx eas-cli build -p android --profile production     # makes an .aab for the Play Store; version code goes up by itself
npx eas-cli submit -p android --profile production    # optional: uploads it to Play Console (needs a Google Play developer account, one-time US$25)
```
The Play Console also needs the app icon, screenshots, a privacy policy URL and a store listing.
