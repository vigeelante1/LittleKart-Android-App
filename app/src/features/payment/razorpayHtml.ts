// The Razorpay Standard Checkout page shown in a WebView (DECISIONS D-68). Razorpay's own script draws the
// payment sheet; the page only reports how it ended.
import type { RazorpayCheckout } from '@/services';
import { colors } from '@/theme';

export const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';
const LOGO = 'https://d11yaebd7nzqze.cloudfront.net/littlekart_logo01.webp';

export type CheckoutMessage =
  | { type: 'success'; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
  | { type: 'dismiss' }
  | { type: 'failed'; description: string }
  | { type: 'unavailable' };

interface Options {
  checkout: RazorpayCheckout;
  name: string;
  description: string;
  customerName: string;
  /** 10 digits. */
  phone: string;
}

/** Same options as the site (test keys prefill Razorpay's test contact and turn retries off). */
export function checkoutHtml({ checkout, name, description, customerName, phone }: Options): string {
  const test = checkout.keyId.startsWith('rzp_test_');
  const options = {
    key: checkout.keyId,
    amount: checkout.amount,
    currency: 'INR',
    name,
    description,
    image: LOGO,
    order_id: checkout.orderId,
    remember_customer: false,
    theme: { color: colors.brightGreen },
    ...(test
      ? { prefill: { name: 'Test User', contact: '+919999999999' }, readonly: { contact: true }, retry: { enabled: false } }
      : {
          prefill: { name: customerName.trim(), ...(phone ? { contact: `+91${phone.slice(-10)}` } : {}) },
          retry: { enabled: true, max_count: 3 },
          webview_intent: true,
        }),
  };
  return `<!doctype html>
<html><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>html, body { margin: 0; height: 100%; background: transparent; }</style>
</head><body>
<script>
  function post(msg) { window.ReactNativeWebView.postMessage(JSON.stringify(msg)); }
  var done = false;
  function finish(msg) { if (done) return; done = true; post(msg); }
</script>
<script src="${CHECKOUT_SCRIPT}" onerror="finish({ type: 'unavailable' })"></script>
<script>
  (function () {
    if (!window.Razorpay) { finish({ type: 'unavailable' }); return; }
    var options = ${JSON.stringify(options)};
    options.handler = function (r) {
      finish({ type: 'success', razorpay_order_id: r.razorpay_order_id, razorpay_payment_id: r.razorpay_payment_id, razorpay_signature: r.razorpay_signature });
    };
    options.modal = { confirm_close: true, ondismiss: function () { finish({ type: 'dismiss' }); } };
    try {
      var rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (e) {
        var err = (e && e.error) || {};
        finish({ type: 'failed', description: err.description || err.reason || '' });
      });
      rzp.open();
    } catch (e) {
      finish({ type: 'unavailable' });
    }
  })();
</script>
</body></html>`;
}
