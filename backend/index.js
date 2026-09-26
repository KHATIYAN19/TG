import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import dns from "node:dns/promises";

import connectDB from "./utils/dbConnection.js";

// ============================================================
// ROUTES
// ============================================================

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
import BookSalesRoute from "./routes/bookSales.js"
import OrderMailRoute from "./routes/orderMailRoute.js"
import CouponRoute from "./routes/couponRoute.js"
import payuRoutes from "./routes/payuRoutes.js";
import paymentRoutes from "./routes/paymentRoute.js"



import { globalRateLimiter } from "./Middleware/rateLimiter.js";

// ============================================================
// ENV
// ============================================================

dotenv.config();

// ============================================================
// DNS
// ============================================================

dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

// ============================================================
// EXPRESS
// ============================================================

const app = express();

// ============================================================
// CORS
//
// ALLOW REQUESTS FROM EVERY ORIGIN
//
// IMPORTANT:
// This MUST be before ALL routes.
// ============================================================

app.use(cors());

// ============================================================
// BODY PARSERS
// ============================================================

// React / Axios JSON requests
app.use(
  express.json({
    limit: "10mb",
  })
);

// PayU callbacks use application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ============================================================
// DATABASE
// ============================================================
app.use(globalRateLimiter);

connectDB();

// ============================================================
// PAYU ROUTES
// ============================================================

app.use(
  "/payment/payu",
  payuRoutes
);


// ============================================================
// EXISTING ROUTES
// ============================================================

app.use(
  "/booking",
  BookingRoute
);

app.use(
  "/time",
  TimeSlotRoute
);

app.use(
  "/admin",
  userRoute
);

app.use(
  "/admin/reviews",
  reviewRoute
);

app.use(
  "/messages",
  contactRoute
);

app.use(
  "/blogs",
  blogRoute
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

app.use(
  "/book",
  BookRoute
);

app.use(
  "/admin/books",
  paymentRoutes
)

app.use(
  "/api/admin/analytics",
  BookSalesRoute
)

app.use(
  "/api/admin/notification",
  OrderMailRoute
)
app.use(
  "/api/coupon",
  CouponRoute
)

// ============================================================
// HOME
// ============================================================

app.get(
  "/",
  (req, res) => {
    return res.send(
      "Booking API Running Successfully!"
    );
  }
);

// ============================================================
// HEALTH
// ============================================================

app.get(
  "/health",
  (req, res) => {
    return res.status(200).json({
      status: "OK",
      message: "Server is healthy",
    });
  }
);

// ============================================================
// 404
// ============================================================

app.use(
  (req, res) => {
    return res.status(404).json({
      success: false,
      message:
        "Resource not found on this server.",
    });
  }
);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "Global Error Handler:",
      err
    );

    return res
      .status(err.status || 500)
      .json({
        success: false,
        message:
          err.message ||
          "Internal Server Error",
      });
  }
);

// ============================================================
// START SERVER
// ============================================================

const PORT =
  process.env.PORT || 5001;

app.listen(
  PORT,
  () => {
    console.log(
      `Server started on port ${PORT}`
    );
  }
);