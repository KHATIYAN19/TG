import Membership from "../../models/Membership.js";
import User from "../../models/User.js";
import ArenaProfile from "../../models/arena/ArenaProfile.js";
import { ArenaError } from "../arena/errors.js";
import { performSuspend, performUnsuspend } from "../../controllers/arena/adminController.js";

/*
  MEMBERSHIP SUSPEND / UNSUSPEND / DELETE
  ---------------------------------------
  Suspending a membership also suspends the person's Prep Arena profile, using the
  arena's own suspend (open requests are closed, a running match ends and the buddy
  is put back in the arena). Nothing about their entry changes, so unsuspending
  returns them to the arena with exactly the matches they had left.

  If their profile was ALREADY suspended by an arena admin, we leave it alone on
  unsuspend (only a suspension we caused is lifted).
*/

const lowered = (email) => String(email || "").toLowerCase().trim();

const profileForEmail = async (email) => {
  const user = await User.findOne({ email: lowered(email) }).select("_id").lean();
  if (!user) return null;
  return ArenaProfile.findOne({ user: user._id }).select("_id status").lean();
};

/** Make the arena profile match the membership state. Safe to call any time, any number of times. */
export const syncArenaAccess = async (email, { adminId = null } = {}) => {
  const e = lowered(email);
  if (!e) return;

  const rows = await Membership.find({ email: e }).select("status arenaSuspended suspendedBy suspendReason").lean();
  if (!rows.length) return;

  const suspended = rows.filter((r) => r.status === "suspended");
  const profile = await profileForEmail(e);

  if (suspended.length) {
    if (!profile || profile.status === "suspended") return; // nothing to do (or an arena admin already did it)
    const first = suspended[0];
    await performSuspend({
      profileId: profile._id,
      adminId: first.suspendedBy || adminId,
      reason: `Book pack membership suspended: ${first.suspendReason || "no reason given"}`,
    });
    await Membership.updateOne({ _id: first._id }, { $set: { arenaSuspended: true } });
    return;
  }

  const flagged = rows.filter((r) => r.arenaSuspended);
  if (flagged.length) {
    if (profile?.status === "suspended") await performUnsuspend({ profileId: profile._id, adminId: adminId || flagged[0].suspendedBy });
    await Membership.updateMany({ _id: { $in: flagged.map((r) => r._id) } }, { $set: { arenaSuspended: false } });
  }
};

/** Used from arena requests: never throws. */
export const syncArenaAccessForUser = async (userId) => {
  try {
    const user = await User.findById(userId).select("email").lean();
    if (user?.email) await syncArenaAccess(user.email);
  } catch (error) {
    console.error("[membership] arena sync failed:", error.message);
  }
};

export const suspendMembership = async ({ id, adminId, reason }) => {
  const row = await Membership.findOneAndUpdate(
    { _id: id, status: "active" },
    { $set: { status: "suspended", suspendedAt: new Date(), suspendedBy: adminId, suspendReason: reason } },
    { new: true }
  );
  if (!row) {
    const exists = await Membership.exists({ _id: id });
    throw new ArenaError(exists ? 409 : 404, exists ? "ALREADY_SUSPENDED" : "NOT_FOUND", exists ? "This membership is already suspended." : "Membership not found.");
  }
  await syncArenaAccess(row.email, { adminId });
  return Membership.findById(id).lean();
};

export const unsuspendMembership = async ({ id, adminId }) => {
  const row = await Membership.findOneAndUpdate(
    { _id: id, status: "suspended" },
    { $set: { status: "active", suspendedAt: null, suspendedBy: null, suspendReason: "" } },
    { new: true }
  );
  if (!row) {
    const exists = await Membership.exists({ _id: id });
    throw new ArenaError(exists ? 409 : 404, exists ? "NOT_SUSPENDED" : "NOT_FOUND", exists ? "This membership is not suspended." : "Membership not found.");
  }
  await syncArenaAccess(row.email, { adminId });
  return Membership.findById(id).lean();
};

/*
  Permanently remove a membership record. They lose the pack benefits (Books tab, suggestions,
  new-book emails) and any matches that were still waiting for them. Matches ALREADY added to
  their arena account stay there (adjust them in Prep Arena admin if needed).
*/
export const deleteMembership = async ({ id, adminId }) => {
  const row = await Membership.findById(id).lean();
  if (!row) throw new ArenaError(404, "NOT_FOUND", "Membership not found.");

  await Membership.deleteOne({ _id: id });

  // If this membership was what suspended their arena profile, hand that over or lift it.
  if (row.arenaSuspended) {
    const other = await Membership.findOne({ email: row.email, status: "suspended" }).select("_id").lean();
    if (other) {
      await Membership.updateOne({ _id: other._id }, { $set: { arenaSuspended: true } });
    } else {
      const profile = await profileForEmail(row.email);
      if (profile?.status === "suspended") await performUnsuspend({ profileId: profile._id, adminId });
    }
  }

  return { email: row.email, bookTitle: row.bookTitle };
};
