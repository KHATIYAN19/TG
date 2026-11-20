import User from "../models/User.js";
import UserSession from "../models/UserSession.js";
import UserActivity from "../models/UserActivity.js";

import { describeDevice } from "../utils/authUtils.js";
import { locationFromIp } from "../utils/geoLocation.js";
import { sweepSessions } from "../services/sessionCleanup.js";
import { buildAffiliateDashboard } from "./affiliateDashboardController.js";

/*
  GET /api/users/account[?graphDays=7|30|365][&fresh=1]

  Everything the /profile page needs, in ONE request (it used to make up to five):
    user        the signed-in account (no secrets)
    devices     the 5 most recently active signed-in devices, this one first
    deviceCount how many devices are signed in overall
    activities  the 5 latest account events, with device, place and who did it
    affiliate   affiliates only: the full sales dashboard (cached briefly per user)

  Each part runs in parallel. If the affiliate numbers fail, the rest still loads
  and `affiliate.error` says why.
*/

const DEVICE_LIMIT = 5;
const ACTIVITY_LIMIT = 5;

const USER_FIELDS =
  "name email countryCode mobile role status statusReason statusChangedAt " +
  "passwordChangedAt emailVerifiedAt googleLinkedAt lastLoginAt createdAt updatedAt affiliate isDeleted";

/* ---------- affiliate dashboard: a short per-process cache keeps repeat visits instant ---------- */
const AFFILIATE_TTL_MS = 60 * 1000;
const affiliateCache = new Map(); // key -> { at, data }

const cachedDashboard = async (user, graphDays, fresh) => {
  const key = `${user._id}:${graphDays}`;
  const hit = affiliateCache.get(key);
  if (!fresh && hit && Date.now() - hit.at < AFFILIATE_TTL_MS) return hit.data;

  const data = await buildAffiliateDashboard(
    { user, affiliateUserId: user._id },
    graphDays
  );

  if (affiliateCache.size > 500) affiliateCache.clear();
  affiliateCache.set(key, { at: Date.now(), data });
  return data;
};

/* ---------- shaping ---------- */
const deviceOf = (stored, userAgent) => {
  const described = describeDevice(stored?.userAgent || userAgent);
  const device = {
    ...described,
    ...(stored || {}),
    name: stored?.name || described.name,
    model: stored?.model || described.model,
  };
  delete device.userAgent;
  return device;
};

const placeOf = (stored, ip) => {
  const loc = stored?.text ? stored : locationFromIp(ip);
  return loc?.text ? loc : null;
};

export const shapeSession = (s, currentId) => ({
  sessionId: s.sessionId,
  isCurrent: s.sessionId === currentId,
  isTrusted: Boolean(s.isTrusted),
  trustedUntil: s.trustedUntil || null,
  ipAddress: s.ipAddress || null,
  createdAt: s.createdAt,
  lastActiveAt: s.lastActiveAt || s.createdAt,
  expiresAt: s.refreshExpiresAt,
  device: deviceOf(s.device),
  location: placeOf(s.location, s.ipAddress),
});

// Metadata is shown to the owner, so keep only short plain values and never anything secret-looking.
const SECRET = /token|otp|password|hash|secret|code/i;
const cleanMeta = (meta) => {
  if (!meta || typeof meta !== "object") return {};
  const out = {};
  for (const [k, v] of Object.entries(meta).slice(0, 12)) {
    if (SECRET.test(k)) continue;
    if (["string", "number", "boolean"].includes(typeof v)) out[k] = typeof v === "string" ? v.slice(0, 120) : v;
  }
  return out;
};

export const shapeActivity = (a, userId, currentId) => {
  const byOther = a.actor && String(a.actor._id || a.actor) !== String(userId);
  return {
    id: String(a._id),
    action: a.action,
    result: a.result || "success",
    createdAt: a.createdAt,
    ipAddress: a.ipAddress || null,
    device: a.userAgent ? deviceOf(null, a.userAgent) : null,
    location: placeOf(null, a.ipAddress),
    thisDevice: Boolean(a.sessionId && a.sessionId === currentId),
    actor: byOther ? { name: a.actor.name || "Administrator", email: a.actor.email || null } : null,
    details: cleanMeta(a.metadata),
  };
};

const shapeUser = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  countryCode: u.countryCode || null,
  mobile: u.mobile || null,
  role: u.role,
  status: u.status,
  statusReason: u.statusReason || null,
  passwordChangedAt: u.passwordChangedAt || null,
  emailVerifiedAt: u.emailVerifiedAt || null,
  googleLinked: Boolean(u.googleLinkedAt),
  googleLinkedAt: u.googleLinkedAt || null,
  lastLoginAt: u.lastLoginAt || null,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
  affiliate: u.role === "affiliate" && u.affiliate
    ? {
        code: u.affiliate.code || null,
        status: u.affiliate.status || null,
        commissionType: u.affiliate.commissionType || null,
        commissionValue: u.affiliate.commissionValue ?? null,
      }
    : null,
});

export const getMyAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();

    const user = await User.findById(userId).select(USER_FIELDS).lean();
    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Clean-up of expired rows does not need to hold up the page.
    sweepSessions(userId).catch((e) => console.error("Session sweep:", e.message));

    const activeFilter = {
      user: userId,
      purpose: "login",
      state: "active",
      refreshExpiresAt: { $gt: now },
    };

    const isAffiliate = user.role === "affiliate";
    const affiliateActive = isAffiliate && user.status === "active" && user.affiliate?.status === "active";

    const [sessions, deviceCount, current, activities, affiliate] = await Promise.all([
      UserSession.find(activeFilter)
        .sort({ lastActiveAt: -1 })
        .limit(DEVICE_LIMIT)
        .select("sessionId isTrusted trustedUntil ipAddress createdAt lastActiveAt refreshExpiresAt device location")
        .lean(),

      UserSession.countDocuments(activeFilter),

      // The current device is always listed, even if it is not among the 5 most recent.
      req.sessionId
        ? UserSession.findOne({ ...activeFilter, sessionId: req.sessionId })
            .select("sessionId isTrusted trustedUntil ipAddress createdAt lastActiveAt refreshExpiresAt device location")
            .lean()
        : null,

      UserActivity.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(ACTIVITY_LIMIT)
        .populate("actor", "name email")
        .lean(),

      !isAffiliate
        ? null
        : !affiliateActive
          ? { error: "Your affiliate partnership is inactive. Contact support to reactivate it." }
          : cachedDashboard(user, req.query.graphDays, req.query.fresh === "1")
              .then((data) => ({ data }))
              .catch((e) => {
                console.error("Account affiliate dashboard:", e);
                return { error: "Sales numbers could not be loaded right now." };
              }),
    ]);

    let list = sessions;
    if (current && !list.some((s) => s.sessionId === current.sessionId)) {
      list = [current, ...list].slice(0, DEVICE_LIMIT);
    }
    const devices = list
      .map((s) => shapeSession(s, req.sessionId))
      .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));

    res.set("Cache-Control", "private, no-store");
    return res.json({
      success: true,
      generatedAt: now.toISOString(),
      user: shapeUser(user),
      devices,
      deviceCount,
      activities: activities.map((a) => shapeActivity(a, userId, req.sessionId)),
      affiliate,
    });
  } catch (error) {
    console.error("Account overview:", error);
    return res.status(500).json({ success: false, message: "Unable to load your account" });
  }
};

/*
  GET /api/users/account/sales?graphDays=7|30|365[&fresh=1]
  Affiliates only. Used when the chart range changes, so the whole account is not reloaded.
*/
export const getMySales = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("name role status isDeleted affiliate")
      .lean();

    if (!user || user.isDeleted || user.role !== "affiliate") {
      return res.status(403).json({ success: false, message: "Affiliate access required." });
    }
    if (user.status !== "active" || user.affiliate?.status !== "active") {
      return res.status(403).json({ success: false, message: "Affiliate partnership is inactive." });
    }

    const data = await cachedDashboard(user, req.query.graphDays, req.query.fresh === "1");
    res.set("Cache-Control", "private, no-store");
    return res.json({ success: true, data });
  } catch (error) {
    console.error("Account sales:", error);
    return res.status(500).json({ success: false, message: "Unable to load sales." });
  }
};
