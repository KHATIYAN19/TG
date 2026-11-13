import asyncHandler from "express-async-handler";

import MemoryPage from "../../models/memory/MemoryPage.js";
import MemoryOccasion from "../../models/memory/MemoryOccasion.js";
import {
  TEMPLATE_THEMES, lifetimeDays, isExpired, answerOut, repliesOut, giftsOut, statsOut, styleFor, timelineOut, MemoryError, checkPin, ensureOccasions, getSettings, parse, sendError, signMedia, signPageToken, verifyPageToken,
} from "../../services/memory/memoryService.js";
import { addonCatalog, addonOut, limitsFor, limitsOut, occasionForUser, themeEnabled, themeIdsOf } from "../../services/memory/catalog.js";
import { z } from "zod";

const handler = (fn) =>
  asyncHandler(async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      return sendError(res, err);
    }
  });

export const tokenOf = (req) => req.get("x-memory-token") || req.query.t || "";

export const loadVisible = async (slug, { withPin = false } = {}) => {
  const q = MemoryPage.findOne({ slug: String(slug) }).populate("occasion", "name theme").populate("user", "name status");
  const page = await (withPin ? q.select("+pinHash") : q);
  if (!page) throw new MemoryError(404, "This link does not exist.", "LINK_NOT_FOUND");
  if (isExpired(page)) throw new MemoryError(410, "This page has expired.", "PAGE_EXPIRED");
  if (page.status === "blocked" || ["suspended", "blocked"].includes(page.user?.status)) throw new MemoryError(410, "This page is unavailable.", "PAGE_BLOCKED");
  if (page.status === "closed") throw new MemoryError(410, "This link has been closed by its owner.", "LINK_CLOSED");
  return page;
};

/* GET /api/memories/view/:slug   (header X-Memory-Token or ?t= for private pages) */
export const viewPage = handler(async (req, res) => {
  const page = await loadVisible(req.params.slug);
  if (page.visibility === "private" && !verifyPageToken(tokenOf(req), page)) {
    throw new MemoryError(401, "Enter the PIN to open this page.", "PIN_REQUIRED", { pinRequired: true, theme: page.occasion?.theme || null, style: styleFor(page) } /* nothing about the page itself (no names) until the PIN is right */);
  }
  MemoryPage.updateOne({ _id: page._id }, { $inc: { viewCount: 1 } }).catch(() => {});
  res.set("Cache-Control", "no-store");
  res.json({
    success: true,
    data: {
      occasion: page.occasion?.name || null,
      theme: page.occasion?.theme || "default",
      style: styleFor(page), // the look the SENDER chose for this page (null for occasions without themes)
      age: page.age ?? null,
      gifts: giftsOut(page), // empty = the page shows no gifts section
      wishes: page.wishes || [],
      promises: page.promises || [],
      since: page.since || "",
      question: page.question || "",
      audience: page.audience || "",
      people: timelineOut({ timeline: page.people }),
      timeline: timelineOut(page),
      reasons: page.reasons || [],
      stats: statsOut(page),
      title: page.title,
      recipientName: page.recipientName,
      senderName: page.senderName || page.user?.name || "",
      message: page.message || "",
      media: await signMedia(page),
      // what the receiver already did here: the page shows it again after a reload (the celebration for a yes, the gentle screen for a no)
      response: { answer: answerOut(page), replies: repliesOut(page) },
    },
  });
});

/* POST /api/memories/view/:slug/unlock  { pin } -> { token } */
export const unlockPage = handler(async (req, res) => {
  const { pin } = parse(z.object({ pin: z.string().min(1).max(12) }), req.body);
  const page = await loadVisible(req.params.slug, { withPin: true });
  if (page.visibility !== "private") return res.json({ success: true, data: { token: null } });
  if (!(await checkPin(pin, page.pinHash))) throw new MemoryError(401, "Wrong PIN.", "PIN_INVALID");
  res.json({ success: true, data: { token: signPageToken(page) } });
});

/* GET /api/memories/public: what the marketing page needs (price, limits, occasions). No login, no secrets. */
export const publicInfo = handler(async (req, res) => {
  await ensureOccasions();
  const [s, occasions, addons] = await Promise.all([
    getSettings(),
    MemoryOccasion.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
    addonCatalog({ onlyEnabled: true }),
  ]);
  const visible = occasions.filter((o) => !themeIdsOf(o).length || themeIdsOf(o).some((id) => themeEnabled(o, id)));
  const cards = visible.map((o) => occasionForUser(o, s));
  const prices = cards.flatMap((c) => (c.themes.length ? c.themes.map((t) => t.price) : [c.price]));
  const from = prices.length ? Math.min(...prices) : s.price;
  const to = prices.length ? Math.max(...prices) : s.price;
  res.set("Cache-Control", "public, max-age=60");
  res.json({
    success: true,
    data: {
      enabled: s.enabled,
      price: from, // "from" price: the cheapest look. Each template and look has its own (occasions[].price / themes[].price)
      priceTo: to,
      currency: "INR",
      pageLifetimeDays: lifetimeDays(s),
      limits: limitsOut(limitsFor(s, null, null)),
      themes: Object.fromEntries(visible.map((o) => [o.theme, themeIdsOf(o).filter((id) => themeEnabled(o, id))]).filter(([k, v]) => v.length || !TEMPLATE_THEMES[k])), // the looks a sender can choose from, per template
      occasions: cards.map((c) => ({ name: c.name, theme: c.theme, price: c.price, themes: c.themes, limits: c.limits })), // each template: its price, its looks with prices, its own limits
      addons: addons.map(addonOut), // what the admin sells as extras, with the admin's prices
      onlineDays: lifetimeDays(s),
    },
  });
});
