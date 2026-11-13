import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dns from "node:dns/promises";

import connectDB from "./utils/dbConnection.js";
import { startEbookEmailSweeper } from "./utils/ebookEmailDelivery.js";

/* =====================================================
   EXISTING ROUTES
===================================================== */
import financeRoutes from "./routes/financeRoutes.js";
import BookingRoute from "./routes/Booking.js";
import TimeSlotRoute from "./routes/TimeSlot.js";
import userRoute from "./routes/User.js";
import reviewRoute from "./routes/Review.js";
import contactRoute from "./routes/Contact.js";
import blogRoute from "./routes/Blog.js";
import portfolioRoute from "./routes/Portfolio.js";
import AffiliateRoute from "./routes/Affiliate.js";
import InterestRoute from "./routes/Interest.js";
import ClientRoute from "./routes/Client.js";
import interviewMaintenanceRoutes from "./routes/interviewMaintenanceRoutes.js";
import BookRoute from "./routes/bookRoute.js";
import BookSalesRoute from "./routes/bookSales.js";
import OrderMailRoute from "./routes/orderMailRoute.js";
import CouponRoute from "./routes/couponRoute.js";
import { publicRouter as bookOfferPublicRoutes, adminRouter as bookOfferAdminRoutes } from "./routes/bookOfferRoute.js";
import { memberRouter as membershipRoutes, adminRouter as membershipAdminRoutes } from "./routes/membershipRoute.js";

import bookAccessRoute from "./routes/bookAccessRoute.js";
import bookPaymentRoute from "./routes/bookPaymentRoute.js";
import { bookPaymentWebhook } from "./controllers/books/bookPaymentController.js";

import paymentRoutes from "./routes/paymentRoute.js";
import emailCampaignRoutes from "./routes/emailCampaignRoutes.js";
import marketingCampaignRoutes from "./routes/marketingCampaignRoutes.js";
import { unsubscribePage, unsubscribeSubmit } from "./controllers/unsubscribeController.js";
import { publicFormLimiter } from "./Middleware/rateLimiter.js";
import { startMailWorker } from "./services/mail/mailWorker.js";

import InterviewExperience from "./routes/InterviewExperience.js";
import BookReviewRoute from "./routes/bookReviewRoute.js";

import affiliateRoutes from "./routes/affiliateRoutes.js";

/* Prep Buddy Arena */
import arenaRoutes from "./routes/arena/arenaRoutes.js";
import arenaAdminRoutes from "./routes/arena/arenaAdminRoutes.js";
import { attachArenaSocket } from "./services/arena/socket.js";
import { sweepAbandonedEntries } from "./services/arena/entryService.js";
import { healPaidMembers } from "./services/arena/activation.js";
import { migrateLegacyArenaData } from "./services/arena/migrate.js";
import { dropLegacyMemoryIndexes } from "./services/memory/migrate.js";
import { startStorageSweeper } from "./services/memory/storageCleanup.js";
import { backfillExpiry, startExpirySweeper } from "./services/memory/expiry.js";


import { auth, isAdmin } from "./Middleware/auth.js";
import { sanitizeInput } from "./Middleware/sanitizeInput.js";
/* =====================================================
   AUTHENTICATION ROUTES
===================================================== */


import analyticsReportRoutes from
  "./routes/analyticsReportRoutes.js";
import analyticsRoutes from
  "./routes/analyticsRoutes.js";
import analyticsInternalRoutes from
  "./routes/analyticsInternalRoutes.js";
import blogAgentInternalRoutes from
  "./routes/blogAgentInternalRoutes.js";
import {
  startAnalyticsJobs,
} from "./services/analyticsJobs.js";

import authRoutes from "./routes/authRoutes.js";
import { sweepSessions } from "./services/sessionCleanup.js";
import { resendMissedMetaPurchases } from "./services/metaSweep.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import mailSettingsRoutes from "./routes/mailSettingsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import {
  publicRouter as memoryPublicRoutes,
  userRouter as memoryUserRoutes,
  adminRouter as memoryAdminRoutes,
  paymentCallbackRouter as memoryPaymentCallbackRoutes,
  infoRouter as memoryInfoRoutes,
} from "./routes/memory/memoryRoutes.js";
import { gatewayWebhook as memoryGatewayWebhook } from "./controllers/memory/memoryPaymentController.js";
import userRoutes from "./routes/userRoutes.js";

/* =====================================================
   MOCK INTERVIEW ROUTES
===================================================== */

import interviewRoutes from "./routes/interviewRoutes.js";

import {
  interviewCashfreeWebhook,
} from "./controllers/interviewPaymentController.js";

/* =====================================================
   RATE LIMITER
===================================================== */

import {
  globalRateLimiter,
} from "./Middleware/rateLimiter.js";

/* =====================================================
   DNS
===================================================== */

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

/* =====================================================
   ENVIRONMENT VALIDATION
===================================================== */

const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "FRONTEND_URL",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}`
    );
  }
}

/* =====================================================
   INITIALIZE EXPRESS
===================================================== */

const app = express();

const PORT = Number(
  process.env.PORT || 5001
);

const isProduction =
  process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

app.disable("x-powered-by");

/* =====================================================
   SECURITY HEADERS
===================================================== */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

/* =====================================================
   CORS CONFIGURATION
===================================================== */

const defaultOrigins = [
  "https://www.targettrek.in",
  "https://targettrek.in",
];

const developmentOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

const configuredOrigins = (
  process.env.CORS_ORIGINS || ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set(
  [
    ...defaultOrigins,
    ...configuredOrigins,

    ...(isProduction
      ? []
      : developmentOrigins),

    process.env.FRONTEND_URL,
  ].filter(Boolean)
);

/*
  In development, Vite hops to the next free port (5174, 5175, …) when
  5173 is busy. Accept any localhost port so that doesn't surface as a
  CORS error. Production only ever trusts the explicit list above.
*/
const LOCAL_DEV_ORIGIN =
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d{2,5})?$/;

const isOriginAllowed = (origin) =>
  allowedOrigins.has(origin) ||
  (!isProduction && LOCAL_DEV_ORIGIN.test(origin));

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    const error = new Error(
      "Origin is not allowed by CORS"
    );

    error.status = 403;

    return callback(error);
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",

    // Blog view counter (dedupes one view per visitor per 24h).
    "x-blog-visitor-id",

    // Memory pages: unlock token for private pages.
    "x-memory-token",
  ],

  exposedHeaders: [
    "RateLimit",
    "RateLimit-Limit",
    "RateLimit-Remaining",
    "RateLimit-Reset",
    "Retry-After",
  ],

  maxAge: 86400,

  optionsSuccessStatus: 204,
};

/*
  Public unsubscribe (signed links in campaign emails).
  Registered BEFORE the CORS / origin checks on purpose: it is a plain HTML page
  served by this backend, and its form posts back to the same backend. The browser
  sends that POST with the backend's own origin, which is (rightly) not in the
  CORS allow-list for the site. The link is authenticated by its signed token and
  rate-limited, and nothing here reads cookies, so skipping CORS is safe.
*/
app.get("/api/mail/unsubscribe", publicFormLimiter, unsubscribePage);
app.post(
  "/api/mail/unsubscribe",
  express.urlencoded({ extended: false, limit: "4kb" }),
  publicFormLimiter,
  unsubscribeSubmit
);

/*
  Payment gateway RETURN routes are skipped by CORS on purpose. PayU (and others) send the buyer's browser back with a
  cross-site form POST whose Origin is the gateway's own site (e.g. https://test.payu.in), which is (rightly) not in the
  site's CORS allow-list. These are plain browser navigations, not API calls: nothing here reads cookies or trusts the
  request. Every payment is re-verified with the gateway itself, so skipping CORS is safe. (Webhooks are server-to-server
  and have no Origin.)
*/
const GATEWAY_RETURN_PATHS = [
  /^\/payment\/books\/return\/?$/,
  /^\/api\/arena\/payments\/return\/?$/,
  /^\/api\/memories\/payments\/callback\/[A-Za-z0-9_-]+\/?$/,
];

const corsMiddleware = cors(corsOptions);

app.use((req, res, next) =>
  GATEWAY_RETURN_PATHS.some((re) => re.test(req.path))
    ? next()
    : corsMiddleware(req, res, next)
);

/* =====================================================
   COOKIE PARSER
===================================================== */

app.use(cookieParser());

/* =====================================================
   WEBHOOK ROUTES — MUST BE BEFORE express.json()

   IMPORTANT:

   Cashfree webhook signature verification
   requires the original request body.

   Interview webhook:
   /api/interviews/payment/cashfree/webhook

   Do not apply JWT authentication here.

   Signature verification happens inside
   interviewCashfreeWebhook.
===================================================== */

const INTERVIEW_CASHFREE_WEBHOOK =
  "/api/interviews/payment/cashfree/webhook";

/*
  Dedicated raw-body parser.

  This returns a Buffer in req.body, which your
  interviewCashfreeWebhook already expects.
*/
app.use(
  "/api/interviews/maintenance",
  interviewMaintenanceRoutes
);
app.post(
  INTERVIEW_CASHFREE_WEBHOOK,

  express.raw({
    type: "application/json",
    limit: "2mb",
  }),

  (req, res, next) => {
    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook request body",
      });
    }

    console.log(
      "[INTERVIEW CASHFREE WEBHOOK] Received:",
      new Date().toISOString()
    );

    next();
  },

  interviewCashfreeWebhook
);

/* Memory-page payment webhooks (any gateway). Needs the raw body for signature checks, so it
   must stay above express.json(). Each gateway adapter verifies its own signature. */
app.post(
  "/api/memories/payments/webhook/:gateway",
  express.raw({ type: "*/*", limit: "1mb" }),
  memoryGatewayWebhook
);

/* Book payment webhooks (any gateway): raw body for signature checks, so it stays above express.json(). */
app.post(
  "/payment/books/webhook/:gateway",
  express.raw({ type: "*/*", limit: "1mb" }),
  bookPaymentWebhook
);

/* =====================================================
   PUBLIC ANALYTICS TRACKING

   Registered before the 10mb JSON parser and the global
   rate limiter: it has a small body limit and its own
   limiter, so heartbeats never eat the visitor's quota.
===================================================== */

app.use(
  "/api/analytics",
  express.json({ limit: "8kb" }),
  sanitizeInput,
  analyticsRoutes
);

// Cloud Scheduler hook (secret-protected, no body).
app.use(
  "/internal/analytics",
  analyticsInternalRoutes
);

// Daily blog-draft agent (Cloud Scheduler, secret-protected).
app.use(
  "/internal/blog-agent",
  blogAgentInternalRoutes
);

/* =====================================================
   GENERAL REQUEST BODY PARSING

   Gateway webhooks are handled above (raw body).
===================================================== */

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// Strip MongoDB operator keys ($ne, $gt, ...) from request bodies.
app.use(sanitizeInput);

/* =====================================================
   GLOBAL RATE LIMITER

   The interview webhook was registered above,
   so successful webhook handling never reaches
   this middleware.

   Other API routes continue using the limiter.
===================================================== */

app.use(globalRateLimiter);

/* =====================================================
   COOKIE-AUTH CSRF PROTECTION
===================================================== */

const cookieAuthPaths = [
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/logout-all",
];

app.use((req, res, next) => {
  if (
    !cookieAuthPaths.includes(req.path)
  ) {
    return next();
  }

  if (
    ![
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
    ].includes(req.method)
  ) {
    return next();
  }

  const origin = req.get("origin");

  if (
    origin &&
    !isOriginAllowed(origin)
  ) {
    return res.status(403).json({
      success: false,
      message: "Untrusted request origin",
    });
  }

  next();
});

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/", (req, res) => {
  return res.status(200).send(
    "Target Trek Backend API Running Successfully!"
  );
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "OK",
    service: "Target Trek Backend",
    environment:
      process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   AUTHENTICATION
===================================================== */

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/admin/users",
  adminUserRoutes
);

/* =====================================================
   PREP BUDDY ARENA
   Public signup + member API, and admin API.
===================================================== */

app.use("/api/arena", arenaRoutes);
app.use("/api/admin/arena", arenaAdminRoutes);
app.use("/api/admin/mail", mailSettingsRoutes);
app.use("/api/uploads", uploadRoutes);

/* MEMORY PAGES (birthday / proposal / sorry pages with photos + videos)
   public viewer is mounted first: it must not sit behind the login middleware. */
app.use("/api/memories/public", memoryInfoRoutes);
app.use("/api/memories/view", memoryPublicRoutes);
app.use("/api/memories/payments/callback", memoryPaymentCallbackRoutes);
app.use("/api/memories", memoryUserRoutes);
app.use("/api/admin/memories", memoryAdminRoutes);

/* =====================================================
   EXISTING PAYMENT ROUTES

   Keep these routes unchanged.
===================================================== */

/* Unified book payments: one API for Cashfree, Razorpay, PayU (and any gateway added to services/payments). */
app.use(
  "/payment/books",
  bookPaymentRoute
);

app.use(
  "/payment/payu",
  bookAccessRoute
);

/* =====================================================
   EXISTING BOOKING ROUTES
===================================================== */

app.use(
  "/booking",
  BookingRoute
);

app.use(
  "/time",
  TimeSlotRoute
);

/* =====================================================
   BOOKS AND REVIEWS
===================================================== */

app.use(
  "/book",
  BookRoute
);

app.use("/api/admin/finance", financeRoutes);
app.use(
  "/api/book/review",
  BookReviewRoute
);

app.use(
  "/admin/reviews",
  reviewRoute
);

/* =====================================================
   LEGACY ADMIN ROUTES
===================================================== */

app.use(
  "/admin",
  userRoute
);

/* =====================================================
   MOCK INTERVIEW ROUTES

   All public/admin interview APIs remain here.

   The Cashfree interview webhook is handled
   separately near the top of this index.js.

   IMPORTANT:
   Remove the duplicate webhook route from
   interviewRoutes.js.
===================================================== */

app.use(
  "/api/interviews",
  interviewRoutes
);

/* =====================================================
   GENERAL WEBSITE ROUTES
===================================================== */

app.use(
  "/messages",
  contactRoute
);

app.use(
  "/blogs",
  blogRoute
);

app.use(
  "/api/affiliate",
  affiliateRoutes
);

app.use(
  "/portfolio",
  portfolioRoute
);

app.use(
  "/affiliate",
  AffiliateRoute
);

app.use(
  "/interest",
  InterestRoute
);

app.use(
  "/client",
  ClientRoute
);

/* =====================================================
   BOOK MANAGEMENT
===================================================== */



// Auth + admin check are applied inside the router.
app.use(
  "/api/admin/analytics",
  analyticsReportRoutes
);

app.use(
  "/admin/books",
  paymentRoutes
);

app.use(
  "/api/admin/analytics",
  BookSalesRoute
);

app.use(
  "/api/admin/notification",
  OrderMailRoute
);

app.use(
  "/api/coupon",
  CouponRoute
);

/* All-Books pass: plans page, member status, book suggestions, admin */
app.use("/api/book-offers", bookOfferPublicRoutes);
app.use("/api/admin/book-offers", bookOfferAdminRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/admin/membership", membershipAdminRoutes);

/* =====================================================
   INTERVIEW EXPERIENCE CONTENT API

   This is your old interview experience
   content route, not mock interview bookings.
===================================================== */

app.use(
  "/api/interview",
  InterviewExperience
);

/* =====================================================
   EMAIL CAMPAIGNS
===================================================== */

app.use(
  "/api/admin/email-campaigns",
  emailCampaignRoutes
);

// Campaign Studio: audiences, templates, queue-backed sending, DLQ.
app.use(
  "/api/admin/campaigns",
  marketingCampaignRoutes
);


/* =====================================================
   404 HANDLER
===================================================== */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Resource not found on this server.",
    path: req.originalUrl,
  });
});

/* =====================================================
   GLOBAL ERROR HANDLER
===================================================== */

app.use((err, req, res, next) => {
  /*
    Avoid exposing sensitive webhook or
    payment details in public responses.
  */

  const isInterviewWebhook =
    req.path ===
    INTERVIEW_CASHFREE_WEBHOOK;

  if (isInterviewWebhook) {
    console.error(
      "[INTERVIEW WEBHOOK ERROR]",
      {
        status:
          err.status ||
          err.statusCode ||
          500,

        message: err.message,
      }
    );
  } else {
    console.error(
      "Global Error Handler:",
      err
    );
  }

  if (res.headersSent) {
    return next(err);
  }

  if (
    err.type === "entity.too.large"
  ) {
    return res.status(413).json({
      success: false,
      message: "Request payload is too large",
    });
  }

  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  const status =
    err.status ||
    err.statusCode ||
    500;

  return res.status(status).json({
    success: false,

    message:
      status >= 500
        ? "Internal server error"
        : err.message || "Request failed",
  });
});

/* =====================================================
   START SERVER
===================================================== */

const startServer = async () => {
  try {
    await connectDB();

    // Bring data written by older versions up to the current shape (idempotent).
    await migrateLegacyArenaData().catch((error) =>
      console.error("[arena] legacy data migration failed:", error.message)
    );
    await dropLegacyMemoryIndexes().catch((error) =>
      console.error("[memory] leftover index cleanup failed:", error.message)
    );

    startAnalyticsJobs();
    startEbookEmailSweeper();
    await backfillExpiry().catch((error) => console.error("[memory] expiry backfill failed:", error.message));
    startStorageSweeper();
    startExpirySweeper();

    // Background email: consumes the Amazon SQS email queue (no-op if SQS is not configured).
    startMailWorker();

    // Release abandoned arena checkouts (and their coupon reservations).
    const arenaMaintenance = () =>
      Promise.all([sweepAbandonedEntries(), healPaidMembers()]).catch((error) =>
        console.error("[arena] maintenance failed:", error.message)
      );
    arenaMaintenance(); // also repairs anything stuck before this start-up
    const arenaSweeper = setInterval(arenaMaintenance, 10 * 60 * 1000);
    arenaSweeper.unref();

    // Remove expired / revoked device sessions so only active devices remain.
    const sessionSweep = () =>
      sweepSessions().catch((error) =>
        console.error("[sessions] cleanup failed:", error.message)
      );
    sessionSweep();
    setInterval(sessionSweep, 10 * 60 * 1000).unref();

    // Meta Ads: re-send any Meta-ad sale the server could not report the first time (no-op without META_CAPI_ACCESS_TOKEN).
    const metaSweep = () =>
      resendMissedMetaPurchases().catch((error) =>
        console.error("[meta-capi] sweep failed:", error.message)
      );
    setTimeout(metaSweep, 60 * 1000).unref();
    setInterval(metaSweep, 15 * 60 * 1000).unref();

    const server = app.listen(PORT, () => {
      console.log(
        `Target Trek Backend running on port ${PORT}`
      );

      console.log(
        `Environment: ${
          process.env.NODE_ENV ||
          "development"
        }`
      );
    });

    // Real-time chat for matched buddies (ws://host/ws/arena).
    attachArenaSocket(server, { isOriginAllowed });
  } catch (error) {
    console.error(
      "Failed to start Target Trek Backend:",
      error
    );

    process.exit(1);
  }
};

startServer();

export default app;
