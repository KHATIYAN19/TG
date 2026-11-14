import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { z } from "zod";

import MemoryPage from "../../models/memory/MemoryPage.js";
import MemoryOccasion from "../../models/memory/MemoryOccasion.js";
import MemoryCode from "../../models/memory/MemoryCode.js";
import MemoryCredit from "../../models/memory/MemoryCredit.js";
import MemoryEvent from "../../models/memory/MemoryEvent.js";
import MemoryGumroadProduct from "../../models/memory/MemoryGumroadProduct.js";
import MemoryGumroadSale from "../../models/memory/MemoryGumroadSale.js";
import { findSale, orderLookupEnabled } from "../../services/memory/gumroad.js";

import { createUploadTarget, headObject, keyBelongsTo, userPrefix } from "../../services/storage/s3.js";
import { removeFiles, trackUpload, uploadAttached } from "../../services/memory/storageCleanup.js";
import MemoryMailBlock from "../../models/memory/MemoryMailBlock.js";
import User from "../../models/User.js";
import { canResend, sendPageMail } from "../../services/memory/pageMail.js";
import {
  MAX_GIFTS, MAX_PEOPLE, PAGE_AUDIENCES, MAX_PROMISES, MAX_REASONS, MAX_STATS, MAX_TIMELINE, MAX_WISHES, MemoryError, assertId, availableCredits, checkPin, ensureOccasions, getSettings, grantCredits,
  hashPin, encryptPin, newPin, newSlug, pageView, parse, sendError, deleteMediaObjects, buildActivity, purgePageEvents, MAX_EVENTS_PER_PAGE, MAX_EMAIL_SENDS, lifetimeDays, expiryFrom, isExpired, decryptPin,
} from "../../services/memory/memoryService.js";
import { addonCatalog, addonOut, emptyExtra, hasCoveringCredit, limitsFor, limitsOut, occasionForUser, passesFor, priceOf, resolveTheme, spendCredit, themeEnabled, themeIdsOf, toRupees } from "../../services/memory/catalog.js";
import { gatewaysForUsers } from "./memoryPaymentController.js";
import { pickGateway } from "../../services/memory/payments/index.js";

const uid = (req) => String(req.user?.id || req.user?._id);
const MB = 1024 * 1024;

/** wrap: asyncHandler + MemoryError -> JSON */
const handler = (fn) =>
  asyncHandler(async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      return sendError(res, err);
    }
  });

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

const ownPage = async (req, { populate = true } = {}) => {
  assertId(req.params.id, "page id");
  const q = MemoryPage.findOne({ _id: req.params.id, user: uid(req) }).select("+pinEnc");
  const page = await (populate ? q.populate("occasion") : q); // the whole template: its limits and prices decide what this page may hold
  if (!page) throw new MemoryError(404, "Page not found.", "PAGE_NOT_FOUND");
  if (isExpired(page)) throw new MemoryError(404, "This page has expired and has been removed.", "PAGE_EXPIRED");
  return page;
};
const editable = (page) => {
  if (page.status === "blocked") throw new MemoryError(403, "This page was blocked by an admin.", "PAGE_BLOCKED");
};
/* the owner's view of a page, plus what it may hold (limits = the template's limits + the add-ons bought) and what it cost */
const withRoom = async (page, view) => {
  const s = await getSettings();
  const extra = { ...emptyExtra(), ...(page.extra?.toObject?.() ?? page.extra ?? {}) };
  return { ...view, limits: limitsOut(limitsFor(s, page.occasion, extra)), extra, paidPrice: page.paidPricePaise == null ? null : toRupees(page.paidPricePaise) };
};
const reload = async (id, opts) => {
  const page = await MemoryPage.findById(id).select("+pinEnc").populate("occasion");
  return withRoom(page, await pageView(page, { withPin: true, ...opts }));
};

const pinField = z.string().regex(/^\d{6}$/, "PIN must be exactly 6 digits");

/* the name on the account: what the page itself shows when the sender left "from" empty, so the email says the same */
const accountName = async (req) => (await User.findById(uid(req)).select("name").lean())?.name || "";

/* =====================================================
   CONFIG + BALANCE
===================================================== */

export const getConfig = handler(async (req, res) => {
  await ensureOccasions();
  const [s, occasions, passes, addons] = await Promise.all([
    getSettings(),
    MemoryOccasion.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
    passesFor(uid(req)),
    addonCatalog({ onlyEnabled: true }),
  ]);
  // a template whose looks are all switched off is hidden, like an inactive one
  const visible = occasions.filter((o) => !themeIdsOf(o).length || themeIdsOf(o).some((id) => themeEnabled(o, id)));
  ok(res, {
    enabled: s.enabled,
    price: s.price, // the default price; each template and look can have its own (occasions[].themes[].price)
    currency: "INR",
    pageLifetimeDays: lifetimeDays(s),
    emailEnabled: s.emailEnabled !== false,
    limits: limitsOut(limitsFor(s, null, null)), // the default limits; occasions[].limits has each template's own
    occasions: visible.map((o) => occasionForUser(o, s)),
    addons: addons.map(addonOut),
    credits: passes.length, // how many unspent passes
    passes, // [{ maxPrice (rupees, null = any look), extra }] in the order they will be used
    gumroad: await gumroadOffer(),
    gateways: gatewaysForUsers(s),
    defaultGateway: pickGateway(s)?.id || null,
  });
});

/* Gumroad on the pay page (any currency). No active product, or no GUMROAD_ACCESS_TOKEN = hidden. */
const gumroadOffer = async () => {
  // buyers see ONE product on the pay page: the first active one (the admin chooses which is first). Any active product can be redeemed.
  const first = await MemoryGumroadProduct.findOne({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
  return { enabled: Boolean(first) && orderLookupEnabled(), primary: first ? { name: first.name, credits: first.credits, price: first.priceLabel, url: first.url } : null };
};

/* =====================================================
   GUMROAD: an order paid on Gumroad is worth the credits of its product, once.
===================================================== */

/* The one-and-only claim of a Gumroad sale. The unique indexes on licenseKey (holds ORDER-<sale id>) and saleId mean a sale pays out once, even if two people try at the same moment. */
async function claimSale(userId, { licenseKey, saleId, product, email, quantity = 1 }) {
  const credits = product.credits * quantity; // 3 of a "1 page" product = 3 pages
  let sale;
  try {
    sale = await MemoryGumroadSale.create({ licenseKey, saleId, productId: product.productId, productName: product.name, credits, user: userId, buyerEmail: email });
  } catch (e) {
    if (e?.code === 11000) throw new MemoryError(400, "This purchase has already been used.", "KEY_USED");
    throw e;
  }
  try {
    await grantCredits(userId, { source: "gumroad", ref: saleId, count: credits });
  } catch (e) {
    await MemoryGumroadSale.deleteOne({ _id: sale._id }); // nothing was credited: let them try again
    throw e;
  }
  return credits;
}

/* Redeem by the order number from the Gumroad receipt + the email used to pay. */
export const redeemGumroadOrder = handler(async (req, res) => {
  const { orderId, email } = parse(z.object({ orderId: z.string().trim().min(4).max(60), email: z.string().trim().toLowerCase().email().max(254) }), req.body);
  const userId = uid(req);
  if (!orderLookupEnabled()) throw new MemoryError(503, "Redeeming by order number isn't available right now. Use your license key, or contact support.", "ORDER_LOOKUP_OFF");
  const products = await MemoryGumroadProduct.find({ isActive: true }).limit(12).lean();
  if (!products.length) throw new MemoryError(503, "Gumroad codes are not available right now.", "GUMROAD_OFF");
  let r;
  try {
    r = await findSale({ email, orderRef: orderId, productIds: products.map((p) => p.productId) });
  } catch (e) {
    if (e.message === "GUMROAD_NOT_CONFIGURED") throw new MemoryError(503, "Redeeming by order number isn't available right now. Please contact support.", "ORDER_LOOKUP_OFF");
    throw new MemoryError(502, "We couldn't reach Gumroad to check your order. Please try again in a minute.", "GUMROAD_UNREACHABLE");
  }
  // one message for "no such order" and "wrong email", so this can't be used to probe other people's orders
  if (!r.found && r.otherProduct) throw new MemoryError(400, "This order is for a different Gumroad product, so it can't be used for Memories page credits.", "ORDER_OTHER_PRODUCT");
  if (!r.found) throw new MemoryError(400, "We couldn't find that order. Use the Order ID and the email from your Gumroad receipt.", "ORDER_NOT_FOUND");
  if (r.refunded) throw new MemoryError(400, "That purchase was refunded, so it can't be used.", "KEY_REFUNDED");
  const product = products.find((p) => p.productId === r.productId);
  const added = await claimSale(userId, { licenseKey: `ORDER-${r.saleId}`, saleId: r.saleId, product, email: r.email, quantity: r.quantity });
  ok(res, { added, credits: await availableCredits(userId) });
});


/* =====================================================
   UNIQUE CODE
===================================================== */

export const redeemCode = handler(async (req, res) => {
  const { code } = parse(z.object({ code: z.string().trim().min(3).max(40) }), req.body);
  const userId = uid(req);
  const now = new Date();
  const normalized = code.toUpperCase();

  // One atomic update: valid + not expired + not used up + not already used by this user.
  const claimed = await MemoryCode.findOneAndUpdate(
    {
      code: normalized,
      isActive: true,
      redeemedBy: { $ne: new mongoose.Types.ObjectId(userId) },
      $and: [{ $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }, { $expr: { $lt: ["$usedCount", "$maxUses"] } }],
    },
    { $inc: { usedCount: 1 }, $push: { redeemedBy: userId } },
    { new: true }
  );

  if (!claimed) {
    const c = await MemoryCode.findOne({ code: normalized }).lean();
    if (!c || !c.isActive) throw new MemoryError(400, "Invalid code.", "CODE_INVALID");
    if (c.expiresAt && c.expiresAt < now) throw new MemoryError(400, "This code has expired.", "CODE_EXPIRED");
    if (c.redeemedBy.some((id) => String(id) === userId)) throw new MemoryError(400, "You have already used this code.", "CODE_ALREADY_USED_BY_YOU");
    throw new MemoryError(400, "This code has already been used.", "CODE_USED_UP");
  }

  try {
    await grantCredits(userId, { source: "code", ref: claimed.code });
  } catch (e) {
    await MemoryCode.updateOne({ _id: claimed._id }, { $inc: { usedCount: -1 }, $pull: { redeemedBy: userId } });
    throw e;
  }
  ok(res, { credits: await availableCredits(userId) });
});

/* A free template (price 0): the user claims their pass here. Never piles up: they get one only when they hold no unused pass. */
export const claimFreeCredit = handler(async (req, res) => {
  const b = parse(z.object({ occasionId: z.string(), theme: z.string().max(30).optional() }), req.body);
  assertId(b.occasionId, "template");
  const s = await getSettings();
  if (!s.enabled) throw new MemoryError(503, "Memory pages are paused right now.", "DISABLED");
  const occasion = await MemoryOccasion.findOne({ _id: b.occasionId, isActive: true }).lean();
  if (!occasion) throw new MemoryError(400, "This template isn't available right now.", "INVALID_OCCASION");
  const themeId = resolveTheme(occasion, b.theme);
  if (priceOf(occasion, themeId, s) > 0) throw new MemoryError(400, "This one isn't free. Pay, or redeem a code.", "NOT_FREE");
  const userId = uid(req);
  // only a FREE pass counts here: a paid, code or Gumroad pass the user holds is never used for a free look
  if (!(await hasCoveringCredit(userId, 0))) {
    await MemoryCredit.create({ user: userId, source: "free", maxPricePaise: 0, occasion: occasion._id, theme: themeId });
    // several claims at the same moment (a double tap, two tabs) must still leave ONE plain free pass: every request keeps the same oldest one
    const plain = await MemoryCredit.find({ user: userId, page: null, source: "free", maxPricePaise: 0, extra: null }).sort({ _id: 1 }).select("_id").lean();
    if (plain.length > 1) await MemoryCredit.deleteMany({ _id: { $in: plain.slice(1).map((c) => c._id) }, page: null });
  }
  ok(res, { credits: await availableCredits(userId) });
});

/* =====================================================
   PAGES
===================================================== */

const pageFields = {
  title: z.string().trim().min(1).max(120),
  recipientName: z.string().trim().min(1).max(80),
  senderName: z.string().trim().max(80).optional(),
  message: z.string().max(10000).optional(),
};

/* what the sender can customise beyond names + message */
const extras = {
  style: z.string().trim().max(30).optional(),
  age: z.number().int().min(1).max(120).nullable().optional(),
  gifts: z.array(z.object({
    title: z.string().trim().min(1).max(60),
    note: z.string().trim().max(140).optional(),
    emoji: z.string().trim().max(8).optional(),
  })).max(MAX_GIFTS).optional(),
  wishes: z.array(z.string().trim().min(1).max(60)).max(MAX_WISHES).optional(),
  promises: z.array(z.string().trim().min(1).max(120)).max(MAX_PROMISES).optional(),
  // proposal (the question) + christmas (the wish question)
  question: z.string().trim().max(100).optional(),
  // thank you + christmas
  audience: z.enum(["", ...PAGE_AUDIENCES]).optional(),
  people: z.array(z.object({
    date: z.string().trim().max(30).optional(),
    title: z.string().trim().min(1).max(60),
    note: z.string().trim().max(200).optional(),
  })).max(MAX_PEOPLE).optional(),
  // anniversary + proposal
  since: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD")]).optional(),
  timeline: z.array(z.object({
    date: z.string().trim().max(30).optional(),
    title: z.string().trim().min(1).max(60),
    note: z.string().trim().max(200).optional(),
  })).max(MAX_TIMELINE).optional(),
  reasons: z.array(z.string().trim().min(1).max(120)).max(MAX_REASONS).optional(),
  stats: z.array(z.object({ label: z.string().trim().min(1).max(28), value: z.string().trim().min(1).max(16) })).max(MAX_STATS).optional(),
};

/** "Together since" must be a real date that is not in the future. */
const checkSince = (since) => {
  if (!since) return;
  const d = new Date(`${since}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== since) throw new MemoryError(400, "That date does not exist.", "INVALID_DATE");
  if (d.getTime() > Date.now() + 36 * 3600 * 1000) throw new MemoryError(400, "The date cannot be in the future.", "DATE_IN_FUTURE");
};

const checkMessage = (maxChars, message) => {
  if (message && message.length > maxChars) throw new MemoryError(400, `Message is too long (max ${maxChars} characters). You can add more room with an add-on.`, "MESSAGE_TOO_LONG", { max: maxChars });
};

/** Every rule for emailing a page to an address. Throws a clear message when it can't be done. */
const assertCanEmail = async (req, s, shareEmail) => {
  if (s.emailEnabled === false) throw new MemoryError(400, "Emailing pages is switched off right now. You can still share the link yourself.", "EMAIL_DISABLED");
  if (await MemoryMailBlock.exists({ email: shareEmail })) throw new MemoryError(400, "That address has asked not to receive emails from Memories. Please share the link another way.", "EMAIL_BLOCKED");
  const dayAgo = new Date(Date.now() - 24 * 3600 * 1000);
  // "today" = the page was made today OR its email was added / sent today (an address added to an older page counts too)
  const recent = { $or: [{ createdAt: { $gte: dayAgo } }, { emailAddedAt: { $gte: dayAgo } }, { emailSentAt: { $gte: dayAgo } }] };
  if ((await MemoryPage.countDocuments({ user: uid(req), shareEmail: { $ne: "" }, ...recent })) >= (s.maxEmailsPerUserPerDay || 10)) throw new MemoryError(429, "You've reached today's limit for emailing pages. Try again tomorrow.", "EMAIL_DAILY_LIMIT");
  if ((await MemoryPage.countDocuments({ shareEmail, ...recent })) >= 3) throw new MemoryError(429, "That address has already received several pages today. Please try again tomorrow.", "EMAIL_RECIPIENT_LIMIT");
};

export const createPage = handler(async (req, res) => {
  const b = parse(
    z.object({ occasionId: z.string(), ...pageFields, ...extras, visibility: z.enum(["public", "private"]).default("public"), pin: pinField.optional(), shareEmail: z.union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid email address.").max(254)]).optional(), includePin: z.boolean().optional() }),
    req.body
  );
  assertId(b.occasionId, "occasion");
  const s = await getSettings();
  if (!s.enabled) throw new MemoryError(503, "Memory pages are paused right now.", "DISABLED");
  const occasion = await MemoryOccasion.findOne({ _id: b.occasionId, isActive: true }).lean();
  if (!occasion) throw new MemoryError(400, "Invalid occasion.", "INVALID_OCCASION");
  const style = resolveTheme(occasion, b.style); // the look must exist and be switched on
  checkSince(b.since);
  const price = priceOf(occasion, style, s);

  // "Email this page": checked BEFORE a credit is spent, so a refusal never costs anything
  const shareEmail = b.shareEmail || "";
  if (shareEmail) await assertCanEmail(req, s, shareEmail);

  const pin = b.visibility === "private" ? b.pin || newPin() : null;
  const pinHash = pin ? await hashPin(pin) : null;
  const pinEnc = pin ? encryptPin(pin) : null;

  // Spend one pass that covers this look's price (atomic); give it back if the page cannot be created.
  const pageId = new mongoose.Types.ObjectId();
  const credit = await spendCredit(uid(req), pageId, price, { occasion: occasion._id, theme: style });
  if (!credit) throw new MemoryError(402, "Pay for this look (or redeem a code) to create the page.", "CREDIT_REQUIRED", { price: toRupees(price), theme: style });
  const release = () => MemoryCredit.updateOne({ _id: credit._id }, { page: null });
  const extra = { ...emptyExtra(), ...(credit.extra || {}) };

  try {
    checkMessage(limitsFor(s, occasion, extra).messageChars, b.message);
    await MemoryPage.create({
      _id: pageId, user: uid(req), occasion: b.occasionId, title: b.title, recipientName: b.recipientName,
      senderName: b.senderName, message: b.message, visibility: b.visibility, pinHash, pinEnc, shareEmail, emailAddedAt: shareEmail ? new Date() : null, emailIncludesPin: b.includePin !== false, slug: newSlug(), expiresAt: expiryFrom(Date.now(), lifetimeDays(s) + (extra.days || 0)),
      style, age: b.age ?? null, gifts: b.gifts || [], wishes: b.wishes || [], promises: b.promises || [],
      since: b.since || "", question: b.question || "", audience: b.audience || "", people: b.people || [], timeline: b.timeline || [], reasons: b.reasons || [], stats: b.stats || [],
      paidPricePaise: credit.maxPricePaise ?? null, extra,
    });
  } catch (e) {
    await release();
    throw e;
  }
  // The email goes out now (the page exists either way; if it can't be sent the owner can resend from My pages).
  let email = null;
  if (shareEmail) {
    const fresh = await MemoryPage.findById(pageId).populate("occasion", "theme");
    const sent = await sendPageMail({ page: fresh, senderName: b.senderName || (await accountName(req)), theme: fresh.occasion?.theme, pin: b.includePin === false ? null : pin, pinHidden: Boolean(pin) && b.includePin === false, to: shareEmail });
    email = { status: sent.status, to: shareEmail, includesPin: Boolean(pin) && b.includePin !== false };
  }
  // The PIN is returned only now; it is stored hashed.
  ok(res, { page: await reload(pageId, { withMedia: true }), pin, email }, 201);
});

/** Everything the receiver did on this page and what they answered, for the owner. */
export const getActivity = handler(async (req, res) => {
  const page = await ownPage(req);
  const events = await MemoryEvent.find({ page: page._id }).sort({ at: 1 }).limit(MAX_EVENTS_PER_PAGE).select("type data visitor at").lean();
  ok(res, buildActivity(page, events));
});

export const listPages = handler(async (req, res) => {
  // Pages past their end date are already gone. Optional filters: ?expiresWithin=7 (days) and ?sort=expiry (soonest first).
  const now = new Date();
  const within = parseInt(req.query.expiresWithin, 10);
  const filter = { user: uid(req) };
  if (within > 0) filter.expiresAt = { $gt: now, $lte: new Date(now.getTime() + within * 24 * 3600 * 1000) };
  else filter.$or = [{ expiresAt: { $gt: now } }, { expiresAt: null }];
  const sort = req.query.sort === "expiry" ? { expiresAt: 1, createdAt: -1 } : { createdAt: -1 };
  const pages = await MemoryPage.find(filter).select("+pinEnc").sort(sort).populate("occasion", "name theme");
  ok(res, await Promise.all(pages.map((p) => pageView(p, { withPin: true }))));
});

export const getPage = handler(async (req, res) => {
  const page = await ownPage(req);
  ok(res, await withRoom(page, await pageView(page, { withMedia: true, withPin: true })));
});

export const updatePage = handler(async (req, res) => {
  const page = await ownPage(req);
  editable(page);
  // The address the page was emailed to is fixed once the page exists, like the names.
  // It can be ADDED once, if the page was made without one; after that it is fixed.
  const wantedEmail = req.body?.shareEmail == null ? undefined : String(req.body.shareEmail).trim().toLowerCase(); // null = "no address", same as leaving it out
  if (wantedEmail !== undefined && wantedEmail !== (page.shareEmail || "") && page.shareEmail) throw new MemoryError(400, "The email address can't be changed after it has been set.", "EMAIL_LOCKED");
  const addEmail = wantedEmail && !page.shareEmail ? parse(z.string().email("Enter a valid email address.").max(254), wantedEmail) : "";
  const b = parse(z.object({ occasionId: z.string(), ...pageFields, ...extras, includePin: z.boolean().optional() }).partial(), req.body);
  const s = await getSettings();
  // The names on a page are fixed once it exists (the page, its link and its PIN are shared with them). Everything else can be edited.
  if (b.recipientName !== undefined && b.recipientName !== page.recipientName) throw new MemoryError(400, "The name of the person it's for can't be changed after the page is created.", "NAME_LOCKED");
  if (b.senderName !== undefined && b.senderName !== (page.senderName || "")) throw new MemoryError(400, "Your name can't be changed after the page is created.", "NAME_LOCKED");
  let occasion = page.occasion; // populated by ownPage() (the whole template)
  const occasionChanged = Boolean(b.occasionId) && String(b.occasionId) !== String(occasion._id);
  if (occasionChanged) {
    assertId(b.occasionId, "occasion");
    occasion = await MemoryOccasion.findOne({ _id: b.occasionId, isActive: true }).lean();
    if (!occasion) throw new MemoryError(400, "Invalid occasion.", "INVALID_OCCASION");
  }
  if (b.message !== undefined && b.message !== (page.message || "")) checkMessage(limitsFor(s, occasion, page.extra).messageChars, b.message);
  if (occasionChanged) {
    // what the page already holds must fit the template it is moving to (its own limits + the room this page bought)
    const l = limitsFor(s, occasion, page.extra);
    const count = (kind) => page.media.filter((m) => m.kind === kind).length;
    const text = b.message !== undefined ? b.message : page.message || "";
    const over = count("photo") > l.photos ? `${count("photo")} photos (it allows ${l.photos})` : count("video") > l.videos ? `${count("video")} videos (it allows ${l.videos})` : text.length > l.messageChars ? `a message of ${text.length} characters (it allows ${l.messageChars})` : "";
    if (over) throw new MemoryError(400, `This page has ${over}, which is more than that template holds. Remove some first, or add room with an add-on.`, "TEMPLATE_TOO_SMALL", { limits: limitsOut(l) });
  }

  /*
    Changing the look (or the template): allowed to any look that is switched on and costs the SAME or LESS than what this page was bought for.
    A dearer look needs a new page. Saving the look the page already has is always fine, even if the admin has switched it off since.
  */
  const nowTheme = page.style || themeIdsOf(page.occasion)[0] || "";
  const ids = themeIdsOf(occasion);
  if (b.style && !ids.length) throw new MemoryError(400, "This occasion has no themes to choose from.", "NO_THEMES");
  let wantTheme = b.style !== undefined ? b.style || ids[0] || "" : nowTheme;
  if (occasionChanged && !ids.includes(wantTheme)) wantTheme = ""; // the old look does not exist on the new template: take its first one
  if (occasionChanged || wantTheme !== nowTheme) {
    const target = resolveTheme(occasion, wantTheme || undefined);
    const price = priceOf(occasion, target, s);
    if (page.paidPricePaise != null && price > page.paidPricePaise) {
      throw new MemoryError(402, `That look is ${"\u20B9"}${toRupees(price)} and this page was bought for ${"\u20B9"}${toRupees(page.paidPricePaise)}. Pay the ${"\u20B9"}${toRupees(price - page.paidPricePaise)} difference to use it.`, "UPGRADE_REQUIRED", { price: toRupees(price), paid: toRupees(page.paidPricePaise), diff: toRupees(price - page.paidPricePaise), occasionId: String(occasion._id), theme: target });
    }
    page.occasion = occasion._id;
    page.style = target;
  }
  if (b.age !== undefined) page.age = b.age;
  if (b.gifts !== undefined) page.gifts = b.gifts;
  if (b.wishes !== undefined) page.wishes = b.wishes;
  if (b.promises !== undefined) page.promises = b.promises;
  if (b.since !== undefined) { checkSince(b.since); page.since = b.since; }
  if (b.question !== undefined) page.question = b.question;
  if (b.audience !== undefined) page.audience = b.audience;
  if (b.people !== undefined) page.people = b.people;
  if (b.timeline !== undefined) page.timeline = b.timeline;
  if (b.reasons !== undefined) page.reasons = b.reasons;
  if (b.stats !== undefined) page.stats = b.stats;
  for (const k of ["title", "recipientName", "senderName", "message"]) if (b[k] !== undefined) page[k] = b[k];
  let email = null;
  if (addEmail) {
    await assertCanEmail(req, await getSettings(), addEmail); // before anything is saved
    page.shareEmail = addEmail;
    page.emailAddedAt = new Date();
    page.emailIncludesPin = b.includePin !== false;
  }
  await page.save();
  if (addEmail) {
    const pin = page.visibility === "private" ? decryptPin(page.pinEnc) : null;
    const withPin = page.emailIncludesPin && Boolean(pin);
    if (page.visibility === "private" && !pin) email = { status: "failed", to: addEmail, reason: "PIN_UNKNOWN" }; // an old page whose PIN was never kept: make a new PIN, then resend
    else {
      const sent = await sendPageMail({ page, senderName: page.senderName || (await accountName(req)), theme: page.occasion?.theme, pin: withPin ? pin : null, pinHidden: Boolean(pin) && !withPin, to: addEmail });
      email = { status: sent.status, to: addEmail, includesPin: withPin };
    }
  }
  const out = await reload(page._id, { withMedia: true });
  ok(res, email ? { ...out, email } : out);
});

export const setVisibility = handler(async (req, res) => {
  const page = await ownPage(req);
  editable(page);
  const b = parse(z.object({ visibility: z.enum(["public", "private"]), pin: pinField.optional() }), req.body);
  let pin = null;
  if (b.visibility === "private") {
    // already private and no new PIN asked for: nothing changes (the PIN people were given keeps working)
    const kept = page.visibility === "private" && !b.pin ? decryptPin(page.pinEnc) : null;
    if (kept) return ok(res, { page: await reload(page._id), pin: kept });
    pin = b.pin || newPin();
    page.pinHash = await hashPin(pin);
    page.pinEnc = encryptPin(pin);
  } else {
    page.pinHash = null;
    page.pinEnc = null;
  }
  page.visibility = b.visibility;
  page.accessVersion += 1;
  await page.save();
  ok(res, { page: await reload(page._id), pin });
});

export const changePin = handler(async (req, res) => {
  const page = await ownPage(req);
  editable(page);
  if (page.visibility !== "private") throw new MemoryError(400, "This page is public.", "NOT_PRIVATE");
  const b = parse(z.object({ pin: pinField.optional() }), req.body);
  const pin = b.pin || newPin();
  page.pinHash = await hashPin(pin);
  page.pinEnc = encryptPin(pin);
  page.accessVersion += 1; // signs out everyone who had unlocked it
  await page.save();
  ok(res, { pin });
});

/** Send the page's email again to the SAME address (it can't be changed), a couple of times at most. */
export const resendEmail = handler(async (req, res) => {
  const page = await ownPage(req);
  editable(page);
  if (page.status === "closed") throw new MemoryError(400, "This page is disabled. Enable it before sending the link.", "PAGE_CLOSED");
  canResend(page);
  if (await MemoryMailBlock.exists({ email: page.shareEmail })) throw new MemoryError(400, "That address has asked not to receive emails from Memories.", "EMAIL_BLOCKED");
  const pin = page.visibility === "private" ? decryptPin(page.pinEnc) : null;
  if (page.visibility === "private" && page.emailIncludesPin !== false && !pin) throw new MemoryError(400, "This page's PIN was set before it could be emailed. Make a new PIN in My pages, then resend.", "PIN_UNKNOWN");
  const withPin = page.emailIncludesPin !== false;
  const sent = await sendPageMail({ page, senderName: page.senderName || (await accountName(req)), theme: page.occasion?.theme, pin: withPin ? pin : null, pinHidden: Boolean(pin) && !withPin });
  const fresh = await MemoryPage.findById(page._id);
  ok(res, { status: sent.status, sendsLeft: Math.max(0, MAX_EMAIL_SENDS - (fresh.emailSends || 0)) });
});

export const closePage = handler(async (req, res) => {
  const page = await ownPage(req);
  editable(page);
  page.status = "closed";
  page.accessVersion += 1;
  await page.save();
  ok(res, await reload(page._id));
});

export const reopenPage = handler(async (req, res) => {
  const page = await ownPage(req);
  editable(page);
  page.status = "active";
  await page.save();
  ok(res, await reload(page._id));
});

/** New link: the old URL stops working at once. A page the owner switched off stays off until they switch it on again. */
export const regenerateLink = handler(async (req, res) => {
  const page = await ownPage(req);
  editable(page);
  page.slug = newSlug();
  page.accessVersion += 1;
  await page.save();
  ok(res, await reload(page._id));
});

export const deletePage = handler(async (req, res) => {
  const page = await ownPage(req, { populate: false });
  await deleteMediaObjects(page.media);
  await purgePageEvents(page._id);
  await page.deleteOne(); // the spent credit is not refunded
  ok(res, { deleted: true });
});

/* =====================================================
   MEDIA  (direct-to-S3 via presigned POST, limits from admin settings)
===================================================== */

const KIND_PURPOSE = { photo: "memory_photo", video: "memory_video", audio: "memory_audio" };

/* what THIS page may hold for one kind of file: the template's limits plus the add-ons the page has bought */
const mediaLimits = (s, page, kind) => {
  const l = limitsFor(s, page.occasion, page.extra);
  return kind === "photo" ? { max: l.photos, mb: l.photoMb, sec: null } : kind === "audio" ? { max: 1, mb: l.audioMb, sec: l.audioSec } : { max: l.videos, mb: l.videoMb, sec: l.videoSec };
};

export const presignMedia = handler(async (req, res) => {
  const page = await ownPage(req);
  editable(page);
  const b = parse(
    z.object({ kind: z.enum(["photo", "video", "audio"]), contentType: z.string().toLowerCase(), size: z.number().int().positive(), filename: z.string().max(200).optional() }),
    req.body
  );
  const { max, mb } = mediaLimits(await getSettings(), page, b.kind);
  if (page.media.filter((m) => m.kind === b.kind).length >= max) throw new MemoryError(400, `You can add up to ${max} ${b.kind}${max === 1 ? "" : "s"}. Get more room with an add-on.`, "MEDIA_LIMIT", { max });
  if (b.size > mb * MB) throw new MemoryError(413, `Each ${b.kind} can be up to ${mb} MB. Get more room with an add-on.`, "FILE_TOO_LARGE", { max: mb });

  let target;
  try {
    target = await createUploadTarget({ userId: uid(req), purpose: KIND_PURPOSE[b.kind], contentType: b.contentType, size: b.size, filename: b.filename });
  } catch (e) {
    if (e?.code !== "S3_NOT_CONFIGURED") throw e;
    console.error("[memory] uploads are unavailable:", e.message); // the server log names what's missing; visitors don't need to
    throw new MemoryError(503, "Photo, video and audio uploads aren't available right now. Please try again later.", "UPLOADS_UNAVAILABLE");
  }
  await trackUpload(target.key); // if this file never gets attached to a page, it is cleaned up
  ok(res, { kind: b.kind, ...target }, 201);
});

/* A caption is 4 words at most ("Our first trip"), on one line, 40 characters at most. */
const cleanCaption = (text) => String(text || "").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().split(" ").slice(0, 4).join(" ").slice(0, 40).trim();

export const confirmMedia = handler(async (req, res) => {
  const page = await ownPage(req);
  editable(page);
  const b = parse(
    z.object({
      key: z.string().max(1024), kind: z.enum(["photo", "video", "audio"]), originalName: z.string().max(200).optional(), caption: z.string().max(200).optional(),
      width: z.number().int().min(1).max(20000).optional(), height: z.number().int().min(1).max(20000).optional(), durationSec: z.number().min(0).max(86400).optional(),
    }),
    req.body
  );
  const purpose = KIND_PURPOSE[b.kind];

  // Only the user's own uploads of the right kind can be attached.
  if (!keyBelongsTo(b.key, `${userPrefix(uid(req))}${purpose}/`)) throw new MemoryError(403, "Invalid file.", "FORBIDDEN_KEY");
  if (page.media.some((m) => m.key === b.key)) throw new MemoryError(409, "File already added.", "DUPLICATE");

  const obj = await headObject(b.key);
  if (!obj) throw new MemoryError(404, "Upload not found. Please try again.", "OBJECT_NOT_FOUND");

  const { max, mb, sec } = mediaLimits(await getSettings(), page, b.kind);
  const reject = async (status, message, code) => {
    await removeFiles([b.key]);
    throw new MemoryError(status, message, code);
  };
  if (obj.size > mb * MB) await reject(413, `Each ${b.kind} can be up to ${mb} MB.`, "FILE_TOO_LARGE");
  // the length is measured in the browser (the server never opens the file), with a few seconds of slack
  if (sec && b.durationSec != null && b.durationSec > sec + 3) await reject(413, `A ${b.kind === "audio" ? "voice message" : "video"} can be up to ${sec} seconds. Get more room with an add-on.`, b.kind === "audio" ? "AUDIO_TOO_LONG" : "VIDEO_TOO_LONG");
  if (page.media.filter((m) => m.kind === b.kind).length >= max) await reject(400, `You can add up to ${max} ${b.kind}${max === 1 ? "" : "s"}.`, "MEDIA_LIMIT");

  // Atomic push guarded by the count so parallel confirms cannot exceed the limit.
  const first = !page.media.some((m) => m.kind === b.kind && m.isMain);
  const updated = await MemoryPage.findOneAndUpdate(
    { _id: page._id, $expr: { $lt: [{ $size: { $filter: { input: "$media", cond: { $eq: ["$$this.kind", b.kind] } } } }, max] } },
    { $push: { media: { kind: b.kind, key: b.key, contentType: obj.contentType, size: obj.size, originalName: b.originalName, caption: cleanCaption(b.caption), isMain: first, ...(b.width && b.height ? { width: b.width, height: b.height } : {}), ...((b.kind === "video" || b.kind === "audio") && b.durationSec != null ? { durationSec: b.durationSec } : {}) } } },
    { new: true }
  );
  if (!updated) await reject(400, `You can add up to ${max} ${b.kind}s.`, "MEDIA_LIMIT");
  await uploadAttached(b.key);
  ok(res, await reload(page._id, { withMedia: true }), 201);
});

export const setMainMedia = handler(async (req, res) => {
  const page = await ownPage(req, { populate: false });
  editable(page);
  const media = page.media.id(req.params.mediaId);
  if (!media) throw new MemoryError(404, "Media not found.", "MEDIA_NOT_FOUND");
  page.media.forEach((m) => { if (m.kind === media.kind) m.isMain = m._id.equals(media._id); });
  await page.save();
  ok(res, await reload(page._id, { withMedia: true }));
});

/* change the few words under one photo or video */
export const captionMedia = handler(async (req, res) => {
  const page = await ownPage(req, { populate: false });
  editable(page);
  const b = parse(z.object({ caption: z.string().max(200) }), req.body);
  const media = page.media.id(req.params.mediaId);
  if (!media) throw new MemoryError(404, "Media not found.", "MEDIA_NOT_FOUND");
  media.caption = cleanCaption(b.caption);
  await page.save();
  ok(res, await reload(page._id, { withMedia: true }));
});

export const removeMedia = handler(async (req, res) => {
  const page = await ownPage(req, { populate: false });
  editable(page);
  const media = page.media.id(req.params.mediaId);
  if (!media) throw new MemoryError(404, "Media not found.", "MEDIA_NOT_FOUND");
  const { key, kind, isMain } = media;
  media.deleteOne();
  if (isMain) {
    const next = page.media.find((m) => m.kind === kind);
    if (next) next.isMain = true; // promote the next one
  }
  await page.save();
  await removeFiles([key]); // gone from the bucket now (retried if the bucket refuses)
  ok(res, await reload(page._id, { withMedia: true }));
});
