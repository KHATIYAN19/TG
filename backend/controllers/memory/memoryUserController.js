import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { z } from "zod";

import MemoryPage from "../../models/memory/MemoryPage.js";
import MemoryOccasion from "../../models/memory/MemoryOccasion.js";
import MemoryCode from "../../models/memory/MemoryCode.js";
import MemoryCredit from "../../models/memory/MemoryCredit.js";
import MemoryEvent from "../../models/memory/MemoryEvent.js";

import { createUploadTarget, headObject, keyBelongsTo, userPrefix } from "../../services/storage/s3.js";
import { removeFiles, trackUpload, uploadAttached } from "../../services/memory/storageCleanup.js";
import MemoryMailBlock from "../../models/memory/MemoryMailBlock.js";
import { canResend, sendPageMail } from "../../services/memory/pageMail.js";
import {
  MAX_GIFTS, MAX_PEOPLE, THANKS_AUDIENCES, MAX_PROMISES, MAX_REASONS, MAX_STATS, MAX_TIMELINE, MAX_WISHES, TEMPLATE_THEMES, MemoryError, assertId, availableCredits, checkPin, ensureOccasions, getSettings, grantCredits,
  hashPin, encryptPin, newPin, newSlug, pageView, parse, sendError, deleteMediaObjects, buildActivity, purgePageEvents, MAX_EVENTS_PER_PAGE, MAX_EMAIL_SENDS, lifetimeDays, expiryFrom, isExpired, decryptPin,
} from "../../services/memory/memoryService.js";
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
  const page = await (populate ? q.populate("occasion", "name theme") : q);
  if (!page) throw new MemoryError(404, "Page not found.", "PAGE_NOT_FOUND");
  if (isExpired(page)) throw new MemoryError(404, "This page has expired and has been removed.", "PAGE_EXPIRED");
  return page;
};
const editable = (page) => {
  if (page.status === "blocked") throw new MemoryError(403, "This page was blocked by an admin.", "PAGE_BLOCKED");
};
const reload = async (id, opts) => pageView(await MemoryPage.findById(id).select("+pinEnc").populate("occasion", "name theme"), { withPin: true, ...opts });

const pinField = z.string().regex(/^\d{6}$/, "PIN must be exactly 6 digits");

/* =====================================================
   CONFIG + BALANCE
===================================================== */

export const getConfig = handler(async (req, res) => {
  await ensureOccasions();
  const [s, occasions, credits] = await Promise.all([
    getSettings(),
    MemoryOccasion.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).select("name theme").lean(),
    availableCredits(uid(req)),
  ]);
  ok(res, {
    enabled: s.enabled,
    price: s.price,
    currency: "INR",
    pageLifetimeDays: lifetimeDays(s),
    emailEnabled: s.emailEnabled !== false,
    limits: { photos: s.maxPhotos, videos: s.maxVideos, photoMb: s.maxPhotoMb, videoMb: s.maxVideoMb, messageChars: s.maxMessageChars },
    occasions: occasions.map((o) => ({ id: String(o._id), name: o.name, theme: o.theme })),
    credits,
    gateways: gatewaysForUsers(s),
    defaultGateway: pickGateway(s)?.id || null,
  });
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

/* When the admin sets the price to 0, a user claims their (single) page credit here. Never piles up: one unused credit at most. */
export const claimFreeCredit = handler(async (req, res) => {
  const s = await getSettings();
  if (!s.enabled) throw new MemoryError(503, "Memory pages are paused right now.", "DISABLED");
  if (s.price > 0) throw new MemoryError(400, "Pages are not free right now. Pay or redeem a code.", "NOT_FREE");
  const userId = uid(req);
  if ((await availableCredits(userId)) < 1) await grantCredits(userId, { source: "free" });
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
  // proposal
  question: z.string().trim().max(100).optional(),
  // thank you
  audience: z.enum(["", ...THANKS_AUDIENCES]).optional(),
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

/** The chosen theme must exist for this occasion's template; occasions without themes take none. */
const checkStyle = (style, occasion) => {
  if (!style) return;
  const allowed = TEMPLATE_THEMES[occasion?.theme];
  if (!allowed) throw new MemoryError(400, "This occasion has no themes to choose from.", "NO_THEMES");
  if (!allowed.includes(style)) throw new MemoryError(400, `Unknown theme. Choose one of: ${allowed.join(", ")}.`, "INVALID_THEME");
};

const checkMessage = (s, message) => {
  if (message && message.length > s.maxMessageChars) throw new MemoryError(400, `Message is too long (max ${s.maxMessageChars} characters).`, "MESSAGE_TOO_LONG");
};

export const createPage = handler(async (req, res) => {
  const b = parse(
    z.object({ occasionId: z.string(), ...pageFields, ...extras, visibility: z.enum(["public", "private"]).default("public"), pin: pinField.optional(), shareEmail: z.union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid email address.").max(254)]).optional() }),
    req.body
  );
  assertId(b.occasionId, "occasion");
  const s = await getSettings();
  if (!s.enabled) throw new MemoryError(503, "Memory pages are paused right now.", "DISABLED");
  checkMessage(s, b.message);
  const occasion = await MemoryOccasion.findOne({ _id: b.occasionId, isActive: true }).select("theme").lean();
  if (!occasion) throw new MemoryError(400, "Invalid occasion.", "INVALID_OCCASION");
  checkStyle(b.style, occasion);
  checkSince(b.since);

  // "Email this page": checked BEFORE a credit is spent, so a refusal never costs anything
  const shareEmail = b.shareEmail || "";
  if (shareEmail) {
    if (s.emailEnabled === false) throw new MemoryError(400, "Emailing pages is switched off right now. You can still share the link yourself.", "EMAIL_DISABLED");
    if (await MemoryMailBlock.exists({ email: shareEmail })) throw new MemoryError(400, "That address has asked not to receive emails from Memories. Please share the link another way.", "EMAIL_BLOCKED");
    const dayAgo = new Date(Date.now() - 24 * 3600 * 1000);
    if ((await MemoryPage.countDocuments({ user: uid(req), shareEmail: { $ne: "" }, createdAt: { $gte: dayAgo } })) >= (s.maxEmailsPerUserPerDay || 10)) throw new MemoryError(429, "You've reached today's limit for emailing pages. Create it without the email, or try again tomorrow.", "EMAIL_DAILY_LIMIT");
    if ((await MemoryPage.countDocuments({ shareEmail, createdAt: { $gte: dayAgo } })) >= 3) throw new MemoryError(429, "That address has already received several pages today. Please try again tomorrow.", "EMAIL_RECIPIENT_LIMIT");
  }

  const pin = b.visibility === "private" ? b.pin || newPin() : null;
  const pinHash = pin ? await hashPin(pin) : null;
  const pinEnc = pin ? encryptPin(pin) : null;

  // Spend one credit atomically; give it back if the page cannot be created.
  const pageId = new mongoose.Types.ObjectId();
  const credit = await MemoryCredit.findOneAndUpdate({ user: uid(req), page: null }, { page: pageId }, { sort: { createdAt: 1 } });
  if (!credit) throw new MemoryError(402, "Redeem a code or pay to create a page.", "CREDIT_REQUIRED");

  try {
    await MemoryPage.create({
      _id: pageId, user: uid(req), occasion: b.occasionId, title: b.title, recipientName: b.recipientName,
      senderName: b.senderName, message: b.message, visibility: b.visibility, pinHash, pinEnc, shareEmail, slug: newSlug(), expiresAt: expiryFrom(Date.now(), lifetimeDays(s)),
      style: b.style || "", age: b.age ?? null, gifts: b.gifts || [], wishes: b.wishes || [], promises: b.promises || [],
      since: b.since || "", question: b.question || "", audience: b.audience || "", people: b.people || [], timeline: b.timeline || [], reasons: b.reasons || [], stats: b.stats || [],
    });
  } catch (e) {
    await MemoryCredit.updateOne({ _id: credit._id }, { page: null });
    throw e;
  }
  // The email goes out now (the page exists either way; if it can't be sent the owner can resend from My pages).
  let email = null;
  if (shareEmail) {
    const fresh = await MemoryPage.findById(pageId).populate("occasion", "theme");
    const sent = await sendPageMail({ page: fresh, senderName: b.senderName || req.user?.name || "", theme: fresh.occasion?.theme, pin, to: shareEmail });
    email = { status: sent.status, to: shareEmail };
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

export const getPage = handler(async (req, res) => ok(res, await pageView(await ownPage(req), { withMedia: true, withPin: true })));

export const updatePage = handler(async (req, res) => {
  const page = await ownPage(req);
  editable(page);
  // The address the page was emailed to is fixed once the page exists, like the names.
  if (req.body?.shareEmail !== undefined && String(req.body.shareEmail).trim().toLowerCase() !== (page.shareEmail || "")) throw new MemoryError(400, "The email address can't be changed after the page is created.", "EMAIL_LOCKED");
  const b = parse(z.object({ occasionId: z.string(), ...pageFields, ...extras }).partial(), req.body);
  checkMessage(await getSettings(), b.message);
  // The names on a page are fixed once it exists (the page, its link and its PIN are shared with them). Everything else can be edited.
  if (b.recipientName !== undefined && b.recipientName !== page.recipientName) throw new MemoryError(400, "The name of the person it's for can't be changed after the page is created.", "NAME_LOCKED");
  if (b.senderName !== undefined && b.senderName !== (page.senderName || "")) throw new MemoryError(400, "Your name can't be changed after the page is created.", "NAME_LOCKED");
  let occasion = page.occasion; // populated by ownPage()
  if (b.occasionId) {
    assertId(b.occasionId, "occasion");
    occasion = await MemoryOccasion.findOne({ _id: b.occasionId, isActive: true }).select("theme").lean();
    if (!occasion) throw new MemoryError(400, "Invalid occasion.", "INVALID_OCCASION");
    page.occasion = b.occasionId;
  }
  if (b.style !== undefined) { checkStyle(b.style, occasion); page.style = b.style; }
  else if (b.occasionId && page.style && !TEMPLATE_THEMES[occasion.theme]?.includes(page.style)) page.style = ""; // old theme does not exist on the new template
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
  await page.save();
  ok(res, await reload(page._id, { withMedia: true }));
});

export const setVisibility = handler(async (req, res) => {
  const page = await ownPage(req);
  editable(page);
  const b = parse(z.object({ visibility: z.enum(["public", "private"]), pin: pinField.optional() }), req.body);
  let pin = null;
  if (b.visibility === "private") {
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
  if (page.visibility === "private" && !pin) throw new MemoryError(400, "This page's PIN was set before it could be emailed. Make a new PIN in My pages, then resend.", "PIN_UNKNOWN");
  const sent = await sendPageMail({ page, senderName: page.senderName, theme: page.occasion?.theme, pin });
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

/** New link: the old URL stops working at once. */
export const regenerateLink = handler(async (req, res) => {
  const page = await ownPage(req);
  editable(page);
  page.slug = newSlug();
  page.status = "active";
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

const KIND_PURPOSE = { photo: "memory_photo", video: "memory_video" };

const limitsFor = (s, kind) =>
  kind === "photo" ? { max: s.maxPhotos, mb: s.maxPhotoMb } : { max: s.maxVideos, mb: s.maxVideoMb };

export const presignMedia = handler(async (req, res) => {
  const page = await ownPage(req, { populate: false });
  editable(page);
  const b = parse(
    z.object({ kind: z.enum(["photo", "video"]), contentType: z.string().toLowerCase(), size: z.number().int().positive(), filename: z.string().max(200).optional() }),
    req.body
  );
  const { max, mb } = limitsFor(await getSettings(), b.kind);
  if (page.media.filter((m) => m.kind === b.kind).length >= max) throw new MemoryError(400, `You can add up to ${max} ${b.kind}s.`, "MEDIA_LIMIT");
  if (b.size > mb * MB) throw new MemoryError(413, `Each ${b.kind} can be up to ${mb} MB.`, "FILE_TOO_LARGE");

  let target;
  try {
    target = await createUploadTarget({ userId: uid(req), purpose: KIND_PURPOSE[b.kind], contentType: b.contentType, size: b.size, filename: b.filename });
  } catch (e) {
    if (e?.code !== "S3_NOT_CONFIGURED") throw e;
    console.error("[memory] uploads are unavailable:", e.message); // the server log names what's missing; visitors don't need to
    throw new MemoryError(503, "Photo and video uploads aren't available right now. Please try again later.", "UPLOADS_UNAVAILABLE");
  }
  await trackUpload(target.key); // if this file never gets attached to a page, it is cleaned up
  ok(res, { kind: b.kind, ...target }, 201);
});

export const confirmMedia = handler(async (req, res) => {
  const page = await ownPage(req, { populate: false });
  editable(page);
  const b = parse(
    z.object({
      key: z.string().max(1024), kind: z.enum(["photo", "video"]), originalName: z.string().max(200).optional(),
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

  const { max, mb } = limitsFor(await getSettings(), b.kind);
  const reject = async (status, message, code) => {
    await removeFiles([b.key]);
    throw new MemoryError(status, message, code);
  };
  if (obj.size > mb * MB) await reject(413, `Each ${b.kind} can be up to ${mb} MB.`, "FILE_TOO_LARGE");
  if (page.media.filter((m) => m.kind === b.kind).length >= max) await reject(400, `You can add up to ${max} ${b.kind}s.`, "MEDIA_LIMIT");

  // Atomic push guarded by the count so parallel confirms cannot exceed the limit.
  const first = !page.media.some((m) => m.kind === b.kind && m.isMain);
  const updated = await MemoryPage.findOneAndUpdate(
    { _id: page._id, $expr: { $lt: [{ $size: { $filter: { input: "$media", cond: { $eq: ["$$this.kind", b.kind] } } } }, max] } },
    { $push: { media: { kind: b.kind, key: b.key, contentType: obj.contentType, size: obj.size, originalName: b.originalName, isMain: first, ...(b.width && b.height ? { width: b.width, height: b.height } : {}), ...(b.kind === "video" && b.durationSec != null ? { durationSec: b.durationSec } : {}) } } },
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
