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
  streamBlogAgent,
  saveAgentBlog,
  discardAgentCover,
} from "../controllers/blogAgentController.js";

import {
  auth,
  isAdmin,
  isUser,
} from "../Middleware/auth.js";
import { requireRealImage } from "../Middleware/imageSignature.js";

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
  requireRealImage,
  createBlogPost
);

/*
|--------------------------------------------------------------------------
| AI WRITER (admin only) – keep above /admin/:id
|--------------------------------------------------------------------------
*/

router.post(
  "/admin/agent/stream",
  auth,
  isAdmin,
  streamBlogAgent
);

router.post(
  "/admin/agent/save",
  auth,
  isAdmin,
  saveAgentBlog
);

router.delete(
  "/admin/agent/cover",
  auth,
  isAdmin,
  discardAgentCover
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
  requireRealImage,
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
  requireRealImage,
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