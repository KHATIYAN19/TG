import express from "express";
import multer from "multer";

import {
  createBlogPost,
  getAllPublishedBlogPosts,
  getAllBlogPostsAdmin,
  getBlogPostBySlug,
  getBlogPostByIdAdmin,
  updateBlogPost,

  setPublishStatus,
  togglePublishStatus,

  setFeaturedStatus,
  setEditorChoiceStatus,

  deleteBlogPost,
  getDeletedBlogPostsAdmin,
  restoreBlogPost,
  hardDeleteBlogPost,

  getBlogStats,
  getBlogCategories,

  recordBlogView,
} from "../controllers/Blog.js";

import {
  auth,
  isAdmin,
  isUser,
} from "../Middleware/auth.js";

const router =
  express.Router();

const storage =
  multer.diskStorage({});

const uploadMiddleware =
  multer({
    storage,

    limits: {
      fileSize:
        5 *
        1024 *
        1024,
    },

    fileFilter: (
      req,
      file,
      cb
    ) => {
      if (
        !file.mimetype.startsWith(
          "image/"
        )
      ) {
        return cb(
          new Error(
            "Only image uploads are allowed."
          )
        );
      }

      cb(null, true);
    },
  });

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getAllPublishedBlogPosts
);

router.get(
  "/meta/categories",
  getBlogCategories
);

router.post(
  "/:slug/view",
  recordBlogView
);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

router.post(
  "/admin",
  auth,
  isUser,
  uploadMiddleware.single(
    "imageFile"
  ),
  createBlogPost
);

router.get(
  "/admin/all",
  auth,
  isUser,
  getAllBlogPostsAdmin
);

router.get(
  "/admin/stats",
  auth,
  isUser,
  getBlogStats
);

router.get(
  "/admin/trash",
  auth,
  isUser,
  getDeletedBlogPostsAdmin
);

router.get(
  "/admin/:id",
  auth,
  isUser,
  getBlogPostByIdAdmin
);

router.patch(
  "/admin/:id",
  auth,
  isUser,
  uploadMiddleware.single(
    "imageFile"
  ),
  updateBlogPost
);

router.patch(
  "/admin/:id/status",
  auth,
  isUser,
  setPublishStatus
);

router.patch(
  "/admin/:id/featured",
  auth,
  isUser,
  setFeaturedStatus
);

router.patch(
  "/admin/:id/editor-choice",
  auth,
  isUser,
  setEditorChoiceStatus
);

router.delete(
  "/admin/:id",
  auth,
  isUser,
  deleteBlogPost
);

router.patch(
  "/admin/:id/restore",
  auth,
  isUser,
  restoreBlogPost
);

router.delete(
  "/admin/:id/hard",
  auth,
  isAdmin,
  hardDeleteBlogPost
);

/*
|--------------------------------------------------------------------------
| OLD ROUTES
|--------------------------------------------------------------------------
|
| Keep these temporarily if your existing frontend still calls them.
|
*/

router.post(
  "/create",
  auth,
  isUser,
  uploadMiddleware.single(
    "imageFile"
  ),
  createBlogPost
);

router.get(
  "/all",
  auth,
  isUser,
  getAllBlogPostsAdmin
);

router.patch(
  "/:id/toggle-publish",
  auth,
  isUser,
  togglePublishStatus
);

/*
|--------------------------------------------------------------------------
| PUBLIC SINGLE BLOG
|--------------------------------------------------------------------------
|
| MUST stay at bottom.
|
*/

router.get(
  "/:slug",
  getBlogPostBySlug
);

export default router;