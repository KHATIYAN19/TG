// Usage: node scripts/seedResumePlans.js [--dry]
// Resume Lab: replaces the plans with the standard eight (AI Check, AI Triple, Human Review, Starter, Plus, Pro, Power, Institute).
//   - a plan nobody ever bought is deleted
//   - a plan someone bought is only hidden (their payment history keeps pointing at it)
//   - then the eight are created, or updated in place if their key already exists
// --dry only prints what would happen.
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env") });
import mongoose from "mongoose";

import ResumePackage from "../models/resume/ResumePackage.js";
import ResumePurchase from "../models/resume/ResumePurchase.js";
import { DEFAULT_PLANS } from "../services/resume/service.js";
import connectDB from "../utils/dbConnection.js";

const dry = process.argv.includes("--dry");
const keep = new Set(DEFAULT_PLANS.map((p) => p.key));

await connectDB();
const existing = await ResumePackage.find().lean();
console.log(`${dry ? "[dry run] " : ""}${existing.length} existing plan(s):`);

for (const p of existing) {
  const bought = await ResumePurchase.exists({ package: p._id });
  const replaced = keep.has(p.key);
  const action = replaced ? "update to the standard version" : bought ? "hide (it has purchases)" : "delete";
  console.log(`  - ${p.key} (${p.name}, ₹${p.pricePaise / 100}): ${action}`);
  if (dry || replaced) continue;
  if (bought) await ResumePackage.updateOne({ _id: p._id }, { isActive: false });
  else await ResumePackage.deleteOne({ _id: p._id });
}

console.log(`${dry ? "[dry run] would create" : "Creating"} ${DEFAULT_PLANS.length} plans:`);
for (const plan of DEFAULT_PLANS) {
  console.log(`  + ${plan.key}: ₹${plan.pricePaise / 100}, ${plan.aiReviews} AI, ${plan.humanReviews} human, ${plan.linkedinReviews} LinkedIn, ${plan.validityDays || "no"} days`);
  if (!dry) await ResumePackage.findOneAndUpdate({ key: plan.key }, { $set: { ...plan, isActive: true } }, { upsert: true, new: true, setDefaultsOnInsert: true });
}

await mongoose.disconnect();
console.log("Done.");
