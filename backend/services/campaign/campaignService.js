import mongoose from "mongoose";

import Book from "../../models/Book.js";
import Coupon from "../../models/Coupon.js";
import MarketingCampaign from "../../models/MarketingCampaign.js";
import MarketingRecipient from "../../models/MarketingRecipient.js";
import { enqueueCampaignRecipients, isMailQueueEnabled } from "../mail/mailQueue.js";
import { resolveAudience } from "./audience.js";

/*
  Campaign lifecycle:

    DRAFT -> (send) QUEUEING -> SENDING -> COMPLETED
                                   |  ^
                              PAUSED  (resume)
    any running state -> CANCELLED

  Sending = one MarketingRecipient row + one SQS message per person. The
  worker (mailWorker.js) renders and sends each one.
*/

export class CampaignError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const oid = (id) => new mongoose.Types.ObjectId(String(id));

const CHUNK = 500;

/* ---------------- queue pending recipients ---------------- */

/*
  Put every PENDING recipient of a campaign on the queue.
  Returns { queued, stillPending }.
*/
export const queuePending = async (campaignId) => {
  const id = oid(campaignId);
  let queued = 0;

  // Re-read from the start each round: queued rows leave the PENDING set.
  // Rows that could not be queued are skipped via `after`.
  let after = null;

  for (;;) {
    const rows = await MarketingRecipient.find({
      campaignId: id,
      status: "PENDING",
      ...(after ? { _id: { $gt: after } } : {}),
    })
      .sort({ _id: 1 })
      .limit(CHUNK)
      .select("_id")
      .lean();

    if (!rows.length) break;
    after = rows[rows.length - 1]._id;

    const failed = new Set(
      await enqueueCampaignRecipients(rows.map((r) => ({ recipientId: r._id, campaignId: id })))
    );
    const okIds = rows.map((r) => r._id).filter((rid) => !failed.has(String(rid)));

    if (okIds.length) {
      await MarketingRecipient.updateMany(
        { _id: { $in: okIds }, status: "PENDING" },
        { $set: { status: "QUEUED", queuedAt: new Date() } }
      );
      queued += okIds.length;
    }
  }

  const stillPending = await MarketingRecipient.countDocuments({ campaignId: id, status: "PENDING" });
  return { queued, stillPending };
};

/* ---------------- launch ---------------- */

export const launchCampaign = async (campaignId) => {
  if (!isMailQueueEnabled()) {
    throw new CampaignError(
      "The email queue is not configured. Add SQS_EMAIL_QUEUE_NAME (and the AMAZON_* keys) to the server .env first.",
      503
    );
  }

  // Atomic hand-over so two clicks / two servers cannot launch it twice.
  const campaign = await MarketingCampaign.findOneAndUpdate(
    { _id: campaignId, status: { $in: ["DRAFT", "SCHEDULED"] } },
    { $set: { status: "QUEUEING", lastError: "" } },
    { new: true }
  );
  if (!campaign) throw new CampaignError("This campaign has already been sent or is being sent.", 409);

  try {
    const { recipients } = await resolveAudience(campaign.audience);

    if (!recipients.length) {
      throw new CampaignError("The audience is empty: nobody matches these filters.");
    }

    for (let i = 0; i < recipients.length; i += CHUNK) {
      await MarketingRecipient.insertMany(
        recipients.slice(i, i + CHUNK).map((r) => ({
          campaignId: campaign._id,
          email: r.email,
          name: r.name || "",
          books: r.books.slice(0, 5),
          orders: r.orders || 0,
        })),
        { ordered: false }
      ).catch((error) => {
        // Duplicate rows (re-launch after a crash) are fine; anything else is not.
        if (error?.code !== 11000 && !error?.writeErrors?.every((e) => e.code === 11000)) throw error;
      });
    }

    const total = await MarketingRecipient.countDocuments({ campaignId: campaign._id });

    await MarketingCampaign.updateOne(
      { _id: campaign._id },
      {
        $set: {
          status: "SENDING",
          startedAt: new Date(),
          "counts.total": total,
          "counts.sent": 0,
          "counts.failed": 0,
          "counts.dead": 0,
          "counts.skipped": 0,
        },
      }
    );

    const { stillPending } = await queuePending(campaign._id);

    if (stillPending) {
      await MarketingCampaign.updateOne(
        { _id: campaign._id },
        {
          $set: {
            status: "PAUSED",
            lastError: `${stillPending} emails could not be put on the queue. Press Resume to try again.`,
          },
        }
      );
    }

    return MarketingCampaign.findById(campaign._id).lean();
  } catch (error) {
    await MarketingCampaign.updateOne(
      { _id: campaign._id, status: "QUEUEING" },
      { $set: { status: "DRAFT", lastError: String(error.message).slice(0, 300) } }
    );
    throw error;
  }
};

/* ---------------- pause / resume / cancel / retry ---------------- */

export const pauseCampaign = async (campaignId) => {
  const campaign = await MarketingCampaign.findOneAndUpdate(
    { _id: campaignId, status: "SENDING" },
    { $set: { status: "PAUSED" } },
    { new: true }
  );
  if (!campaign) throw new CampaignError("Only a campaign that is sending can be paused.", 409);
  return campaign;
};

export const resumeCampaign = async (campaignId) => {
  const campaign = await MarketingCampaign.findOneAndUpdate(
    { _id: campaignId, status: "PAUSED" },
    { $set: { status: "SENDING", lastError: "" } },
    { new: true }
  );
  if (!campaign) throw new CampaignError("Only a paused campaign can be resumed.", 409);

  // Anything the worker handed back while paused is PENDING again.
  const { stillPending } = await queuePending(campaign._id);
  if (stillPending) {
    await MarketingCampaign.updateOne(
      { _id: campaign._id },
      { $set: { status: "PAUSED", lastError: `${stillPending} emails could not be queued. Try Resume again.` } }
    );
  }
  await maybeComplete(campaign._id);
  return MarketingCampaign.findById(campaign._id).lean();
};

export const cancelCampaign = async (campaignId) => {
  const campaign = await MarketingCampaign.findOneAndUpdate(
    { _id: campaignId, status: { $in: ["SCHEDULED", "QUEUEING", "SENDING", "PAUSED"] } },
    { $set: { status: "CANCELLED", completedAt: new Date() } },
    { new: true }
  );
  if (!campaign) throw new CampaignError("This campaign is not running.", 409);

  // Not yet on the queue: cancel right now. Queued ones are skipped by the worker as they arrive.
  const { modifiedCount } = await MarketingRecipient.updateMany(
    { campaignId: campaign._id, status: "PENDING" },
    { $set: { status: "SKIPPED", error: "Campaign cancelled" } }
  );
  if (modifiedCount) {
    await MarketingCampaign.updateOne({ _id: campaign._id }, { $inc: { "counts.skipped": modifiedCount } });
  }
  return MarketingCampaign.findById(campaign._id).lean();
};

/* Re-queue recipients that failed permanently or ran out of retries. */
export const retryFailed = async (campaignId, { includeDead = true } = {}) => {
  const campaign = await MarketingCampaign.findById(campaignId);
  if (!campaign) throw new CampaignError("Campaign not found.", 404);
  if (["DRAFT", "CANCELLED", "QUEUEING"].includes(campaign.status)) {
    throw new CampaignError("Nothing to retry for this campaign.", 409);
  }

  const failed = await MarketingRecipient.updateMany(
    { campaignId: campaign._id, status: "FAILED" },
    { $set: { status: "PENDING", error: "" } }
  );
  const dead = includeDead
    ? await MarketingRecipient.updateMany(
        { campaignId: campaign._id, status: "DEAD" },
        { $set: { status: "PENDING", error: "" } }
      )
    : { modifiedCount: 0 };

  const reset = failed.modifiedCount + dead.modifiedCount;
  if (!reset) return { requeued: 0, campaign: campaign.toObject() };

  await MarketingCampaign.updateOne(
    { _id: campaign._id },
    {
      $inc: { "counts.failed": -failed.modifiedCount, "counts.dead": -dead.modifiedCount },
      $set: { status: campaign.status === "PAUSED" ? "PAUSED" : "SENDING", completedAt: null },
    }
  );

  if (campaign.status !== "PAUSED") await queuePending(campaign._id);
  return { requeued: reset, campaign: await MarketingCampaign.findById(campaign._id).lean() };
};

/* Mark COMPLETED once every recipient reached a final state. */
export const maybeComplete = (campaignId) =>
  MarketingCampaign.findOneAndUpdate(
    {
      _id: campaignId,
      status: "SENDING",
      "counts.total": { $gt: 0 },
      $expr: {
        $gte: [
          { $add: ["$counts.sent", "$counts.failed", "$counts.dead", "$counts.skipped"] },
          "$counts.total",
        ],
      },
    },
    { $set: { status: "COMPLETED", completedAt: new Date() } },
    { new: true }
  );

/* Recompute the counters from the recipient rows (repairs any drift). */
export const recount = async (campaignId) => {
  const rows = await MarketingRecipient.aggregate([
    { $match: { campaignId: oid(campaignId) } },
    { $group: { _id: "$status", n: { $sum: 1 } } },
  ]);
  const by = Object.fromEntries(rows.map((r) => [r._id, r.n]));
  const total = rows.reduce((sum, r) => sum + r.n, 0);

  await MarketingCampaign.updateOne(
    { _id: campaignId },
    {
      $set: {
        "counts.total": total,
        "counts.sent": by.SENT || 0,
        "counts.failed": by.FAILED || 0,
        "counts.dead": by.DEAD || 0,
        "counts.skipped": by.SKIPPED || 0,
      },
    }
  );
  await maybeComplete(campaignId);
  return { ...by, total };
};

/* Live status breakdown for the admin page. */
export const recipientBreakdown = async (campaignId) => {
  const rows = await MarketingRecipient.aggregate([
    { $match: { campaignId: oid(campaignId) } },
    { $group: { _id: "$status", n: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id, r.n]));
};

/* ---------------- render context (featured books + coupon) ---------------- */

export const loadCampaignContext = async (campaign) => {
  const featuredIds = campaign.content?.featuredBookIds || [];
  const code = String(campaign.content?.couponCode || "").trim().toUpperCase();

  const [featuredBooks, coupon] = await Promise.all([
    featuredIds.length
      ? Book.find({ _id: { $in: featuredIds } })
          .select("title subtitle price mrp coverPageUrl")
          .lean()
          .then((books) => {
            const order = new Map(featuredIds.map((id, i) => [String(id), i]));
            return books.sort((a, b) => order.get(String(a._id)) - order.get(String(b._id)));
          })
      : [],
    code ? Coupon.findOne({ code }).select("code discountType discountValue validTill isActive").lean() : null,
  ]);

  return { featuredBooks, coupon };
};
