
import express from "express";
import crypto from "node:crypto";

import {
  cleanupInterviewHolds,
} from "../services/interviewHoldCleanup.js";

const router = express.Router();

/* =====================================================
   AUTHENTICATE SCHEDULED REQUESTS
===================================================== */

function verifyCronSecret(req, res, next) {
  const expected =
    process.env.INTERVIEW_CRON_SECRET;

  const received =
    req.get("x-interview-cron-secret");

  if (!expected || !received) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const a = Buffer.from(received);
  const b = Buffer.from(expected);

  if (
    a.length !== b.length ||
    !crypto.timingSafeEqual(a, b)
  ) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  next();
}

/* =====================================================
   POST /api/interviews/maintenance/cleanup
===================================================== */

router.post(
  "/cleanup",
  verifyCronSecret,
  async (req, res) => {
    try {
      const summary =
        await cleanupInterviewHolds();

      return res.status(200).json({
        success: true,
        message:
          "Interview cleanup completed",
        data: summary,
      });
    } catch (error) {
      console.error(
        "[INTERVIEW MAINTENANCE]",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Interview cleanup failed",
      });
    }
  }
);

export default router;
