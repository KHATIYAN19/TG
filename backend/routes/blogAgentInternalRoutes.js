import crypto from "node:crypto";
import express from "express";

import redis from "../utils/redis.js";

import { runDaily } from "../services/blogAgent/pipeline.js";
import { isOpenAIConfigured } from "../services/blogAgent/openai.js";

const router = express.Router();

function secretMatches(provided) {
  const expected =
    process.env.BLOG_AGENT_CRON_SECRET;

  if (
    !expected ||
    expected.length < 24 ||
    typeof provided !== "string"
  ) {
    return false;
  }

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  return (
    a.length === b.length &&
    crypto.timingSafeEqual(a, b)
  );
}

/*
 * Called once a day by Cloud Scheduler.
 *
 *   POST /internal/blog-agent/daily?count=3
 *   Header: x-cron-secret: <BLOG_AGENT_CRON_SECRET>
 *
 * Creates DRAFT posts only. The request stays open until all posts are done
 * (about 5-10 minutes), so set the Scheduler attempt deadline to 30 minutes
 * and keep the Cloud Run request timeout above that.
 */
router.post("/daily", async (req, res) => {
  if (!secretMatches(req.get("x-cron-secret"))) {
    return res.status(401).json({ success: false });
  }

  if (!isOpenAIConfigured()) {
    return res.status(503).json({
      success: false,
      message: "OPENAI_API_KEY is not configured.",
    });
  }

  const count = Math.min(
    5,
    Math.max(1, Number(req.query.count) || 3)
  );

  /* One run at a time, and no double-fire from Scheduler retries. */
  const lockKey = `blogagent:daily:${new Date()
    .toISOString()
    .slice(0, 10)}`;

  let locked = false;

  try {
    locked = Boolean(
      await redis.set(lockKey, "1", {
        nx: true,
        ex: 60 * 60 * 3,
      })
    );
  } catch {
    locked = true; /* Redis down: still run */
  }

  if (!locked) {
    return res.status(200).json({
      success: true,
      skipped: "Already ran today.",
    });
  }

  try {
    const results = await runDaily({ count });

    const ok = results.some(
      (r) => r.status === "draft"
    );

    if (!ok) {
      /* let the next Scheduler retry run again */
      await redis.del(lockKey).catch(() => {});
    }

    return res
      .status(ok ? 200 : 500)
      .json({ success: ok, results });
  } catch (error) {
    console.error("[blog-agent] daily failed:", error);

    await redis.del(lockKey).catch(() => {});

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
