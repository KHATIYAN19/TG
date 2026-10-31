import Visitor from "../models/analytics/Visitor.js";
import VisitorSession from "../models/analytics/VisitorSession.js";
import PageVisit from "../models/analytics/PageVisit.js";
import AnalyticsEvent from "../models/analytics/AnalyticsEvent.js";
import ActiveUserSnapshot from "../models/analytics/ActiveUserSnapshot.js";

import { getLiveSessions } from "../config/analyticsRedis.js";

const TIMEZONE = "Asia/Kolkata";
const IST_OFFSET = 330 * 60 * 1000; // India has no DST
const HOUR = 3600000;
const DAY = 86400000;

const PRESETS = {
  "1h": HOUR,
  "6h": 6 * HOUR,
  "24h": DAY,
  "7d": 7 * DAY,
  "30d": 30 * DAY,
  "90d": 90 * DAY,
  "180d": 180 * DAY,
  "365d": 365 * DAY,
};

const badRequest = (message) => {
  const err = new Error(message);
  err.status = 400;
  return err;
};

const round = (value, digits = 2) =>
  Number((value || 0).toFixed(digits));

const pct = (current, previous) =>
  previous ? round(((current - previous) / previous) * 100) : null;

/* =====================================================
   DATE RANGES (all calendar logic is in IST)
===================================================== */

function startOfDayIST(ms) {
  const d = new Date(ms + IST_OFFSET);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime() - IST_OFFSET;
}

function parseISTDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    throw badRequest(`${label} must be YYYY-MM-DD`);
  }

  const ms = Date.parse(`${value}T00:00:00.000Z`);
  if (Number.isNaN(ms)) throw badRequest(`Invalid ${label}`);

  return ms - IST_OFFSET;
}

function pickUnit(durationMs) {
  if (durationMs <= 2 * DAY) return "hour";
  if (durationMs <= 93 * DAY) return "day";
  if (durationMs <= 200 * DAY) return "week";
  return "month";
}

// period: today | yesterday | 1h | 6h | 24h | 7d | 30d | 90d |
//         180d | 365d | custom (needs from & to, YYYY-MM-DD)
export function resolveRange(query = {}) {
  const now = Date.now();
  const period = query.period || (query.from ? "custom" : "7d");

  let start;
  let end;

  if (period === "today") {
    start = startOfDayIST(now);
    end = now;
  } else if (period === "yesterday") {
    end = startOfDayIST(now);
    start = end - DAY;
  } else if (period === "custom") {
    start = parseISTDate(query.from, "from");
    end = parseISTDate(query.to || query.from, "to") + DAY;
    end = Math.min(end, now);

    if (end <= start) throw badRequest("Invalid date range");
    if (end - start > 366 * DAY) {
      throw badRequest("Range cannot exceed 366 days");
    }
  } else if (Object.hasOwn(PRESETS, period)) {
    end = now;
    start = now - PRESETS[period];
  } else {
    throw badRequest("Invalid period");
  }

  const length = end - start;

  return {
    period,
    start: new Date(start),
    end: new Date(end),
    unit: pickUnit(length),
    previous: {
      start: new Date(start - length),
      end: new Date(start),
    },
  };
}

function between(field, range) {
  return { [field]: { $gte: range.start, $lt: range.end } };
}

// Bucket helpers used to zero-fill chart series.
function truncIST(ms, unit) {
  const d = new Date(ms + IST_OFFSET);

  if (unit === "hour") d.setUTCMinutes(0, 0, 0);
  else d.setUTCHours(0, 0, 0, 0);

  if (unit === "week") {
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  }

  if (unit === "month") d.setUTCDate(1);

  return d.getTime() - IST_OFFSET;
}

function nextBucket(ms, unit) {
  if (unit === "hour") return ms + HOUR;
  if (unit === "day") return ms + DAY;
  if (unit === "week") return ms + 7 * DAY;

  const d = new Date(ms + IST_OFFSET);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.getTime() - IST_OFFSET;
}

function fillBuckets(range, rows, empty) {
  const byTime = new Map(
    rows.map((row) => [row.timestamp.getTime(), row])
  );

  const out = [];
  let cursor = truncIST(range.start.getTime(), range.unit);

  while (cursor < range.end.getTime()) {
    out.push(
      byTime.get(cursor) || {
        timestamp: new Date(cursor),
        ...empty,
      }
    );
    cursor = nextBucket(cursor, range.unit);
  }

  return out;
}

const bucketExpr = (field, range) => ({
  $dateTrunc: {
    date: field,
    unit: range.unit,
    timezone: TIMEZONE,
    ...(range.unit === "week" ? { startOfWeek: "monday" } : {}),
  },
});

async function aggregate(Model, pipeline) {
  return Model.aggregate(pipeline)
    .allowDiskUse(true)
    .option({ maxTimeMS: 30000 });
}

// Session length: stored once ended, live estimate before.
const SESSION_DURATION = {
  $ifNull: [
    "$durationSeconds",
    {
      $divide: [
        { $subtract: ["$lastSeenAt", "$startedAt"] },
        1000,
      ],
    },
  ],
};

const COMPLETED = {
  $cond: [{ $gte: ["$maxScrollPercentage", 90] }, 1, 0],
};

// Generic "top N by label" over any collection.
async function breakdown(Model, match, labelExpr, limit = 30) {
  return aggregate(Model, [
    { $match: match },
    {
      $group: {
        _id: { $ifNull: [labelExpr, "Unknown"] },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    { $limit: limit },
    { $project: { _id: 0, label: "$_id", count: 1 } },
  ]);
}

/* =====================================================
   OVERVIEW (with previous-period comparison)
===================================================== */

async function overviewFor(window) {
  const [pageStats, sessionStats, events] =
    await Promise.all([
      aggregate(PageVisit, [
        { $match: between("enteredAt", window) },
        {
          $group: {
            _id: null,
            pageViews: { $sum: 1 },
            scroll: { $sum: "$maxScrollPercentage" },
            engagement: { $sum: "$activeTimeSeconds" },
            completed: { $sum: COMPLETED },
          },
        },
      ]),

      aggregate(VisitorSession, [
        { $match: between("startedAt", window) },
        {
          $group: {
            _id: "$visitorId",
            sessions: { $sum: 1 },
            isNew: {
              $max: { $cond: ["$isNewVisitor", 1, 0] },
            },
            ended: {
              $sum: {
                $cond: [{ $eq: ["$status", "ENDED"] }, 1, 0],
              },
            },
            bounces: { $sum: { $cond: ["$isBounce", 1, 0] } },
            duration: { $sum: SESSION_DURATION },
          },
        },
        {
          $group: {
            _id: null,
            uniqueVisitors: { $sum: 1 },
            newVisitors: { $sum: "$isNew" },
            sessions: { $sum: "$sessions" },
            ended: { $sum: "$ended" },
            bounces: { $sum: "$bounces" },
            duration: { $sum: "$duration" },
          },
        },
      ]),

      AnalyticsEvent.countDocuments(between("createdAt", window)),
    ]);

  const p = pageStats[0] || {};
  const s = sessionStats[0] || {};
  const views = p.pageViews || 0;
  const sessions = s.sessions || 0;
  const visitors = s.uniqueVisitors || 0;

  return {
    pageViews: views,
    uniqueVisitors: visitors,
    newVisitors: s.newVisitors || 0,
    returningVisitors: visitors - (s.newVisitors || 0),
    sessions,
    events,
    pagesPerSession: sessions ? round(views / sessions) : 0,
    avgSessionDurationSeconds: sessions
      ? round(s.duration / sessions)
      : 0,
    bounceRate: s.ended ? round((s.bounces / s.ended) * 100) : 0,
    avgScrollPercentage: views ? round(p.scroll / views) : 0,
    avgEngagementSeconds: views ? round(p.engagement / views) : 0,
    scrollCompletionRate: views
      ? round((p.completed / views) * 100)
      : 0,
  };
}

export async function getOverview(range) {
  const [current, previous] = await Promise.all([
    overviewFor(range),
    overviewFor(range.previous),
  ]);

  const change = {};
  for (const key of Object.keys(current)) {
    change[key] = pct(current[key], previous[key]);
  }

  return {
    period: range.period,
    start: range.start,
    end: range.end,
    current,
    previous,
    changePercent: change,
  };
}

/* =====================================================
   TIMELINE (zero-filled, ready for line/bar charts)
===================================================== */

export async function getTrafficTimeline(range, page) {
  const match = between("enteredAt", range);

  if (page) match.page = validatePage(page);

  const rows = await aggregate(PageVisit, [
    { $match: match },
    {
      $group: {
        _id: {
          bucket: bucketExpr("$enteredAt", range),
          visitorId: "$visitorId",
        },
        pageViews: { $sum: 1 },
        sessions: { $addToSet: "$sessionId" },
        isNew: {
          $max: { $cond: ["$isNewVisitor", 1, 0] },
        },
      },
    },
    {
      $group: {
        _id: "$_id.bucket",
        pageViews: { $sum: "$pageViews" },
        uniqueVisitors: { $sum: 1 },
        newVisitors: { $sum: "$isNew" },
        uniqueSessions: { $sum: { $size: "$sessions" } },
      },
    },
    {
      $project: {
        _id: 0,
        timestamp: "$_id",
        pageViews: 1,
        uniqueVisitors: 1,
        newVisitors: 1,
        returningVisitors: {
          $subtract: ["$uniqueVisitors", "$newVisitors"],
        },
        uniqueSessions: 1,
      },
    },
    { $sort: { timestamp: 1 } },
  ]);

  return {
    period: range.period,
    granularity: range.unit,
    timezone: TIMEZONE,
    data: fillBuckets(range, rows, {
      pageViews: 0,
      uniqueVisitors: 0,
      newVisitors: 0,
      returningVisitors: 0,
      uniqueSessions: 0,
    }),
  };
}

/* =====================================================
   PAGES / ROUTES
===================================================== */

function validatePage(page) {
  if (
    typeof page !== "string" ||
    !page.startsWith("/") ||
    page.startsWith("//") ||
    page.length > 300
  ) {
    throw badRequest("Invalid page");
  }
  return page;
}

export async function getTopPages(range, options = {}) {
  const limit = Math.min(
    200,
    Math.max(1, Number(options.limit) || 20)
  );

  const sortOptions = {
    views: { totalViews: -1 },
    unique: { uniqueVisitors: -1 },
    scroll: { avgScrollPercentage: -1 },
    engagement: { avgEngagementSeconds: -1 },
  };

  const sortKey = Object.hasOwn(sortOptions, options.sort)
    ? options.sort
    : "views";

  const data = await aggregate(PageVisit, [
    { $match: between("enteredAt", range) },
    {
      $group: {
        _id: { page: "$page", visitorId: "$visitorId" },
        views: { $sum: 1 },
        scroll: { $sum: "$maxScrollPercentage" },
        engagement: { $sum: "$activeTimeSeconds" },
        completed: { $sum: COMPLETED },
        entries: {
          $sum: { $cond: ["$isEntry", 1, 0] },
        },
      },
    },
    {
      $group: {
        _id: "$_id.page",
        totalViews: { $sum: "$views" },
        uniqueVisitors: { $sum: 1 },
        scrollSum: { $sum: "$scroll" },
        engagementSum: { $sum: "$engagement" },
        completed: { $sum: "$completed" },
        entries: { $sum: "$entries" },
      },
    },
    {
      $project: {
        _id: 0,
        page: "$_id",
        totalViews: 1,
        uniqueVisitors: 1,
        entries: 1,
        avgScrollPercentage: {
          $round: [
            { $divide: ["$scrollSum", "$totalViews"] },
            2,
          ],
        },
        avgEngagementSeconds: {
          $round: [
            { $divide: ["$engagementSum", "$totalViews"] },
            2,
          ],
        },
        scrollCompletionRate: {
          $round: [
            {
              $multiply: [
                { $divide: ["$completed", "$totalViews"] },
                100,
              ],
            },
            2,
          ],
        },
      },
    },
    { $sort: { ...sortOptions[sortKey], page: 1 } },
    { $limit: limit },
  ]);

  return { period: range.period, sort: sortKey, data };
}

export async function getPageDetails(range, page) {
  validatePage(page);

  const match = { ...between("enteredAt", range), page };

  const [
    stats,
    unique,
    events,
    timeline,
    referrals,
    devices,
    countries,
    previousPages,
    queryParams,
  ] = await Promise.all([
    aggregate(PageVisit, [
      { $match: match },
      {
        $group: {
          _id: null,
          views: { $sum: 1 },
          avgScroll: { $avg: "$maxScrollPercentage" },
          avgEngagement: { $avg: "$activeTimeSeconds" },
          maxScroll: { $max: "$maxScrollPercentage" },
          completed: { $sum: COMPLETED },
        },
      },
    ]),
    aggregate(PageVisit, [
      { $match: match },
      { $group: { _id: "$visitorId" } },
      { $count: "count" },
    ]),
    aggregate(AnalyticsEvent, [
      { $match: { ...between("createdAt", range), page } },
      { $group: { _id: "$eventType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    getTrafficTimeline(range, page),
    breakdown(PageVisit, match, { $ifNull: ["$referralCode", "DIRECT"] }, 15),
    breakdown(PageVisit, match, "$deviceType", 10),
    breakdown(PageVisit, match, "$country", 15),
    breakdown(PageVisit, match, "$previousPage", 15),
    getQueryParams(range, { page }),
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
    pageViewsReached90Percent: s.completed || 0,
    events,
    timeline: timeline.data,
    granularity: timeline.granularity,
    referrals,
    devices,
    countries,
    previousPages,
    queryParams: queryParams.data,
  };
}

// Where sessions start and end.
export async function getEntryExitPages(range, limit = 20) {
  const max = Math.min(100, Math.max(1, Number(limit) || 20));
  const match = between("startedAt", range);

  const [entries, exits] = await Promise.all([
    aggregate(VisitorSession, [
      { $match: match },
      {
        $group: {
          _id: "$landingPage",
          sessions: { $sum: 1 },
          bounces: { $sum: { $cond: ["$isBounce", 1, 0] } },
          ended: {
            $sum: {
              $cond: [{ $eq: ["$status", "ENDED"] }, 1, 0],
            },
          },
          duration: { $sum: SESSION_DURATION },
        },
      },
      { $sort: { sessions: -1 } },
      { $limit: max },
      {
        $project: {
          _id: 0,
          page: "$_id",
          sessions: 1,
          bounceRate: {
            $cond: [
              { $gt: ["$ended", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$bounces", "$ended"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
          avgSessionDurationSeconds: {
            $round: [{ $divide: ["$duration", "$sessions"] }, 0],
          },
        },
      },
    ]),
    aggregate(VisitorSession, [
      { $match: { ...match, status: "ENDED" } },
      { $group: { _id: "$exitPage", exits: { $sum: 1 } } },
      { $sort: { exits: -1 } },
      { $limit: max },
      { $project: { _id: 0, page: "$_id", exits: 1 } },
    ]),
  ]);

  return { period: range.period, entryPages: entries, exitPages: exits };
}

/* =====================================================
   ACQUISITION: ?ref=, referrers, UTM, raw query params
===================================================== */

export async function getReferralReport(range) {
  const [sessions, pageViews, events] = await Promise.all([
    aggregate(VisitorSession, [
      { $match: between("startedAt", range) },
      {
        $group: {
          _id: { $ifNull: ["$referralCode", "DIRECT"] },
          sessions: { $sum: 1 },
          visitors: { $addToSet: "$visitorId" },
          newVisitors: {
            $sum: { $cond: ["$isNewVisitor", 1, 0] },
          },
          bounces: { $sum: { $cond: ["$isBounce", 1, 0] } },
          ended: {
            $sum: {
              $cond: [{ $eq: ["$status", "ENDED"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          sessions: 1,
          newVisitors: 1,
          uniqueVisitors: { $size: "$visitors" },
          bounceRate: {
            $cond: [
              { $gt: ["$ended", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$bounces", "$ended"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { sessions: -1 } },
      { $limit: 200 },
    ]),
    aggregate(PageVisit, [
      { $match: between("enteredAt", range) },
      {
        $group: {
          _id: { $ifNull: ["$referralCode", "DIRECT"] },
          pageViews: { $sum: 1 },
        },
      },
    ]),
    aggregate(AnalyticsEvent, [
      { $match: between("createdAt", range) },
      {
        $group: {
          _id: {
            code: { $ifNull: ["$referralCode", "DIRECT"] },
            type: "$eventType",
          },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const views = new Map(pageViews.map((r) => [r._id, r.pageViews]));
  const eventMap = new Map();

  for (const row of events) {
    const bucket = eventMap.get(row._id.code) || {};
    bucket[row._id.type] = row.count;
    eventMap.set(row._id.code, bucket);
  }

  return {
    period: range.period,
    data: sessions.map((row) => ({
      referralCode: row._id,
      sessions: row.sessions,
      uniqueVisitors: row.uniqueVisitors,
      newVisitors: row.newVisitors,
      bounceRate: row.bounceRate,
      pageViews: views.get(row._id) || 0,
      events: eventMap.get(row._id) || {},
    })),
  };
}

// External referrers and UTM campaigns.
export async function getSourceReport(range) {
  const match = between("startedAt", range);

  const [referrers, utmSources, utmMediums, utmCampaigns] =
    await Promise.all([
      breakdown(VisitorSession, match, "$referrerHost", 30).then(
        (rows) =>
          rows.map((r) => ({
            ...r,
            label: r.label === "Unknown" ? "Direct" : r.label,
          }))
      ),
      breakdown(VisitorSession, { ...match, utm: { $ne: null } }, "$utm.source", 30),
      breakdown(VisitorSession, { ...match, utm: { $ne: null } }, "$utm.medium", 30),
      breakdown(VisitorSession, { ...match, utm: { $ne: null } }, "$utm.campaign", 30),
    ]);

  return {
    period: range.period,
    referrers,
    utmSources,
    utmMediums,
    utmCampaigns,
  };
}

// Every query param seen (e.g. ref, utm_source, coupon).
// Pass key=ref to see each value of that param.
export async function getQueryParams(range, options = {}) {
  const match = {
    ...between("enteredAt", range),
    query: { $type: "object" },
  };

  if (options.page) match.page = validatePage(options.page);

  const key = options.key;

  if (key !== undefined && !/^[a-zA-Z0-9_-]{1,40}$/.test(key)) {
    throw badRequest("Invalid key");
  }

  if (key) {
    const data = await aggregate(PageVisit, [
      { $match: match },
      { $project: { visitorId: 1, kv: { $objectToArray: "$query" } } },
      { $unwind: "$kv" },
      { $match: { "kv.k": key } },
      {
        $group: {
          _id: { value: "$kv.v", visitorId: "$visitorId" },
          pageViews: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.value",
          pageViews: { $sum: "$pageViews" },
          uniqueVisitors: { $sum: 1 },
        },
      },
      { $sort: { pageViews: -1 } },
      { $limit: 100 },
      { $project: { _id: 0, value: "$_id", pageViews: 1, uniqueVisitors: 1 } },
    ]);

    return { period: range.period, key, data };
  }

  const data = await aggregate(PageVisit, [
    { $match: match },
    { $project: { kv: { $objectToArray: "$query" } } },
    { $unwind: "$kv" },
    {
      $group: {
        _id: { key: "$kv.k", value: "$kv.v" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    {
      $group: {
        _id: "$_id.key",
        total: { $sum: "$count" },
        values: {
          $push: { value: "$_id.value", count: "$count" },
        },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 50 },
    {
      $project: {
        _id: 0,
        key: "$_id",
        total: 1,
        topValues: { $slice: ["$values", 10] },
      },
    },
  ]);

  return { period: range.period, data };
}

/* =====================================================
   AUDIENCE: devices, geography
===================================================== */

export async function getDeviceReport(range) {
  const match = between("startedAt", range);
  const field = (path) => breakdown(VisitorSession, match, path, 30);

  const [devices, browsers, systems, languages] =
    await Promise.all([
      field("$device.type"),
      field("$device.browser"),
      field("$device.os"),
      field("$device.language"),
    ]);

  const rename = (rows) =>
    rows.map(({ label, count }) => ({
      name: label,
      sessions: count,
    }));

  return {
    period: range.period,
    devices: rename(devices),
    browsers: rename(browsers),
    operatingSystems: rename(systems),
    languages: rename(languages),
  };
}

export async function getGeoReport(range) {
  const data = await aggregate(VisitorSession, [
    { $match: between("startedAt", range) },
    {
      $group: {
        _id: { $ifNull: ["$country", "Unknown"] },
        sessions: { $sum: 1 },
        visitors: { $addToSet: "$visitorId" },
      },
    },
    {
      $project: {
        _id: 0,
        country: "$_id",
        sessions: 1,
        uniqueVisitors: { $size: "$visitors" },
      },
    },
    { $sort: { sessions: -1 } },
    { $limit: 100 },
  ]);

  return { period: range.period, data };
}

/* =====================================================
   EVENTS, HEATMAP
===================================================== */

export async function getEventReport(range) {
  const match = between("createdAt", range);

  const [totals, byPage, timeline] = await Promise.all([
    aggregate(AnalyticsEvent, [
      { $match: match },
      {
        $group: {
          _id: {
            type: "$eventType",
            sessionId: "$sessionId",
            visitorId: "$visitorId",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.type",
          events: { $sum: "$count" },
          sessions: { $sum: 1 },
          visitors: { $addToSet: "$_id.visitorId" },
        },
      },
      {
        $project: {
          _id: 0,
          eventType: "$_id",
          events: 1,
          sessions: 1,
          uniqueVisitors: { $size: "$visitors" },
        },
      },
      { $sort: { events: -1 } },
    ]),
    aggregate(AnalyticsEvent, [
      { $match: match },
      {
        $group: {
          _id: { page: "$page", type: "$eventType" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 50 },
      {
        $project: {
          _id: 0,
          page: "$_id.page",
          eventType: "$_id.type",
          count: 1,
        },
      },
    ]),
    aggregate(AnalyticsEvent, [
      { $match: match },
      {
        $group: {
          _id: bucketExpr("$createdAt", range),
          events: { $sum: 1 },
        },
      },
      { $project: { _id: 0, timestamp: "$_id", events: 1 } },
      { $sort: { timestamp: 1 } },
    ]),
  ]);

  return {
    period: range.period,
    granularity: range.unit,
    totals,
    topPages: byPage,
    timeline: fillBuckets(range, timeline, { events: 0 }),
  };
}

// Busiest weekday/hour combinations (IST). 1 = Sunday.
export async function getHeatmap(range) {
  const data = await aggregate(PageVisit, [
    { $match: between("enteredAt", range) },
    {
      $group: {
        _id: {
          dayOfWeek: {
            $dayOfWeek: { date: "$enteredAt", timezone: TIMEZONE },
          },
          hour: {
            $hour: { date: "$enteredAt", timezone: TIMEZONE },
          },
        },
        pageViews: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        dayOfWeek: "$_id.dayOfWeek",
        hour: "$_id.hour",
        pageViews: 1,
      },
    },
    { $sort: { dayOfWeek: 1, hour: 1 } },
  ]);

  return { period: range.period, timezone: TIMEZONE, data };
}

/* =====================================================
   LIVE (Redis) + concurrent-user history (Mongo)
===================================================== */

export async function getLiveReport() {
  const sessions = (await getLiveSessions()).filter(
    (s) => s?.sessionId
  );

  const pages = {};
  const referrals = {};
  const devices = {};
  const countries = {};
  const visitors = new Set();

  for (const session of sessions) {
    visitors.add(session.visitorId);

    const bump = (map, key) => {
      map[key] = (map[key] || 0) + 1;
    };

    bump(pages, session.page || "/");
    bump(referrals, session.referralCode || "DIRECT");
    bump(devices, session.device?.type || "unknown");
    bump(countries, session.country || "Unknown");
  }

  const now = Date.now();
  const [recent, todayPeak] = await Promise.all([
    ActiveUserSnapshot.find({
      minute: { $gte: new Date(now - HOUR) },
    })
      .sort({ minute: 1 })
      .select("-_id minute activeSessions")
      .lean(),
    ActiveUserSnapshot.findOne({
      minute: { $gte: new Date(startOfDayIST(now)) },
    })
      .sort({ activeSessions: -1 })
      .select("-_id minute activeSessions")
      .lean(),
  ]);

  return {
    activeSessions: sessions.length,
    uniqueActiveVisitors: visitors.size,
    activePages: Object.keys(pages).length,
    pages: Object.entries(pages)
      .map(([page, activeSessions]) => ({ page, activeSessions }))
      .sort((a, b) => b.activeSessions - a.activeSessions),
    referrals,
    devices,
    countries,
    sessions,
    lastHour: recent,
    peakToday: todayPeak,
    timestamp: new Date(),
  };
}

export async function getLiveHistory(range) {
  const minutes = (range.end - range.start) / 60000;

  const trunc =
    minutes <= 180
      ? {
          unit: "minute",
          binSize: 5,
          timezone: TIMEZONE,
        }
      : { unit: minutes <= 2880 ? "hour" : "day", timezone: TIMEZONE };

  const data = await aggregate(ActiveUserSnapshot, [
    { $match: between("minute", range) },
    {
      $group: {
        _id: { $dateTrunc: { date: "$minute", ...trunc } },
        avgActive: { $avg: "$activeSessions" },
        peakActive: { $max: "$activeSessions" },
      },
    },
    {
      $project: {
        _id: 0,
        timestamp: "$_id",
        avgActive: { $round: ["$avgActive", 1] },
        peakActive: 1,
      },
    },
    { $sort: { timestamp: 1 } },
  ]);

  return {
    period: range.period,
    granularity:
      trunc.unit === "minute" ? "5 minutes" : trunc.unit,
    data,
  };
}

/* =====================================================
   VISITORS, SESSIONS, JOURNEY
===================================================== */

function pagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(query.limit, 10) || 20)
  );

  return { page, limit, skip: (page - 1) * limit };
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function listVisitors(query, range) {
  const { page, limit, skip } = pagination(query);
  const filter = {};

  if (query.period || query.from) {
    filter.lastSeenAt = {
      $gte: range.start,
      $lt: range.end,
    };
  }

  if (typeof query.q === "string" && query.q) {
    filter.visitorId = {
      $regex: `^${escapeRegex(query.q.slice(0, 40))}`,
      $options: "i",
    };
  }

  if (typeof query.ref === "string" && query.ref) {
    const code = query.ref.toUpperCase().slice(0, 50);
    filter.$or = [
      { firstReferralCode: code },
      { lastReferralCode: code },
    ];
  }

  if (typeof query.device === "string" && query.device) {
    filter["device.type"] = query.device.slice(0, 30);
  }

  if (typeof query.country === "string" && query.country) {
    filter.country = query.country.toUpperCase().slice(0, 2);
  }

  if (query.returning === "true") filter.sessionCount = { $gt: 1 };
  if (query.returning === "false") filter.sessionCount = { $lte: 1 };

  const [data, total] = await Promise.all([
    Visitor.find(filter)
      .sort({ lastSeenAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v -ipHash")
      .lean(),
    Visitor.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function listSessions(query, range) {
  const { page, limit, skip } = pagination(query);
  const filter = between("startedAt", range);

  if (["ACTIVE", "ENDED"].includes(query.status)) {
    filter.status = query.status;
  }

  if (typeof query.ref === "string" && query.ref) {
    filter.referralCode = query.ref.toUpperCase().slice(0, 50);
  }

  if (typeof query.landingPage === "string" && query.landingPage) {
    filter.landingPage = validatePage(query.landingPage);
  }

  if (typeof query.visitorId === "string" && query.visitorId) {
    filter.visitorId = query.visitorId.slice(0, 40);
  }

  const [data, total] = await Promise.all([
    VisitorSession.find(filter)
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v -ipHash")
      .lean(),
    VisitorSession.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Full browsing history of one visitor, oldest page first.
export async function getVisitorJourney(visitorId) {
  const visitor = await Visitor.findOne({ visitorId })
    .select("-__v -ipHash")
    .lean();

  if (!visitor) {
    const err = new Error("Visitor not found");
    err.status = 404;
    throw err;
  }

  const sessions = await VisitorSession.find({ visitorId })
    .sort({ startedAt: -1 })
    .limit(20)
    .select("-__v -ipHash")
    .lean();

  const sessionIds = sessions.map((s) => s.sessionId);

  const [visits, events] = await Promise.all([
    PageVisit.find({ visitorId, sessionId: { $in: sessionIds } })
      .sort({ enteredAt: 1 })
      .limit(1000)
      .select("-__v")
      .lean(),
    AnalyticsEvent.find({ visitorId, sessionId: { $in: sessionIds } })
      .sort({ createdAt: 1 })
      .limit(1000)
      .select("-__v")
      .lean(),
  ]);

  const group = (rows) => {
    const map = new Map();
    for (const row of rows) {
      const list = map.get(row.sessionId) || [];
      list.push(row);
      map.set(row.sessionId, list);
    }
    return map;
  };

  const visitsBySession = group(visits);
  const eventsBySession = group(events);

  return {
    visitor,
    sessions: sessions.map((session) => ({
      ...session,
      pages: visitsBySession.get(session.sessionId) || [],
      events: eventsBySession.get(session.sessionId) || [],
    })),
  };
}

/* =====================================================
   ONE-CALL DASHBOARD
===================================================== */

export async function getDashboard(range) {
  const [
    overview,
    timeline,
    pages,
    referrals,
    sources,
    devices,
    geo,
    entryExit,
    events,
    live,
  ] = await Promise.all([
    getOverview(range),
    getTrafficTimeline(range),
    getTopPages(range, { limit: 10 }),
    getReferralReport(range),
    getSourceReport(range),
    getDeviceReport(range),
    getGeoReport(range),
    getEntryExitPages(range, 10),
    getEventReport(range),
    getLiveReport(),
  ]);

  return {
    overview,
    timeline,
    pages,
    referrals,
    sources,
    devices,
    geo,
    entryExit,
    events,
    live,
  };
}
