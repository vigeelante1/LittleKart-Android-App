// Online payments through Razorpay in test mode (DECISIONS D-14, D-68). No real money moves with test keys.
import { createHmac, timingSafeEqual } from 'node:crypto';

export interface PaymentGateway {
  /** The public key the app's checkout needs (rzp_test_…). */
  keyId: string;
  /** Creates the gateway order for this amount (in paise). */
  createOrder(input: { amountPaise: number; receipt: string }): Promise<{ id: string }>;
  /** Checks the signature the checkout returns after a successful payment. */
  verifyPayment(input: { gatewayOrderId: string; paymentId: string; signature: string }): boolean;
  /** Checks a webhook call really comes from the gateway. */
  verifyWebhook(rawBody: string, signature: string): boolean;
}

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function razorpay(keyId: string, keySecret: string, webhookSecret: string | undefined): PaymentGateway {
  return {
    keyId,
    async createOrder({ amountPaise, receipt }) {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt }),
      });
      if (!response.ok) throw new Error(`razorpay_order_failed_${response.status}`);
      const data = (await response.json()) as { id?: string };
      if (!data.id) throw new Error('razorpay_order_failed');
      return { id: data.id };
    },
    verifyPayment({ gatewayOrderId, paymentId, signature }) {
      const expected = createHmac('sha256', keySecret).update(`${gatewayOrderId}|${paymentId}`).digest('hex');
      return safeEqual(expected, signature);
    },
    verifyWebhook(rawBody, signature) {
      if (!webhookSecret) return false;
      const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      return safeEqual(expected, signature);
    },
  };
}
