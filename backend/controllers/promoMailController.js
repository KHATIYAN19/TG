import mongoose from "mongoose";
import { z } from "zod";

import Book from "../models/Book.js";
import Coupon from "../models/Coupon.js";
import MailSuppression from "../models/MailSuppression.js";
import Order from "../models/Order.js";
import PromoMailLog from "../models/PromoMailLog.js";
import sendMail from "../utils/MailSender.js";
import { PAID_STATUSES, isValidEmail, normalizeEmail } from "../services/campaign/audience.js";
import {
  MAX_OFFER_BOOKS,
  buildPersonalOffer,
  loadOfferCatalog,
  validateOffer,
} from "../services/campaign/offerPricing.js";
import { SUPPORT_EMAIL, buildPromoMail, coverUrl } from "../services/promoMail/promoMailBuilder.js";

/*
  PROMOTIONAL MAIL FROM THE BOOK PAYMENTS PAGE

  Payment row -> "Send Promotional Mail" -> pick books + coupons -> the server builds and
  sends one email to that buyer ("Thanks for purchasing X" + the offer + Prep Arena).

  The browser only sends WHICH books and coupons. Prices, links, cover images and the whole
  email are built here, from the database, using checkout's own coupon rules.
*/

class PromoError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const handler = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      return res.status(400).json({
        success: false,
        message: issue ? `${issue.path.join(".") || "input"}: ${issue.message}` : "Invalid input",
      });
    }
    if (error instanceof PromoError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("[promo-mail]", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

const objectId = z.string().refine((v) => mongoose.Types.ObjectId.isValid(String(v)), "Invalid id");

const bodySchema = z.object({
  offer: z.object({
    defaultCouponCode: z.string().trim().max(40).default(""),
    items: z
      .array(
        z.object({
          bookId: objectId,
          // "default" = the coupon above, "own" = this line's couponCode, "none" = normal price
          couponMode: z.enum(["default", "own", "none"]).default("default"),
          couponCode: z.string().trim().max(40).default(""),
        })
      )
      .min(1, "Pick at least one book.")
      .max(MAX_OFFER_BOOKS),
  }),
  note: z.string().max(1500).default(""),
});

const adminName = (req) => req.user?.email || req.user?.name || String(req.user?._id || "admin");

/* ---------------- the order ---------------- */

const findOrder = async (id) => {
  const key = String(id || "");
  const query = mongoose.Types.ObjectId.isValid(key) ? { _id: key } : { orderId: key };
  const order = await Order.findOne(query)
    .select("orderId bookId purchasedBookIds book.title customer orderStatus payment.status")
    .lean();
  if (!order) throw new PromoError("Order not found.", 404);
  return order;
};

/* Everything needed to preview or send: the checks, the personal price list and the email. */
const prepare = async (req) => {
  const { offer: raw, note } = bodySchema.parse(req.body || {});
  const order = await findOrder(req.params.orderId);

  if (!PAID_STATUSES.includes(order.payment?.status)) {
    throw new PromoError("Promotional mail can only be sent to customers with a successful payment.", 409);
  }

  const email = normalizeEmail(order.customer?.email);
  if (!isValidEmail(email)) throw new PromoError("This order has no valid customer email address.", 409);

  if (await MailSuppression.exists({ email })) {
    throw new PromoError("This customer has unsubscribed from promotional emails, so nothing can be sent.", 409);
  }

  const offer = { enabled: true, ...raw };
  const catalog = await loadOfferCatalog(offer);

  // What THIS customer would get: books they own (including this order) are dropped.
  const personal = await buildPersonalOffer(offer, catalog, email, {
    snapshotOwned: [order.bookId, ...(order.purchasedBookIds || [])].filter(Boolean).map(String),
  });

  // Validate the coupons only against the books that are still offered to this customer.
  const remaining = new Set(personal.offer.lines.map((l) => l.bookId));
  const effective = { ...offer, items: offer.items.filter((i) => remaining.has(String(i.bookId))) };
  const check = effective.items.length
    ? validateOffer(effective, catalog)
    : { ok: false, errors: [], warnings: [], couponInfo: [] };

  const errors = [...check.errors];
  if (personal.status === "OWNS_ALL") errors.unshift("This customer already owns every selected book.");
  if (personal.status === "NO_COUPON") errors.unshift("This customer has already used the selected coupon(s).");
  if (personal.status === "INVALID" && !errors.length) errors.push(personal.reason);

  const warnings = [...check.warnings];
  for (const line of personal.offer.lines) {
    if (line.couponNote) warnings.push(`${line.title}: ${line.couponNote}, so it is shown at the normal price.`);
  }

  const name = order.customer?.name || "";
  const purchasedTitle = order.book?.title || "";
  const mail = personal.offer.lines.length
    ? buildPromoMail({ email, name, purchasedTitle, offer: personal.offer, note })
    : null;

  return {
    order,
    email,
    name,
    note,
    personal,
    mail,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
    couponInfo: check.couponInfo,
    ok: personal.status === "OK" && check.ok && Boolean(mail),
  };
};

const previousMails = (email) =>
  PromoMailLog.find({ email }).sort({ createdAt: -1 }).limit(3).select("subject createdAt status couponCodes total sentBy").lean();

/* ---------------- endpoints ---------------- */

/* Books and coupons the modal lets the admin choose from. */
export const promoMailOptions = handler(async (req, res) => {
  const now = new Date();
  const [books, coupons] = await Promise.all([
    Book.find({ isActive: { $ne: false } })
      .select("title price mrp coverImage coverPageUrl resourceType")
      .sort({ title: 1 })
      .lean(),
    Coupon.find({
      isActive: true,
      $or: [{ validTill: null }, { validTill: { $gt: now } }],
    })
      .select("code name discountType discountValue maxDiscountAmount minimumOrderAmount validTill appliesToAllBooks applicableBooks perUserLimit usageLimit usedCount")
      .sort({ createdAt: -1 })
      .limit(300)
      .lean(),
  ]);

  res.json({
    success: true,
    books: books.map((b) => ({
      _id: b._id,
      title: b.title,
      price: b.price,
      mrp: b.mrp,
      resourceType: b.resourceType,
      cover: coverUrl(b),
    })),
    coupons: coupons.map((c) => ({ ...c, applicableBooks: (c.applicableBooks || []).map(String) })),
  });
});

/* The email exactly as it would be sent, plus every problem found. */
export const promoMailPreview = handler(async (req, res) => {
  const p = await prepare(req);

  res.json({
    success: true,
    to: { email: p.email, name: p.name },
    purchasedBook: p.order.book?.title || "",
    ok: p.ok,
    errors: p.errors,
    warnings: p.warnings,
    couponInfo: p.couponInfo,
    alreadyOwns: p.personal.offer.skippedOwned,
    lines: p.personal.offer.lines.map((l) => ({
      bookId: l.bookId,
      title: l.title,
      price: l.price,
      finalAmount: l.finalAmount,
      discountAmount: l.discountAmount,
      couponCode: l.couponCode,
    })),
    total: p.personal.offer.total,
    savings: p.personal.offer.savings,
    subject: p.mail?.subject || "",
    html: p.mail?.html || "",
    previous: await previousMails(p.email),
    replyTo: SUPPORT_EMAIL,
  });
});

export const promoMailSend = handler(async (req, res) => {
  const p = await prepare(req);
  if (!p.ok) throw new PromoError(p.errors[0] || "This mail cannot be sent.", 400);

  const bookIds = p.personal.offer.lines.map((l) => l.bookId).sort();

  // Stops a double click (or a second admin) sending the same mail twice within a few minutes.
  const duplicate = await PromoMailLog.exists({
    orderId: p.order._id,
    bookIds: { $all: bookIds, $size: bookIds.length },
    createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
  });
  if (duplicate) throw new PromoError("This exact mail was just sent to this customer.", 409);

  const info = await sendMail(p.email, p.mail.subject, p.mail.text, p.mail.html, {
    replyTo: SUPPORT_EMAIL,
    headers: p.mail.headers,
  });
  const queued = Boolean(info?.queued || info?.submitted);

  await PromoMailLog.create({
    orderId: p.order._id,
    email: p.email,
    name: p.name,
    subject: p.mail.subject,
    purchasedBook: p.order.book?.title || "",
    bookIds,
    couponCodes: p.personal.offer.couponCodes,
    total: p.personal.offer.total,
    status: queued ? "QUEUED" : "SENT",
    messageId: String(info?.messageId || ""),
    sentBy: adminName(req),
  });

  res.json({
    success: true,
    queued,
    message: queued ? `Promotional mail queued for ${p.email}.` : `Promotional mail sent to ${p.email}.`,
  });
});
