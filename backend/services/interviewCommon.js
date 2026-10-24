
import crypto from "crypto";
import mongoose from "mongoose";

import InterviewSlot from "../models/InterviewSlot.js";
import InterviewBooking from "../models/InterviewBooking.js";

export { InterviewSlot, InterviewBooking };

export const TOPICS = [
  "DSA",
  "LLD",
  "HLD",
  "GENAI",
  "PROJECTS",
];

export const HOLD_MINUTES = 15;
export const SLOT_BUFFER_MINUTES = 15;

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const fail = (status, message) => {
  throw new ApiError(status, message);
};

export const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const isObjectId = (id) =>
  mongoose.isValidObjectId(id);

export const requireId = (id, label = "ID") => {
  if (!isObjectId(id)) {
    fail(400, `Invalid ${label}`);
  }
  return id;
};

export const makeId = (prefix) =>
  `${prefix}_${Date.now()}_${crypto
    .randomBytes(6)
    .toString("hex")}`;

export const cleanString = (value, max = 1000) =>
  String(value ?? "").trim().slice(0, max);

export const uniqueTopics = (items) => {
  if (!Array.isArray(items)) {
    fail(400, "selectedTopics must be an array");
  }

  const result = items.map((x) =>
    cleanString(x).toUpperCase()
  );

  if (
    !result.length ||
    result.some((x) => !TOPICS.includes(x)) ||
    new Set(result).size !== result.length
  ) {
    fail(400, "Invalid or duplicate interview topics");
  }

  return result;
};

export const dateValue = (input, label) => {
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    fail(400, `Invalid ${label}`);
  }

  return date;
};

export const getActorId = (req) => {
  const id =
    req.user?._id ||
    req.user?.id ||
    req.user?.userId;

  if (!isObjectId(id)) {
    fail(401, "Authentication required");
  }

  return id;
};

export const requireAdmin = (req) => {
  const role = String(
    req.user?.role || ""
  ).toLowerCase();

  if (role !== "admin") {
    fail(403, "Admin access required");
  }

  return getActorId(req);
};

export const validateCandidate = (data) => {
  const name = cleanString(data?.name, 120);
  const email = cleanString(
    data?.email,
    254
  ).toLowerCase();

  const phone = cleanString(data?.phone, 30);

  if (name.length < 2) {
    fail(400, "Candidate name is required");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail(400, "Valid email is required");
  }

  if (!/^[+\d\s()-]{7,30}$/.test(phone)) {
    fail(400, "Valid phone number is required");
  }

  const years = Number(data?.experienceYears ?? 0);

  if (
    !Number.isFinite(years) ||
    years < 0 ||
    years > 50
  ) {
    fail(400, "Invalid years of experience");
  }

  const resumeUrl = cleanString(data?.resumeUrl, 1000);

  if (resumeUrl) {
    let parsed;

    try {
      parsed = new URL(resumeUrl);
    } catch {
      fail(400, "Invalid resume URL");
    }

    if (
      parsed.protocol !== "https:" &&
      parsed.protocol !== "http:"
    ) {
      fail(400, "Resume URL must use HTTP or HTTPS");
    }
  }

  return {
    name,
    email,
    phone,
    experienceYears: years,
    currentRole: cleanString(data?.currentRole, 120),
    targetRole: cleanString(data?.targetRole, 120),
    currentCompany: cleanString(data?.currentCompany, 120),
    resumeUrl,
    notes: cleanString(data?.notes, 3000),
  };
};

export const validateSlotFields = (data) => {
  const startTime = dateValue(
    data.startTime,
    "startTime"
  );

  const endTime = dateValue(data.endTime, "endTime");

  if (endTime <= startTime) {
    fail(400, "End time must follow start time");
  }

  const durationMinutes =
    (endTime.getTime() - startTime.getTime()) / 60000;

  if (
    durationMinutes < 15 ||
    durationMinutes > 240
  ) {
    fail(400, "Duration must be 15–240 minutes");
  }

  const price = Number(data.price);
  const mrp = Number(data.mrp);

  if (
    !Number.isFinite(price) ||
    !Number.isFinite(mrp) ||
    price <= 0 ||
    mrp < price
  ) {
    fail(400, "Invalid slot price or MRP");
  }

  const allowedTopics =
    data.allowedTopics == null
      ? [...TOPICS]
      : uniqueTopics(data.allowedTopics);

  const maxTopics = Number(
    data.maxTopics ?? Math.min(3, allowedTopics.length)
  );

  if (
    !Number.isInteger(maxTopics) ||
    maxTopics < 1 ||
    maxTopics > allowedTopics.length
  ) {
    fail(400, "Invalid maxTopics");
  }

  return {
    title: cleanString(
      data.title || "1:1 Mock Interview",
      150
    ),
    description: cleanString(data.description, 2000),
    startTime,
    endTime,
    durationMinutes,
    timezone: "Asia/Kolkata",
    price,
    mrp,
    currency: "INR",
    allowedTopics,
    maxTopics,
    meetingUrl: cleanString(data.meetingUrl, 1000),
  };
};

/*
  Note: This guards against existing overlaps.
  Serialize concurrent admin schedule mutations
  per interviewer in your application as well;
  MongoDB has no interval-exclusion index.
*/
export const assertNoOverlap = async ({
  interviewerId,
  startTime,
  endTime,
  excludeId,
  session,
}) => {
  const bufferMs = SLOT_BUFFER_MINUTES * 60000;

  const query = {
    interviewerId,
    isDeleted: false,
    startTime: {
      $lt: new Date(endTime.getTime() + bufferMs),
    },
    endTime: {
      $gt: new Date(startTime.getTime() - bufferMs),
    },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  let find = InterviewSlot.findOne(query);

  if (session) {
    find = find.session(session);
  }

  const conflict = await find;

  if (conflict) {
    fail(
      409,
      "This slot overlaps another interview or its buffer"
    );
  }
};

export const withTransaction = async (fn) => {
  return mongoose.connection.transaction(
    async (session) => fn(session),
    {
      readPreference: "primary",
      writeConcern: { w: "majority" },
    }
  );
};

export const slotIsPublic = {
  active: true,
  isDeleted: false,
  status: "AVAILABLE",
};

export const releaseReservationUpdate = {
  $set: {
    status: "AVAILABLE",
    reservation: {
      bookingId: null,
      heldAt: null,
      expiresAt: null,
      bookedAt: null,
    },
  },
};

export const addEvent = (
  booking,
  type,
  fromStatus,
  toStatus,
  reason = "",
  actorId = null
) => {
  booking.events.push({
    type,
    fromStatus,
    toStatus,
    reason,
    actorId,
    createdAt: new Date(),
  });
};

export const publicSlot = (slot) => ({
  _id: slot._id,
  title: slot.title,
  description: slot.description,
  startTime: slot.startTime,
  endTime: slot.endTime,
  durationMinutes: slot.durationMinutes,
  timezone: slot.timezone,
  price: slot.price,
  mrp: slot.mrp,
  currency: slot.currency,
  allowedTopics: slot.allowedTopics,
  maxTopics: slot.maxTopics,
});

export const publicBooking = (booking) => ({
  bookingId: booking.bookingId,
  status: booking.status,
  selectedTopics: booking.selectedTopics,
  slotSnapshot: booking.slotSnapshot,
  paymentStatus: booking.payment.status,
  refundStatus: booking.refund?.status,
  cancellation: booking.cancellation
    ? {
        reason: booking.cancellation.reason,
        cancelledAt: booking.cancellation.cancelledAt,
      }
    : null,
});

/*
  Authorization helper.

  Logged-in users must own the booking.
  Guest booking retrieval should use a separate
  verified/expiring access token, not the booking ID.
*/
export const assertBookingOwner = (req, booking) => {
  const actorId = getActorId(req);

  const role = String(
    req.user?.role || ""
  ).toLowerCase();

  if (role === "admin") return;

  const owner = booking.candidate?.userId;

  if (!owner || String(owner) !== String(actorId)) {
    fail(403, "You cannot access this booking");
  }
};
