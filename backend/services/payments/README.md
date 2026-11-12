# Central payment processor

One module talks to the payment gateways (Cashfree, Razorpay, PayU). Every product has **its own API** that
validates its own request, then calls the processor. Nothing else in the project calls a gateway.

```
Books API ─┐
Arena API ─┼─ validate ─► createPayment()  ─► gateway chosen by .env (+ test/live keys)
Memories ──┘                    │
                                └─► { gateway, mode, gatewayOrderId, checkout }   store on your order, send `checkout` to the browser
later:      verifyPayment() / parseWebhook() / parseCallback() / refundPayment()   ask the gateway, check the amount
```

## Using it from a new product (e.g. "Courses")

```js
import { createPayment, verifyPayment, newOrderRef } from "../payments/index.js";

// 1. after YOUR validation (user, price, coupon, stock...)
const p = await createPayment({
  product: "COURSES",                    // -> COURSES_PAYMENT_GATEWAY overrides the global PAYMENT_GATEWAY
  orderRef: newOrderRef("CRS"),
  amountPaise: 49900,
  customer: { id: user._id, name, email, phone },   // phone: 10 digits (utils/phone.js gatewayPhone)
  returnUrl: `${FRONTEND_URL}/courses/payment-result`,
  webhookUrl: `${BACKEND_URL}/api/courses/payments/webhook`,
  description: "Course",
});
// save p.gateway, p.mode, p.gatewayOrderId on your order; return p.checkout to the browser

// 2. when the buyer returns / the browser says "paid" / a webhook arrives:
const r = await verifyPayment({
  product: "COURSES", gateway: order.gateway, mode: order.mode,
  gatewayOrderId: order.gatewayOrderId, expectedAmountPaise: order.amountPaise,
  proof: req.body.payload,               // Razorpay: { razorpay_payment_id, razorpay_signature } (optional otherwise)
});
if (r.status === "paid") { /* grant access exactly once (your own settle function) */ }
```

`status` is `"paid" | "pending" | "failed"`. `paid` is only returned when the gateway confirms it **and** the amount
matches. Never grant anything on the browser's word alone.

## `checkout` (what the browser does)

| `checkout.type` | browser |
|---|---|
| `cashfree`  | `Cashfree({ mode: checkout.environment }).checkout({ paymentSessionId })` |
| `razorpay`  | `new Razorpay({ key: checkout.keyId, order_id: checkout.orderId, ... }).open()`, then post the signed result to your verify API |
| `form_post` | auto-submit a form: POST `checkout.fields` to `checkout.url` (PayU) |

## .env

`PAYMENT_GATEWAY` (global) and optional `<PRODUCT>_PAYMENT_GATEWAY`. Keys are the usual ones:
`CASHFREE_APP_ID / CASHFREE_SECRET_KEY / CASHFREE_ENV / CASHFREE_API_VERSION`,
`RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET / RAZORPAY_WEBHOOK_SECRET`, `PAYU_KEY / PAYU_SALT / PAYU_MODE`.
Test or live follows the keys themselves (`CASHFREE_ENV`, `PAYU_MODE`, `rzp_test_`/`rzp_live_`). See `config.js`.

## Add a gateway

Create `gateways/<id>.js` with `createOrder`, `fetchStatus` (and optionally `verifyClient`, `parseWebhook`,
`parseCallback`, `refund`), add its keys to `config.js` `credentialsFor`, and register it in `processor.js`.

## The three products (all on the processor)

| product | one create API | verify / return | webhook |
|---|---|---|---|
| Books | `POST /payment/books/create` | `POST /payment/books/verify`, `ALL /payment/books/return` | `POST /payment/books/webhook/:gateway` |
| Prep Arena | `POST /api/arena/entry/checkout` | `POST /api/arena/entry/verify`, `ALL /api/arena/payments/return` | - |
| Memories | `POST /api/memories/payments/create` | `POST .../payments/verify`, `GET .../payments/callback/:gateway` | `POST .../payments/webhook/:gateway` |

Each API validates its own request (book/offer/coupon/affiliate, arena price/entry, memory price...), then calls
`createPayment`. The browser only ever sends one create request; the answer's `checkout.type` decides the window
(`client/src/payment/checkoutRunner.js`). The old per-gateway book routes (`/payment/payu|cashfree|razorpay/*`) are
still mounted so orders already in flight can finish; remove them once those have settled.

## Adding a new gateway (e.g. Stripe, PhonePe)

Backend, all inside `services/payments/`:
1. `gateways/<id>.js` - `createOrder`, `fetchStatus`, optional `verifyClient`, `parseWebhook`, `parseCallback`, `refund`.
2. `config.js` - add its env keys to `credentialsFor` (and how test/live is told apart in `gatewayMode`).
3. `processor.js` - add it to `ADAPTERS`; `config.js` - add its id to `GATEWAY_IDS`.

Frontend:
4. `client/src/payment/gatewayConfig.js` - one line in `GATEWAYS` (name, methods) so the UI can name it.
5. Only if the browser must do something new: `registerRunner("<type>", fn)` in `checkoutRunner.js`. Gateways that
   return a session id, a form post or a redirect URL need nothing else.

Books, Arena and Memories pick it up with `PAYMENT_GATEWAY=<id>` (or `<PRODUCT>_PAYMENT_GATEWAY`).
