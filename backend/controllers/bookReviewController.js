import crypto from "crypto";
import mongoose from "mongoose";

import Book from "../models/Book.js";
import Order from "../models/Order.js";
import BookReview from "../models/BookReview.js";


import sendMail  from "../utils/MailSender.js";

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

const escapeRegex = (value = "") => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const getAdminIdentifier = (req) => {
  return (
    req.user?.email ||
    req.user?.username ||
    req.user?.name ||
    req.user?._id?.toString() ||
    "admin"
  );
};

const generateReviewToken = () => {
  return crypto
    .randomBytes(32)
    .toString("hex");
};

const getFrontendUrl = () => {
  return (
    process.env.FRONTEND_URL ||
    "https://www.targettrek.in"
  ).replace(/\/$/, "");
};

const buildReviewUrl = (token) => {
  return `${getFrontendUrl()}/review/${token}`;
};

// ======================================================
// FIND ORDER
// Supports Mongo _id OR orderId
// ======================================================

const findOrder = async (orderIdentifier) => {
  if (
    mongoose.Types.ObjectId.isValid(
      orderIdentifier
    )
  ) {
    const order =
      await Order.findById(
        orderIdentifier
      );

    if (order) {
      return order;
    }
  }

  return Order.findOne({
    orderId: orderIdentifier,
  });
};

// ======================================================
// VALIDATE PURCHASE
// ======================================================

const getPurchaseContext =
  async (orderIdentifier) => {
    const order =
      await findOrder(
        orderIdentifier
      );

    if (!order) {
      return {
        error: true,
        status: 404,
        message: "Order not found.",
      };
    }

    const allowedOrderStatuses = [
      "PAID",
      "PARTIALLY_REFUNDED",
    ];

    const allowedPaymentStatuses = [
      "SUCCESS",
      "PARTIALLY_REFUNDED",
    ];

    if (
      !allowedOrderStatuses.includes(
        order.orderStatus
      ) ||
      !allowedPaymentStatuses.includes(
        order.payment?.status
      )
    ) {
      return {
        error: true,
        status: 400,
        message:
          "Review can only be requested for a successful purchase.",
      };
    }

    const email =
      normalizeEmail(
        order.customer?.email
      );

    if (!email) {
      return {
        error: true,
        status: 400,
        message:
          "Customer email is not available for this order.",
      };
    }

    const book =
      await Book.findById(
        order.bookId
      );

    if (!book) {
      return {
        error: true,
        status: 404,
        message:
          "Book associated with this order was not found.",
      };
    }

    return {
      error: false,
      order,
      book,
      email,
    };
  };

// ======================================================
// FIND EXISTING BOOK REVIEW
// ======================================================

const findExistingBookReview =
  async (bookId, email) => {
    return BookReview.findOne({
      bookId,
      "customer.email":
        normalizeEmail(email),
    }).select(
      "+customer.name +customer.email +reviewLink.token"
    );
  };

// ======================================================
// GET OR CREATE REVIEW LINK
//
// Used by:
// 1. Admin Create Link
// 2. Admin Send Mail
// ======================================================

const ensureBookReviewLink =
  async ({
    order,
    book,
    email,
    admin,
  }) => {
    let bookReview =
      await findExistingBookReview(
        book._id,
        email
      );

    if (bookReview) {
      if (bookReview.isDeleted) {
        return {
          error: true,
          status: 409,
          code: "REVIEW_DELETED",
          message:
            "This review record is soft deleted. Restore it before generating or sending the review link.",
        };
      }

      if (
        bookReview.isReviewed ||
        bookReview.status ===
          "REVIEW_SUBMITTED"
      ) {
        return {
          error: true,
          status: 409,
          code: "ALREADY_REVIEWED",
          message:
            "Customer has already submitted a review for this book.",
          bookReview,
        };
      }

      if (
        bookReview.reviewLink?.token
      ) {
        return {
          error: false,
          created: false,
          bookReview,
          reviewUrl:
            buildReviewUrl(
              bookReview.reviewLink
                .token
            ),
        };
      }

      const token =
        generateReviewToken();

      bookReview.reviewLink.token =
        token;

      bookReview.reviewLink.generatedAt =
        new Date();

      bookReview.reviewLink.generatedBy =
        admin;

      bookReview.updatedBy =
        admin;

      await bookReview.save();

      return {
        error: false,
        created: true,
        bookReview,
        reviewUrl:
          buildReviewUrl(token),
      };
    }

    const token =
      generateReviewToken();

    try {
      bookReview =
        await BookReview.create({
          bookId: book._id,

          book: {
            title: book.title,
            slug: book.slug,
            coverPageUrl:
              book.coverPageUrl || "",
          },

          orderId: order._id,

          orderNumber:
            order.orderId,

          customer: {
            name:
              order.customer?.name ||
              null,

            email,
          },

          reviewLink: {
            token,
            generatedAt:
              new Date(),
            generatedBy:
              admin,
          },

          status:
            "LINK_GENERATED",

          isReviewed:
            false,

          isActive:
            true,

          verifiedPurchase:
            true,

          createdBy:
            admin,
        });

      return {
        error: false,
        created: true,
        bookReview,
        reviewUrl:
          buildReviewUrl(token),
      };
    } catch (error) {
      // Handles two simultaneous requests.
      if (error?.code === 11000) {
        bookReview =
          await findExistingBookReview(
            book._id,
            email
          );

        if (!bookReview) {
          throw error;
        }

        if (bookReview.isDeleted) {
          return {
            error: true,
            status: 409,
            code: "REVIEW_DELETED",
            message:
              "This review record is soft deleted.",
          };
        }

        if (bookReview.isReviewed) {
          return {
            error: true,
            status: 409,
            code: "ALREADY_REVIEWED",
            message:
              "Customer has already submitted a review.",
          };
        }

        return {
          error: false,
          created: false,
          bookReview,
          reviewUrl:
            buildReviewUrl(
              bookReview.reviewLink
                .token
            ),
        };
      }

      throw error;
    }
  };

// ======================================================
// VALIDATE REVIEW BODY
// ======================================================

const validateReviewPayload = ({
  rating,
  title,
  comment,
}) => {
  const numericRating =
    Number(rating);

  if (
    !Number.isInteger(
      numericRating
    ) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return {
      valid: false,
      message:
        "Rating must be an integer between 1 and 5.",
    };
  }

  const cleanedTitle =
    String(title || "").trim();

  const cleanedComment =
    String(comment || "").trim();

  if (
    cleanedTitle.length > 120
  ) {
    return {
      valid: false,
      message:
        "Review title cannot exceed 120 characters.",
    };
  }

  if (!cleanedComment) {
    return {
      valid: false,
      message:
        "Review comment is required.",
    };
  }

  if (
    cleanedComment.length < 5
  ) {
    return {
      valid: false,
      message:
        "Review must contain at least 5 characters.",
    };
  }

  if (
    cleanedComment.length > 3000
  ) {
    return {
      valid: false,
      message:
        "Review cannot exceed 3000 characters.",
    };
  }

  return {
    valid: true,

    data: {
      rating: numericRating,
      title: cleanedTitle,
      comment: cleanedComment,
    },
  };
};

// ======================================================
// REVIEW MAIL HTML
// ======================================================

const buildReviewMailHtml = ({
  customerName,
  book,
  reviewUrl,
}) => {
  const safeName =
    escapeHtml(
      customerName || "Reader"
    );

  const safeTitle =
    escapeHtml(book.title);

  const safeCover =
    escapeHtml(
      book.coverPageUrl || ""
    );

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>

      <body
        style="
          margin:0;
          padding:0;
          background:#f8fafc;
          font-family:Arial,Helvetica,sans-serif;
          color:#0f172a;
        "
      >
        <div
          style="
            max-width:620px;
            margin:0 auto;
            padding:30px 16px;
          "
        >
          <div
            style="
              background:#ffffff;
              border:1px solid #e2e8f0;
              border-radius:16px;
              padding:32px;
            "
          >
            <h2
              style="
                margin:0 0 18px;
                font-size:24px;
              "
            >
              Share your experience
            </h2>

            <p
              style="
                font-size:16px;
                line-height:1.6;
              "
            >
              Hi ${safeName},
            </p>

            <p
              style="
                font-size:16px;
                line-height:1.6;
              "
            >
              Thank you for purchasing
              <strong>${safeTitle}</strong>
              from Target Trek.
            </p>

            ${
              safeCover
                ? `
                  <div
                    style="
                      text-align:center;
                      margin:24px 0;
                    "
                  >
                    <img
                      src="${safeCover}"
                      alt="${safeTitle}"
                      style="
                        max-width:170px;
                        width:100%;
                        border-radius:10px;
                        border:1px solid #e2e8f0;
                      "
                    />
                  </div>
                `
                : ""
            }

            <p
              style="
                font-size:16px;
                line-height:1.6;
              "
            >
              We'd love to hear your experience
              with the book. Your feedback helps
              us improve our resources and helps
              other learners.
            </p>

            <div
              style="
                text-align:center;
                margin:30px 0;
              "
            >
              <a
                href="${reviewUrl}"
                style="
                  display:inline-block;
                  background:#0f172a;
                  color:#ffffff;
                  text-decoration:none;
                  padding:14px 28px;
                  border-radius:8px;
                  font-weight:bold;
                  font-size:16px;
                "
              >
                Write a Review
              </a>
            </div>

            <p
              style="
                font-size:13px;
                line-height:1.6;
                color:#64748b;
              "
            >
              This review link is unique to your
              purchase. You can submit a review
              only once.
            </p>

            <hr
              style="
                border:none;
                border-top:1px solid #e2e8f0;
                margin:28px 0;
              "
            />

            <p
              style="
                font-size:13px;
                color:#64748b;
                line-height:1.6;
              "
            >
              Target Trek<br/>
              support@targettrek.in
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// ======================================================
// ADMIN
// CREATE / GET REVIEW LINK
//
// POST
// /api/book-reviews/admin/order/:orderIdentifier/link
// ======================================================

export const createBookReviewLink =
  async (req, res) => {
    try {
      const {
        orderIdentifier,
      } = req.params;

      const purchase =
        await getPurchaseContext(
          orderIdentifier
        );

      if (purchase.error) {
        return res
          .status(purchase.status)
          .json({
            success: false,
            message:
              purchase.message,
          });
      }

      const {
        order,
        book,
        email,
      } = purchase;

      const admin =
        getAdminIdentifier(req);

      const result =
        await ensureBookReviewLink({
          order,
          book,
          email,
          admin,
        });

      if (result.error) {
        return res
          .status(result.status)
          .json({
            success: false,
            code: result.code,
            message:
              result.message,
          });
      }

      return res
        .status(
          result.created
            ? 201
            : 200
        )
        .json({
          success: true,

          message:
            result.created
              ? "Book review link generated successfully."
              : "Book review link already exists.",

          data: {
            bookReviewId:
              result.bookReview._id,

            alreadyGenerated:
              !result.created,

            reviewUrl:
              result.reviewUrl,

            generatedAt:
              result.bookReview
                .reviewLink
                .generatedAt,

            order: {
              _id: order._id,
              orderId:
                order.orderId,
            },

            book: {
              _id: book._id,
              title:
                book.title,
              slug:
                book.slug,
              coverPageUrl:
                book.coverPageUrl,
            },
          },
        });
    } catch (error) {
      console.error(
        "createBookReviewLink:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to generate book review link.",
        });
    }
  };

// ======================================================
// ADMIN
// SEND REVIEW MAIL
//
// POST
// /api/book-reviews/admin/order/:orderIdentifier/send-mail
//
// If link doesn't exist -> creates it.
// If link exists -> uses same link.
// If reviewed -> mail not sent.
// ======================================================

export const sendBookReviewMail =
  async (req, res) => {
    try {
      const {
        orderIdentifier,
      } = req.params;

      const purchase =
        await getPurchaseContext(
          orderIdentifier
        );

      if (purchase.error) {
        return res
          .status(purchase.status)
          .json({
            success: false,
            message:
              purchase.message,
          });
      }

      const {
        order,
        book,
        email,
      } = purchase;

      const admin =
        getAdminIdentifier(req);

      const result =
        await ensureBookReviewLink({
          order,
          book,
          email,
          admin,
        });

      if (result.error) {
        return res
          .status(result.status)
          .json({
            success: false,
            code: result.code,
            message:
              result.message,
          });
      }

      const bookReview =
        result.bookReview;

      const reviewUrl =
        result.reviewUrl;

      const html =
        buildReviewMailHtml({
          customerName:
            order.customer?.name,

          book,

          reviewUrl,
        });

      const now =
        new Date();

      bookReview.reviewMail.lastAttemptAt =
        now;

      bookReview.reviewMail.lastSentBy =
        admin;

      try {
        // Uses your existing external mail function.
        await sendMail({
          to: email,

          subject:
            `Share your review for ${book.title}`,

          html,
        });

        bookReview.reviewMail.sentCount =
          (
            bookReview.reviewMail
              .sentCount || 0
          ) + 1;

        if (
          !bookReview.reviewMail
            .firstSentAt
        ) {
          bookReview.reviewMail.firstSentAt =
            now;
        }

        bookReview.reviewMail.lastSentAt =
          now;

        bookReview.reviewMail.lastStatus =
          "SENT";

        bookReview.reviewMail.lastError =
          null;

        bookReview.updatedBy =
          admin;

        await bookReview.save();

        return res
          .status(200)
          .json({
            success: true,

            message:
              "Book review mail sent successfully.",

            data: {
              bookReviewId:
                bookReview._id,

              reviewUrl,

              linkCreated:
                result.created,

              sentCount:
                bookReview.reviewMail
                  .sentCount,

              firstSentAt:
                bookReview.reviewMail
                  .firstSentAt,

              lastSentAt:
                bookReview.reviewMail
                  .lastSentAt,

              order: {
                orderId:
                  order.orderId,
              },

              book: {
                _id:
                  book._id,

                title:
                  book.title,

                slug:
                  book.slug,
              },
            },
          });
      } catch (mailError) {
        bookReview.reviewMail.lastStatus =
          "FAILED";

        bookReview.reviewMail.lastError =
          String(
            mailError?.message ||
              "Unknown mail error"
          ).slice(0, 1000);

        bookReview.updatedBy =
          admin;

        await bookReview.save();

        console.error(
          "sendBookReviewMail mail error:",
          mailError
        );

        return res
          .status(502)
          .json({
            success: false,

            message:
              "Book review link is available, but email could not be sent.",

            data: {
              bookReviewId:
                bookReview._id,

              reviewUrl,
            },
          });
      }
    } catch (error) {
      console.error(
        "sendBookReviewMail:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to send book review mail.",
        });
    }
  };

// ======================================================
// PUBLIC
// OPEN / VERIFY REVIEW LINK
//
// GET
// /api/book-reviews/link/:token
//
// CUSTOMER NAME / EMAIL NEVER RETURNED.
// ======================================================

export const getBookReviewLink =
  async (req, res) => {
    try {
      const { token } =
        req.params;

      if (
        !token ||
        token.length < 32
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid review link.",
          });
      }

      const bookReview =
        await BookReview.findOne({
          "reviewLink.token":
            token,

          isDeleted: false,
        }).select(
          "+reviewLink.token"
        );

      if (!bookReview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Review link is invalid or no longer available.",
          });
      }

      if (
        bookReview.isReviewed ||
        bookReview.status ===
          "REVIEW_SUBMITTED"
      ) {
        return res
          .status(200)
          .json({
            success: true,

            data: {
              canReview: false,

              reason:
                "ALREADY_REVIEWED",

              message:
                "Review has already been submitted for this book.",

              book: {
                _id:
                  bookReview.bookId,

                title:
                  bookReview.book
                    .title,

                slug:
                  bookReview.book
                    .slug,

                coverPageUrl:
                  bookReview.book
                    .coverPageUrl,
              },
            },
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          data: {
            canReview: true,

            book: {
              _id:
                bookReview.bookId,

              title:
                bookReview.book
                  .title,

              slug:
                bookReview.book
                  .slug,

              coverPageUrl:
                bookReview.book
                  .coverPageUrl,
            },

            reviewFields: {
              rating: {
                min: 1,
                max: 5,
                required: true,
              },

              title: {
                required: false,
                maxLength: 120,
              },

              comment: {
                required: true,
                minLength: 5,
                maxLength: 3000,
              },
            },
          },
        });
    } catch (error) {
      console.error(
        "getBookReviewLink:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to verify review link.",
        });
    }
  };

// ======================================================
// PUBLIC
// SUBMIT REVIEW
//
// POST
// /api/book-reviews/link/:token
//
// BODY:
// {
//   "rating": 5,
//   "title": "Very useful",
//   "comment": "Great book..."
// }
// ======================================================

export const submitBookReview =
  async (req, res) => {
    try {
      const { token } =
        req.params;

      if (
        !token ||
        token.length < 32
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid review link.",
          });
      }

      const validation =
        validateReviewPayload(
          req.body
        );

      if (!validation.valid) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              validation.message,
          });
      }

      const {
        rating,
        title,
        comment,
      } = validation.data;

      const now =
        new Date();

      // Atomic update prevents double submission
      // from multiple simultaneous requests.
      const bookReview =
        await BookReview.findOneAndUpdate(
          {
            "reviewLink.token":
              token,

            isDeleted: false,

            isReviewed: false,

            status:
              "LINK_GENERATED",
          },
          {
            $set: {
              "review.rating":
                rating,

              "review.title":
                title,

              "review.comment":
                comment,

              "review.submittedAt":
                now,

              "review.lastEditedAt":
                null,

              "review.lastEditedBy":
                null,

              "review.editedByAdmin":
                false,

              status:
                "REVIEW_SUBMITTED",

              isReviewed:
                true,

              isActive:
                true,

              updatedBy:
                "customer",
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!bookReview) {
        const existing =
          await BookReview.findOne({
            "reviewLink.token":
              token,
          });

        if (!existing) {
          return res
            .status(404)
            .json({
              success: false,
              message:
                "Review link is invalid.",
            });
        }

        if (existing.isDeleted) {
          return res
            .status(410)
            .json({
              success: false,
              message:
                "This review link is no longer available.",
            });
        }

        if (
          existing.isReviewed ||
          existing.status ===
            "REVIEW_SUBMITTED"
        ) {
          return res
            .status(409)
            .json({
              success: false,
              code:
                "ALREADY_REVIEWED",
              message:
                "You have already submitted a review for this book.",
            });
        }

        return res
          .status(400)
          .json({
            success: false,
            message:
              "Unable to submit review.",
          });
      }

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Thank you! Your review has been submitted successfully.",

          data: {
            bookReviewId:
              bookReview._id,

            book: {
              _id:
                bookReview.bookId,

              title:
                bookReview.book
                  .title,

              slug:
                bookReview.book
                  .slug,
            },

            review: {
              rating:
                bookReview.review
                  .rating,

              title:
                bookReview.review
                  .title,

              comment:
                bookReview.review
                  .comment,

              submittedAt:
                bookReview.review
                  .submittedAt,
            },
          },
        });
    } catch (error) {
      console.error(
        "submitBookReview:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to submit book review.",
        });
    }
  };

// ======================================================
// PUBLIC
// GET REVIEWS FOR A BOOK
//
// GET
// /api/book-reviews/book/:bookIdentifier
//
// bookIdentifier can be:
// Mongo ObjectId
// OR slug
//
// Query:
// ?page=1
// &limit=10
// &rating=5
// &sort=newest
//
// sort:
// newest
// oldest
// highest
// lowest
// ======================================================

export const getPublicBookReviews =
  async (req, res) => {
    try {
      const {
        bookIdentifier,
      } = req.params;

      let book = null;

      if (
        mongoose.Types.ObjectId.isValid(
          bookIdentifier
        )
      ) {
        book =
          await Book.findById(
            bookIdentifier
          )
            .select(
              "title slug coverPageUrl"
            )
            .lean();
      }

      if (!book) {
        book =
          await Book.findOne({
            slug:
              String(
                bookIdentifier
              )
                .trim()
                .toLowerCase(),
          })
            .select(
              "title slug coverPageUrl"
            )
            .lean();
      }

      if (!book) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book not found.",
          });
      }

      const page =
        Math.max(
          Number(req.query.page) ||
            1,
          1
        );

      const limit =
        Math.min(
          Math.max(
            Number(
              req.query.limit
            ) || 10,
            1
          ),
          50
        );

      const skip =
        (page - 1) * limit;

      const filter = {
        bookId: book._id,

        status:
          "REVIEW_SUBMITTED",

        isReviewed: true,

        isActive: true,

        isDeleted: false,
      };

      if (
        req.query.rating !==
        undefined
      ) {
        const rating =
          Number(
            req.query.rating
          );

        if (
          !Number.isInteger(
            rating
          ) ||
          rating < 1 ||
          rating > 5
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Rating filter must be between 1 and 5.",
            });
        }

        filter[
          "review.rating"
        ] = rating;
      }

      let sort = {
        "review.submittedAt": -1,
      };

      switch (
        req.query.sort
      ) {
        case "oldest":
          sort = {
            "review.submittedAt": 1,
          };
          break;

        case "highest":
          sort = {
            "review.rating": -1,
            "review.submittedAt": -1,
          };
          break;

        case "lowest":
          sort = {
            "review.rating": 1,
            "review.submittedAt": -1,
          };
          break;

        default:
          sort = {
            "review.submittedAt": -1,
          };
      }

      const statsFilter = {
        bookId: book._id,
        status:
          "REVIEW_SUBMITTED",
        isReviewed: true,
        isActive: true,
        isDeleted: false,
      };

      const [
        bookReviews,
        total,
        stats,
      ] = await Promise.all([
        BookReview.find(filter)
          .select(
            "review verifiedPurchase"
          )
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),

        BookReview.countDocuments(
          filter
        ),

        BookReview.aggregate([
          {
            $match:
              statsFilter,
          },

          {
            $group: {
              _id: null,

              totalReviews: {
                $sum: 1,
              },

              averageRating: {
                $avg:
                  "$review.rating",
              },

              rating1: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$review.rating",
                        1,
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              rating2: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$review.rating",
                        2,
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              rating3: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$review.rating",
                        3,
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              rating4: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$review.rating",
                        4,
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              rating5: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$review.rating",
                        5,
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
      ]);

      const reviewStats =
        stats[0] || {
          totalReviews: 0,
          averageRating: 0,
          rating1: 0,
          rating2: 0,
          rating3: 0,
          rating4: 0,
          rating5: 0,
        };

      return res
        .status(200)
        .json({
          success: true,

          data: {
            book,

            stats: {
              totalReviews:
                reviewStats
                  .totalReviews,

              averageRating:
                Number(
                  reviewStats
                    .averageRating ||
                    0
                ).toFixed(1),

              distribution: {
                1:
                  reviewStats.rating1,
                2:
                  reviewStats.rating2,
                3:
                  reviewStats.rating3,
                4:
                  reviewStats.rating4,
                5:
                  reviewStats.rating5,
              },
            },

            reviews:
              bookReviews.map(
                (item) => ({
                  _id:
                    item._id,

                  reviewer:
                    "Verified Buyer",

                  verifiedPurchase:
                    item.verifiedPurchase,

                  rating:
                    item.review
                      .rating,

                  title:
                    item.review
                      .title,

                  comment:
                    item.review
                      .comment,

                  submittedAt:
                    item.review
                      .submittedAt,
                })
              ),

            pagination: {
              page,
              limit,
              total,

              totalPages:
                Math.ceil(
                  total / limit
                ),

              hasNextPage:
                page * limit <
                total,

              hasPreviousPage:
                page > 1,
            },
          },
        });
    } catch (error) {
      console.error(
        "getPublicBookReviews:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to fetch book reviews.",
        });
    }
  };

// ======================================================
// ADMIN
// GET ALL BOOK REVIEWS
//
// GET
// /api/book-reviews/admin
//
// Query Examples:
//
// ?page=1
// &limit=20
// &search=lavi
// &bookId=...
// &status=REVIEW_SUBMITTED
// &isActive=true
// &deleted=false
// &rating=5
// &mailStatus=SENT
// ======================================================

export const getAllBookReviews =
  async (req, res) => {
    try {
      const page =
        Math.max(
          Number(req.query.page) ||
            1,
          1
        );

      const limit =
        Math.min(
          Math.max(
            Number(
              req.query.limit
            ) || 20,
            1
          ),
          100
        );

      const skip =
        (page - 1) * limit;

      const filter = {};

      // ------------------------------------------
      // BOOK
      // ------------------------------------------

      if (req.query.bookId) {
        if (
          !mongoose.Types.ObjectId.isValid(
            req.query.bookId
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Invalid bookId.",
            });
        }

        filter.bookId =
          req.query.bookId;
      }

      // ------------------------------------------
      // STATUS
      // ------------------------------------------

      if (req.query.status) {
        if (
          ![
            "LINK_GENERATED",
            "REVIEW_SUBMITTED",
          ].includes(
            req.query.status
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Invalid review status.",
            });
        }

        filter.status =
          req.query.status;
      }

      // ------------------------------------------
      // ACTIVE
      // ------------------------------------------

      if (
        req.query.isActive ===
        "true"
      ) {
        filter.isActive = true;
      }

      if (
        req.query.isActive ===
        "false"
      ) {
        filter.isActive = false;
      }

      // ------------------------------------------
      // DELETED
      // ------------------------------------------

      if (
        req.query.deleted ===
        "true"
      ) {
        filter.isDeleted = true;
      } else if (
        req.query.deleted ===
        "all"
      ) {
        // No isDeleted filter.
      } else {
        filter.isDeleted = false;
      }

      // ------------------------------------------
      // RATING
      // ------------------------------------------

      if (
        req.query.rating !==
        undefined
      ) {
        const rating =
          Number(
            req.query.rating
          );

        if (
          !Number.isInteger(
            rating
          ) ||
          rating < 1 ||
          rating > 5
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Rating must be between 1 and 5.",
            });
        }

        filter[
          "review.rating"
        ] = rating;
      }

      // ------------------------------------------
      // MAIL STATUS
      // ------------------------------------------

      if (
        req.query.mailStatus
      ) {
        if (
          ![
            "NOT_SENT",
            "SENT",
            "FAILED",
          ].includes(
            req.query.mailStatus
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Invalid mail status.",
            });
        }

        filter[
          "reviewMail.lastStatus"
        ] =
          req.query.mailStatus;
      }

      // ------------------------------------------
      // SEARCH
      // ------------------------------------------

      if (
        req.query.search?.trim()
      ) {
        const search =
          new RegExp(
            escapeRegex(
              req.query.search.trim()
            ),
            "i"
          );

        filter.$or = [
          {
            "customer.name":
              search,
          },

          {
            "customer.email":
              search,
          },

          {
            orderNumber:
              search,
          },

          {
            "book.title":
              search,
          },

          {
            "book.slug":
              search,
          },

          {
            "review.title":
              search,
          },

          {
            "review.comment":
              search,
          },
        ];
      }

      const [
        bookReviews,
        total,
      ] = await Promise.all([
        BookReview.find(filter)
          .select(
            "+customer.name +customer.email +reviewLink.token"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        BookReview.countDocuments(
          filter
        ),
      ]);

      const results =
        bookReviews.map(
          (item) => ({
            ...item,

            reviewUrl:
              item.reviewLink
                ?.token
                ? buildReviewUrl(
                    item.reviewLink
                      .token
                  )
                : null,

            reviewLink: {
              generatedAt:
                item.reviewLink
                  ?.generatedAt,

              generatedBy:
                item.reviewLink
                  ?.generatedBy,
            },
          })
        );

      return res
        .status(200)
        .json({
          success: true,

          data: {
            bookReviews:
              results,

            pagination: {
              page,
              limit,
              total,

              totalPages:
                Math.ceil(
                  total / limit
                ),

              hasNextPage:
                page * limit <
                total,

              hasPreviousPage:
                page > 1,
            },
          },
        });
    } catch (error) {
      console.error(
        "getAllBookReviews:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to fetch book reviews.",
        });
    }
  };

// ======================================================
// ADMIN
// GET REVIEWS PER BOOK
//
// GET
// /api/book-reviews/admin/book/:bookId
// ======================================================

export const getBookReviewsForAdmin =
  async (req, res) => {
    try {
      const { bookId } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          bookId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid book ID.",
          });
      }

      const book =
        await Book.findById(
          bookId
        )
          .select(
            "title slug coverPageUrl price mrp currency"
          )
          .lean();

      if (!book) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book not found.",
          });
      }

      const page =
        Math.max(
          Number(req.query.page) ||
            1,
          1
        );

      const limit =
        Math.min(
          Math.max(
            Number(
              req.query.limit
            ) || 20,
            1
          ),
          100
        );

      const skip =
        (page - 1) * limit;

      const filter = {
        bookId:
          new mongoose.Types.ObjectId(
            bookId
          ),
      };

      if (
        req.query.status
      ) {
        filter.status =
          req.query.status;
      }

      if (
        req.query.isActive ===
        "true"
      ) {
        filter.isActive = true;
      }

      if (
        req.query.isActive ===
        "false"
      ) {
        filter.isActive = false;
      }

      if (
        req.query.deleted ===
        "true"
      ) {
        filter.isDeleted = true;
      } else if (
        req.query.deleted !==
        "all"
      ) {
        filter.isDeleted = false;
      }

      if (
        req.query.search?.trim()
      ) {
        const search =
          new RegExp(
            escapeRegex(
              req.query.search.trim()
            ),
            "i"
          );

        filter.$or = [
          {
            "customer.name":
              search,
          },

          {
            "customer.email":
              search,
          },

          {
            orderNumber:
              search,
          },

          {
            "review.title":
              search,
          },

          {
            "review.comment":
              search,
          },
        ];
      }

      const [
        bookReviews,
        total,
      ] = await Promise.all([
        BookReview.find(filter)
          .select(
            "+customer.name +customer.email +reviewLink.token"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        BookReview.countDocuments(
          filter
        ),
      ]);

      const results =
        bookReviews.map(
          (item) => ({
            ...item,

            reviewUrl:
              item.reviewLink
                ?.token
                ? buildReviewUrl(
                    item.reviewLink
                      .token
                  )
                : null,

            reviewLink: {
              generatedAt:
                item.reviewLink
                  ?.generatedAt,

              generatedBy:
                item.reviewLink
                  ?.generatedBy,
            },
          })
        );

      return res
        .status(200)
        .json({
          success: true,

          data: {
            book,

            bookReviews:
              results,

            pagination: {
              page,
              limit,
              total,

              totalPages:
                Math.ceil(
                  total / limit
                ),
            },
          },
        });
    } catch (error) {
      console.error(
        "getBookReviewsForAdmin:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to fetch book reviews.",
        });
    }
  };

// ======================================================
// ADMIN
// BOOK REVIEW STATS
//
// GET
// /api/book-reviews/admin/book/:bookId/stats
// ======================================================

export const getBookReviewStats =
  async (req, res) => {
    try {
      const { bookId } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          bookId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid book ID.",
          });
      }

      const objectBookId =
        new mongoose.Types.ObjectId(
          bookId
        );

      const book =
        await Book.findById(
          objectBookId
        )
          .select(
            "title slug coverPageUrl"
          )
          .lean();

      if (!book) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book not found.",
          });
      }

      const [
        total,
        totalActiveRecords,
        linksGenerated,
        submitted,
        activeReviews,
        inactiveReviews,
        deleted,
        ratingStats,
        mailStats,
      ] = await Promise.all([
        BookReview.countDocuments({
          bookId: objectBookId,
        }),

        BookReview.countDocuments({
          bookId: objectBookId,
          isDeleted: false,
        }),

        BookReview.countDocuments({
          bookId: objectBookId,
          status:
            "LINK_GENERATED",
          isDeleted: false,
        }),

        BookReview.countDocuments({
          bookId: objectBookId,
          status:
            "REVIEW_SUBMITTED",
          isDeleted: false,
        }),

        BookReview.countDocuments({
          bookId: objectBookId,
          status:
            "REVIEW_SUBMITTED",
          isActive: true,
          isDeleted: false,
        }),

        BookReview.countDocuments({
          bookId: objectBookId,
          status:
            "REVIEW_SUBMITTED",
          isActive: false,
          isDeleted: false,
        }),

        BookReview.countDocuments({
          bookId: objectBookId,
          isDeleted: true,
        }),

        BookReview.aggregate([
          {
            $match: {
              bookId:
                objectBookId,

              status:
                "REVIEW_SUBMITTED",

              isDeleted: false,
            },
          },

          {
            $group: {
              _id: null,

              averageRating: {
                $avg:
                  "$review.rating",
              },

              rating1: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$review.rating",
                        1,
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              rating2: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$review.rating",
                        2,
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              rating3: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$review.rating",
                        3,
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              rating4: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$review.rating",
                        4,
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              rating5: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$review.rating",
                        5,
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

        BookReview.aggregate([
          {
            $match: {
              bookId:
                objectBookId,
            },
          },

          {
            $group: {
              _id: null,

              totalEmailsSent: {
                $sum:
                  "$reviewMail.sentCount",
              },
            },
          },
        ]),
      ]);

      const rating =
        ratingStats[0] || {};

      return res
        .status(200)
        .json({
          success: true,

          data: {
            book,

            stats: {
              totalReviewRecords:
                total,

              totalActiveRecords,

              pendingReviews:
                linksGenerated,

              submittedReviews:
                submitted,

              activeReviews,

              inactiveReviews,

              deletedReviews:
                deleted,

              totalEmailsSent:
                mailStats[0]
                  ?.totalEmailsSent ||
                0,

              averageRating:
                Number(
                  rating.averageRating ||
                    0
                ).toFixed(1),

              ratingDistribution: {
                1:
                  rating.rating1 ||
                  0,

                2:
                  rating.rating2 ||
                  0,

                3:
                  rating.rating3 ||
                  0,

                4:
                  rating.rating4 ||
                  0,

                5:
                  rating.rating5 ||
                  0,
              },
            },
          },
        });
    } catch (error) {
      console.error(
        "getBookReviewStats:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to fetch book review statistics.",
        });
    }
  };

// ======================================================
// ADMIN
// GET SINGLE BOOK REVIEW
//
// GET
// /api/book-reviews/admin/:bookReviewId
// ======================================================

export const getBookReviewById =
  async (req, res) => {
    try {
      const {
        bookReviewId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          bookReviewId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid book review ID.",
          });
      }

      const bookReview =
        await BookReview.findById(
          bookReviewId
        )
          .select(
            "+customer.name +customer.email +reviewLink.token"
          )
          .lean();

      if (!bookReview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book review not found.",
          });
      }

      const token =
        bookReview.reviewLink
          ?.token;

      return res
        .status(200)
        .json({
          success: true,

          data: {
            bookReview: {
              ...bookReview,

              reviewUrl:
                token
                  ? buildReviewUrl(
                      token
                    )
                  : null,

              reviewLink: {
                generatedAt:
                  bookReview
                    .reviewLink
                    ?.generatedAt,

                generatedBy:
                  bookReview
                    .reviewLink
                    ?.generatedBy,
              },
            },
          },
        });
    } catch (error) {
      console.error(
        "getBookReviewById:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to fetch book review.",
        });
    }
  };

// ======================================================
// ADMIN
// UPDATE BOOK REVIEW
//
// PATCH
// /api/book-reviews/admin/:bookReviewId
//
// BODY CAN CONTAIN:
// {
//   "rating": 4,
//   "title": "...",
//   "comment": "...",
//   "isActive": true,
//   "adminNotes": "..."
// }
// ======================================================

export const updateBookReview =
  async (req, res) => {
    try {
      const {
        bookReviewId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          bookReviewId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid book review ID.",
          });
      }

      const bookReview =
        await BookReview.findById(
          bookReviewId
        ).select(
          "+customer.name +customer.email"
        );

      if (!bookReview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book review not found.",
          });
      }

      if (bookReview.isDeleted) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Restore the book review before updating it.",
          });
      }

      const admin =
        getAdminIdentifier(req);

      const {
        rating,
        title,
        comment,
        isActive,
        adminNotes,
      } = req.body;

      const wantsToEditReview =
        rating !== undefined ||
        title !== undefined ||
        comment !== undefined;

      if (
        wantsToEditReview &&
        !bookReview.isReviewed
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Review content cannot be edited because the customer has not submitted a review yet.",
          });
      }

      let reviewModified =
        false;

      if (
        rating !== undefined
      ) {
        const numericRating =
          Number(rating);

        if (
          !Number.isInteger(
            numericRating
          ) ||
          numericRating < 1 ||
          numericRating > 5
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Rating must be between 1 and 5.",
            });
        }

        bookReview.review.rating =
          numericRating;

        reviewModified = true;
      }

      if (
        title !== undefined
      ) {
        const cleanedTitle =
          String(title).trim();

        if (
          cleanedTitle.length >
          120
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Review title cannot exceed 120 characters.",
            });
        }

        bookReview.review.title =
          cleanedTitle;

        reviewModified = true;
      }

      if (
        comment !== undefined
      ) {
        const cleanedComment =
          String(comment).trim();

        if (
          cleanedComment.length <
            5 ||
          cleanedComment.length >
            3000
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Review comment must contain between 5 and 3000 characters.",
            });
        }

        bookReview.review.comment =
          cleanedComment;

        reviewModified = true;
      }

      if (
        typeof isActive ===
        "boolean"
      ) {
        bookReview.isActive =
          isActive;
      }

      if (
        adminNotes !== undefined
      ) {
        const notes =
          String(
            adminNotes
          ).trim();

        if (
          notes.length > 1000
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Admin notes cannot exceed 1000 characters.",
            });
        }

        bookReview.adminNotes =
          notes;
      }

      if (reviewModified) {
        bookReview.review.lastEditedAt =
          new Date();

        bookReview.review.lastEditedBy =
          admin;

        bookReview.review.editedByAdmin =
          true;
      }

      bookReview.updatedBy =
        admin;

      await bookReview.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Book review updated successfully.",

          data: {
            bookReview,
          },
        });
    } catch (error) {
      console.error(
        "updateBookReview:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to update book review.",
        });
    }
  };

// ======================================================
// ADMIN
// SOFT DELETE
//
// PATCH
// /api/book-reviews/admin/:bookReviewId/soft-delete
// ======================================================

export const softDeleteBookReview =
  async (req, res) => {
    try {
      const {
        bookReviewId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          bookReviewId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid book review ID.",
          });
      }

      const admin =
        getAdminIdentifier(req);

      const bookReview =
        await BookReview.findById(
          bookReviewId
        );

      if (!bookReview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book review not found.",
          });
      }

      if (bookReview.isDeleted) {
        return res
          .status(200)
          .json({
            success: true,
            message:
              "Book review is already deleted.",
          });
      }

      bookReview.isDeleted =
        true;

      bookReview.isActive =
        false;

      bookReview.deletedAt =
        new Date();

      bookReview.deletedBy =
        admin;

      bookReview.updatedBy =
        admin;

      await bookReview.save();

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Book review soft deleted successfully.",
        });
    } catch (error) {
      console.error(
        "softDeleteBookReview:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to delete book review.",
        });
    }
  };

// ======================================================
// ADMIN
// RESTORE SOFT-DELETED REVIEW
//
// PATCH
// /api/book-reviews/admin/:bookReviewId/restore
// ======================================================

export const restoreBookReview =
  async (req, res) => {
    try {
      const {
        bookReviewId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          bookReviewId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid book review ID.",
          });
      }

      const admin =
        getAdminIdentifier(req);

      const bookReview =
        await BookReview.findById(
          bookReviewId
        );

      if (!bookReview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book review not found.",
          });
      }

      if (!bookReview.isDeleted) {
        return res
          .status(200)
          .json({
            success: true,
            message:
              "Book review is already active.",
          });
      }

      bookReview.isDeleted =
        false;

      bookReview.deletedAt =
        null;

      bookReview.deletedBy =
        null;

      if (
        bookReview.isReviewed
      ) {
        bookReview.isActive =
          true;
      }

      bookReview.updatedBy =
        admin;

      await bookReview.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Book review restored successfully.",

          data: {
            bookReview,
          },
        });
    } catch (error) {
      console.error(
        "restoreBookReview:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to restore book review.",
        });
    }
  };

// ======================================================
// ADMIN
// HARD DELETE
//
// DELETE
// /api/book-reviews/admin/:bookReviewId
// ======================================================

export const hardDeleteBookReview =
  async (req, res) => {
    try {
      const {
        bookReviewId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          bookReviewId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid book review ID.",
          });
      }

      const bookReview =
        await BookReview.findById(
          bookReviewId
        );

      if (!bookReview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book review not found.",
          });
      }

      await BookReview.findByIdAndDelete(
        bookReviewId
      );

      return res
        .status(200)
        .json({
          success: true,
          message:
            "Book review permanently deleted successfully.",
        });
    } catch (error) {
      console.error(
        "hardDeleteBookReview:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to permanently delete book review.",
        });
    }
  };