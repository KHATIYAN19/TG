import test from "node:test";
import assert from "node:assert/strict";

process.env.AMAZON_ACCESS_KEY_ID = "AKIDEXAMPLE";
process.env.AMAZON_SECRET_ACCESS_KEY = "secret";
process.env.S3_REGION = "ap-south-1";
process.env.S3_BUCKET_NAME = "test-bucket";

const s3 = await import("../../services/storage/s3.js");

test("validateUploadRequest rejects bad purpose, type and size", () => {
  assert.throws(() => s3.validateUploadRequest({ purpose: "nope", contentType: "image/png", size: 1 }), { code: "INVALID_PURPOSE" });
  assert.throws(() => s3.validateUploadRequest({ purpose: "avatar", contentType: "application/pdf", size: 1 }), { code: "INVALID_FILE_TYPE" });
  assert.throws(() => s3.validateUploadRequest({ purpose: "avatar", contentType: "image/png", size: 0 }), { code: "INVALID_SIZE" });
  assert.throws(() => s3.validateUploadRequest({ purpose: "avatar", contentType: "image/png", size: 6 * 1024 * 1024 }), { code: "FILE_TOO_LARGE" });
  assert.ok(s3.validateUploadRequest({ purpose: "avatar", contentType: "image/png", size: 1024 }));
});

test("buildKey is namespaced per user and ignores client-supplied extension", () => {
  const key = s3.buildKey({ userId: "u1", purpose: "avatar", contentType: "image/png", filename: "../../Evil Name.exe" });
  assert.match(key, /^uploads\/u1\/avatar\/[0-9a-f-]{36}-evil-name\.png$/);
});

test("keyBelongsTo blocks other users and traversal", () => {
  const prefix = s3.userPrefix("u1");
  assert.equal(s3.keyBelongsTo("uploads/u1/avatar/a.png", prefix), true);
  assert.equal(s3.keyBelongsTo("uploads/u2/avatar/a.png", prefix), false);
  assert.equal(s3.keyBelongsTo("uploads/u1/../u2/a.png", prefix), false);
  assert.equal(s3.keyBelongsTo("uploads/u10/a.png", prefix), false);
});

test("createUploadTarget returns a policy-bound presigned POST (no network)", async () => {
  const t = await s3.createUploadTarget({ userId: "u1", purpose: "document", contentType: "application/pdf", size: 1000, filename: "cv.pdf" });
  assert.match(t.url, /test-bucket/);
  assert.equal(t.fields["Content-Type"], "application/pdf");
  assert.equal(t.fields.key, t.key);
  const policy = JSON.parse(Buffer.from(t.fields.Policy, "base64").toString());
  assert.deepEqual(policy.conditions.find((c) => c[0] === "content-length-range"), ["content-length-range", 1, 20 * 1024 * 1024]);
});

test("createDownloadUrl returns a signed GET URL (no network)", async () => {
  const { url } = await s3.createDownloadUrl("uploads/u1/document/x.pdf", { filename: "cv.pdf" });
  assert.match(url, /X-Amz-Signature=/);
  assert.match(url, /X-Amz-Expires=300/);
});
