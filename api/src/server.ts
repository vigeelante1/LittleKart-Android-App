import { buildApp } from './app.js';
import { connect } from './db/client.js';
import { migrate } from './db/migrate.js';
import { seed } from './db/seed.js';
import { memoryData } from './data/memory.js';
import { pgData } from './data/pg.js';
import { env } from './env.js';
import { razorpay } from './payments/gateway.js';

// With DATABASE_URL: PostgreSQL (migrations run at start-up, an empty database is seeded). Without: sample data in memory.
let data = memoryData();
if (env.DATABASE_URL) {
  const sql = connect(env.DATABASE_URL);
  await migrate(sql);
  // A brand-new database gets the sample catalog, stores, coupons and settings once.
  const [row] = await sql<{ n: number }[]>`select count(*)::int as n from categories`;
  if (!row || row.n === 0) await seed(sql);
  data = pgData(sql);
}

const gateway =
  env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
    ? razorpay(env.RAZORPAY_KEY_ID, env.RAZORPAY_KEY_SECRET, env.RAZORPAY_WEBHOOK_SECRET)
    : undefined;

const app = await buildApp({ data, gateway });
if (!gateway) app.log.warn('Razorpay keys are not set: only Cash on Delivery orders can be placed.');
if (!env.DATABASE_URL) app.log.warn('DATABASE_URL is not set: using sample data in memory (nothing is saved).');

try {
  // 0.0.0.0 so a phone on the same Wi-Fi can reach the API on your PC.
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
