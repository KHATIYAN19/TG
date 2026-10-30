
import VisitorSession from "../models/analytics/VisitorSession.js";
import PageVisit from "../models/analytics/PageVisit.js";
import AnalyticsEvent from "../models/analytics/AnalyticsEvent.js";
import { getLiveSessions } from "../config/analyticsRedis.js";

const TIMEZONE = "Asia/Kolkata";

const PERIODS = {
  "6h":   { ms: 6 * 3600000, unit: "hour" },
  "24h":  { ms: 24 * 3600000, unit: "hour" },
  "7d":   { ms: 7 * 86400000, unit: "day" },
  "30d":  { ms: 30 * 86400000, unit: "day" },
  "180d": { ms: 180 * 86400000, unit: "week" },
  "365d": { ms: 365 * 86400000, unit: "month" },
};

export function getPeriod(value = "7d") {
  if (!Object.hasOwn(PERIODS, value)) {
    const err = new Error("Invalid period");
    err.status = 400;
    throw err;
  }

  const config = PERIODS[value];
  const end = new Date();
  const start = new Date(end.getTime() - config.ms);

  return {
    period: value,
    start,
    end,
    unit: config.unit,
  };
}

function dateMatch(field, range) {
  return {
    [field]: {
      $gte: range.start,
      $lt: range.end,
    },
  };
}

function round(value, digits = 2) {
  return Number((value || 0).toFixed(digits));
}

async function aggregate(Model, pipeline) {
  return Model.aggregate(pipeline)
    .allowDiskUse(true)
    .option({ maxTimeMS: 30000 });
}

// Overall stats for selected period
export async function getOverview(period) {
  const range = getPeriod(period);
  const match = dateMatch("enteredAt", range);
  const sessionMatch = dateMatch("startedAt", range);

  const [
    pageStats,
    uniqueVisitors,
    sessions,
    newSessions,
  ] = await Promise.all([
    aggregate(PageVisit, [
      { $match: match },
      {
        $group: {
          _id: null,
          totalPageViews: { $sum: 1 },
          totalScroll: {
            $sum: "$maxScrollPercentage",
          },
          totalEngagement: {
            $sum: "$activeTimeSeconds",
          },
          fullScrolls: {
            $sum: {
              $cond: [
                { $gte: ["$maxScrollPercentage", 90] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),

    aggregate(PageVisit, [
      { $match: match },
      { $group: { _id: "$visitorId" } },
      { $count: "count" },
    ]),

    aggregate(PageVisit, [
      { $match: match },
      { $group: { _id: "$sessionId" } },
      { $count: "count" },
    ]),

    VisitorSession.countDocuments(sessionMatch),
  ]);

  const stats = pageStats[0] || {};
  const views = stats.totalPageViews || 0;
  const visitors = uniqueVisitors[0]?.count || 0;
  const sessionCount = sessions[0]?.count || 0;

  return {
    period: range.period,
    start: range.start,
    end: range.end,

    totalPageViews: views,
    uniqueVisitors: visitors,
    uniqueSessions: sessionCount,
    sessionsStarted: newSessions,

    pagesPerSession: sessionCount
      ? round(views / sessionCount)
      : 0,

    avgScrollPercentage: views
      ? round(stats.totalScroll / views)
      : 0,

    avgEngagementSeconds: views
      ? round(stats.totalEngagement / views)
      : 0,

    pagesReached90Percent: stats.fullScrolls || 0,

    scrollCompletionRate: views
      ? round((stats.fullScrolls / views) * 100)
      : 0,
  };
}

// Group page views and unique visitors by time bucket
export async function getTrafficTimeline(period) {
  const range = getPeriod(period);

  const result = await aggregate(PageVisit, [
    {
      $match: dateMatch("enteredAt", range),
    },
    {
      $group: {
        _id: {
          bucket: {
            $dateTrunc: {
              date: "$enteredAt",
              unit: range.unit,
              timezone: TIMEZONE,
              ...(range.unit === "week"
                ? { startOfWeek: "monday" }
                : {}),
            },
          },
          visitorId: "$visitorId",
        },
        pageViews: { $sum: 1 },
        sessionIds: { $addToSet: "$sessionId" },
      },
    },
    {
      $group: {
        _id: "$_id.bucket",
        pageViews: { $sum: "$pageViews" },
        uniqueVisitors: { $sum: 1 },
        sessionArrays: { $push: "$sessionIds" },
      },
    },
    {
      $project: {
        _id: 0,
        timestamp: "$_id",
        pageViews: 1,
        uniqueVisitors: 1,
        uniqueSessions: {
          $size: {
            $reduce: {
              input: "$sessionArrays",
              initialValue: [],
              in: {
                $setUnion: ["$$value", "$$this"],
              },
            },
          },
        },
      },
    },
    { $sort: { timestamp: 1 } },
  ]);

  return {
    period: range.period,
    granularity: range.unit,
    timezone: TIMEZONE,
    data: result,
  };
}

// Rank routes by total traffic
export async function getTopPages(period, options = {}) {
  const range = getPeriod(period);
  const limit = Math.min(
    100,
    Math.max(1, Number(options.limit) || 20)
  );

  const sortOptions = {
    views: { totalViews: -1 },
    unique: { uniqueVisitors: -1 },
    scroll: { avgScrollPercentage: -1 },
    engagement: { avgEngagementSeconds: -1 },
  };

  const sort = sortOptions[options.sort] ||
    sortOptions.views;

  const result = await aggregate(PageVisit, [
    {
      $match: dateMatch("enteredAt", range),
    },
    {
      $group: {
        _id: {
          page: "$page",
          visitorId: "$visitorId",
        },
        views: { $sum: 1 },
        totalScroll: {
          $sum: "$maxScrollPercentage",
        },
        totalEngagement: {
          $sum: "$activeTimeSeconds",
        },
        sessions: { $addToSet: "$sessionId" },
        completed: {
          $sum: {
            $cond: [
              { $gte: ["$maxScrollPercentage", 90] },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id.page",
        totalViews: { $sum: "$views" },
        uniqueVisitors: { $sum: 1 },
        scrollSum: { $sum: "$totalScroll" },
        engagementSum: {
          $sum: "$totalEngagement",
        },
        completed: { $sum: "$completed" },
      },
    },
    {
      $addFields: {
        avgScrollPercentage: {
          $round: [
            { $divide: ["$scrollSum", "$totalViews"] },
            2,
          ],
        },
        avgEngagementSeconds: {
          $round: [
            {
              $divide: [
                "$engagementSum",
                "$totalViews",
              ],
            },
            2,
          ],
        },
        scrollCompletionRate: {
          $round: [
            {
              $multiply: [
                {
                  $divide: [
                    "$completed",
                    "$totalViews",
                  ],
                },
                100,
              ],
            },
            2,
          ],
        },
      },
    },
    {
      $project: {
        _id: 0,
        page: "$_id",
        totalViews: 1,
        uniqueVisitors: 1,
        avgScrollPercentage: 1,
        avgEngagementSeconds: 1,
        scrollCompletionRate: 1,
      },
    },
    { $sort: { ...sort, page: 1 } },
    { $limit: limit },
  ]);

  return {
    period: range.period,
    sort: options.sort || "views",
    data: result,
  };
}

// Page-specific report
export async function getPageDetails(period, page) {
  if (
    typeof page !== "string" ||
    !page.startsWith("/") ||
    page.startsWith("//") ||
    page.length > 300
  ) {
    const err = new Error("Invalid page");
    err.status = 400;
    throw err;
  }

  const range = getPeriod(period);

  const [stats, unique, events] = await Promise.all([
    aggregate(PageVisit, [
      {
        $match: {
          ...dateMatch("enteredAt", range),
          page,
        },
      },
      {
        $group: {
          _id: null,
          views: { $sum: 1 },
          avgScroll: {
            $avg: "$maxScrollPercentage",
          },
          avgEngagement: {
            $avg: "$activeTimeSeconds",
          },
          maxScroll: {
            $max: "$maxScrollPercentage",
          },
          visitors90: {
            $sum: {
              $cond: [
                {
                  $gte: [
                    "$maxScrollPercentage",
                    90,
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),

    aggregate(PageVisit, [
      {
        $match: {
          ...dateMatch("enteredAt", range),
          page,
        },
      },
      { $group: { _id: "$visitorId" } },
      { $count: "count" },
    ]),

    aggregate(AnalyticsEvent, [
      {
        $match: {
          ...dateMatch("createdAt", range),
          page,
        },
      },
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  const s = stats[0] || {};
  return {
    period: range.period,
    page,
    totalViews: s.views || 0,
    uniqueVisitors: unique[0]?.count || 0,
    avgScrollPercentage: round(s.avgScroll),
    avgEngagementSeconds: round(s.avgEngagement),
    maxScrollPercentage: s.maxScroll || 0,
    pageViewsReached90Percent: s.visitors90 || 0,
    events,
  };
}

// Referral code report
export async function getReferralReport(period) {
  const range = getPeriod(period);

  const result = await aggregate(PageVisit, [
    {
      $match: dateMatch("enteredAt", range),
    },
    {
      $group: {
        _id: {
          referralCode: {
            $ifNull: ["$referralCode", "DIRECT"],
          },
          visitorId: "$visitorId",
        },
        pageViews: { $sum: 1 },
        sessions: { $addToSet: "$sessionId" },
      },
    },
    {
      $group: {
        _id: "$_id.referralCode",
        uniqueVisitors: { $sum: 1 },
        pageViews: { $sum: "$pageViews" },
      },
    },
    {
      $project: {
        _id: 0,
        referralCode: "$_id",
        pageViews: 1,
        uniqueVisitors: 1,
      },
    },
    { $sort: { pageViews: -1 } },
    { $limit: 100 },
  ]);

  return {
    period: range.period,
    data: result,
  };
}

// Device breakdown based on sessions started
export async function getDeviceReport(period) {
  const range = getPeriod(period);

  const report = async (field) =>
    aggregate(VisitorSession, [
      {
        $match: dateMatch("startedAt", range),
      },
      {
        $group: {
          _id: {
            $ifNull: [field, "Unknown"],
          },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { sessions: -1 } },
      { $limit: 30 },
    ]);

  const [devices, browsers, systems] =
    await Promise.all([
      report("$device.type"),
      report("$device.browser"),
      report("$device.os"),
    ]);

  return {
    period: range.period,
    devices,
    browsers,
    operatingSystems: systems,
  };
}

// Live visitors: independent of historical period
export async function getLiveReport() {
  const sessions = await getLiveSessions();

  const pages = {};
  const referrals = {};
  const devices = {};
  const uniqueVisitors = new Set();

  for (const session of sessions) {
    if (!session?.sessionId) continue;

    uniqueVisitors.add(session.visitorId);

    const page = session.page || "/";

    pages[page] = (pages[page] || 0) + 1;

    const referral = session.referralCode || "DIRECT";
    referrals[referral] =
      (referrals[referral] || 0) + 1;

    const device = session.device?.type || "unknown";
    devices[device] = (devices[device] || 0) + 1;
  }

  return {
    activeSessions: sessions.length,
    uniqueActiveVisitors: uniqueVisitors.size,
    activePages: Object.keys(pages).length,
    pages: Object.entries(pages)
      .map(([page, activeSessions]) => ({
        page,
        activeSessions,
      }))
      .sort((a, b) =>
        b.activeSessions - a.activeSessions
      ),
    referrals,
    devices,
    sessions,
    timestamp: new Date(),
  };
}
