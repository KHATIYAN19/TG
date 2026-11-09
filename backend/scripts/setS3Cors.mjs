/*
  Lets the browser upload photos and videos straight to your S3 bucket (presigned POST) and show them (GET).
  Without a CORS rule on the bucket, browsers block those requests and uploads fail with a network error.

    node scripts/setS3Cors.mjs                       show the rule that would be applied (changes nothing)
    node scripts/setS3Cors.mjs --apply               apply it to S3_BUCKET_NAME
    node scripts/setS3Cors.mjs --origin https://app.example.com --apply     add another allowed site

  Allowed sites: FRONTEND_URL, its www / non-www twin, any --origin you pass, and localhost:5173 / 3000 outside production.
  NOTE: this REPLACES the bucket's whole CORS configuration. It needs the s3:PutBucketCORS permission (a bucket-admin key).
  Uses the same env as the app (S3_BUCKET_NAME, S3_REGION, AMAZON_ACCESS_KEY_ID, AMAZON_SECRET_ACCESS_KEY).
*/
import "dotenv/config";
import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from "@aws-sdk/client-s3";

import { s3Config } from "../services/storage/s3.js";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const extra = args.flatMap((a, i) => (a === "--origin" && args[i + 1] ? [args[i + 1]] : []));

const origins = new Set(extra);
const front = String(process.env.FRONTEND_URL || "").replace(/\/+$/, "");
if (front) {
  origins.add(front);
  if (!/localhost|127\.0\.0\.1/.test(front)) origins.add(front.includes("//www.") ? front.replace("//www.", "//") : front.replace("//", "//www."));
}
if (process.env.NODE_ENV !== "production") ["http://localhost:5173", "http://localhost:3000"].forEach((o) => origins.add(o));

const rule = {
  CORSRules: [{
    AllowedOrigins: [...origins],
    AllowedMethods: ["GET", "HEAD", "POST"],
    AllowedHeaders: ["*"],
    ExposeHeaders: ["ETag"],
    MaxAgeSeconds: 3000,
  }],
};

console.log("CORS rule:\n" + JSON.stringify(rule, null, 2));
if (!origins.size) { console.error("\nNo allowed origins. Set FRONTEND_URL or pass --origin https://your-site."); process.exit(1); }

const cfg = s3Config();
if (!cfg.configured) { console.error(`\nS3 is not configured (missing: ${cfg.missing.join(", ")}).`); process.exit(1); }
if (!apply) { console.log(`\nDry run: nothing was changed. Run again with --apply to set this on bucket "${cfg.bucket}".`); process.exit(0); }

const s3 = new S3Client({ region: cfg.region, credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey, sessionToken: cfg.sessionToken } });
try {
  await s3.send(new PutBucketCorsCommand({ Bucket: cfg.bucket, CORSConfiguration: rule }));
  const now = await s3.send(new GetBucketCorsCommand({ Bucket: cfg.bucket }));
  console.log(`\nApplied to "${cfg.bucket}". Rules now on the bucket: ${now.CORSRules?.length}.`);
} catch (e) {
  console.error(`\nCould not set CORS: ${e.name}: ${e.message}`);
  if (e.name === "AccessDenied") console.error('\nThis key is not allowed to change bucket settings (that is normal for an app key). Set it by hand instead:\nAWS console > S3 > your bucket > Permissions > Cross-origin resource sharing (CORS) > Edit, then paste the "CORSRules" array printed above.');
  process.exit(1);
}
