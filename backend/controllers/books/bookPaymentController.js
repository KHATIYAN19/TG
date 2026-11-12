import mongoose from "mongoose";
import Book from "../../models/Book.js";
import Order from "../../models/Order.js";
import { buildAttribution } from "../../utils/attribution.js";
import { resolveOfferCheckout, applyOfferToBook, offerOrderFields, offerErrorResponse } from "../../services/bundleOffers.js";
import { validateCouponForPayment } from "../couponController.js";
import { BACKEND_URL, FRONTEND_URL } from "../../config/urls.js";
import { gatewayPhone } from "../../utils/phone.js";
import { createPayment, verifyPayment, parseWebhook, parseCallback, pickGateway, newOrderRef, PaymentError } from "../../services/payments/index.js";
import { buildCouponData, resolveAffiliate, settleBookOrder, providerLabel } from "../../services/books/bookOrderHelpers.js";

/*
  BOOKS PAYMENT API  (one API for every gateway)
  ----------------------------------------------
  POST /payment/books/create        validate everything (book, offer, coupon, affiliate), save the order, call the processor
  POST /payment/books/verify        the browser says "paid" (Razorpay's signed popup result) -> ask the gateway, settle
  ALL  /payment/books/return        redirect gateways (Cashfree, PayU) send the buyer back here -> verify, settle, redirect
  POST /payment/books/webhook/:gw   gateway -> server notification (raw body)
  GET  /payment/books/status/:id    current order status

  Which gateway runs comes from the .env (BOOKS_PAYMENT_GATEWAY / PAYMENT_GATEWAY). The frontend may pass a
  `gateway` preference; it is only honoured if that gateway is configured.
*/
const PRODUCT = "BOOKS";

const failedRedirect = (orderId = null) => `${FRONTEND_URL}/payment/failed${orderId ? `?order=${encodeURIComponent(orderId)}` : ""}`;
const successRedirect = (token, orderId) => `${FRONTEND_URL}/payment/success?token=${encodeURIComponent(token)}&order=${encodeURIComponent(orderId)}`;

const paise = (amount) => Math.round((Number(amount) + Number.EPSILON) * 100);
const gatewayOf = (order) => String(order?.payment?.provider || "").toLowerCase();
const isPaid = (o) => o?.orderStatus === "PAID" && o?.payment?.status === "SUCCESS" && o?.verification?.amountVerified;

const clientIp = (req) => req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || null;

/* ------------------------------------------------------------------ */
/* Ask the gateway and settle. Returns { state: "paid"|"pending"|"failed", token?, order?, reason? } */
const confirmAndSettle = async (order, { proof, issueAccessToken, updatedBy }) => {
  const gateway = gatewayOf(order);
  const result = await verifyPayment({
    product: PRODUCT,
    gateway,
    gatewayOrderId: order.payment.transactionId,
    expectedAmountPaise: paise(order.payment.amount),
    proof,
  });

  if (result.status === "paid") {
    const expectedCurrency = String(order.book?.currency || "INR").toUpperCase();
    if (result.currency && result.currency !== expectedCurrency) return { state: "failed", reason: "CURRENCY_MISMATCH" };
    const settled = await settleBookOrder({ order, gateway, result, signatureVerified: Boolean(proof), issueAccessToken, updatedBy });
    return settled.order ? { state: "paid", order: settled.order, token: settled.token } : { state: "failed", reason: "SETTLE_FAILED" };
  }

  if (result.status === "failed") {
    await Order.updateOne(
      { _id: order._id, orderStatus: { $ne: "PAID" } },
      { $set: { "payment.verificationResponse": result.raw ?? { reason: result.reason }, "verification.amountVerified": result.reason !== "AMOUNT_MISMATCH", "verification.verifiedAt": new Date(), updatedBy } }
    );
    return { state: "failed", reason: result.reason };
  }
  return { state: "pending" };
};

/* ================================================================== */
/* CREATE                                                              */
/* ================================================================== */
export const createBookPayment = async (req, res) => {
  let createdOrder = null;
  try {
    const { affiliateCode, bookId, firstname, email, phone, couponCode, utmSource, utmMedium, utmCampaign, attribution, gateway: preferred } = req.body || {};

    /* ---------- validate the request ---------- */
    if (!bookId || !firstname || !email || !phone) {
      return res.status(400).json({ success: false, message: "Name, email, phone and bookId are required." });
    }
    if (!mongoose.Types.ObjectId.isValid(bookId)) return res.status(400).json({ success: false, message: "Invalid book ID." });

    const book = await Book.findOne({ _id: bookId, isPublished: true, isActive: true });
    if (!book) return res.status(404).json({ success: false, message: "Book not found." });

    const name = String(firstname).trim();
    const mail = String(email).trim().toLowerCase();
    const mobile = String(phone).trim();
    const currency = String(book.currency || "INR").toUpperCase();
    if (!name || !mail || !mobile) return res.status(400).json({ success: false, message: "Valid name, email and phone are required." });

    /* ---------- offer / coupon / final price ---------- */
    let offerCheckout = null;
    try {
      offerCheckout = await resolveOfferCheckout(req.body);
    } catch (error) {
      return offerErrorResponse(res, error);
    }
    if (offerCheckout) applyOfferToBook(book, offerCheckout);

    let pricing;
    try {
      pricing = offerCheckout ? offerCheckout.pricing : await validateCouponForPayment({ couponCode, book, email: mail });
    } catch (error) {
      return res.status(error.statusCode || 400).json({ success: false, code: error.code || "COUPON_INVALID", message: error.message || "Invalid coupon." });
    }

    const finalAmount = Number(pricing.finalAmount);
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) return res.status(400).json({ success: false, message: "Invalid payment amount." });

    const affiliateDetails = await resolveAffiliate({ affiliateCode, finalAmount, currency });

    /* ---------- which gateway ---------- */
    const gateway = pickGateway(PRODUCT, preferred);
    const orderId = newOrderRef("BK");

    /* ---------- save the order (PENDING) ---------- */
    createdOrder = await Order.create({
      orderId,
      bookId: book._id,
      ...offerOrderFields(offerCheckout),
      book: { title: book.title, price: book.price, mrp: book.mrp || book.price, currency },
      customer: { name, email: mail, phone: mobile },
      coupon: buildCouponData(pricing),
      payment: {
        provider: providerLabel(gateway),
        transactionId: orderId,
        affiliateCode: affiliateDetails.affiliateCode,
        affiliateUserId: affiliateDetails.affiliateUserId,
        affiliateType: affiliateDetails.affiliateType,
        affiliateValue: affiliateDetails.affiliateValue,
        affiliateAmount: affiliateDetails.affiliateAmount,
        remainingAmount: affiliateDetails.remainingAmount,
        amount: finalAmount,
        status: "PENDING",
      },
      orderStatus: "PENDING",
      metadata: {
        ipAddress: clientIp(req),
        userAgent: req.headers["user-agent"] || null,
        referrer: req.headers.referer || null,
        utmSource: typeof utmSource === "string" ? utmSource.trim() || null : null,
        utmMedium: typeof utmMedium === "string" ? utmMedium.trim() || null : null,
        utmCampaign: typeof utmCampaign === "string" ? utmCampaign.trim() || null : null,
        attribution: buildAttribution(attribution, { utmSource, utmMedium, utmCampaign }),
      },
      createdBy: "customer",
    });

    /* ---------- hand over to the payment processor ---------- */
    const p = await createPayment({
      product: PRODUCT,
      gateway,
      orderRef: orderId,
      amountPaise: paise(finalAmount),
      currency,
      customer: { id: orderId, name, email: mail, phone: gatewayPhone({ mobile }), rawPhone: mobile },
      returnUrl: `${BACKEND_URL}/payment/books/return?order=${encodeURIComponent(orderId)}`,
      webhookUrl: `${BACKEND_URL}/payment/books/webhook/${gateway}`,
      description: `Purchase ${book.title}`.slice(0, 100),
      notes: { book_id: String(book._id), affiliate_code: affiliateDetails.affiliateCode || "direct" },
    });

    await Order.updateOne(
      { _id: createdOrder._id },
      {
        $set: {
          "payment.transactionId": p.gatewayOrderId, // Razorpay's own order id; for the others it equals orderId
          ...(p.checkout?.paymentSessionId ? { "payment.sessionId": p.checkout.paymentSessionId } : {}),
          "payment.createResponse": { gateway: p.gateway, mode: p.mode, gatewayOrderId: p.gatewayOrderId },
          updatedBy: "books-create",
        },
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        orderId,
        gateway: p.gateway,
        mode: p.mode,
        checkout: p.checkout,
        pricing: {
          couponApplied: pricing.couponApplied,
          couponCode: pricing.coupon?.code || null,
          couponName: pricing.coupon?.name || null,
          originalAmount: pricing.originalAmount,
          discountAmount: pricing.discountAmount,
          finalAmount: pricing.finalAmount,
          currency,
        },
      },
    });
  } catch (error) {
    console.error("[books-pay] create failed:", error?.detail || error?.message || error);
    if (createdOrder?._id) {
      await Order.updateOne(
        { _id: createdOrder._id, orderStatus: { $ne: "PAID" } },
        { $set: { orderStatus: "FAILED", "payment.status": "FAILED", "payment.failedAt": new Date(), "payment.createResponse": { error: error?.code || error?.message || "CREATE_FAILED" }, updatedBy: "books-create" } }
      ).catch(() => {});
    }
    const known = error instanceof PaymentError;
    return res.status(known ? error.status : 502).json({ success: false, code: known ? error.code : undefined, message: known ? error.message : "Unable to start the payment. Please try again." });
  }
};

/* ================================================================== */
/* VERIFY  (browser says "I paid": Razorpay popup result, or a poll)   */
/* ================================================================== */
export const verifyBookPayment = async (req, res) => {
  try {
    const { orderId, payload } = req.body || {};
    const id = String(orderId || "").trim();
    if (!id) return res.status(400).json({ success: false, message: "Order id is required." });

    const order = await Order.findOne({ orderId: id });
    if (!order) return res.status(404).json({ success: false, message: "Payment order not found." });

    const done = async (o, token) =>
      res.status(200).json({ success: true, data: { status: "paid", orderId: o.orderId, redirectUrl: successRedirect(token, o.orderId) } });

    const out = await confirmAndSettle(order, { proof: payload && typeof payload === "object" ? payload : undefined, issueAccessToken: true, updatedBy: "books-verify" });

    if (out.state === "paid" && out.token) return done(out.order, out.token);
    if (out.state === "pending") return res.status(202).json({ success: true, data: { status: "pending", orderId: order.orderId }, message: "Your payment is not confirmed yet." });
    return res.status(400).json({ success: false, data: { status: "failed", orderId: order.orderId }, message: "Payment verification failed. If money was deducted, please contact support." });
  } catch (error) {
    console.error("[books-pay] verify failed:", error?.detail || error?.message || error);
    return res.status(error instanceof PaymentError ? error.status : 502).json({ success: false, message: "Unable to verify the payment right now." });
  }
};

/* ================================================================== */
/* RETURN  (the buyer comes back from Cashfree / PayU)                 */
/* ================================================================== */
export const bookPaymentReturn = async (req, res) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  try {
    const ref = String(req.query.order || "").trim();
    const hint = String(req.query.order_id || body.txnid || "").trim();

    const order = ref ? await Order.findOne({ orderId: ref }) : hint ? await Order.findOne({ "payment.transactionId": hint }) : null;
    if (!order) return res.redirect(303, failedRedirect());

    // The query/body is only a hint: it must name this very order, and the gateway is asked directly.
    const claimed = parseCallback({ product: PRODUCT, gateway: gatewayOf(order), body: { ...req.query, ...body } })?.gatewayOrderId;
    if (claimed && claimed !== order.payment.transactionId && claimed !== order.orderId) return res.redirect(303, failedRedirect(order.orderId));

    const out = await confirmAndSettle(order, { issueAccessToken: true, updatedBy: "books-return" });
    if (out.state === "paid" && out.token) return res.redirect(303, successRedirect(out.token, out.order.orderId));
    return res.redirect(303, failedRedirect(order.orderId));
  } catch (error) {
    console.error("[books-pay] return failed:", error?.detail || error?.message || error);
    return res.redirect(303, failedRedirect());
  }
};

/* ================================================================== */
/* WEBHOOK  (gateway -> server; raw body, signature checked by the processor) */
/* ================================================================== */
export const bookPaymentWebhook = async (req, res) => {
  const gateway = String(req.params.gateway || "").toLowerCase();
  if (!Buffer.isBuffer(req.body)) return res.status(404).json({ success: false });
  try {
    const parsed = parseWebhook({ product: PRODUCT, gateway, rawBody: req.body.toString("utf8"), headers: req.headers });
    if (!parsed.valid) return res.status(400).json({ success: false, message: "Invalid signature" });
    if (parsed.ignore) return res.json({ success: true });

    const order = await Order.findOne({ "payment.provider": providerLabel(gateway), "payment.transactionId": parsed.gatewayOrderId });
    if (order && !isPaid(order)) await confirmAndSettle(order, { updatedBy: `${gateway}-webhook` }); // re-checked with the gateway, not taken from the webhook body
    return res.json({ success: true });
  } catch (error) {
    console.error("[books-pay] webhook failed:", error?.detail || error?.message || error);
    return res.status(500).json({ success: false }); // the gateway will retry
  }
};

/* ================================================================== */
/* STATUS                                                              */
/* ================================================================== */
export const bookPaymentStatus = async (req, res) => {
  const order = await Order.findOne({ orderId: String(req.params.orderId || "") }).select("orderId orderStatus payment.status").lean();
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });
  return res.json({ success: true, data: { orderId: order.orderId, orderStatus: order.orderStatus, paymentStatus: order.payment?.status } });
};
