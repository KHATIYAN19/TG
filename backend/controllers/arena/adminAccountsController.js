import mongoose from "mongoose";

import User from "../../models/User.js";
import MailSuppression from "../../models/MailSuppression.js";
import ArenaProfile from "../../models/arena/ArenaProfile.js";
import ArenaEntry from "../../models/arena/ArenaEntry.js";
import { audit } from "../../models/arena/ArenaAuditLog.js";
import { getArenaSettings, publicOffer } from "../../models/arena/ArenaSettings.js";
import { ArenaError, handle } from "../../services/arena/errors.js";
import { sendPaymentReminder } from "../../services/arena/mail.js";

/*
  ACCOUNTS (admin): two lists nobody else can see
  -----------------------------------------------
  kind=deleted     every account that has been deleted:
                   - deleted by the MEMBER themselves: the record is an emptied shell
                     (no name / email / phone, by design), shown with its sign-up and
                     deletion dates;
                   - soft-deleted by an ADMIN elsewhere on the site: real details kept.
                   (Members an admin hard-deleted from the arena portal are gone from the
                   database entirely, so they can't be listed. The activity log keeps a line.)
  kind=unpaid      accounts that SIGNED UP but never paid for (or were never given) an
                   arena entry. Entry is pay-first, so these members have usually not
                   created a profile yet either.
                   scope=arena (default) = people who verified their email in the arena
                   sign-up; scope=all   = every ordinary account without a paid entry,
                   including customers who only bought a book.
                   Each row can be sent a payment reminder email (POST /accounts/:id/remind).
*/

const REMINDER_COOLDOWN_MS = 600_0;
const PAID_STATUSES = ["paid", "in_match", "consumed", "cancelling"];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pageOf = (req) => Math.max(1, Math.min(Number(req.query.page) || 1, 5000));
const sizeOf = (req) => Math.max(1, Math.min(Number(req.query.pageSize) || 20, 100));

const searchFilter = (raw) => {
  const text = String(raw || "").trim().slice(0, 60);
  if (!text) return null;
  const rx = new RegExp(escapeRegex(text), "i");
  return {
    $or: [
      { name: rx },
      { email: rx },
      { mobile: rx },
      ...(/^[a-f\d]{24}$/i.test(text) ? [{ _id: new mongoose.Types.ObjectId(text) }] : []),
    ],
  };
};

const ANON = /@deleted\.invalid$/;

const baseView = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  mobile: u.mobile ?? null,
  role: u.role,
  signedUpAt: u.createdAt,
  verified: Boolean(u.emailVerifiedAt),
  lastLoginAt: u.lastLoginAt ?? null,
});

const reminderView = (u) => {
  const sentAt = u.arenaReminderSentAt ?? null;
  const nextAt = sentAt ? new Date(new Date(sentAt).getTime() + REMINDER_COOLDOWN_MS) : null;
  return {
    reminderCount: u.arenaReminderCount ?? 0,
    reminderSentAt: sentAt,
    // When the "Remind" button works again (null = now).
    reminderNextAt: nextAt && nextAt.getTime() > Date.now() ? nextAt : null,
  };
};

/*
  Accounts that never got into the arena: no paid/complimentary entry and no live profile.
  Aggregation so the filter and the paging stay in the database.
*/
const unpaidPipeline = (scope, search, extra = {}) => [
  {
    $match: {
      isDeleted: { $ne: true },
      role: "normal",
      ...(scope === "all" ? {} : { emailVerifiedAt: { $ne: null } }),
      ...extra,
      ...(search ?? {}),
    },
  },
  {
    $lookup: {
      from: ArenaEntry.collection.name,
      localField: "_id",
      foreignField: "user",
      pipeline: [{ $match: { status: { $in: PAID_STATUSES } } }, { $project: { _id: 1 } }, { $limit: 1 }],
      as: "paidEntry",
    },
  },
  {
    $lookup: {
      from: ArenaProfile.collection.name,
      localField: "_id",
      foreignField: "user",
      pipeline: [{ $match: { status: { $in: ["active", "matched", "suspended"] } } }, { $project: { _id: 1 } }, { $limit: 1 }],
      as: "liveProfile",
    },
  },
  { $match: { paidEntry: { $size: 0 }, liveProfile: { $size: 0 } } },
];

export const listAccounts = handle(async (req, res) => {
  const kind = String(req.query.kind || "deleted");
  if (!["deleted", "unpaid"].includes(kind)) {
    throw new ArenaError(400, "BAD_KIND", "kind must be deleted or unpaid");
  }

  const scope = req.query.scope === "all" ? "all" : "arena";
  const page = pageOf(req);
  const pageSize = sizeOf(req);
  const search = searchFilter(req.query.q);

  /* counts for both tabs, whatever is being shown */
  const [deletedCount, unpaidCount] = await Promise.all([
    User.countDocuments({ isDeleted: true }),
    User.aggregate([...unpaidPipeline(scope, null), { $count: "n" }]).then((r) => r[0]?.n ?? 0),
  ]);
  const counts = { deleted: deletedCount, unpaid: unpaidCount };

  if (kind === "deleted") {
    const filter = { isDeleted: true, ...(search ?? {}) };

    const [rows, total] = await Promise.all([
      User.find(filter)
        .select("name email mobile role createdAt emailVerifiedAt lastLoginAt deletedAt deletedBy status")
        .sort({ deletedAt: -1, _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      User.countDocuments(filter),
    ]);

    const adminIds = rows.map((u) => u.deletedBy).filter((id) => id);
    const admins = adminIds.length ? await User.find({ _id: { $in: adminIds } }).select("name email").lean() : [];
    const adminBy = new Map(admins.map((a) => [String(a._id), a]));

    return res.json({
      success: true,
      data: {
        kind,
        counts,
        total,
        page,
        pageSize,
        items: rows.map((u) => {
          const selfDeleted = u.deletedBy && String(u.deletedBy) === String(u._id);
          const by = u.deletedBy ? adminBy.get(String(u.deletedBy)) : null;
          return {
            ...baseView(u),
            anonymized: ANON.test(u.email || ""),
            deletedAt: u.deletedAt ?? null,
            deletedBy: selfDeleted ? "member" : by ? "admin" : "unknown",
            deletedByName: selfDeleted ? "The member (Delete my account)" : by ? by.name : null,
            keptFor: u.deletedAt && u.createdAt ? Math.max(0, Math.round((new Date(u.deletedAt) - new Date(u.createdAt)) / 864e5)) : null,
          };
        }),
      },
    });
  }

  /* kind === "unpaid" */
  const [facet] = await User.aggregate([
    ...unpaidPipeline(scope, search),
    {
      $facet: {
        items: [
          { $sort: { createdAt: -1, _id: -1 } },
          { $skip: (page - 1) * pageSize },
          { $limit: pageSize },
          { $project: { name: 1, email: 1, mobile: 1, role: 1, createdAt: 1, emailVerifiedAt: 1, lastLoginAt: 1, arenaReminderSentAt: 1, arenaReminderCount: 1 } },
        ],
        total: [{ $count: "n" }],
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      kind,
      scope,
      counts,
      total: facet?.total?.[0]?.n ?? 0,
      page,
      pageSize,
      items: (facet?.items ?? []).map((u) => ({
        ...baseView(u),
        ...reminderView(u),
        source: u.emailVerifiedAt ? "Prep Buddy sign-up" : "Site account (no arena sign-up)",
        daysSinceSignup: Math.max(0, Math.floor((Date.now() - new Date(u.createdAt).getTime()) / 864e5)),
      })),
    },
  });
}, "Unable to load accounts");

/*
  POST /accounts/:id/remind
  Emails ONE sign-up who has not paid: "Hi <name>, get Prep Buddy Arena at ₹<price> for
  <n> matches". The price and number of matches are the live arena settings. At most one
  reminder per person every 24 hours, and never to someone who has paid, was deleted, or
  unsubscribed from Target Trek email.
*/
export const remindAccount = handle(async (req, res) => {
  const id = String(req.params.id || "");
  if (!mongoose.isValidObjectId(id)) throw new ArenaError(400, "BAD_ID", "Invalid account id");

  const settings = await getArenaSettings({ fresh: true });
  if (!settings.enabled) {
    throw new ArenaError(409, "ARENA_PAUSED", "New entries are paused, so there is nothing to remind people about. Turn the arena back on first.");
  }

  // Same rule as the list: only someone who still hasn't paid may be reminded.
  const [target] = await User.aggregate([
    ...unpaidPipeline("all", null, { _id: new mongoose.Types.ObjectId(id) }),
    { $project: { name: 1, email: 1, arenaReminderSentAt: 1 } },
  ]);
  if (!target) throw new ArenaError(404, "NOT_ELIGIBLE", "This person has already paid, joined or been deleted, so no reminder is needed.");

  const email = String(target.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /@deleted\.invalid$/.test(email)) {
    throw new ArenaError(409, "NO_EMAIL", "This account has no valid email address.");
  }
  if (await MailSuppression.exists({ email })) {
    throw new ArenaError(409, "UNSUBSCRIBED", "This person unsubscribed from Target Trek emails, so no reminder was sent.");
  }

  // Claim the send atomically (cooldown + double-click protection) before mailing.
  const cutoff = new Date(Date.now() - REMINDER_COOLDOWN_MS);
  const previous = target.arenaReminderSentAt ?? null;
  const claimed = await User.findOneAndUpdate(
    { _id: target._id, $or: [{ arenaReminderSentAt: null }, { arenaReminderSentAt: { $lt: cutoff } }] },
    { $set: { arenaReminderSentAt: new Date() }, $inc: { arenaReminderCount: 1 } },
    { new: true }
  ).select("arenaReminderSentAt arenaReminderCount").lean();
  if (!claimed) {
    const next = new Date(new Date(previous).getTime() + REMINDER_COOLDOWN_MS);
    throw new ArenaError(429, "REMINDER_COOLDOWN", `A reminder was already sent to ${target.name || "this person"} in the last 24 hours. You can send another after ${next.toLocaleString("en-IN")}.`);
  }

  try {
    await sendPaymentReminder(email, {
      name: target.name,
      pricePaise: settings.entryPricePaise,
      matches: settings.matchesPerEntry,
      offerText: publicOffer(settings).text,
      attempt: claimed.arenaReminderCount,
    });
  } catch (error) {
    // Nothing was sent: give the claim back so the admin can retry straight away.
    await User.updateOne({ _id: target._id }, { $set: { arenaReminderSentAt: previous }, $inc: { arenaReminderCount: -1 } });
    console.error("[arena:reminder]", error.message);
    throw new ArenaError(502, "MAIL_FAILED", "The email could not be sent right now. Please try again in a minute.");
  }

  await audit(req.user.id, "reminder_sent", {
    targetType: "account",
    targetId: target._id,
    summary: `Sent a payment reminder to ${target.name} (${email})`,
    meta: { pricePaise: settings.entryPricePaise, matches: settings.matchesPerEntry },
  });

  res.json({
    success: true,
    message: `Reminder sent to ${email}`,
    data: reminderView(claimed),
  });
}, "Unable to send the reminder");
