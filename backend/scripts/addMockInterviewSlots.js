// Usage: node scripts/addMockInterviewSlots.js [--dry] [--email=interviewer@example.com]
// Creates two mock-interview slots (8-8:45 PM, 9-9:45 PM IST) for today and each of the next 7 days (8 days total).
// Slots already in the past are skipped.
import "dotenv/config";
import mongoose from "mongoose";

import User from "../models/User.js";
import InterviewSlot from "../models/InterviewSlot.js";
import connectDB from "../utils/dbConnection.js";

const DAYS_AHEAD = 7; // today + next 7 days
const PRICE = 499;
const MRP = 799;
const MEETING_URL = "https://meet.google.com/wbx-zczm-rvt";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// [startHour, startMin, endHour, endMin] in 24h IST
const SLOTS = [
  [20, 0, 20, 45], // 8:00 PM - 8:45 PM
  [21, 0, 21, 45], // 9:00 PM - 9:45 PM
];

const dry = process.argv.includes("--dry");
const emailArg = process.argv
  .find((a) => a.startsWith("--email="))
  ?.split("=")[1];

// Midnight-UTC marker of today's date in IST
const istNow = new Date(Date.now() + IST_OFFSET_MS);
const todayIst = Date.UTC(
  istNow.getUTCFullYear(),
  istNow.getUTCMonth(),
  istNow.getUTCDate()
);

const istToUtc = (dayOffset, h, m) =>
  new Date(todayIst + dayOffset * 86400000 + (h * 60 + m) * 60000 - IST_OFFSET_MS);

const run = async () => {
  await connectDB();

  const interviewer = emailArg
    ? await User.findOne({ email: emailArg.toLowerCase() })
    : await User.findOne({ role: "admin" }).sort({ createdAt: 1 });

  if (!interviewer) {
    throw new Error("Interviewer/admin user not found. Pass --email=...");
  }
  console.log(`Interviewer: ${interviewer.email} (${interviewer._id})`);

  for (let day = 0; day <= DAYS_AHEAD; day++)
  for (const [sh, sm, eh, em] of SLOTS) {
    const startTime = istToUtc(day, sh, sm);
    const endTime = istToUtc(day, eh, em);

    if (startTime <= new Date()) {
      console.log(`SKIP (past): ${startTime.toISOString()}`);
      continue;
    }

    const exists = await InterviewSlot.findOne({
      interviewerId: interviewer._id,
      startTime,
      endTime,
      isDeleted: false,
    });

    if (exists) {
      console.log(`SKIP (exists): ${startTime.toISOString()}`);
      continue;
    }

    const doc = {
      interviewerId: interviewer._id,
      startTime,
      endTime,
      durationMinutes: (endTime - startTime) / 60000,
      timezone: "Asia/Kolkata",
      price: PRICE,
      mrp: MRP,
      meetingUrl: MEETING_URL,
      status: "AVAILABLE",
      active: true,
      isDeleted: false,
      createdBy: interviewer._id,
      updatedBy: interviewer._id,
    };

    if (dry) {
      console.log("DRY:", doc);
      continue;
    }

    const created = await InterviewSlot.create(doc);
    console.log(
      `CREATED ${created._id}: ${startTime.toISOString()} -> ${endTime.toISOString()}`
    );
  }
};

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
