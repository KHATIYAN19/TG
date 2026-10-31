import crypto from "node:crypto";
import express from "express";

import { runMaintenance } from "../services/analyticsJobs.js";

const router = express.Router();

function secretMatches(provided) {
  const expected = process.env.ANALYTICS_CRON_SECRET;

  if (!expected || typeof provided !== "string") return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Called every minute by Cloud Scheduler.
// Header: x-cron-secret: <ANALYTICS_CRON_SECRET>
router.post("/maintenance", async (req, res) => {
  if (!secretMatches(req.get("x-cron-secret"))) {
    return res.status(401).json({ success: false });
  }

  try {
    await runMaintenance();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("[analytics] maintenance failed:", error);
    return res.status(500).json({ success: false });
  }
});

export default router;
