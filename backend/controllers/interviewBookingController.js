
// import mongoose from "mongoose";

// import {
//   InterviewSlot,
//   InterviewBooking,
//   wrap,
//   fail,
//   requireId,
//   makeId,
//   uniqueTopics,
//   validateCandidate,
//   slotIsPublic,
//   publicBooking,
//   addEvent,
//   withTransaction,
//   HOLD_MINUTES,
//   releaseReservationUpdate,
// } from "../services/interviewCommon.js";

// /* ============================================================
//    INTERVIEW BOOKING CONTROLLER

//    PUBLIC GUEST BOOKING SYSTEM

//    Features:
//    - No login required
//    - No account JWT required
//    - Public interview slots
//    - Guest booking creation
//    - Atomic MongoDB slot reservation
//    - Server-controlled pricing
//    - Payment status retrieval
//    - Automatic unpaid booking expiry
//    - No customer cancellation endpoint

//    Admin cancellation is handled separately in:
//    interviewAdminController.js
// ============================================================ */

// const TIMEZONE = "Asia/Kolkata";

// const HOLD_MS = HOLD_MINUTES * 60 * 1000;

// const ALLOWED_TOPICS = [
//   "DSA",
//   "LLD",
//   "HLD",
//   "GENAI",
//   "PROJECTS",
// ];

// const normalize = (value) =>
//   String(value ?? "")
//     .trim()
//     .toUpperCase();

// const emptyReservation = () => ({
//   bookingId: null,
//   heldAt: null,
//   expiresAt: null,
//   bookedAt: null,
// });

// /* ============================================================
//    DATE VALIDATION

//    All calendar dates are interpreted in IST.

//    Example:
//    2026-10-26

//    Start:
//    2026-10-26 00:00 IST

//    End:
//    2026-10-27 00:00 IST
// ============================================================ */

// const parseIndianDate = (value) => {
//   const input = String(value ?? "").trim();

//   if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
//     fail(
//       400,
//       "Date must use YYYY-MM-DD format"
//     );
//   }

//   const start = new Date(
//     `${input}T00:00:00+05:30`
//   );

//   if (Number.isNaN(start.getTime())) {
//     fail(400, "Invalid interview date");
//   }

//   const formatted = new Intl.DateTimeFormat(
//     "en-CA",
//     {
//       timeZone: TIMEZONE,
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     }
//   ).format(start);

//   if (formatted !== input) {
//     fail(400, "Invalid calendar date");
//   }

//   return {
//     start,
//     end: new Date(
//       start.getTime() + 86400000
//     ),
//   };
// };

// /* ============================================================
//    PUBLIC SLOT RESPONSE

//    Only expose information needed by customers.

//    Never expose:
//    - Meeting URL
//    - Interviewer personal details
//    - Slot reservation object
//    - Candidate data
//    - Payment information
//    - Admin notes
// ============================================================ */

// const safePublicSlot = (slot) => {
//   const status = normalize(slot.status);

//   return {
//     _id: slot._id,

//     title:
//       slot.title ||
//       "Technical Mock Interview",

//     description:
//       slot.description || "",

//     startTime:
//       slot.startTime,

//     endTime:
//       slot.endTime,

//     durationMinutes:
//       slot.durationMinutes,

//     timezone:
//       slot.timezone || TIMEZONE,

//     price:
//       slot.price,

//     mrp:
//       slot.mrp,

//     currency:
//       slot.currency || "INR",

//     allowedTopics:
//       slot.allowedTopics || [],

//     maxTopics:
//       slot.maxTopics,

//     status,

//     available:
//       status === "AVAILABLE" &&
//       slot.active === true &&
//       slot.isDeleted !== true &&
//       new Date(slot.startTime) > new Date(),
//   };
// };

// /* ============================================================
//    PUBLIC PAYMENT STATUS

//    This is intentionally a limited response.

//    A booking ID alone must not expose:
//    - Customer name
//    - Customer email
//    - Customer phone
//    - Resume URL
//    - Meeting URL
//    - Admin notes
//    - Gateway credentials

//    This endpoint reports status only.

//    If you later need to return sensitive booking
//    details, verify guest ownership inside the
//    controller before returning those details.
// ============================================================ */

// const buildPublicBookingStatus = (booking) => {
//   const bookingStatus =
//     normalize(booking.status);

//   const paymentStatus =
//     normalize(
//       booking.payment?.status ||
//         "NOT_STARTED"
//     );

//   const confirmed =
//     bookingStatus === "CONFIRMED";

//   const paymentReceived =
//     paymentStatus === "SUCCESS";

//   const refundStatus =
//     normalize(
//       booking.refund?.status ||
//         "NOT_REQUIRED"
//     );

//   const refundRequired =
//     paymentReceived &&
//     !confirmed &&
//     [
//       "PENDING",
//       "PROCESSING",
//       "FAILED",
//     ].includes(refundStatus);

//   let displayStatus = "PENDING";

//   if (confirmed) {
//     displayStatus = "SUCCESS";
//   } else if (refundRequired) {
//     displayStatus = "REFUND_REQUIRED";
//   } else if (
//     [
//       "PAYMENT_FAILED",
//       "EXPIRED",
//       "CANCELLED_BY_ADMIN",
//       "CANCELLED_BY_USER",
//     ].includes(bookingStatus)
//   ) {
//     displayStatus = "FAILED";
//   } else if (
//     bookingStatus === "COMPLETED"
//   ) {
//     displayStatus = "COMPLETED";
//   } else if (
//     bookingStatus === "NO_SHOW"
//   ) {
//     displayStatus = "NO_SHOW";
//   }

//   return {
//     bookingId:
//       booking.bookingId,

//     status:
//       bookingStatus,

//     paymentStatus,

//     displayStatus,

//     confirmed,

//     paymentReceived,

//     refundRequired,

//     refundStatus,

//     holdExpiresAt:
//       booking.holdExpiresAt || null,

//     confirmedAt:
//       booking.confirmedAt || null,

//     // No meeting link on a public lookup.
//     meetingUrl: null,
//   };
// };

// /* ============================================================
//    1. GET AVAILABLE INTERVIEW SLOTS

//    GET /api/interviews/slots

//    Optional query parameters:

//    ?date=2026-10-26
//    ?topic=DSA
//    ?includeUnavailable=true

//    Public endpoint.
//    No account authentication.
// ============================================================ */

// export const getAvailableSlots = wrap(
//   async (req, res) => {
//     const now = new Date();

//     const {
//       date,
//       topic,
//       includeUnavailable,
//     } = req.query;

//     const query = {
//       active: true,
//       isDeleted: false,

//       startTime: {
//         $gt: now,
//       },
//     };

//     /* --------------------------------------------------------
//        DATE FILTER
//     -------------------------------------------------------- */

//     if (date) {
//       const {
//         start,
//         end,
//       } = parseIndianDate(date);

//       query.startTime = {
//         $gte:
//           start > now
//             ? start
//             : now,

//         $lt: end,
//       };
//     } else {
//       query.startTime = {
//         $gt: now,

//         $lt: new Date(
//           now.getTime() +
//             9 * 86400000
//         ),
//       };
//     }

//     /* --------------------------------------------------------
//        TOPIC FILTER
//     -------------------------------------------------------- */

//     if (topic) {
//       const normalizedTopic =
//         normalize(topic);

//       if (
//         !ALLOWED_TOPICS.includes(
//           normalizedTopic
//         )
//       ) {
//         fail(
//           400,
//           "Invalid interview topic"
//         );
//       }

//       query.allowedTopics =
//         normalizedTopic;
//     }

//     /* --------------------------------------------------------
//        AVAILABILITY FILTER
//     -------------------------------------------------------- */

//     const showUnavailable =
//       String(includeUnavailable)
//         .trim()
//         .toLowerCase() === "true";

//     if (!showUnavailable) {
//       query.status = "AVAILABLE";
//     } else {
//       query.status = {
//         $in: [
//           "AVAILABLE",
//           "HELD",
//           "BOOKED",
//           "BLOCKED",
//         ],
//       };
//     }

//     /* --------------------------------------------------------
//        DATABASE QUERY
//     -------------------------------------------------------- */

//     const slots =
//       await InterviewSlot.find(query)
//         .select(
//           [
//             "_id",
//             "title",
//             "description",
//             "startTime",
//             "endTime",
//             "durationMinutes",
//             "timezone",
//             "price",
//             "mrp",
//             "currency",
//             "allowedTopics",
//             "maxTopics",
//             "status",
//             "active",
//             "isDeleted",
//           ].join(" ")
//         )
//         .sort({
//           startTime: 1,
//           _id: 1,
//         })
//         .limit(500)
//         .lean();

//     const data = slots.map(
//       safePublicSlot
//     );

//     const summary = {
//       total: data.length,

//       available:
//         data.filter(
//           (item) =>
//             item.status ===
//             "AVAILABLE"
//         ).length,

//       booked:
//         data.filter(
//           (item) =>
//             item.status ===
//             "BOOKED"
//         ).length,

//       held:
//         data.filter(
//           (item) =>
//             item.status ===
//             "HELD"
//         ).length,

//       blocked:
//         data.filter(
//           (item) =>
//             item.status ===
//             "BLOCKED"
//         ).length,
//     };

//     return res.status(200).json({
//       success: true,

//       message:
//         "Interview slots loaded successfully",

//       count:
//         data.length,

//       summary,

//       data,
//     });
//   }
// );

// /* ============================================================
//    2. GET SINGLE PUBLIC SLOT

//    GET /api/interviews/slots/:id

//    Public endpoint.
//    No authentication.

//    Only public and upcoming slots are returned.
// ============================================================ */

// export const getPublicSlot = wrap(
//   async (req, res) => {
//     requireId(
//       req.params.id,
//       "slot ID"
//     );

//     const slot =
//       await InterviewSlot.findOne({
//         _id: req.params.id,

//         ...slotIsPublic,

//         startTime: {
//           $gt: new Date(),
//         },
//       })
//         .select(
//           [
//             "_id",
//             "title",
//             "description",
//             "startTime",
//             "endTime",
//             "durationMinutes",
//             "timezone",
//             "price",
//             "mrp",
//             "currency",
//             "allowedTopics",
//             "maxTopics",
//             "status",
//             "active",
//             "isDeleted",
//           ].join(" ")
//         )
//         .lean();

//     if (!slot) {
//       fail(
//         404,
//         "This interview slot is no longer available"
//       );
//     }

//     return res.status(200).json({
//       success: true,

//       data: safePublicSlot(slot),
//     });
//   }
// );

// /* ============================================================
//    3. CREATE GUEST INTERVIEW BOOKING

//    POST /api/interviews/bookings

//    NO LOGIN REQUIRED.
//    NO JWT REQUIRED.
//    NO req.user REQUIRED.

//    Request:

//    {
//      "slotId": "...",
//      "selectedTopics": [
//        "DSA",
//        "LLD"
//      ],
//      "candidate": {
//        "name": "...",
//        "email": "...",
//        "phone": "...",
//        "experienceYears": 2,
//        "currentRole": "...",
//        "targetRole": "...",
//        "currentCompany": "...",
//        "resumeUrl": "...",
//        "notes": "..."
//      }
//    }

//    Security:
//    - Server-side candidate validation
//    - Server-side topic validation
//    - MongoDB transaction
//    - Atomic slot claiming
//    - Server-controlled amount
//    - No meeting URL in guest response
// ============================================================ */

// export const createInterviewBooking = wrap(
//   async (req, res) => {
//     /* --------------------------------------------------------
//        REQUEST BODY
//     -------------------------------------------------------- */

//     const {
//       slotId,
//       selectedTopics,
//       candidate: inputCandidate,
//     } = req.body || {};

//     /* --------------------------------------------------------
//        SLOT ID VALIDATION
//     -------------------------------------------------------- */

//     requireId(
//       slotId,
//       "slot ID"
//     );

//     /* --------------------------------------------------------
//        TOPIC VALIDATION
//     -------------------------------------------------------- */

//     const topics =
//       uniqueTopics(selectedTopics);

//     if (!topics.length) {
//       fail(
//         400,
//         "Select at least one interview topic"
//       );
//     }

//     /* --------------------------------------------------------
//        CANDIDATE VALIDATION

//        validateCandidate() comes from
//        services/interviewCommon.js.

//        No account user is required.
//     -------------------------------------------------------- */

//     const candidate =
//       validateCandidate(
//         inputCandidate
//       );

//     /* --------------------------------------------------------
//        CREATE IDENTIFIERS
//     -------------------------------------------------------- */

//     const bookingObjectId =
//       new mongoose.Types.ObjectId();

//     const bookingId =
//       makeId("INT");

//     const now = new Date();

//     const holdExpiresAt =
//       new Date(
//         now.getTime() + HOLD_MS
//       );

//     let createdBooking = null;

//     /* --------------------------------------------------------
//        ATOMIC TRANSACTION

//        Only one customer can reserve the slot.

//        This prevents simultaneous double booking.
//     -------------------------------------------------------- */

//     await withTransaction(
//       async (session) => {
//         /* ----------------------------------------------------
//            FETCH AVAILABLE SLOT
//         ---------------------------------------------------- */

//         const slot =
//           await InterviewSlot.findOne({
//             _id: slotId,

//             active: true,

//             isDeleted: false,

//             status: "AVAILABLE",

//             startTime: {
//               $gt: new Date(),
//             },
//           }).session(session);

//         if (!slot) {
//           fail(
//             409,
//             "This slot has already been booked or is unavailable"
//           );
//         }

//         /* ----------------------------------------------------
//            MAXIMUM TOPICS
//         ---------------------------------------------------- */

//         const maximumTopics =
//           Number(slot.maxTopics) ||
//           3;

//         if (
//           topics.length >
//           maximumTopics
//         ) {
//           fail(
//             400,
//             `You can select a maximum of ${maximumTopics} topics`
//           );
//         }

//         /* ----------------------------------------------------
//            ALLOWED TOPICS
//         ---------------------------------------------------- */

//         const slotTopics =
//           Array.isArray(
//             slot.allowedTopics
//           ) &&
//           slot.allowedTopics.length
//             ? slot.allowedTopics
//             : ALLOWED_TOPICS;

//         const invalidTopics =
//           topics.filter(
//             (topic) =>
//               !slotTopics.includes(
//                 topic
//               )
//           );

//         if (
//           invalidTopics.length > 0
//         ) {
//           fail(
//             400,
//             `Topics not supported: ${invalidTopics.join(", ")}`
//           );
//         }

//         /* ----------------------------------------------------
//            ATOMIC SLOT RESERVATION
//         ---------------------------------------------------- */

//         const claimed =
//           await InterviewSlot.findOneAndUpdate(
//             {
//               _id: slot._id,

//               status: "AVAILABLE",

//               active: true,

//               isDeleted: false,

//               startTime: {
//                 $gt: new Date(),
//               },
//             },
//             {
//               $set: {
//                 status: "HELD",

//                 reservation: {
//                   bookingId:
//                     bookingObjectId,

//                   heldAt: now,

//                   expiresAt:
//                     holdExpiresAt,

//                   bookedAt: null,
//                 },
//               },
//             },
//             {
//               new: true,
//               session,
//             }
//           );

//         if (!claimed) {
//           fail(
//             409,
//             "Another candidate just reserved this slot"
//           );
//         }

//         /* ----------------------------------------------------
//            GUEST CANDIDATE DETAILS

//            IMPORTANT:

//            candidate.userId is null because no
//            account registration is required.

//            The InterviewBooking Mongoose schema
//            must allow userId to be null.
//         ---------------------------------------------------- */

//         const guestCandidate = {
//           ...candidate,

//           userId: null,
//         };

//         /* ----------------------------------------------------
//            CREATE BOOKING
//         ---------------------------------------------------- */

//         const records =
//           await InterviewBooking.create(
//             [
//               {
//                 _id:
//                   bookingObjectId,

//                 bookingId,

//                 slotId:
//                   slot._id,

//                 interviewerId:
//                   slot.interviewerId,

//                 candidate:
//                   guestCandidate,

//                 selectedTopics:
//                   topics,

//                 slotSnapshot: {
//                   title:
//                     slot.title,

//                   startTime:
//                     slot.startTime,

//                   endTime:
//                     slot.endTime,

//                   durationMinutes:
//                     slot.durationMinutes,

//                   timezone:
//                     slot.timezone ||
//                     TIMEZONE,

//                   price:
//                     slot.price,

//                   mrp:
//                     slot.mrp,

//                   currency:
//                     slot.currency ||
//                     "INR",
//                 },

//                 status:
//                   "PENDING_PAYMENT",

//                 holdExpiresAt,

//                 meeting: {
//                   provider:
//                     "GOOGLE_MEET",

//                   url:
//                     slot.meetingUrl ||
//                     null,
//                 },

//                 payment: {
//                   gateway:
//                     "CASHFREE",

//                   status:
//                     "NOT_STARTED",
//                 },

//                 paymentAttempts: [],

//                 events: [
//                   {
//                     type:
//                       "BOOKING_CREATED",

//                     fromStatus:
//                       null,

//                     toStatus:
//                       "PENDING_PAYMENT",

//                     createdAt:
//                       now,
//                   },
//                 ],
//               },
//             ],
//             {
//               session,
//             }
//           );

//         createdBooking =
//           records[0];
//       }
//     );

//     /* --------------------------------------------------------
//        SUCCESS RESPONSE

//        The frontend expects:

//        response.data.bookingId

//        This format is preserved.

//        Do not expose meeting URLs before
//        successful payment verification.
//     -------------------------------------------------------- */

//     return res.status(201).json({
//       success: true,

//       message:
//         "Interview slot reserved. Complete payment to confirm your booking.",

//       data: {
//         ...publicBooking(
//           createdBooking
//         ),

//         bookingId,

//         slotId,

//         status:
//           "PENDING_PAYMENT",

//         paymentStatus:
//           "NOT_STARTED",

//         holdExpiresAt,

//         amount:
//           createdBooking
//             .slotSnapshot
//             .price,

//         currency:
//           createdBooking
//             .slotSnapshot
//             .currency,

//         meetingUrl: null,
//       },
//     });
//   }
// );

// /* ============================================================
//    4. GET PUBLIC BOOKING STATUS

//    GET /api/interviews/bookings/:id/status

//    No account authentication required.

//    Called by:
//    - Cashfree return page
//    - Payment status page
//    - Payment success page
//    - Payment failure page

//    Only booking/payment status is returned.

//    No customer PII or meeting URL.
// ============================================================ */

// export const getBookingStatus = wrap(
//   async (req, res) => {
//     const bookingId =
//       String(req.params.id || "")
//         .trim();

//     if (!bookingId) {
//       fail(
//         400,
//         "Booking ID is required"
//       );
//     }

//     const booking =
//       await InterviewBooking.findOne({
//         bookingId,

//         isDeleted: {
//           $ne: true,
//         },
//       })
//         .select(
//           [
//             "bookingId",
//             "status",
//             "payment.status",
//             "refund.status",
//             "holdExpiresAt",
//             "confirmedAt",
//           ].join(" ")
//         )
//         .lean();

//     if (!booking) {
//       fail(
//         404,
//         "Interview booking not found"
//       );
//     }

//     const data =
//       buildPublicBookingStatus(
//         booking
//       );

//     return res.status(200).json({
//       success: true,

//       message:
//         "Interview booking status loaded successfully",

//       data,
//     });
//   }
// );

// /* ============================================================
//    5. EXPIRE UNPAID BOOKING HOLDS

//    Called by your existing scheduled job.

//    This function only expires bookings where:

//    - Status = PENDING_PAYMENT
//    - Hold time has expired
//    - No payment order was created
//    - Payment status = NOT_STARTED
//    - No payment attempts exist

//    Never release a slot while a Cashfree
//    payment remains unresolved.

//    A separate Cashfree reconciliation process
//    must handle active payment orders.
// ============================================================ */

// export const expireUnpaidHolds =
//   async () => {
//     const now = new Date();

//     const expiredCandidates =
//       await InterviewBooking.find({
//         status:
//           "PENDING_PAYMENT",

//         holdExpiresAt: {
//           $lte: now,
//         },

//         "payment.status":
//           "NOT_STARTED",

//         paymentAttempts: {
//           $size: 0,
//         },
//       })
//         .select("_id")
//         .limit(100)
//         .lean();

//     let expired = 0;

//     for (
//       const candidate
//       of expiredCandidates
//     ) {
//       try {
//         await withTransaction(
//           async (session) => {
//             /* --------------------------------------------
//                RECHECK BOOKING INSIDE TRANSACTION
//             -------------------------------------------- */

//             const booking =
//               await InterviewBooking.findOne({
//                 _id:
//                   candidate._id,

//                 status:
//                   "PENDING_PAYMENT",

//                 holdExpiresAt: {
//                   $lte:
//                     new Date(),
//                 },

//                 "payment.status":
//                   "NOT_STARTED",

//                 paymentAttempts: {
//                   $size: 0,
//                 },
//               }).session(
//                 session
//               );

//             if (!booking) {
//               return;
//             }

//             /* --------------------------------------------
//                LOCATE OWNED SLOT
//             -------------------------------------------- */

//             const slot =
//               await InterviewSlot.findOne({
//                 _id:
//                   booking.slotId,

//                 status:
//                   "HELD",

//                 "reservation.bookingId":
//                   booking._id,
//               }).session(
//                 session
//               );

//             let reopened = false;

//             if (slot) {
//               const canReopen =
//                 slot.active === true &&
//                 slot.isDeleted !== true &&
//                 new Date(
//                   slot.startTime
//                 ) > new Date();

//               /* ----------------------------------------
//                  RELEASE OR BLOCK SLOT
//               ---------------------------------------- */

//               const update =
//                 canReopen
//                   ? releaseReservationUpdate
//                   : {
//                       $set: {
//                         status:
//                           "BLOCKED",

//                         reservation:
//                           emptyReservation(),
//                       },
//                     };

//               const updated =
//                 await InterviewSlot.updateOne(
//                   {
//                     _id:
//                       slot._id,

//                     status:
//                       "HELD",

//                     "reservation.bookingId":
//                       booking._id,
//                   },

//                   update,

//                   {
//                     session,
//                   }
//                 );

//               if (
//                 updated.modifiedCount !==
//                 1
//               ) {
//                 fail(
//                   409,
//                   "Could not release expired hold"
//                 );
//               }

//               reopened =
//                 canReopen;
//             }

//             /* --------------------------------------------
//                UPDATE BOOKING STATUS
//             -------------------------------------------- */

//             const oldStatus =
//               booking.status;

//             booking.status =
//               "EXPIRED";

//             booking.payment.status =
//               "NOT_STARTED";

//             /* --------------------------------------------
//                AUDIT EVENT
//             -------------------------------------------- */

//             addEvent(
//               booking,

//               "HOLD_EXPIRED",

//               oldStatus,

//               "EXPIRED",

//               reopened
//                 ? "Unpaid hold expired and slot reopened"
//                 : "Unpaid hold expired"
//             );

//             await booking.save({
//               session,
//             });

//             expired++;
//           }
//         );
//       } catch (error) {
//         console.error(
//           "[INTERVIEW HOLD EXPIRY]",
//           {
//             bookingId:
//               String(
//                 candidate._id
//               ),

//             message:
//               error.message,
//           }
//         );
//       }
//     }

//     return expired;
//   };

import mongoose from "mongoose";

import {
  InterviewSlot,
  InterviewBooking,
  wrap,
  fail,
  requireId,
  makeId,
  uniqueTopics,
  validateCandidate,
  slotIsPublic,
  addEvent,
  withTransaction,
  HOLD_MINUTES,
  releaseReservationUpdate,
} from "../services/interviewCommon.js";

const TIMEZONE = "Asia/Kolkata";
const HOLD_MS = HOLD_MINUTES * 60 * 1000;

const ALLOWED_TOPICS = [
  "DSA",
  "LLD",
  "HLD",
  "GENAI",
  "PROJECTS",
];

const normalize = (value) =>
  String(value ?? "").trim().toUpperCase();

const emptyReservation = () => ({
  bookingId: null,
  heldAt: null,
  expiresAt: null,
  bookedAt: null,
});

/* ==========================================
   DATE HELPERS
========================================== */

function parseIndianDate(value) {
  const input = String(value ?? "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    fail(400, "Date must use YYYY-MM-DD format");
  }

  const start = new Date(
    `${input}T00:00:00+05:30`
  );

  if (Number.isNaN(start.getTime())) {
    fail(400, "Invalid interview date");
  }

  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).formatToParts(start);

  const get = (type) =>
    parts.find((p) => p.type === type)?.value;

  const formatted = [
    get("year"),
    get("month"),
    get("day"),
  ].join("-");

  if (formatted !== input) {
    fail(400, "Invalid calendar date");
  }

  return {
    start,
    end: new Date(
      start.getTime() + 86400000
    ),
  };
}

function safePublicSlot(slot) {
  const status = normalize(slot.status);

  return {
    _id: slot._id,
    title: slot.title,
    description: slot.description || "",
    startTime: slot.startTime,
    endTime: slot.endTime,
    durationMinutes: slot.durationMinutes,
    timezone: slot.timezone || TIMEZONE,
    price: slot.price,
    mrp: slot.mrp,
    currency: slot.currency || "INR",
    allowedTopics: slot.allowedTopics || [],
    maxTopics: slot.maxTopics,
    status,
    available:
      status === "AVAILABLE" &&
      slot.active === true &&
      slot.isDeleted !== true &&
      new Date(slot.startTime) > new Date(),
  };
}

/* ==========================================
   GET AVAILABLE SLOTS
   GET /api/interviews/slots
========================================== */

export const getAvailableSlots = wrap(
  async (req, res) => {
    const now = new Date();

    const {
      date,
      topic,
      includeUnavailable,
    } = req.query;

    const query = {
      active: true,
      isDeleted: false,
      startTime: { $gt: now },
    };

    if (date) {
      const { start, end } =
        parseIndianDate(date);

      query.startTime = {
        $gte: start > now ? start : now,
        $lt: end,
      };
    } else {
      query.startTime = {
        $gt: now,
        $lt: new Date(
          now.getTime() + 9 * 86400000
        ),
      };
    }

    if (topic) {
      const value = normalize(topic);

      if (!ALLOWED_TOPICS.includes(value)) {
        fail(400, "Invalid interview topic");
      }

      query.allowedTopics = value;
    }

    const showUnavailable =
      String(includeUnavailable)
        .toLowerCase() === "true";

    query.status = showUnavailable
      ? {
          $in: [
            "AVAILABLE",
            "HELD",
            "BOOKED",
            "BLOCKED",
          ],
        }
      : "AVAILABLE";

    const slots = await InterviewSlot.find(query)
      .select(
        [
          "_id",
          "title",
          "description",
          "startTime",
          "endTime",
          "durationMinutes",
          "timezone",
          "price",
          "mrp",
          "currency",
          "allowedTopics",
          "maxTopics",
          "status",
          "active",
          "isDeleted",
        ].join(" ")
      )
      .sort({
        startTime: 1,
        _id: 1,
      })
      .limit(500)
      .lean();

    const data = slots.map(safePublicSlot);

    const summary = {
      total: data.length,
      available: data.filter(
        (s) => s.status === "AVAILABLE"
      ).length,
      booked: data.filter(
        (s) => s.status === "BOOKED"
      ).length,
      held: data.filter(
        (s) => s.status === "HELD"
      ).length,
      blocked: data.filter(
        (s) => s.status === "BLOCKED"
      ).length,
    };

    return res.status(200).json({
      success: true,
      message: "Interview slots loaded successfully",
      count: data.length,
      summary,
      data,
    });
  }
);

/* ==========================================
   GET SINGLE SLOT
   GET /api/interviews/slots/:id
========================================== */

export const getPublicSlot = wrap(
  async (req, res) => {
    requireId(req.params.id, "slot ID");

    const slot = await InterviewSlot.findOne({
      _id: req.params.id,
      ...slotIsPublic,
      startTime: { $gt: new Date() },
    })
      .select(
        [
          "_id",
          "title",
          "description",
          "startTime",
          "endTime",
          "durationMinutes",
          "timezone",
          "price",
          "mrp",
          "currency",
          "allowedTopics",
          "maxTopics",
          "status",
          "active",
          "isDeleted",
        ].join(" ")
      )
      .lean();

    if (!slot) {
      fail(
        404,
        "This interview slot is no longer available"
      );
    }

    return res.status(200).json({
      success: true,
      data: safePublicSlot(slot),
    });
  }
);

/* ==========================================
   CREATE GUEST BOOKING
   POST /api/interviews/bookings

   NO req.user
   NO getActorId
   NO ACCOUNT LOGIN
========================================== */

export const createInterviewBooking = wrap(
  async (req, res) => {
    const {
      slotId,
      selectedTopics,
      candidate: inputCandidate,
    } = req.body || {};

    requireId(slotId, "slot ID");

    const topics = uniqueTopics(
      selectedTopics
    );

    if (!topics.length) {
      fail(
        400,
        "Select at least one interview topic"
      );
    }

    const candidate = validateCandidate(
      inputCandidate
    );

    const bookingObjectId =
      new mongoose.Types.ObjectId();

    const bookingId = makeId("INT");

    const now = new Date();

    const holdExpiresAt = new Date(
      now.getTime() + HOLD_MS
    );

    let createdBooking;

    await withTransaction(
      async (session) => {
        const slot = await InterviewSlot.findOne({
          _id: slotId,
          active: true,
          isDeleted: false,
          status: "AVAILABLE",
          startTime: {
            $gt: new Date(),
          },
        }).session(session);

        if (!slot) {
          fail(
            409,
            "This slot has already been booked or is unavailable"
          );
        }

        if (topics.length > slot.maxTopics) {
          fail(
            400,
            `You can select a maximum of ${slot.maxTopics} topics`
          );
        }

        const invalidTopics = topics.filter(
          (topic) =>
            !slot.allowedTopics.includes(topic)
        );

        if (invalidTopics.length) {
          fail(
            400,
            `Topics not supported: ${invalidTopics.join(", ")}`
          );
        }

        const claimed =
          await InterviewSlot.findOneAndUpdate(
            {
              _id: slot._id,
              status: "AVAILABLE",
              active: true,
              isDeleted: false,
              startTime: {
                $gt: new Date(),
              },
            },
            {
              $set: {
                status: "HELD",
                reservation: {
                  bookingId: bookingObjectId,
                  heldAt: now,
                  expiresAt: holdExpiresAt,
                  bookedAt: null,
                },
              },
            },
            {
              new: true,
              session,
            }
          );

        if (!claimed) {
          fail(
            409,
            "Another candidate just reserved this slot"
          );
        }

        const records =
          await InterviewBooking.create(
            [
              {
                _id: bookingObjectId,
                bookingId,
                slotId: slot._id,
                interviewerId:
                  slot.interviewerId,

                candidate: {
                  ...candidate,
                  userId: null,
                },

                selectedTopics: topics,

                slotSnapshot: {
                  title: slot.title,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  durationMinutes:
                    slot.durationMinutes,
                  timezone: slot.timezone,
                  price: slot.price,
                  mrp: slot.mrp,
                  currency: slot.currency,
                },

                status: "PENDING_PAYMENT",
                holdExpiresAt,

                meeting: {
                  provider: "GOOGLE_MEET",
                  url: slot.meetingUrl || null,
                },

                payment: {
                  gateway: "CASHFREE",
                  status: "NOT_STARTED",
                },

                paymentAttempts: [],

                events: [
                  {
                    type: "BOOKING_CREATED",
                    fromStatus: null,
                    toStatus: "PENDING_PAYMENT",
                    createdAt: now,
                  },
                ],
              },
            ],
            { session }
          );

        createdBooking = records[0];
      }
    );

    return res.status(201).json({
      success: true,
      message:
        "Interview slot reserved. Complete payment to confirm your booking.",

      data: {
        bookingId,
        slotId,
        status: "PENDING_PAYMENT",
        paymentStatus: "NOT_STARTED",
        holdExpiresAt,
        amount:
          createdBooking.slotSnapshot.price,
        currency:
          createdBooking.slotSnapshot.currency,
        meetingUrl: null,
      },
    });
  }
);

/* ==========================================
   PUBLIC BOOKING STATUS

   GET /api/interviews/bookings/:id/status

   NO 10-MINUTE RESTRICTION
   NO ACCOUNT LOGIN

   Excludes candidate PII and meeting URL.
========================================== */

export const getBookingStatus = wrap(
  async (req, res) => {
    const bookingId = String(
      req.params.id || ""
    ).trim();

    if (!bookingId) {
      fail(400, "Booking ID is required");
    }

    const booking =
      await InterviewBooking.findOne({
        bookingId,
        isDeleted: { $ne: true },
      })
        .select(
          [
            "bookingId",
            "status",
            "payment.status",
            "refund.status",
            "holdExpiresAt",
            "confirmedAt",
          ].join(" ")
        )
        .lean();

    if (!booking) {
      fail(
        404,
        "Interview booking not found"
      );
    }

    const status = normalize(
      booking.status
    );

    const paymentStatus = normalize(
      booking.payment?.status ||
        "NOT_STARTED"
    );

    const confirmed =
      status === "CONFIRMED";

    const paymentReceived =
      paymentStatus === "SUCCESS";

    const refundStatus = normalize(
      booking.refund?.status ||
        "NOT_REQUIRED"
    );

    const refundRequired =
      paymentReceived &&
      !confirmed &&
      [
        "PENDING",
        "PROCESSING",
        "FAILED",
      ].includes(refundStatus);

    let displayStatus = "PENDING";

    if (confirmed) {
      displayStatus = "SUCCESS";
    } else if (refundRequired) {
      displayStatus = "REFUND_REQUIRED";
    } else if (
      [
        "PAYMENT_FAILED",
        "EXPIRED",
        "CANCELLED_BY_ADMIN",
        "CANCELLED_BY_USER",
      ].includes(status)
    ) {
      displayStatus = "FAILED";
    } else if (status === "COMPLETED") {
      displayStatus = "COMPLETED";
    } else if (status === "NO_SHOW") {
      displayStatus = "NO_SHOW";
    }

    return res.status(200).json({
      success: true,

      data: {
        bookingId: booking.bookingId,
        status,
        paymentStatus,
        displayStatus,
        confirmed,
        paymentReceived,
        refundRequired,
        refundStatus,
        holdExpiresAt:
          booking.holdExpiresAt || null,
        confirmedAt:
          booking.confirmedAt || null,
        meetingUrl: null,
      },
    });
  }
);

/* ==========================================
   EXPIRE UNPAID BOOKING HOLDS

   Preserves existing reservation cleanup.

   ONLY expire bookings that never started
   payment. Active Cashfree orders must be
   reconciled before any slot release.
========================================== */

export const expireUnpaidHolds =
  async () => {
    const now = new Date();

    const expiredCandidates =
      await InterviewBooking.find({
        status: "PENDING_PAYMENT",

        holdExpiresAt: {
          $lte: now,
        },

        "payment.status":
          "NOT_STARTED",

        paymentAttempts: {
          $size: 0,
        },
      })
        .select("_id")
        .limit(100)
        .lean();

    let expired = 0;

    for (const candidate of expiredCandidates) {
      try {
        await withTransaction(
          async (session) => {
            const booking =
              await InterviewBooking.findOne({
                _id: candidate._id,
                status: "PENDING_PAYMENT",

                holdExpiresAt: {
                  $lte: new Date(),
                },

                "payment.status":
                  "NOT_STARTED",

                paymentAttempts: {
                  $size: 0,
                },
              }).session(session);

            if (!booking) return;

            const slot =
              await InterviewSlot.findOne({
                _id: booking.slotId,
                status: "HELD",
                "reservation.bookingId":
                  booking._id,
              }).session(session);

            let reopened = false;

            if (slot) {
              const canReopen =
                slot.active === true &&
                slot.isDeleted !== true &&
                slot.startTime >
                  new Date();

              const updated =
                await InterviewSlot.updateOne(
                  {
                    _id: slot._id,
                    status: "HELD",
                    "reservation.bookingId":
                      booking._id,
                  },

                  canReopen
                    ? releaseReservationUpdate
                    : {
                        $set: {
                          status: "BLOCKED",
                          reservation:
                            emptyReservation(),
                        },
                      },

                  { session }
                );

              if (
                updated.modifiedCount !== 1
              ) {
                fail(
                  409,
                  "Could not release expired hold"
                );
              }

              reopened = canReopen;
            }

            const oldStatus =
              booking.status;

            booking.status = "EXPIRED";

            booking.payment.status =
              "NOT_STARTED";

            addEvent(
              booking,
              "HOLD_EXPIRED",
              oldStatus,
              "EXPIRED",
              reopened
                ? "Unpaid hold expired and slot reopened"
                : "Unpaid hold expired"
            );

            await booking.save({
              session,
            });

            expired++;
          }
        );
      } catch (error) {
        console.error(
          "[INTERVIEW HOLD EXPIRY]",
          {
            bookingId:
              String(candidate._id),
            message: error.message,
          }
        );
      }
    }

    return expired;
  };
