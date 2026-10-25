# LittleKart API

Fastify + TypeScript + PostgreSQL (Neon). Business rules come from `@littlekart/shared`, so the app and the server always agree.

## Run locally
```bash
cp .env.example .env      # leave DATABASE_URL out to use sample data in memory
npm run dev               # http://localhost:4000/health
npm test                  # add TEST_DATABASE_URL=postgres://… to also run the PostgreSQL tests
npm run db:seed           # applies migrations and loads the sample catalog (safe to repeat)
```

## Endpoints
| Method | Path | Returns |
|---|---|---|
| GET | `/health` | `{ ok: true }` |
| GET | `/config` | fees, tip options, 30-unit limit, delivery-time settings, search hints |
| GET | `/stores/nearest?lat=&lng=` | nearest store with `distanceKm` and `inRadius` (6 km) |
| GET | `/customers/:phone` | whether the number has an account |
| POST | `/auth/otp/send`, `/auth/otp/verify`, `/auth/logout` | login (review mode: code `1234`) |
| GET | `/me` | the signed-in customer |
| GET | `/home` | categories, sections, banners, deals |
| GET | `/tiles/:id/subcategories` | the left rail of a category screen |
| GET | `/subcategories/:id/products?q=` | products, optionally filtered by name |
| GET | `/products?ids=a,b` | products by id |
| GET | `/recommendations?cart=a,b` | "Often bought together", without what is in the cart |
| GET | `/search?q=` | products matching the name |
| GET | `/coupons` | coupon list |
| POST | `/coupons/validate` | `{ code, lines }` → valid + discount, or the reason and message |
| GET / POST | `/addresses` | the customer's addresses / save one (409 `duplicate_label`) |
| PUT / DELETE | `/addresses/:id` | edit / delete an address |
| GET / PUT | `/cart` | the customer's saved cart / replace it (unknown items dropped, quantities capped) |
| GET | `/geo/reverse?lat=&lng=` | address text for a pin (Nominatim) |
| GET | `/geo/autocomplete?q=` | address suggestions (Photon) |

Planned (M9): orders and payments.

## Data model
SQL files in `src/db/migrations/` (applied in order at start-up and by `npm run db:seed`). Storage code: `src/data/pg.ts` (PostgreSQL) and `src/data/memory.ts` (no database), behind the interfaces in `src/data/types.ts`.
