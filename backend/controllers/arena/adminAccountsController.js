import mongoose from "mongoose";

import User from "../../models/User.js";
import ArenaProfile from "../../models/arena/ArenaProfile.js";
import { ArenaError, handle } from "../../services/arena/errors.js";

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
  kind=no_profile  accounts that SIGNED UP but never created a Prep Buddy profile.
                   scope=arena (default) = people who verified their email in the arena
                   sign-up; scope=all   = every ordinary account without a profile,
                   including customers who only bought a book.
*/

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

/* Accounts with no ArenaProfile. Aggregation so the filter and the paging stay in the database. */
const noProfilePipeline = (scope, search) => [
  {
    $match: {
      isDeleted: { $ne: true },
      role: "normal",
      ...(scope === "all" ? {} : { emailVerifiedAt: { $ne: null } }),
      ...(search ?? {}),
    },
  },
  {
    $lookup: {
      from: ArenaProfile.collection.name,
      localField: "_id",
      foreignField: "user",
      pipeline: [{ $project: { _id: 1 } }, { $limit: 1 }],
      as: "profile",
    },
  },
  { $match: { profile: { $size: 0 } } },
];

export const listAccounts = handle(async (req, res) => {
  const kind = String(req.query.kind || "deleted");
  if (!["deleted", "no_profile"].includes(kind)) {
    throw new ArenaError(400, "BAD_KIND", "kind must be deleted or no_profile");
  }

  const scope = req.query.scope === "all" ? "all" : "arena";
  const page = pageOf(req);
  const pageSize = sizeOf(req);
  const search = searchFilter(req.query.q);

  /* counts for both tabs, whatever is being shown */
  const [deletedCount, noProfileCount] = await Promise.all([
    User.countDocuments({ isDeleted: true }),
    User.aggregate([...noProfilePipeline(scope, null), { $count: "n" }]).then((r) => r[0]?.n ?? 0),
  ]);
  const counts = { deleted: deletedCount, noProfile: noProfileCount };

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

  /* kind === "no_profile" */
  const [facet] = await User.aggregate([
    ...noProfilePipeline(scope, search),
    {
      $facet: {
        items: [
          { $sort: { createdAt: -1, _id: -1 } },
          { $skip: (page - 1) * pageSize },
          { $limit: pageSize },
          { $project: { name: 1, email: 1, mobile: 1, role: 1, createdAt: 1, emailVerifiedAt: 1, lastLoginAt: 1 } },
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
        source: u.emailVerifiedAt ? "Prep Buddy sign-up" : "Site account (no arena sign-up)",
        daysSinceSignup: Math.max(0, Math.floor((Date.now() - new Date(u.createdAt).getTime()) / 864e5)),
      })),
    },
  });
}, "Unable to load accounts");
