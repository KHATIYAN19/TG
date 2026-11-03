import ArenaCoupon from "../../models/arena/ArenaCoupon.js";
import ArenaCouponRedemption from "../../models/arena/ArenaCouponRedemption.js";
import { ArenaError } from "./errors.js";

export const normalizeCode = (code) =>
  typeof code === "string" ? code.trim().toUpperCase() : "";

/**
 * Loads a coupon and verifies every rule that can be checked
 * without side effects. Throws ArenaError on any failure.
 */
export const findValidCoupon = async (rawCode, userId) => {
  const code = normalizeCode(rawCode);

  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
    throw new ArenaError(400, "COUPON_INVALID", "Enter a valid coupon code");
  }

  const coupon = await ArenaCoupon.findOne({ code, active: true }).lean();
  if (!coupon) throw new ArenaError(404, "COUPON_INVALID", "This coupon is not valid");

  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) {
    throw new ArenaError(400, "COUPON_NOT_STARTED", "This coupon is not active yet");
  }
  if (coupon.validUntil && coupon.validUntil < now) {
    throw new ArenaError(400, "COUPON_EXPIRED", "This coupon has expired");
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    throw new ArenaError(400, "COUPON_EXHAUSTED", "This coupon has been fully redeemed");
  }

  const used = await ArenaCouponRedemption.countDocuments({
    coupon: coupon._id,
    user: userId,
    status: { $in: ["reserved", "redeemed"] },
  });
  if (used >= coupon.perUserLimit) {
    throw new ArenaError(400, "COUPON_ALREADY_USED", "You have already used this coupon");
  }

  return coupon;
};

/**
 * Atomically reserves one use. The conditional update is what
 * prevents two simultaneous checkouts from exceeding usageLimit.
 */
export const reserveCoupon = async ({ coupon, userId, entryId, discountPaise }) => {
  const updated = await ArenaCoupon.findOneAndUpdate(
    {
      _id: coupon._id,
      active: true,
      $or: [{ usageLimit: null }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }],
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );

  if (!updated) {
    throw new ArenaError(400, "COUPON_EXHAUSTED", "This coupon has been fully redeemed");
  }

  try {
    await ArenaCouponRedemption.create({
      coupon: coupon._id,
      user: userId,
      entry: entryId,
      discountPaise,
    });
  } catch (error) {
    await ArenaCoupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: -1 } });
    throw error;
  }
};

export const redeemCoupon = (entryId) =>
  ArenaCouponRedemption.updateOne(
    { entry: entryId, status: "reserved" },
    { $set: { status: "redeemed" } }
  );

/** Idempotent: only the first release decrements the counter. */
export const releaseCoupon = async (entryId) => {
  const redemption = await ArenaCouponRedemption.findOneAndUpdate(
    { entry: entryId, status: "reserved" },
    { $set: { status: "released" } }
  );

  if (redemption) {
    await ArenaCoupon.updateOne(
      { _id: redemption.coupon, usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } }
    );
  }
};
