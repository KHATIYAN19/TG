
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
  publicSlot,
  publicBooking,
  addEvent,
  withTransaction,
  HOLD_MINUTES,
  releaseReservationUpdate,
  assertBookingOwner,
  getActorId,
} from "../services/interviewCommon.js";

/* =========================================================
   CONFIGURATION
========================================================= */

const HOLD_MS = HOLD_MINUTES * 60 * 1000;

const TIMEZONE = "Asia/Kolkata";

const ALLOWED_TOPICS = [
  "DSA",
  "LLD",
  "HLD",
  "GENAI",
  "PROJECTS",
];

const ACTIVE_PAYMENT_STATUSES = [
  "CREATED",
  "PENDING",
];

const TERMINAL_BOOKING_STATUSES = [
  "CONFIRMED",
  "PAYMENT_FAILED",
  "EXPIRED",
  "CANCELLED_BY_ADMIN",
  "CANCELLED_BY_USER",
  "COMPLETED",
  "NO_SHOW",
];

const normalize = (value) =>
  String(value ?? "").trim().toUpperCase();

const emptyReservation = () => ({
  bookingId: null,
  heldAt: null,
  expiresAt: null,
  bookedAt: null,
});

/* =========================================================
   SAFE DATE HELPERS

   Public booking calendar uses Indian time.

   Supports:
   GET /slots?date=2026-10-26

   The selected date includes:
   00:00 AM through 11:59 PM IST.
========================================================= */

const parseIndianDate = (value) => {
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

  /*
    Reject invalid calendar dates like:
    2026-02-31
  */

  const formatted = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(start);

  if (formatted !== input) {
    fail(400, "Invalid calendar date");
  }

  return {
    start,
    end: new Date(
      start.getTime() + 86400000
    ),
  };
};

/* =========================================================
   PUBLIC SLOT DATA

   Never expose:
   - reservation
   - interviewer private information
   - candidate details
   - meeting URL
   - payment data
   - admin notes
========================================================= */

const safePublicSlot = (slot) => {
  const status = normalize(slot.status);

  return {
    _id: slot._id,

    title: slot.title,

    description: slot.description || "",

    startTime: slot.startTime,

    endTime: slot.endTime,

    durationMinutes: slot.durationMinutes,

    timezone:
      slot.timezone || TIMEZONE,

    price: slot.price,

    mrp: slot.mrp,

    currency:
      slot.currency || "INR",

    allowedTopics:
      slot.allowedTopics || [],

    maxTopics: slot.maxTopics,

    status,

    available:
      status === "AVAILABLE" &&
      slot.active === true &&
      slot.isDeleted !== true &&
      new Date(slot.startTime) > new Date(),
  };
};

/* =========================================================
   SAFE SLOT RELEASE

   Reopen only when:
   - Slot belongs to booking
   - Slot is still in expected state
   - Slot is active
   - Slot is not deleted
   - Interview hasn't already started

   Otherwise keep it BLOCKED.
========================================================= */

const releaseOwnedSlot = async ({
  booking,
  session,
  expectedStatus,
}) => {
  const slot = await InterviewSlot.findOne({
    _id: booking.slotId,

    status: expectedStatus,

    "reservation.bookingId": booking._id,
  }).session(session);

  if (!slot) {
    fail(
      409,
      "Interview slot ownership has changed"
    );
  }

  const now = new Date();

  const reopen =
    slot.active === true &&
    slot.isDeleted !== true &&
    new Date(slot.startTime) > now;

  const update = reopen
    ? releaseReservationUpdate
    : {
        $set: {
          status: "BLOCKED",
          reservation: emptyReservation(),
        },
      };

  const result =
    await InterviewSlot.updateOne(
      {
        _id: slot._id,
        status: expectedStatus,
        "reservation.bookingId": booking._id,
      },
      update,
      { session }
    );

  if (result.modifiedCount !== 1) {
    fail(
      409,
      "Unable to safely release interview slot"
    );
  }

  return {
    released: true,
    reopened: reopen,
  };
};

/* =========================================================
   PAYMENT SAFETY HELPERS
========================================================= */

const hasUnresolvedPayments = (booking) => {
  if (
    ACTIVE_PAYMENT_STATUSES.includes(
      normalize(booking.payment?.status)
    )
  ) {
    return true;
  }

  return (
    booking.paymentAttempts || []
  ).some((attempt) =>
    ACTIVE_PAYMENT_STATUSES.includes(
      normalize(attempt.status)
    )
  );
};

const hasSuccessfulPayment = (booking) =>
  normalize(booking.payment?.status) ===
    "SUCCESS" ||
  (booking.paymentAttempts || []).some(
    (attempt) =>
      normalize(attempt.status) ===
      "SUCCESS"
  );

/* =========================================================
   1. GET PUBLIC INTERVIEW SLOTS

   GET /api/interviews/slots

   GET /api/interviews/slots?date=2026-10-26

   GET /api/interviews/slots
       ?date=2026-10-26
       &includeUnavailable=true

   GET /api/interviews/slots?topic=DSA

   Booking frontend displays:
   - AVAILABLE
   - HELD
   - BOOKED
   - BLOCKED

   No sensitive database fields are returned.
========================================================= */

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

    /* -------------------------------
       DATE FILTER
    -------------------------------- */

    if (date) {
      const {
        start,
        end,
      } = parseIndianDate(date);

      query.startTime = {
        $gte:
          start > now
            ? start
            : now,

        $lt: end,
      };
    } else {
      /*
        Default to today + next 7 days.

        The frontend normally requests one
        selected date at a time.
      */

      query.startTime = {
        $gt: now,

        $lt: new Date(
          now.getTime() +
            9 * 86400000
        ),
      };
    }

    /* -------------------------------
       TOPIC FILTER
    -------------------------------- */

    if (topic) {
      const normalizedTopic =
        normalize(topic);

      if (
        !ALLOWED_TOPICS.includes(
          normalizedTopic
        )
      ) {
        fail(
          400,
          "Invalid interview topic"
        );
      }

      query.allowedTopics =
        normalizedTopic;
    }

    /* -------------------------------
       AVAILABILITY FILTER

       Existing clients still get
       available slots by default.

       New booking page requests
       includeUnavailable=true.
    -------------------------------- */

    const showUnavailable =
      String(includeUnavailable)
        .toLowerCase() === "true";

    if (!showUnavailable) {
      query.status = "AVAILABLE";
    } else {
      query.status = {
        $in: [
          "AVAILABLE",
          "HELD",
          "BOOKED",
          "BLOCKED",
        ],
      };
    }

    /* -------------------------------
       FETCH PUBLIC FIELDS ONLY
    -------------------------------- */

    const slots =
      await InterviewSlot.find(query)
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

    const data = slots.map(
      safePublicSlot
    );

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

      message:
        "Interview slots loaded successfully",

      count: data.length,

      summary,

      data,
    });
  }
);

/* =========================================================
   2. GET SINGLE PUBLIC SLOT

   GET /api/interviews/slots/:id

   Only an AVAILABLE slot may be selected
   for creating a booking.
========================================================= */

export const getPublicSlot = wrap(
  async (req, res) => {
    requireId(
      req.params.id,
      "slot ID"
    );

    const slot =
      await InterviewSlot.findOne({
        _id: req.params.id,
        ...slotIsPublic,
        startTime: {
          $gt: new Date(),
        },
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

/* =========================================================
   3. CREATE INTERVIEW BOOKING

   POST /api/interviews/bookings

   BODY:
   {
     "slotId": "...",
     "selectedTopics": ["DSA", "LLD"],
     "candidate": {
       "name": "...",
       "email": "...",
       "phone": "...",
       "experienceYears": 2,
       "currentRole": "...",
       "targetRole": "...",
       "currentCompany": "...",
       "resumeUrl": "...",
       "notes": "..."
     }
   }

   SECURITY:
   - Price comes from MongoDB
   - Topics checked against slot
   - Atomic slot reservation
   - One booking per reserved slot
   - No meeting URL returned yet
========================================================= */

export const createInterviewBooking = wrap(
  async (req, res) => {
    const {
      slotId,
      selectedTopics,
      candidate: inputCandidate,
    } = req.body || {};

    requireId(slotId, "slot ID");

    const topics =
      uniqueTopics(selectedTopics);

    if (!topics.length) {
      fail(
        400,
        "Select at least one interview topic"
      );
    }

    const candidate =
      validateCandidate(
        inputCandidate
      );

    const actorId = getActorId(req);

    if (!actorId) {
      fail(
        401,
        "Please sign in to book an interview"
      );
    }

    const bookingObjectId =
      new mongoose.Types.ObjectId();

    const bookingId =
      makeId("INT");

    const now = new Date();

    const holdExpiresAt =
      new Date(
        now.getTime() +
          HOLD_MS
      );

    let createdBooking;

    await withTransaction(
      async (session) => {
        const slot =
          await InterviewSlot.findOne({
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

        /* ---------------------------
           TOPIC VALIDATION
        --------------------------- */

        if (
          topics.length >
          slot.maxTopics
        ) {
          fail(
            400,
            `You can select a maximum of ${slot.maxTopics} topics`
          );
        }

        const invalidTopics =
          topics.filter(
            (topic) =>
              !slot.allowedTopics.includes(
                topic
              )
          );

        if (
          invalidTopics.length
        ) {
          fail(
            400,
            `Topics not supported: ${invalidTopics.join(", ")}`
          );
        }

        /* ---------------------------
           ATOMIC SLOT CLAIM
        --------------------------- */

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
                  bookingId:
                    bookingObjectId,

                  heldAt: now,

                  expiresAt:
                    holdExpiresAt,

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

        /* ---------------------------
           CREATE BOOKING
        --------------------------- */

        const records =
          await InterviewBooking.create(
            [
              {
                _id:
                  bookingObjectId,

                bookingId,

                slotId:
                  slot._id,

                interviewerId:
                  slot.interviewerId,

                candidate: {
                  ...candidate,

                  userId: actorId,
                },

                selectedTopics:
                  topics,

                slotSnapshot: {
                  title:
                    slot.title,

                  startTime:
                    slot.startTime,

                  endTime:
                    slot.endTime,

                  durationMinutes:
                    slot.durationMinutes,

                  timezone:
                    slot.timezone,

                  price:
                    slot.price,

                  mrp:
                    slot.mrp,

                  currency:
                    slot.currency,
                },

                status:
                  "PENDING_PAYMENT",

                holdExpiresAt,

                meeting: {
                  provider:
                    "GOOGLE_MEET",

                  url:
                    slot.meetingUrl ||
                    null,
                },

                payment: {
                  gateway:
                    "CASHFREE",

                  status:
                    "NOT_STARTED",
                },

                paymentAttempts: [],

                events: [
                  {
                    type:
                      "BOOKING_CREATED",

                    fromStatus:
                      null,

                    toStatus:
                      "PENDING_PAYMENT",

                    createdAt:
                      now,
                  },
                ],
              },
            ],
            { session }
          );

        createdBooking =
          records[0];
      }
    );

    /* -------------------------------
       USER RESPONSE

       Do not return the meeting URL
       while payment is pending.
    -------------------------------- */

    return res.status(201).json({
      success: true,

      message:
        "Interview slot reserved. Complete payment to confirm your booking.",

      data: {
        ...publicBooking(
          createdBooking
        ),

        bookingId,

        slotId,

        status:
          "PENDING_PAYMENT",

        paymentStatus:
          "NOT_STARTED",

        holdExpiresAt,

        amount:
          createdBooking
            .slotSnapshot
            .price,

        currency:
          createdBooking
            .slotSnapshot
            .currency,

        meetingUrl: null,
      },
    });
  }
);

/* =========================================================
   4. GET BOOKING STATUS

   GET /api/interviews/bookings/:id/status

   Called:
   - After checkout redirect
   - After reconciliation
   - On "Check Again"
   - On My Bookings page

   IMPORTANT:
   This endpoint only READS the status.

   Actual Cashfree verification is performed
   by POST /bookings/:id/reconcile.
========================================================= */

export const getBookingStatus = wrap(
  async (req, res) => {
    const booking =
      await InterviewBooking.findOne({
        bookingId:
          req.params.id,

        isDeleted: {
          $ne: true,
        },
      });

    if (!booking) {
      fail(
        404,
        "Interview booking not found"
      );
    }

    assertBookingOwner(
      req,
      booking
    );

    const confirmed =
      booking.status ===
      "CONFIRMED";

    const paymentStatus =
      normalize(
        booking.payment?.status
      );

    const paymentReceived =
      paymentStatus ===
      "SUCCESS";

    const refundRequired =
      paymentReceived &&
      !confirmed &&
      ["PENDING", "PROCESSING", "FAILED"]
        .includes(
          normalize(
            booking.refund?.status
          )
        );

    let displayStatus =
      "PENDING";

    if (confirmed) {
      displayStatus =
        "SUCCESS";
    } else if (
      refundRequired
    ) {
      displayStatus =
        "REFUND_REQUIRED";
    } else if (
      [
        "PAYMENT_FAILED",
        "EXPIRED",
        "CANCELLED_BY_USER",
        "CANCELLED_BY_ADMIN",
      ].includes(
        booking.status
      )
    ) {
      displayStatus =
        "FAILED";
    } else if (
      booking.status ===
      "COMPLETED"
    ) {
      displayStatus =
        "COMPLETED";
    } else if (
      booking.status ===
      "NO_SHOW"
    ) {
      displayStatus =
        "NO_SHOW";
    }

    return res.status(200).json({
      success: true,

      data: {
        ...publicBooking(
          booking
        ),

        bookingId:
          booking.bookingId,

        status:
          booking.status,

        paymentStatus,

        displayStatus,

        confirmed,

        paymentReceived,

        refundRequired,

        refundStatus:
          booking.refund?.status ||
          "NOT_REQUIRED",

        holdExpiresAt:
          booking.holdExpiresAt,

        confirmedAt:
          booking.confirmedAt ||
          null,

        meetingUrl:
          [
            "CONFIRMED",
            "COMPLETED",
            "NO_SHOW",
          ].includes(
            booking.status
          )
            ? booking.meeting?.url ||
              null
            : null,

        candidate: {
          name:
            booking.candidate.name,

          email:
            booking.candidate.email,
        },
      },
    });
  }
);

/* =========================================================
   5. GET MY INTERVIEW BOOKINGS

   GET /api/interviews/my-bookings

   User sees only own bookings.

   Meeting links are returned only for
   successfully confirmed bookings.
========================================================= */

export const getMyBookings = wrap(
  async (req, res) => {
    const actorId =
      getActorId(req);

    if (!actorId) {
      fail(
        401,
        "Authentication required"
      );
    }

    const {
      status,
      page = "1",
      limit = "20",
    } = req.query;

    const pageNumber =
      Number(page);

    const pageSize =
      Number(limit);

    if (
      !Number.isInteger(
        pageNumber
      ) ||
      pageNumber < 1
    ) {
      fail(
        400,
        "Invalid page number"
      );
    }

    if (
      !Number.isInteger(
        pageSize
      ) ||
      pageSize < 1 ||
      pageSize > 100
    ) {
      fail(
        400,
        "Limit must be between 1 and 100"
      );
    }

    const filter = {
      "candidate.userId":
        actorId,

      isDeleted: {
        $ne: true,
      },
    };

    if (status) {
      const normalizedStatus =
        normalize(status);

      const accepted = [
        "PENDING_PAYMENT",
        ...TERMINAL_BOOKING_STATUSES,
      ];

      if (
        !accepted.includes(
          normalizedStatus
        )
      ) {
        fail(
          400,
          "Invalid booking status"
        );
      }

      filter.status =
        normalizedStatus;
    }

    const [
      bookings,
      total,
    ] = await Promise.all([
      InterviewBooking.find(
        filter
      )
        .sort({
          createdAt: -1,
        })
        .skip(
          (pageNumber - 1) *
            pageSize
        )
        .limit(pageSize)
        .lean(),

      InterviewBooking.countDocuments(
        filter
      ),
    ]);

    const data =
      bookings.map(
        (booking) => ({
          ...publicBooking(
            booking
          ),

          paymentStatus:
            booking.payment
              ?.status,

          meetingUrl:
            [
              "CONFIRMED",
              "COMPLETED",
              "NO_SHOW",
            ].includes(
              booking.status
            )
              ? booking.meeting
                  ?.url || null
              : null,
        })
      );

    return res.status(200).json({
      success: true,

      data,

      pagination: {
        page:
          pageNumber,

        limit:
          pageSize,

        total,

        totalPages:
          Math.ceil(
            total / pageSize
          ),
      },
    });
  }
);

/* =========================================================
   6. CUSTOMER CANCELS INTERVIEW

   POST /api/interviews/bookings/:id/cancel

   BODY:
   {
     "reason": "I am no longer available..."
   }

   CASES:

   A. No payment started:
      Can cancel and release slot.

   B. Payment unresolved:
      Must verify through reconciliation first.

   C. Confirmed paid booking:
      Cancel according to refund policy.
      Preserve payment and mark refund pending
      only if customer is eligible.
========================================================= */

export const cancelMyBooking = wrap(
  async (req, res) => {
    const actorId =
      getActorId(req);

    if (!actorId) {
      fail(
        401,
        "Authentication required"
      );
    }

    const reason = String(
      req.body?.reason || ""
    ).trim();

    if (
      reason.length < 10 ||
      reason.length > 1000
    ) {
      fail(
        400,
        "Cancellation reason must contain 10 to 1000 characters"
      );
    }

    let result;

    await withTransaction(
      async (session) => {
        const booking =
          await InterviewBooking.findOne({
            bookingId:
              req.params.id,

            isDeleted: {
              $ne: true,
            },
          }).session(
            session
          );

        if (!booking) {
          fail(
            404,
            "Booking not found"
          );
        }

        if (
          String(
            booking.candidate
              .userId
          ) !==
          String(actorId)
        ) {
          fail(
            403,
            "You cannot cancel this booking"
          );
        }

        if (
          ![
            "PENDING_PAYMENT",
            "CONFIRMED",
          ].includes(
            booking.status
          )
        ) {
          fail(
            409,
            "This booking cannot be cancelled"
          );
        }

        const oldStatus =
          booking.status;

        const paid =
          hasSuccessfulPayment(
            booking
          );

        /* ---------------------------
           PAYMENT VERIFICATION

           We must not cancel and reopen
           while a Cashfree order could
           still succeed.
        --------------------------- */

        if (
          !paid &&
          hasUnresolvedPayments(
            booking
          )
        ) {
          fail(
            409,
            "Your payment is still being verified. Please check payment status before cancelling."
          );
        }

        /*
          A booking marked CONFIRMED must
          have a successful verified payment.
        */

        if (
          oldStatus ===
            "CONFIRMED" &&
          !paid
        ) {
          fail(
            409,
            "Booking payment requires verification"
          );
        }

        /* ---------------------------
           REFUND POLICY

           This example allows full refund
           for candidate cancellations
           at least 24 hours before start.

           IMPORTANT:
           Adjust to your published policy.
           Do not mark ineligible refunds
           as PENDING.
        --------------------------- */

        const msUntilInterview =
          new Date(
            booking.slotSnapshot
              .startTime
          ).getTime() -
          Date.now();

        const refundEligible =
          paid &&
          msUntilInterview >=
            24 * 60 *
              60 * 1000;

        /* ---------------------------
           RELEASE SLOT
        --------------------------- */

        const release =
          await releaseOwnedSlot({
            booking,
            session,

            expectedStatus:
              paid
                ? "BOOKED"
                : "HELD",
          });

        /* ---------------------------
           UPDATE BOOKING
        --------------------------- */

        booking.status =
          "CANCELLED_BY_USER";

        booking.cancellation = {
          cancelledBy:
            actorId,

          cancelledByRole:
            "USER",

          reason,

          cancelledAt:
            new Date(),

          slotReopened:
            release.reopened,
        };

        /*
          Paid bookings retain their
          payment SUCCESS status.

          Refund status is tracked
          separately.
        */

        if (
          paid &&
          refundEligible
        ) {
          booking.refund.status =
            "PENDING";

          booking.refund.amount =
            booking.slotSnapshot
              .price;

          booking.refund.currency =
            booking.slotSnapshot
              .currency;

          booking.refund.reason =
            reason;
        }

        /*
          For unpaid bookings we do not
          claim that money was refunded.
        */

        if (!paid) {
          booking.refund.status =
            "NOT_REQUIRED";
        }

        addEvent(
          booking,

          "USER_CANCELLED",

          oldStatus,

          "CANCELLED_BY_USER",

          reason,

          actorId
        );

        await booking.save({
          session,
        });

        result = {
          bookingId:
            booking.bookingId,

          status:
            booking.status,

          paymentStatus:
            booking.payment
              .status,

          slotReopened:
            release.reopened,

          refundEligible,

          refundStatus:
            booking.refund
              ?.status,

          refundAmount:
            refundEligible
              ? booking.refund
                  .amount
              : 0,
        };
      }
    );

    return res.status(200).json({
      success: true,

      message:
        result.refundEligible
          ? "Booking cancelled. Eligible refund is pending initiation."
          : "Interview booking cancelled successfully.",

      data: result,
    });
  }
);

/* =========================================================
   7. EXPIRE UNPAID BOOKING HOLDS

   Called by scheduled background job.

   IMPORTANT:

   Only release bookings that have NEVER
   started payment.

   Bookings with Cashfree orders must first
   be reconciled via payment controller.

   Example:
   await expireUnpaidHolds()
========================================================= */

export const expireUnpaidHolds =
  async () => {
    const now =
      new Date();

    const expiredCandidates =
      await InterviewBooking.find({
        status:
          "PENDING_PAYMENT",

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

    for (
      const candidate
      of expiredCandidates
    ) {
      try {
        await withTransaction(
          async (session) => {
            const booking =
              await InterviewBooking.findOne({
                _id:
                  candidate._id,

                status:
                  "PENDING_PAYMENT",

                holdExpiresAt: {
                  $lte:
                    new Date(),
                },

                "payment.status":
                  "NOT_STARTED",

                paymentAttempts: {
                  $size: 0,
                },
              }).session(
                session
              );

            if (!booking) {
              return;
            }

            const slot =
              await InterviewSlot.findOne({
                _id:
                  booking.slotId,

                status:
                  "HELD",

                "reservation.bookingId":
                  booking._id,
              }).session(
                session
              );

            /*
              A missing owned slot should
              not prevent cleanup of the
              unpaid booking record.
            */

            let reopened =
              false;

            if (slot) {
              const canReopen =
                slot.active ===
                  true &&
                slot.isDeleted !==
                  true &&
                slot.startTime >
                  new Date();

              const updated =
                await InterviewSlot.updateOne(
                  {
                    _id:
                      slot._id,

                    status:
                      "HELD",

                    "reservation.bookingId":
                      booking._id,
                  },

                  canReopen
                    ? releaseReservationUpdate
                    : {
                        $set: {
                          status:
                            "BLOCKED",

                          reservation:
                            emptyReservation(),
                        },
                      },

                  { session }
                );

              if (
                updated.modifiedCount !==
                1
              ) {
                fail(
                  409,
                  "Could not release expired hold"
                );
              }

              reopened =
                canReopen;
            }

            const oldStatus =
              booking.status;

            booking.status =
              "EXPIRED";

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
              String(
                candidate._id
              ),

            message:
              error.message,
          }
        );
      }
    }

    return expired;
  };
