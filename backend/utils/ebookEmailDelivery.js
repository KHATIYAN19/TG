import { FRONTEND_URL } from "../config/urls.js";
import Order from "../models/Order.js";
import Book from "../models/Book.js";
import EbookMailSettings from "../models/EbookMailSettings.js";
import sendMail from "./MailSender.js";
import { scheduleMembershipActivation } from "../services/membership/membershipService.js";
import { schedulePackCodeMail } from "../services/memory/packCode.js";

/* =====================================================
   EBOOK PDF EMAIL DELIVERY

   - Never runs inside the payment-callback request.
     scheduleEbookEmail() only queues work with
     setImmediate(), so the redirect to the success page
     is sent first.
   - Large PDFs: the mail provider (Mailtrap) takes a whole
     message, base64-encoded, in one request and limits its
     size, so big PDFs cannot be attached. Any PDF larger than
     MAX_ATTACHMENT_BYTES is sent as a download link instead
     (its size is checked first, without downloading it).
     Small PDFs are attached and grouped so no single email
     exceeds the limit.
   - If a send WITH attachments is rejected for any reason, it is
     retried once with download links only, so the buyer still
     gets their books.
   - Each successfully mailed book is recorded, so a retry
     after a partial failure does not resend those books.
===================================================== */

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const MB = 1024 * 1024;

/*
 * Largest PDF (and largest total attachment size per email) that is
 * actually attached. Base64 inflates files by ~33% and the provider
 * limits the whole message, so the default is a conservative 5MB.
 * Override with EBOOK_EMAIL_MAX_ATTACHMENT_MB (0 = always send links).
 */
const configuredAttachMb = Number(
  process.env.EBOOK_EMAIL_MAX_ATTACHMENT_MB
);

const MAX_ATTACHMENT_BYTES =
  (Number.isFinite(configuredAttachMb) && configuredAttachMb >= 0
    ? configuredAttachMb
    : 5) * MB;

const MAX_MAIL_BYTES = MAX_ATTACHMENT_BYTES;

const DOWNLOAD_TIMEOUT_MS = 90 * 1000;
const LOCK_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_AUTO_ATTEMPTS = 6;

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

/* -----------------------------------------------------
   Which books does this order entitle the buyer to?
   (same rules as getPurchasedBookAccess)
----------------------------------------------------- */

const resolvePurchasedBooks = async (order) => {
  const product = await Book.findById(order.bookId)
    .select("_id title resourceType includedBooks sendEbookEmailOnPurchase")
    .lean();

  if (!product) {
    throw new Error("Purchased product not found.");
  }

  // Multi-book offer orders always get their PDFs by mail.
  if (order.offer?.offerId) {
    product.sendEbookEmailOnPurchase = true;
  }

  const snapshot = Array.isArray(order.purchasedBookIds)
    ? order.purchasedBookIds
    : [];

  let ids;

  if (snapshot.length > 0) {
    ids = snapshot;
  } else if (product.resourceType === "bundle") {
    ids = product.includedBooks || [];
  } else {
    ids = [product._id];
  }

  ids = [...new Set(ids.map((id) => String(id)))];

  if (!ids.length) {
    throw new Error("No books configured for this purchase.");
  }

  const found = await Book.find({ _id: { $in: ids } })
    .select("_id title slug pdfUrl fileName")
    .lean();

  const map = new Map(found.map((b) => [String(b._id), b]));
  const books = ids.map((id) => map.get(id)).filter(Boolean);

  if (books.length !== ids.length) {
    throw new Error("Some purchased books are unavailable.");
  }

  const missing = books.find((b) => !b.pdfUrl);

  if (missing) {
    throw new Error(`PDF is missing for "${missing.title}".`);
  }

  return { product, books };
};

/* -----------------------------------------------------
   Download a PDF (size-checked)
----------------------------------------------------- */

// Size from a HEAD request, so big files are never downloaded just to
// be linked. Returns null when the size cannot be determined.
const probeSize = async (url) => {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(15 * 1000),
    });

    if (!response.ok) {
      return null;
    }

    const size = Number(response.headers?.get?.("content-length"));

    return Number.isFinite(size) && size > 0 ? size : null;
  } catch {
    return null;
  }
};

const downloadPdf = async (url) => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`PDF download failed (HTTP ${response.status}).`);
  }

  return Buffer.from(await response.arrayBuffer());
};

/*
 * Attachment names MUST match what the payment success page uses for
 * the same book (see getPdfFileName in client/src/payment/paymentSuccess.jsx),
 * so a customer sees one consistent name everywhere:
 *
 *   admin "Display File Name"  ->  slug  ->  title
 *
 * with special characters removed and spaces turned into dashes.
 */
const cleanFileName = (value) =>
  String(value || "Target-Trek-Ebook")
    .replace(/[^a-zA-Z0-9 _.-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^\.+|\.+$/g, "")
    .substring(0, 90) || "Target-Trek-Ebook";

const pdfFileNameFor = (book) => {
  const name = String(
    book?.fileName || book?.slug || book?.title || "Target-Trek-Ebook"
  ).replace(/\.pdf$/i, "");

  return `${cleanFileName(name)}.pdf`;
};

// Two books in one email must never share an attachment name.
const uniqueFileName = (name, used) => {
  const base = name.replace(/\.pdf$/i, "");

  let finalName = `${base}.pdf`;
  let number = 2;

  while (used.has(finalName.toLowerCase())) {
    finalName = `${base}-${number}.pdf`;
    number += 1;
  }

  used.add(finalName.toLowerCase());

  return finalName;
};

/* -----------------------------------------------------
   Email body
----------------------------------------------------- */

const SITE_URL = FRONTEND_URL;

const formatMoney = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: String(currency || "INR").toUpperCase(),
    }).format(Number(amount || 0));
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
};

const formatDate = (date) => {
  const d = date ? new Date(date) : new Date();

  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " IST";
};

/*
 * Table-based layout with inline styles: the only approach that renders
 * consistently in Gmail, Outlook and Apple Mail. Most email clients ignore
 * CSS animation, so the subtle fade/slide-in below is a progressive
 * enhancement (Apple Mail / iOS Mail); other clients show it statically.
 */
const buildEmail = ({ order, attached, linked, part, multiple }) => {
  const name = order.customer?.name || "there";
  const items = [...attached, ...linked];
  const plural = items.length > 1;
  const currency = order.book?.currency || "INR";
  const paidAt = formatDate(order.payment?.paidAt);
  const method = order.payment?.method
    ? String(order.payment.method).toUpperCase()
    : "";

  const ORANGE = "#F97316";
  const ORANGE_DARK = "#EA580C";
  const ORANGE_SOFT = "#FFF4EA";
  const ORANGE_LINE = "#FDDCBF";
  const INK = "#1F2937";
  const MUTED = "#6B7280";

  const row = (label, value) =>
    value
      ? `<tr>
          <td style="padding:9px 0;color:${MUTED};font-size:13px;border-bottom:1px solid ${ORANGE_LINE}">${label}</td>
          <td align="right" style="padding:9px 0;color:${INK};font-size:13px;font-weight:600;border-bottom:1px solid ${ORANGE_LINE}">${escapeHtml(value)}</td>
        </tr>`
      : "";

  const bookRows = items
    .map((b, i) => {
      const isLink = linked.includes(b);
      return `<tr>
        <td style="padding:12px 14px;border:1px solid ${ORANGE_LINE};border-radius:10px;background:#ffffff">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="44" valign="middle">
              <div style="width:36px;height:36px;line-height:36px;text-align:center;border-radius:8px;background:${ORANGE};color:#ffffff;font-weight:700;font-size:13px">PDF</div>
            </td>
            <td valign="middle" style="padding-left:10px">
              <div style="font-size:15px;font-weight:700;color:${INK}">${escapeHtml(b.title)}</div>
              <div style="font-size:12px;color:${MUTED};margin-top:2px">${
                isLink
                  ? `Large file &ndash; <a href="${escapeHtml(b.pdfUrl)}" style="color:${ORANGE_DARK};font-weight:700">download here</a>`
                  : "Attached to this email"
              }</div>
            </td>
          </tr></table>
        </td>
      </tr>${i < items.length - 1 ? '<tr><td style="height:8px;line-height:8px">&nbsp;</td></tr>' : ""}`;
    })
    .join("");

  const partNote = multiple
    ? `<p style="margin:16px 0 0;font-size:13px;color:${MUTED}">Your books are sent in more than one email because of file size. This is email ${part}; the rest follow shortly.</p>`
    : "";

  const preheader = `Your ${plural ? "ebooks are" : "ebook is"} attached - order ${order.orderId}`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>Your ebook from Target Trek</title>
<style>
  @keyframes tt-rise { from { opacity:0; transform:translateY(12px);} to { opacity:1; transform:translateY(0);} }
  @keyframes tt-pop  { 0% { transform:scale(.6); opacity:0;} 70% { transform:scale(1.08);} 100% { transform:scale(1); opacity:1;} }
  .tt-card { animation: tt-rise .6s ease-out both; }
  .tt-badge { animation: tt-pop .7s ease-out .2s both; }
  .tt-books { animation: tt-rise .6s ease-out .35s both; }
  @media only screen and (max-width:620px) { .tt-pad { padding:24px 18px !important; } }
</style>
</head>
<body style="margin:0;padding:0;background:#FFF8F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F1">
<tr><td align="center" style="padding:28px 12px">

  <table role="presentation" class="tt-card" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${ORANGE_LINE}">

    <tr><td style="background:${ORANGE};background-image:linear-gradient(135deg,${ORANGE} 0%,${ORANGE_DARK} 100%);padding:26px 32px">
      <div style="font-size:20px;font-weight:800;letter-spacing:.3px;color:#ffffff">Target Trek</div>
      <div style="font-size:12px;color:#FFE7D1;margin-top:2px">Order confirmation &amp; ebook delivery</div>
    </td></tr>

    <tr><td class="tt-pad" style="padding:32px">

      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td class="tt-badge" style="width:46px;height:46px;border-radius:23px;background:${ORANGE_SOFT};border:2px solid ${ORANGE};text-align:center;font-size:22px;line-height:42px;color:${ORANGE_DARK};font-weight:800">&#10003;</td>
        <td style="padding-left:14px;font-size:13px;font-weight:700;color:${ORANGE_DARK}">Payment received</td>
      </tr></table>

      <h1 style="margin:18px 0 6px;font-size:24px;line-height:1.3;color:${INK}">Hi ${escapeHtml(name)}, your ${plural ? "ebooks are" : "ebook is"} ready</h1>
      <p style="margin:0;font-size:15px;line-height:1.6;color:${MUTED}">Thank you for purchasing <strong style="color:${INK}">${escapeHtml(order.book?.title || "your ebook")}</strong>. ${
        attached.length
          ? `Your PDF${attached.length > 1 ? "s are" : " is"} attached to this email &ndash; open or save ${attached.length > 1 ? "them" : "it"} to read anytime.`
          : "Use the download link below."
      }</p>

      <table role="presentation" class="tt-books" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px">${bookRows}</table>
      ${partNote}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;background:${ORANGE_SOFT};border-radius:12px">
        <tr><td style="padding:6px 18px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td colspan="2" style="padding:12px 0 4px;font-size:12px;font-weight:800;letter-spacing:.8px;color:${ORANGE_DARK}">ORDER DETAILS</td></tr>
            ${row("Order ID", order.orderId)}
            ${row("Product", order.book?.title)}
            ${row("Amount paid", formatMoney(order.payment?.amount, currency))}
            ${row("Payment method", method)}
            ${row("Date", paidAt)}
            ${row("Sent to", order.customer?.email)}
          </table>
        </td></tr>
      </table>

      <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${MUTED}">
        Can&rsquo;t find the attachment, or something looks wrong? Just reply to this email or write to
        <a href="mailto:${SUPPORT_EMAIL}" style="color:${ORANGE_DARK};font-weight:700">${SUPPORT_EMAIL}</a>
        with your order ID and we&rsquo;ll sort it out.
      </p>
    </td></tr>

    <tr><td style="padding:18px 32px;background:#FFFAF5;border-top:1px solid ${ORANGE_LINE};font-size:12px;line-height:1.6;color:${MUTED}">
      You are receiving this email because you purchased an ebook on
      <a href="${SITE_URL}" style="color:${ORANGE_DARK}">targettrek.in</a>.
      This is a transactional message about your order.<br>
      &copy; ${new Date().getFullYear()} Target Trek
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    `Hi ${name},`,
    "",
    `Thank you for purchasing ${order.book?.title || "your ebook"}. Your payment was received.`,
    "",
    "Your PDF(s):",
    ...attached.map((b) => `- ${b.title} (attached to this email)`),
    ...linked.map((b) => `- ${b.title}: ${b.pdfUrl}`),
    multiple ? `\nBooks are sent in more than one email because of file size (this is email ${part}).` : null,
    "",
    "ORDER DETAILS",
    `Order ID: ${order.orderId}`,
    `Amount paid: ${formatMoney(order.payment?.amount, currency)}`,
    method ? `Payment method: ${method}` : null,
    paidAt ? `Date: ${paidAt}` : null,
    "",
    `Need help? Reply to this email or write to ${SUPPORT_EMAIL} with your order ID.`,
    "",
    `Target Trek - ${SITE_URL}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  return { html, text };
};

/* -----------------------------------------------------
   Core delivery
----------------------------------------------------- */

/**
 * @param {string|ObjectId} orderDbId  Order _id
 * @param {{ trigger?: "auto"|"admin", adminId?: string }} opts
 *   auto  - respects the per-book setting, skips books already mailed
 *   admin - ignores the setting and resends every PDF
 * @returns {Promise<{status: string, mailsSent?: number, message?: string}>}
 */
export const deliverEbookEmail = async (
  orderDbId,
  { trigger = "auto", adminId = null } = {}
) => {
  const isAdmin = trigger === "admin";
  const now = new Date();
  const staleLock = new Date(Date.now() - LOCK_TIMEOUT_MS);

  const notBusy = {
    $or: [
      { "ebookEmail.status": { $ne: "SENDING" } },
      { "ebookEmail.lockedAt": { $lt: staleLock } },
    ],
  };

  const claimFilter = {
    _id: orderDbId,
    orderStatus: "PAID",
    "payment.status": "SUCCESS",
    // Automatic runs never redo finished or intentionally skipped orders.
    ...(isAdmin
      ? {}
      : { "ebookEmail.status": { $nin: ["SENT", "SKIPPED"] } }),
    ...notBusy,
  };

  const order = await Order.findOneAndUpdate(
    claimFilter,
    {
      $set: {
        "ebookEmail.status": "SENDING",
        "ebookEmail.trigger": trigger,
        "ebookEmail.lockedAt": now,
        "ebookEmail.lastAttemptAt": now,
        "ebookEmail.lastError": null,
      },
      $inc: { "ebookEmail.attempts": 1 },
    },
    { new: true }
  );

  if (!order) {
    console.log("[EBOOK EMAIL] not claimed (not paid, already sent/skipped, or busy):", String(orderDbId));
    return {
      status: "NOT_CLAIMED",
      message: "Order is not paid, already sent, or a send is in progress.",
    };
  }

  const finish = (fields) =>
    Order.updateOne(
      { _id: order._id },
      { $set: { "ebookEmail.lockedAt": null, ...fields } }
    );

  try {
    const { product, books } = await resolvePurchasedBooks(order);

    // The setting is read at send time for automatic runs.
    if (!isAdmin && !product.sendEbookEmailOnPurchase) {
      console.log(
        `[EBOOK EMAIL] skipped order ${order.orderId}: "Send ebook email on purchase" is OFF for "${product.title}" in THIS database`
      );
      await finish({ "ebookEmail.status": "SKIPPED" });
      return { status: "SKIPPED" };
    }

    const alreadySent = new Set(
      isAdmin ? [] : (order.ebookEmail?.sentBookIds || []).map(String)
    );

    const todo = books.filter((b) => !alreadySent.has(String(b._id)));

    const recipient = order.customer?.email;

    if (!recipient) {
      throw new Error("Customer email is missing.");
    }

    const sentIds = [...(order.ebookEmail?.sentBookIds || [])];
    let mailsSent = isAdmin ? 0 : order.ebookEmail?.mailsSent || 0;
    let part = 0;

    // Attachment names already used in this order's emails.
    const usedNames = new Set();

    const newGroup = () => ({ attached: [], linked: [], files: [], bytes: 0 });
    let current = newGroup();

    // Send one group, then record its books so a retry skips them.
    const sendGroup = async (group) => {
      part += 1;

      const subject =
        todo.length > 1
          ? `Your Target Trek ebooks - order ${order.orderId} (part ${part})`
          : `Your Target Trek ebook - order ${order.orderId}`;

      const deliver = (g) => {
        const { html, text } = buildEmail({
          order,
          attached: g.attached,
          linked: g.linked,
          part,
          multiple: todo.length > 1,
        });

        return sendMail(recipient, subject, text, html, {
          attachments: g.files,
          replyTo: SUPPORT_EMAIL,
        });
      };

      try {
        await deliver(group);
      } catch (error) {
        // Nothing to fall back from if no files were attached.
        if (!group.files.length) {
          throw error;
        }

        console.error(
          "[EBOOK EMAIL] send with attachments failed, retrying with download links:",
          error.message
        );

        await deliver({
          attached: [],
          linked: [...group.attached, ...group.linked],
          files: [],
        });
      }

      sentIds.push(...[...group.attached, ...group.linked].map((b) => b._id));
      mailsSent += 1;

      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            "ebookEmail.sentBookIds": sentIds,
            "ebookEmail.mailsSent": mailsSent,
          },
        }
      );
    };

    // One PDF in memory at a time per group; full groups are sent
    // immediately so memory stays bounded for large bundles.
    // Check every file's size at once (cheap HEAD requests), so only
    // files small enough to attach are ever downloaded.
    const sizes = await Promise.all(
      todo.map((book) => probeSize(book.pdfUrl))
    );

    for (const [index, book] of todo.entries()) {
      // Too big to attach: link it, without downloading.
      const knownSize = sizes[index];

      if (knownSize !== null && knownSize > MAX_ATTACHMENT_BYTES) {
        current.linked.push(book);
        continue;
      }

      const buffer = await downloadPdf(book.pdfUrl);

      if (buffer.length > MAX_ATTACHMENT_BYTES) {
        current.linked.push(book);
        continue;
      }

      if (
        current.attached.length &&
        current.bytes + buffer.length > MAX_MAIL_BYTES
      ) {
        await sendGroup(current);
        current = newGroup();
      }

      current.attached.push(book);
      current.files.push({
        filename: uniqueFileName(pdfFileNameFor(book), usedNames),
        content: buffer,
        contentType: "application/pdf",
      });
      current.bytes += buffer.length;
    }

    if (current.attached.length || current.linked.length) {
      await sendGroup(current);
    }

    await finish({
      "ebookEmail.status": "SENT",
      "ebookEmail.sentAt": new Date(),
      "ebookEmail.sentBy": isAdmin ? adminId || "admin" : "system",
      "ebookEmail.sentTo": recipient,
      "ebookEmail.lastError": null,
    });

    console.log(`[EBOOK EMAIL] sent order ${order.orderId} (${mailsSent} mail(s)) to ${recipient}`);

    return { status: "SENT", mailsSent };
  } catch (error) {
    console.error("[EBOOK EMAIL FAILED]", {
      orderId: order.orderId,
      message: error.message,
    });

    const sentSomething = (
      (await Order.findById(order._id).select("ebookEmail.sentBookIds").lean())
        ?.ebookEmail?.sentBookIds || []
    ).length;

    await finish({
      "ebookEmail.status": sentSomething ? "PARTIAL" : "FAILED",
      "ebookEmail.lastError": String(error.message || error).slice(0, 500),
    });

    return { status: "FAILED", message: error.message };
  }
};

/* -----------------------------------------------------
   Bounded in-process queue.

   Without a limit, 100 simultaneous purchases would download
   100 x 10MB PDFs (plus base64 copies) at once and could
   exhaust memory. Only MAX_CONCURRENT_JOBS run at a time;
   the rest wait their turn. Queued ids are de-duplicated.
----------------------------------------------------- */

const MAX_CONCURRENT_JOBS = 2;

// A job that never settles (stalled socket) would hold one of the slots
// forever and eventually stop all ebook mail. Free the slot after this long;
// the stale lock (LOCK_TIMEOUT_MS) lets the sweeper retry the order.
const JOB_TIMEOUT_MS = 5 * 60 * 1000;

const withTimeout = (promise, ms) => {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Ebook email job timed out after ${ms / 1000}s`)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
};
const queue = [];
const queuedIds = new Set();
let running = 0;

const pump = () => {
  while (running < MAX_CONCURRENT_JOBS && queue.length) {
    const job = queue.shift();
    running += 1;

    withTimeout(deliverEbookEmail(job.id, job.opts), JOB_TIMEOUT_MS)
      .catch((error) => {
        console.error("[EBOOK EMAIL QUEUE ERROR]", error);
      })
      .finally(() => {
        queuedIds.delete(job.key);
        running -= 1;
        pump();
      });
  }
};

export const enqueueEbookEmail = (id, opts = {}) => {
  const key = `${id}:${opts.trigger || "auto"}`;

  if (queuedIds.has(key)) {
    return false;
  }

  queuedIds.add(key);
  queue.push({ id, opts, key });
  setImmediate(pump);

  return true;
};

/* -----------------------------------------------------
   Entry point for payment callbacks.
   Synchronous; returns immediately.
----------------------------------------------------- */

/*
  MASTER SWITCH for the automatic "PDFs by email after payment" mail.
  OFF by default. An admin turns it on/off on /admin/book-offers/payments
  (stored in the database, no redeploy). Admins can always send PDFs / access
  links by hand from the payments pages.
*/
const SETTINGS_TTL_MS = 10 * 1000;
let settingsCache = { value: false, at: 0 };

export const isAutoEbookEmailEnabled = async () => {
  if (Date.now() - settingsCache.at < SETTINGS_TTL_MS) return settingsCache.value;

  try {
    const doc = await EbookMailSettings.findOne({ key: "global" }).select("autoEbookEmail").lean();
    settingsCache = { value: doc?.autoEbookEmail === true, at: Date.now() };
  } catch (error) {
    console.error("[EBOOK EMAIL] settings read failed, keeping last value:", error.message);
    settingsCache = { ...settingsCache, at: Date.now() };
  }

  return settingsCache.value;
};

export const setAutoEbookEmailEnabled = async (enabled, adminId = null) => {
  const doc = await EbookMailSettings.findOneAndUpdate(
    { key: "global" },
    { $set: { autoEbookEmail: Boolean(enabled), updatedBy: adminId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  settingsCache = { value: doc.autoEbookEmail === true, at: Date.now() };

  return doc;
};

export const getEbookMailSettings = async () => {
  const doc = await EbookMailSettings.findOne({ key: "global" }).lean();
  return {
    autoEbookEmail: doc?.autoEbookEmail === true,
    updatedAt: doc?.updatedAt || null,
    updatedBy: doc?.updatedBy || null,
  };
};

export const scheduleEbookEmail = (order) => {
  if (order?._id) {
    // Lifetime pack: its own queued "Memories page code" mail. First, and independent of everything below, so it is never held up by them.
    schedulePackCodeMail(order);
    isAutoEbookEmailEnabled()
      .then((enabled) => {
        if (!enabled) return;
        console.log("[EBOOK EMAIL] queued order", order.orderId || String(order._id));
        enqueueEbookEmail(order._id, { trigger: "auto" });
      })
      .catch((error) => console.error("[EBOOK EMAIL] schedule failed:", error.message));
    // Books with Prep Arena matches / packs: record the purchase, grant matches, send the thank-you mail (no-op for other books).
    scheduleMembershipActivation(order);
  }
};

/* -----------------------------------------------------
   Safety net: picks up orders whose background job was
   lost (server restart) or failed. Recent orders only.
----------------------------------------------------- */

const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
const SWEEP_LOOKBACK_MS = 24 * 60 * 60 * 1000;
const SWEEP_MIN_AGE_MS = 2 * 60 * 1000;
const SWEEP_RETRY_GAP_MS = 5 * 60 * 1000;
const SWEEP_BATCH = 200;

export const sweepPendingEbookEmails = async () => {
  if (!(await isAutoEbookEmailEnabled())) return;

  const now = Date.now();

  const orders = await Order.find({
    orderStatus: "PAID",
    "payment.status": "SUCCESS",
    "payment.paidAt": {
      $gte: new Date(now - SWEEP_LOOKBACK_MS),
      $lte: new Date(now - SWEEP_MIN_AGE_MS),
    },
    $or: [
      { "ebookEmail.status": { $in: ["NONE", "PENDING", null] } },
      { "ebookEmail.status": { $exists: false } },
      {
        "ebookEmail.status": { $in: ["FAILED", "PARTIAL"] },
        "ebookEmail.attempts": { $lt: MAX_AUTO_ATTEMPTS },
        "ebookEmail.lastAttemptAt": {
          $lt: new Date(now - SWEEP_RETRY_GAP_MS),
        },
      },
      {
        "ebookEmail.status": "SENDING",
        "ebookEmail.lockedAt": { $lt: new Date(now - LOCK_TIMEOUT_MS) },
        "ebookEmail.attempts": { $lt: MAX_AUTO_ATTEMPTS },
      },
    ],
  })
    .select("_id")
    .limit(SWEEP_BATCH)
    .lean();

  // Feed the bounded queue; do not process here.
  for (const { _id } of orders) {
    enqueueEbookEmail(_id, { trigger: "auto" });
  }

  // Orders that exhausted automatic retries need a human.
  const stuck = await Order.countDocuments({
    orderStatus: "PAID",
    "ebookEmail.status": { $in: ["FAILED", "PARTIAL"] },
    "ebookEmail.attempts": { $gte: MAX_AUTO_ATTEMPTS },
    "payment.paidAt": { $gte: new Date(now - SWEEP_LOOKBACK_MS) },
  });

  if (stuck) {
    console.error(
      `[EBOOK EMAIL] ${stuck} paid order(s) failed all automatic retries. ` +
        "Use 'Retry Ebook PDFs' in the admin payments page."
    );
  }
};

export const startEbookEmailSweeper = () => {
  const run = () =>
    sweepPendingEbookEmails().catch((error) =>
      console.error("[EBOOK EMAIL SWEEP ERROR]", error)
    );

  setTimeout(run, 30 * 1000).unref();
  setInterval(run, SWEEP_INTERVAL_MS).unref();
};
