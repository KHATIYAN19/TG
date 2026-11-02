
import mongoose from "mongoose";
import UserActivity from "../models/UserActivity.js";

const fail = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

// The admin user-management view only ever shows the latest few
// activities per user. The limit is enforced here, not just in the UI.
const ADMIN_ACTIVITY_LIMIT = 5;

const getActivities = async (
  req,
  res,
  userId,
  { fixedLimit = null } = {}
) => {
  const page = fixedLimit
    ? 1
    : Math.max(
        1,
        parseInt(req.query.page, 10) || 1
      );

  const limit = fixedLimit
    ? fixedLimit
    : Math.min(
        100,
        Math.max(
          1,
          parseInt(req.query.limit, 10) || 20
        )
      );

  const filter = {
    user: userId,
  };

  if (
    typeof req.query.action === "string" &&
    /^[A-Z_]{3,80}$/.test(req.query.action)
  ) {
    filter.action = req.query.action;
  }

  const [activities, total] = await Promise.all([
    UserActivity.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("actor", "name email")
      .lean(),

    UserActivity.countDocuments(filter),
  ]);

  return res.json({
    success: true,
    activities,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

export const getMyActivities = async (
  req, res
) => {
  try {
    return await getActivities(
      req,
      res,
      req.user.userId
    );
  } catch (error) {
    console.error("My activity:", error);
    return fail(
      res, 500,
      "Unable to fetch activity history"
    );
  }
};

export const getUserActivities = async (
  req, res
) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return fail(res, 400, "Invalid user ID");
    }

    return await getActivities(
      req,
      res,
      userId,
      { fixedLimit: ADMIN_ACTIVITY_LIMIT }
    );
  } catch (error) {
    console.error("User activity:", error);
    return fail(
      res, 500,
      "Unable to fetch activity history"
    );
  }
};


/**
 * DELETE /api/admin/users/:userId/activities
 *
 * Permanently deletes every recorded activity for one user.
 * Admin only: the route is mounted behind auth + isAdmin.
 */
export const clearUserActivities = async (
  req, res
) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return fail(res, 400, "Invalid user ID");
    }

    const result = await UserActivity.deleteMany({
      user: userId,
    });

    console.log(
      `[ACTIVITY CLEARED] user=${userId} deleted=${result.deletedCount} by=${req.user?.userId || "unknown"}`
    );

    return res.json({
      success: true,
      message:
        result.deletedCount > 0
          ? `Deleted ${result.deletedCount} activit${
              result.deletedCount === 1 ? "y" : "ies"
            }.`
          : "There were no activities to delete.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear activities:", error);
    return fail(
      res, 500,
      "Unable to delete activities"
    );
  }
};
