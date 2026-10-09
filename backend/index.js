import "dotenv/config";
import express from "express";
import cors from "cors";
import dns from "node:dns/promises";

import connectDB from "./utils/dbConnection.js";

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

import { globalRateLimiter } from "./Middleware/rateLimiter.js";

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

const app = express();

app.set("trust proxy", 1);

app.use(
  cors()
);

app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      if (
        req.originalUrl.startsWith(
          "/payment/cashfree/webhook"
        )
      ) {
        req.rawBody =
          buf.toString("utf8");
      }
    }
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb"
  })
);

app.use(
  globalRateLimiter
);

connectDB();

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

app.use(
  "/booking",
  BookingRoute
);

app.use(
  "/time",
  TimeSlotRoute
);

app.use(
  "/api/book/review",
  BookReviewRoute
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

app.get(
  "/",
  (req, res) => {
    return res.send(
      "Booking API Running Successfully!"
    );
  }
);

app.get(
  "/health",
  (req, res) => {
    return res.status(200).json({
      status: "OK",
      message: "Server is healthy"
    });
  }
);

app.use(
  (req, res) => {
    return res.status(404).json({
      success: false,
      message:
        "Resource not found on this server."
    });
  }
);

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
      .status(
        err.status ||
        err.statusCode ||
        500
      )
      .json({
        success: false,
        message:
          err.message ||
          "Internal Server Error"
      });
  }
);

const PORT =
  process.env.PORT ||
  5001;

app.listen(
  PORT,
  () => {
    console.log(
      `Server started on port ${PORT}`
    );
  }
);