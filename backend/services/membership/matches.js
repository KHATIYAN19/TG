import Membership from "../../models/Membership.js";
import User from "../../models/User.js";
import ArenaProfile from "../../models/arena/ArenaProfile.js";
import { adjustMemberMatches } from "../arena/grants.js";

/*
  PUT PURCHASED MATCHES ON THE BUYER'S ARENA ACCOUNT
  ---------------------------------------------------
  Matches bought with a book/pack wait on the Membership row (keyed by the
  e-mail used at checkout) until the buyer has an arena profile. This moves them
  across, once, as a complimentary arena entry (or onto their existing entry).

  Safe to call as often as you like: each purchase is claimed atomically, so
  matches are never given twice, and a failed grant is un-claimed so it retries.
*/
export const claimMatchesForUser = async (userId) => {
  const user = await User.findById(userId).select("email").lean();
  if (!user?.email) return { claimed: 0 };

  const email = String(user.email).toLowerCase().trim();

  // A suspended membership gets nothing added; the matches wait until it is unsuspended.
  if (await Membership.exists({ email, status: "suspended" })) return { claimed: 0, suspended: true };

  const waiting = await Membership.find({ email, "matches.granted": { $gt: 0 }, "matches.claimedAt": null })
    .sort({ activatedAt: 1 })
    .select("_id orderId matches.granted")
    .lean();
  if (!waiting.length) return { claimed: 0 };

  const profile = await ArenaProfile.findOne({ user: userId }).select("_id status").lean();
  if (!profile) return { claimed: 0, waiting: waiting.reduce((n, r) => n + r.matches.granted, 0) };

  let claimed = 0;

  for (const row of waiting) {
    // Claim first (atomic) so two requests can't both grant.
    const got = await Membership.findOneAndUpdate(
      { _id: row._id, "matches.claimedAt": null },
      { $set: { "matches.claimedAt": new Date(), "matches.claimedBy": userId, user: userId } }
    );
    if (!got) continue;

    try {
      await adjustMemberMatches({
        profileId: profile._id,
        adminId: null,
        action: "add",
        amount: row.matches.granted,
        reason: `Purchase ${row.orderId}`,
        source: "pass",
      });
      claimed += row.matches.granted;
    } catch (error) {
      await Membership.updateOne({ _id: row._id }, { $set: { "matches.claimedAt": null, "matches.claimedBy": null } });
      console.error(`[membership] could not add ${row.matches.granted} matches for ${email}:`, error.message);
    }
  }

  return { claimed };
};

/** Fire-and-forget version for request handlers. Never throws. */
export const claimMatchesQuietly = (userId) =>
  claimMatchesForUser(userId).catch((error) => {
    console.error("[membership] claim failed:", error.message);
    return { claimed: 0 };
  });
