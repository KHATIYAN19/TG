import express from "express";

import {
  addInterviewExperience,

  getAllInterviewExperience,
  getInterviewExperienceBySlug,
  getInterviewFilterOptions,

  getAllInterviewsForAdmin,
  getInterviewByIdForAdmin,
  getInterviewAdminStats,

  updateInterviewByAdmin,

  acceptInterviewExperience,
  publishInterviewExperience,
  rejectInterviewExperience,

  softDeleteInterviewExperience,
  restoreInterviewExperience,
  hardDeleteInterviewExperience,
} from "../controllers/InterviewExperience.js";

import {
  auth,
  isAdmin,
} from "../Middleware/auth.js";

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Submit interview
|--------------------------------------------------------------------------
|
| POST /api/interviews
|
*/

router.post(
  "/",
  addInterviewExperience
);

/*
|--------------------------------------------------------------------------
| Get published interviews
|--------------------------------------------------------------------------
|
| GET /api/interviews
|
| Supported:
|
| ?page=1
| ?company=amazon
| ?role=sde-2
| ?topic=system-design
| ?technology=java
| ?location=bangalore
| ?difficulty=MEDIUM
| ?result=SELECTED
| ?q=amazon
|
*/

router.get(
  "/",
  getAllInterviewExperience
);

/*
|--------------------------------------------------------------------------
| Get filter values
|--------------------------------------------------------------------------
|
| Must stay above /:slug
|
*/

router.get(
  "/filters",
  getInterviewFilterOptions
);

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
|
| Keep them before /:slug.
|
*/

/*
|--------------------------------------------------------------------------
| Dashboard stats
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/stats",
  auth,
  isAdmin,
  getInterviewAdminStats
);

/*
|--------------------------------------------------------------------------
| Get all interviews for admin
|--------------------------------------------------------------------------
|
| Examples:
|
| /admin/all
| /admin/all?status=PENDING
| /admin/all?status=PUBLISHED
| /admin/all?company=amazon
| /admin/all?role=sde-2
| /admin/all?spamOnly=true
|
*/

router.get(
  "/admin/all",
  auth,
  isAdmin,
  getAllInterviewsForAdmin
);

/*
|--------------------------------------------------------------------------
| Get single interview for admin
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/:id",
  auth,
  isAdmin,
  getInterviewByIdForAdmin
);

/*
|--------------------------------------------------------------------------
| Admin update
|--------------------------------------------------------------------------
|
| Admin can modify:
|
| title
| slug
| company
| role
| user details
| contentMarkdown
| summary
| preparation
| advice
| rounds
| tags
| topics
| technologies
| SEO
| featured
| editorPick
| status
|
*/

router.patch(
  "/admin/:id",
  auth,
  isAdmin,
  updateInterviewByAdmin
);

/*
|--------------------------------------------------------------------------
| Accept
|--------------------------------------------------------------------------
|
| PENDING → ACCEPTED
|
*/

router.patch(
  "/admin/:id/accept",
  auth,
  isAdmin,
  acceptInterviewExperience
);

/*
|--------------------------------------------------------------------------
| Publish
|--------------------------------------------------------------------------
|
| ACCEPTED → PUBLISHED
|
*/

router.patch(
  "/admin/:id/publish",
  auth,
  isAdmin,
  publishInterviewExperience
);

/*
|--------------------------------------------------------------------------
| Reject
|--------------------------------------------------------------------------
|
| Since we don't have REJECTED status:
|
| Reject → ARCHIVED
|
*/

router.patch(
  "/admin/:id/reject",
  auth,
  isAdmin,
  rejectInterviewExperience
);

/*
|--------------------------------------------------------------------------
| Restore
|--------------------------------------------------------------------------
|
| ARCHIVED → ACCEPTED
|
*/

router.patch(
  "/admin/:id/restore",
  auth,
  isAdmin,
  restoreInterviewExperience
);

/*
|--------------------------------------------------------------------------
| Soft delete
|--------------------------------------------------------------------------
|
| Sets:
|
| status = ARCHIVED
|
*/

router.delete(
  "/admin/:id",
  auth,
  isAdmin,
  softDeleteInterviewExperience
);

/*
|--------------------------------------------------------------------------
| Hard delete
|--------------------------------------------------------------------------
|
| Permanently removes MongoDB document.
|
| Controller only allows this when status = ARCHIVED.
|
*/

router.delete(
  "/admin/:id/hard",
  auth,
  isAdmin,
  hardDeleteInterviewExperience
);


router.get(
  "/:slug",
  getInterviewExperienceBySlug
);

export default router;