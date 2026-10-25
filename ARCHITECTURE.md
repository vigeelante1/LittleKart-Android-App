# LittleKart Android — App architecture

> **Updated 23 Oct 2026.** We now build our own backend (DECISIONS D-04). The repository is an npm workspace with `app/` (the `src/` below lives in `app/src/`), `api/` and `shared/` (D-28). Domain types and business rules are in `shared/src/` and supersede sections 3 and 5 below. Sizes follow `reference/WEB_STYLES.md` (D-25), not the `u()` scale. Where this file and `DECISIONS.md` disagree, `DECISIONS.md` wins.

The app reads data through repository interfaces with a sample-data implementation (default) and an HTTP implementation for our API in `api/`.

## 1. Folder structure
```
littlekart-app/
  CLAUDE.md  LITTLEKART_CONTEXT.md  DESIGN_SPEC.md  ARCHITECTURE.md  BUILD_PROMPTS.md  FIDELITY_NOTES.md
  reference/screens/   reference/photos/        # the images from the founder, read-only
  assets/                                        # app icon, splash
  src/
    app/                    # expo-router: every file is a screen
      _layout.tsx           # fonts, providers, Stack
      index.tsx             # Home
      login.tsx             # phone -> OTP -> success (one screen, 3 steps)
      category/[id].tsx     # category product list
      search.tsx
      cart.tsx
      profile.tsx
      add-address.tsx
      placeholder/[title].tsx   # plain page for out-of-scope rows
    components/             # AppText, Button, PillBack, Chip, PriceChip, EtaChip, OffRibbon, QuantityStepper,
                            # AddButton, PlusButton, Dialog, ProductCardDeal, ProductCardGrid, TileGrid, ViewCartPill, ...
    features/               # home/, cart/, login/, profile/, address/  (feature-specific components and hooks)
    theme/                  # colors.ts, typography.ts, scale.ts, spacing.ts
    store/                  # cartStore, authStore, locationStore (persisted)
    data/
      types.ts              # domain types (below)
      mock/                 # fixtures taken from the screenshots
    services/
      index.ts              # picks mock or http by EXPO_PUBLIC_DATA_SOURCE ('mock' default)
      repositories.ts       # interfaces
      mock/                 # mock implementations
      http/                 # empty for now; real API later
    assets/placeholders/    # swap with real artwork
    strings.ts              # all English UI strings
```

## 2. Navigation map
```
Stack
 ├─ index (Home)                ──► category/[id] , search , cart , profile
 ├─ login (Skip returns to Home)
 ├─ category/[id]
 ├─ search
 ├─ cart                        ──► Change Location dialog, Apply Coupons dialog, add-address
 ├─ profile                     ──► placeholder/[title] for rows not yet captured
 └─ add-address
Dialogs (modal components, not routes): Saved-cart, Change Location, Variant picker, Apply Coupons, Login success
```
Header-less screens: the app draws its own top bars ("‹ Back" pill + title), as in the screenshots.

## 3. Domain types (`src/data/types.ts`)
```ts
type Id = string;
type Category = { id: Id; name: string; imageUrl: string; isNew?: boolean };          // top strip + sections
type Tile = { id: Id; label: string; imageUrl: string; isNew?: boolean; categoryId: Id }; // grid tiles under a section
type Section = { id: Id; title: string; categoryId: Id; tiles: Tile[] };
type Variant = { id: Id; label: string; price: number; mrp?: number; imageUrl: string };  // "1kg", "500g"
type Product = {
  id: Id; categoryId: Id;
  name: string;            // multi-language string: "అల్లం | Allam | अदरक | Ginger"
  imageUrl: string; unit: string;       // "500g", "1L"
  price: number; mrp?: number;          // discount % = round((mrp-price)/mrp*100)
  etaMins: 15 | 30 | number;            // shown as "15 MINS"
  variants?: Variant[];                 // more than one = "(2 options)" and the picker dialog
  exemptFromCoupon?: boolean;           // meat
};
type CartLine = { productId: Id; variantId?: Id; qty: number; addedAt: number };
type Banner = { id: Id; imageUrl: string };
type Coupon = { code: string; title: string; minOrder: number; discount: number };    // "Rs 50 Limited Offer"
type AddressLabel = 'Home' | 'Work' | 'Hotel' | 'Other';
type Address = { id: Id; label: AddressLabel; text: string; houseNo: string; landmark?: string;
                 name: string; phone: string; lat: number; lng: number };
type User = { id: Id; name: string; phone: string };
type AppConfig = { deliveryEtaMinutes: number; deliveryFee: number; platformFee: number; tipOptions: number[] };
```

## 4. Repository interfaces (`src/services/repositories.ts`)
```ts
interface CatalogRepo {
  getCategories(): Promise<Category[]>;
  getHomeSections(): Promise<Section[]>;
  getBanners(): Promise<Banner[]>;
  getDeals(): Promise<Product[]>;
  getCategoryProducts(categoryId: Id, opts?: { query?: string }): Promise<{ subCategories: Category[]; products: Product[] }>;
  getRecommendations(cartProductIds: Id[]): Promise<Product[]>;         // "Often bought together"
  search(query: string): Promise<Product[]>;
  getSearchHints(): Promise<string[]>;                                  // rolling placeholder words
}
interface AuthRepo { sendOtp(phone: string): Promise<void>; verifyOtp(phone: string, otp: string): Promise<User>; logout(): Promise<void>; }
interface AddressRepo { list(): Promise<Address[]>; save(a: Omit<Address,'id'>): Promise<Address>; reverseGeocode(lat: number, lng: number): Promise<string>; }
interface CouponRepo { list(): Promise<Coupon[]>; }
interface ConfigRepo { get(): Promise<AppConfig>; }
```
Mock rules: OTP is always `1234`; `getConfig` returns ETA 35 (and a debug switch to flip to 15); fees ₹30 and ₹10.

## 5. Cart and bill (`src/store/cartStore.ts`, pure functions, unit-tested)
- `itemsTotal = Σ price × qty`
- `mrpTotal = Σ (mrp ?? price) × qty`, `mrpSavings = mrpTotal − itemsTotal`
- `grandTotal = itemsTotal + deliveryFee + platformFee + tip`
- Worked example from the screenshots: items 164 + 80 + 120 = **364**, MRP total **444**, savings **80**, delivery **30**, platform **10**, total **404**.
- Cart is persisted; items show **most recently added first**.
- Not captured: what "−" does when the quantity is 1. Assumption: it removes the item, same as "Remove". Log it in `FIDELITY_NOTES.md`.
- Coupon eligibility: `eligibleTotal = Σ price × qty over lines where !exemptFromCoupon`. A coupon is usable when `eligibleTotal >= minOrder`; otherwise the card shows "Add non-exempt products worth Rs {minOrder − eligibleTotal} more to apply".

## 6. Mock data fixtures (from the screenshots)
- Categories (top strip): Pooja & Flowers (New), Food & Meat, Groceries & Kitchen, Snacks & Drinks; sections and tiles as listed in `DESIGN_SPEC.md` S4.
- Deals: Fanta Orange 1L ₹45/₹50, `చిక్కుడు | Chikkudu` 500 gm ₹70/₹80, Watermelon 1pc ₹169, `అల్లం | Allam | अदरक | Ginger` 500g ₹120/₹160, `బీరకాయ | Beerakaya` 1kg ₹60/₹80, `మునక్కాయ…` 1kg ₹150.
- Chicken: Sneha Chicken Curry Cut Skinless Halal (1kg ₹328, 500g ₹164), Sneha Chicken Boneless Halal 500g ₹330 (30 MINS), Sneha Chicken Briyani Cut… 500g ₹164 (2 options).
- Often bought together: Sneha White Eggs 6Pcs ₹50/₹70, Banana | Aratipandu 6Pcs ₹45/₹55, Amul Salted Butter 100G ₹63, Aashirvaad Chilli Powder 200g ₹89/₹130, Vijaya Groundnut Oil 1L ₹197/₹218, Heritage Total Curd 450g ₹50.
- Books & Charts: Classmate Notebook ₹45/₹48, classmate 300 pages ₹88/₹90 (+2 more).
- Coupons (minimums worked out from the screenshot): the cart at that moment held chicken (meat, exempt) plus two non-exempt items worth ₹80 + ₹120 = ₹200. The hints said "550 / 1300 / 1800 more", so the minimums are **FESTIVE50 min 750, FESTIVE100 min 1500, FESTIVE150 min 2000**. FESTIVE200 was cut off: use min 2500 and log it in `FIDELITY_NOTES.md`.
- Images: use placeholders; keep the names so real images drop in.

## 7. When the real backend arrives
1. Get the API docs or a Postman collection from the founder.
2. Implement `src/services/http/*` for each repository interface. Map API fields to the domain types in one place (`mappers.ts`).
3. Set `EXPO_PUBLIC_DATA_SOURCE=http` and `EXPO_PUBLIC_API_URL=...`.
4. Screens do not change. If a screen needs a field the API lacks, note it in `FIDELITY_NOTES.md`.
