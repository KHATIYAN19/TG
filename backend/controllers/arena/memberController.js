import ArenaProfile from "../../models/arena/ArenaProfile.js";
import ArenaEntry from "../../models/arena/ArenaEntry.js";
import ArenaRequest from "../../models/arena/ArenaRequest.js";
import ArenaMatch from "../../models/arena/ArenaMatch.js";
import ArenaMessage from "../../models/arena/ArenaMessage.js";
import ArenaBlock from "../../models/arena/ArenaBlock.js";
import ArenaReport from "../../models/arena/ArenaReport.js";
import ArenaBugReport from "../../models/arena/ArenaBugReport.js";
import User from "../../models/User.js";
import ArenaCoupon from "../../models/arena/ArenaCoupon.js";
import { getArenaSettings } from "../../models/arena/ArenaSettings.js";

import { ArenaError, handle } from "../../services/arena/errors.js";
import { publicCard, buddyView, ownerView, generateAlias, sharesTopic, FIELD_VISIBILITY } from "../../services/arena/privacy.js";
import { gatewayName } from "../../services/arena/gateway.js";
import { healPaidMembers } from "../../services/arena/activation.js";
import { acceptRequest, endMatch, expireStaleRequests } from "../../services/arena/matchService.js";
import { emitToUser } from "../../services/arena/hub.js";
import {
  profileSchema,
  shareSettingsSchema,
  browseQuerySchema,
  sendRequestSchema,
  blockSchema,
  reportSchema,
  bugReportSchema,
  objectId,
} from "./schemas.js";

const PAGE_SIZE = 12;
const DAY = 86_400_000;

const getProfile = (req) => ArenaProfile.findOne({ user: req.user.id });

/* Only members with a paid, live entry (or a current buddy) may see other members. */
const requirePaidMember = async (req) => {
  let profile = await requireProfile(req);

  // A paid member must never be locked out: if their entry is paid but the
  // profile was left inactive, fix it right now and carry on.
  if (profile.status === "draft" && (await healPaidMembers({ userId: req.user.id }))) {
    profile = await requireProfile(req);
  }

  if (profile.status === "draft") {
    throw new ArenaError(402, "ENTRY_REQUIRED", "Complete your entry payment to access the arena");
  }
  return profile;
};

const requireProfile = async (req) => {
  const profile = await getProfile(req);
  if (!profile) throw new ArenaError(404, "PROFILE_REQUIRED", "Create your profile first");
  if (profile.status === "suspended") {
    throw new ArenaError(403, "SUSPENDED", "Your arena access has been suspended");
  }
  return profile;
};

/* ---------------------------------------------------------------
   PUBLIC LANDING DATA
--------------------------------------------------------------- */
export const publicInfo = handle(async (_req, res) => {
  const settings = await getArenaSettings();
  const now = new Date();

  const [activeMembers, couponLive] = await Promise.all([
    ArenaProfile.countDocuments({ status: "active" }),
    ArenaCoupon.exists({
      active: true,
      $and: [
        { $or: [{ validFrom: null }, { validFrom: { $lte: now } }] },
        { $or: [{ validUntil: null }, { validUntil: { $gte: now } }] },
        { $or: [{ usageLimit: null }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }] },
      ],
    }),
  ]);

  // Public, unauthenticated: only the admin-set rules, one headline count,
  // and the visibility table. No per-topic, per-level or match statistics.
  res.set("Cache-Control", "public, max-age=30");
  res.json({
    success: true,
    data: {
      enabled: settings.enabled,

      // Admin-controlled rules (live)
      entryPricePaise: settings.entryPricePaise,
      cancellationFeePercent: settings.cancellationFeePercent,
      matchesPerEntry: settings.matchesPerEntry,
      requestExpiryDays: settings.requestExpiryDays,
      maxOutgoingRequests: settings.maxOutgoingRequests,
      minMatchDaysBeforeEnd: settings.minMatchDaysBeforeEnd,
      couponsAvailable: Boolean(couponLive),
      paymentGateway: gatewayName(),

      // The one live arena number the landing page shows.
      activeMembers,

      // What is public vs private — generated from the same table the tests check.
      fields: FIELD_VISIBILITY,
    },
  });
}, "Unable to load arena info");

/* ---------------------------------------------------------------
   ME
--------------------------------------------------------------- */
export const me = handle(async (req, res) => {
  await healPaidMembers({ userId: req.user.id });

  const [settings, user, profile] = await Promise.all([
    getArenaSettings(),
    User.findById(req.user.id).select("name email mobile").lean(),
    getProfile(req).lean(),
  ]);

  await expireStaleRequests();

  let entry = null;
  let match = null;
  let counts = { incoming: 0, outgoing: 0 };

  if (profile) {
    const [openEntry, activeMatch, incoming, outgoing] = await Promise.all([
      ArenaEntry.findOne({ user: req.user.id, status: { $in: ["pending_payment", "paid", "in_match", "cancelling"] } })
        .select("status paidPaise listPricePaise discountPaise cancellationFeePercent matchesAllowed matchesUsed complimentary coupon paidAt")
        .lean(),
      ArenaMatch.findOne({ users: req.user.id, status: "active" }).select("matchedAt").lean(),
      ArenaRequest.countDocuments({ toUser: req.user.id, status: "pending" }),
      ArenaRequest.countDocuments({ fromUser: req.user.id, status: "pending" }),
    ]);

    entry = openEntry;
    match = activeMatch ? { id: String(activeMatch._id), matchedAt: activeMatch.matchedAt } : null;
    counts = { incoming, outgoing };
  }

  res.json({
    success: true,
    data: {
      user,
      profile: profile ? ownerView(profile) : null,
      entry,
      match,
      counts,
      settings: {
        enabled: settings.enabled,
        entryPricePaise: settings.entryPricePaise,
        cancellationFeePercent: settings.cancellationFeePercent,
        matchesPerEntry: settings.matchesPerEntry,
        paymentGateway: gatewayName(),
        maxOutgoingRequests: settings.maxOutgoingRequests,
        minMatchDaysBeforeEnd: settings.minMatchDaysBeforeEnd,
      },
    },
  });
}, "Unable to load your arena");

/* ---------------------------------------------------------------
   PROFILE
--------------------------------------------------------------- */
export const upsertProfile = handle(async (req, res) => {
  const data = profileSchema.parse(req.body);
  const user = await User.findById(req.user.id).select("name email mobile").lean();

  let profile = await getProfile(req);

  if (profile?.status === "suspended") {
    throw new ArenaError(403, "SUSPENDED", "Your arena access has been suspended");
  }

  const fields = {
    realName: user.name,
    topics: data.topics,
    level: data.level,
    skills: data.skills,
    yearsExperience: data.yearsExperience,
    companyType: data.companyType,
    companyName: data.companyName,
    designation: data.designation,
    targetCompanies: data.targetCompanies,
    languages: data.languages,
    sessionsPerWeek: data.sessionsPerWeek,
    sessionModes: data.sessionModes,
    buddyPreference: data.buddyPreference,
    timeline: data.timeline,
    availability: data.availability,
    bio: data.bio,
    goal: data.goal,
    contact: {
      email: data.contact.email || user.email,
      phone: data.contact.phone || user.mobile || "",
      linkedin: data.contact.linkedin,
    },
  };

  if (profile) {
    profile.set(fields);
    await profile.save();
  } else {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        profile = await ArenaProfile.create({ user: req.user.id, alias: generateAlias(), ...fields });
        break;
      } catch (error) {
        if (error?.code === 11000 && error.keyPattern?.alias) continue; // alias collision
        throw error;
      }
    }
    if (!profile) throw new ArenaError(500, "ALIAS_FAILED", "Please try again");
  }

  res.json({ success: true, data: ownerView(profile) });
}, "Unable to save your profile");

export const updateShareSettings = handle(async (req, res) => {
  const settings = shareSettingsSchema.parse(req.body);
  const profile = await requireProfile(req);

  profile.shareSettings = settings;
  await profile.save();

  // Tell the buddy's open chat to refresh what they can see.
  if (profile.match) {
    const match = await ArenaMatch.findById(profile.match).select("users status").lean();
    if (match?.status === "active") {
      for (const uid of match.users) emitToUser(uid, { type: "share_updated" });
    }
  }

  res.json({ success: true, data: profile.shareSettings });
}, "Unable to update sharing");

/* ---------------------------------------------------------------
   BROWSE (anonymous cards)
--------------------------------------------------------------- */
const blockedProfileIds = async (userId) => {
  const blocks = await ArenaBlock.find({ $or: [{ blocker: userId }, { blocked: userId }] })
    .select("blockerProfile blockedProfile")
    .lean();
  return blocks.flatMap((b) => [b.blockerProfile, b.blockedProfile]);
};

export const browse = handle(async (req, res) => {
  const q = browseQuerySchema.parse(req.query);
  const me = await requirePaidMember(req);

  if (me.status === "matched") {
    throw new ArenaError(403, "ALREADY_MATCHED", "You're matched. The arena is closed while you have a buddy.");
  }

  await expireStaleRequests();

  // Hide blocked members, and people I've already been matched with.
  const pastMatches = await ArenaMatch.find({ users: req.user.id }).select("users").limit(100).lean();
  const pastBuddyUsers = pastMatches.flatMap((m) => m.users).filter((u) => String(u) !== String(req.user.id));

  const exclude = [me._id, ...(await blockedProfileIds(req.user.id))];
  const filter = { status: "active", _id: { $nin: exclude }, user: { $nin: pastBuddyUsers } };
  // Include profiles saved before multi-topic existed (they still carry `topic`).
  if (q.topic) filter.$or = [{ topics: q.topic }, { topic: q.topic }];
  if (q.language) filter.languages = q.language;
  if (q.level) filter.level = q.level;
  if (q.slot) filter.availability = q.slot;
  if (q.companyType) filter.companyType = q.companyType;
  if (q.skill) filter.skills = q.skill;

  const [items, total] = await Promise.all([
    ArenaProfile.find(filter)
      .sort({ activatedAt: -1, _id: -1 })
      .skip((q.page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    ArenaProfile.countDocuments(filter),
  ]);

  const ids = items.map((p) => p._id);
  const related = await ArenaRequest.find({
    status: "pending",
    $or: [
      { from: me._id, to: { $in: ids } },
      { to: me._id, from: { $in: ids } },
    ],
  })
    .select("from to")
    .lean();

  const sent = new Set(related.filter((r) => String(r.from) === String(me._id)).map((r) => String(r.to)));
  const received = new Set(related.filter((r) => String(r.to) === String(me._id)).map((r) => String(r.from)));

  res.json({
    success: true,
    data: {
      // One unreadable record must never take the whole arena down: skip it and log.
      items: items.flatMap((p) => {
        try {
          return [{
            ...publicCard(p),
            compatible: sharesTopic(p, me),
            requestState: sent.has(String(p._id)) ? "sent" : received.has(String(p._id)) ? "received" : "none",
          }];
        } catch (error) {
          console.error(`[arena] skipping unreadable profile ${p?._id}:`, error.message);
          return [];
        }
      }),
      page: q.page,
      pageSize: PAGE_SIZE,
      total,
      canRequest: true,
    },
  });
}, "Unable to load the arena");

/* ---------------------------------------------------------------
   REQUESTS
--------------------------------------------------------------- */
export const sendRequest = handle(async (req, res) => {
  const { toProfileId, message } = sendRequestSchema.parse(req.body);
  const settings = await getArenaSettings();

  if (!settings.enabled) throw new ArenaError(503, "ARENA_PAUSED", "The arena is temporarily paused");

  const me = await requireProfile(req);

  if (me.status === "matched") {
    throw new ArenaError(409, "ALREADY_MATCHED", "You already have a buddy");
  }
  if (me.status !== "active") {
    throw new ArenaError(402, "ENTRY_REQUIRED", "Join the arena to send requests");
  }

  const target = await ArenaProfile.findOne({ _id: toProfileId, status: "active" });
  if (!target || String(target._id) === String(me._id)) {
    throw new ArenaError(404, "NOT_AVAILABLE", "This member isn't available");
  }

  const pairedBefore = await ArenaMatch.exists({ users: { $all: [req.user.id, target.user] } });
  if (pairedBefore) throw new ArenaError(409, "PREVIOUS_BUDDY", "You've already been matched with this member");

  const blocked = await ArenaBlock.exists({
    $or: [
      { blocker: req.user.id, blocked: target.user },
      { blocker: target.user, blocked: req.user.id },
    ],
  });
  if (blocked) throw new ArenaError(404, "NOT_AVAILABLE", "This member isn't available");

  await expireStaleRequests();

  const [outgoing, reverse] = await Promise.all([
    ArenaRequest.countDocuments({ from: me._id, status: "pending" }),
    ArenaRequest.exists({ from: target._id, to: me._id, status: "pending" }),
  ]);

  if (outgoing >= settings.maxOutgoingRequests) {
    throw new ArenaError(429, "REQUEST_LIMIT", `You can have at most ${settings.maxOutgoingRequests} pending requests`);
  }
  if (reverse) {
    throw new ArenaError(409, "THEY_REQUESTED", "This member already sent you a request. Accept it from your requests.");
  }

  let request;
  try {
    request = await ArenaRequest.create({
      from: me._id,
      to: target._id,
      fromUser: req.user.id,
      toUser: target.user,
      message,
      expiresAt: new Date(Date.now() + settings.requestExpiryDays * DAY),
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ArenaError(409, "ALREADY_REQUESTED", "You already sent this member a request");
    }
    throw error;
  }

  emitToUser(target.user, { type: "request_received" });

  res.status(201).json({ success: true, data: { id: String(request._id), status: request.status } });
}, "Unable to send the request");

export const listRequests = handle(async (req, res) => {
  await requirePaidMember(req);
  const box = req.query.box === "outgoing" ? "outgoing" : "incoming";
  await expireStaleRequests();

  // Paginated so long lists load as the member scrolls.
  const pageNo = Math.max(1, Math.min(Number(req.query.page) || 1, 1000));
  const size = Math.max(1, Math.min(Number(req.query.pageSize) || 8, 30));

  const filter =
    box === "incoming"
      ? { toUser: req.user.id, status: "pending" }
      : { fromUser: req.user.id, status: { $in: ["pending", "rejected", "accepted", "expired"] } };

  const [requests, total] = await Promise.all([
    ArenaRequest.find(filter).sort({ createdAt: -1, _id: -1 }).skip((pageNo - 1) * size).limit(size).lean(),
    ArenaRequest.countDocuments(filter),
  ]);

  const otherIds = requests.map((r) => (box === "incoming" ? r.from : r.to));
  const profiles = await ArenaProfile.find({ _id: { $in: otherIds } }).lean();
  const byId = new Map(profiles.map((p) => [String(p._id), p]));

  // The other member's full ARENA card: every field members can see (never name / contact).
  const items = requests.flatMap((r) => {
    const other = byId.get(String(box === "incoming" ? r.from : r.to));
    if (!other) return [];
    try {
      return [{
        id: String(r._id),
        status: r.status,
        message: r.message,
        createdAt: r.createdAt,
        expiresAt: r.expiresAt,
        respondedAt: r.respondedAt,
        profile: publicCard(other),
      }];
    } catch (error) {
      console.error(`[arena] skipping unreadable request ${r._id}:`, error.message);
      return [];
    }
  });

  res.json({
    success: true,
    data: { items, total, page: pageNo, pageSize: size, hasMore: pageNo * size < total },
  });
}, "Unable to load requests");

export const accept = handle(async (req, res) => {
  objectId.parse(req.params.id);

  const settings = await getArenaSettings();
  if (!settings.enabled) throw new ArenaError(503, "ARENA_PAUSED", "The arena is temporarily paused");

  const me = await requireProfile(req);
  if (me.status !== "active") {
    throw new ArenaError(
      me.status === "matched" ? 409 : 402,
      me.status === "matched" ? "ALREADY_MATCHED" : "ENTRY_REQUIRED",
      me.status === "matched" ? "You already have a buddy" : "Join the arena to accept requests"
    );
  }

  const match = await acceptRequest({ requestId: req.params.id, userId: req.user.id });
  res.json({ success: true, data: { matchId: String(match._id) } });
}, "Unable to accept the request");

const respond = (field, from, to, label) =>
  handle(async (req, res) => {
    objectId.parse(req.params.id);
    const updated = await ArenaRequest.findOneAndUpdate(
      { _id: req.params.id, [field]: req.user.id, status: "pending" },
      { $set: { status: to, respondedAt: new Date() } },
      { new: true }
    );
    if (!updated) throw new ArenaError(404, "REQUEST_UNAVAILABLE", "This request is no longer available");
    emitToUser(field === "toUser" ? updated.fromUser : updated.toUser, { type: "request_updated" });
    res.json({ success: true, message: label });
  }, "Unable to update the request");

export const reject = respond("toUser", "pending", "rejected", "Request declined");
export const withdraw = respond("fromUser", "pending", "withdrawn", "Request withdrawn");

/* ---------------------------------------------------------------
   MATCH
--------------------------------------------------------------- */
const loadActiveMatch = async (userId) => {
  const match = await ArenaMatch.findOne({ users: userId, status: "active" }).lean();
  if (!match) throw new ArenaError(404, "NO_MATCH", "You don't have an active buddy");
  return match;
};

export const getMatch = handle(async (req, res) => {
  const match = await loadActiveMatch(req.user.id);
  const settings = await getArenaSettings();

  const profiles = await ArenaProfile.find({ _id: { $in: match.profiles } }).lean();
  const mine = profiles.find((p) => String(p.user) === String(req.user.id));
  const buddy = profiles.find((p) => String(p.user) !== String(req.user.id));
  if (!mine || !buddy) throw new ArenaError(404, "NO_MATCH", "Match unavailable");

  const endableAt = new Date(new Date(match.matchedAt).getTime() + settings.minMatchDaysBeforeEnd * DAY);
  const myEntry = mine.entry ? await ArenaEntry.findById(mine.entry).select("matchesAllowed matchesUsed").lean() : null;

  res.json({
    success: true,
    data: {
      id: String(match._id),
      matchedAt: match.matchedAt,
      matchesLeft: Math.max(0, (myEntry?.matchesAllowed ?? 1) - (myEntry?.matchesUsed ?? 1)),
      matchesAllowed: myEntry?.matchesAllowed ?? 1,
      canEndNow: endableAt <= new Date(),
      endableAt,
      buddy: buddyView(buddy),
      myShareSettings: mine.shareSettings,
    },
  });
}, "Unable to load your buddy");

export const endMyMatch = handle(async (req, res) => {
  const match = await loadActiveMatch(req.user.id);
  const settings = await getArenaSettings();

  const endableAt = new Date(match.matchedAt).getTime() + settings.minMatchDaysBeforeEnd * DAY;
  if (Date.now() < endableAt) {
    throw new ArenaError(403, "TOO_EARLY", `You can end a partnership after ${settings.minMatchDaysBeforeEnd} day(s)`);
  }

  await endMatch({ matchId: match._id, byUserId: req.user.id, reason: "user_ended" });
  res.json({ success: true, message: "Partnership ended" });
}, "Unable to end the partnership");

export const matchMessages = handle(async (req, res) => {
  const match = await loadActiveMatch(req.user.id);

  const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
  const filter = { match: match._id };

  // Cursor = the id of the oldest message already on screen; ids increase with time.
  if (req.query.beforeId && /^[a-f\d]{24}$/i.test(String(req.query.beforeId))) {
    filter._id = { $lt: req.query.beforeId };
  } else if (req.query.before) {
    const before = new Date(String(req.query.before));
    if (!Number.isNaN(before.getTime())) filter.createdAt = { $lt: before };
  }

  // Fetch one extra row to know whether older messages exist.
  const rows = await ArenaMessage.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit).reverse();

  res.json({
    success: true,
    data: {
      hasMore,
      messages: page.map((m) => ({
        id: String(m._id),
        mine: String(m.sender) === String(req.user.id),
        text: m.text,
        createdAt: m.createdAt,
      })),
    },
  });
}, "Unable to load messages");

/* ---------------------------------------------------------------
   BLOCK / REPORT
--------------------------------------------------------------- */
/* Has this member ever paid? (Blocking/reporting is for people who used the arena.) */
const requireEverPaid = async (userId) => {
  const paid = await ArenaEntry.exists({ user: userId, status: { $in: ["paid", "in_match", "consumed", "cancelled", "cancelling"] } });
  if (!paid) throw new ArenaError(402, "ENTRY_REQUIRED", "Complete your entry payment to access the arena");
};

export const block = handle(async (req, res) => {
  const { profileId } = blockSchema.parse(req.body);
  const me = await requireProfile(req);
  await requireEverPaid(req.user.id);

  const target = await ArenaProfile.findById(profileId).select("user").lean();
  if (!target || String(target._id) === String(me._id)) {
    throw new ArenaError(404, "NOT_FOUND", "Member not found");
  }

  await ArenaBlock.updateOne(
    { blocker: req.user.id, blocked: target.user },
    { $setOnInsert: { blockerProfile: me._id, blockedProfile: target._id } },
    { upsert: true }
  );

  // Blocking dissolves any shared state between the two.
  await ArenaRequest.updateMany(
    {
      status: "pending",
      $or: [
        { from: me._id, to: target._id },
        { from: target._id, to: me._id },
      ],
    },
    { $set: { status: "cancelled", respondedAt: new Date() } }
  );

  const match = await ArenaMatch.findOne({
    users: { $all: [req.user.id, target.user] },
    status: "active",
  }).select("_id");
  if (match) await endMatch({ matchId: match._id, byUserId: req.user.id, reason: "blocked" });

  res.json({ success: true, message: "Member blocked" });
}, "Unable to block");

export const unblock = handle(async (req, res) => {
  objectId.parse(req.params.profileId);
  await ArenaBlock.deleteOne({ blocker: req.user.id, blockedProfile: req.params.profileId });
  res.json({ success: true, message: "Member unblocked" });
}, "Unable to unblock");

export const listBlocks = handle(async (req, res) => {
  const blocks = await ArenaBlock.find({ blocker: req.user.id }).sort({ createdAt: -1 }).limit(100).lean();
  const profiles = await ArenaProfile.find({ _id: { $in: blocks.map((b) => b.blockedProfile) } })
    .select("alias topics level")
    .lean();
  const byId = new Map(profiles.map((p) => [String(p._id), p]));

  res.json({
    success: true,
    data: blocks.map((b) => ({
      profileId: String(b.blockedProfile),
      alias: byId.get(String(b.blockedProfile))?.alias ?? "Member",
      blockedAt: b.createdAt,
    })),
  });
}, "Unable to load blocked members");

export const report = handle(async (req, res) => {
  const data = reportSchema.parse(req.body);
  await requireProfile(req);
  await requireEverPaid(req.user.id);

  const target = await ArenaProfile.findById(data.profileId).select("user").lean();
  if (!target || String(target.user) === String(req.user.id)) {
    throw new ArenaError(404, "NOT_FOUND", "Member not found");
  }

  const duplicate = await ArenaReport.exists({
    reporter: req.user.id,
    reported: target.user,
    status: "open",
  });
  if (duplicate) throw new ArenaError(409, "ALREADY_REPORTED", "You've already reported this member. We're reviewing it.");

  await ArenaReport.create({
    reporter: req.user.id,
    reported: target.user,
    reportedProfile: target._id,
    reason: data.reason,
    details: data.details,
  });

  res.status(201).json({ success: true, message: "Thanks. Our team will review this." });
}, "Unable to submit the report");

/* ---------------------------------------------------------------
   BUG REPORTS (any signed-in user, paid or not)
--------------------------------------------------------------- */
const MAX_BUGS_PER_DAY = 5;

export const reportBug = handle(async (req, res) => {
  const data = bugReportSchema.parse(req.body);

  const today = await ArenaBugReport.countDocuments({
    user: req.user.id,
    createdAt: { $gte: new Date(Date.now() - DAY) },
  });
  if (today >= MAX_BUGS_PER_DAY) {
    throw new ArenaError(429, "BUG_LIMIT", `You can send up to ${MAX_BUGS_PER_DAY} bug reports a day. Thanks for helping!`);
  }

  const bug = await ArenaBugReport.create({
    user: req.user.id,
    ...data,
    userAgent: String(req.get("user-agent") || "").slice(0, 300),
  });

  res.status(201).json({ success: true, message: "Thanks! We'll look into it.", data: { id: String(bug._id) } });
}, "Unable to send the bug report");

export const myBugs = handle(async (req, res) => {
  const rows = await ArenaBugReport.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20).lean();
  res.json({
    success: true,
    data: rows.map((b) => ({
      id: String(b._id), title: b.title, category: b.category, status: b.status,
      adminNote: b.adminNote, createdAt: b.createdAt,
    })),
  });
}, "Unable to load your bug reports");
