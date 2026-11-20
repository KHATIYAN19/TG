import mongoose from "mongoose";

import ResumeFile from "../../models/resume/ResumeFile.js";
import ResumeRequest from "../../models/resume/ResumeRequest.js";
import ResumeDraft from "../../models/resume/ResumeDraft.js";
import { deleteObject, headObject, keyBelongsTo, userPrefix } from "../storage/s3.js";
import { ResumeError, assertId } from "./service.js";

/*
  THE RESUME VAULT
    listVault(userId)                 the files on file, default first. The first time, it is filled from the resumes already sent in.
    addToVault(userId, { key, filename, replaceId, makeDefault })   a fresh upload (checked in S3), optionally replacing one
    updateFile / removeFile           rename, make default, remove (S3 object deleted only when nothing else uses it)
    fileForSubmit(userId, id)         the key and name to send a review with
*/
export const VAULT_MAX = 12;

export const fileOut = (f) => ({
  id: String(f._id), filename: f.filename, label: f.label || "", size: f.size || 0, isDefault: Boolean(f.isDefault),
  uses: f.uses || 0, lastUsedAt: f.lastUsedAt, createdAt: f.createdAt,
});

const cleanName = (n) => String(n || "").replace(/[^\w.\- ()]+/g, "_").slice(0, 120) || "resume.pdf";
const visible = (userId) => ({ user: userId, hiddenAt: null });

/* the resumes sent in before the vault existed become its first files (once: any file, even a removed one, means it was done) */
const seed = async (userId) => {
  if (await ResumeFile.exists({ user: userId })) return;
  const rows = await ResumeRequest.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(String(userId)), "resume.key": { $nin: ["", null] } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$resume.key", filename: { $first: "$resume.filename" }, size: { $first: "$resume.size" }, uses: { $sum: 1 }, last: { $first: "$createdAt" } } },
    { $sort: { last: -1 } },
    { $limit: VAULT_MAX },
  ]);
  if (!rows.length) return;
  const docs = rows.map((r, i) => ({ user: userId, key: r._id, filename: cleanName(r.filename), size: r.size || 0, uses: r.uses, lastUsedAt: r.last, isDefault: i === 0 }));
  try { await ResumeFile.insertMany(docs, { ordered: false }); } catch { /* a parallel request seeded it first */ }
};

/* exactly one default while any file is left */
const ensureDefault = async (userId) => {
  if (await ResumeFile.exists({ ...visible(userId), isDefault: true })) return;
  const next = await ResumeFile.findOne(visible(userId)).sort({ lastUsedAt: -1, createdAt: -1 }).select("_id").lean();
  if (next) await ResumeFile.updateOne({ _id: next._id }, { $set: { isDefault: true } });
};

export const listVault = async (userId) => {
  await seed(userId);
  return (await ResumeFile.find(visible(userId)).sort({ isDefault: -1, lastUsedAt: -1, createdAt: -1 }).limit(VAULT_MAX).lean()).map(fileOut);
};

const ownFile = async (userId, id) => {
  assertId(id, "resume");
  const f = await ResumeFile.findOne({ _id: id, ...visible(userId) });
  if (!f) throw new ResumeError(404, "That resume is no longer in your vault.", "FILE_NOT_FOUND");
  return f;
};

/* a stored file's S3 object goes only when no review and no builder draft needs it any more */
const releaseObject = async (userId, key) => {
  const [req, draft, again] = await Promise.all([
    ResumeRequest.exists({ "resume.key": key }),
    ResumeDraft.exists({ "source.resumeKey": key }),
    ResumeFile.exists({ user: userId, key, hiddenAt: null }),
  ]);
  if (!req && !draft && !again) await deleteObject(key).catch((e) => console.warn("[resume] could not delete a vault file:", e?.message));
};

const hide = async (userId, f) => {
  await ResumeFile.updateOne({ _id: f._id }, { $set: { hiddenAt: new Date(), isDefault: false } });
  void releaseObject(userId, f.key);
};

export const addToVault = async (userId, { key, filename, label = "", replaceId = "", makeDefault = false }) => {
  if (!keyBelongsTo(key, `${userPrefix(userId)}resume/`) || !/\.pdf$/i.test(key)) throw new ResumeError(400, "That file isn't valid. Please upload your resume again as a PDF.", "INVALID_RESUME");
  const replacing = replaceId ? await ownFile(userId, replaceId) : null;
  if (!replacing && (await ResumeFile.countDocuments(visible(userId))) >= VAULT_MAX) throw new ResumeError(409, `Your vault holds ${VAULT_MAX} resumes. Remove one to add another.`, "VAULT_FULL");
  const obj = await headObject(key);
  if (!obj) throw new ResumeError(400, "We couldn't find the uploaded file. Please upload it again.", "RESUME_NOT_FOUND");
  if (obj.contentType && !/pdf/i.test(obj.contentType)) throw new ResumeError(400, "Please upload your resume as a PDF.", "INVALID_RESUME");
  const first = !(await ResumeFile.exists(visible(userId)));
  const asDefault = first || makeDefault || Boolean(replacing?.isDefault);
  if (asDefault) await ResumeFile.updateMany({ ...visible(userId), isDefault: true }, { $set: { isDefault: false } });
  const doc = await ResumeFile.findOneAndUpdate(
    { user: userId, key },
    { $set: { filename: cleanName(filename), label: String(label || replacing?.label || "").trim().slice(0, 60), size: obj.size || 0, hiddenAt: null, isDefault: asDefault } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  if (replacing && String(replacing._id) !== String(doc._id)) await hide(userId, replacing);
  await ensureDefault(userId);
  return fileOut(await ResumeFile.findById(doc._id).lean());
};

export const updateFile = async (userId, id, { label, makeDefault }) => {
  const f = await ownFile(userId, id);
  const set = {};
  if (typeof label === "string") set.label = label.trim().slice(0, 60);
  if (makeDefault) {
    await ResumeFile.updateMany({ ...visible(userId), isDefault: true, _id: { $ne: f._id } }, { $set: { isDefault: false } });
    set.isDefault = true;
  }
  if (Object.keys(set).length) await ResumeFile.updateOne({ _id: f._id }, { $set: set });
  return fileOut(await ResumeFile.findById(f._id).lean());
};

export const removeFile = async (userId, id) => {
  const f = await ownFile(userId, id);
  await hide(userId, f);
  await ensureDefault(userId);
};

/* the vault file a review is sent with; using it moves it to the top */
export const fileForSubmit = async (userId, id) => {
  const f = await ownFile(userId, id);
  return { key: f.key, filename: f.filename, id: f._id };
};

export const markUsed = (userId, key, filename) =>
  ResumeFile.findOneAndUpdate(
    { user: userId, key },
    { $set: { lastUsedAt: new Date(), hiddenAt: null }, $inc: { uses: 1 }, $setOnInsert: { filename: cleanName(filename) } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).then(() => ensureDefault(userId)).catch((e) => console.warn("[resume] vault update failed:", e?.message));
