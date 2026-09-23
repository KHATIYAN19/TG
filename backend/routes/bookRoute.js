import express from "express";
import multer from "multer";

import {
  createBook,
  getAllBooks,
  getProductByRedirectUrl,
  getBookByIdForAdmin,
  getAllBooksForAdmin,
  updateBookByBookId,
  deleteBookById,
} from "../controllers/bookController.js";

import {
  auth,
  isAdmin,
} from "../Middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({});

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "coverPage") {
      const allowedImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (!allowedImageTypes.includes(file.mimetype)) {
        return cb(
          new Error(
            "Cover page must be a JPG, JPEG, PNG, or WEBP image."
          )
        );
      }

      return cb(null, true);
    }

    if (file.fieldname === "pdf") {
      if (file.mimetype !== "application/pdf") {
        return cb(
          new Error("Only PDF files are allowed.")
        );
      }

      return cb(null, true);
    }

    return cb(new Error("Invalid file field."));
  },
});

const productFiles = uploadMiddleware.fields([
  {
    name: "coverPage",
    maxCount: 1,
  },
  {
    name: "pdf",
    maxCount: 1,
  },
]);

router.post(
  "/admin/create",
  auth,
  isAdmin,
  productFiles,
  createBook
);

router.get(
  "/admin/all",
  auth,
  isAdmin,
  getAllBooksForAdmin
);

router.get(
  "/admin/:bookId",
  auth,
  isAdmin,
  getBookByIdForAdmin
);

router.patch(
  "/admin/:bookId",
  auth,
  isAdmin,
  productFiles,
  updateBookByBookId
);

router.delete(
  "/admin/:bookId",
  auth,
  isAdmin,
  deleteBookById
);

router.get(
  "/product",
  getProductByRedirectUrl
);

router.get(
  "/",
  getAllBooks
);

export default router;