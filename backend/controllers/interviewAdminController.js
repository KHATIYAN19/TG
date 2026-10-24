
import {
  InterviewSlot,
  InterviewBooking,
  wrap,
  fail,
  requireId,
  requireAdmin,
  validateSlotFields,
  assertNoOverlap,
  releaseReservationUpdate,
  addEvent,
  withTransaction,
  cleanString,
} from "../services/interviewCommon.js";

import {
  sendInterviewConfirmation,
  sendInterviewCancellation,
} from "../services/interviewMail.js";

/* =========================================================
   COMMON HELPERS
========================================================= */

const isValidMeetingUrl = (value) => {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
};

/*
  Send confirmation only when:
  - booking is CONFIRMED
  - meeting URL exists
  - candidate confirmation has not been marked sent

  Email operations happen outside MongoDB transactions.

  Note: For guaranteed deduplication across concurrent
  requests, use an atomic notification claim/outbox.
*/

const sendConfirmationAfterMeetingAssigned = async (
  booking
) => {
  if (
    booking.status !== "CONFIRMED" ||
    !booking.meeting?.url ||
    booking.notifications?.confirmationSentAt
  ) {
    return {
      sent: false,
      reason: "Not eligible or already sent",
    };
  }

  try {
    const delivery =
      await sendInterviewConfirmation(booking);

    const candidateResult = delivery?.[0];

    const candidateSent =
      candidateResult?.status === "fulfilled" &&
      Boolean(candidateResult.value);

    if (candidateSent) {
      await InterviewBooking.updateOne(
        {
          _id: booking._id,
          "notifications.confirmationSentAt": null,
          status: "CONFIRMED",
        },
        {
          $set: {
            "notifications.confirmationSentAt":
              new Date(),
          },
        }
      );
    }

    if (!candidateSent) {
      console.error(
        "Interview candidate confirmation email not sent:",
        candidateResult?.reason ||
          "No delivery result"
      );
    }

    if (delivery?.[1]?.status === "rejected") {
      console.error(
        "Interview admin confirmation email failed:",
        delivery[1].reason
      );
    }

    return {
      sent: candidateSent,
    };
  } catch (error) {
    console.error(
      "Interview confirmation notification error:",
      error
    );

    return {
      sent: false,
      error: error.message,
    };
  }
};

/*
  Send cancellation email after cancellation
  transaction is committed.

  An email failure must never undo the cancellation.
*/

const sendCancellationAfterCommit = async (
  booking
) => {
  if (booking.notifications?.cancellationSentAt) {
    return {
      sent: false,
      reason: "Cancellation email already sent",
    };
  }

  try {
    const delivery =
      await sendInterviewCancellation(booking);

    const candidateSent =
      delivery?.[0]?.status === "fulfilled" &&
      Boolean(delivery[0].value);

    if (candidateSent) {
      await InterviewBooking.updateOne(
        {
          _id: booking._id,
          "notifications.cancellationSentAt": null,
        },
        {
          $set: {
            "notifications.cancellationSentAt":
              new Date(),
          },
        }
      );
    }

    for (const [index, result] of (
      delivery || []
    ).entries()) {
      if (result.status === "rejected") {
        console.error(
          `Interview cancellation email ${index} failed:`,
          result.reason
        );
      }
    }

    return {
      sent: candidateSent,
    };
  } catch (error) {
    console.error(
      "Interview cancellation notification error:",
      error
    );

    return {
      sent: false,
      error: error.message,
    };
  }
};

/* =========================================================
   1. CREATE SINGLE INTERVIEW SLOT

   POST /api/interviews/admin/slots
========================================================= */

export const createSlot = wrap(
  async (req, res) => {
    const adminId = requireAdmin(req);

    const interviewerId =
      req.body.interviewerId || adminId;

    requireId(
      interviewerId,
      "interviewer ID"
    );

    const payload = validateSlotFields(
      req.body
    );

    if (payload.startTime <= new Date()) {
      fail(
        400,
        "Cannot create interview slots in the past"
      );
    }

    let slot;

    await withTransaction(
      async (session) => {
        await assertNoOverlap({
          interviewerId,
          startTime: payload.startTime,
          endTime: payload.endTime,
          session,
        });

        const created =
          await InterviewSlot.create(
            [
              {
                ...payload,

                interviewerId,

                status: "AVAILABLE",

                active: true,
                isDeleted: false,

                createdBy: adminId,
                updatedBy: adminId,
              },
            ],
            { session }
          );

        slot = created[0];
      }
    );

    return res.status(201).json({
      success: true,
      message:
        "Interview slot created successfully",
      data: slot,
    });
  }
);

/* =========================================================
   2. BULK CREATE INTERVIEW SLOTS

   POST /api/interviews/admin/slots/bulk

   Body:
   {
     "interviewerId": "...",
     "slots": [
       {
         "title": "DSA Mock Interview",
         "startTime": "2026-10-27T12:30:00Z",
         "endTime": "2026-10-27T13:30:00Z",
         "price": 599,
         "mrp": 999,
         "allowedTopics": ["DSA", "LLD"],
         "maxTopics": 2,
         "meetingUrl": "https://meet.google.com/..."
       },
       {
         "title": "System Design Interview",
         "startTime": "2026-10-27T13:45:00Z",
         "endTime": "2026-10-27T14:45:00Z",
         "price": 799,
         "mrp": 1299
       }
     ]
   }
========================================================= */

export const bulkCreateSlots = wrap(
  async (req, res) => {
    const adminId = requireAdmin(req);

    const interviewerId =
      req.body.interviewerId || adminId;

    requireId(
      interviewerId,
      "interviewer ID"
    );

    const inputs = req.body.slots;

    if (
      !Array.isArray(inputs) ||
      inputs.length === 0 ||
      inputs.length > 100
    ) {
      fail(
        400,
        "Provide between 1 and 100 interview slots"
      );
    }

    const payloads = inputs.map(
      validateSlotFields
    );

    const now = new Date();

    for (const payload of payloads) {
      if (payload.startTime <= now) {
        fail(
          400,
          "Cannot create interview slots in the past"
        );
      }
    }

    /*
      Check overlapping slots in the
      submitted batch.
    */

    const ordered = [
      ...payloads,
    ].sort(
      (a, b) =>
        a.startTime.getTime() -
        b.startTime.getTime()
    );

    const bufferMs = 15 * 60 * 1000;

    for (
      let i = 1;
      i < ordered.length;
      i++
    ) {
      const previous = ordered[i - 1];
      const current = ordered[i];

      if (
        current.startTime.getTime() <
        previous.endTime.getTime() +
          bufferMs
      ) {
        fail(
          409,
          "Submitted slots overlap or violate the 15-minute buffer"
        );
      }
    }

    let created = [];

    await withTransaction(
      async (session) => {
        for (const payload of payloads) {
          await assertNoOverlap({
            interviewerId,
            startTime:
              payload.startTime,
            endTime:
              payload.endTime,
            session,
          });
        }

        created =
          await InterviewSlot.create(
            payloads.map(
              (payload) => ({
                ...payload,

                interviewerId,

                status: "AVAILABLE",

                active: true,
                isDeleted: false,

                createdBy: adminId,
                updatedBy: adminId,
              })
            ),
            { session }
          );
      }
    );

    return res.status(201).json({
      success: true,

      message:
        `${created.length} interview slots created successfully`,

      count: created.length,

      data: created,
    });
  }
);

/* =========================================================
   3. GET ALL ADMIN SLOTS

   GET /api/interviews/admin/slots

   Query:
   ?page=1
   &limit=20
   &status=AVAILABLE
   &includeDeleted=false
   &interviewerId=...
   &from=...
   &to=...
========================================================= */

export const getAdminSlots = wrap(
  async (req, res) => {
    requireAdmin(req);

    const page = Math.max(
      1,
      Number.parseInt(
        req.query.page,
        10
      ) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(
          req.query.limit,
          10
        ) || 20
      )
    );

    const filter = {};

    if (req.query.status) {
      filter.status =
        String(req.query.status).toUpperCase();
    }

    if (req.query.interviewerId) {
      requireId(
        req.query.interviewerId,
        "interviewer ID"
      );

      filter.interviewerId =
        req.query.interviewerId;
    }

    if (
      req.query.includeDeleted !== "true"
    ) {
      filter.isDeleted = false;
    }

    if (
      req.query.from ||
      req.query.to
    ) {
      filter.startTime = {};

      if (req.query.from) {
        const date = new Date(
          req.query.from
        );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          fail(
            400,
            "Invalid from date"
          );
        }

        filter.startTime.$gte =
          date;
      }

      if (req.query.to) {
        const date = new Date(
          req.query.to
        );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          fail(
            400,
            "Invalid to date"
          );
        }

        filter.startTime.$lte =
          date;
      }
    }

    const [
      slots,
      total,
    ] = await Promise.all([
      InterviewSlot.find(filter)
        .sort({
          startTime: 1,
        })
        .skip(
          (page - 1) * limit
        )
        .limit(limit)
        .lean(),

      InterviewSlot.countDocuments(
        filter
      ),
    ]);

    return res.json({
      success: true,

      data: slots,

      pagination: {
        page,
        limit,
        total,

        totalPages:
          Math.ceil(
            total / limit
          ),
      },
    });
  }
);

/* =========================================================
   4. UPDATE INTERVIEW SLOT

   PATCH /api/interviews/admin/slots/:id

   Admin can update:
   - title
   - description
   - start/end time
   - individual price
   - MRP
   - allowed topics
   - max topics
   - meeting URL
   - active status

   HELD and BOOKED slots cannot be edited.
========================================================= */

export const updateSlot = wrap(
  async (req, res) => {
    const adminId = requireAdmin(req);

    const slotId = requireId(
      req.params.id,
      "slot ID"
    );

    let updated;

    await withTransaction(
      async (session) => {
        const slot =
          await InterviewSlot.findById(
            slotId
          ).session(session);

        if (
          !slot ||
          slot.isDeleted
        ) {
          fail(
            404,
            "Interview slot not found"
          );
        }

        if (
          ["HELD", "BOOKED"].includes(
            slot.status
          )
        ) {
          fail(
            409,
            "Resolve or cancel the active booking before editing this slot"
          );
        }

        const payload =
          validateSlotFields({
            title:
              req.body.title ??
              slot.title,

            description:
              req.body.description ??
              slot.description,

            startTime:
              req.body.startTime ??
              slot.startTime,

            endTime:
              req.body.endTime ??
              slot.endTime,

            price:
              req.body.price ??
              slot.price,

            mrp:
              req.body.mrp ??
              slot.mrp,

            allowedTopics:
              req.body.allowedTopics ??
              slot.allowedTopics,

            maxTopics:
              req.body.maxTopics ??
              slot.maxTopics,

            meetingUrl:
              req.body.meetingUrl ??
              slot.meetingUrl,
          });

        if (
          payload.startTime <=
          new Date()
        ) {
          fail(
            400,
            "Cannot move a slot to the past"
          );
        }

        await assertNoOverlap({
          interviewerId:
            slot.interviewerId,

          startTime:
            payload.startTime,

          endTime:
            payload.endTime,

          excludeId:
            slot._id,

          session,
        });

        Object.assign(
          slot,
          payload
        );

        if (
          req.body.active !==
          undefined
        ) {
          slot.active =
            req.body.active === true;
        }

        slot.updatedBy =
          adminId;

        await slot.save({
          session,
        });

        updated = slot;
      }
    );

    return res.json({
      success: true,

      message:
        "Interview slot updated successfully",

      data: updated,
    });
  }
);

/* =========================================================
   5. BLOCK INTERVIEW SLOT

   PATCH /api/interviews/admin/slots/:id/block

   Body:
   {
     "reason": "Unavailable due to another commitment"
   }

   Only AVAILABLE slots can be blocked.
========================================================= */

export const blockSlot = wrap(
  async (req, res) => {
    const adminId =
      requireAdmin(req);

    const reason =
      cleanString(
        req.body.reason,
        2000
      );

    if (
      reason.length < 10
    ) {
      fail(
        400,
        "Blocking reason must be at least 10 characters"
      );
    }

    const slot =
      await InterviewSlot.findOneAndUpdate(
        {
          _id: requireId(
            req.params.id,
            "slot ID"
          ),

          status:
            "AVAILABLE",

          isDeleted: false,

          "reservation.bookingId": null,
        },
        {
          $set: {
            status: "BLOCKED",

            blocked: {
              reason,
              blockedBy:
                adminId,

              blockedAt:
                new Date(),
            },

            updatedBy:
              adminId,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!slot) {
      fail(
        409,
        "Only available and unreserved slots can be blocked"
      );
    }

    return res.json({
      success: true,
      message:
        "Interview slot blocked successfully",
      data: slot,
    });
  }
);

/* =========================================================
   6. UNBLOCK INTERVIEW SLOT

   PATCH /api/interviews/admin/slots/:id/unblock
========================================================= */

export const unblockSlot = wrap(
  async (req, res) => {
    const adminId =
      requireAdmin(req);

    const slot =
      await InterviewSlot.findOneAndUpdate(
        {
          _id: requireId(
            req.params.id,
            "slot ID"
          ),

          status:
            "BLOCKED",

          active: true,

          isDeleted: false,

          startTime: {
            $gt:
              new Date(),
          },

          "reservation.bookingId": null,
        },
        {
          $set: {
            status:
              "AVAILABLE",

            blocked: {
              reason: null,
              blockedBy: null,
              blockedAt: null,
            },

            updatedBy:
              adminId,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!slot) {
      fail(
        409,
        "Slot cannot be unblocked in its current state"
      );
    }

    return res.json({
      success: true,

      message:
        "Interview slot is now available",

      data: slot,
    });
  }
);

/* =========================================================
   7. SOFT DELETE SLOT

   DELETE /api/interviews/admin/slots/:id

   HELD/BOOKED slots must first be resolved.
========================================================= */

export const deleteSlot = wrap(
  async (req, res) => {
    const adminId =
      requireAdmin(req);

    const reason =
      cleanString(
        req.body.reason ||
          "Removed by admin",
        2000
      );

    const slot =
      await InterviewSlot.findOneAndUpdate(
        {
          _id: requireId(
            req.params.id,
            "slot ID"
          ),

          status: {
            $in: [
              "AVAILABLE",
              "BLOCKED",
            ],
          },

          "reservation.bookingId": null,

          isDeleted: false,
        },
        {
          $set: {
            isDeleted: true,

            active: false,

            deletedAt:
              new Date(),

            deletedBy:
              adminId,

            deleteReason:
              reason,

            updatedBy:
              adminId,
          },
        },
        {
          new: true,
        }
      );

    if (!slot) {
      fail(
        409,
        "Cannot delete this slot. Resolve its active booking first."
      );
    }

    return res.json({
      success: true,

      message:
        "Interview slot soft-deleted successfully",
    });
  }
);

/* =========================================================
   8. GET ALL BOOKINGS (ADMIN)

   GET /api/interviews/admin/bookings

   Filters:
   - status
   - paymentStatus
   - email
   - topic
   - bookingId
   - page
   - limit
========================================================= */

export const getAdminBookings = wrap(
  async (req, res) => {
    requireAdmin(req);

    const page = Math.max(
      1,
      Number.parseInt(
        req.query.page,
        10
      ) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(
          req.query.limit,
          10
        ) || 20
      )
    );

    const filter = {
      isDeleted: {
        $ne: true,
      },
    };

    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    if (
      req.query.paymentStatus
    ) {
      filter[
        "payment.status"
      ] =
        req.query.paymentStatus;
    }

    if (req.query.email) {
      filter[
        "candidate.email"
      ] =
        String(
          req.query.email
        ).toLowerCase();
    }

    if (req.query.topic) {
      filter.selectedTopics =
        String(
          req.query.topic
        ).toUpperCase();
    }

    if (
      req.query.bookingId
    ) {
      filter.bookingId =
        req.query.bookingId;
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
          (page - 1) *
            limit
        )
        .limit(limit)
        .lean(),

      InterviewBooking.countDocuments(
        filter
      ),
    ]);

    return res.json({
      success: true,

      data: bookings,

      pagination: {
        page,
        limit,
        total,

        totalPages:
          Math.ceil(
            total / limit
          ),
      },
    });
  }
);

/* =========================================================
   9. GET SINGLE BOOKING

   GET /api/interviews/admin/bookings/:id
========================================================= */

export const getAdminBooking = wrap(
  async (req, res) => {
    requireAdmin(req);

    const booking =
      await InterviewBooking.findOne({
        bookingId:
          req.params.id,
      });

    if (!booking) {
      fail(
        404,
        "Interview booking not found"
      );
    }

    return res.json({
      success: true,
      data: booking,
    });
  }
);

/* =========================================================
   10. UPDATE BOOKING DETAILS

   PATCH /api/interviews/admin/bookings/:id

   Allowed:
   - Candidate name
   - Email
   - Phone
   - Experience
   - Current/target role
   - Company
   - Resume URL
   - Notes
   - Admin notes

   Payment, status, slot and refund must not
   be arbitrarily changed here.
========================================================= */

export const updateBooking = wrap(
  async (req, res) => {
    const adminId =
      requireAdmin(req);

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

    const closedStatuses = [
      "COMPLETED",
      "CANCELLED_BY_ADMIN",
      "CANCELLED_BY_USER",
      "EXPIRED",
    ];

    if (
      closedStatuses.includes(
        booking.status
      )
    ) {
      fail(
        409,
        "Cannot edit a completed or cancelled booking"
      );
    }

    const allowedFields = [
      "name",
      "email",
      "phone",
      "experienceYears",
      "currentRole",
      "targetRole",
      "currentCompany",
      "resumeUrl",
      "notes",
    ];

    for (
      const key of
      allowedFields
    ) {
      if (
        req.body.candidate?.[
          key
        ] !== undefined
      ) {
        booking.candidate[
          key
        ] =
          req.body.candidate[
            key
          ];
      }
    }

    if (
      req.body.adminNotes !==
      undefined
    ) {
      booking.adminNotes =
        cleanString(
          req.body.adminNotes,
          3000
        );
    }

    addEvent(
      booking,

      "ADMIN_UPDATED_BOOKING",

      booking.status,
      booking.status,

      "Admin updated booking information",

      adminId
    );

    await booking.save();

    return res.json({
      success: true,

      message:
        "Interview booking updated successfully",

      data: booking,
    });
  }
);

/* =========================================================
   11. UPDATE MEETING LINK

   PATCH /api/interviews/admin/bookings/:id/meeting

   Body:
   {
     "meetingUrl": "https://meet.google.com/..."
   }

   After assigning a link to a confirmed booking:
   - Send candidate confirmation email
   - Send admin booking notification
   - Track confirmation email timestamp

   Do not change the booking's payment status.
========================================================= */

export const updateMeetingLink = wrap(
  async (req, res) => {
    const adminId =
      requireAdmin(req);

    const url =
      cleanString(
        req.body.meetingUrl,
        1000
      );

    if (
      !isValidMeetingUrl(url)
    ) {
      fail(
        400,
        "Valid HTTPS meeting URL is required"
      );
    }

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

    if (
      booking.status !==
      "CONFIRMED"
    ) {
      fail(
        409,
        "Meeting link can only be assigned to confirmed bookings"
      );
    }

    booking.meeting.url =
      url;

    booking.meeting.assignedAt =
      new Date();

    booking.meeting.assignedBy =
      adminId;

    addEvent(
      booking,

      "MEETING_UPDATED",

      booking.status,
      booking.status,

      "Admin assigned or updated the meeting link",

      adminId
    );

    await booking.save();

    /*
      Send email AFTER saving the meeting URL.

      Do not fail the meeting update when SMTP fails.
    */

    const emailResult =
      await sendConfirmationAfterMeetingAssigned(
        booking
      );

    return res.json({
      success: true,

      message:
        "Meeting link updated successfully",

      data: {
        meeting:
          booking.meeting,

        confirmationEmail: {
          sent:
            emailResult.sent,

          reason:
            emailResult.reason ||
            null,
        },
      },
    });
  }
);

/* =========================================================
   12. ADMIN CANCEL INTERVIEW BOOKING

   POST /api/interviews/admin/bookings/:id/cancel

   Body:
   {
     "reason": "Unavailable due to urgent work",
     "reopenSlot": true
   }

   Steps:
   1. Verify admin
   2. Validate cancellation reason
   3. Check payment state
   4. Verify reservation ownership
   5. Release or block the slot
   6. Mark booking cancelled
   7. Mark refund PENDING if paid
   8. Save both within transaction
   9. Notify candidate and admin after commit

   Refund initiation happens through the
   separate refund controller.
========================================================= */

export const cancelBookingByAdmin = wrap(
  async (req, res) => {
    const adminId =
      requireAdmin(req);

    const reason =
      cleanString(
        req.body.reason,
        2000
      );

    const reopenRequested =
      req.body.reopenSlot !==
      false;

    if (
      reason.length < 10
    ) {
      fail(
        400,
        "Cancellation reason must be at least 10 characters"
      );
    }

    let result;

    await withTransaction(
      async (session) => {
        const booking =
          await InterviewBooking.findOne({
            bookingId:
              req.params.id,
          }).session(session);

        if (!booking) {
          fail(
            404,
            "Interview booking not found"
          );
        }

        if (
          ![
            "CONFIRMED",
            "PENDING_PAYMENT",
          ].includes(
            booking.status
          )
        ) {
          fail(
            409,
            "This booking cannot be cancelled in its current state"
          );
        }

        const paid =
          booking.payment.status ===
          "SUCCESS";

        /*
          Do not release the slot if a
          payment is still being processed.

          Reconcile the gateway first.
        */

        const unresolvedPayment =
          booking.paymentAttempts.some(
            (attempt) =>
              [
                "CREATED",
                "PENDING",
              ].includes(
                attempt.status
              )
          );

        if (
          !paid &&
          unresolvedPayment
        ) {
          fail(
            409,
            "Payment is still pending. Reconcile it before cancelling."
          );
        }

        const expectedStatus =
          paid
            ? "BOOKED"
            : "HELD";

        const slot =
          await InterviewSlot.findOne({
            _id:
              booking.slotId,

            status:
              expectedStatus,

            "reservation.bookingId":
              booking._id,
          }).session(session);

        if (!slot) {
          fail(
            409,
            "The slot is no longer owned by this booking"
          );
        }

        /*
          Reopen the slot only when:
          - Admin requested reopening
          - Slot is not deleted
          - Slot is active
          - Slot is in the future
        */

        const reopen =
          reopenRequested &&
          !slot.isDeleted &&
          slot.active &&
          slot.startTime >
            new Date();

        const oldStatus =
          booking.status;

        let slotUpdate;

        if (reopen) {
          slotUpdate =
            releaseReservationUpdate;
        } else {
          slotUpdate = {
            $set: {
              status:
                "BLOCKED",

              reservation: {
                bookingId:
                  null,

                heldAt:
                  null,

                expiresAt:
                  null,

                bookedAt:
                  null,
              },

              blocked: {
                reason,

                blockedBy:
                  adminId,

                blockedAt:
                  new Date(),
              },
            },
          };
        }

        const released =
          await InterviewSlot.updateOne(
            {
              _id:
                slot._id,

              status:
                expectedStatus,

              "reservation.bookingId":
                booking._id,
            },
            slotUpdate,
            { session }
          );

        if (
          released.modifiedCount !==
          1
        ) {
          fail(
            409,
            "Could not release the interview slot"
          );
        }

        /*
          Preserve original booking history.
        */

        booking.status =
          "CANCELLED_BY_ADMIN";

        booking.cancellation = {
          cancelledBy:
            adminId,

          cancelledByRole:
            "ADMIN",

          reason,

          cancelledAt:
            new Date(),

          slotReopened:
            reopen,
        };

        /*
          Paid bookings require refund processing.
          This does NOT mean a refund has
          already been sent to the bank.
        */

        if (paid) {
          booking.refund.status =
            "PENDING";

          booking.refund.amount =
            booking.slotSnapshot.price;

          booking.refund.currency =
            booking.slotSnapshot.currency;

          booking.refund.reason =
            reason;
        }

        addEvent(
          booking,

          "ADMIN_CANCELLED",

          oldStatus,

          "CANCELLED_BY_ADMIN",

          reason,

          adminId
        );

        await booking.save({
          session,
        });

        result = booking;
      }
    );

    /*
      TRANSACTION COMMITTED.

      Send candidate/admin cancellation emails.
      Email errors must not reverse cancellation.
    */

    const emailResult =
      await sendCancellationAfterCommit(
        result
      );

    return res.json({
      success: true,

      message:
        "Interview cancelled successfully. The slot has been updated and any applicable refund is pending initiation.",

      data: {
        bookingId:
          result.bookingId,

        status:
          result.status,

        cancellation:
          result.cancellation,

        slotReopened:
          result.cancellation
            ?.slotReopened,

        refund:
          result.refund,

        cancellationEmail: {
          sent:
            emailResult.sent,

          reason:
            emailResult.reason ||
            null,
        },
      },
    });
  }
);

/* =========================================================
   13. MARK INTERVIEW COMPLETED

   PATCH /api/interviews/admin/bookings/:id/complete
========================================================= */

export const completeBooking = wrap(
  async (req, res) => {
    const adminId =
      requireAdmin(req);

    const booking =
      await InterviewBooking.findOne({
        bookingId:
          req.params.id,

        status:
          "CONFIRMED",

        isDeleted: {
          $ne: true,
        },
      });

    if (!booking) {
      fail(
        409,
        "Only confirmed bookings can be completed"
      );
    }

    booking.status =
      "COMPLETED";

    booking.completedAt =
      new Date();

    addEvent(
      booking,

      "INTERVIEW_COMPLETED",

      "CONFIRMED",

      "COMPLETED",

      "Interview completed by admin",

      adminId
    );

    await booking.save();

    return res.json({
      success: true,

      message:
        "Interview marked as completed successfully",

      data: {
        bookingId:
          booking.bookingId,

        status:
          booking.status,

        completedAt:
          booking.completedAt,
      },
    });
  }
);

/* =========================================================
   14. SOFT DELETE INTERVIEW BOOKING

   DELETE /api/interviews/admin/bookings/:id

   Body:
   {
     "reason": "Removing old completed booking"
   }

   Only closed bookings are eligible.

   Never physically delete financial history.

   Deletion does not release slots or issue refunds.
========================================================= */

export const deleteBooking = wrap(
  async (req, res) => {
    const adminId =
      requireAdmin(req);

    const reason =
      cleanString(
        req.body.reason,
        2000
      );

    if (
      reason.length < 10
    ) {
      fail(
        400,
        "Deletion reason must be at least 10 characters"
      );
    }

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

    const closedStatuses = [
      "COMPLETED",
      "CANCELLED_BY_ADMIN",
      "CANCELLED_BY_USER",
      "EXPIRED",
      "PAYMENT_FAILED",
      "NO_SHOW",
    ];

    if (
      !closedStatuses.includes(
        booking.status
      )
    ) {
      fail(
        409,
        "Cancel or complete the booking before deleting it"
      );
    }

    /*
      Do not hide bookings that still
      have an unresolved refund.
    */

    if (
      [
        "PENDING",
        "PROCESSING",
        "FAILED",
      ].includes(
        booking.refund?.status
      )
    ) {
      fail(
        409,
        "Resolve the refund before deleting the booking"
      );
    }

    booking.isDeleted =
      true;

    booking.deletedAt =
      new Date();

    booking.deletedBy =
      adminId;

    booking.deleteReason =
      reason;

    addEvent(
      booking,

      "BOOKING_SOFT_DELETED",

      booking.status,

      booking.status,

      reason,

      adminId
    );

    await booking.save();

    return res.json({
      success: true,

      message:
        "Interview booking soft-deleted successfully",

      data: {
        bookingId:
          booking.bookingId,

        isDeleted:
          booking.isDeleted,

        deletedAt:
          booking.deletedAt,
      },
    });
  }
);
