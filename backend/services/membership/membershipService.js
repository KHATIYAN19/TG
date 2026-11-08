import Book from "../../models/Book.js";
import Order from "../../models/Order.js";
import Membership from "../../models/Membership.js";
import MailSuppression from "../../models/MailSuppression.js";
import BookLaunchNotice from "../../models/BookLaunchNotice.js";
import User from "../../models/User.js";
import sendMail from "../../utils/MailSender.js";

import { buildNewBookMail, buildPurchaseMail, SUPPORT_EMAIL } from "./membershipMail.js";
import { claimMatchesForUser } from "./matches.js";

/*
  PACKS + MATCHES
  ---------------
  Packs are ordinary Book rows (bundles you build in /admin/books):
    /book/all-books         all books today            (membership.plan = all_current)
    /book/life-type-combo   all books + every future   (membership.plan = lifetime)
  Any book can also carry `matches`: Prep Arena partnerships given to the buyer.
  Payment, coupons, gateways and PDF delivery are the existing book flow.
*/

export const PLANS = ["all_current", "lifetime"];

const NOT_A_PASS = { $in: [null, "none"] };

/* ---------------- catalog ---------------- */

/*
  The pack catalog = the single books shown in "Main Books" (showInMainBooks) that have a PDF.
  Not combos, not packs, and never the "others" products (e.g. /others/book/how-to-sell-ebook).
  Used for the All Access page, the Prep Arena Books tab, "worth" totals and new-book emails.
*/
const NOT_OTHERS = [{ redirectUrl: { $not: /^\/others\// } }, { slug: { $not: /how-to-sell/i } }, { pageKey: { $not: /how-to-sell/i } }];

export const catalogQuery = () => ({
  isActive: true,
  isPublished: true,
  showInMainBooks: { $ne: false },
  resourceType: { $in: ["pdf", "ebook"] },
  pdfUrl: { $nin: [null, ""] },
  "membership.plan": NOT_A_PASS,
  $and: NOT_OTHERS,
});

export const getCatalogBooks = () =>
  Book.find(catalogQuery())
    .select("title slug subtitle description price mrp currency coverPageUrl redirectUrl category badge matches tags topics highlights createdAt")
    .sort({ createdAt: 1 })
    .lean();

/** The pack books (Book.membership.plan set), whether or not they appear in the main list. */
export const getPackProducts = async () => {
  const packs = await Book.find({ isActive: true, isPublished: true, "membership.plan": { $in: PLANS } })
    .select("title slug subtitle description price mrp currency coverPageUrl redirectUrl badge highlights matches membership includedBooks createdAt")
    .populate("includedBooks", "title coverPageUrl")
    .sort({ price: 1 })
    .lean();

  return packs.map((p) => ({
    ...p,
    plan: p.membership.plan,
    includedBooks: (p.includedBooks || []).map((b) => ({ _id: b._id, title: b.title, coverPageUrl: b.coverPageUrl })),
  }));
};

/* ---------------- activation (called once per paid order) ---------------- */

/*
  A paid order becomes a Membership row when the book gives matches
  (Book.matches > 0) or is a pack (Book.membership.plan). Anything else is a
  normal book purchase and is left alone.
*/
export const activateMembershipForOrder = async (orderOrId) => {
  const order = await Order.findById(orderOrId?._id || orderOrId).lean();
  if (!order || order.orderStatus !== "PAID") return null;

  const product = await Book.findById(order.bookId).select("title matches membership coverPageUrl").lean();
  if (!product) return null;

  const plan = PLANS.includes(product.membership?.plan) ? product.membership.plan : "none";
  const matches = Math.max(0, Math.floor(Number(product.matches) || 0));
  if (plan === "none" && matches === 0) return null;

  const email = String(order.customer?.email || "").toLowerCase().trim();
  if (!email) {
    console.error(`[membership] order ${order.orderId} has no e-mail; cannot activate`);
    return null;
  }

  const user = await User.findOne({ email }).select("_id").lean();

  let membership;
  try {
    membership = await Membership.create({
      email,
      name: order.customer?.name || "",
      user: user?._id || null,
      orderId: order.orderId,
      book: order.bookId,
      bookTitle: product.title,
      paidAmount: order.payment?.amount || 0,
      activatedAt: new Date(),
      plan,
      lifetime: plan === "lifetime",
      matches: { granted: matches },
      // They bought with today's books: never mail them about a book that already existed.
      notifiedBookIds: plan === "none" ? [] : (await Book.find(catalogQuery()).select("_id").lean()).map((b) => b._id),
    });
  } catch (error) {
    if (error?.code !== 11000) throw error;
    membership = await Membership.findOne({ orderId: order.orderId }); // duplicate callback
  }
  if (!membership) return null;

  // Already signed up in the arena? Put the matches on their account right now.
  if (matches > 0 && user) await claimMatchesForUser(user._id);
  const fresh = await Membership.findById(membership._id).select("matches welcomeMailSentAt").lean();

  // The thank-you / matches mail goes out only when the purchase gave matches (any book or pack
  // with matches > 0). A pack with 0 matches still becomes a member (new-book alerts) but gets no such mail.
  if (matches <= 0) return membership;

  // Claim the mail so duplicate callbacks / retries send it once.
  const claimed = await Membership.updateOne({ _id: membership._id, welcomeMailSentAt: null }, { $set: { welcomeMailSentAt: new Date() } });
  if (claimed.modifiedCount === 1) {
    try {
      const mail = buildPurchaseMail({
        email,
        name: membership.name,
        bookTitle: product.title,
        orderId: order.orderId,
        coverUrl: product.coverPageUrl,
        matches,
        matchesAdded: Boolean(fresh?.matches?.claimedAt),
        packPlan: plan,
      });
      await sendMail(email, mail.subject, mail.text, mail.html, { replyTo: SUPPORT_EMAIL, headers: mail.headers });
    } catch (error) {
      console.error("[membership] purchase mail failed:", error.message);
      await Membership.updateOne({ _id: membership._id }, { $set: { welcomeMailSentAt: null } });
      throw error; // lets scheduleMembershipActivation retry the mail
    }
  }

  return membership;
};

/* Admin: re-send the purchase / Prep Arena credit mail for one paid order (ignores the sent-once claim). */
export const resendPurchaseMailForOrder = async (orderId) => {
  const order = await Order.findById(orderId).lean();
  if (!order) throw Object.assign(new Error("Order not found."), { status: 404 });
  if (order.orderStatus !== "PAID") throw Object.assign(new Error("Only paid orders can be emailed."), { status: 400 });

  const product = await Book.findById(order.bookId).select("title matches membership coverPageUrl").lean();
  const matches = Math.max(0, Math.floor(Number(product?.matches) || 0));
  if (!product || matches <= 0) throw Object.assign(new Error("This book gives no Prep Arena matches, so there is no credit mail to send."), { status: 400 });

  // Make sure the membership row exists (idempotent) and the matches are on the account.
  const membership = (await Membership.findOne({ orderId: order.orderId }).lean()) || (await activateMembershipForOrder(order));
  const email = String(order.customer?.email || "").toLowerCase().trim();
  if (!email) throw Object.assign(new Error("Order has no customer e-mail."), { status: 400 });

  const fresh = membership ? await Membership.findById(membership._id).select("matches").lean() : null;
  const plan = PLANS.includes(product.membership?.plan) ? product.membership.plan : "none";
  const mail = buildPurchaseMail({
    email,
    name: order.customer?.name || membership?.name || "",
    bookTitle: product.title,
    orderId: order.orderId,
    coverUrl: product.coverPageUrl,
    matches,
    matchesAdded: Boolean(fresh?.matches?.claimedAt),
    packPlan: plan,
  });
  await sendMail(email, mail.subject, mail.text, mail.html, { replyTo: SUPPORT_EMAIL, headers: mail.headers });
  if (membership) await Membership.updateOne({ _id: membership._id }, { $set: { welcomeMailSentAt: new Date() } });
  return { email, subject: mail.subject };
};

/** Fire-and-forget wrapper for payment callbacks. Never throws. */
export const scheduleMembershipActivation = (order) => {
  if (!order?._id) return;

  // Retried a few times: a brief database or mail-provider hiccup right after
  // payment must not lose the credits / thank-you mail. Activation is idempotent
  // (duplicate membership is detected, the mail is claimed once).
  const delays = [0, 15_000, 60_000, 5 * 60_000];

  const attempt = (n) => {
    setTimeout(() => {
      activateMembershipForOrder(order)
        .then((membership) => {
          if (membership) console.log(`[membership] activated for order ${order.orderId}`);
        })
        .catch((error) => {
          console.error(`[membership] activation failed (try ${n + 1}/${delays.length}):`, error.message);
          if (n + 1 < delays.length) attempt(n + 1);
        });
    }, delays[n]);
  };

  attempt(0);
};

/* ---------------- member lookup ---------------- */

export const getMemberSummary = async (email) => {
  const e = String(email || "").toLowerCase().trim();
  if (!e) return null;

  const all = await Membership.find({ email: e }).sort({ activatedAt: 1 }).lean();
  if (!all.length) return null;

  const suspended = all.some((r) => r.status === "suspended");
  // A suspended person has no pack benefits at all until they are unsuspended.
  const rows = suspended ? [] : all;
  const packs = rows.filter((r) => r.plan !== "none");

  return {
    suspended,
    packMember: packs.length > 0,
    lifetime: packs.some((r) => r.lifetime),
    packs: packs.map((r) => ({ title: r.bookTitle, plan: r.plan, activatedAt: r.activatedAt })),
    matches: {
      granted: rows.reduce((n, r) => n + (r.matches?.granted || 0), 0),
      waiting: rows.filter((r) => !r.matches?.claimedAt).reduce((n, r) => n + (r.matches?.granted || 0), 0),
    },
  };
};

/* ---------------- new-book announcement ---------------- */

const CONCURRENCY = 3;

const RUNNING_STALE_MS = 30 * 60 * 1000;

/*
  Announcements are MANUAL: nothing is sent when a book is published. An admin presses
  "Send" for a book. A book can be sent again later: that run only reaches members who
  have not been told about it yet (e.g. people who joined since), never the same person twice.
  Only one run per book at a time.
*/
const claimNotice = async (book) => {
  try {
    await BookLaunchNotice.create({ book: book._id, title: book.title });
    return true;
  } catch (error) {
    if (error?.code !== 11000) throw error;
  }
  const retry = await BookLaunchNotice.findOneAndUpdate(
    {
      book: book._id,
      $or: [{ status: { $in: ["done", "failed"] } }, { status: "running", startedAt: { $lt: new Date(Date.now() - RUNNING_STALE_MS) } }],
    },
    { $set: { status: "running", startedAt: new Date(), finishedAt: null, lastError: "" } }
  );
  return Boolean(retry);
};

/**
 * Tell pack holders about a book. Called ONLY from the admin "Send" button.
 * Never sends the same book to the same member twice (notifiedBookIds).
 *   lifetime members  -> "included in your library" + PDF link, always sent
 *   all_current       -> "new book" alert, skipped for unsubscribed addresses
 */
export const notifyNewBook = async (bookId) => {
  const book = await Book.findOne({ _id: bookId, ...catalogQuery() }).lean();
  if (!book) return { skipped: "not a published catalog book" };

  if (!(await claimNotice(book))) return { skipped: "already being sent" };

  let sent = 0;
  let failed = 0;
  let lastError = "";

  try {
    const rows = await Membership.find({ plan: { $in: PLANS }, status: { $ne: "suspended" }, notifiedBookIds: { $ne: book._id } })
      .select("email name lifetime orderId bookTitle plan")
      .lean();

    // Anyone with a suspended membership is skipped, even if they hold a second, active pack.
    const blocked = new Set(await Membership.distinct("email", { status: "suspended" }));

    // One e-mail per address, even with two passes (lifetime wins).
    const people = new Map();
    for (const r of rows) {
      if (blocked.has(r.email)) continue;
      const cur = people.get(r.email);
      if (!cur) people.set(r.email, { email: r.email, name: r.name, lifetime: r.lifetime, packTitle: r.lifetime ? r.bookTitle : "" });
      else if (r.lifetime && !cur.lifetime) {
        cur.lifetime = true;
        cur.packTitle = r.bookTitle;
      }
    }

    const suppressed = new Set(
      (await MailSuppression.find({ email: { $in: [...people.keys()] } }).select("email").lean()).map((s) => s.email)
    );

    const queue = [...people.values()];
    await BookLaunchNotice.updateOne({ book: book._id }, { $set: { recipients: queue.length } });

    const worker = async () => {
      while (queue.length) {
        const person = queue.shift();
        try {
          // Lifetime members are receiving a book they own: always send.
          if (!person.lifetime && suppressed.has(person.email)) {
            await Membership.updateMany({ email: person.email }, { $addToSet: { notifiedBookIds: book._id } });
            continue;
          }

          const mail = buildNewBookMail({
            email: person.email,
            name: person.name,
            lifetime: person.lifetime,
            book,
            accessUrl: book.pdfUrl,
            packTitle: person.packTitle,
          });
          await sendMail(person.email, mail.subject, mail.text, mail.html, { replyTo: SUPPORT_EMAIL, headers: mail.headers });
          await Membership.updateMany({ email: person.email }, { $addToSet: { notifiedBookIds: book._id } });
          sent += 1;
        } catch (error) {
          failed += 1;
          lastError = error.message;
          console.error(`[membership] new-book mail to ${person.email} failed:`, error.message);
        }
      }
    };

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    await BookLaunchNotice.updateOne(
      { book: book._id },
      // Totals add up across runs. A failure leaves the status "failed" so a re-send only reaches who is still missing.
      { $set: { status: failed ? "failed" : "done", lastError, finishedAt: new Date() }, $inc: { sent, failed } }
    );
  } catch (error) {
    await BookLaunchNotice.updateOne({ book: book._id }, { $set: { status: "failed", lastError: error.message, finishedAt: new Date() } });
    throw error;
  }

  return { sent, failed };
};

/* ---------------- admin: announcements overview ---------------- */

/**
 * Every book that can be announced, newest first, with who would receive it right now.
 * `pending` = members not yet told about the book (lifetime get the PDF, all-books get an alert).
 */
export const getAnnouncementOverview = async () => {
  const [books, notices, members] = await Promise.all([
    Book.find(catalogQuery()).select("title coverPageUrl createdAt").sort({ createdAt: -1 }).lean(),
    BookLaunchNotice.find().lean(),
    Membership.find({ plan: { $in: PLANS }, status: { $ne: "suspended" } }).select("email lifetime notifiedBookIds").lean(),
  ]);

  const noticeByBook = new Map(notices.map((n) => [String(n.book), n]));

  const blocked = new Set(await Membership.distinct("email", { status: "suspended" }));

  // One entry per address; lifetime wins.
  const people = new Map();
  for (const m of members) {
    if (blocked.has(m.email)) continue;
    const cur = people.get(m.email);
    const told = new Set((m.notifiedBookIds || []).map(String));
    if (!cur) people.set(m.email, { lifetime: m.lifetime, told });
    else {
      cur.lifetime = cur.lifetime || m.lifetime;
      told.forEach((id) => cur.told.add(id));
    }
  }

  return {
    members: {
      total: people.size,
      lifetime: [...people.values()].filter((p) => p.lifetime).length,
      allBooks: [...people.values()].filter((p) => !p.lifetime).length,
    },
    books: books.map((b) => {
      const id = String(b._id);
      let lifetime = 0;
      let allBooks = 0;
      for (const p of people.values()) {
        if (p.told.has(id)) continue;
        if (p.lifetime) lifetime += 1;
        else allBooks += 1;
      }
      const n = noticeByBook.get(id);
      return {
        _id: b._id,
        title: b.title,
        coverPageUrl: b.coverPageUrl,
        createdAt: b.createdAt,
        pending: { lifetime, allBooks, total: lifetime + allBooks },
        notice: n ? { status: n.status, sent: n.sent, failed: n.failed, finishedAt: n.finishedAt, lastError: n.lastError } : null,
      };
    }),
  };
};
