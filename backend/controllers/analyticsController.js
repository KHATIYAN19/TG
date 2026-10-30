
import Visitor from "../models/analytics/Visitor.js";
import VisitorSession from "../models/analytics/VisitorSession.js";
import PageVisit from "../models/analytics/PageVisit.js";
import AnalyticsEvent from "../models/analytics/AnalyticsEvent.js";

import * as analytics from "../services/analyticsService.js";

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

const respond = (fn) =>
  asyncHandler(async (req, res) => {
    const result = await fn(req);
    res.json({ success: true, data: result });
  });

export const pageViewController =
  respond(analytics.startPageVisit);

export const heartbeatController =
  respond(analytics.heartbeat);

export const engagementController =
  respond(analytics.updateEngagement);

export const eventController =
  respond(analytics.trackEvent);

export const pageExitController =
  respond(analytics.endPageVisit);

export const sessionEndController =
  respond(analytics.endSession);

export const liveController =
  respond(analytics.getLiveAnalytics);

// Validate date filter.
function dateRange(req) {
  const days = Math.min(
    Math.max(Number(req.query.days) || 7, 1),
    90
  );

  return {
    $gte: new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ),
  };
}

// Dashboard summary.
export const overviewController = asyncHandler(
  async (req, res) => {
    const range = dateRange(req);

    const [
      visitors,
      sessions,
      pageViews,
      uniqueVisitors,
      topPages,
      topEvents,
    ] = await Promise.all([
      Visitor.countDocuments({
        firstSeenAt: range,
      }),

      VisitorSession.countDocuments({
        startedAt: range,
      }),

      PageVisit.countDocuments({
        enteredAt: range,
      }),

      VisitorSession.distinct("visitorId", {
        startedAt: range,
      }),

      PageVisit.aggregate([
        { $match: { enteredAt: range } },
        {
          $group: {
            _id: "$page",
            visits: { $sum: 1 },
            avgScroll: {
              $avg: "$maxScrollPercentage",
            },
            avgActiveSeconds: {
              $avg: "$activeTimeSeconds",
            },
          },
        },
        { $sort: { visits: -1 } },
        { $limit: 20 },
      ]),

      AnalyticsEvent.aggregate([
        { $match: { createdAt: range } },
        {
          $group: {
            _id: "$eventType",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        newVisitors: visitors,
        uniqueVisitors: uniqueVisitors.length,
        sessions,
        pageViews,
        topPages,
        topEvents,
      },
    });
  }
);

// Referral breakdown.
export const referralController = asyncHandler(
  async (req, res) => {
    const range = dateRange(req);

    const results = await VisitorSession.aggregate([
      {
        $match: {
          startedAt: range,
        },
      },
      {
        $group: {
          _id: {
            $ifNull: ["$referralCode", "DIRECT"],
          },
          sessions: { $sum: 1 },
          visitorIds: { $addToSet: "$visitorId" },
        },
      },
      {
        $project: {
          _id: 0,
          referralCode: "$_id",
          sessions: 1,
          uniqueVisitors: {
            $size: "$visitorIds",
          },
        },
      },
      { $sort: { sessions: -1 } },
      { $limit: 100 },
    ]);

    res.json({
      success: true,
      data: results,
    });
  }
);

// Paginated browser list.
export const visitorsController = asyncHandler(
  async (req, res) => {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      50,
      Math.max(
        1,
        Number.parseInt(req.query.limit, 10) || 20
      )
    );

    const [visitors, total] = await Promise.all([
      Visitor.find({})
        .sort({ lastSeenAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-__v")
        .lean(),

      Visitor.countDocuments(),
    ]);

    res.json({
      success: true,
      data: visitors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);

// Individual visitor journey.
export const visitorJourneyController = asyncHandler(
  async (req, res) => {
    const visitorId = req.params.visitorId;

    const visitor = await Visitor.findOne({
      visitorId,
    }).lean();

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    const sessions = await VisitorSession.find({
      visitorId,
    })
      .sort({ startedAt: -1 })
      .limit(20)
      .lean();

    const sessionIds = sessions.map(
      (session) => session.sessionId
    );

    const [pageVisits, events] = await Promise.all([
      PageVisit.find({
        visitorId,
        sessionId: { $in: sessionIds },
      })
        .sort({ enteredAt: -1 })
        .limit(200)
        .lean(),

      AnalyticsEvent.find({
        visitorId,
        sessionId: { $in: sessionIds },
      })
        .sort({ createdAt: -1 })
        .limit(200)
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        visitor,
        sessions,
        pageVisits,
        events,
      },
    });
  }
);

// Daily traffic chart.
export const dailyTrafficController = asyncHandler(
  async (req, res) => {
    const range = dateRange(req);

    const result = await PageVisit.aggregate([
      {
        $match: {
          enteredAt: range,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$enteredAt",
              timezone: "Asia/Kolkata",
            },
          },
          pageViews: { $sum: 1 },
          visitors: {
            $addToSet: "$visitorId",
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          pageViews: 1,
          uniqueVisitors: {
            $size: "$visitors",
          },
        },
      },
      { $sort: { date: 1 } },
    ]);

    res.json({
      success: true,
      data: result,
    });
  }
);
