
import mongoose from "mongoose";
import UserActivity from "../models/UserActivity.js";

const fail = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

const getActivities = async (
  req,
  res,
  userId
) => {
  const page = Math.max(
    1,
    parseInt(req.query.page, 10) || 1
  );

  const limit = Math.min(
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
      userId
    );
  } catch (error) {
    console.error("User activity:", error);
    return fail(
      res, 500,
      "Unable to fetch activity history"
    );
  }
};
