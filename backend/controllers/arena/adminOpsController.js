import mongoose from "mongoose";

import ArenaProfile from "../../models/arena/ArenaProfile.js";
import { commissionOf, NET_COMMISSION_EXPR } from "../../services/arena/affiliate.js";
import ArenaEntry from "../../models/arena/ArenaEntry.js";
import ArenaRequest from "../../models/arena/ArenaRequest.js";
import ArenaMatch from "../../models/arena/ArenaMatch.js";
import ArenaMessage from "../../models/arena/ArenaMessage.js";
import ArenaReport from "../../models/arena/ArenaReport.js";
import ArenaBugReport from "../../models/arena/ArenaBugReport.js";
import ArenaAuditLog, { audit } from "../../models/arena/ArenaAuditLog.js";
import User from "../../models/User.js";

import { ArenaError, handle } from "../../services/arena/errors.js";
import { adjustMemberMatches } from "../../services/arena/grants.js";
import { adminAdjustMatchesSchema, objectId } from "./schemas.js";

/* ------------------------------------------------------------------ helpers */
const clampPage = (req) => Math.max(1, Math.min(Number(req.query.page) || 1, 5000));
const pageSizeOf = (req, def = 20, max = 100) => Math.max(1, Math.min(Number(req.query.pageSize) || def, max));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const oid = (v) => new mongoose.Types.ObjectId(String(v));

/** Profiles whose alias / name / email / phone match free text. */
const profileIdsMatching = async (q) => {
  const text = String(q || "").trim().slice(0, 60);
  if (!text) return null;
  const rx = new RegExp(escapeRegex(text), "i");
  const [profiles, users] = await Promise.all([
    ArenaProfile.find({ $or: [{ alias: rx }, { realName: rx }, { "contact.email": rx }, { "contact.phone": rx }] }).select("_id").limit(500).lean(),
    User.find({ $or: [{ email: rx }, { name: rx }, { mobile: rx }] }).select("_id").limit(500).lean(),
  ]);
  const viaUsers = users.length ? await ArenaProfile.find({ user: { $in: users.map((u) => u._id) } }).select("_id").lean() : [];
  return [...new Set([...profiles, ...viaUsers].map((p) => String(p._id)))].map(oid);
};

/** { profileId → {profileId, alias, name, email, phone} } */
const personMap = async (profileIds) => {
  const profiles = await ArenaProfile.find({ _id: { $in: profileIds } }).select("alias realName user contact").lean();
  const users = await User.find({ _id: { $in: profiles.map((p) => p.user) } }).select("name email mobile").lean();
  const byUser = new Map(users.map((u) => [String(u._id), u]));
  return new Map(
    profiles.map((p) => {
      const u = byUser.get(String(p.user));
      return [
        String(p._id),
        {
          profileId: String(p._id),
          userId: String(p.user),
          alias: p.alias,
          name: p.realName || u?.name || "—",
          email: u?.email || p.contact?.email || "",
          phone: u?.mobile || p.contact?.phone || "",
        },
      ];
    })
  );
};

/* ================================================================= REQUESTS */
export const listRequests = handle(async (req, res) => {
  const status = req.query.status ? String(req.query.status) : null;
  const size = pageSizeOf(req);
  const ids = await profileIdsMatching(req.query.q);

  const base = {};
  if (ids) base.$or = [{ from: { $in: ids } }, { to: { $in: ids } }];
  const filter = status ? { ...base, status } : base;

  const [rows, total, counts] = await Promise.all([
    ArenaRequest.find(filter).sort({ createdAt: -1 }).skip((clampPage(req) - 1) * size).limit(size).lean(),
    ArenaRequest.countDocuments(filter),
    ArenaRequest.aggregate([{ $match: base }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const people = await personMap([...new Set(rows.flatMap((r) => [String(r.from), String(r.to)]))]);

  // Accepted requests: find the partnership (older rows predate the stored link).
  const accepted = rows.filter((r) => r.status === "accepted");
  const matchByPair = new Map();
  if (accepted.length) {
    const matches = await ArenaMatch.find({ users: { $in: accepted.flatMap((r) => [r.fromUser, r.toUser]) } })
      .select("users status matchedAt endedAt endReason")
      .lean();
    for (const r of accepted) {
      const m = r.match
        ? matches.find((x) => String(x._id) === String(r.match))
        : matches.find((x) => x.users.map(String).includes(String(r.fromUser)) && x.users.map(String).includes(String(r.toUser)));
      if (m) matchByPair.set(String(r._id), m);
    }
  }

  res.json({
    success: true,
    data: {
      total,
      page: clampPage(req),
      pageSize: size,
      counts: Object.fromEntries(counts.map((c) => [c._id, c.count])),
      items: rows.map((r) => {
        const m = matchByPair.get(String(r._id));
        return {
          id: String(r._id),
          status: r.status,
          message: r.message,
          sentAt: r.createdAt,
          respondedAt: r.respondedAt,
          expiresAt: r.expiresAt,
          from: people.get(String(r.from)) ?? null,
          to: people.get(String(r.to)) ?? null,
          matchId: m ? String(m._id) : null,
          matchStatus: m?.status ?? null,
        };
      }),
    },
  });
}, "Unable to load requests");

/* ================================================================== MATCHES */
export const listMatches = handle(async (req, res) => {
  const status = req.query.status ? String(req.query.status) : null;
  const size = pageSizeOf(req);
  const filter = {};
  if (status) filter.status = status;

  if (req.query.user) {
    objectId.parse(String(req.query.user));
    filter.users = oid(req.query.user);
  }
  const ids = await profileIdsMatching(req.query.q);
  if (ids) filter.profiles = { $in: ids };

  const countsBase = { ...filter };
  delete countsBase.status;

  const [rows, total, counts] = await Promise.all([
    ArenaMatch.find(filter).sort({ matchedAt: -1 }).skip((clampPage(req) - 1) * size).limit(size).lean(),
    ArenaMatch.countDocuments(filter),
    ArenaMatch.aggregate([{ $match: countsBase }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const matchIds = rows.map((m) => m._id);
  const [people, msgStats, enders] = await Promise.all([
    personMap([...new Set(rows.flatMap((m) => m.profiles.map(String)))]),
    ArenaMessage.aggregate([
      { $match: { match: { $in: matchIds } } },
      { $group: { _id: "$match", count: { $sum: 1 }, last: { $max: "$createdAt" } } },
    ]),
    User.find({ _id: { $in: rows.map((m) => m.endedBy).filter(Boolean) } }).select("name").lean(),
  ]);
  const msgBy = new Map(msgStats.map((x) => [String(x._id), x]));
  const enderName = new Map(enders.map((u) => [String(u._id), u.name]));

  res.json({
    success: true,
    data: {
      total,
      page: clampPage(req),
      pageSize: size,
      counts: Object.fromEntries(counts.map((c) => [c._id, c.count])),
      items: rows.map((m) => {
        const end = m.endedAt ? new Date(m.endedAt) : new Date();
        const endedByProfile = [...people.values()].find((p) => String(p.userId) === String(m.endedBy));
        return {
          id: String(m._id),
          status: m.status,
          matchedAt: m.matchedAt,
          endedAt: m.endedAt,
          endReason: m.endReason,
          endedBy: m.endedBy ? { name: endedByProfile?.name ?? enderName.get(String(m.endedBy)) ?? "Admin", isMember: Boolean(endedByProfile) } : null,
          durationDays: Math.max(0, Math.round(((end - new Date(m.matchedAt)) / 86_400_000) * 10) / 10),
          messageCount: msgBy.get(String(m._id))?.count ?? 0,
          lastMessageAt: msgBy.get(String(m._id))?.last ?? null,
          members: m.profiles.map((p) => people.get(String(p))).filter(Boolean),
        };
      }),
    },
  });
}, "Unable to load matches");

/* ----- admin reads a match's chat (every view is audit-logged) ----- */
export const matchMessages = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const match = await ArenaMatch.findById(req.params.id).lean();
  if (!match) throw new ArenaError(404, "NOT_FOUND", "Match not found");

  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 300);
  const filter = { match: match._id };
  if (req.query.before) {
    const d = new Date(String(req.query.before));
    if (!Number.isNaN(d.getTime())) filter.createdAt = { $lt: d };
  }

  const [rows, total, people] = await Promise.all([
    ArenaMessage.find(filter).sort({ createdAt: -1, _id: -1 }).limit(limit).lean(),
    ArenaMessage.countDocuments({ match: match._id }),
    personMap(match.profiles),
  ]);

  const byUser = new Map([...people.values()].map((p) => [p.userId, p]));

  // Log the first page of a viewing session, not every "load older".
  if (!req.query.before) {
    await audit(req.user.id, "chat_viewed", {
      targetType: "match",
      targetId: match._id,
      summary: `Read chat between ${[...people.values()].map((p) => p.name).join(" & ")} (${total} messages)`,
      meta: { total },
    });
  }

  res.json({
    success: true,
    data: {
      match: { id: String(match._id), status: match.status, matchedAt: match.matchedAt, endedAt: match.endedAt, endReason: match.endReason },
      members: [...people.values()],
      total,
      hasMore: total > rows.length && rows.length === limit,
      messages: rows.reverse().map((m) => {
        const p = byUser.get(String(m.sender));
        return {
          id: String(m._id), senderUserId: String(m.sender), senderName: p?.name ?? "Unknown", senderAlias: p?.alias ?? "",
          text: m.text, createdAt: m.createdAt,
          deleted: Boolean(m.deletedAt), edited: Boolean(m.editedAt),
          reactions: (m.reactions ?? []).map((r) => r.emoji),
        };
      }),
    },
  });
}, "Unable to load the chat");

/* ================================================================== REPORTS / BUGS: permanent delete */
export const deleteReport = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const doc = await ArenaReport.findByIdAndDelete(req.params.id).lean();
  if (!doc) throw new ArenaError(404, "NOT_FOUND", "Report not found");

  await audit(req.user.id, "report_deleted", {
    targetType: "report",
    targetId: doc._id,
    summary: `Permanently deleted a ${doc.reason.replace(/_/g, " ")} report (was ${doc.status})`,
    meta: { reason: doc.reason, status: doc.status, reportedProfile: String(doc.reportedProfile) },
  });
  res.json({ success: true, message: "Report permanently deleted" });
}, "Unable to delete the report");

export const deleteBug = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const doc = await ArenaBugReport.findByIdAndDelete(req.params.id).lean();
  if (!doc) throw new ArenaError(404, "NOT_FOUND", "Bug report not found");

  await audit(req.user.id, "bug_deleted", {
    targetType: "bug",
    targetId: doc._id,
    summary: `Permanently deleted bug "${doc.title}" (was ${doc.status})`,
    meta: { category: doc.category, status: doc.status },
  });
  res.json({ success: true, message: "Bug report permanently deleted" });
}, "Unable to delete the bug report");

/* ================================================================== PAYMENTS LEDGER */
const GROSS_STATUSES = ["paid", "in_match", "consumed", "cancelled"];

const csvCell = (v) => {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const inr = (paise) => ((Number(paise) || 0) / 100).toFixed(2);

export const listPayments = handle(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.gateway) filter["payment.gateway"] = String(req.query.gateway);
  if (req.query.complimentary === "true") filter.complimentary = true;
  if (req.query.complimentary === "false") filter.complimentary = false;

  const aff = String(req.query.affiliate || "").trim().slice(0, 40);
  if (aff === "any") filter["affiliate.user"] = { $exists: true };
  else if (aff === "none") filter["affiliate.user"] = { $exists: false };
  else if (aff) filter["affiliate.code"] = aff.toUpperCase();

  const from = req.query.from ? new Date(String(req.query.from)) : null;
  const to = req.query.to ? new Date(String(req.query.to)) : null;
  if ((from && !Number.isNaN(from)) || (to && !Number.isNaN(to))) {
    filter.createdAt = {};
    if (from && !Number.isNaN(from)) filter.createdAt.$gte = from;
    if (to && !Number.isNaN(to)) filter.createdAt.$lte = new Date(to.getTime() + 86_400_000 - 1); // inclusive end day
  }

  const q = String(req.query.q || "").trim().slice(0, 60);
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    const ids = await profileIdsMatching(q);
    filter.$or = [{ "payment.orderId": rx }, { "payment.paymentId": rx }, { "coupon.code": rx }, ...(ids?.length ? [{ profile: { $in: ids } }] : [])];
  }

  const csv = req.query.format === "csv";
  const size = csv ? 5000 : pageSizeOf(req);

  const [rows, total, sums] = await Promise.all([
    ArenaEntry.find(filter).sort({ createdAt: -1 }).skip(csv ? 0 : (clampPage(req) - 1) * size).limit(size).lean(),
    ArenaEntry.countDocuments(filter),
    ArenaEntry.aggregate([
      { $match: { ...filter, status: { $in: GROSS_STATUSES } } },
      {
        $group: {
          _id: null,
          entries: { $sum: 1 },
          gross: { $sum: "$paidPaise" },
          discounts: { $sum: "$discountPaise" },
          refunds: { $sum: { $add: [{ $ifNull: ["$cancel.refundPaise", 0] }, { $ifNull: ["$refundedPaise", 0] }] } },
          fees: { $sum: "$cancel.feePaise" },
          complimentary: { $sum: { $cond: ["$complimentary", 1, 0] } },
          affiliateEntries: { $sum: { $cond: [{ $gt: ["$affiliate.commissionPaise", 0] }, 1, 0] } },
          affiliateSales: { $sum: { $cond: [{ $gt: ["$affiliate.commissionPaise", 0] }, "$paidPaise", 0] } },
          affiliateCommission: { $sum: NET_COMMISSION_EXPR },
        },
      },
    ]),
  ]);

  const people = await personMap([...new Set(rows.map((r) => String(r.profile)))]);
  const sum = sums[0] ?? { entries: 0, gross: 0, discounts: 0, refunds: 0, fees: 0, complimentary: 0, affiliateEntries: 0, affiliateSales: 0, affiliateCommission: 0 };
  const grantors = await User.find({ _id: { $in: rows.map((r) => r.grantedBy).filter(Boolean) } }).select("name").lean();
  const grantorName = new Map(grantors.map((u) => [String(u._id), u.name]));

  const items = rows.map((r) => {
    const who = people.get(String(r.profile));
    return {
      id: String(r._id),
      createdAt: r.createdAt,
      paidAt: r.paidAt,
      status: r.status,
      member: who ?? null,
      gateway: r.payment?.gateway ?? null,
      orderId: r.payment?.orderId ?? null,
      paymentId: r.payment?.paymentId ?? null,
      listPricePaise: r.listPricePaise,
      discountPaise: r.discountPaise,
      paidPaise: r.paidPaise,
      coupon: r.coupon?.code ?? null,
      cancellationFeePercent: r.cancellationFeePercent,
      matchesAllowed: r.matchesAllowed,
      matchesUsed: r.matchesUsed,
      complimentary: Boolean(r.complimentary),
      grantedBy: r.grantedBy ? grantorName.get(String(r.grantedBy)) ?? "Admin" : null,
      feePaise: r.cancel?.feePaise ?? 0,
      refundPaise: r.cancel?.refundPaise ?? 0,
      refundId: r.cancel?.refundId ?? null,
      refundedPaise: r.refundedPaise ?? 0,
      refunds: (r.refunds ?? []).map((x) => ({ at: x.at, amountPaise: x.amountPaise, refundId: x.refundId })),
      cancelledAt: r.cancel?.at ?? null,
      affiliate: commissionOf(r),
    };
  });

  if (csv) {
    await audit(req.user.id, "payments_exported", { targetType: "payments", summary: `Exported ${items.length} payment row(s) to CSV`, meta: { filter: req.query } });
    const header = ["Date", "Member", "Email", "Phone", "Member ID", "Order ID", "Payment ID", "Gateway", "Status", "List price (INR)", "Discount (INR)", "Coupon", "Paid (INR)", "Matches used", "Matches allowed", "Cancellation fee %", "Fee kept (INR)", "Refund (INR)", "Refund ID", "Complimentary", "Granted by", "Affiliate code", "Commission type", "Commission rate", "Commission (INR)", "Commission status"];
    const lines = [header.map(csvCell).join(",")];
    for (const i of items) {
      lines.push([
        new Date(i.createdAt).toISOString(), i.member?.name, i.member?.email, i.member?.phone, i.member?.alias, i.orderId, i.paymentId, i.gateway, i.status,
        inr(i.listPricePaise), inr(i.discountPaise), i.coupon, inr(i.paidPaise), i.matchesUsed, i.matchesAllowed, i.cancellationFeePercent,
        inr(i.feePaise), inr(i.refundPaise + i.refundedPaise), i.refundId, i.complimentary ? "yes" : "no", i.grantedBy,
        i.affiliate?.code, i.affiliate?.type, i.affiliate ? (i.affiliate.type === "percentage" ? `${i.affiliate.value}%` : `INR ${i.affiliate.value}`) : "", i.affiliate ? inr(i.affiliate.netPaise) : "", i.affiliate?.status,
      ].map(csvCell).join(","));
    }
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="arena-payments-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send("﻿" + lines.join("\r\n")); // BOM so Excel reads UTF-8
  }

  res.json({
    success: true,
    data: {
      total,
      page: clampPage(req),
      pageSize: size,
      totals: {
        entries: sum.entries,
        grossPaidPaise: sum.gross,
        discountsPaise: sum.discounts,
        refundedPaise: sum.refunds,
        cancellationFeesPaise: sum.fees,
        netPaise: sum.gross - sum.refunds,
        complimentaryEntries: sum.complimentary,
        affiliateEntries: sum.affiliateEntries,
        affiliateSalesPaise: sum.affiliateSales,
        affiliateCommissionPaise: sum.affiliateCommission,
      },
      items,
    },
  });
}, "Unable to load payments");

/* ================================================================== MEMBERS: give / take matches */
export const adjustMatches = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const input = adminAdjustMatchesSchema.parse(req.body);
  const out = await adjustMemberMatches({ profileId: req.params.id, adminId: req.user.id, ...input });

  const word = out.complimentary && out.from === 0 ? "Gave" : out.to > out.from ? "Increased" : "Reduced";
  res.json({
    success: true,
    message: `${word} to ${out.matchesAllowed} match${out.matchesAllowed === 1 ? "" : "es"} (${out.matchesUsed} used). No refund is issued by this action.`,
    data: out,
  });
}, "Unable to change matches");

/* ================================================================== AUDIT TRAIL */
export const listAudit = handle(async (req, res) => {
  const size = pageSizeOf(req, 25, 100);
  const filter = req.query.action ? { action: String(req.query.action) } : {};
  const [rows, total] = await Promise.all([
    ArenaAuditLog.find(filter).sort({ createdAt: -1 }).skip((clampPage(req) - 1) * size).limit(size).populate("admin", "name email").lean(),
    ArenaAuditLog.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: {
      total,
      page: clampPage(req),
      pageSize: size,
      items: rows.map((a) => ({
        id: String(a._id),
        at: a.createdAt,
        action: a.action,
        summary: a.summary,
        targetType: a.targetType,
        targetId: a.targetId,
        admin: a.admin ? { name: a.admin.name, email: a.admin.email } : null,
      })),
    },
  });
}, "Unable to load the activity log");
