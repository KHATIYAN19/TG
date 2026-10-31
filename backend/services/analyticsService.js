import Visitor from "../models/analytics/Visitor.js";
import VisitorSession from "../models/analytics/VisitorSession.js";
import PageVisit from "../models/analytics/PageVisit.js";
import AnalyticsEvent from "../models/analytics/AnalyticsEvent.js";

import {
  markSessionLive,
  removeLiveSession,
  getLiveSession,
} from "../config/analyticsRedis.js";

import {
  getDevice,
  getClientInfo,
  cleanPage,
  cleanQuery,
  cleanReferral,
  cleanReferrer,
  cleanUtm,
  isUUID,
  validateEventType,
} from "../Middleware/analyticsValidation.js";

// A session with no signal for this long is closed.
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Mongo session.lastSeenAt is refreshed at most this often.
const SESSION_TOUCH_MS = 30 * 1000;

const fail = (message, status = 400, code) => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  throw error;
};

function validatePageVisitId(id) {
  if (!isUUID(id)) fail("Invalid pageVisitId");
}

async function getOwnedPageVisit({
  visitorId,
  sessionId,
  pageVisitId,
}) {
  const visit = await PageVisit.findOne({
    visitorId,
    sessionId,
    pageVisitId,
  }).lean();

  if (!visit) fail("Page visit not found", 404);
  return visit;
}

async function getOwnedSession(visitorId, sessionId) {
  const session = await VisitorSession.findOne({
    visitorId,
    sessionId,
  }).lean();

  if (!session) fail("Session not found", 404);
  return session;
}

function assertSessionActive(session) {
  if (session.status !== "ACTIVE") {
    fail("Session already ended", 409, "SESSION_ENDED");
  }
}

// Refresh session.lastSeenAt without writing on every ping.
function touchSession(sessionId, now = new Date()) {
  return VisitorSession.updateOne(
    {
      sessionId,
      lastSeenAt: {
        $lt: new Date(now.getTime() - SESSION_TOUCH_MS),
      },
    },
    { $set: { lastSeenAt: now } }
  );
}

/* =====================================================
   PAGE VIEW
   Called once per frontend route change.
===================================================== */

export async function startPageVisit(body, req) {
  const { visitorId, sessionId, pageVisitId } = body;

  validatePageVisitId(pageVisitId);

  const page = cleanPage(body.page);
  if (!page) fail("Invalid page");

  if (page.startsWith("/admin")) {
    fail("Admin pages are not tracked");
  }

  const query = cleanQuery(body.query);
  const utm = cleanUtm(query);

  const pageReferral = cleanReferral(
    query.ref ||
      query.referral ||
      body.referralCode
  );

  const { referrer, referrerHost } = cleanReferrer(
    body.referrer
  );

  const previousPage = cleanPage(body.previousPage);
  const now = new Date();
  const device = getDevice(req, body.device || {});
  const client = getClientInfo(req);

  // 1. Visitor (one per browser)
  const visitorResult = await Visitor.updateOne(
    { visitorId },
    {
      $setOnInsert: {
        visitorId,
        firstSeenAt: now,
        firstReferralCode: pageReferral,
        firstLandingPage: page,
        firstReferrerHost: referrerHost,
      },
      $set: {
        lastSeenAt: now,
        device,
        ...(client.country
          ? { country: client.country }
          : {}),
        ...(client.ipHash
          ? { ipHash: client.ipHash }
          : {}),
        ...(pageReferral
          ? { lastReferralCode: pageReferral }
          : {}),
      },
    },
    { upsert: true }
  );

  const visitorIsNew = visitorResult.upsertedCount === 1;

  // 2. Session. Acquisition data is fixed at creation.
  const sessionResult =
    await VisitorSession.findOneAndUpdate(
      { sessionId },
      {
        $setOnInsert: {
          sessionId,
          visitorId,
          startedAt: now,
          landingPage: page,
          referralCode: pageReferral,
          source:
            typeof body.source === "string"
              ? body.source.slice(0, 60)
              : null,
          referrer,
          referrerHost,
          utm,
          query,
          isNewVisitor: visitorIsNew,
          country: client.country,
          ipHash: client.ipHash,
          device,
        },
        $set: { lastSeenAt: now },
      },
      {
        upsert: true,
        new: true,
        includeResultMetadata: true,
      }
    );

  const session = sessionResult.value;
  const sessionIsNew =
    !sessionResult.lastErrorObject?.updatedExisting;

  if (session.visitorId !== visitorId) {
    fail("Session not found", 404);
  }

  assertSessionActive(session);

  if (sessionIsNew) {
    await Visitor.updateOne(
      { visitorId },
      { $inc: { sessionCount: 1 } }
    );
  }

  // A page-level ?ref= wins, otherwise inherit session's.
  const referralCode =
    pageReferral || session.referralCode || null;

  // 3. Page visit (idempotent on pageVisitId)
  const visitResult =
    await PageVisit.findOneAndUpdate(
      { pageVisitId },
      {
        $setOnInsert: {
          pageVisitId,
          visitorId,
          sessionId,
          page,
          query,
          title:
            typeof body.title === "string"
              ? body.title.slice(0, 150)
              : null,
          referralCode,
          referrerHost: sessionIsNew
            ? referrerHost
            : null,
          previousPage,
          isEntry: sessionIsNew,
          isNewVisitor: !!session.isNewVisitor,
          deviceType: device.type,
          browser: device.browser,
          os: device.os,
          country: client.country,
          enteredAt: now,
          lastSeenAt: now,
        },
      },
      {
        upsert: true,
        new: true,
        includeResultMetadata: true,
      }
    );

  const visit = visitResult.value;

  if (
    visit.visitorId !== visitorId ||
    visit.sessionId !== sessionId ||
    visit.page !== page
  ) {
    fail("Page visit ID already used", 409);
  }

  if (!visitResult.lastErrorObject?.updatedExisting) {
    await Promise.all([
      VisitorSession.updateOne(
        { sessionId },
        {
          $inc: { pageCount: 1 },
          $set: { exitPage: page },
        }
      ),
      Visitor.updateOne(
        { visitorId },
        { $inc: { pageViewCount: 1 } }
      ),
    ]);
  }

  await markSessionLive({
    visitorId,
    sessionId,
    pageVisitId,
    page,
    referralCode,
    country: client.country,
    startedAt: session.startedAt,
    device,
  });

  return { pageVisitId, sessionId, referralCode };
}

/* =====================================================
   HEARTBEAT
   Redis only on the hot path; Mongo is a fallback.
===================================================== */

export async function heartbeat(body) {
  const { visitorId, sessionId, pageVisitId } = body;

  validatePageVisitId(pageVisitId);

  const live = await getLiveSession(sessionId);

  if (
    live &&
    live.visitorId === visitorId &&
    live.pageVisitId === pageVisitId
  ) {
    await markSessionLive(live);
    await touchSession(sessionId);
    return { success: true };
  }

  const visit = await getOwnedPageVisit({
    visitorId,
    sessionId,
    pageVisitId,
  });

  if (visit.exitedAt) {
    fail("Page visit already ended", 409);
  }

  const session = await getOwnedSession(
    visitorId,
    sessionId
  );

  assertSessionActive(session);

  await markSessionLive({
    visitorId,
    sessionId,
    pageVisitId,
    page: visit.page,
    referralCode: visit.referralCode,
    country: session.country,
    startedAt: session.startedAt,
    device: session.device,
  });

  await touchSession(sessionId);

  return { success: true };
}

/* =====================================================
   ENGAGEMENT
   Scroll and active time are cumulative per page visit.
===================================================== */

function readEngagement(body) {
  const scroll = Number(body.maxScrollPercentage);
  const pixels = Number(body.maxScrollPixels);
  const activeSeconds = Number(body.activeTimeSeconds);

  if (
    !Number.isFinite(scroll) ||
    scroll < 0 ||
    scroll > 100 ||
    !Number.isFinite(pixels) ||
    pixels < 0 ||
    pixels > 100000000 ||
    !Number.isFinite(activeSeconds) ||
    activeSeconds < 0 ||
    activeSeconds > 86400
  ) {
    fail("Invalid engagement data");
  }

  return {
    scroll,
    pixels: Math.floor(pixels),
    activeSeconds: Math.floor(activeSeconds),
  };
}

async function applyEngagement(visit, body) {
  const { scroll, pixels, activeSeconds } =
    readEngagement(body);

  const now = new Date();

  await PageVisit.updateOne(
    {
      pageVisitId: visit.pageVisitId,
      exitedAt: { $exists: false },
    },
    {
      $max: {
        maxScrollPercentage: scroll,
        maxScrollPixels: pixels,
        activeTimeSeconds: activeSeconds,
        lastSeenAt: now,
      },
    }
  );

  // Keep session totals current using the delta only.
  const delta = Math.max(
    0,
    activeSeconds - (visit.activeTimeSeconds || 0)
  );

  await VisitorSession.updateOne(
    { sessionId: visit.sessionId },
    {
      ...(delta > 0
        ? { $inc: { activeSeconds: delta } }
        : {}),
      $max: { lastSeenAt: now },
    }
  );
}

export async function updateEngagement(body) {
  const { visitorId, sessionId, pageVisitId } = body;

  validatePageVisitId(pageVisitId);

  const visit = await getOwnedPageVisit({
    visitorId,
    sessionId,
    pageVisitId,
  });

  if (visit.exitedAt) {
    return { success: true, alreadyEnded: true };
  }

  await applyEngagement(visit, body);

  return { success: true };
}

/* =====================================================
   EVENTS (Buy Now, Preview PDF, ...)
===================================================== */

export async function trackEvent(body) {
  const {
    eventId,
    visitorId,
    sessionId,
    pageVisitId,
    eventType,
  } = body;

  if (!isUUID(eventId)) fail("Invalid eventId");
  validatePageVisitId(pageVisitId);

  if (!validateEventType(eventType)) {
    fail("Unsupported event type");
  }

  const visit = await getOwnedPageVisit({
    visitorId,
    sessionId,
    pageVisitId,
  });

  const metadata = {};
  const input = body.metadata;

  if (
    input &&
    typeof input === "object" &&
    !Array.isArray(input)
  ) {
    for (const key of [
      "buttonId",
      "bookSlug",
      "section",
      "amount",
    ]) {
      if (
        typeof input[key] === "string" ||
        typeof input[key] === "number"
      ) {
        metadata[key] = String(input[key]).slice(0, 100);
      }
    }
  }

  try {
    await AnalyticsEvent.create({
      eventId,
      visitorId,
      sessionId,
      pageVisitId,
      page: visit.page,
      eventType,
      referralCode: visit.referralCode,
      metadata,
    });
  } catch (error) {
    if (error.code === 11000) {
      return { success: true, duplicate: true };
    }
    throw error;
  }

  await Promise.all([
    PageVisit.updateOne(
      { pageVisitId, visitorId, sessionId },
      { $inc: { [`clickCounts.${eventType}`]: 1 } }
    ),
    VisitorSession.updateOne(
      { sessionId },
      {
        $inc: { eventCount: 1 },
        $max: { lastSeenAt: new Date() },
      }
    ),
  ]);

  return { success: true };
}

/* =====================================================
   PAGE EXIT / SESSION END
===================================================== */

export async function endPageVisit(body) {
  const { visitorId, sessionId, pageVisitId } = body;

  validatePageVisitId(pageVisitId);

  const visit = await getOwnedPageVisit({
    visitorId,
    sessionId,
    pageVisitId,
  });

  if (visit.exitedAt) {
    return { success: true, alreadyEnded: true };
  }

  // Engagement fields are optional on exit.
  if (body.activeTimeSeconds !== undefined) {
    await applyEngagement(visit, body);
  }

  const now = new Date();

  await PageVisit.updateOne(
    {
      pageVisitId,
      exitedAt: { $exists: false },
    },
    {
      $set: {
        exitedAt: now,
        exitReason: "NAVIGATION",
        durationSeconds: Math.max(
          0,
          Math.round(
            (now - new Date(visit.enteredAt)) / 1000
          )
        ),
      },
    }
  );

  return { success: true };
}

// Mongo aggregation-pipeline update used by both the explicit
// end-of-session call and the idle timeout job.
function closeSessionPipeline(endExpr, reason) {
  return [
    {
      $set: {
        status: "ENDED",
        endedAt: endExpr,
        durationSeconds: {
          $max: [
            0,
            {
              $round: [
                {
                  $divide: [
                    { $subtract: [endExpr, "$startedAt"] },
                    1000,
                  ],
                },
                0,
              ],
            },
          ],
        },
        isBounce: {
          $and: [
            { $lte: [{ $ifNull: ["$pageCount", 0] }, 1] },
            {
              $lt: [
                { $ifNull: ["$activeSeconds", 0] },
                10,
              ],
            },
            { $lte: [{ $ifNull: ["$eventCount", 0] }, 0] },
          ],
        },
        endReason: reason,
      },
    },
  ];
}

export async function endSession(body) {
  const { visitorId, sessionId } = body;

  await getOwnedSession(visitorId, sessionId);

  const now = new Date();

  await PageVisit.updateMany(
    { sessionId, exitedAt: { $exists: false } },
    [
      {
        $set: {
          exitedAt: now,
          exitReason: "SESSION_ENDED",
          durationSeconds: {
            $max: [
              0,
              {
                $round: [
                  {
                    $divide: [
                      { $subtract: [now, "$enteredAt"] },
                      1000,
                    ],
                  },
                  0,
                ],
              },
            ],
          },
        },
      },
    ]
  );

  await VisitorSession.updateOne(
    { sessionId, status: "ACTIVE" },
    closeSessionPipeline(now, "EXPLICIT")
  );

  await removeLiveSession(sessionId);

  return { success: true };
}

// Closes sessions and page visits that went silent.
export async function closeIdleSessions() {
  const cutoff = new Date(Date.now() - SESSION_TIMEOUT_MS);

  const pages = await PageVisit.updateMany(
    {
      exitedAt: { $exists: false },
      lastSeenAt: { $lt: cutoff },
    },
    [
      {
        $set: {
          exitedAt: "$lastSeenAt",
          exitReason: "TIMEOUT",
          durationSeconds: {
            $max: [
              0,
              {
                $round: [
                  {
                    $divide: [
                      {
                        $subtract: [
                          "$lastSeenAt",
                          "$enteredAt",
                        ],
                      },
                      1000,
                    ],
                  },
                  0,
                ],
              },
            ],
          },
        },
      },
    ]
  );

  const sessions = await VisitorSession.updateMany(
    { status: "ACTIVE", lastSeenAt: { $lt: cutoff } },
    closeSessionPipeline("$lastSeenAt", "TIMEOUT")
  );

  return {
    pagesClosed: pages.modifiedCount,
    sessionsClosed: sessions.modifiedCount,
  };
}

// Single dispatcher behind POST /api/analytics/track
export async function track(body, req) {
  switch (body.type) {
    case "page_view":
      return startPageVisit(body, req);
    case "heartbeat":
      return heartbeat(body);
    case "engagement":
      return updateEngagement(body);
    case "event":
      return trackEvent(body);
    case "page_exit":
      return endPageVisit(body);
    case "session_end":
      return endSession(body);
    default:
      return fail("Invalid tracking type");
  }
}
