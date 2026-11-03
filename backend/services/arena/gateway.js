import axios from "axios";

import {
  CASHFREE_APP_ID,
  CASHFREE_SECRET_KEY,
  CASHFREE_API_VERSION,
  CASHFREE_BASE_URL,
  CASHFREE_ENV,
} from "../../config/cashfree.js";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, getRazorpayClient } from "../../config/razorpay.js";
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  verifyRazorpayPaymentSignature,
} from "../../utils/razorpay.js";

import { ArenaError } from "./errors.js";

/*
  PAYMENT GATEWAY ADAPTER
  -----------------------
  The arena talks to one small interface; Cashfree and Razorpay each
  implement it. Pick with ARENA_PAYMENT_GATEWAY=cashfree|razorpay.
  If unset, Cashfree is used when its credentials exist (that's what the
  rest of the site runs on), otherwise Razorpay.

    createOrder({ entry, user })  -> { orderId, checkout }
    confirmPayment({ entry, ...proof }) -> { status: "paid"|"pending"|"failed", paymentId }
    findPaidPayment(entry)        -> { paymentId } | null     (for reconcile)
    refund({ entry, amountPaise })-> refundId
*/

const FRONTEND_URL = (process.env.FRONTEND_URL || "https://www.targettrek.in").replace(/\/$/, "");

const rupees = (paise) => Number((paise / 100).toFixed(2));

export const gatewayName = () => {
  const forced = String(process.env.ARENA_PAYMENT_GATEWAY || "").trim().toLowerCase();
  if (forced === "cashfree" || forced === "razorpay") return forced;
  return CASHFREE_APP_ID && CASHFREE_SECRET_KEY ? "cashfree" : "razorpay";
};

/*
  Turn gateway failures into one safe, actionable error.
  The member sees a generic message; the server log says exactly what to fix.
*/
const gatewayFailure = (gateway, error) => {
  const status = error?.response?.status ?? error?.statusCode;
  const detail =
    error?.response?.data?.message ||
    error?.error?.description ||
    error?.message ||
    "unknown error";

  if (status === 401 || status === 403) {
    console.error(
      `[arena:payments] ${gateway} rejected our credentials (HTTP ${status}: ${detail}). ` +
        (gateway === "razorpay"
          ? "Check RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET (test keys with test mode, live keys with live mode), or set ARENA_PAYMENT_GATEWAY=cashfree."
          : "Check CASHFREE_APP_ID / CASHFREE_SECRET_KEY / CASHFREE_ENV (sandbox vs production keys).")
    );
  } else {
    console.error(`[arena:payments] ${gateway} error (HTTP ${status ?? "n/a"}): ${detail}`);
  }

  return new ArenaError(
    status === 400 ? 400 : 503,
    "PAYMENT_UNAVAILABLE",
    "We couldn't start the payment right now. Please try again in a few minutes."
  );
};

const guard = (gateway) => async (fn) => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ArenaError) throw error;
    throw gatewayFailure(gateway, error);
  }
};

/* ------------------------------- CASHFREE ------------------------------- */
const cfHeaders = () => {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    throw new Error("Cashfree credentials are not configured");
  }
  return {
    "x-client-id": CASHFREE_APP_ID,
    "x-client-secret": CASHFREE_SECRET_KEY,
    "x-api-version": CASHFREE_API_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
};

const cf = (method, path, data) =>
  axios({ method, url: `${CASHFREE_BASE_URL}${path}`, data, headers: cfHeaders(), timeout: 15000 });

const cashfree = {
  async createOrder({ entry, user }) {
    const orderId = `ARENA_${entry._id}`; // unique per entry, ≤ 50 chars
    const phone = String(user.mobile || "").replace(/\D/g, "").slice(-10);

    const { data } = await cf("post", "/orders", {
      order_id: orderId,
      order_amount: rupees(entry.paidPaise),
      order_currency: "INR",
      customer_details: {
        customer_id: `U${String(user._id)}`,
        customer_name: String(user.name || "Member").slice(0, 100),
        customer_email: user.email,
        customer_phone: phone.length === 10 ? phone : "9999999999",
      },
      order_meta: {
        return_url: `${FRONTEND_URL}/prep-buddy/app/join?order_id={order_id}`,
      },
      order_note: "Prep Buddy Arena entry",
    });

    if (!data?.payment_session_id) throw new Error("Cashfree returned no payment_session_id");

    return {
      orderId,
      checkout: {
        gateway: "cashfree",
        paymentSessionId: data.payment_session_id,
        mode: CASHFREE_ENV === "production" ? "production" : "sandbox",
      },
    };
  },

  async findPaidPayment(entry) {
    const orderId = entry.payment?.orderId;
    if (!orderId) return null;

    const { data: order } = await cf("get", `/orders/${encodeURIComponent(orderId)}`);
    if (order.order_status !== "PAID") return null;
    if (Math.round(Number(order.order_amount) * 100) !== entry.paidPaise) {
      throw new ArenaError(400, "PAYMENT_MISMATCH", "Payment amount does not match this order");
    }

    const { data: payments } = await cf("get", `/orders/${encodeURIComponent(orderId)}/payments`);
    const ok = (Array.isArray(payments) ? payments : []).find((p) => p.payment_status === "SUCCESS");
    return { paymentId: String(ok?.cf_payment_id ?? orderId) };
  },

  async confirmPayment({ entry }) {
    const paid = await this.findPaidPayment(entry);
    return paid ? { status: "paid", paymentId: paid.paymentId } : { status: "pending", paymentId: null };
  },

  async refund({ entry, amountPaise }) {
    const { data } = await cf("post", `/orders/${encodeURIComponent(entry.payment.orderId)}/refunds`, {
      refund_amount: rupees(amountPaise),
      refund_id: `RF_${entry._id}`, // idempotent: same entry can't be refunded twice
      refund_note: "Arena cancellation (fee deducted)",
      refund_speed: "STANDARD",
    });
    return String(data.cf_refund_id ?? data.refund_id);
  },
};

/* ------------------------------- RAZORPAY ------------------------------- */
const razorpay = {
  async createOrder({ entry, user }) {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) throw new Error("Razorpay credentials are not configured");

    const order = await createRazorpayOrder({
      amount: entry.paidPaise,
      currency: "INR",
      receipt: `arena_${entry._id}`,
      notes: { entryId: String(entry._id), userId: String(user._id), purpose: "prep-buddy-arena" },
    });

    return {
      orderId: order.id,
      checkout: {
        gateway: "razorpay",
        key: RAZORPAY_KEY_ID,
        razorpayOrderId: order.id,
        amount: order.amount,
        currency: order.currency,
        name: "Target Trek",
        description: "Prep Buddy Arena – one-time entry",
        prefill: { name: user.name, email: user.email, contact: user.mobile },
      },
    };
  },

  async findPaidPayment(entry) {
    const { items } = await getRazorpayClient().orders.fetchPayments(entry.payment.orderId);
    const captured = items?.find((p) => p.status === "captured" && Number(p.amount) === entry.paidPaise);
    return captured ? { paymentId: captured.id } : null;
  },

  async confirmPayment({ entry, paymentId, signature }) {
    if (
      !verifyRazorpayPaymentSignature({
        razorpayOrderId: entry.payment.orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      })
    ) {
      throw new ArenaError(400, "SIGNATURE_INVALID", "Payment verification failed");
    }

    const payment = await fetchRazorpayPayment(paymentId);
    if (payment.order_id !== entry.payment.orderId || Number(payment.amount) !== entry.paidPaise) {
      throw new ArenaError(400, "PAYMENT_MISMATCH", "Payment details do not match this order");
    }
    return payment.status === "captured"
      ? { status: "paid", paymentId: payment.id }
      : { status: "pending", paymentId: payment.id };
  },

  async refund({ entry, amountPaise }) {
    const refund = await getRazorpayClient().payments.refund(entry.payment.paymentId, {
      amount: amountPaise,
      speed: "normal",
      notes: { reason: "arena_cancellation", entryId: String(entry._id) },
      receipt: `arena_rf_${entry._id}`,
    });
    return refund.id;
  },
};

const IMPLEMENTATIONS = { cashfree, razorpay };

/* Public API: every call is wrapped so failures become safe ArenaErrors. */
export const gateway = {
  name: gatewayName,
  createOrder: (args) => guard(gatewayName())(() => IMPLEMENTATIONS[gatewayName()].createOrder(args)),
  confirmPayment: (args) => guard(args.entry.payment?.gateway || gatewayName())(() => IMPLEMENTATIONS[args.entry.payment?.gateway || gatewayName()].confirmPayment(args)),
  findPaidPayment: (entry) => guard(entry.payment?.gateway || gatewayName())(() => IMPLEMENTATIONS[entry.payment?.gateway || gatewayName()].findPaidPayment(entry)),
  refund: (args) => guard(args.entry.payment?.gateway || gatewayName())(() => IMPLEMENTATIONS[args.entry.payment?.gateway || gatewayName()].refund(args)),
};
