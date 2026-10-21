// import "dotenv/config";
// import express from "express";
// import cors from "cors";
// import dns from "node:dns/promises";

// import connectDB from "./utils/dbConnection.js";

// import BookingRoute from "./routes/Booking.js";
// import TimeSlotRoute from "./routes/TimeSlot.js";
// import userRoute from "./routes/User.js";
// import reviewRoute from "./routes/Review.js";
// import contactRoute from "./routes/Contact.js";
// import blogRoute from "./routes/Blog.js";
// import portfolioRoute from "./routes/Portfolio.js";
// import AffiliateRoute from "./routes/Affiliate.js";
// import InterestRoute from "./routes/Interest.js";
// import ClientRoute from "./routes/Client.js";
// import BookRoute from "./routes/bookRoute.js";
// import BookSalesRoute from "./routes/bookSales.js";
// import OrderMailRoute from "./routes/orderMailRoute.js";
// import CouponRoute from "./routes/couponRoute.js";
// import payuRoutes from "./routes/payuRoutes.js";
// import razorpayRoute from "./routes/razorpayRoute.js";
// import cashfreeRoute from "./routes/cashfreeRoute.js";
// import paymentRoutes from "./routes/paymentRoute.js";
// import emailCampaignRoutes from "./routes/emailCampaignRoutes.js";
// import InterviewExperience from "./routes/InterviewExperience.js";
// import BookReviewRoute from "./routes/bookReviewRoute.js";

// import { globalRateLimiter } from "./Middleware/rateLimiter.js";

// dns.setServers([
//   "8.8.8.8",
//   "1.1.1.1"
// ]);

// const app = express();

// app.set("trust proxy", 1);

// app.use(
//   cors()
// );

// app.use(
//   express.json({
//     limit: "10mb",
//     verify: (req, res, buf) => {
//       if (
//         req.originalUrl.startsWith(
//           "/payment/cashfree/webhook"
//         )
//       ) {
//         req.rawBody =
//           buf.toString("utf8");
//       }
//     }
//   })
// );

// app.use(
//   express.urlencoded({
//     extended: true,
//     limit: "10mb"
//   })
// );

// app.use(
//   globalRateLimiter
// );

// connectDB();

// app.use(
//   "/payment/payu",
//   payuRoutes
// );

// app.use(
//   "/payment/razorpay",
//   razorpayRoute
// );

// app.use(
//   "/payment/cashfree",
//   cashfreeRoute
// );

// app.use(
//   "/booking",
//   BookingRoute
// );

// app.use(
//   "/time",
//   TimeSlotRoute
// );

// app.use(
//   "/api/book/review",
//   BookReviewRoute
// );

// app.use(
//   "/admin",
//   userRoute
// );

// app.use(
//   "/admin/reviews",
//   reviewRoute
// );

// app.use(
//   "/messages",
//   contactRoute
// );

// app.use(
//   "/blogs",
//   blogRoute
// );

// app.use(
//   "/portfolio",
//   portfolioRoute
// );

// app.use(
//   "/affiliate",
//   AffiliateRoute
// );

// app.use(
//   "/interest",
//   InterestRoute
// );

// app.use(
//   "/client",
//   ClientRoute
// );

// app.use(
//   "/book",
//   BookRoute
// );

// app.use(
//   "/admin/books",
//   paymentRoutes
// );

// app.use(
//   "/api/admin/analytics",
//   BookSalesRoute
// );

// app.use(
//   "/api/admin/notification",
//   OrderMailRoute
// );

// app.use(
//   "/api/coupon",
//   CouponRoute
// );

// app.use(
//   "/api/interview",
//   InterviewExperience
// );

// app.use(
//   "/api/admin/email-campaigns",
//   emailCampaignRoutes
// );

// app.get(
//   "/",
//   (req, res) => {
//     return res.send(
//       "Booking API Running Successfully!"
//     );
//   }
// );

// app.get(
//   "/health",
//   (req, res) => {
//     return res.status(200).json({
//       status: "OK",
//       message: "Server is healthy"
//     });
//   }
// );

// app.use(
//   (req, res) => {
//     return res.status(404).json({
//       success: false,
//       message:
//         "Resource not found on this server."
//     });
//   }
// );

// app.use(
//   (
//     err,
//     req,
//     res,
//     next
//   ) => {
//     console.error(
//       "Global Error Handler:",
//       err
//     );

//     return res
//       .status(
//         err.status ||
//         err.statusCode ||
//         500
//       )
//       .json({
//         success: false,
//         message:
//           err.message ||
//           "Internal Server Error"
//       });
//   }
// );

// const PORT =
//   process.env.PORT ||
//   5001;

// app.listen(
//   PORT,
//   () => {
//     console.log(
//       `Server started on port ${PORT}`
//     );
//   }
// );



import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dns from "node:dns/promises";

import connectDB from "./utils/dbConnection.js";
import affiliateRoutes from "./routes/affiliateRoutes.js";
/* =====================================================
   EXISTING ROUTES
===================================================== */

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

/* =====================================================
   NEW AUTHENTICATION ROUTES
===================================================== */

import authRoutes from "./routes/authRoutes.js";

import adminUserRoutes from "./routes/adminUserRoutes.js";

import userRoutes from "./routes/userRoutes.js";

/* =====================================================
   EXISTING RATE LIMITER
===================================================== */

import {
  globalRateLimiter,
} from "./Middleware/rateLimiter.js";

/* =====================================================
   DNS CONFIGURATION
===================================================== */

// Preserve your existing DNS configuration.
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

const PORT = Number(process.env.PORT || 5001);

const isProduction =
  process.env.NODE_ENV === "production";

/* =====================================================
   TRUST PROXY
===================================================== */

// Required behind Cloud Run's proxy.
// Review this setting against your real deployment.
app.set("trust proxy", 1);

/* =====================================================
   SECURITY HEADERS
===================================================== */

app.disable("x-powered-by");

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
  .map(origin => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  ...defaultOrigins,
  ...configuredOrigins,

  ...(isProduction
    ? []
    : developmentOrigins),

  process.env.FRONTEND_URL,
].filter(Boolean));

const corsOptions = {
  origin(origin, callback) {
    // Allow calls without an Origin header,
    // such as server-to-server requests.
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

// Required for:
// req.cookies.token
// req.cookies.tt_refresh
// req.cookies.tt_device

app.use(cookieParser());

/* =====================================================
   REQUEST BODY PARSING
===================================================== */

// Preserve raw request bytes for Cashfree webhook
// signature verification.
app.use(
  express.json({
    limit: "10mb",

    verify: (req, res, buf) => {
      if (
        req.originalUrl.startsWith(
          "/payment/cashfree/webhook"
        )
      ) {
        req.rawBody = Buffer.from(buf);
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
===================================================== */

// Keep your existing Upstash-backed limiter.
app.use(globalRateLimiter);

/* =====================================================
   SECURITY: COOKIE AUTH CSRF PROTECTION
===================================================== */

// For browser requests using refresh/device cookies,
// reject cross-site state-changing requests.
//
// A missing Origin is allowed for server-to-server
// requests. Cookie-auth endpoints should additionally
// enforce exact trusted origins or an explicit CSRF
// token when a browser can omit Origin.

const cookieAuthPaths = [
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/logout-all",
];

app.use((req, res, next) => {
  if (!cookieAuthPaths.includes(req.path)) {
    return next();
  }

  if (!["POST", "PUT", "PATCH", "DELETE"]
    .includes(req.method)) {
    return next();
  }

  const origin = req.get("origin");

  if (origin && !allowedOrigins.has(origin)) {
    return res.status(403).json({
      success: false,
      message: "Untrusted request origin",
    });
  }

  next();
});

/* =====================================================
   HEALTH CHECK ROUTES
===================================================== */

// Keep lightweight health checks before application
// routes so Cloud Run can check service availability.

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
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   NEW AUTHENTICATION SYSTEM
===================================================== */

// Login, OTP verification, refresh, logout,
// password setup.
app.use(
  "/api/auth",
  authRoutes
);

// User profile (read-only), personal devices,
// own login activity.
app.use(
  "/api/users",
  userRoutes
);

// Admin-only user management, roles, account status,
// password setup, sessions and activity monitoring.
app.use(
  "/api/admin/users",
  adminUserRoutes
);

/* =====================================================
   PAYMENT ROUTES
===================================================== */

// Existing payment paths remain unchanged.

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
   BOOKINGS
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

// Keep existing routes temporarily.
//
// IMPORTANT:
// Remove legacy public signup/login/password-reset
// endpoints from routes/User.js before production.
// They must not bypass the new auth security flow.

app.use(
  "/admin",
  userRoute
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
app.use("/api/affiliate", affiliateRoutes);

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

app.use(
  "/api/interview",
  InterviewExperience
);

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
  console.error(
    "Global Error Handler:",
    err
  );

  if (res.headersSent) {
    return next(err);
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request payload is too large",
    });
  }

  if (err instanceof SyntaxError &&
      err.status === 400 &&
      "body" in err) {
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
    // Ensure connectDB() awaits mongoose.connect().
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Target Trek Backend running on port ${PORT}`
      );

      console.log(
        `Environment: ${process.env.NODE_ENV || "development"}`
      );

      console.log(
        "Authentication routes registered"
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
