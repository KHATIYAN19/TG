
import axios from "axios";
import crypto from "node:crypto";

/* =====================================================
   CONFIGURATION
===================================================== */

const CASHFREE_ENV = String(
  process.env.CASHFREE_ENV || "sandbox"
).trim().toLowerCase();

if (!["sandbox", "production"].includes(CASHFREE_ENV)) {
  throw new Error("Invalid CASHFREE_ENV");
}

const CASHFREE_ORDER_EXPIRY_MINUTES = 20;
const CASHFREE_BASE_URL =
  CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const CASHFREE_API_VERSION =
  process.env.CASHFREE_API_VERSION || "2025-01-01";

const FRONTEND_URL = (
  process.env.FRONTEND_URL ||
  "https://www.targettrek.in"
).replace(/\/+$/, "");

const BACKEND_URL = (
  process.env.BACKEND_URL ||
  "http://localhost:5001"
).replace(/\/+$/, "");

const PAYMENT_RETURN_PATH =
  "/mock-interviews/payment-status";

const PAYMENT_WEBHOOK_PATH =
  "/api/interviews/payment/cashfree/webhook";

export const INTERVIEW_HOLD_MINUTES = 3;
export const INTERVIEW_HOLD_MS =
  INTERVIEW_HOLD_MINUTES * 60 * 1000;

/* =====================================================
   VALIDATE CONFIG
===================================================== */

function validateConfig() {
  const appId = process.env.CASHFREE_APP_ID;
  const secret = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secret) {
    throw new Error(
      "Cashfree credentials are not configured"
    );
  }

  const frontend = new URL(FRONTEND_URL);
  const backend = new URL(BACKEND_URL);

  if (
    !["http:", "https:"].includes(frontend.protocol) ||
    !["http:", "https:"].includes(backend.protocol)
  ) {
    throw new Error("Invalid website URL");
  }

  if (
    frontend.pathname !== "/" ||
    backend.pathname !== "/" ||
    frontend.search ||
    frontend.hash ||
    backend.search ||
    backend.hash
  ) {
    throw new Error(
      "Frontend and backend URLs must be origins without paths"
    );
  }

  if (CASHFREE_ENV === "production") {
    if (
      frontend.protocol !== "https:" ||
      backend.protocol !== "https:" ||
      ["localhost", "127.0.0.1"].includes(
        backend.hostname
      )
    ) {
      throw new Error(
        "Production Cashfree requires public HTTPS URLs"
      );
    }
  }
}

/* =====================================================
   VALIDATION HELPERS
===================================================== */

function requireText(value, name, max = 100) {
  const text = String(value ?? "").trim();

  if (!text || text.length > max) {
    throw new Error(`Invalid ${name}`);
  }

  return text;
}

function safeIdentifier(value, name, max = 100) {
  const id = requireText(value, name, max);

  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error(`Invalid ${name}`);
  }

  return id;
}

function validateAmount(amount) {
  const value = Number(amount);

  if (
    !Number.isFinite(value) ||
    value <= 0 ||
    Math.abs(
      value * 100 - Math.round(value * 100)
    ) > 0.000001
  ) {
    throw new Error("Invalid payment amount");
  }

  return Math.round(value * 100) / 100;
}

function validateCurrency(currency = "INR") {
  const result = String(currency).trim().toUpperCase();

  if (result !== "INR") {
    throw new Error(
      "Interview payments only support INR"
    );
  }

  return result;
}

function validateCustomer(customer) {
  const name = requireText(
    customer?.name,
    "customer name",
    120
  );

  const email = requireText(
    customer?.email,
    "customer email",
    254
  ).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid customer email");
  }

  let phone = String(customer?.phone || "")
    .replace(/[\s()+-]/g, "");

  if (phone.length === 12 && phone.startsWith("91")) {
    phone = phone.slice(2);
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new Error(
      "Enter a valid 10-digit Indian mobile number"
    );
  }

  return { name, email, phone };
}

/* =====================================================
   EXPIRY VALIDATION

   Receives the original booking hold deadline.

   Do not start another three-minute timer when
   the Cashfree order is created.

   The booking may already have spent several
   seconds in the candidate/payment flow.
===================================================== */

/* =====================================================
   VALIDATE INTERVIEW BOOKING HOLD

   Interview reservation: 3 minutes
   Cashfree order expiry: 20 minutes

   This function validates the original booking
   deadline. It does not extend the reservation.
===================================================== */

function validateHoldExpiry(holdExpiresAt) {
  if (!holdExpiresAt) {
    throw new Error(
      "Booking hold expiry is required"
    );
  }

  const expiresAt = new Date(holdExpiresAt);

  if (Number.isNaN(expiresAt.getTime())) {
    throw new Error(
      "Invalid booking hold expiry"
    );
  }

  const now = Date.now();

  const remainingMs =
    expiresAt.getTime() - now;

  // Reservation already expired
  if (remainingMs <= 0) {
    throw new Error(
      "Your 3-minute interview reservation has expired. Please book the slot again."
    );
  }

  // Prevent checkout with almost no time remaining
  const MIN_CHECKOUT_TIME_MS = 15 * 1000;

  if (remainingMs < MIN_CHECKOUT_TIME_MS) {
    throw new Error(
      "Not enough reservation time remaining to start payment. Please book the slot again."
    );
  }

  return expiresAt;
}

/* =====================================================
   REQUEST HEADERS
===================================================== */

function makeIdempotencyKey(type, ...values) {
  return crypto
    .createHash("sha256")
    .update(
      [
        "targettrek",
        "interview",
        type,
        ...values,
      ].join(":")
    )
    .digest("hex")
    .slice(0, 32);
}

function headers({ idempotencyKey } = {}) {
  validateConfig();

  const result = {
    "x-client-id": process.env.CASHFREE_APP_ID,
    "x-client-secret":
      process.env.CASHFREE_SECRET_KEY,
    "x-api-version": CASHFREE_API_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (idempotencyKey) {
    result["x-idempotency-key"] = idempotencyKey;
  }

  return result;
}

/* =====================================================
   CASHFREE HTTP CLIENT
===================================================== */

const client = axios.create({
  baseURL: CASHFREE_BASE_URL,
  timeout: 15000,
});

async function gatewayRequest(operation, request) {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    // This distinguishes gateway/network failures
    // from validation errors thrown before the request.
    if (operation === "CREATE_ORDER") {
      error.cashfreeRequestAttempted = true;
    }

    console.error(
      `[INTERVIEW CASHFREE] ${operation}`,
      {
        status: error.response?.status,
        code: error.response?.data?.code,
        message:
          error.response?.data?.message ||
          error.message,
      }
    );

    throw error;
  }
}

/* =====================================================
   CREATE CASHFREE ORDER

   Uses SAME expiry as booking's MongoDB hold.

   POST /orders
===================================================== */

export async function cashfreeCreateOrder({
  orderId,
  amount,
  currency = "INR",
  customer,
  bookingId,
  holdExpiresAt,
}) {
  const id = safeIdentifier(orderId, "order ID", 45);

  const safeBookingId = safeIdentifier(
    bookingId,
    "booking ID",
    100
  );

  const safeAmount = validateAmount(amount);
  const safeCurrency = validateCurrency(currency);
  const safeCustomer = validateCustomer(customer);

// Validate the original 3-minute reservation.
validateHoldExpiry(holdExpiresAt);

// Cashfree requires an expiry greater than 15 minutes.
const cashfreeOrderExpiry = new Date(
  Date.now() +
    CASHFREE_ORDER_EXPIRY_MINUTES * 60 * 1000
).toISOString();

  const returnUrl =
    `${FRONTEND_URL}${PAYMENT_RETURN_PATH}` +
    `?bookingId=${encodeURIComponent(safeBookingId)}` +
    "&order_id={order_id}";

  const notifyUrl =
    `${BACKEND_URL}${PAYMENT_WEBHOOK_PATH}`;

  const payload = {
    order_id: id,
    order_amount: safeAmount,
    order_currency: safeCurrency,

    /*
      This is an absolute timestamp.

      Example:
      2026-10-24T08:33:00.000Z

      If the booking was created at 14:00 IST,
      the hold expires at 14:03 IST.
    */

    order_expiry_time: cashfreeOrderExpiry,

    customer_details: {
      customer_id: `INT_${safeBookingId}`.slice(
        0,
        50
      ),
      customer_name: safeCustomer.name,
      customer_email: safeCustomer.email,
      customer_phone: safeCustomer.phone,
    },

    order_meta: {
      return_url: returnUrl,
      notify_url: notifyUrl,
    },

    order_note:
      `Target Trek mock interview ${safeBookingId}`,

    order_tags: {
      type: "INTERVIEW",
      bookingId: safeBookingId,
    },
  };

  const idempotencyKey = makeIdempotencyKey(
    "create-order",
    id
  );

  return gatewayRequest("CREATE_ORDER", () =>
    client.post("/orders", payload, {
      headers: headers({ idempotencyKey }),
    })
  );
}

/* =====================================================
   FETCH CASHFREE ORDER
===================================================== */

export async function cashfreeGetOrder(orderId) {
  const id = safeIdentifier(orderId, "order ID");

  return gatewayRequest("GET_ORDER", () =>
    client.get(
      `/orders/${encodeURIComponent(id)}`,
      {
        headers: headers(),
      }
    )
  );
}

/* =====================================================
   FETCH ALL PAYMENT ATTEMPTS
===================================================== */

export async function cashfreeGetPayments(orderId) {
  const id = safeIdentifier(orderId, "order ID");

  return gatewayRequest("GET_PAYMENTS", () =>
    client.get(
      `/orders/${encodeURIComponent(id)}/payments`,
      {
        headers: headers(),
      }
    )
  );
}

/* =====================================================
   FETCH VERIFIED ORDER DETAILS
===================================================== */

export async function cashfreeGetOrderDetails(orderId) {
  const order = await cashfreeGetOrder(orderId);

  const payments = await cashfreeGetPayments(orderId);

  if (!Array.isArray(payments)) {
    throw new Error(
      "Unexpected Cashfree payment response"
    );
  }

  const orderStatus = String(
    order.order_status || ""
  ).toUpperCase();

  const successfulPayment = payments.find(
    (item) =>
      String(item.payment_status).toUpperCase() ===
      "SUCCESS"
  );

  const pendingPayment = payments.find(
    (item) =>
      String(item.payment_status).toUpperCase() ===
      "PENDING"
  );

  const paid =
    orderStatus === "PAID" &&
    Boolean(successfulPayment);

  const finalUnsuccessful =
    ["EXPIRED", "TERMINATED"].includes(orderStatus) &&
    !successfulPayment &&
    !pendingPayment;

  return {
    order,
    payments,
    orderStatus,
    paid,
    finalUnsuccessful,
    successfulPayment: successfulPayment || null,
    pendingPayment: pendingPayment || null,
  };
}

/* =====================================================
   TERMINATE AN ACTIVE UNPAID ORDER

   This is used by the cleanup worker after
   the three-minute booking hold expires.

   TERMINATION_REQUESTED is not final.
===================================================== */

export async function cashfreeTerminateOrder(orderId) {
  const id = safeIdentifier(orderId, "order ID");

  return gatewayRequest("TERMINATE_ORDER", () =>
    client.patch(
      `/orders/${encodeURIComponent(id)}`,
      {
        order_status: "TERMINATED",
      },
      {
        headers: headers({
          idempotencyKey: makeIdempotencyKey(
            "terminate-order",
            id
          ),
        }),
      }
    )
  );
}

/* =====================================================
   CREATE REFUND
===================================================== */

export async function cashfreeCreateRefund({
  orderId,
  refundId,
  amount,
  reason,
}) {
  const id = safeIdentifier(orderId, "order ID");

  const safeRefundId = safeIdentifier(
    refundId,
    "refund ID",
    40
  );

  const safeAmount = validateAmount(amount);

  const safeReason = requireText(
    reason || "Interview booking cancellation",
    "refund reason",
    200
  );

  return gatewayRequest("CREATE_REFUND", () =>
    client.post(
      `/orders/${encodeURIComponent(id)}/refunds`,
      {
        refund_id: safeRefundId,
        refund_amount: safeAmount,
        refund_note: safeReason,
      },
      {
        headers: headers({
          idempotencyKey: makeIdempotencyKey(
            "create-refund",
            id,
            safeRefundId
          ),
        }),
      }
    )
  );
}

/* =====================================================
   FETCH REFUND STATUS
===================================================== */

export async function cashfreeGetRefund({
  orderId,
  refundId,
}) {
  const id = safeIdentifier(orderId, "order ID");

  const safeRefundId = safeIdentifier(
    refundId,
    "refund ID",
    40
  );

  return gatewayRequest("GET_REFUND", () =>
    client.get(
      `/orders/${encodeURIComponent(id)}` +
        `/refunds/${encodeURIComponent(safeRefundId)}`,
      {
        headers: headers(),
      }
    )
  );
}

/* =====================================================
   PUBLIC-SAFE DIAGNOSTICS

   Never return App ID or Secret Key.
===================================================== */

export function getInterviewCashfreeConfig() {
  return {
    environment: CASHFREE_ENV,
    apiVersion: CASHFREE_API_VERSION,
    baseUrl: CASHFREE_BASE_URL,
    holdMinutes: INTERVIEW_HOLD_MINUTES,
    returnUrl:
      `${FRONTEND_URL}${PAYMENT_RETURN_PATH}`,
    webhookUrl:
      `${BACKEND_URL}${PAYMENT_WEBHOOK_PATH}`,
  };
}
