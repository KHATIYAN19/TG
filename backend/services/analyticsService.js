
import Visitor from "../models/analytics/Visitor.js";
import VisitorSession from "../models/analytics/VisitorSession.js";
import PageVisit from "../models/analytics/PageVisit.js";
import AnalyticsEvent from "../models/analytics/AnalyticsEvent.js";

import {
  markSessionLive,
  removeLiveSession,
  getLiveSessions,
} from "../config/analyticsRedis.js";

import {
  getDevice,
  cleanPage,
  cleanReferral,
  isUUID,
  validateEventType,
} from "../Middleware/analyticsValidation.js";

const fail = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};

function validatePageVisitId(id) {
  if (!isUUID(id)) fail("Invalid pageVisitId");
}

async function getOwnedSession(visitorId, sessionId) {
  const session = await VisitorSession.findOne({
    visitorId,
    sessionId,
  }).lean();

  if (!session) fail("Session not found", 404);
  return session;
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

// Called once whenever a visitor opens a new page.
export async function startPageVisit(req) {
  const {
    visitorId,
    sessionId,
    pageVisitId,
    device: deviceInput,
  } = req.body;

  validatePageVisitId(pageVisitId);

  const page = cleanPage(req.body.page);
  if (!page) fail("Invalid page");

  if (page.startsWith("/admin")) {
    fail("Admin pages are not tracked");
  }

  const referralCode = cleanReferral(
    req.body.referralCode
  );

  const now = new Date();
  const device = getDevice(req, deviceInput || {});

  // Upsert the browser record.
  await Visitor.updateOne(
    { visitorId },
    {
      $setOnInsert: {
        visitorId,
        firstSeenAt: now,
        firstReferralCode: referralCode,
        firstLandingPage: page,
      },
      $set: {
        lastSeenAt: now,
        device,
      },
    },
    { upsert: true }
  );

  // Session referral is fixed when the session is created.
  await VisitorSession.updateOne(
    { sessionId },
    {
      $setOnInsert: {
        sessionId,
        visitorId,
        startedAt: now,
        landingPage: page,
        referralCode,
        source:
          typeof req.body.source === "string"
            ? req.body.source.slice(0, 60)
            : null,
        device,
      },
    },
    { upsert: true }
  );

  // Ensure this session belongs to this browser.
  const session = await getOwnedSession(
    visitorId,
    sessionId
  );

  if (session.status !== "ACTIVE") {
    fail("Session already ended", 409);
  }

  // Idempotent page creation.
  await PageVisit.updateOne(
    { pageVisitId },
    {
      $setOnInsert: {
        pageVisitId,
        visitorId,
        sessionId,
        page,
        referralCode: session.referralCode,
        enteredAt: now,
      },
    },
    { upsert: true }
  );

  const visit = await getOwnedPageVisit({
    visitorId,
    sessionId,
    pageVisitId,
  });

  // Do not silently overwrite an existing page ID.
  if (visit.page !== page) {
    fail("Page visit ID already used", 409);
  }

  await markSessionLive({
    visitorId,
    sessionId,
    pageVisitId,
    page,
    referralCode: session.referralCode,
    device,
  });

  return {
    pageVisitId,
    sessionId,
    referralCode: session.referralCode,
  };
}

// Called periodically while the visitor's page is visible.
// Writes only to Redis.
export async function heartbeat(req) {
  const { visitorId, sessionId, pageVisitId } =
    req.body;

  validatePageVisitId(pageVisitId);

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

  if (session.status !== "ACTIVE") {
    fail("Session already ended", 409);
  }

  await markSessionLive({
    visitorId,
    sessionId,
    pageVisitId,
    page: visit.page,
    referralCode: session.referralCode,
    device: session.device,
  });

  return { success: true };
}

// Called every 15-30 seconds and on page exit.
// activeTimeSeconds must be cumulative for this page visit.
export async function updateEngagement(req) {
  const {
    visitorId,
    sessionId,
    pageVisitId,
  } = req.body;

  validatePageVisitId(pageVisitId);

  const visit = await getOwnedPageVisit({
    visitorId,
    sessionId,
    pageVisitId,
  });

  if (visit.exitedAt) {
    return { success: true, alreadyEnded: true };
  }

  const scroll = Number(
    req.body.maxScrollPercentage
  );

  const pixels = Number(req.body.maxScrollPixels);
  const activeSeconds = Number(
    req.body.activeTimeSeconds
  );

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

  const now = new Date();

  const update = {
    $max: {
      maxScrollPercentage: scroll,
      maxScrollPixels: Math.floor(pixels),
      activeTimeSeconds: Math.floor(activeSeconds),
      lastSeenAt: now,
    },
  };

  await PageVisit.updateOne(
    {
      visitorId,
      sessionId,
      pageVisitId,
      exitedAt: { $exists: false },
    },
    update
  );

  return { success: true };
}

// Important interaction: Buy Now, PDF Preview, etc.
export async function trackEvent(req) {
  const {
    eventId,
    visitorId,
    sessionId,
    pageVisitId,
    eventType,
  } = req.body;

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

  // Allow only small, predictable event metadata.
  const metadata = {};
  const input = req.body.metadata || {};

  if (
    input &&
    typeof input === "object" &&
    !Array.isArray(input)
  ) {
    for (const key of [
      "buttonId",
      "bookSlug",
      "section",
    ]) {
      if (typeof input[key] === "string") {
        metadata[key] = input[key].slice(0, 100);
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

  // Count only newly inserted events.
  await PageVisit.updateOne(
    { pageVisitId, visitorId, sessionId },
    {
      $inc: {
        [`clickCounts.${eventType}`]: 1,
      },
    }
  );

  return { success: true };
}

// Called when the user navigates away from a page.
export async function endPageVisit(req) {
  const { visitorId, sessionId, pageVisitId } =
    req.body;

  validatePageVisitId(pageVisitId);

  await updateEngagement(req);

  const now = new Date();

  await PageVisit.updateOne(
    {
      visitorId,
      sessionId,
      pageVisitId,
      exitedAt: { $exists: false },
    },
    {
      $set: {
        exitedAt: now,
        exitReason: "NAVIGATION",
      },
    }
  );

  return { success: true };
}

// Used on an explicit session end, not normal page navigation.
export async function endSession(req) {
  const { visitorId, sessionId } = req.body;

  await getOwnedSession(visitorId, sessionId);

  const now = new Date();

  await VisitorSession.updateOne(
    { visitorId, sessionId, status: "ACTIVE" },
    {
      $set: {
        status: "ENDED",
        endedAt: now,
        lastSeenAt: now,
      },
    }
  );

  await PageVisit.updateMany(
    {
      visitorId,
      sessionId,
      exitedAt: { $exists: false },
    },
    {
      $set: {
        exitedAt: now,
        exitReason: "SESSION_ENDED",
      },
    }
  );

  await removeLiveSession(sessionId);

  return { success: true };
}

// Returns individual live sessions and counts per page.
export async function getLiveAnalytics() {
  const sessions = await getLiveSessions();

  const pages = {};
  const referrals = {};
  const devices = {};

  for (const session of sessions) {
    pages[session.page] =
      (pages[session.page] || 0) + 1;

    const referral =
      session.referralCode || "DIRECT";

    referrals[referral] =
      (referrals[referral] || 0) + 1;

    const type = session.device?.type || "unknown";

    devices[type] = (devices[type] || 0) + 1;
  }

  return {
    activeSessions: sessions.length,
    activePages: Object.keys(pages).length,
    pages,
    referrals,
    devices,
    sessions,
    generatedAt: new Date(),
  };
}
