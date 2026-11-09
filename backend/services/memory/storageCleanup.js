import MemoryStorageJob from "../../models/memory/MemoryStorageJob.js";
import MemoryPage from "../../models/memory/MemoryPage.js";
import { deleteObject } from "../storage/s3.js";

/*
  KEEPING THE BUCKET CLEAN
  - removeFiles(keys): called whenever a photo or video is deleted, from anywhere (owner removes one, owner deletes a page, admin does either).
    It deletes from the bucket IMMEDIATELY. If the bucket says no (a permission is missing, a network blip) the file is queued and retried
    every few minutes until it works.
  - trackUpload(key) / uploadAttached(key): every signed upload is recorded. One that never gets attached to a page (the tab was closed
    mid-upload) is deleted after an hour.
*/
const ABANDON_AFTER_MS = 60 * 60 * 1000;
const RETRY_BASE_MS = 2 * 60 * 1000;
const MAX_ATTEMPTS = 30;

const note = (e) => String(e?.name ? `${e.name}: ${e.message}` : e?.message || e).slice(0, 300);
const backoff = (attempts) => Math.min(6 * 60 * 60 * 1000, RETRY_BASE_MS * 2 ** Math.min(attempts, 8));

/** Delete now; on failure keep a job so it is retried. Never throws. Returns how many are still waiting. */
export const removeFiles = async (keys) => {
  let waiting = 0;
  for (const key of [...new Set([].concat(keys).filter(Boolean))]) {
    await MemoryStorageJob.updateOne({ key }, { $set: { reason: "removed", runAt: new Date() }, $setOnInsert: { attempts: 0 } }, { upsert: true }).catch(() => {});
    try {
      await deleteObject(key); // deleting something already gone is fine for S3
      await MemoryStorageJob.deleteOne({ key }).catch(() => {});
    } catch (e) {
      waiting += 1;
      console.error(`[memory] could not delete ${key} from the bucket yet (will retry):`, note(e));
      await MemoryStorageJob.updateOne({ key }, { $set: { lastError: note(e), runAt: new Date(Date.now() + backoff(0)) }, $inc: { attempts: 1 } }).catch(() => {});
    }
  }
  return waiting;
};

export const trackUpload = (key) =>
  MemoryStorageJob.updateOne({ key }, { $setOnInsert: { reason: "abandoned", runAt: new Date(Date.now() + ABANDON_AFTER_MS), attempts: 0 } }, { upsert: true }).catch(() => {});

export const uploadAttached = (key) => MemoryStorageJob.deleteOne({ key, reason: "abandoned" }).catch(() => {});

/** One pass over everything that is due. Exported so it can be run on demand (and tested). */
export const sweepStorage = async (limit = 50) => {
  const due = await MemoryStorageJob.find({ runAt: { $lte: new Date() }, attempts: { $lt: MAX_ATTEMPTS } }).sort({ runAt: 1 }).limit(limit).lean();
  let deleted = 0;
  for (const job of due) {
    // an "abandoned" upload that did get attached to a page must be kept
    if (job.reason === "abandoned" && (await MemoryPage.exists({ "media.key": job.key }))) { await MemoryStorageJob.deleteOne({ _id: job._id }); continue; }
    try {
      await deleteObject(job.key);
      await MemoryStorageJob.deleteOne({ _id: job._id });
      deleted += 1;
    } catch (e) {
      await MemoryStorageJob.updateOne({ _id: job._id }, { $set: { lastError: note(e), runAt: new Date(Date.now() + backoff(job.attempts + 1)) }, $inc: { attempts: 1 } });
    }
  }
  return { checked: due.length, deleted };
};

export const startStorageSweeper = () => {
  const run = () => sweepStorage().then((r) => r.deleted && console.log(`[memory] storage cleanup removed ${r.deleted} file(s)`)).catch((e) => console.error("[memory] storage cleanup failed:", e.message));
  setTimeout(run, 20_000).unref?.();
  setInterval(run, 5 * 60 * 1000).unref?.();
};
