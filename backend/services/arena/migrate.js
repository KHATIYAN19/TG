import ArenaProfile from "../../models/arena/ArenaProfile.js";
import ArenaEntry from "../../models/arena/ArenaEntry.js";
import ArenaMatch from "../../models/arena/ArenaMatch.js";
import ArenaSettings, { ARENA_SETTING_DEFAULTS, invalidateArenaSettingsCache } from "../../models/arena/ArenaSettings.js";

/*
  LEGACY DATA MIGRATION  (idempotent: safe to run on every start)
  ----------------------------------------------------------------
  The arena's data model grew over time. Records written by an earlier
  version can be missing fields that newer code reads:

    profiles   single `topic`            → `topics: [...]`
               no languages / modes / sessionsPerWeek / timeline / …
    entries    `razorpay: {…}`           → `payment: { gateway, orderId, … }`
               no matchesAllowed / matchesUsed / complimentary
               "consumed" while a match is still running → "in_match"
    settings   missing newer settings    → filled with their defaults

  These run as native (aggregation-pipeline) updates, so they work on documents
  that no longer fit the current Mongoose schema. Running twice changes nothing.
*/

const ifMissing = (field, fallback) => ({ $ifNull: [`$${field}`, fallback] });

export const migrateLegacyArenaData = async () => {
  const report = { profilesTopics: 0, profilesDefaults: 0, entriesPayment: 0, entriesMatches: 0, entriesInMatch: 0, settings: 0 };

  /* ---- profiles: topic → topics ---- */
  const a = await ArenaProfile.collection.updateMany(
    { topic: { $exists: true }, $or: [{ topics: { $exists: false } }, { topics: { $size: 0 } }] },
    [{ $set: { topics: [{ $ifNull: ["$topic", "HLD"] }] } }, { $unset: "topic" }]
  );
  report.profilesTopics = a.modifiedCount;

  // a stale `topic` left next to a good `topics`
  await ArenaProfile.collection.updateMany({ topic: { $exists: true }, "topics.0": { $exists: true } }, { $unset: { topic: "" } });

  /* ---- profiles: fields added later ---- */
  const missingProfileField = ["languages", "sessionModes", "sessionsPerWeek", "buddyPreference", "timeline", "targetCompanies", "designation", "companyName", "skills", "availability"]
    .map((f) => ({ [f]: { $exists: false } }));
  const b = await ArenaProfile.collection.updateMany({ $or: missingProfileField }, [
    {
      $set: {
        languages: ifMissing("languages", ["english"]),
        sessionModes: ifMissing("sessionModes", ["chat"]),
        sessionsPerWeek: ifMissing("sessionsPerWeek", 2),
        buddyPreference: ifMissing("buddyPreference", "any"),
        timeline: ifMissing("timeline", "exploring"),
        targetCompanies: ifMissing("targetCompanies", []),
        designation: ifMissing("designation", ""),
        companyName: ifMissing("companyName", ""),
        skills: ifMissing("skills", []),
        availability: ifMissing("availability", []),
      },
    },
  ]);
  report.profilesDefaults = b.modifiedCount;

  /* ---- entries: razorpay.* → payment.* ---- */
  const c = await ArenaEntry.collection.updateMany({ razorpay: { $exists: true }, payment: { $exists: false } }, [
    { $set: { payment: { gateway: "razorpay", orderId: "$razorpay.orderId", paymentId: "$razorpay.paymentId" } } },
    { $unset: "razorpay" },
  ]);
  report.entriesPayment = c.modifiedCount;
  await ArenaEntry.collection.updateMany({ razorpay: { $exists: true }, payment: { $exists: true } }, { $unset: { razorpay: "" } });

  /* ---- entries: match counters + complimentary flag ---- */
  const d = await ArenaEntry.collection.updateMany(
    { $or: [{ matchesAllowed: { $exists: false } }, { matchesUsed: { $exists: false } }, { complimentary: { $exists: false } }] },
    [
      {
        $set: {
          matchesAllowed: ifMissing("matchesAllowed", 1),
          // The old model had one match per entry: a "consumed" entry had used it.
          matchesUsed: { $ifNull: ["$matchesUsed", { $cond: [{ $in: ["$status", ["consumed", "in_match"]] }, 1, 0] }] },
          complimentary: ifMissing("complimentary", false),
        },
      },
    ]
  );
  report.entriesMatches = d.modifiedCount;

  /* ---- entries: "consumed" but the match is still running → "in_match" ---- */
  const live = await ArenaMatch.find({ status: "active" }).select("entries").lean();
  const liveEntryIds = live.flatMap((m) => m.entries ?? []);
  if (liveEntryIds.length) {
    const e = await ArenaEntry.collection.updateMany({ _id: { $in: liveEntryIds }, status: "consumed" }, { $set: { status: "in_match" } });
    report.entriesInMatch = e.modifiedCount;
  }

  /* ---- settings: fill newer settings ---- */
  const missingSetting = Object.keys(ARENA_SETTING_DEFAULTS).map((k) => ({ [k]: { $exists: false } }));
  const s = await ArenaSettings.collection.updateMany({ $or: missingSetting }, [
    { $set: Object.fromEntries(Object.entries(ARENA_SETTING_DEFAULTS).map(([k, v]) => [k, ifMissing(k, v)])) },
  ]);
  report.settings = s.modifiedCount;
  invalidateArenaSettingsCache();

  const changed = Object.values(report).reduce((x, y) => x + y, 0);
  if (changed) console.log("[arena] migrated legacy data:", JSON.stringify(report));
  return report;
};
