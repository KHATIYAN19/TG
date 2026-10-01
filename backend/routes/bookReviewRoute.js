import express from "express";

import {
  createBookReviewLink,
  sendBookReviewMail,

  getBookReviewLink,
  submitBookReview,
  getPublicBookReviews,

  getAllBookReviews,
  getBookReviewsForAdmin,
  getBookReviewStats,
  getBookReviewById,
  updateBookReview,
  softDeleteBookReview,
  restoreBookReview,
  hardDeleteBookReview,
} from "../controllers/bookReviewController.js";

import {
  auth,
  isAdmin,
} from "../Middleware/auth.js";

const router =
  express.Router();


router.get(
  "/book/:bookIdentifier",
  getPublicBookReviews
);

router.get(
  "/link/:token",
  getBookReviewLink
);


router.post(
  "/link/:token",
  submitBookReview
);


router.post(
  "/admin/order/:orderIdentifier/link",
  auth,
  isAdmin,
  createBookReviewLink
);


router.post(
  "/admin/order/:orderIdentifier/send-mail",
  auth,
  isAdmin,
  sendBookReviewMail
);


router.get(
  "/admin",
  auth,
  isAdmin,
  getAllBookReviews
);


router.get(
  "/admin/book/:bookId/stats",
  auth,
  isAdmin,
  getBookReviewStats
);


router.get(
  "/admin/book/:bookId",
  auth,
  isAdmin,
  getBookReviewsForAdmin
);


router.get(
  "/admin/:bookReviewId",
  auth,
  isAdmin,
  getBookReviewById
);


router.patch(
  "/admin/:bookReviewId",
  auth,
  isAdmin,
  updateBookReview
);


router.patch(
  "/admin/:bookReviewId/soft-delete",
  auth,
  isAdmin,
  softDeleteBookReview
);

router.patch(
  "/admin/:bookReviewId/restore",
  auth,
  isAdmin,
  restoreBookReview
);


router.delete(
  "/admin/:bookReviewId",
  auth,
  isAdmin,
  hardDeleteBookReview
);

export default router;