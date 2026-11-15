import asyncHandler from "express-async-handler";
import { z } from "zod";

import MemoryReferral from "../../models/memory/MemoryReferral.js";
import MemoryPayout from "../../models/memory/MemoryPayout.js";
import MemoryReferralWallet from "../../models/memory/MemoryReferralWallet.js";
import User from "../../models/User.js";
import { assertId, parse, sendError } from "../../services/memory/memoryService.js";
import { claimReferral, requestCashOut, settlePayout, summaryFor, useCreditsAsPage } from "../../services/memory/referral.js";

const handler = (fn) =>
  asyncHandler(async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      return sendError(res, err);
    }
  });
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const uid = (req) => String(req.user?.id || req.user?._id);

/* ---------- owner ---------- */
export const mySummary = handler(async (req, res) => ok(res, await summaryFor(uid(req))));

export const claim = handler(async (req, res) => {
  const { code } = parse(z.object({ code: z.string().trim().min(1).max(20) }), req.body);
  ok(res, await claimReferral(uid(req), code));
});

export const useAsPage = handler(async (req, res) => {
  const { count } = parse(z.object({ count: z.number().int().min(1).max(100).default(1) }), req.body || {});
  ok(res, await useCreditsAsPage(uid(req), count));
});

export const cashOut = handler(async (req, res) => {
  const b = parse(z.object({ credits: z.number().int().min(1).max(1000), upiId: z.string().trim().min(3).max(100) }), req.body);
  ok(res, await requestCashOut(uid(req), b), 201);
});

/* ---------- admin ---------- */
const PAGE = 30;

/** Who has referred people: totals per referrer. */
export const adminReferrers = handler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const rows = await MemoryReferral.aggregate([
    { $match: { status: { $ne: "rejected" } } },
    { $group: { _id: "$referrer", signedUp: { $sum: 1 }, paid: { $sum: { $cond: [{ $eq: ["$status", "qualified"] }, 1, 0] } }, last: { $max: "$createdAt" } } },
    { $sort: { paid: -1, signedUp: -1, last: -1, _id: 1 } },
    { $skip: (page - 1) * PAGE },
    { $limit: PAGE },
  ]);
  const ids = rows.map((r) => r._id);
  const [users, wallets] = await Promise.all([User.find({ _id: { $in: ids } }).select("name email").lean(), MemoryReferralWallet.find({ user: { $in: ids } }).lean()]);
  const userBy = new Map(users.map((u) => [String(u._id), u]));
  const walletBy = new Map(wallets.map((w) => [String(w.user), w]));
  const total = (await MemoryReferral.distinct("referrer", { status: { $ne: "rejected" } })).length;
  ok(res, {
    page, pages: Math.max(1, Math.ceil(total / PAGE)), total,
    items: rows.map((r) => {
      const w = walletBy.get(String(r._id)) || {};
      const u = userBy.get(String(r._id));
      return { userId: String(r._id), name: u?.name || "—", email: u?.email || "", signedUp: r.signedUp, paid: r.paid, earned: w.earned || 0, usedAsPage: w.usedAsPage || 0, cashedOut: w.cashedOut || 0, available: Math.max(0, (w.earned || 0) - (w.usedAsPage || 0) - (w.cashedOut || 0)), code: w.code || "", last: r.last };
    }),
  });
});

/** Cash requests, newest first. `status` = requested | paid | cancelled (omit for all). */
export const adminPayouts = handler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const status = ["requested", "paid", "cancelled"].includes(req.query.status) ? req.query.status : null;
  const filter = status ? { status } : {};
  const [items, total, counts] = await Promise.all([
    MemoryPayout.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE).limit(PAGE).populate("user", "name email mobile").lean(),
    MemoryPayout.countDocuments(filter),
    MemoryPayout.aggregate([{ $group: { _id: "$status", n: { $sum: 1 }, amount: { $sum: "$amount" } } }]),
  ]);
  const by = Object.fromEntries(counts.map((c) => [c._id, { n: c.n, amount: c.amount }]));
  ok(res, {
    page, pages: Math.max(1, Math.ceil(total / PAGE)), total, counts: by,
    items: items.map((p) => ({ id: String(p._id), user: { id: String(p.user?._id || ""), name: p.user?.name || "—", email: p.user?.email || "", mobile: p.user?.mobile || "" }, credits: p.credits, ratePerCredit: p.ratePerCredit, amount: p.amount, upiId: p.upiId, status: p.status, txnRef: p.txnRef, adminNote: p.adminNote, createdAt: p.createdAt, handledAt: p.handledAt })),
  });
});

export const adminSettlePayout = handler(async (req, res) => {
  const id = assertId(req.params.id, "request");
  const b = parse(z.object({ status: z.enum(["paid", "cancelled"]), txnRef: z.string().trim().max(100).optional(), note: z.string().trim().max(500).optional() }), req.body);
  const p = await settlePayout(id, uid(req), b);
  ok(res, { id: String(p._id), status: p.status });
});
