import ArenaProfile from "../../models/arena/ArenaProfile.js";
import { formatPhone } from "../../utils/phone.js";
import User from "../../models/User.js";
import ArenaEntry from "../../models/arena/ArenaEntry.js";
import ArenaRequest from "../../models/arena/ArenaRequest.js";
import ArenaMatch from "../../models/arena/ArenaMatch.js";
import ArenaReport from "../../models/arena/ArenaReport.js";
import ArenaCoupon from "../../models/arena/ArenaCoupon.js";
import ArenaBugReport from "../../models/arena/ArenaBugReport.js";
import ArenaSettings, {
  getArenaSettings,
  invalidateArenaSettingsCache,
  publicOffer,
} from "../../models/arena/ArenaSettings.js";

import { ArenaError, handle } from "../../services/arena/errors.js";
import { gatewayName } from "../../services/arena/gateway.js";
import { audit } from "../../models/arena/ArenaAuditLog.js";
import { healPaidMembers, countNeedingAttention } from "../../services/arena/activation.js";
import { migrateLegacyArenaData } from "../../services/arena/migrate.js";
import { CASHFREE_ENV } from "../../config/cashfree.js";
import { adminView } from "../../services/arena/privacy.js";
import { endMatch, closePendingRequests } from "../../services/arena/matchService.js";
import { disconnectUser, emitToUser } from "../../services/arena/hub.js";
import {
  adminSettingsSchema,
  adminCouponSchema,
  adminSuspendSchema,
  adminResolveReportSchema,
  adminBugUpdateSchema,
  objectId,
} from "./schemas.js";

const PAGE = 20;
const page = (req) => Math.max(1, Math.min(Number(req.query.page) || 1, 1000));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ------------------------------ settings ------------------------------ */
export const getSettings = handle(async (_req, res) => {
  const s = await getArenaSettings({ fresh: true });
  const gw = gatewayName();
  res.json({
    success: true,
    data: {
      ...s,
      entryPriceRupees: s.entryPricePaise / 100,
      // Read-only: which gateway members are charged through right now.
      paymentGateway: gw,
      paymentMode: gw === "cashfree" ? (CASHFREE_ENV === "production" ? "production" : "sandbox") : "configured by keys",
    },
  });
}, "Unable to load settings");

export const updateSettings = handle(async (req, res) => {
  const input = adminSettingsSchema.parse(req.body);

  const set = {};
  if (input.enabled !== undefined) set.enabled = input.enabled;
  if (input.entryPriceRupees !== undefined) set.entryPricePaise = Math.round(input.entryPriceRupees * 100);
  if (input.cancellationFeePercent !== undefined) set.cancellationFeePercent = input.cancellationFeePercent;
  if (input.maxOutgoingRequests !== undefined) set.maxOutgoingRequests = input.maxOutgoingRequests;
  if (input.requestExpiryDays !== undefined) set.requestExpiryDays = input.requestExpiryDays;
  if (input.minMatchDaysBeforeEnd !== undefined) set.minMatchDaysBeforeEnd = input.minMatchDaysBeforeEnd;
  if (input.matchesPerEntry !== undefined) set.matchesPerEntry = input.matchesPerEntry;
  if (input.cancelRefundEnabled !== undefined) set.cancelRefundEnabled = input.cancelRefundEnabled;
  if (input.accountDeletionEnabled !== undefined) set.accountDeletionEnabled = input.accountDeletionEnabled;
  if (input.memberVisibilityToggleEnabled !== undefined) set.memberVisibilityToggleEnabled = input.memberVisibilityToggleEnabled;
  if (input.affiliateEnabled !== undefined) set.affiliateEnabled = input.affiliateEnabled;
  if (input.offerEnabled !== undefined) set.offerEnabled = input.offerEnabled;
  if (input.offerText !== undefined) set.offerText = input.offerText;
  if (input.offerEndsAt !== undefined) set.offerEndsAt = input.offerEndsAt ? new Date(input.offerEndsAt) : null;

  if (!Object.keys(set).length) throw new ArenaError(400, "NO_CHANGES", "Nothing to update");

  const before = await getArenaSettings({ fresh: true });
  const changes = Object.fromEntries(
    Object.entries(set)
      .filter(([k, v]) => (v instanceof Date ? (before[k] ? new Date(before[k]).getTime() : null) !== v.getTime() : before[k] !== v))
      .map(([k, v]) => [k, { from: before[k], to: v }])
  );

  const updated = await ArenaSettings.findOneAndUpdate(
    { key: "global" },
    {
      $set: { ...set, updatedBy: req.user.id },
      ...(Object.keys(changes).length
        ? { $push: { history: { $each: [{ at: new Date(), by: req.user.id, changes }], $slice: -50 } } }
        : {}),
    },
    { new: true, upsert: true }
  ).lean();

  invalidateArenaSettingsCache();

  if (Object.keys(changes).length) {
    await audit(req.user.id, "settings_updated", {
      targetType: "settings",
      summary: Object.entries(changes).map(([k, v]) => `${k}: ${v.from} → ${v.to}`).join(", "),
      meta: changes,
    });
  }

  // NOTE: price / fee / matches-per-entry changes affect new checkouts only. Existing entries keep
  // the fee percentage that was shown when they paid.
  res.json({ success: true, data: { ...updated, entryPriceRupees: updated.entryPricePaise / 100 } });
}, "Unable to update settings");

/* -------------------------------- stats -------------------------------- */
export const repair = handle(async (_req, res) => {
  const migrated = await migrateLegacyArenaData();
  const healed = await healPaidMembers({ limit: 2000 });
  await audit(_req.user.id, "repair_run", { summary: `Repair activated ${healed} paid member(s)` });
  res.json({ success: true, data: { healed, migrated, remaining: await countNeedingAttention() }, message: healed ? `Activated ${healed} paid member(s)` : Object.values(migrated).some(Boolean) ? "Updated records saved by an older version" : "Nothing needed repair" });
}, "Unable to run the repair");

export const stats = handle(async (_req, res) => {
  const needsAttention = await countNeedingAttention();
  const [profileStatus, entryAgg, matches, reports, requests, coupons] = await Promise.all([
    ArenaProfile.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ArenaEntry.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          paid: { $sum: "$paidPaise" },
          fees: { $sum: "$cancel.feePaise" },
          refunds: { $sum: "$cancel.refundPaise" },
        },
      },
    ]),
    ArenaMatch.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ArenaReport.countDocuments({ status: "open" }),
    ArenaRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ArenaCoupon.aggregate([{ $group: { _id: null, redemptions: { $sum: "$usedCount" } } }]),
  ]);

  const e = Object.fromEntries(entryAgg.map((x) => [x._id, x]));
  const sumOf = (key) => ["paid", "in_match", "consumed", "cancelled"].reduce((n, s) => n + (e[s]?.[key] ?? 0), 0);
  const grossPaid = sumOf("paid");

  res.json({
    success: true,
    data: {
      profiles: Object.fromEntries(profileStatus.map((x) => [x._id, x.count])),
      matches: Object.fromEntries(matches.map((x) => [x._id, x.count])),
      requests: Object.fromEntries(requests.map((x) => [x._id, x.count])),
      openReports: reports,
      needsAttention, // paid entry but the member is not active
      couponRedemptions: coupons[0]?.redemptions ?? 0,
      revenue: {
        grossPaidPaise: grossPaid,
        refundedPaise: e.cancelled?.refunds ?? 0,
        cancellationFeesPaise: e.cancelled?.fees ?? 0,
        netPaise: grossPaid - (e.cancelled?.refunds ?? 0),
        paidEntries: sumOf("count"),
        cancelledEntries: e.cancelled?.count ?? 0,
      },
    },
  });
}, "Unable to load stats");

/* ------------------------------- profiles ------------------------------- */
export const listProfiles = handle(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.topic) filter.topics = String(req.query.topic);
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(String(req.query.q).slice(0, 40)), "i");
    const users = await User.find({ $or: [{ email: rx }, { name: rx }, { mobile: rx }] }).select("_id").limit(300).lean();
    filter.$or = [{ alias: rx }, { realName: rx }, { "contact.email": rx }, { skills: rx }, ...(users.length ? [{ user: { $in: users.map((u) => u._id) } }] : [])];
  }

  const [rows, total] = await Promise.all([
    ArenaProfile.find(filter).sort({ createdAt: -1 }).skip((page(req) - 1) * PAGE).limit(PAGE).lean(),
    ArenaProfile.countDocuments(filter),
  ]);

  // Account email + each member's current/latest entry (so admins see matches at a glance).
  const userIds = rows.map((p) => p.user);
  const [users, entries] = await Promise.all([
    User.find({ _id: { $in: userIds } }).select("name email mobile countryCode").lean(),
    ArenaEntry.find({ user: { $in: userIds } }).sort({ createdAt: -1 }).lean(),
  ]);
  const userBy = new Map(users.map((u) => [String(u._id), u]));
  const entryBy = new Map();
  for (const e of entries) {
    const key = String(e.user);
    const open = ["paid", "in_match", "pending_payment"].includes(e.status);
    const have = entryBy.get(key);
    // prefer a live entry; otherwise the most recent one
    if (!have || (open && !["paid", "in_match", "pending_payment"].includes(have.status))) entryBy.set(key, e);
  }

  res.json({
    success: true,
    data: {
      items: rows.map((p) => {
        const e = entryBy.get(String(p.user));
        const u = userBy.get(String(p.user));
        return {
          ...adminView(p),
          account: u ? { name: u.name, email: u.email, mobile: u.mobile, countryCode: u.mobile ? u.countryCode || "+91" : null, phone: formatPhone(u.countryCode, u.mobile) || null } : null,
          entry: e
            ? {
                id: String(e._id),
                status: e.status,
                matchesAllowed: e.matchesAllowed,
                matchesUsed: e.matchesUsed,
                matchesLeft: Math.max(0, e.matchesAllowed - e.matchesUsed),
                complimentary: Boolean(e.complimentary),
                paidPaise: e.paidPaise,
              }
            : null,
        };
      }),
      total,
      page: page(req),
      pageSize: PAGE,
    },
  });
}, "Unable to load profiles");

export const performSuspend = async ({ profileId, adminId, reason }) => {
  const profile = await ArenaProfile.findById(profileId);
  if (!profile) throw new ArenaError(404, "NOT_FOUND", "Profile not found");
  if (profile.status === "suspended") throw new ArenaError(409, "ALREADY_SUSPENDED", "Already suspended");

  let before = profile.status;

  // A matched member leaves their partnership; the innocent buddy gets their entry back.
  if (profile.status === "matched" && profile.match) {
    const match = await ArenaMatch.findById(profile.match).lean();
    const buddyProfile = match?.profiles.find((p) => String(p) !== String(profile._id));
    await endMatch({
      matchId: profile.match,
      byUserId: adminId,
      reason: "suspended",
      restoreProfileIds: buddyProfile ? [buddyProfile] : [],
    });
    // The member returns to the arena (entry has matches left) or to draft.
    before = (await ArenaProfile.findById(profile._id).select("status").lean())?.status ?? "draft";
  }

  await ArenaProfile.updateOne(
    { _id: profile._id },
    {
      $set: {
        status: "suspended",
        statusBeforeSuspend: before,
        suspendedReason: reason,
        suspendedAt: new Date(),
        suspendedBy: adminId,
      },
    }
  );

  await closePendingRequests([profile._id], "cancelled");
  emitToUser(profile.user, { type: "suspended" });
  disconnectUser(profile.user, 4003, "Suspended");
  await audit(adminId, "profile_suspended", { targetType: "profile", targetId: profile._id, summary: `Suspended ${profile.alias}: ${reason}` });
};

export const suspendProfile = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const { reason } = adminSuspendSchema.parse(req.body);

  await performSuspend({ profileId: req.params.id, adminId: req.user.id, reason });
  res.json({ success: true, message: "Profile suspended" });
}, "Unable to suspend");

/*
  Bring a suspended profile back: active again if it had a paid entry with matches left
  (nothing about the entry changes, so every unused match is still there), otherwise draft.
  Also used by the book-pack membership suspend / unsuspend.
*/
export const performUnsuspend = async ({ profileId, adminId }) => {
  const profile = await ArenaProfile.findById(profileId);
  if (!profile || profile.status !== "suspended") throw new ArenaError(404, "NOT_FOUND", "Suspended profile not found");

  const entryStillPaid =
    profile.entry && (await ArenaEntry.exists({ _id: profile.entry, status: "paid" }));
  const restored = profile.statusBeforeSuspend === "active" && entryStillPaid ? "active" : "draft";

  await ArenaProfile.updateOne(
    { _id: profile._id },
    {
      $set: { status: restored, statusBeforeSuspend: null, suspendedReason: null, suspendedAt: null, suspendedBy: null },
      ...(restored === "active" ? { activatedAt: new Date() } : {}),
    }
  );

  await audit(adminId, "profile_unsuspended", { targetType: "profile", targetId: profile._id, summary: `Reinstated ${profile.alias} as ${restored}` });
  return restored;
};

export const unsuspendProfile = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const restored = await performUnsuspend({ profileId: req.params.id, adminId: req.user.id });
  res.json({ success: true, message: "Profile reinstated", data: { status: restored } });
}, "Unable to reinstate");

/* Hide / show a profile in the arena on a member's behalf. */
export const hideProfile = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const profile = await ArenaProfile.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { hidden: true, hiddenBy: "admin", hiddenAt: new Date() } },
    { new: true }
  );
  if (!profile) throw new ArenaError(404, "NOT_FOUND", "Profile not found");

  await audit(req.user.id, "profile_hidden", { targetType: "profile", targetId: profile._id, summary: `Hid ${profile.alias} from the arena` });
  res.json({ success: true, message: "Profile hidden from the arena" });
}, "Unable to hide the profile");

export const unhideProfile = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const profile = await ArenaProfile.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { hidden: false, hiddenBy: null, hiddenAt: null } },
    { new: true }
  );
  if (!profile) throw new ArenaError(404, "NOT_FOUND", "Profile not found");

  await audit(req.user.id, "profile_unhidden", { targetType: "profile", targetId: profile._id, summary: `Showed ${profile.alias} in the arena again` });
  res.json({ success: true, message: "Profile is visible again" });
}, "Unable to show the profile");

/* ------------------------------- matches ------------------------------- */
export const dissolveMatch = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const restore = Array.isArray(req.body?.restoreProfileIds) ? req.body.restoreProfileIds.map(String) : [];
  restore.forEach((id) => objectId.parse(id));

  const ended = await endMatch({
    matchId: req.params.id,
    byUserId: req.user.id,
    reason: "admin_dissolved",
    restoreProfileIds: restore,
  });
  if (!ended) throw new ArenaError(404, "NOT_FOUND", "Active match not found");
  await audit(req.user.id, "match_dissolved", { targetType: "match", targetId: req.params.id, summary: `Dissolved match${restore.length ? ` (restored ${restore.length} member${restore.length === 1 ? "" : "s"})` : ""}` });

  res.json({ success: true, message: "Match dissolved" });
}, "Unable to dissolve match");

/* -------------------------------- reports -------------------------------- */
export const listReports = handle(async (req, res) => {
  // status "all" shows everything; otherwise one status (default: open)
  const wanted = String(req.query.status || "open");
  const filter = wanted === "all" ? {} : { status: wanted };

  const [rows, total, counts] = await Promise.all([
    ArenaReport.find(filter).sort({ createdAt: -1 }).skip((page(req) - 1) * PAGE).limit(PAGE).lean(),
    ArenaReport.countDocuments(filter),
    ArenaReport.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const [profiles, reporters, reporterProfiles] = await Promise.all([
    ArenaProfile.find({ _id: { $in: rows.map((r) => r.reportedProfile) } }).select("alias realName status user").lean(),
    User.find({ _id: { $in: rows.map((r) => r.reporter) } }).select("name email").lean(),
    ArenaProfile.find({ user: { $in: rows.map((r) => r.reporter) } }).select("alias user").lean(),
  ]);
  const byId = new Map(profiles.map((p) => [String(p._id), p]));
  const reporterBy = new Map(reporters.map((u) => [String(u._id), u]));
  const reporterAlias = new Map(reporterProfiles.map((p) => [String(p.user), p.alias]));
  const reportedUsers = await User.find({ _id: { $in: profiles.map((p) => p.user) } }).select("email").lean();
  const reportedEmail = new Map(reportedUsers.map((u) => [String(u._id), u.email]));

  res.json({
    success: true,
    data: {
      total,
      page: page(req),
      pageSize: PAGE,
      counts: Object.fromEntries(counts.map((c) => [c._id, c.count])),
      items: rows.map((r) => {
        const rp = byId.get(String(r.reportedProfile));
        const who = reporterBy.get(String(r.reporter));
        return {
          id: String(r._id),
          reason: r.reason,
          details: r.details,
          status: r.status,
          resolution: r.resolution,
          createdAt: r.createdAt,
          resolvedAt: r.resolvedAt,
          reporter: who ? { name: who.name, email: who.email, alias: reporterAlias.get(String(r.reporter)) ?? "" } : null,
          reported: rp ? { id: String(r.reportedProfile), alias: rp.alias, realName: rp.realName, status: rp.status, email: reportedEmail.get(String(rp.user)) ?? "" } : null,
        };
      }),
    },
  });
}, "Unable to load reports");

export const resolveReport = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const input = adminResolveReportSchema.parse(req.body);

  const report = await ArenaReport.findOneAndUpdate(
    { _id: req.params.id, status: "open" },
    { $set: { status: input.status, resolution: input.resolution, resolvedBy: req.user.id, resolvedAt: new Date() } },
    { new: true }
  );
  if (!report) throw new ArenaError(404, "NOT_FOUND", "Open report not found");

  let suspended = false;
  if (input.suspendReported) {
    try {
      await performSuspend({
        profileId: report.reportedProfile,
        adminId: req.user.id,
        reason: `Report: ${report.reason}`,
      });
      suspended = true;
    } catch (error) {
      // Already suspended is fine; anything else should surface.
      if (!(error instanceof ArenaError && error.code === "ALREADY_SUSPENDED")) throw error;
      suspended = true;
    }
  }

  res.json({ success: true, data: { id: String(report._id), status: report.status, suspended } });
}, "Unable to resolve report");

/* -------------------------------- coupons -------------------------------- */
const couponDto = (c) => ({
  id: String(c._id),
  code: c.code,
  description: c.description,
  discountType: c.discountType,
  discountValue: c.discountType === "FIXED" ? c.discountValue / 100 : c.discountValue,
  maxDiscountRupees: c.maxDiscountPaise == null ? null : c.maxDiscountPaise / 100,
  validFrom: c.validFrom,
  validUntil: c.validUntil,
  usageLimit: c.usageLimit,
  usedCount: c.usedCount,
  perUserLimit: c.perUserLimit,
  active: c.active,
  createdAt: c.createdAt,
});

const couponFields = (input) => ({
  description: input.description,
  discountType: input.discountType,
  discountValue: input.discountType === "FIXED" ? Math.round(input.discountValue * 100) : Math.round(input.discountValue),
  maxDiscountPaise: input.maxDiscountRupees == null ? null : Math.round(input.maxDiscountRupees * 100),
  validFrom: input.validFrom ?? null,
  validUntil: input.validUntil ?? null,
  usageLimit: input.usageLimit ?? null,
  perUserLimit: input.perUserLimit,
  active: input.active,
});

export const listCoupons = handle(async (_req, res) => {
  const rows = await ArenaCoupon.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ success: true, data: rows.map(couponDto) });
}, "Unable to load coupons");

export const createCoupon = handle(async (req, res) => {
  const input = adminCouponSchema.parse(req.body);
  try {
    const coupon = await ArenaCoupon.create({ code: input.code, ...couponFields(input), createdBy: req.user.id });
    res.status(201).json({ success: true, data: couponDto(coupon) });
  } catch (error) {
    if (error?.code === 11000) throw new ArenaError(409, "COUPON_EXISTS", "A coupon with this code already exists");
    throw error;
  }
}, "Unable to create coupon");

export const updateCoupon = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const input = adminCouponSchema.parse(req.body);

  const coupon = await ArenaCoupon.findById(req.params.id);
  if (!coupon) throw new ArenaError(404, "NOT_FOUND", "Coupon not found");
  if (input.code !== coupon.code) throw new ArenaError(400, "CODE_IMMUTABLE", "A coupon code can't be changed. Create a new coupon instead.");
  if (input.usageLimit != null && input.usageLimit < coupon.usedCount) {
    throw new ArenaError(400, "LIMIT_TOO_LOW", `Already used ${coupon.usedCount} times`);
  }

  coupon.set(couponFields(input));
  await coupon.save();
  res.json({ success: true, data: couponDto(coupon) });
}, "Unable to update coupon");

export const deleteCoupon = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const coupon = await ArenaCoupon.findById(req.params.id);
  if (!coupon) throw new ArenaError(404, "NOT_FOUND", "Coupon not found");

  if (coupon.usedCount === 0) {
    await coupon.deleteOne();
    return res.json({ success: true, message: "Coupon deleted" });
  }

  // Used coupons are kept for the audit trail and just switched off.
  coupon.active = false;
  await coupon.save();
  res.json({ success: true, message: "Coupon deactivated (it has redemptions)" });
}, "Unable to delete coupon");

/* ------------------------------- bug reports ------------------------------- */
export const listBugs = handle(async (req, res) => {
  const filter = req.query.status ? { status: String(req.query.status) } : {};
  const [rows, total] = await Promise.all([
    ArenaBugReport.find(filter).sort({ createdAt: -1 }).skip((page(req) - 1) * PAGE).limit(PAGE).populate("user", "name email").lean(),
    ArenaBugReport.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      total,
      page: page(req),
      pageSize: PAGE,
      items: rows.map((b) => ({
        id: String(b._id),
        category: b.category,
        severity: b.severity,
        title: b.title,
        description: b.description,
        stepsToReproduce: b.stepsToReproduce,
        pageUrl: b.pageUrl,
        userAgent: b.userAgent,
        status: b.status,
        adminNote: b.adminNote,
        reporter: b.user ? { name: b.user.name, email: b.user.email } : null,
        createdAt: b.createdAt,
      })),
    },
  });
}, "Unable to load bug reports");

export const updateBug = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const input = adminBugUpdateSchema.parse(req.body);
  const done = ["resolved", "wont_fix"].includes(input.status);

  const bug = await ArenaBugReport.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: input.status,
        adminNote: input.adminNote,
        resolvedBy: done ? req.user.id : null,
        resolvedAt: done ? new Date() : null,
      },
    },
    { new: true }
  );
  if (!bug) throw new ArenaError(404, "NOT_FOUND", "Bug report not found");

  res.json({ success: true, data: { id: String(bug._id), status: bug.status } });
}, "Unable to update the bug report");
