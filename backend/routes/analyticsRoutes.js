import express from "express";

import { trackController } from "../controllers/analyticsController.js";
import { validateBase } from "../Middleware/analyticsValidation.js";
import { analyticsTrackLimiter } from "../Middleware/rateLimiter.js";

const router = express.Router();

// PUBLIC: the only endpoint the website calls.
// Mounted at /api/analytics (see index.js).
router.post(
  "/track",
  analyticsTrackLimiter,
  validateBase,
  trackController
);

export default router;
