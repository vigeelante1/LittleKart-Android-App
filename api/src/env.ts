// Environment variables, validated once at start-up.
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().optional(),
  REVIEW_PHONES: z.string().default('*'),
  REVIEW_OTP: z.string().regex(/^\d{4}$/).default('1234'),
  // Razorpay test keys (Dashboard → Settings → API Keys, test mode). Without them only Cash on Delivery works.
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  // Google Gemini key for Ask AI (aistudio.google.com, free tier). Without it Ask AI uses its built-in recipe list.
  GEMINI_API_KEY: z.string().optional(),
});

export const env = schema.parse(process.env);

export const reviewPhones = new Set(
  env.REVIEW_PHONES.split(',')
    .map((p) => p.trim())
    .filter(Boolean),
);
