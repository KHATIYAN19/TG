import MemoryPage from "../../models/memory/MemoryPage.js";
import { DAY_MS, deleteMediaObjects, expiryFrom, getSettings, lifetimeDays, purgePageEvents } from "./memoryService.js";

/*
  EVERY PAGE LASTS 30 DAYS.
  From the day it is created a page (its link, photos, videos, replies and activity) stays online for PAGE_LIFETIME_DAYS. Then:
    - the link stops opening and the owner can no longer reach it, straight away (every read checks expiresAt), and
    - this sweeper deletes it for good: the page, its files in the bucket, and what the receiver did on it.
  The credit that made the page is not returned.
*/

/** Pages made before this feature had no end date. Nobody loses a page by surprise: each one gets a full lifetime counted from today. */
export const backfillExpiry = async () => {
  const legacy = await MemoryPage.find({ expiresAt: null }).select("createdAt").lean();
  const days = lifetimeDays(await getSettings());
  const fromToday = expiryFrom(Date.now(), days).getTime();
  let n = 0;
  for (const p of legacy) {
    await MemoryPage.updateOne({ _id: p._id, expiresAt: null }, { $set: { expiresAt: new Date(Math.max(fromToday, new Date(p.createdAt).getTime() + days * DAY_MS)) } });
    n += 1;
  }
  if (n) console.log(`[memory] gave ${n} older page(s) an end date`);
  return n;
};

/** One pass: delete every page whose time is up. Exported so it can be run on demand (and tested). */
export const sweepExpiredPages = async (limit = 50) => {
  const due = await MemoryPage.find({ expiresAt: { $ne: null, $lte: new Date() } }).limit(limit);
  for (const page of due) {
    await deleteMediaObjects(page.media);
    await purgePageEvents(page._id);
    await page.deleteOne();
  }
  if (due.length) console.log(`[memory] removed ${due.length} expired page(s)`);
  return { removed: due.length };
};

export const startExpirySweeper = () => {
  const run = async () => {
    try {
      let r;
      do { r = await sweepExpiredPages(); } while (r.removed >= 50); // keep going while there is a backlog
    } catch (e) {
      console.error("[memory] expired-page cleanup failed:", e.message);
    }
  };
  setTimeout(run, 45_000).unref?.();
  setInterval(run, 60 * 60 * 1000).unref?.();
};
