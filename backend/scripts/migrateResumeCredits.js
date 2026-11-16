// Usage: node scripts/migrateResumeCredits.js [--dry]
// One-time repair for Resume Lab records made before plans had separate AI / human / LinkedIn credits:
//   purchases: submissionsAllowed -> aiAllowed, used -> aiUsed, and the new fields get 0
//   requests:  an old request that had a human review gets humanRequested = true
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env") });
import mongoose from "mongoose";

import connectDB from "../utils/dbConnection.js";

const dry = process.argv.includes("--dry");
await connectDB();
const db = mongoose.connection.db;
const purchases = db.collection("resumepurchases");
const requests = db.collection("resumerequests");

const old = await purchases.find({ aiAllowed: { $exists: false } }).toArray();
console.log(`${old.length} purchase(s) to repair`);
for (const p of old) {
  const set = { aiAllowed: p.submissionsAllowed ?? 1, aiUsed: p.used ?? 0, humanAllowed: 0, humanUsed: 0, linkedinAllowed: 0, linkedinUsed: 0 };
  console.log(`  - ${p._id}: AI ${set.aiUsed}/${set.aiAllowed === 0 ? "unlimited" : set.aiAllowed}`);
  if (!dry) await purchases.updateOne({ _id: p._id }, { $set: set });
}
const reqs = await requests.find({ humanRequested: { $exists: false } }).toArray();
console.log(`${reqs.length} request(s) to repair`);
for (const r of reqs) {
  const asked = Boolean(r.packageSnapshot?.includes?.humanReview);
  if (!dry) await requests.updateOne({ _id: r._id }, { $set: { humanRequested: asked, humanPurchase: null, linkedinRequested: Boolean(r.linkedinUrl), linkedinPurchase: null } });
}
await mongoose.disconnect();
console.log(dry ? "Dry run only." : "Done.");
