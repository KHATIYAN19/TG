import crypto from "node:crypto";
import path from "node:path";

import { S3Client, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

/*
  Amazon S3 storage via presigned URLs.

  The backend never touches file bytes: it signs a short-lived URL/form and the
  client talks to S3 directly.

  Environment
    S3_BUCKET_NAME                       bucket name                       (required)
    S3_REGION                            defaults to AMAZON_REGION / AWS_REGION
    AMAZON_ACCESS_KEY_ID / AMAZON_SECRET_ACCESS_KEY (or AWS_*)  same keys as SES/SQS
    AMAZON_SESSION_TOKEN                 optional
    S3_UPLOAD_URL_TTL_SECONDS            default 300
    S3_DOWNLOAD_URL_TTL_SECONDS          default 300
    S3_KEY_PREFIX                        optional, e.g. "prod" -> prod/uploads/...

  IAM needed on arn:aws:s3:::BUCKET/*: s3:PutObject, s3:GetObject, s3:DeleteObject
  Bucket CORS must allow POST + GET from the frontend origin (see README note in the
  controller header).
*/

const firstEnv = (...names) => {
  for (const name of names) {
    const value = String(process.env[name] || "").trim();
    if (value) return value;
  }
  return "";
};

const MB = 1024 * 1024;

/*
  Allow-list of upload purposes. The client picks a purpose; type and size limits
  are enforced here (and again by S3 itself through the presigned POST policy).
  Add or edit entries to suit the app.
*/
export const UPLOAD_PURPOSES = {
  avatar: { types: { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" }, maxBytes: 5 * MB },
  image: { types: { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" }, maxBytes: 10 * MB },
  document: { types: { "application/pdf": ".pdf" }, maxBytes: 20 * MB },
  // Memory pages: the per-page photo/video limits are enforced by the admin settings in
  // controllers/memory; these are only the hard ceilings.
  memory_photo: { types: { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" }, maxBytes: 25 * MB },
  memory_video: { types: { "video/mp4": ".mp4", "video/webm": ".webm", "video/quicktime": ".mov" }, maxBytes: 500 * MB },
  resume: {
    types: {
      "application/pdf": ".pdf",
      "application/msword": ".doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    },
    maxBytes: 10 * MB,
  },
};

export class StorageError extends Error {
  constructor(message, status = 400, code = "STORAGE_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const intEnv = (name, fallback) => {
  const n = Number.parseInt(process.env[name], 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const s3Config = () => {
  const accessKeyId = firstEnv("AMAZON_ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID");
  const secretAccessKey = firstEnv("AMAZON_SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY");
  const region = firstEnv("S3_REGION", "AMAZON_REGION", "AWS_REGION", "AWS_DEFAULT_REGION");
  const bucket = firstEnv("S3_BUCKET_NAME");

  const missing = [
    ...(accessKeyId ? [] : ["AMAZON_ACCESS_KEY_ID"]),
    ...(secretAccessKey ? [] : ["AMAZON_SECRET_ACCESS_KEY"]),
    ...(region ? [] : ["S3_REGION"]),
    ...(bucket ? [] : ["S3_BUCKET_NAME"]),
  ];

  return {
    accessKeyId,
    secretAccessKey,
    sessionToken: firstEnv("AMAZON_SESSION_TOKEN", "AWS_SESSION_TOKEN") || undefined,
    region,
    bucket,
    keyPrefix: firstEnv("S3_KEY_PREFIX").replace(/^\/+|\/+$/g, ""),
    uploadTtl: intEnv("S3_UPLOAD_URL_TTL_SECONDS", 300),
    downloadTtl: intEnv("S3_DOWNLOAD_URL_TTL_SECONDS", 300),
    missing,
    configured: missing.length === 0,
  };
};

export const isS3Configured = () => s3Config().configured;

let cached = null;
const client = () => {
  const cfg = s3Config();
  if (!cfg.configured) {
    throw new StorageError(`S3 is not configured (missing: ${cfg.missing.join(", ")}).`, 503, "S3_NOT_CONFIGURED");
  }
  const signature = `${cfg.accessKeyId}|${cfg.region}`;
  if (!cached || cached.signature !== signature) {
    cached = {
      signature,
      s3: new S3Client({
        region: cfg.region,
        credentials: {
          accessKeyId: cfg.accessKeyId,
          secretAccessKey: cfg.secretAccessKey,
          sessionToken: cfg.sessionToken,
        },
      }),
    };
  }
  return { s3: cached.s3, cfg };
};

/* ---------- keys ---------- */

const slug = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

/** Everything a user owns lives under this prefix. */
export const userPrefix = (userId, cfg = s3Config()) =>
  [cfg.keyPrefix, "uploads", String(userId)].filter(Boolean).join("/") + "/";

export const buildKey = ({ userId, purpose, contentType, filename }) => {
  const rule = UPLOAD_PURPOSES[purpose];
  const ext = rule.types[contentType];
  const base = slug(path.parse(String(filename || "")).name) || "file";
  return `${userPrefix(userId)}${purpose}/${crypto.randomUUID()}-${base}${ext}`;
};

/** A key is only valid if it is non-empty, has no traversal, and sits under `prefix`. */
export const keyBelongsTo = (key, prefix) =>
  typeof key === "string" &&
  key.length > 0 &&
  key.length <= 1024 &&
  !key.includes("..") &&
  !key.includes("\\") &&
  key.startsWith(prefix);

/* ---------- validation ---------- */

export const validateUploadRequest = ({ purpose, contentType, size }) => {
  const rule = UPLOAD_PURPOSES[purpose];
  if (!rule) {
    throw new StorageError(`Unknown purpose. Allowed: ${Object.keys(UPLOAD_PURPOSES).join(", ")}.`, 400, "INVALID_PURPOSE");
  }
  if (!rule.types[contentType]) {
    throw new StorageError(`File type not allowed for "${purpose}". Allowed: ${Object.keys(rule.types).join(", ")}.`, 400, "INVALID_FILE_TYPE");
  }
  if (!Number.isInteger(size) || size <= 0) {
    throw new StorageError("size must be a positive integer (bytes).", 400, "INVALID_SIZE");
  }
  if (size > rule.maxBytes) {
    throw new StorageError(`File too large. Max ${Math.round(rule.maxBytes / MB)} MB for "${purpose}".`, 413, "FILE_TOO_LARGE");
  }
  return rule;
};

/* ---------- S3 operations ---------- */

/**
 * Presigned POST: the client must submit `fields` + the file as multipart/form-data
 * to `url` (file field LAST, named "file"). S3 rejects anything outside the policy:
 * wrong key, wrong Content-Type, or size beyond the limit.
 */
export const createUploadTarget = async ({ userId, purpose, contentType, size, filename }) => {
  const rule = validateUploadRequest({ purpose, contentType, size });
  const { s3, cfg } = client();
  const key = buildKey({ userId, purpose, contentType, filename });

  const { url, fields } = await createPresignedPost(s3, {
    Bucket: cfg.bucket,
    Key: key,
    Expires: cfg.uploadTtl,
    Fields: { "Content-Type": contentType },
    Conditions: [
      ["content-length-range", 1, rule.maxBytes],
      ["eq", "$Content-Type", contentType],
    ],
  });

  return { key, url, fields, method: "POST", expiresIn: cfg.uploadTtl, maxBytes: rule.maxBytes };
};

/** Confirms the object really exists (and returns its real size/type). */
export const headObject = async (key) => {
  const { s3, cfg } = client();
  try {
    const out = await s3.send(new HeadObjectCommand({ Bucket: cfg.bucket, Key: key }));
    return { key, size: out.ContentLength, contentType: out.ContentType, lastModified: out.LastModified, etag: out.ETag };
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404 || err?.name === "NotFound") return null;
    throw err;
  }
};

export const createDownloadUrl = async (key, { filename, inline = false, ttl } = {}) => {
  const { s3, cfg } = client();
  const safeName = filename ? String(filename).replace(/[^\w.\- ]+/g, "_").slice(0, 120) : "";
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      ...(safeName ? { ResponseContentDisposition: `${inline ? "inline" : "attachment"}; filename="${safeName}"` } : {}),
    }),
    { expiresIn: ttl || cfg.downloadTtl }
  );
  return { url, expiresIn: ttl || cfg.downloadTtl };
};

export const deleteObject = async (key) => {
  const { s3, cfg } = client();
  await s3.send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key }));
};
