import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dns from "node:dns/promises";

import connectDB from "./utils/dbConnection.js";

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

import payuRoutes from "./routes/payuRoutes.js";
import razorpayRoute from "./routes/razorpayRoute.js";
import cashfreeRoute from "./routes/cashfreeRoute.js";

import paymentRoutes from "./routes/paymentRoute.js";
import emailCampaignRoutes from "./routes/emailCampaignRoutes.js";

import InterviewExperience from "./routes/InterviewExperience.js";
import BookReviewRoute from "./routes/bookReviewRoute.js";

import affiliateRoutes from "./routes/affiliateRoutes.js";


import { auth, isAdmin } from "./Middleware/auth.js";
/* =====================================================
   AUTHENTICATION ROUTES
===================================================== */


import analyticsReportRoutes from
  "./routes/analyticsReportRoutes.js";

import authRoutes from "./routes/authRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
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

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
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

app.use(cors(corsOptions));

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

   This is different from your existing
   ebook Cashfree webhook:

   /payment/cashfree/webhook

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

/* =====================================================
   GENERAL REQUEST BODY PARSING

   Preserve existing ebook Cashfree behavior.

   IMPORTANT:
   Your existing ebook Cashfree controller may read
   req.rawBody. Keep that behavior unchanged.

   Do not parse interview webhook here;
   it has already been handled above.
===================================================== */

app.use(
  express.json({
    limit: "10mb",

    verify: (req, res, buf) => {
      if (
        req.originalUrl.startsWith(
          "/payment/cashfree/webhook"
        )
      ) {
        // Preserve the original implementation's
        // string format for the existing ebook route.
        req.rawBody = buf.toString("utf8");
      }
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

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
    !allowedOrigins.has(origin)
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
   EXISTING PAYMENT ROUTES

   Keep these routes unchanged.
===================================================== */

app.use(
  "/payment/payu",
  payuRoutes
);

app.use(
  "/payment/razorpay",
  razorpayRoute
);

app.use(
  "/payment/cashfree",
  cashfreeRoute
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



app.use(
  "/api/admin/analytics",
  auth,
  isAdmin,
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

    app.listen(PORT, () => {
      console.log(
        `Target Trek Backend running on port ${PORT}`
      );

      console.log(
        `Environment: ${
          process.env.NODE_ENV ||
          "development"
        }`
      );

      console.log(
        "Authentication routes registered"
      );

      console.log(
        "Interview booking routes registered"
      );

      console.log(
        "Interview Cashfree webhook:",
        INTERVIEW_CASHFREE_WEBHOOK
      );
    });
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
