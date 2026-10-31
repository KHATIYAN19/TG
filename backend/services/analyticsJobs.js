import ActiveUserSnapshot from "../models/analytics/ActiveUserSnapshot.js";

import {
  acquireLock,
  countLiveSessions,
} from "../config/analyticsRedis.js";

import { closeIdleSessions } from "./analyticsService.js";

const MINUTE = 60 * 1000;

// Stores how many sessions are live right now.
async function snapshotActiveUsers() {
  if (!(await acquireLock("snapshot", 50))) return;

  const minute = new Date(
    Math.floor(Date.now() / MINUTE) * MINUTE
  );

  const activeSessions = await countLiveSessions();

  await ActiveUserSnapshot.updateOne(
    { minute },
    { $set: { activeSessions } },
    { upsert: true }
  );
}

async function cleanup() {
  if (!(await acquireLock("cleanup", 240))) return;

  const result = await closeIdleSessions();

  if (result.pagesClosed || result.sessionsClosed) {
    console.log("[analytics] closed idle:", result);
  }
}

function safely(name, fn) {
  return async () => {
    try {
      await fn();
    } catch (error) {
      console.error(`[analytics] ${name} failed:`, error);
    }
  };
}

// One maintenance pass: snapshot + idle cleanup.
// Redis locks make it safe if several callers overlap.
export async function runMaintenance() {
  await Promise.all([
    safely("snapshot", snapshotActiveUsers)(),
    safely("cleanup", cleanup)(),
  ]);
}

// Local/VM servers use timers. Cloud Run throttles CPU between
// requests, so there Cloud Scheduler calls runMaintenance via
// POST /internal/analytics/maintenance instead.
export function startAnalyticsJobs() {
  if (
    process.env.K_SERVICE &&
    process.env.ANALYTICS_FORCE_TIMERS !== "true"
  ) {
    console.log(
      "[analytics] Cloud Run detected: use Cloud Scheduler for maintenance"
    );
    return;
  }

  const snapshotJob = safely("snapshot", snapshotActiveUsers);
  const cleanupJob = safely("cleanup", cleanup);

  setInterval(snapshotJob, MINUTE).unref();
  setInterval(cleanupJob, 5 * MINUTE).unref();

  // First pass shortly after boot.
  setTimeout(cleanupJob, 15 * 1000).unref();
}
