
import {
  InterviewSlot,
  InterviewBooking,
  withTransaction,
  releaseReservationUpdate,
  addEvent,
} from "./interviewCommon.js";

import {
  expireUnpaidHolds,
} from "../controllers/interviewBookingController.js";

import {
  finalizeInterviewPayment,
} from "../controllers/interviewPaymentController.js";

import {
  cashfreeGetOrderDetails,
  cashfreeTerminateOrder,
} from "./interviewCashfree.js";

/* =====================================================
   TARGET TREK - INTERVIEW HOLD CLEANUP

   Interview hold: 3 minutes
   Cashfree expiry: 20 minutes
   Recommended cleanup: Every 1 minute

   IMPORTANT:
   - Never infer payment failure from checkout UI.
   - Never treat an arbitrary Cashfree 404 as unpaid.
   - Verify all gateway orders.
   - Do not release an active payable order.
   - Release only after definitive failure.
   - Preserve booking and payment history.
===================================================== */

const BATCH_SIZE = 50;

const TERMINAL_ORDER_STATUSES = new Set([
  "EXPIRED",
  "TERMINATED",
]);

const REJECTED_GATEWAY_CODES = new Set([
  "order_expiry_time_invalid",
  "order_amount_invalid",
  "order_currency_invalid",
  "customer_details_invalid",
]);

const normalize = (value) =>
  String(value ?? "").trim().toUpperCase();

const normalizeId = (value) =>
  String(value ?? "").trim();

const unique = (items) =>
  [...new Set(items.filter(Boolean))];

const pauseSafeReason = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Unknown error";

/* =====================================================
   EXTRACT ALL ORDER IDS

   Payment history is authoritative for discovering
   all attempted order IDs.

   The top-level payment pointer is also checked,
   because it may contain an order absent from
   the attempts array due to an interrupted write.
===================================================== */

function getBookingOrderIds(booking) {
  const attempts = booking.paymentAttempts || [];

  return unique([
    ...attempts.map((attempt) =>
      normalizeId(attempt.gatewayOrderId)
    ),
    normalizeId(booking.payment?.gatewayOrderId),
  ]).sort();
}

/* =====================================================
   TRUSTED DEFINITIVE ORDER CREATION REJECTION

   This is NOT based on a Cashfree 404.

   It requires a failure marker persisted by the
   backend when order creation was definitely
   rejected or validation failed before HTTP.

   Never set these markers from frontend input.

   Your payment attempt schema must retain
   failureReason and verifiedAt.
===================================================== */

function wasDefinitelyRejectedBeforeCheckout(attempt) {
  if (!attempt) return false;

  if (normalize(attempt.status) !== "FAILED") {
    return false;
  }

  if (!attempt.verifiedAt) {
    return false;
  }

  const reason = String(
    attempt.failureReason || ""
  );

  if (
    reason.startsWith(
      "Local initialization error:"
    )
  ) {
    return true;
  }

  const prefix = "Cashfree rejected order:";

  if (!reason.startsWith(prefix)) {
    return false;
  }

  const code = reason
    .slice(prefix.length)
    .trim()
    .split(/\s+/)[0];

  return REJECTED_GATEWAY_CODES.has(code);
}

/* =====================================================
   DETECT A DEFINITELY REJECTED ORDER ID

   Do not skip gateway verification if multiple
   attempts share an order ID and even one attempt
   lacks trustworthy rejection evidence.
===================================================== */

function hasVerifiedLocalRejection(
  booking,
  orderId
) {
  const matching = (
    booking.paymentAttempts || []
  ).filter(
    (attempt) =>
      normalizeId(attempt.gatewayOrderId) ===
      orderId
  );

  return (
    matching.length > 0 &&
    matching.every(
      wasDefinitelyRejectedBeforeCheckout
    )
  );
}

/* =====================================================
   CLASSIFY CASHFREE ORDER DETAILS

   Terminal-unpaid requires:
   - order EXPIRED or TERMINATED
   - no successful payment
   - no pending payment

   A payment success without matching PAID
   order status is still treated as a possible
   payment and must never trigger release.
===================================================== */

function classifyCashfreeDetails(
  orderId,
  details
) {
  if (
    !details?.order ||
    normalizeId(details.order.order_id) !==
      orderId ||
    !Array.isArray(details.payments)
  ) {
    throw new Error(
      `Invalid Cashfree order details for ${orderId}`
    );
  }

  const orderStatus = normalize(
    details.orderStatus ||
      details.order.order_status
  );

  const successfulPayment =
    details.payments.some(
      (payment) =>
        normalize(payment.payment_status) ===
        "SUCCESS"
    );

  const pendingPayment =
    details.payments.some(
      (payment) =>
        normalize(payment.payment_status) ===
        "PENDING"
    );

  const paymentDetected =
    successfulPayment ||
    orderStatus === "PAID";

  const terminalUnpaid =
    TERMINAL_ORDER_STATUSES.has(
      orderStatus
    ) &&
    !successfulPayment &&
    !pendingPayment;

  return {
    orderId,
    status: orderStatus || "UNKNOWN",
    paymentDetected,
    pendingPayment,
    terminalUnpaid,
    locallyRejected: false,
  };
}

/* =====================================================
   VERIFY CASHFREE ORDER

   Important:

   An HTTP 404 does NOT prove the order was
   never created.

   It could be caused by:
   - Different Cashfree environment
   - Different merchant credentials
   - Incorrect stored order ID

   Only a trusted local rejection marker allows
   skipping Cashfree verification.
===================================================== */

async function checkCashfreeOrder(
  orderId,
  booking
) {
  if (
    hasVerifiedLocalRejection(
      booking,
      orderId
    )
  ) {
    console.log(
      "[INTERVIEW CLEANUP] Verified locally rejected order:",
      {
        bookingId: booking.bookingId,
        orderId,
      }
    );

    return {
      orderId,
      status: "ORDER_CREATION_REJECTED",
      terminalUnpaid: true,
      paymentDetected: false,
      pendingPayment: false,
      locallyRejected: true,
    };
  }

  let details;

  try {
    details =
      await cashfreeGetOrderDetails(
        orderId
      );
  } catch (error) {
    if (
      error?.response?.status === 404 &&
      error?.response?.data?.code ===
        "order_not_found"
    ) {
      console.error(
        "[INTERVIEW CLEANUP] Cashfree order not found. Manual reconciliation required:",
        {
          bookingId: booking.bookingId,
          orderId,
        }
      );

      return {
        orderId,
        status: "ORDER_NOT_FOUND",
        terminalUnpaid: false,
        paymentDetected: false,
        pendingPayment: false,
        locallyRejected: false,
        requiresReview: true,
      };
    }

    throw error;
  }

  let state = classifyCashfreeDetails(
    orderId,
    details
  );

  /* ============================================
     SUCCESSFUL PAYMENT

     Delegate confirmation/refund handling to
     the existing verified payment finalizer.
  ============================================ */

  if (state.paymentDetected) {
    const result =
      await finalizeInterviewPayment(
        orderId
      );

    return {
      ...state,
      result,
    };
  }

  /* ============================================
     PENDING PAYMENT TRANSACTION

     Cashfree has an unresolved transaction.

     Do not terminate/release this booking.
  ============================================ */

  if (state.pendingPayment) {
    return state;
  }

  /* ============================================
     ALREADY TERMINATED / EXPIRED

     We have already fetched payment details,
     and no pending/successful payment exists.
  ============================================ */

  if (state.terminalUnpaid) {
    return state;
  }

  /* ============================================
     ACTIVE CASHFREE ORDER

     The three-minute reservation has expired.

     Request termination, then fetch the order
     state again.

     A termination request is not proof that
     termination has completed.
  ============================================ */

  if (state.status === "ACTIVE") {
    try {
      const response =
        await cashfreeTerminateOrder(
          orderId
        );

      console.log(
        "[INTERVIEW CLEANUP] Cashfree termination requested:",
        {
          bookingId: booking.bookingId,
          orderId,
          gatewayStatus:
            response?.order_status ||
            "UNKNOWN",
        }
      );
    } catch (error) {
      /*
        A termination request may race with
        payment success or another worker.

        Recheck gateway state before deciding
        whether the error is actionable.
      */

      console.warn(
        "[INTERVIEW CLEANUP] Termination request failed; checking latest state:",
        {
          bookingId: booking.bookingId,
          orderId,
          message: pauseSafeReason(error),
        }
      );
    }

    details =
      await cashfreeGetOrderDetails(
        orderId
      );

    state = classifyCashfreeDetails(
      orderId,
      details
    );

    if (state.paymentDetected) {
      const result =
        await finalizeInterviewPayment(
          orderId
        );

      return {
        ...state,
        result,
      };
    }

    /*
      TERMINATION_REQUESTED and ACTIVE are
      unresolved and must remain held.
    */

    return state;
  }

  /* ============================================
     UNKNOWN OR TERMINATION_REQUESTED

     The next cleanup run will verify again.
  ============================================ */

  return state;
}

/* =====================================================
   ATOMICALLY RELEASE VERIFIED UNPAID BOOKING

   This function does NOT call Cashfree.

   Call it only after ALL associated gateway
   order IDs are verified terminal-unpaid or
   definitively rejected before creation.

   The transaction prevents stale cleanup from
   overwriting a confirmed booking or another
   customer's slot reservation.
===================================================== */

async function releaseVerifiedUnpaidBooking({
  bookingObjectId,
  verifiedOrderIds,
}) {
  let result = {
    released: false,
    reason: "NOT_PROCESSED",
  };

  await withTransaction(
    async (session) => {
      const now = new Date();

      const booking =
        await InterviewBooking.findOne({
          _id: bookingObjectId,
          status: "PENDING_PAYMENT",
          holdExpiresAt: {
            $lte: now,
          },
        }).session(session);

      if (!booking) {
        result = {
          released: false,
          reason: "BOOKING_CHANGED",
        };

        return;
      }

      /* ============================================
         NEVER OVERRIDE RECORDED PAYMENT SUCCESS
      ============================================ */

      if (
        normalize(
          booking.payment?.status
        ) === "SUCCESS" ||
        (
          booking.paymentAttempts || []
        ).some(
          (attempt) =>
            normalize(attempt.status) ===
            "SUCCESS"
        )
      ) {
        result = {
          released: false,
          reason: "PAYMENT_SUCCESS",
        };

        return;
      }

      /* ============================================
         VERIFY PAYMENT ATTEMPTS DID NOT CHANGE

         A gateway order created concurrently
         must not be excluded from verification.
      ============================================ */

      const currentOrderIds =
        getBookingOrderIds(
          booking
        );

      const checkedOrderIds =
        unique(
          verifiedOrderIds.map(
            normalizeId
          )
        ).sort();

      if (
        currentOrderIds.length !==
          checkedOrderIds.length ||
        currentOrderIds.some(
          (id, index) =>
            id !== checkedOrderIds[index]
        )
      ) {
        result = {
          released: false,
          reason:
            "PAYMENT_ATTEMPTS_CHANGED",
        };

        return;
      }

      /*
        A payment attempt without a gateway
        order ID could be an incomplete write.

        Do not ignore unresolved attempts.
      */

      const unresolvedWithoutOrder =
        (
          booking.paymentAttempts || []
        ).some(
          (attempt) =>
            !normalizeId(
              attempt.gatewayOrderId
            ) &&
            ["CREATED", "PENDING"].includes(
              normalize(attempt.status)
            )
        );

      if (unresolvedWithoutOrder) {
        result = {
          released: false,
          reason:
            "UNRESOLVED_ATTEMPT_WITHOUT_ORDER",
        };

        return;
      }

      /* ============================================
         VERIFY SLOT OWNERSHIP
      ============================================ */

      const slot =
        await InterviewSlot.findOne({
          _id: booking.slotId,
          status: "HELD",
          "reservation.bookingId":
            booking._id,
        }).session(session);

      if (!slot) {
        result = {
          released: false,
          reason:
            "SLOT_OWNERSHIP_CHANGED",
        };

        return;
      }

      /* ============================================
         REOPEN SLOT ONLY WHEN STILL BOOKABLE
      ============================================ */

      const shouldReopen =
        slot.active === true &&
        slot.isDeleted !== true &&
        new Date(
          slot.startTime
        ).getTime() > now.getTime();

      const slotUpdate =
        shouldReopen
          ? releaseReservationUpdate
          : {
              $set: {
                status: "BLOCKED",
                reservation: {
                  bookingId: null,
                  heldAt: null,
                  expiresAt: null,
                  bookedAt: null,
                },
              },
            };

      /*
        This updates the reservation only.

        meetingUrl and all slot metadata
        remain unchanged.
      */

      const updatedSlot =
        await InterviewSlot.updateOne(
          {
            _id: slot._id,
            status: "HELD",
            "reservation.bookingId":
              booking._id,
          },
          slotUpdate,
          { session }
        );

      if (
        updatedSlot.modifiedCount !== 1
      ) {
        throw new Error(
          "Failed to release the owned interview slot"
        );
      }

      /* ============================================
         CLOSE VERIFIED UNSUCCESSFUL ATTEMPTS
      ============================================ */

      for (
        const attempt of
        booking.paymentAttempts || []
      ) {
        if (
          checkedOrderIds.includes(
            normalizeId(
              attempt.gatewayOrderId
            )
          ) &&
          normalize(attempt.status) !==
            "SUCCESS"
        ) {
          attempt.status = "FAILED";
          attempt.verifiedAt =
            attempt.verifiedAt || now;

          if (!attempt.failureReason) {
            attempt.failureReason =
              "Cashfree order verified terminal and unpaid";
          }
        }
      }

      /* ============================================
         EXPIRE BOOKING
      ============================================ */

      const oldStatus =
        booking.status;

      booking.status = "EXPIRED";

      booking.payment.status =
        "FAILED";

      /*
        Clear current active payment pointers.

        Individual paymentAttempts keep their
        original gateway order IDs for auditing.
      */

      booking.payment.gatewayOrderId =
        null;

      booking.payment.latestAttemptId =
        null;

      addEvent(
        booking,
        "BOOKING_EXPIRED",
        oldStatus,
        "EXPIRED",
        "Reservation expired after all payment attempts were verified unsuccessful"
      );

      await booking.save({
        session,
      });

      result = {
        released: true,
        bookingId:
          booking.bookingId,
        slotId:
          String(slot._id),
        slotStatus:
          shouldReopen
            ? "AVAILABLE"
            : "BLOCKED",
        reason:
          "VERIFIED_UNPAID",
      };
    }
  );

  return result;
}

/* =====================================================
   LOG COMPLETE ERROR DETAILS
===================================================== */

function logCleanupError(
  booking,
  error
) {
  console.error(
    "\n========== INTERVIEW CLEANUP ERROR =========="
  );

  console.error(
    "Booking ID:",
    booking?.bookingId
  );

  console.error(
    "Error:",
    error.message
  );

  console.error(
    "HTTP Status:",
    error.response?.status
  );

  console.error(
    "Cashfree Response:",
    error.response?.data
  );

  console.error(
    "MongoDB Error Code:",
    error.code
  );

  console.error(
    "Stack Trace:",
    error.stack
  );

  console.error(
    "=============================================\n"
  );
}

/* =====================================================
   MAIN CLEANUP FUNCTION

   POST /api/interviews/maintenance/cleanup

   Recommended schedule:
   * * * * *

   The slot is released only after all Cashfree
   attempts are conclusively unsuccessful.
===================================================== */

export async function cleanupInterviewHolds() {
  const now = new Date();

  const summary = {
    checked: 0,
    expiredWithoutPayment: 0,
    releasedAfterGatewayCheck: 0,
    confirmedPayments: 0,
    stillPending: 0,
    requiresReview: 0,
    errors: 0,
  };

  console.log(
    "[INTERVIEW CLEANUP] Started:",
    now.toISOString()
  );

  /* ==============================================
     STEP 1. EXPIRE BOOKINGS THAT NEVER STARTED
     GATEWAY PAYMENT
  ============================================== */

  try {
    const result =
      await expireUnpaidHolds();

    summary.expiredWithoutPayment =
      typeof result === "number"
        ? result
        : Number(
            result?.expired ??
            result?.count ??
            result?.released ??
            0
          );
  } catch (error) {
    summary.errors++;

    console.error(
      "[INTERVIEW CLEANUP] No-payment cleanup failed:",
      error.stack || error.message
    );
  }

  /* ==============================================
     STEP 2. FETCH EXPIRED BOOKINGS

     Include bookings that have payment attempts,
     even if payment.gatewayOrderId was cleared
     after an order-creation rejection.
  ============================================== */

  let bookings;

  try {
    bookings =
      await InterviewBooking.find({
        status: "PENDING_PAYMENT",
        holdExpiresAt: {
          $lte: now,
        },
        "paymentAttempts.0": {
          $exists: true,
        },
      })
        .select(
          "_id bookingId slotId status holdExpiresAt payment paymentAttempts"
        )
        .sort({
          holdExpiresAt: 1,
        })
        .limit(BATCH_SIZE)
        .lean();
  } catch (error) {
    summary.errors++;

    console.error(
      "[INTERVIEW CLEANUP] Query error:",
      error.stack || error.message
    );

    return summary;
  }

  /* ==============================================
     STEP 3. PROCESS EACH EXPIRED BOOKING
  ============================================== */

  for (const booking of bookings) {
    summary.checked++;

    try {
      const attempts =
        booking.paymentAttempts || [];

      /* ==========================================
         DO NOT OVERRIDE PAYMENT SUCCESS
      ========================================== */

      const locallyPaid =
        normalize(
          booking.payment?.status
        ) === "SUCCESS" ||
        attempts.some(
          (attempt) =>
            normalize(
              attempt.status
            ) === "SUCCESS"
        );

      if (locallyPaid) {
        /*
          A local success requires confirmation
          or investigation; never release.
        */

        summary.stillPending++;

        console.warn(
          "[INTERVIEW CLEANUP] Recorded payment success requires reconciliation:",
          booking.bookingId
        );

        continue;
      }

      /* ==========================================
         GET ALL CASHFREE ORDER IDS
      ========================================== */

      const orderIds =
        getBookingOrderIds(
          booking
        );

      if (!orderIds.length) {
        /*
          No order IDs, but payment attempts
          exist.

          Do not infer that nothing reached
          Cashfree. Keep for investigation.
        */

        summary.requiresReview++;

        console.warn(
          "[INTERVIEW CLEANUP] Payment attempts have no gateway order IDs:",
          booking.bookingId
        );

        continue;
      }

      /* ==========================================
         VERIFY EVERY DISTINCT GATEWAY ORDER
      ========================================== */

      const outcomes = [];

      for (const orderId of orderIds) {
        const outcome =
          await checkCashfreeOrder(
            orderId,
            booking
          );

        outcomes.push(
          outcome
        );
      }

      /* ==========================================
         PAYMENT MAY HAVE SUCCEEDED
      ========================================== */

      const paymentDetected =
        outcomes.some(
          (outcome) =>
            outcome.paymentDetected
        );

      const latest =
        await InterviewBooking.findById(
          booking._id
        )
          .select(
            "status payment.status"
          )
          .lean();

      if (!latest) {
        summary.requiresReview++;
        continue;
      }

      if (
        latest.status ===
          "CONFIRMED" &&
        normalize(
          latest.payment?.status
        ) === "SUCCESS"
      ) {
        summary.confirmedPayments++;

        console.log(
          "[INTERVIEW CLEANUP] Paid booking confirmed:",
          booking.bookingId
        );

        continue;
      }

      if (paymentDetected) {
        /*
          The payment finalizer either confirmed
          the booking or recorded a late-payment
          refund requirement.

          Do not release in this cleanup pass.
        */

        summary.stillPending++;

        console.warn(
          "[INTERVIEW CLEANUP] Paid order requires review:",
          booking.bookingId
        );

        continue;
      }

      /* ==========================================
         ANOTHER WEBHOOK/WORKER MAY HAVE
         ALREADY UPDATED THIS BOOKING
      ========================================== */

      if (
        latest.status === "EXPIRED" ||
        latest.status ===
          "PAYMENT_FAILED"
      ) {
        /*
          Already handled by another worker.

          Do not count it as a release performed
          by this invocation.
        */

        continue;
      }

      if (
        latest.status !==
        "PENDING_PAYMENT"
      ) {
        summary.requiresReview++;
        continue;
      }

      /* ==========================================
         CHECK UNRESOLVED CASHFREE ORDERS
      ========================================== */

      const unknownOrders =
        outcomes.filter(
          (outcome) =>
            outcome.requiresReview
        );

      if (unknownOrders.length) {
        summary.requiresReview++;

        console.warn(
          "[INTERVIEW CLEANUP] Manual gateway reconciliation required:",
          {
            bookingId:
              booking.bookingId,
            orders:
              unknownOrders.map(
                (item) => ({
                  orderId:
                    item.orderId,
                  status:
                    item.status,
                })
              ),
          }
        );

        continue;
      }

      const allTerminalUnpaid =
        outcomes.length ===
          orderIds.length &&
        outcomes.every(
          (outcome) =>
            outcome.terminalUnpaid ===
            true
        );

      if (!allTerminalUnpaid) {
        summary.stillPending++;

        console.log(
          "[INTERVIEW CLEANUP] Gateway orders unresolved:",
          {
            bookingId:
              booking.bookingId,
            orders:
              outcomes.map(
                (outcome) => ({
                  orderId:
                    outcome.orderId,
                  status:
                    outcome.status,
                })
              ),
          }
        );

        continue;
      }

      /* ==========================================
         RECHECK THE BOOKING'S PAYMENT ATTEMPTS

         All attempts must be covered by verified
         terminal orders or trusted rejections.
      ========================================== */

      const unresolvedAttemptWithoutOrder =
        attempts.some(
          (attempt) =>
            !normalizeId(
              attempt.gatewayOrderId
            ) &&
            [
              "CREATED",
              "PENDING",
            ].includes(
              normalize(attempt.status)
            )
        );

      if (unresolvedAttemptWithoutOrder) {
        summary.requiresReview++;

        console.warn(
          "[INTERVIEW CLEANUP] Unresolved attempt without gateway ID:",
          booking.bookingId
        );

        continue;
      }

      /* ==========================================
         ATOMIC SLOT RELEASE
      ========================================== */

      const release =
        await releaseVerifiedUnpaidBooking({
          bookingObjectId:
            booking._id,
          verifiedOrderIds:
            orderIds,
        });

      if (release.released) {
        summary.releasedAfterGatewayCheck++;

        console.log(
          "[INTERVIEW CLEANUP] Slot released:",
          {
            bookingId:
              release.bookingId,
            slotId:
              release.slotId,
            slotStatus:
              release.slotStatus,
            reason:
              release.reason,
          }
        );
      } else {
        summary.stillPending++;

        console.warn(
          "[INTERVIEW CLEANUP] Slot release skipped:",
          {
            bookingId:
              booking.bookingId,
            reason:
              release.reason,
          }
        );
      }
    } catch (error) {
      summary.errors++;

      logCleanupError(
        booking,
        error
      );
    }
  }

  /* ==============================================
     STEP 4. FINISH
  ============================================== */

  console.log(
    "[INTERVIEW CLEANUP] Completed:",
    summary
  );

  return summary;
}
