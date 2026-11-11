import mongoose from "mongoose";
import crypto from "crypto";

import Order from "../models/Order.js";
import Book from "../models/Book.js";
import sendMail from "../utils/MailSender.js";
import { enqueueEbookEmail } from "../utils/ebookEmailDelivery.js";

import {
  validateCouponForPayment,
} from "../controllers/couponController.js";

/* =========================================================
   CONFIG
========================================================= */

const SITE_URL = "https://www.targettrek.in";
const BOOKS_URL = `${SITE_URL}/books`;
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const ACCESS_DURATION = 24 * 60 * 60 * 1000;

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

const escapeHtml = (value = "") =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const first = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  );

const appError = (code, message, status = 400) =>
  Object.assign(new Error(message), {
    code,
    status,
  });

const formatAmount = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getAdminIdentifier = (req) =>
  String(
    req.user?.email ||
    req.admin?.email ||
    req.user?._id ||
    req.admin?._id ||
    "ADMIN"
  );

const getOrderQuery = (value) => {
  const id = String(value || "").trim();

  if (!id) {
    throw appError(
      "INVALID_ORDER_ID",
      "Order ID is required."
    );
  }

  if (mongoose.isValidObjectId(id)) {
    return {
      $or: [
        { _id: new mongoose.Types.ObjectId(id) },
        { orderId: id },
      ],
    };
  }

  return { orderId: id };
};

const getPurchasedBook = async (order) =>
  Book.findById(order.bookId).select(
    "title subtitle description shortDescription " +
    "edition categories level language format " +
    "price mrp currency redirectUrl paymentUrl " +
    "coverImage coverPageUrl isActive isPublished"
  );

// Multi-book offer orders: titles of every book the buyer owns
const getOfferBookTitles = async (order) => {
  if (!order?.offer?.offerId) return [];

  const ids = (order.purchasedBookIds || []).map(String);
  if (!ids.length) return [];

  const found = await Book.find({ _id: { $in: ids } }).select("title").lean();
  const map = new Map(found.map((b) => [String(b._id), b.title]));

  return ids.map((id) => map.get(id)).filter(Boolean);
};

const getCoverUrl = (book) => {
  const cover =
    book?.coverImage ||
    book?.coverPageUrl ||
    "";

  const url =
    typeof cover === "string"
      ? cover
      : cover?.secure_url || cover?.url || "";

  return /^https:\/\//i.test(url) ? url : "";
};

const getPurchaseURL = (book) => {
  const value = String(book.redirectUrl || "").trim();

  if (!value) return BOOKS_URL;

  try {
    const url = new URL(value, SITE_URL);

    // Avoid redirecting customer emails to arbitrary hosts.
    if (url.origin !== new URL(SITE_URL).origin) {
      return BOOKS_URL;
    }

    return url.toString();
  } catch {
    return BOOKS_URL;
  }
};

const getCurrency = (order) =>
  String(order.book?.currency || "INR").toUpperCase();

const getPaidAmount = (order) =>
  Number(
    first(
      order.payment?.amount,
      order.coupon?.applied
        ? order.coupon?.finalAmount
        : null,
      order.book?.price
    ) || 0
  );

const getTransactionId = (order) =>
  first(
    order.payment?.transactionId,
    order.payment?.paymentId,
    order.orderId
  ) || "N/A";

/* =========================================================
   ACCESS TOKEN HELPERS
========================================================= */

const generateAccessToken = () =>
  crypto.randomBytes(32).toString("hex");

const hashAccessToken = (token) =>
  crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

const buildAccessUrl = (token, orderId) =>
  `${SITE_URL}/payment/success` +
  `?token=${encodeURIComponent(token)}` +
  `&order=${encodeURIComponent(orderId)}`;

/* =========================================================
   PAYMENT STATUS CHECK
========================================================= */

const validatePaidOrder = (order) => {
  const orderStatus = normalize(order.orderStatus);
  const paymentStatus = normalize(order.payment?.status);
  const refundStatus = normalize(order.refund?.status);

  const eligibleOrder =
    orderStatus === "paid" ||
    orderStatus === "partially_refunded";

  const eligiblePayment =
    paymentStatus === "success" ||
    paymentStatus === "partially_refunded";

  const fullyRefunded =
    orderStatus === "refunded" ||
    paymentStatus === "refunded" ||
    refundStatus === "refunded";

  return (
    eligibleOrder &&
    eligiblePayment &&
    !fullyRefunded &&
    order.access?.revoked !== true
  );
};

/* =========================================================
   GATEWAY SNAPSHOT HELPERS

   Matches actual schema:
   payment.createResponse
   payment.callbackResponse
   payment.verificationResponse
========================================================= */

const parseObject = (value) => {
  if (!value) return {};

  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const getSnapshots = (order) => {
  const results = [];

  for (const response of [
    order.payment?.createResponse,
    order.payment?.callbackResponse,
    order.payment?.verificationResponse,
  ]) {
    const root = parseObject(response);
    results.push(root);

    for (const key of [
      "data",
      "payload",
      "payment",
      "order",
    ]) {
      const nested = parseObject(root[key]);

      if (Object.keys(nested).length > 0) {
        results.push(nested);
      }
    }
  }

  return results;
};

const getSnapshotField = (order, ...keys) => {
  for (const snapshot of getSnapshots(order)) {
    for (const key of keys) {
      const value = snapshot[key];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }
  }

  return null;
};

const getProvider = (order) => {
  const provider = normalize(order.payment?.provider);

  if (provider.includes("cashfree")) return "cashfree";
  if (provider.includes("razorpay")) return "razorpay";
  if (provider.includes("payu")) return "payu";

  throw appError(
    "UNKNOWN_PROVIDER",
    "Unsupported or missing payment provider."
  );
};

const verifyAmount = (actual, order) => {
  const expected = Number(order.payment?.amount);

  if (
    order.payment?.amount == null ||
    !Number.isFinite(expected) ||
    expected < 0
  ) {
    throw appError(
      "STORED_AMOUNT_INVALID",
      "Stored payment amount is invalid."
    );
  }

  const received = Number(actual);

  if (
    actual == null ||
    !Number.isFinite(received) ||
    Math.abs(expected - received) > 0.01
  ) {
    throw appError(
      "AMOUNT_MISMATCH",
      "Gateway amount does not match the stored order."
    );
  }
};

const verifyCurrency = (actual, order) => {
  if (normalize(actual) !== normalize(getCurrency(order))) {
    throw appError(
      "CURRENCY_MISMATCH",
      "Gateway currency does not match the order."
    );
  }
};

const gatewayRequest = async (url, options = {}) => {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    12000
  );

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw appError(
        "GATEWAY_HTTP_ERROR",
        `Gateway verification failed with HTTP ${response.status}.`,
        502
      );
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw appError(
        "GATEWAY_TIMEOUT",
        "Gateway verification timed out.",
        504
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

/* =========================================================
   CASHFREE VERIFICATION
========================================================= */

const verifyCashfree = async (order) => {
  const clientId =
    process.env.CASHFREE_APP_ID ||
    process.env.CASHFREE_CLIENT_ID;

  const clientSecret =
    process.env.CASHFREE_SECRET_KEY ||
    process.env.CASHFREE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw appError(
      "CASHFREE_CONFIG_MISSING",
      "Cashfree credentials are not configured."
    );
  }

  const gatewayOrderId = first(
    getSnapshotField(order, "order_id"),
    order.orderId
  );

  if (!gatewayOrderId) {
    throw appError(
      "CASHFREE_ORDER_MISSING",
      "Cashfree order ID is missing."
    );
  }

  const sandbox = ["sandbox", "test"].includes(
    normalize(process.env.CASHFREE_ENV)
  );

  const base = sandbox
    ? "https://sandbox.cashfree.com/pg"
    : "https://api.cashfree.com/pg";

  const headers = {
    "x-client-id": clientId,
    "x-client-secret": clientSecret,
    "x-api-version":
      process.env.CASHFREE_API_VERSION ||
      "2023-08-01",
    Accept: "application/json",
  };

  let gatewayOrder;

  try {
    gatewayOrder = await gatewayRequest(
      `${base}/orders/${encodeURIComponent(gatewayOrderId)}`,
      { headers }
    );
  } catch (error) {
    if (error.code === "GATEWAY_HTTP_ERROR" && /HTTP 404/.test(error.message)) {
      throw appError(
        "CASHFREE_ORDER_NOT_FOUND",
        `Cashfree (${sandbox ? "sandbox" : "production"}) has no order ${gatewayOrderId}. ` +
          "The order was probably created in the other environment: check CASHFREE_ENV and the Cashfree keys on this server.",
        502
      );
    }

    throw error;
  }

  if (String(gatewayOrder.order_id) !== String(gatewayOrderId)) {
    throw appError(
      "CASHFREE_ORDER_MISMATCH",
      "Cashfree order ID does not match."
    );
  }

  if (normalize(gatewayOrder.order_status) !== "paid") {
    throw appError(
      "CASHFREE_NOT_PAID",
      "Cashfree has not confirmed this order as PAID."
    );
  }

  verifyAmount(gatewayOrder.order_amount, order);
  verifyCurrency(gatewayOrder.order_currency, order);

  // Fetch payment records to check for a successful payment.
  const records = await gatewayRequest(
    `${base}/orders/${encodeURIComponent(gatewayOrderId)}/payments`,
    { headers }
  );

  if (!Array.isArray(records)) {
    throw appError(
      "CASHFREE_PAYMENT_RESPONSE",
      "Cashfree did not return a payment list."
    );
  }

  const successful = records.filter(
    (p) => normalize(p.payment_status) === "success"
  );

  if (!successful.length) {
    throw appError(
      "CASHFREE_PAYMENT_NOT_FOUND",
      "No successful Cashfree payment was found."
    );
  }

  const storedPaymentId = first(
    order.payment?.paymentId,
    getSnapshotField(order, "cf_payment_id")
  );

  const matchedPayment = successful.find((p) => {
    if (
      storedPaymentId &&
      String(p.cf_payment_id) !== String(storedPaymentId)
    ) {
      return false;
    }

    return (
      String(p.order_id || gatewayOrderId) ===
        String(gatewayOrderId) &&
      Number.isFinite(Number(p.payment_amount)) &&
      Math.abs(
        Number(p.payment_amount) -
        Number(order.payment.amount)
      ) <= 0.01 &&
      normalize(p.payment_currency || gatewayOrder.order_currency) ===
        normalize(getCurrency(order))
    );
  });

  if (!matchedPayment) {
    throw appError(
      "CASHFREE_PAYMENT_MISMATCH",
      "No Cashfree payment matches the stored payment details."
    );
  }

  return {
    provider: "cashfree",
    gatewayOrderId,
    paymentId: matchedPayment.cf_payment_id,
  };
};

/* =========================================================
   RAZORPAY VERIFICATION
========================================================= */

const verifyRazorpay = async (order) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !secret) {
    throw appError(
      "RAZORPAY_CONFIG_MISSING",
      "Razorpay credentials are missing."
    );
  }

  const paymentId = first(
    order.payment?.paymentId?.startsWith?.("pay_")
      ? order.payment.paymentId
      : null,
    getSnapshotField(order, "razorpay_payment_id"),
    order.payment?.transactionId?.startsWith?.("pay_")
      ? order.payment.transactionId
      : null
  );

  const razorpayOrderId = first(
    getSnapshotField(order, "razorpay_order_id"),
    getSnapshotField(order, "order_id"),
    order.orderId?.startsWith?.("order_")
      ? order.orderId
      : null
  );

  if (
    !String(paymentId || "").startsWith("pay_") ||
    !String(razorpayOrderId || "").startsWith("order_")
  ) {
    throw appError(
      "RAZORPAY_IDS_MISSING",
      "Razorpay payment ID or gateway order ID was not saved."
    );
  }

  const authorization = Buffer.from(
    `${keyId}:${secret}`
  ).toString("base64");

  const headers = {
    Authorization: `Basic ${authorization}`,
    Accept: "application/json",
  };

  const payment = await gatewayRequest(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
    { headers }
  );

  if (String(payment.id) !== String(paymentId)) {
    throw appError(
      "RAZORPAY_ID_MISMATCH",
      "Razorpay payment ID does not match."
    );
  }

  if (String(payment.order_id) !== String(razorpayOrderId)) {
    throw appError(
      "RAZORPAY_ORDER_MISMATCH",
      "Razorpay order ID does not match."
    );
  }

  if (
    normalize(payment.status) !== "captured" ||
    payment.captured !== true
  ) {
    throw appError(
      "RAZORPAY_NOT_CAPTURED",
      "Razorpay payment has not been captured."
    );
  }

  // For INR payments, Razorpay returns paise.
  // This controller currently supports INR orders.
  if (getCurrency(order) !== "INR") {
    throw appError(
      "RAZORPAY_CURRENCY_UNSUPPORTED",
      "Configure currency-specific subunits before verifying non-INR Razorpay payments."
    );
  }

  verifyAmount(Number(payment.amount) / 100, order);
  verifyCurrency(payment.currency, order);

  const gatewayOrder = await gatewayRequest(
    `https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpayOrderId)}`,
    { headers }
  );

  if (String(gatewayOrder.id) !== String(razorpayOrderId)) {
    throw appError(
      "RAZORPAY_ORDER_MISMATCH",
      "Razorpay returned a different order."
    );
  }

  verifyAmount(Number(gatewayOrder.amount) / 100, order);
  verifyCurrency(gatewayOrder.currency, order);

  return {
    provider: "razorpay",
    gatewayOrderId: razorpayOrderId,
    paymentId,
  };
};

/* =========================================================
   PAYU VERIFICATION
========================================================= */

const verifyPayU = async (order) => {
  const key =
    process.env.PAYU_KEY ||
    process.env.PAYU_MERCHANT_KEY;

  const salt =
    process.env.PAYU_SALT ||
    process.env.PAYU_MERCHANT_SALT;

  if (!key || !salt) {
    throw appError(
      "PAYU_CONFIG_MISSING",
      "PayU merchant credentials are missing."
    );
  }

  const txnid = first(
    getSnapshotField(order, "txnid"),
    order.payment?.transactionId,
    order.orderId
  );

  if (!txnid) {
    throw appError(
      "PAYU_TXNID_MISSING",
      "PayU transaction ID is missing."
    );
  }

  if (getCurrency(order) !== "INR") {
    throw appError(
      "PAYU_CURRENCY_MISMATCH",
      "PayU India order currency must be INR."
    );
  }

  const command = "verify_payment";

  const hash = crypto
    .createHash("sha512")
    .update(`${key}|${command}|${txnid}|${salt}`)
    .digest("hex");

  const payload = new URLSearchParams({
    key,
    command,
    var1: String(txnid),
    hash,
  });

  const test = ["test", "sandbox"].includes(
    normalize(process.env.PAYU_ENV)
  );

  const endpoint = test
    ? "https://test.payu.in/merchant/postservice.php?form=2"
    : "https://info.payu.in/merchant/postservice.php?form=2";

  const result = await gatewayRequest(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: payload.toString(),
  });

  const transaction =
    result?.transaction_details?.[String(txnid)];

  if (!transaction) {
    throw appError(
      "PAYU_TRANSACTION_MISSING",
      "PayU did not return the requested transaction."
    );
  }

  if (normalize(transaction.status) !== "success") {
    throw appError(
      "PAYU_NOT_SUCCESS",
      "PayU has not confirmed this payment as successful."
    );
  }

  if (
    transaction.txnid &&
    String(transaction.txnid) !== String(txnid)
  ) {
    throw appError(
      "PAYU_TXNID_MISMATCH",
      "PayU returned a different transaction ID."
    );
  }

  verifyAmount(
    first(transaction.amt, transaction.amount),
    order
  );

  return {
    provider: "payu",
    transactionId: txnid,
    gatewayPaymentId: transaction.mihpayid || null,
  };
};

/* =========================================================
   MULTI-GATEWAY VERIFICATION
========================================================= */

const verifyPaymentWithGateway = async (order) => {
  const provider = getProvider(order);

  if (provider === "cashfree") {
    return verifyCashfree(order);
  }

  if (provider === "razorpay") {
    return verifyRazorpay(order);
  }

  return verifyPayU(order);
};

/* =========================================================
   SHARED EMAIL LAYOUT
========================================================= */

const emailShell = ({
  title,
  subtitle,
  body,
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport"
        content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f8fafc;
  font-family:Arial,Helvetica,sans-serif;
  color:#0f172a;
">
  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="background:#f8fafc;"
  >
    <tr>
      <td align="center" style="padding:30px 14px;">
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="
            max-width:650px;
            background:#ffffff;
            border:1px solid #e2e8f0;
            border-radius:16px;
          "
        >
          <tr>
            <td style="
              padding:25px;
              background:#fff7ed;
              border-bottom:1px solid #fed7aa;
            ">
              <div style="
                color:#ea580c;
                font-size:25px;
                font-weight:800;
              ">
                Target Trek
              </div>

              <div style="
                margin-top:6px;
                color:#64748b;
                font-size:12px;
              ">
                Learn. Build. Grow.
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 25px;">
              <h1 style="
                margin:0;
                font-size:24px;
                line-height:1.3;
              ">
                ${escapeHtml(title)}
              </h1>

              <p style="
                color:#64748b;
                font-size:14px;
                line-height:1.7;
              ">
                ${escapeHtml(subtitle)}
              </p>

              ${body}

              <p style="
                margin-top:30px;
                font-size:13px;
                color:#64748b;
                line-height:1.7;
              ">
                Need help?
                <a href="mailto:${SUPPORT_EMAIL}"
                   style="color:#ea580c;">
                  ${SUPPORT_EMAIL}
                </a>
              </p>

              <p style="
                margin-top:20px;
                font-size:12px;
                color:#94a3b8;
              ">
                Team Target Trek
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const emailButton = (url, text) => `
  <table role="presentation" cellpadding="0"
         cellspacing="0" style="margin:25px 0;">
    <tr>
      <td style="
        background:#ea580c;
        border-radius:10px;
        padding:15px 25px;
      ">
        <a href="${escapeHtml(url)}"
           style="
             color:#ffffff;
             font-size:14px;
             font-weight:800;
             text-decoration:none;
           ">
          ${escapeHtml(text)}
        </a>
      </td>
    </tr>
  </table>
`;

const emailBookCard = (book) => {
  const cover = getCoverUrl(book);

  return `
    <div style="
      margin:22px 0;
      padding:16px;
      background:#f8fafc;
      border:1px solid #e2e8f0;
      border-radius:12px;
    ">
      ${
        cover
          ? `<img
               src="${escapeHtml(cover)}"
               alt="${escapeHtml(book.title)}"
               width="100"
               style="
                 border-radius:8px;
                 display:block;
                 margin-bottom:12px;
               "
             />`
          : ""
      }

      <div style="
        font-size:18px;
        font-weight:800;
        color:#0f172a;
      ">
        ${escapeHtml(book.title)}
      </div>

      ${
        book.subtitle
          ? `<p style="
                color:#64748b;
                font-size:13px;
              ">
                ${escapeHtml(book.subtitle)}
             </p>`
          : ""
      }
    </div>
  `;
};

/* =========================================================
   BUILD PENDING PURCHASE EMAIL
========================================================= */

export const buildPendingPurchaseEmail = ({
  order,
  book,
  couponCode = "",
  couponDescription = "",
  couponValidation = null,
}) => {
  const name = order.customer?.name || "there";
  const email = order.customer?.email || "";

  const price = Number(book.price || 0);
  const mrp = Number(book.mrp || 0);
  const currency = book.currency || "INR";

  const purchaseUrl = getPurchaseURL(book);

  const discount =
    couponValidation?.discountAmount ??
    couponValidation?.data?.discountAmount ??
    null;

  const finalAmount =
    couponValidation?.finalAmount ??
    couponValidation?.data?.finalAmount ??
    null;

  const hasCoupon =
    Boolean(couponCode && couponDescription);

  const subject = hasCoupon
    ? `Complete your ${book.title} purchase — coupon inside | Target Trek`
    : `Complete your ${book.title} purchase | Target Trek`;

  const text = `
Hi ${name},

You started purchasing "${book.title}" but did not complete payment.

Order ID: ${order.orderId}
Customer Email: ${email}

Book: ${book.title}
Current Price: ${formatAmount(price, currency)}
${mrp > price ? `MRP: ${formatAmount(mrp, currency)}` : ""}

${
  hasCoupon
    ? `Coupon: ${couponCode}
Offer: ${couponDescription}
${discount != null ? `Discount: ${formatAmount(discount, currency)}` : ""}
${finalAmount != null ? `Final Price: ${formatAmount(finalAmount, currency)}` : ""}`
    : ""
}

Complete your purchase:
${purchaseUrl}

Explore all books:
${BOOKS_URL}

Support:
${SUPPORT_EMAIL}

Team Target Trek
  `.trim();

  const couponHtml = hasCoupon
    ? `
      <div style="
        padding:18px;
        background:#f0fdf4;
        border:1px solid #bbf7d0;
        border-radius:12px;
        margin:20px 0;
      ">
        <strong>Special Offer</strong>

        <p>${escapeHtml(couponDescription)}</p>

        <p style="font-size:20px;font-weight:800;">
          ${escapeHtml(couponCode)}
        </p>

        ${
          discount != null
            ? `<p>You save:
                 ${escapeHtml(formatAmount(discount, currency))}
               </p>`
            : ""
        }

        ${
          finalAmount != null
            ? `<p>Final price:
                 ${escapeHtml(formatAmount(finalAmount, currency))}
               </p>`
            : ""
        }
      </div>
    `
    : "";

  const html = emailShell({
    title: `Hi ${name},`,
    subtitle:
      "Your Target Trek purchase is waiting for you.",

    body: `
      <p style="font-size:14px;line-height:1.7;">
        You started purchasing
        <strong>${escapeHtml(book.title)}</strong>,
        but the payment was not completed.
      </p>

      ${emailBookCard(book)}

      <p>
        Order ID:
        <strong>${escapeHtml(order.orderId)}</strong>
      </p>

      ${
        mrp > price
          ? `<p>
               MRP:
               <del>${escapeHtml(formatAmount(mrp, currency))}</del>
             </p>`
          : ""
      }

      <p style="font-size:18px;font-weight:800;color:#ea580c;">
        ${escapeHtml(formatAmount(price, currency))}
      </p>

      ${couponHtml}

      ${emailButton(purchaseUrl, "Complete Your Purchase")}

      <p style="font-size:12px;word-break:break-all;">
        ${escapeHtml(purchaseUrl)}
      </p>
    `,
  });

  return {
    subject,
    text,
    html,
    purchaseUrl,
  };
};

/* =========================================================
   SEND PENDING PURCHASE EMAIL
========================================================= */

const sendPendingPurchaseMail = async (req, res) => {
  try {
    const order = await Order.findOne(
      getOrderQuery(req.params.orderId)
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const allowed = new Set([
      "pending",
      "failed",
      "cancelled",
    ]);

    if (
      !allowed.has(normalize(order.orderStatus)) ||
      !allowed.has(normalize(order.payment?.status))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Purchase reminders are only available for unpaid orders.",
      });
    }

    const email = String(
      order.customer?.email || ""
    )
      .trim()
      .toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Customer email is invalid.",
      });
    }

    const book = await getPurchasedBook(order);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    // Offer order: the mail names the whole bundle, not just its first book
    if (order.offer?.offerId && order.book?.title) {
      book.title = order.book.title;
    }

    if (book.isActive === false || book.isPublished === false) {
      return res.status(400).json({
        success: false,
        message: "This book is not available for purchase.",
      });
    }

    if (!book.redirectUrl) {
      return res.status(400).json({
        success: false,
        message: "Book purchase URL is not configured.",
      });
    }

    const couponCode =
      typeof req.body?.couponCode === "string"
        ? req.body.couponCode.trim().toUpperCase()
        : "";

    const couponDescription =
      typeof req.body?.couponDescription === "string"
        ? req.body.couponDescription.trim()
        : "";

    if (Boolean(couponCode) !== Boolean(couponDescription)) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon code and description must both be provided.",
      });
    }

    let couponValidation = null;

    if (couponCode) {
      couponValidation = await validateCouponForPayment({
        couponCode,
        bookId: String(book._id),
        book,
        email,
      });

      if (
        couponValidation?.valid === false ||
        couponValidation?.success === false
      ) {
        return res.status(400).json({
          success: false,
          message:
            couponValidation?.message ||
            "Coupon validation failed.",
        });
      }
    }

    const message = buildPendingPurchaseEmail({
      order,
      book,
      couponCode,
      couponDescription,
      couponValidation,
    });

    try {
      await sendMail(
        email,
        message.subject,
        message.text,
        message.html
      );
    } catch (error) {
      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            "pendingMail.lastStatus": "FAILED",
            "pendingMail.lastError": String(
              error.message || "Mail failed"
            ).slice(0, 500),
          },
        }
      );

      return res.status(502).json({
        success: false,
        message: "Unable to send pending purchase email.",
      });
    }

    const now = new Date();

    const update = {
      $inc: {
        "pendingMail.sentCount": 1,
      },
      $set: {
        "pendingMail.lastSentAt": now,
        "pendingMail.lastSentBy": getAdminIdentifier(req),
        "pendingMail.lastStatus": "SENT",
        "pendingMail.lastError": null,
        updatedBy: getAdminIdentifier(req),
      },
    };

    if (!order.pendingMail?.firstSentAt) {
      update.$set["pendingMail.firstSentAt"] = now;
    }

    const updated = await Order.findByIdAndUpdate(
      order._id,
      update,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Pending purchase email sent successfully.",
      data: {
        orderId: updated.orderId,
        customerEmail: email,
        bookTitle: book.title,
        couponCode: couponCode || null,
        purchaseUrl: message.purchaseUrl,
        pendingMail: updated.pendingMail,
      },
    });
  } catch (error) {
    console.error("sendPendingPurchaseMail:", error);

    return res.status(error.status || 500).json({
      success: false,
      code: error.code || "PENDING_MAIL_ERROR",
      message:
        error.status ? error.message : "Unable to send reminder.",
    });
  }
};

/* =========================================================
   BUILD BOOK ACCESS EMAIL
========================================================= */

const buildBookAccessEmail = ({
  order,
  book,
  accessUrl,
  accessExpiresAt,
  generatedNewAccess = true,
  includedTitles = [],
}) => {
  const name = order.customer?.name || "there";
  const isOffer = includedTitles.length > 0;
  const title = isOffer
    ? order.book?.title || "Your book bundle"
    : book.title || order.book?.title || "Your book";

  const booksText = isOffer
    ? `\nBooks in this order:\n${includedTitles.map((t) => `- ${t}`).join("\n")}\n`
    : "";

  const booksHtml = isOffer
    ? `<div style="margin-top:14px;padding:14px;border:1px solid #fed7aa;border-radius:10px;background:#fff7ed;">
         <strong>Books in this order (${includedTitles.length})</strong>
         <ul style="margin:8px 0 0;padding-left:18px;font-size:14px;line-height:1.7;">
           ${includedTitles.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}
         </ul>
       </div>`
    : emailBookCard(book);
  const currency = getCurrency(order);

  const amount = getPaidAmount(order);
  const transactionId = getTransactionId(order);
  const method = order.payment?.method || "Online Payment";

  const subject = `Your ${title} access link | Target Trek`;

  const text = `
Hi ${name},

Thank you for purchasing "${title}" from Target Trek.

${booksText}
Your secure book access link is ready:

${accessUrl}

Order ID: ${order.orderId}
Transaction ID: ${transactionId}
Payment Gateway: ${order.payment?.provider || "Online"}
Payment Method: ${method}
Amount Paid: ${formatAmount(amount, currency)}
Purchase Date: ${formatDate(
    order.payment?.paidAt || order.createdAt
  )}

Your access link expires on:
${formatDate(accessExpiresAt)}

Do not share this link.

Support: ${SUPPORT_EMAIL}

Team Target Trek
  `.trim();

  const html = emailShell({
    title: `Hi ${name},`,
    subtitle:
      "Your payment is complete and your book is ready.",

    body: `
      <p style="font-size:14px;line-height:1.7;">
        Thank you for purchasing
        <strong>${escapeHtml(title)}</strong>.
      </p>

      ${booksHtml}

      ${emailButton(accessUrl, isOffer ? "Access Your Books" : "Access Your Book")}

      <div style="
        margin-top:18px;
        padding:14px;
        border:1px solid #e2e8f0;
        border-radius:10px;
        background:#f8fafc;
      ">
        <strong>Payment Details</strong>

        <p>Order ID:
          ${escapeHtml(order.orderId)}
        </p>

        <p>Transaction:
          ${escapeHtml(transactionId)}
        </p>

        <p>Payment Method:
          ${escapeHtml(method)}
        </p>

        <p>Amount Paid:
          <strong>
            ${escapeHtml(formatAmount(amount, currency))}
          </strong>
        </p>

        <p>Purchase Date:
          ${escapeHtml(formatDate(
            order.payment?.paidAt || order.createdAt
          ))}
        </p>
      </div>

      <div style="
        padding:16px;
        margin-top:20px;
        background:#fff7ed;
        border:1px solid #fed7aa;
        border-radius:12px;
        color:#9a3412;
      ">
        <strong>Secure Access Link</strong>

        <p>
          This link is valid until
          <strong>
            ${escapeHtml(formatDate(accessExpiresAt))}
          </strong>.
        </p>

        <p>
          Do not share the access link with anyone.
        </p>
      </div>

      <p style="
        font-size:12px;
        word-break:break-all;
      ">
        Link:
        <a href="${escapeHtml(accessUrl)}">
          ${escapeHtml(accessUrl)}
        </a>
      </p>
    `,
  });

  return {
    subject,
    text,
    html,
    accessUrl,
    accessExpiresAt,
    generatedNewAccess,
  };
};

/* =========================================================
   RESEND ACCESS EMAIL

   1. Find order
   2. Check paid status
   3. Check customer
   4. Verify live gateway
   5. Atomically rotate token
   6. Send email
   7. Roll back token on mail failure
========================================================= */

const resendBookAccessMail = async (req, res) => {
  try {
    const order = await Order.findOne(
      getOrderQuery(req.params.orderId)
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!validatePaidOrder(order)) {
      return res.status(400).json({
        success: false,
        code: "ORDER_NOT_PAID",
        message:
          "Order is not eligible for book access. Payment must be successful and access must not be revoked or fully refunded.",
      });
    }

    const customerEmail = String(
      order.customer?.email || ""
    )
      .trim()
      .toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer email is invalid.",
      });
    }

    const book = await getPurchasedBook(order);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Purchased book not found.",
      });
    }

    // Historical paid purchases are not blocked merely
    // because a product is no longer published.

    let verification;

    try {
      verification = await verifyPaymentWithGateway(order);
    } catch (error) {
      console.error("Gateway verification failure:", {
        orderId: order.orderId,
        provider: order.payment?.provider,
        code: error.code,
        message: error.message,
      });

      return res.status(error.status || 409).json({
        success: false,
        code: error.code || "GATEWAY_VERIFICATION_FAILED",
        message:
          "Payment verification failed. Access email was not sent.",
        reason: error.message,
      });
    }

    const now = new Date();
    const token = generateAccessToken();
    const tokenHash = hashAccessToken(token);

    const expiresAt = new Date(
      now.getTime() + ACCESS_DURATION
    );

    const accessUrl = buildAccessUrl(
      token,
      order.orderId
    );

    const previousAccess = {
      tokenHash: order.access?.tokenHash ?? null,
      expiresAt: order.access?.expiresAt ?? null,
      generatedAt: order.access?.generatedAt ?? null,
      lastAccessedAt:
        order.access?.lastAccessedAt ?? null,
      accessCount: order.access?.accessCount ?? 0,
      revoked: order.access?.revoked ?? false,
    };

    const verificationField = {
      cashfree: "verification.cashfreeVerified",
      razorpay: "verification.razorpayVerified",
      payu: "verification.payuVerified",
    }[verification.provider];

    // Optimistic lock prevents two concurrent resends
    // from overwriting each other's access token.
    const updated = await Order.findOneAndUpdate(
      {
        _id: order._id,
        orderStatus: order.orderStatus,
        "payment.status": order.payment.status,
        "payment.provider": order.payment.provider,
        "access.revoked": { $ne: true },
        "access.tokenHash": previousAccess.tokenHash,
      },
      {
        $set: {
          "access.tokenHash": tokenHash,
          "access.expiresAt": expiresAt,
          "access.generatedAt": now,
          "access.lastAccessedAt": null,
          "access.accessCount": 0,
          "access.revoked": false,

          [verificationField]: true,
          "verification.amountVerified": true,
          "verification.verifiedAt": now,

          updatedBy: getAdminIdentifier(req),
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({
        success: false,
        code: "ORDER_CHANGED",
        message:
          "Order or access state changed during verification. Retry after reviewing the order.",
      });
    }

    const email = buildBookAccessEmail({
      order: updated,
      book,
      accessUrl,
      accessExpiresAt: expiresAt,
      generatedNewAccess: true,
      includedTitles: await getOfferBookTitles(updated),
    });

    try {
      await sendMail(
        customerEmail,
        email.subject,
        email.text,
        email.html
      );
    } catch (error) {
      // Restore previous access only if our generated
      // token is still the active token.
      await Order.updateOne(
        {
          _id: order._id,
          "access.tokenHash": tokenHash,
        },
        {
          $set: {
            "access.tokenHash": previousAccess.tokenHash,
            "access.expiresAt": previousAccess.expiresAt,
            "access.generatedAt": previousAccess.generatedAt,
            "access.lastAccessedAt":
              previousAccess.lastAccessedAt,
            "access.accessCount": previousAccess.accessCount,
            "access.revoked": previousAccess.revoked,
          },
        }
      );

      console.error("Access mail failure:", error.message);

      return res.status(502).json({
        success: false,
        code: "ACCESS_EMAIL_FAILED",
        message:
          "Payment was verified but the email could not be sent.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Payment verified and a fresh 24-hour access email sent successfully.",
      data: {
        orderId: order.orderId,
        mongoOrderId: order._id,
        customer: {
          name: order.customer?.name,
          email: customerEmail,
        },
        book: {
          id: book._id,
          title: book.title,
        },
        payment: {
          provider: verification.provider,
          status: order.payment.status,
          verified: true,
          amount: order.payment.amount,
          currency: getCurrency(order),
        },
        access: {
          generatedAt: now,
          expiresAt,
          revoked: false,
          accessCount: 0,
        },
        email: {
          sent: true,
          sentTo: customerEmail,
        },
      },
    });
  } catch (error) {
    console.error("resendBookAccessMail:", error);

    return res.status(error.status || 500).json({
      success: false,
      code: error.code || "ACCESS_RESEND_ERROR",
      message:
        error.status
          ? error.message
          : "Unable to resend access email.",
    });
  }
};

/* =========================================================
   REVOKE BOOK ACCESS
========================================================= */

const revokeBookAccess = async (req, res) => {
  try {
    const order = await Order.findOne(
      getOrderQuery(req.params.orderId)
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!order.access?.tokenHash) {
      return res.status(400).json({
        success: false,
        message: "No active access token exists for this order.",
      });
    }

    if (order.access?.revoked) {
      return res.status(400).json({
        success: false,
        message: "Book access is already revoked.",
      });
    }

    const updated = await Order.findOneAndUpdate(
      {
        _id: order._id,
        "access.revoked": { $ne: true },
      },
      {
        $set: {
          "access.revoked": true,
          updatedBy: getAdminIdentifier(req),
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({
        success: false,
        message: "Book access was changed by another request.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book access revoked successfully.",
      data: {
        orderId: updated.orderId,
        access: {
          revoked: updated.access.revoked,
          expiresAt: updated.access.expiresAt,
          accessCount: updated.access.accessCount,
        },
      },
    });
  } catch (error) {
    console.error("revokeBookAccess:", error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.status
          ? error.message
          : "Unable to revoke book access.",
    });
  }
};

/* =========================================================
   EXTEND BOOK ACCESS

   Request body:
   {
     "hours": 24
   }
========================================================= */

const extendBookAccess = async (req, res) => {
  try {
    const hours = Number(req.body?.hours);

    if (
      !Number.isSafeInteger(hours) ||
      hours <= 0 ||
      hours > 720
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Hours must be a positive integer between 1 and 720.",
      });
    }

    const order = await Order.findOne(
      getOrderQuery(req.params.orderId)
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!validatePaidOrder(order)) {
      return res.status(400).json({
        success: false,
        message:
          "Only paid, non-revoked orders can have access extended.",
      });
    }

    if (!order.access?.tokenHash) {
      return res.status(400).json({
        success: false,
        message:
          "No access token exists. Send an access email first.",
      });
    }

    const now = new Date();

    const oldExpiry = order.access?.expiresAt
      ? new Date(order.access.expiresAt)
      : now;

    const base =
      oldExpiry.getTime() > now.getTime()
        ? oldExpiry
        : now;

    const newExpiry = new Date(
      base.getTime() + hours * 60 * 60 * 1000
    );

    const updated = await Order.findOneAndUpdate(
      {
        _id: order._id,
        "access.revoked": { $ne: true },
        "access.tokenHash": order.access.tokenHash,
        "access.expiresAt": order.access.expiresAt,
        orderStatus: order.orderStatus,
        "payment.status": order.payment.status,
      },
      {
        $set: {
          "access.expiresAt": newExpiry,
          updatedBy: getAdminIdentifier(req),
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({
        success: false,
        message:
          "Access was changed concurrently. Please reload and retry.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Book access extended by ${hours} hours.`,
      data: {
        orderId: updated.orderId,
        hoursAdded: hours,
        previousExpiry: oldExpiry,
        newExpiry: updated.access.expiresAt,
        revoked: updated.access.revoked,
      },
    });
  } catch (error) {
    console.error("extendBookAccess:", error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.status
          ? error.message
          : "Unable to extend book access.",
    });
  }
};

/* =========================================================
   SEND EBOOK PDFs (ADMIN BUTTON)

   Responds immediately (202); the PDFs are downloaded and
   emailed in the background because they can be large.
========================================================= */

const sendEbookPdfs = async (req, res) => {
  try {
    const order = await Order.findOne(getOrderQuery(req.params.orderId))
      .select("_id orderId orderStatus payment.status ebookEmail customer.email")
      .lean();

    if (!order) {
      throw appError("ORDER_NOT_FOUND", "Order not found.", 404);
    }

    if (order.orderStatus !== "PAID" || order.payment?.status !== "SUCCESS") {
      throw appError(
        "ORDER_NOT_PAID",
        "PDFs can only be sent for a successful paid order.",
        400
      );
    }

    if (!order.customer?.email) {
      throw appError("NO_EMAIL", "Customer email is missing.", 400);
    }

    const busy =
      order.ebookEmail?.status === "SENDING" &&
      order.ebookEmail?.lockedAt &&
      Date.now() - new Date(order.ebookEmail.lockedAt).getTime() <
        10 * 60 * 1000;

    if (busy) {
      throw appError(
        "SEND_IN_PROGRESS",
        "PDFs are already being sent for this order.",
        409
      );
    }

    const adminId = getAdminIdentifier(req);

    enqueueEbookEmail(order._id, { trigger: "admin", adminId });

    return res.status(202).json({
      success: true,
      message: `PDFs are being emailed to ${order.customer.email}. This can take a minute.`,
      data: { orderId: order.orderId },
    });
  } catch (error) {
    console.error("sendEbookPdfs:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Unable to send ebook PDFs.",
    });
  }
};

/* =========================================================
   EXPORTS
========================================================= */

export {
  sendEbookPdfs,
  sendPendingPurchaseMail,
  resendBookAccessMail,
  revokeBookAccess,
  extendBookAccess,
};
