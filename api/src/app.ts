// Builds the Fastify app. Kept separate from server.ts so tests can inject requests without a port.
import cors from '@fastify/cors';
import Fastify from 'fastify';
import { memoryData } from './data/memory.js';
import type { DataLayer, OtpStore } from './data/types.js';
import { env, reviewPhones } from './env.js';
import { authRoutes } from './routes/auth.js';
import { catalogRoutes } from './routes/catalog.js';
import { geoRoutes, type GeoOptions } from './routes/geo.js';
import { metaRoutes } from './routes/meta.js';
import { orderRoutes } from './routes/orders.js';
import type { PaymentGateway } from './payments/gateway.js';
import { shoppingRoutes } from './routes/shopping.js';

export interface AppOptions {
  /** Storage: PostgreSQL in production (server.ts), memory by default (tests). */
  data?: DataLayer;
  auth?: { reviewPhones?: ReadonlySet<string>; reviewOtp?: string; otpStore?: OtpStore };
  geo?: GeoOptions;
  /** Razorpay (server.ts builds it from the env keys); without it only Cash on Delivery works. */
  gateway?: PaymentGateway;
  /** Clock for store hours (tests pin it to a time the stores are open). */
  now?: () => number;
}

export async function buildApp(options: AppOptions = {}) {
  const data = options.data ?? memoryData({ otps: options.auth?.otpStore });
  const app = Fastify({ logger: { level: process.env.NODE_ENV === 'test' ? 'silent' : 'info' } });
  // The phone app needs no CORS; this lets the web preview call the API too.
  await app.register(cors, { origin: true, methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'] });
  await app.register(metaRoutes, { meta: data.meta });
  await app.register(authRoutes, {
    reviewPhones: options.auth?.reviewPhones ?? reviewPhones,
    reviewOtp: options.auth?.reviewOtp ?? env.REVIEW_OTP,
    otps: options.auth?.otpStore ?? data.otps,
    accounts: data.accounts,
  });
  await app.register(catalogRoutes, { catalog: data.catalog });
  await app.register(shoppingRoutes, { data });
  await app.register(orderRoutes, { data, gateway: options.gateway, now: options.now ?? Date.now });
  await app.register(geoRoutes, options.geo ?? {});
  app.addHook('onClose', async () => data.close());
  return app;
}
