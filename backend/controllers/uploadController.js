import asyncHandler from "express-async-handler";

import {
  StorageError,
  UPLOAD_PURPOSES,
  createUploadTarget,
  createDownloadUrl,
  headObject,
  deleteObject,
  keyBelongsTo,
  userPrefix,
} from "../services/storage/s3.js";

/*
  S3 presigned-URL endpoints (backend only).

  Flow
    1. POST   /api/uploads/presign   -> { key, url, fields }   client POSTs the file to S3
    2. POST   /api/uploads/confirm   -> verifies the object landed; persist `key` in your model
    3. GET    /api/uploads/download  -> short-lived GET URL for a private object
    4. DELETE /api/uploads           -> removes an object

  Always store the `key` (never the URL; URLs expire).

  Bucket CORS (S3 console > Permissions > CORS), replace the origin:
    [{
      "AllowedOrigins": ["https://your-frontend.com"],
      "AllowedMethods": ["POST", "GET"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }]
*/

const isAdminUser = (req) => req.user?.role === "admin";
const userIdOf = (req) => String(req.user?.id || req.user?._id || "");

/** Admins may touch any key; everyone else only their own prefix. */
const authorizeKey = (req, key) => {
  if (typeof key !== "string" || key.includes("..") || key.length > 1024 || !key) {
    throw new StorageError("A valid key is required.", 400, "INVALID_KEY");
  }
  if (isAdminUser(req)) return;
  if (!keyBelongsTo(key, userPrefix(userIdOf(req)))) {
    throw new StorageError("You do not have access to this file.", 403, "FORBIDDEN_KEY");
  }
};

const fail = (res, err) => {
  if (err instanceof StorageError) {
    return res.status(err.status).json({ success: false, message: err.message, code: err.code });
  }
  throw err; // express-async-handler forwards to the global error handler
};

export const presignUpload = asyncHandler(async (req, res) => {
  try {
    const { purpose, contentType, size, filename } = req.body || {};
    const target = await createUploadTarget({
      userId: userIdOf(req),
      purpose: String(purpose || ""),
      contentType: String(contentType || "").toLowerCase(),
      size: Number(size),
      filename,
    });
    return res.status(201).json({ success: true, data: target });
  } catch (err) {
    return fail(res, err);
  }
});

export const confirmUpload = asyncHandler(async (req, res) => {
  try {
    const { key } = req.body || {};
    authorizeKey(req, key);
    const object = await headObject(key);
    if (!object) {
      return res.status(404).json({ success: false, message: "File not found in storage. Upload may have failed.", code: "OBJECT_NOT_FOUND" });
    }
    return res.json({ success: true, data: object });
  } catch (err) {
    return fail(res, err);
  }
});

export const getDownloadUrl = asyncHandler(async (req, res) => {
  try {
    const { key, filename, inline } = req.query;
    authorizeKey(req, key);
    const link = await createDownloadUrl(key, { filename, inline: inline === "true" });
    return res.json({ success: true, data: { key, ...link } });
  } catch (err) {
    return fail(res, err);
  }
});

export const removeObject = asyncHandler(async (req, res) => {
  try {
    const { key } = req.body || {};
    authorizeKey(req, key);
    await deleteObject(key);
    return res.json({ success: true, message: "File deleted." });
  } catch (err) {
    return fail(res, err);
  }
});

export const listPurposes = (req, res) =>
  res.json({
    success: true,
    data: Object.fromEntries(
      Object.entries(UPLOAD_PURPOSES).map(([name, rule]) => [name, { contentTypes: Object.keys(rule.types), maxBytes: rule.maxBytes }])
    ),
  });
