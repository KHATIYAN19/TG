
// import crypto from "crypto";

// import {
//   InterviewSlot,
//   InterviewBooking,
//   wrap,
//   fail,
//   makeId,
//   addEvent,
//   withTransaction,
//   releaseReservationUpdate,
//   requireAdmin,
//   assertBookingOwner,
// } from "../services/interviewCommon.js";

// import {
//   cashfreeCreateOrder,
//   cashfreeGetOrder,
//   cashfreeGetPayments,
//   cashfreeCreateRefund,
//   cashfreeGetRefund,
// } from "../services/interviewCashfree.js";

// import {
//   sendInterviewConfirmation,
// } from "../services/interviewMail.js";

// /* =========================================================
//    CONFIGURATION
// ========================================================= */

// const GATEWAY = "CASHFREE";

// const SUCCESS_PAYMENT = "SUCCESS";

// const TERMINAL_ORDER_STATUSES = new Set([
//   "EXPIRED",
//   "TERMINATED",
// ]);

// const TERMINAL_ATTEMPT_STATUSES = new Set([
//   "FAILED",
//   "USER_DROPPED",
//   "CANCELLED",
// ]);

// const normalize = (value) =>
//   String(value ?? "").trim().toUpperCase();

// const isValidAmount = (first, second) =>
//   Math.abs(Number(first) - Number(second)) < 0.001;

// const getHttpError = (error) => {
//   const code = error?.response?.status;

//   return {
//     code,
//     message:
//       error?.response?.data?.message ||
//       error?.message ||
//       "Payment gateway request failed",
//   };
// };

// const cleanOrderId = (orderId) => {
//   const value = String(orderId ?? "").trim();

//   if (!value || value.length > 100) {
//     fail(400, "Invalid gateway order ID");
//   }

//   return value;
// };

// const getAttempt = (booking, orderId) =>
//   booking.paymentAttempts.find(
//     (item) => item.gatewayOrderId === orderId
//   );

// const clearReservation = () => ({
//   bookingId: null,
//   heldAt: null,
//   expiresAt: null,
//   bookedAt: null,
// });

// const bookingResult = (booking, extra = {}) => ({
//   bookingId: booking.bookingId,
//   status: booking.status,
//   paymentStatus: booking.payment.status,
//   refundStatus: booking.refund?.status || "NOT_REQUIRED",
//   ...extra,
// });

// /* =========================================================
//    GET VERIFIED CASHFREE STATE

//    Never trust frontend or webhook data as final
//    proof of payment.

//    Get the order and its transactions from Cashfree.
// ========================================================= */

// async function getVerifiedGatewayState(orderId) {
//   const id = cleanOrderId(orderId);

//   const order = await cashfreeGetOrder(id);

//   if (order?.order_id !== id) {
//     throw new Error("Cashfree order ID mismatch");
//   }

//   const rawPayments = await cashfreeGetPayments(id);

//   const payments = Array.isArray(rawPayments)
//     ? rawPayments
//     : [];

//   const orderStatus = normalize(order.order_status);

//   const successfulPayment = payments.find(
//     (payment) =>
//       normalize(payment.payment_status) === "SUCCESS"
//   );

//   const hasPendingPayment = payments.some(
//     (payment) =>
//       normalize(payment.payment_status) === "PENDING"
//   );

//   const latestPayment = [...payments].sort(
//     (a, b) =>
//       new Date(b.payment_time || 0).getTime() -
//       new Date(a.payment_time || 0).getTime()
//   )[0];

//   /*
//     Only PAID plus a successful transaction
//     is treated as a completed payment.
//   */

//   const paid =
//     orderStatus === "PAID" &&
//     Boolean(successfulPayment);

//   /*
//     A failed transaction alone is insufficient
//     to close an ACTIVE order.

//     Orders that are definitively closed without
//     a successful payment can be finalized as
//     unsuccessful.
//   */

//   const terminal =
//     !paid &&
//     TERMINAL_ORDER_STATUSES.has(orderStatus) &&
//     !hasPendingPayment &&
//     !successfulPayment;

//   const pending = !paid && !terminal;

//   return {
//     order,
//     payments,
//     orderStatus,
//     successfulPayment,
//     latestPayment,
//     hasPendingPayment,
//     paid,
//     terminal,
//     pending,
//   };
// }

// /* =========================================================
//    VALIDATE PAYMENT SNAPSHOT

//    Verify the gateway amount against the exact
//    payment attempt created by our backend.
// ========================================================= */

// function validateVerifiedAmount(
//   booking,
//   attempt,
//   gateway
// ) {
//   if (
//     !isValidAmount(
//       gateway.order.order_amount,
//       attempt.amount
//     )
//   ) {
//     throw new Error(
//       "Cashfree order amount does not match booking amount"
//     );
//   }

//   if (
//     normalize(gateway.order.order_currency) !==
//     normalize(attempt.currency)
//   ) {
//     throw new Error(
//       "Cashfree currency does not match booking currency"
//     );
//   }

//   if (
//     !isValidAmount(
//       attempt.amount,
//       booking.slotSnapshot.price
//     )
//   ) {
//     throw new Error(
//       "Payment attempt does not match booking price snapshot"
//     );
//   }

//   /*
//     Check the individual successful transaction too.
//     A paid order alone is not sufficient when the
//     transaction amount does not match.
//   */

//   if (gateway.paid) {
//     const payment = gateway.successfulPayment;

//     if (
//       payment?.payment_amount != null &&
//       !isValidAmount(
//         payment.payment_amount,
//         attempt.amount
//       )
//     ) {
//       throw new Error(
//         "Successful transaction amount mismatch"
//       );
//     }

//     if (
//       payment?.payment_currency &&
//       normalize(payment.payment_currency) !==
//         normalize(attempt.currency)
//     ) {
//       throw new Error(
//         "Successful transaction currency mismatch"
//       );
//     }
//   }
// }

// /* =========================================================
//    CONFIRMATION EMAIL AFTER DATABASE COMMIT

//    Send only when payment created a new
//    confirmed booking and a meeting URL exists.

//    Production should use a durable outbox for
//    reliable and exactly-once logical delivery.
// ========================================================= */

// async function notifyConfirmedBooking(bookingId) {
//   const booking = await InterviewBooking.findOne({
//     bookingId,
//     status: "CONFIRMED",
//   });

//   if (!booking) return;

//   if (!booking.meeting?.url) {
//     console.log(
//       `[INTERVIEW] ${bookingId}: meeting URL missing; confirmation email deferred`
//     );
//     return;
//   }

//   if (booking.notifications?.confirmationSentAt) {
//     return;
//   }

//   try {
//     const results = await sendInterviewConfirmation(
//       booking
//     );

//     const candidateSent =
//       results?.[0]?.status === "fulfilled" &&
//       Boolean(results[0].value);

//     if (candidateSent) {
//       await InterviewBooking.updateOne(
//         {
//           _id: booking._id,
//           status: "CONFIRMED",
//           "notifications.confirmationSentAt": null,
//         },
//         {
//           $set: {
//             "notifications.confirmationSentAt":
//               new Date(),
//           },
//         }
//       );
//     }

//     for (const [index, result] of (
//       results || []
//     ).entries()) {
//       if (result.status === "rejected") {
//         console.error(
//           `[INTERVIEW] Confirmation email ${index} failed:`,
//           result.reason
//         );
//       }
//     }
//   } catch (error) {
//     console.error(
//       "[INTERVIEW] Confirmation email error:",
//       error.message
//     );
//   }
// }

// /* =========================================================
//    CREATE CASHFREE PAYMENT ORDER

//    POST /api/interviews/bookings/:id/payment

//    The amount is always loaded from MongoDB.
// ========================================================= */


// export const createInterviewPayment = wrap(
//   async (req, res) => {
//     const booking = await InterviewBooking.findOne({
//       bookingId: req.params.id,
//       status: "PENDING_PAYMENT",
//     });

//     if (!booking) {
//       fail(404, "Pending interview booking not found");
//     }

//     assertBookingOwner(req, booking);

//     const now = new Date();

//     const holdExpiry = new Date(
//       booking.holdExpiresAt
//     );

//     const remainingMs =
//       holdExpiry.getTime() - now.getTime();

//     /* ==============================================
//        1. VALIDATE BOOKING BEFORE CREATING ATTEMPT
//     ============================================== */

//     if (
//       !booking.holdExpiresAt ||
//       Number.isNaN(holdExpiry.getTime()) ||
//       remainingMs <= 0
//     ) {
//       fail(
//         409,
//         "Interview reservation expired. Please book an available slot again."
//       );
//     }

//     /*
//       Prevent starting checkout with almost no
//       reservation time remaining.

//       This check happens BEFORE recording a
//       payment attempt in MongoDB.
//     */

//     if (remainingMs < 15000) {
//       fail(
//         409,
//         "Less than 15 seconds remain. Please select the slot again."
//       );
//     }

//     const slot = await InterviewSlot.findOne({
//       _id: booking.slotId,
//       status: "HELD",
//       active: true,
//       isDeleted: false,
//       "reservation.bookingId": booking._id,
//       "reservation.expiresAt": {
//         $gt: now,
//       },
//     });

//     if (!slot) {
//       fail(
//         409,
//         "This interview slot is no longer reserved for your booking."
//       );
//     }

//     /* ==============================================
//        2. VALIDATE BOOKING PRICE
//     ============================================== */

//     const amount = Number(
//       booking.slotSnapshot?.price
//     );

//     const currency = String(
//       booking.slotSnapshot?.currency || "INR"
//     ).toUpperCase();

//     if (
//       !Number.isFinite(amount) ||
//       amount <= 0 ||
//       Math.abs(
//         amount * 100 - Math.round(amount * 100)
//       ) > 0.000001
//     ) {
//       fail(400, "Invalid interview booking amount");
//     }

//     if (currency !== "INR") {
//       fail(
//         400,
//         "Interview payments only support INR"
//       );
//     }

//     /* ==============================================
//        3. VALIDATE CANDIDATE DATA BEFORE CLAIM

//        Mirrors the essential Cashfree customer
//        requirements so preventable errors do not
//        create orphaned payment attempts.
//     ============================================== */

//     const candidate = booking.candidate || {};

//     const customerName = String(
//       candidate.name || ""
//     ).trim();

//     const customerEmail = String(
//       candidate.email || ""
//     ).trim();

//     let customerPhone = String(
//       candidate.phone || ""
//     ).replace(/[\s()+-]/g, "");

//     if (
//       customerPhone.length === 12 &&
//       customerPhone.startsWith("91")
//     ) {
//       customerPhone =
//         customerPhone.slice(2);
//     }

//     if (
//       !customerName ||
//       customerName.length > 120
//     ) {
//       fail(400, "Invalid candidate name");
//     }

//     if (
//       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
//         customerEmail
//       )
//     ) {
//       fail(400, "Invalid candidate email");
//     }

//     if (!/^[6-9]\d{9}$/.test(customerPhone)) {
//       fail(
//         400,
//         "A valid 10-digit mobile number is required"
//       );
//     }

//     /* ==============================================
//        4. CHECK UNRESOLVED ATTEMPTS

//        A previous Cashfree order may still be
//        payable even if checkout failed to open.

//        Do not create a second payment order until
//        the previous one is reconciled or terminated.
//     ============================================== */

//     const unresolvedAttempt =
//       (booking.paymentAttempts || []).find(
//         (attempt) =>
//           ["CREATED", "PENDING", "SUCCESS"].includes(
//             String(
//               attempt.status || ""
//             ).toUpperCase()
//           )
//       );

//     if (unresolvedAttempt) {
//       fail(
//         409,
//         "A previous payment order requires verification. Please check payment status before trying again."
//       );
//     }

//     /* ==============================================
//        5. CREATE ORDER AND ATTEMPT IDS
//     ============================================== */

//     const orderId = makeId("INTPAY").slice(
//       0,
//       45
//     );

//     const attemptId = makeId("ATT");

//     /* ==============================================
//        6. ATOMIC PAYMENT INITIALIZATION

//        This protects against double clicks and
//        simultaneous payment creation requests.
//     ============================================== */

//     const reserved =
//       await InterviewBooking.findOneAndUpdate(
//         {
//           _id: booking._id,
//           status: "PENDING_PAYMENT",

//           holdExpiresAt: {
//             $gt: new Date(
//               Date.now() + 15000
//             ),
//           },

//           "payment.status": {
//             $in: [
//               "NOT_STARTED",
//               "FAILED",
//             ],
//           },

//           paymentAttempts: {
//             $not: {
//               $elemMatch: {
//                 status: {
//                   $in: [
//                     "CREATED",
//                     "PENDING",
//                     "SUCCESS",
//                   ],
//                 },
//               },
//             },
//           },
//         },
//         {
//           $set: {
//             "payment.status": "CREATED",
//             "payment.gateway": GATEWAY,
//             "payment.gatewayOrderId": orderId,
//             "payment.latestAttemptId": attemptId,
//           },

//           $push: {
//             paymentAttempts: {
//               attemptId,
//               gateway: GATEWAY,
//               gatewayOrderId: orderId,
//               amount,
//               currency,
//               status: "CREATED",
//               createdAt: new Date(),
//             },
//           },
//         },
//         {
//           new: true,
//           runValidators: true,
//         }
//       );

//     if (!reserved) {
//       fail(
//         409,
//         "Payment initialization is already in progress or your reservation has almost expired."
//       );
//     }

//     /* ==============================================
//        7. SAFE ROLLBACK FOR DEFINITIVE FAILURE

//        Only use this when we know the Cashfree
//        order was NOT created.

//        Keeps the reservation until its existing
//        expiry and allows another payment attempt.

//        Never release the slot in this function.
//     ============================================== */

//     async function markAttemptFailed(reason) {
//       const update =
//         await InterviewBooking.updateOne(
//           {
//             _id: booking._id,
//             status: "PENDING_PAYMENT",
//             "payment.gatewayOrderId": orderId,
//             "payment.latestAttemptId": attemptId,
//             "payment.status": "CREATED",

//             paymentAttempts: {
//               $elemMatch: {
//                 attemptId,
//                 gatewayOrderId: orderId,
//                 status: "CREATED",
//               },
//             },
//           },
//           {
//             $set: {
//               "payment.status": "FAILED",
//               "paymentAttempts.$[attempt].status":
//                 "FAILED",
//               "paymentAttempts.$[attempt].verifiedAt":
//                 new Date(),
//               "paymentAttempts.$[attempt].failureReason":
//                 String(reason).slice(0, 250),
//             },

//             $unset: {
//               "payment.gatewayOrderId": "",
//               "payment.latestAttemptId": "",
//             },
//           },
//           {
//             arrayFilters: [
//               {
//                 "attempt.attemptId": attemptId,
//                 "attempt.gatewayOrderId": orderId,
//                 "attempt.status": "CREATED",
//               },
//             ],
//           }
//         );

//       if (update.modifiedCount !== 1) {
//         console.error(
//           "[INTERVIEW] Failed to reset rejected payment attempt",
//           {
//             bookingId: booking.bookingId,
//             orderId,
//           }
//         );

//         return false;
//       }

//       return true;
//     }

//     /* ==============================================
//        8. CREATE CASHFREE ORDER
//     ============================================== */

//     let gatewayOrder;

//     try {
//       gatewayOrder = await cashfreeCreateOrder({
//         orderId,
//         amount,
//         currency,

//         customer: booking.candidate,

//         bookingId: booking.bookingId,

//         // Original three-minute deadline.
//         // The Cashfree service independently
//         // sets its gateway expiry to 20 minutes.
//         holdExpiresAt: booking.holdExpiresAt,
//       });
//     } catch (error) {
//       const httpStatus =
//         Number(error.response?.status || 0);

//       const gatewayCode = String(
//         error.response?.data?.code || ""
//       ).trim();

//       const message =
//         error.response?.data?.message ||
//         error.message ||
//         "Payment initialization failed";

//       console.error(
//         "[INTERVIEW] Cashfree order creation failed",
//         {
//           bookingId: booking.bookingId,
//           orderId,
//           httpStatus,
//           gatewayCode,
//           message,
//           requestAttempted:
//             error.cashfreeRequestAttempted === true,
//         }
//       );

//       /* ============================================
//          DEFINITE LOCAL VALIDATION ERROR

//          The service threw before attempting HTTP.

//          Important: gatewayRequest() must set
//          cashfreeRequestAttempted=true when the
//          HTTP operation throws.
//       ============================================ */

//       if (
//         error.cashfreeRequestAttempted !== true &&
//         !error.response
//       ) {
//         const reset = await markAttemptFailed(
//           `Local initialization error: ${message}`
//         );

//         if (!reset) {
//           fail(
//             502,
//             "Payment state could not be reset. Please check booking status."
//           );
//         }

//         fail(
//           409,
//           message
//         );
//       }

//       /* ============================================
//          DEFINITE CASHFREE REJECTION

//          Explicit validation errors from Cashfree
//          indicate creation was rejected.

//          Do not treat timeout, 429, 500 or 503
//          as definitive rejection.
//       ============================================ */

//       const rejectedCodes = new Set([
//         "order_expiry_time_invalid",
//         "order_amount_invalid",
//         "order_currency_invalid",
//         "customer_details_invalid",
//       ]);

//       const definitelyRejected =
//         httpStatus === 400 &&
//         rejectedCodes.has(gatewayCode);

//       if (definitelyRejected) {
//         const reset = await markAttemptFailed(
//           `Cashfree rejected order: ${gatewayCode}`
//         );

//         if (!reset) {
//           fail(
//             502,
//             "Cashfree rejected payment but the booking could not be reset safely."
//           );
//         }

//         fail(
//           502,
//           "Cashfree rejected payment initialization. Please try again while your reservation is active."
//         );
//       }

//       /* ============================================
//          UNCERTAIN NETWORK OR GATEWAY FAILURE

//          Cashfree may have created the order.

//          The attempt must remain CREATED for
//          gateway reconciliation and safe cleanup.
//       ============================================ */

//       fail(
//         502,
//         "Payment initialization could not be verified. Your booking has been retained for payment verification."
//       );
//     }

//     /* ==============================================
//        9. VALIDATE GATEWAY RESPONSE

//        A missing session is not evidence that
//        Cashfree failed to create the order.
//     ============================================== */

//     if (
//       gatewayOrder?.order_id !== orderId ||
//       !gatewayOrder?.payment_session_id
//     ) {
//       console.error(
//         "[INTERVIEW] Unexpected Cashfree response",
//         {
//           bookingId: booking.bookingId,
//           orderId,
//           returnedOrderId:
//             gatewayOrder?.order_id,
//           hasSession: Boolean(
//             gatewayOrder?.payment_session_id
//           ),
//         }
//       );

//       // Do not reset the attempt. The order
//       // might exist at Cashfree.
//       fail(
//         502,
//         "Cashfree did not return a valid checkout session. Please verify the payment order before retrying."
//       );
//     }

//     /* ==============================================
//        10. SAVE GATEWAY SESSION STATE

//        Do not overwrite a booking already changed
//        by a webhook or another reconciliation.
//     ============================================== */

//     try {
//       const result =
//         await InterviewBooking.updateOne(
//           {
//             _id: booking._id,
//             status: "PENDING_PAYMENT",
//             "payment.gatewayOrderId": orderId,
//             "payment.latestAttemptId": attemptId,
//             "payment.status": "CREATED",

//             paymentAttempts: {
//               $elemMatch: {
//                 attemptId,
//                 gatewayOrderId: orderId,
//                 status: "CREATED",
//               },
//             },
//           },
//           {
//             $set: {
//               "payment.status": "PENDING",
//               "paymentAttempts.$[attempt].status":
//                 "PENDING",
//             },
//           },
//           {
//             arrayFilters: [
//               {
//                 "attempt.attemptId": attemptId,
//                 "attempt.gatewayOrderId": orderId,
//                 "attempt.status": "CREATED",
//               },
//             ],
//           }
//         );

//       if (result.modifiedCount !== 1) {
//         // A webhook may already have updated the
//         // state; never blindly overwrite it.
//         const latest =
//           await InterviewBooking.findById(
//             booking._id
//           ).select(
//             "status payment.status payment.gatewayOrderId"
//           );

//         const stillOwned =
//           latest?.status === "PENDING_PAYMENT" &&
//           latest?.payment?.gatewayOrderId === orderId &&
//           latest?.payment?.status === "PENDING";

//         if (!stillOwned) {
//           fail(
//             409,
//             "Booking state changed during payment initialization. Please verify the booking."
//           );
//         }
//       }
//     } catch (error) {
//       console.error(
//         "[INTERVIEW] Failed to persist payment session",
//         {
//           bookingId: booking.bookingId,
//           orderId,
//           message: error.message,
//         }
//       );

//       // Gateway order already exists.
//       // Do not roll back or create another.
//       throw error;
//     }

//     /* ==============================================
//        11. RETURN SESSION FOR CASHFREE SDK
//     ============================================== */

//     return res.status(201).json({
//       success: true,

//       message:
//         "Interview Cashfree payment session created",

//       data: {
//         bookingId: booking.bookingId,
//         orderId,
//         paymentSessionId:
//           gatewayOrder.payment_session_id,
//         gateway: GATEWAY,
//         amount,
//         currency,
//         holdExpiresAt:
//           booking.holdExpiresAt,

//         remainingSeconds: Math.max(
//           0,
//           Math.ceil(
//             (
//               holdExpiry.getTime() -
//               Date.now()
//             ) / 1000
//           )
//         ),
//       },
//     });
//   }
// );


// /* =========================================================
//    FINALIZE VERIFIED INTERVIEW PAYMENT

//    Called by:
//    1. Cashfree webhook
//    2. Frontend reconciliation API
//    3. Scheduled payment reconciliation worker

//    This is the single source of truth for
//    payment state transitions.
// ========================================================= */

// export async function finalizeInterviewPayment(orderId) {
//   const verified = await getVerifiedGatewayState(
//     orderId
//   );

//   let outcome = {
//     confirmed: false,
//     paymentStatus: "PENDING",
//     gatewayOrderStatus: verified.orderStatus,
//   };

//   await withTransaction(async (session) => {
//     const booking = await InterviewBooking.findOne({
//       "paymentAttempts.gatewayOrderId": orderId,
//     }).session(session);

//     if (!booking) {
//       console.error(
//         "[INTERVIEW] Unknown gateway order:",
//         orderId
//       );

//       fail(404, "Payment order does not match a booking");
//     }

//     const attempt = getAttempt(booking, orderId);

//     if (!attempt) {
//       fail(404, "Payment attempt not found");
//     }

//     validateVerifiedAmount(
//       booking,
//       attempt,
//       verified
//     );

//     const oldStatus = booking.status;

//     /* =================================================
//        CASE 1: SUCCESSFUL PAYMENT
//     ================================================= */

//     if (verified.paid) {
//       const paymentId = String(
//         verified.successfulPayment.cf_payment_id || ""
//       );

//       /*
//         Confirmed already:
//         duplicate webhook or repeated reconciliation.
//       */

//       if (
//         booking.status === "CONFIRMED" &&
//         booking.payment.status === "SUCCESS"
//       ) {
//         outcome = {
//           confirmed: true,
//           bookingId: booking.bookingId,
//           paymentStatus: "SUCCESS",
//           bookingStatus: "CONFIRMED",
//           alreadyConfirmed: true,
//           gatewayOrderStatus: verified.orderStatus,
//         };

//         return;
//       }

//       /*
//         Record successful payment even if booking
//         has already been cancelled or expired.

//         We must not lose evidence of money collected.
//       */

//       attempt.status = "SUCCESS";
//       attempt.gatewayPaymentId = paymentId;
//       attempt.paidAt = new Date();
//       attempt.verifiedAt = new Date();

//       booking.payment.status = "SUCCESS";
//       booking.payment.gateway = GATEWAY;
//       booking.payment.gatewayOrderId = orderId;
//       booking.payment.gatewayPaymentId = paymentId;
//       booking.payment.successfulAttemptId =
//         attempt.attemptId;
//       booking.payment.paidAt = new Date();

//       /*
//         Check exclusive slot ownership.

//         We intentionally do not require the
//         original hold to remain within its
//         expiry time here: the gateway has
//         verified payment, and the slot must
//         not have been reassigned.

//         A separate expiry worker must reconcile
//         the gateway before releasing the hold.
//       */

//       const slot = await InterviewSlot.findOne({
//         _id: booking.slotId,
//         status: "HELD",
//         active: true,
//         isDeleted: false,
//         "reservation.bookingId": booking._id,
//       }).session(session);

//       /*
//         Late success:
//         cancelled, expired, or reassigned booking.

//         Never overwrite somebody else's slot.
//       */

//       if (
//         oldStatus !== "PENDING_PAYMENT" ||
//         !slot
//       ) {
//         /*
//           If the booking had already been
//           paid and refunded, don't reset
//           the refund to PENDING.
//         */

//         if (
//           !["PENDING", "PROCESSING", "SUCCESS"].includes(
//             booking.refund?.status
//           )
//         ) {
//           booking.refund.status = "PENDING";
//           booking.refund.amount =
//             booking.slotSnapshot.price;
//           booking.refund.currency =
//             booking.slotSnapshot.currency;
//           booking.refund.reason =
//             "Payment succeeded after interview reservation became unavailable";
//         }

//         addEvent(
//           booking,
//           "LATE_PAYMENT_REFUND_REQUIRED",
//           oldStatus,
//           oldStatus,
//           "Verified payment cannot be attached to an available reservation"
//         );

//         await booking.save({ session });

//         outcome = {
//           confirmed: false,
//           bookingId: booking.bookingId,
//           bookingStatus: booking.status,
//           paymentStatus: "SUCCESS",
//           refundRequired: true,
//           refundStatus: booking.refund.status,
//           gatewayOrderStatus: verified.orderStatus,
//         };

//         return;
//       }

//       const updatedSlot =
//         await InterviewSlot.updateOne(
//           {
//             _id: slot._id,
//             status: "HELD",
//             "reservation.bookingId": booking._id,
//           },
//           {
//             $set: {
//               status: "BOOKED",
//               "reservation.bookedAt": new Date(),
//               "reservation.expiresAt": null,
//             },
//           },
//           { session }
//         );

//       if (updatedSlot.modifiedCount !== 1) {
//         fail(
//           409,
//           "Unable to confirm reservation ownership"
//         );
//       }

//       booking.status = "CONFIRMED";
//       booking.confirmedAt = new Date();

//       addEvent(
//         booking,
//         "PAYMENT_CONFIRMED",
//         oldStatus,
//         "CONFIRMED",
//         "Cashfree payment verified successfully"
//       );

//       await booking.save({ session });

//       outcome = {
//         confirmed: true,
//         newlyConfirmed: true,
//         bookingId: booking.bookingId,
//         bookingStatus: "CONFIRMED",
//         paymentStatus: "SUCCESS",
//         gatewayOrderStatus: verified.orderStatus,
//       };

//       return;
//     }

//     /* =================================================
//        CASE 2: STILL PENDING / ACTIVE

//        Do not release the slot just because
//        the latest attempt failed or the user
//        closed the checkout.
//     ================================================= */

//     if (verified.pending) {
//       const latestState = normalize(
//         verified.latestPayment?.payment_status
//       );

//       /*
//         Keep the order unresolved until Cashfree
//         gives us an authoritative terminal state.
//       */

//       if (booking.status === "PENDING_PAYMENT") {
//         if (
//           ["CREATED", "NOT_STARTED", "PENDING"].includes(
//             booking.payment.status
//           )
//         ) {
//           booking.payment.status = "PENDING";
//         }

//         if (attempt.status !== "SUCCESS") {
//           attempt.status = "PENDING";
//         }

//         if (
//           latestState === "FAILED" ||
//           TERMINAL_ATTEMPT_STATUSES.has(latestState)
//         ) {
//           /*
//             A failed attempt is noted in the
//             event log, but the order itself may
//             still accept another payment.
//           */

//           const alreadyLogged = booking.events.some(
//             (e) =>
//               e.type === "PAYMENT_ATTEMPT_UNSUCCESSFUL" &&
//               e.reason === `${orderId}:${latestState}`
//           );

//           if (!alreadyLogged) {
//             addEvent(
//               booking,
//               "PAYMENT_ATTEMPT_UNSUCCESSFUL",
//               "PENDING_PAYMENT",
//               "PENDING_PAYMENT",
//               `${orderId}:${latestState}`
//             );
//           }
//         }

//         await booking.save({ session });
//       }

//       outcome = {
//         confirmed: false,
//         bookingId: booking.bookingId,
//         bookingStatus: booking.status,
//         paymentStatus: booking.payment.status,
//         gatewayOrderStatus: verified.orderStatus,
//         retryAfterSeconds: 10,
//       };

//       return;
//     }

//     /* =================================================
//        CASE 3: TERMINAL FAILURE / EXPIRED ORDER

//        Gateway confirmed that the order can no
//        longer be completed and there is no
//        successful or pending payment.
//     ================================================= */

//     if (verified.terminal) {
//       /*
//         Don't undo a booking that has already
//         been confirmed by another successful
//         payment attempt.
//       */

//       if (
//         booking.status !== "PENDING_PAYMENT" ||
//         booking.payment.status === "SUCCESS"
//       ) {
//         outcome = {
//           confirmed: booking.status === "CONFIRMED",
//           bookingId: booking.bookingId,
//           bookingStatus: booking.status,
//           paymentStatus: booking.payment.status,
//           gatewayOrderStatus: verified.orderStatus,
//         };

//         return;
//       }

//       attempt.status = "FAILED";
//       attempt.verifiedAt = new Date();
//       attempt.failureReason =
//         `Cashfree order ${verified.orderStatus}`;

//       booking.payment.status = "FAILED";

//       const slot = await InterviewSlot.findOne({
//         _id: booking.slotId,
//         status: "HELD",
//         "reservation.bookingId": booking._id,
//       }).session(session);

//       /*
//         Before releasing, ensure there are
//         no other unresolved payment orders
//         associated with the same booking.

//         This prevents releasing a slot while
//         another payment might succeed.
//       */

//       const otherUnresolved = booking.paymentAttempts.some(
//         (item) =>
//           item.gatewayOrderId !== orderId &&
//           ["CREATED", "PENDING"].includes(item.status)
//       );

//       if (otherUnresolved) {
//         booking.payment.status = "PENDING";

//         addEvent(
//           booking,
//           "PAYMENT_ATTEMPT_FAILED",
//           oldStatus,
//           oldStatus,
//           `Order ${orderId} ended unsuccessfully; another attempt remains unresolved`
//         );

//         await booking.save({ session });

//         outcome = {
//           confirmed: false,
//           bookingId: booking.bookingId,
//           bookingStatus: booking.status,
//           paymentStatus: "PENDING",
//           gatewayOrderStatus: verified.orderStatus,
//         };

//         return;
//       }

//       /*
//         The original slot may have been
//         blocked/deactivated while payment
//         was pending. Never make a deleted or
//         inactive slot publicly available.
//       */

//       if (slot) {
//         const reopen =
//           slot.active &&
//           !slot.isDeleted &&
//           slot.startTime > new Date();

//         const updated = await InterviewSlot.updateOne(
//           {
//             _id: slot._id,
//             status: "HELD",
//             "reservation.bookingId": booking._id,
//           },
//           reopen
//             ? releaseReservationUpdate
//             : {
//                 $set: {
//                   status: "BLOCKED",
//                   reservation: clearReservation(),
//                 },
//               },
//           { session }
//         );

//         if (updated.modifiedCount !== 1) {
//           fail(
//             409,
//             "Could not safely release failed payment reservation"
//           );
//         }
//       }

//       booking.status =
//         verified.orderStatus === "EXPIRED"
//           ? "EXPIRED"
//           : "PAYMENT_FAILED";

//       addEvent(
//         booking,
//         "PAYMENT_FINAL_FAILURE",
//         oldStatus,
//         booking.status,
//         `Cashfree order ${orderId}: ${verified.orderStatus}`
//       );

//       await booking.save({ session });

//       outcome = {
//         confirmed: false,
//         bookingId: booking.bookingId,
//         bookingStatus: booking.status,
//         paymentStatus: "FAILED",
//         gatewayOrderStatus: verified.orderStatus,
//         slotReleased: Boolean(slot),
//       };
//     }
//   });

//   /*
//     External email delivery happens only
//     after transaction success.

//     Sending email is not part of the payment
//     transaction and cannot undo payment.
//   */

//   if (outcome.newlyConfirmed) {
//     await notifyConfirmedBooking(outcome.bookingId);
//   }

//   return outcome;
// }

// /* =========================================================
//    CASHFREE WEBHOOK SIGNATURE VERIFICATION

//    index.js registers this endpoint before
//    express.json() using express.raw().
// ========================================================= */

// function verifyCashfreeWebhook(req) {
//   const signature = req.get("x-webhook-signature");
//   const timestamp = req.get("x-webhook-timestamp");

//   const secret = process.env.CASHFREE_SECRET_KEY;

//   if (!signature || !timestamp || !secret) {
//     fail(401, "Missing webhook authentication");
//   }

//   if (!Buffer.isBuffer(req.body)) {
//     fail(
//       400,
//       "Webhook request must contain raw body"
//     );
//   }

//   const expected = crypto
//     .createHmac("sha256", secret)
//     .update(timestamp + req.body.toString("utf8"))
//     .digest("base64");

//   const actualBuffer = Buffer.from(
//     String(signature),
//     "utf8"
//   );

//   const expectedBuffer = Buffer.from(
//     expected,
//     "utf8"
//   );

//   if (
//     actualBuffer.length !== expectedBuffer.length ||
//     !crypto.timingSafeEqual(
//       actualBuffer,
//       expectedBuffer
//     )
//   ) {
//     fail(401, "Invalid Cashfree webhook signature");
//   }
// }

// /* =========================================================
//    CASHFREE WEBHOOK

//    POST /api/interviews/payment/cashfree/webhook

//    No JWT required.

//    Signature verification is mandatory.
// ========================================================= */

// export const interviewCashfreeWebhook = wrap(
//   async (req, res) => {
//     verifyCashfreeWebhook(req);

//     let event;

//     try {
//       event = JSON.parse(
//         req.body.toString("utf8")
//       );
//     } catch {
//       fail(400, "Invalid webhook JSON");
//     }

//     const orderId = event?.data?.order?.order_id;

//     if (!orderId) {
//       return res.status(200).json({
//         success: true,
//         ignored: true,
//       });
//     }

//     const type = normalize(event.type);

//     console.log(
//       "[INTERVIEW WEBHOOK]",
//       {
//         type,
//         orderId,
//       }
//     );

//     /*
//       All relevant webhook types trigger the
//       same authoritative gateway verification.

//       We do not directly trust the webhook event.
//     */

//     const relevantEvents = new Set([
//       "PAYMENT_SUCCESS_WEBHOOK",
//       "PAYMENT_FAILED_WEBHOOK",
//       "PAYMENT_USER_DROPPED_WEBHOOK",
//     ]);

//     if (!relevantEvents.has(type)) {
//       return res.status(200).json({
//         success: true,
//         ignored: true,
//         eventType: type,
//       });
//     }

//     const outcome =
//       await finalizeInterviewPayment(orderId);

//     console.log(
//       "[INTERVIEW WEBHOOK RESULT]",
//       {
//         orderId,
//         bookingStatus: outcome.bookingStatus,
//         paymentStatus: outcome.paymentStatus,
//         confirmed: outcome.confirmed,
//       }
//     );

//     return res.status(200).json({
//       success: true,
//       data: outcome,
//     });
//   }
// );

// /* =========================================================
//    RECONCILE PAYMENT

//    POST /api/interviews/bookings/:id/reconcile

//    Called by frontend after Cashfree checkout
//    returns, and can be called by admin/owner.
// ========================================================= */

// export const reconcileInterviewPayment = wrap(
//   async (req, res) => {
//     const booking = await InterviewBooking.findOne({
//       bookingId: req.params.id,
//     });

//     if (!booking) {
//       fail(404, "Interview booking not found");
//     }

//     assertBookingOwner(req, booking);

//     const orderId = booking.payment.gatewayOrderId;

//     if (!orderId) {
//       return res.json({
//         success: true,
//         data: bookingResult(booking, {
//           message: "Payment has not been initiated",
//         }),
//       });
//     }

//     const outcome =
//       await finalizeInterviewPayment(orderId);

//     const updated = await InterviewBooking.findById(
//       booking._id
//     );

//     return res.json({
//       success: true,
//       message: "Payment status verified",
//       data: {
//         ...outcome,
//         status: updated.status,
//         paymentStatus: updated.payment.status,
//         refundStatus: updated.refund?.status,
//       },
//     });
//   }
// );

// /* =========================================================
//    ADMIN: INITIATE CASHFREE REFUND

//    POST /api/interviews/admin/bookings/:id/refund

//    Refund eligibility must be checked separately
//    according to your cancellation policy.
// ========================================================= */

// export const initiateInterviewRefund = wrap(
//   async (req, res) => {
//     requireAdmin(req);

//     const booking = await InterviewBooking.findOne({
//       bookingId: req.params.id,
//     });

//     if (!booking) {
//       fail(404, "Interview booking not found");
//     }

//     if (
//       booking.payment.status !== "SUCCESS" ||
//       booking.refund?.status !== "PENDING"
//     ) {
//       fail(
//         409,
//         "Booking does not have a pending paid refund"
//       );
//     }

//     const orderId = booking.payment.gatewayOrderId;

//     if (!orderId) {
//       fail(409, "Gateway order ID missing");
//     }

//     const refundAmount = Number(
//       booking.refund.amount
//     );

//     if (
//       !Number.isFinite(refundAmount) ||
//       refundAmount <= 0 ||
//       refundAmount >
//         Number(booking.slotSnapshot.price)
//     ) {
//       fail(400, "Invalid refund amount");
//     }

//     /*
//       Reuse an existing refund ID, so retries
//       do not create different refund requests.
//     */

//     const refundId =
//       booking.refund.gatewayRefundId ||
//       makeId("INTREF").slice(0, 40);

//     const claimed = await InterviewBooking.findOneAndUpdate(
//       {
//         _id: booking._id,
//         "refund.status": "PENDING",
//       },
//       {
//         $set: {
//           "refund.status": "PROCESSING",
//           "refund.gatewayRefundId": refundId,
//           "refund.initiatedAt": new Date(),
//         },
//       },
//       { new: true }
//     );

//     if (!claimed) {
//       fail(
//         409,
//         "Refund is already being processed"
//       );
//     }

//     try {
//       const response = await cashfreeCreateRefund({
//         orderId,
//         refundId,
//         amount: refundAmount,
//         reason:
//           booking.refund.reason ||
//           "Interview booking cancellation",
//       });

//       console.log(
//         "[INTERVIEW REFUND REQUESTED]",
//         {
//           bookingId: booking.bookingId,
//           refundId,
//           gatewayStatus: response.refund_status,
//         }
//       );

//       /*
//         Do not assume the refund has reached
//         the customer just because Cashfree
//         accepted the refund request.
//       */

//       return res.json({
//         success: true,
//         message:
//           "Refund initiation request submitted to Cashfree",
//         data: {
//           bookingId: booking.bookingId,
//           refundId,
//           refundAmount,
//           gatewayStatus: response.refund_status,
//           refundStatus: "PROCESSING",
//         },
//       });
//     } catch (error) {
//       console.error(
//         "[INTERVIEW REFUND INITIATION]",
//         getHttpError(error)
//       );

//       /*
//         A request timeout may happen after the
//         gateway accepted the refund.

//         Keep the same refund ID and verify it
//         before another initiation attempt.
//       */

//       fail(
//         502,
//         "Refund initiation result is uncertain. Verify the refund with Cashfree before retrying."
//       );
//     }
//   }
// );

// /* =========================================================
//    ADMIN: VERIFY REFUND STATUS

//    GET /api/interviews/admin/bookings/:id/refund
// ========================================================= */

// export const syncInterviewRefund = wrap(
//   async (req, res) => {
//     requireAdmin(req);

//     const booking = await InterviewBooking.findOne({
//       bookingId: req.params.id,
//     });

//     if (!booking) {
//       fail(404, "Interview booking not found");
//     }

//     const orderId =
//       booking.payment.gatewayOrderId;

//     const refundId =
//       booking.refund?.gatewayRefundId;

//     if (!orderId || !refundId) {
//       fail(404, "Refund has not been initiated");
//     }

//     const refund = await cashfreeGetRefund({
//       orderId,
//       refundId,
//     });

//     const gatewayStatus = normalize(
//       refund.refund_status
//     );

//     const statusMap = {
//       SUCCESS: "SUCCESS",
//       PENDING: "PROCESSING",
//       ONHOLD: "PROCESSING",
//       FAILED: "FAILED",
//       CANCELLED: "FAILED",
//     };

//     const refundStatus =
//       statusMap[gatewayStatus] || "PROCESSING";

//     const update = {
//       "refund.status": refundStatus,
//     };

//     if (refundStatus === "SUCCESS") {
//       update["refund.completedAt"] = new Date();
//       update["refund.failureReason"] = null;
//     }

//     if (refundStatus === "FAILED") {
//       update["refund.failureReason"] =
//         refund.status_description ||
//         "Gateway reported refund failure";
//     }

//     await InterviewBooking.updateOne(
//       {
//         _id: booking._id,
//         "refund.gatewayRefundId": refundId,
//       },
//       {
//         $set: update,
//       }
//     );

//     return res.json({
//       success: true,
//       message: "Refund status synchronized",
//       data: {
//         bookingId: booking.bookingId,
//         refundId,
//         refundStatus,
//         gatewayStatus,
//       },
//     });
//   }
// );

import crypto from "crypto";

import {
  InterviewSlot,
  InterviewBooking,
  wrap,
  fail,
  makeId,
  addEvent,
  withTransaction,
  releaseReservationUpdate,
  requireAdmin,
} from "../services/interviewCommon.js";

import {
  cashfreeCreateOrder,
  cashfreeGetOrder,
  cashfreeGetPayments,
  cashfreeCreateRefund,
  cashfreeGetRefund,
} from "../services/interviewCashfree.js";

import {
  sendInterviewConfirmation,
} from "../services/interviewMail.js";

const GATEWAY = "CASHFREE";

const TERMINAL_ORDER_STATUSES =
  new Set(["EXPIRED", "TERMINATED"]);

const TERMINAL_ATTEMPT_STATUSES =
  new Set([
    "FAILED",
    "USER_DROPPED",
    "CANCELLED",
  ]);

const normalize = (value) =>
  String(value ?? "").trim().toUpperCase();

const isValidAmount = (first, second) =>
  Math.abs(
    Number(first) - Number(second)
  ) < 0.001;

const cleanOrderId = (orderId) => {
  const value =
    String(orderId ?? "").trim();

  if (!value || value.length > 100) {
    fail(400, "Invalid gateway order ID");
  }

  return value;
};

const getAttempt = (booking, orderId) =>
  (booking.paymentAttempts || []).find(
    (item) =>
      item.gatewayOrderId === orderId
  );

const clearReservation = () => ({
  bookingId: null,
  heldAt: null,
  expiresAt: null,
  bookedAt: null,
});

const bookingResult = (
  booking,
  extra = {}
) => ({
  bookingId: booking.bookingId,
  status: booking.status,
  paymentStatus:
    booking.payment?.status,
  refundStatus:
    booking.refund?.status ||
    "NOT_REQUIRED",
  ...extra,
});

/* ==========================================
   VERIFIED CASHFREE STATE

   Payment results must come from Cashfree.
   Never trust the frontend's status.
========================================== */

async function getVerifiedGatewayState(
  orderId
) {
  const id = cleanOrderId(orderId);

  const order =
    await cashfreeGetOrder(id);

  if (order?.order_id !== id) {
    throw new Error(
      "Cashfree order ID mismatch"
    );
  }

  const rawPayments =
    await cashfreeGetPayments(id);

  const payments =
    Array.isArray(rawPayments)
      ? rawPayments
      : [];

  const orderStatus = normalize(
    order.order_status
  );

  const successfulPayment =
    payments.find(
      (payment) =>
        normalize(
          payment.payment_status
        ) === "SUCCESS"
    );

  const hasPendingPayment =
    payments.some(
      (payment) =>
        normalize(
          payment.payment_status
        ) === "PENDING"
    );

  const latestPayment =
    [...payments].sort(
      (a, b) =>
        new Date(
          b.payment_time || 0
        ).getTime() -
        new Date(
          a.payment_time || 0
        ).getTime()
    )[0];

  const paid =
    orderStatus === "PAID" &&
    Boolean(successfulPayment);

  const terminal =
    !paid &&
    TERMINAL_ORDER_STATUSES.has(
      orderStatus
    ) &&
    !hasPendingPayment &&
    !successfulPayment;

  return {
    order,
    payments,
    orderStatus,
    successfulPayment,
    latestPayment,
    hasPendingPayment,
    paid,
    terminal,
    pending: !paid && !terminal,
  };
}

/* ==========================================
   VALIDATE PAYMENT AMOUNT
========================================== */

function validateVerifiedAmount(
  booking,
  attempt,
  gateway
) {
  if (
    !isValidAmount(
      gateway.order.order_amount,
      attempt.amount
    )
  ) {
    throw new Error(
      "Cashfree order amount does not match booking amount"
    );
  }

  if (
    normalize(
      gateway.order.order_currency
    ) !==
    normalize(attempt.currency)
  ) {
    throw new Error(
      "Cashfree currency does not match booking currency"
    );
  }

  if (
    !isValidAmount(
      attempt.amount,
      booking.slotSnapshot.price
    )
  ) {
    throw new Error(
      "Payment attempt does not match booking price snapshot"
    );
  }

  if (gateway.paid) {
    const payment =
      gateway.successfulPayment;

    if (
      payment?.payment_amount != null &&
      !isValidAmount(
        payment.payment_amount,
        attempt.amount
      )
    ) {
      throw new Error(
        "Successful transaction amount mismatch"
      );
    }

    if (
      payment?.payment_currency &&
      normalize(
        payment.payment_currency
      ) !==
        normalize(attempt.currency)
    ) {
      throw new Error(
        "Successful transaction currency mismatch"
      );
    }
  }
}

/* ==========================================
   SEND CONFIRMATION EMAIL
========================================== */

async function notifyConfirmedBooking(
  bookingId
) {
  const booking =
    await InterviewBooking.findOne({
      bookingId,
      status: "CONFIRMED",
    });

  if (!booking) return;

  if (!booking.meeting?.url) {
    console.log(
      `[INTERVIEW] ${bookingId}: meeting URL missing; confirmation email deferred`
    );
    return;
  }

  if (
    booking.notifications
      ?.confirmationSentAt
  ) {
    return;
  }

  try {
    const results =
      await sendInterviewConfirmation(
        booking
      );

    const candidateSent =
      results?.[0]?.status ===
        "fulfilled" &&
      Boolean(results[0].value);

    if (candidateSent) {
      await InterviewBooking.updateOne(
        {
          _id: booking._id,
          status: "CONFIRMED",
          "notifications.confirmationSentAt":
            null,
        },
        {
          $set: {
            "notifications.confirmationSentAt":
              new Date(),
          },
        }
      );
    }

    for (
      const [index, result]
      of (results || []).entries()
    ) {
      if (
        result.status === "rejected"
      ) {
        console.error(
          `[INTERVIEW] Confirmation email ${index} failed:`,
          result.reason
        );
      }
    }
  } catch (error) {
    console.error(
      "[INTERVIEW] Confirmation email error:",
      error.message
    );
  }
}

/* ==========================================
   CREATE PUBLIC CASHFREE PAYMENT

   POST /api/interviews/bookings/:id/payment

   No account JWT required.

   Price is loaded from the booking snapshot.
========================================== */

export const createInterviewPayment =
  wrap(async (req, res) => {
    const booking =
      await InterviewBooking.findOne({
        bookingId: req.params.id,
        status: "PENDING_PAYMENT",
      });

    if (!booking) {
      fail(
        404,
        "Pending interview booking not found"
      );
    }

    const now = new Date();

    const holdExpiry = new Date(
      booking.holdExpiresAt
    );

    const remainingMs =
      holdExpiry.getTime() -
      now.getTime();

    if (
      !booking.holdExpiresAt ||
      Number.isNaN(
        holdExpiry.getTime()
      ) ||
      remainingMs <= 0
    ) {
      fail(
        409,
        "Interview reservation expired. Please book an available slot again."
      );
    }

    if (remainingMs < 15000) {
      fail(
        409,
        "Less than 15 seconds remain. Please select the slot again."
      );
    }

    const slot =
      await InterviewSlot.findOne({
        _id: booking.slotId,
        status: "HELD",
        active: true,
        isDeleted: false,

        "reservation.bookingId":
          booking._id,

        "reservation.expiresAt": {
          $gt: now,
        },
      });

    if (!slot) {
      fail(
        409,
        "This interview slot is no longer reserved for your booking."
      );
    }

    const amount = Number(
      booking.slotSnapshot?.price
    );

    const currency = String(
      booking.slotSnapshot
        ?.currency || "INR"
    ).toUpperCase();

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      Math.abs(
        amount * 100 -
        Math.round(amount * 100)
      ) > 0.000001
    ) {
      fail(
        400,
        "Invalid interview booking amount"
      );
    }

    if (currency !== "INR") {
      fail(
        400,
        "Interview payments only support INR"
      );
    }

    /* Validate Cashfree customer details */

    const candidate =
      booking.candidate || {};

    const customerName = String(
      candidate.name || ""
    ).trim();

    const customerEmail = String(
      candidate.email || ""
    ).trim();

    let customerPhone = String(
      candidate.phone || ""
    ).replace(/[\s()+-]/g, "");

    if (
      customerPhone.length === 12 &&
      customerPhone.startsWith("91")
    ) {
      customerPhone =
        customerPhone.slice(2);
    }

    if (
      !customerName ||
      customerName.length > 120
    ) {
      fail(
        400,
        "Invalid candidate name"
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        customerEmail
      )
    ) {
      fail(
        400,
        "Invalid candidate email"
      );
    }

    if (
      !/^[6-9]\d{9}$/.test(
        customerPhone
      )
    ) {
      fail(
        400,
        "A valid 10-digit mobile number is required"
      );
    }

    /* Prevent duplicate unresolved orders */

    const unresolvedAttempt =
      (
        booking.paymentAttempts ||
        []
      ).find(
        (attempt) =>
          [
            "CREATED",
            "PENDING",
            "SUCCESS",
          ].includes(
            normalize(attempt.status)
          )
      );

    if (unresolvedAttempt) {
      fail(
        409,
        "A previous payment order requires verification. Please check payment status before trying again."
      );
    }

    const orderId =
      makeId("INTPAY").slice(
        0,
        45
      );

    const attemptId =
      makeId("ATT");

    /* Atomic payment initialization */

    const reserved =
      await InterviewBooking.findOneAndUpdate(
        {
          _id: booking._id,
          status: "PENDING_PAYMENT",

          holdExpiresAt: {
            $gt: new Date(
              Date.now() + 15000
            ),
          },

          "payment.status": {
            $in: [
              "NOT_STARTED",
              "FAILED",
            ],
          },

          paymentAttempts: {
            $not: {
              $elemMatch: {
                status: {
                  $in: [
                    "CREATED",
                    "PENDING",
                    "SUCCESS",
                  ],
                },
              },
            },
          },
        },
        {
          $set: {
            "payment.status":
              "CREATED",

            "payment.gateway":
              GATEWAY,

            "payment.gatewayOrderId":
              orderId,

            "payment.latestAttemptId":
              attemptId,
          },

          $push: {
            paymentAttempts: {
              attemptId,
              gateway: GATEWAY,
              gatewayOrderId:
                orderId,
              amount,
              currency,
              status: "CREATED",
              createdAt:
                new Date(),
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!reserved) {
      fail(
        409,
        "Payment initialization is already in progress or your reservation has almost expired."
      );
    }

    /* Reset only definitively failed order creation */

    async function markAttemptFailed(
      reason
    ) {
      const update =
        await InterviewBooking.updateOne(
          {
            _id: booking._id,
            status:
              "PENDING_PAYMENT",

            "payment.gatewayOrderId":
              orderId,

            "payment.latestAttemptId":
              attemptId,

            "payment.status":
              "CREATED",

            paymentAttempts: {
              $elemMatch: {
                attemptId,
                gatewayOrderId:
                  orderId,
                status: "CREATED",
              },
            },
          },
          {
            $set: {
              "payment.status":
                "FAILED",

              "paymentAttempts.$[attempt].status":
                "FAILED",

              "paymentAttempts.$[attempt].verifiedAt":
                new Date(),

              "paymentAttempts.$[attempt].failureReason":
                String(reason).slice(
                  0,
                  250
                ),
            },

            $unset: {
              "payment.gatewayOrderId":
                "",

              "payment.latestAttemptId":
                "",
            },
          },
          {
            arrayFilters: [
              {
                "attempt.attemptId":
                  attemptId,

                "attempt.gatewayOrderId":
                  orderId,

                "attempt.status":
                  "CREATED",
              },
            ],
          }
        );

      if (
        update.modifiedCount !== 1
      ) {
        console.error(
          "[INTERVIEW] Failed to reset rejected payment attempt",
          {
            bookingId:
              booking.bookingId,
            orderId,
          }
        );

        return false;
      }

      return true;
    }

    /* Create Cashfree order */

    let gatewayOrder;

    try {
      gatewayOrder =
        await cashfreeCreateOrder({
          orderId,
          amount,
          currency,
          customer:
            booking.candidate,
          bookingId:
            booking.bookingId,
          holdExpiresAt:
            booking.holdExpiresAt,
        });
    } catch (error) {
      const httpStatus = Number(
        error.response?.status || 0
      );

      const gatewayCode = String(
        error.response?.data
          ?.code || ""
      ).trim();

      const message =
        error.response?.data
          ?.message ||
        error.message ||
        "Payment initialization failed";

      console.error(
        "[INTERVIEW] Cashfree order creation failed",
        {
          bookingId:
            booking.bookingId,
          orderId,
          httpStatus,
          gatewayCode,
          message,
          requestAttempted:
            error.cashfreeRequestAttempted ===
            true,
        }
      );

      if (
        error.cashfreeRequestAttempted !==
          true &&
        !error.response
      ) {
        const reset =
          await markAttemptFailed(
            `Local initialization error: ${message}`
          );

        if (!reset) {
          fail(
            502,
            "Payment state could not be reset. Please check booking status."
          );
        }

        fail(409, message);
      }

      const rejectedCodes =
        new Set([
          "order_expiry_time_invalid",
          "order_amount_invalid",
          "order_currency_invalid",
          "customer_details_invalid",
        ]);

      const definitelyRejected =
        httpStatus === 400 &&
        rejectedCodes.has(
          gatewayCode
        );

      if (definitelyRejected) {
        const reset =
          await markAttemptFailed(
            `Cashfree rejected order: ${gatewayCode}`
          );

        if (!reset) {
          fail(
            502,
            "Cashfree rejected payment but the booking could not be reset safely."
          );
        }

        fail(
          502,
          "Cashfree rejected payment initialization. Please try again while your reservation is active."
        );
      }

      /*
        Network errors are uncertain.
        The Cashfree order may already exist.
      */

      fail(
        502,
        "Payment initialization could not be verified. Your booking has been retained for payment verification."
      );
    }

    if (
      gatewayOrder?.order_id !==
        orderId ||
      !gatewayOrder?.payment_session_id
    ) {
      console.error(
        "[INTERVIEW] Unexpected Cashfree response",
        {
          bookingId:
            booking.bookingId,
          orderId,
          returnedOrderId:
            gatewayOrder?.order_id,
          hasSession:
            Boolean(
              gatewayOrder
                ?.payment_session_id
            ),
        }
      );

      fail(
        502,
        "Cashfree did not return a valid checkout session. Please verify the payment order before retrying."
      );
    }

    /* Persist Cashfree session */

    try {
      const result =
        await InterviewBooking.updateOne(
          {
            _id: booking._id,
            status:
              "PENDING_PAYMENT",

            "payment.gatewayOrderId":
              orderId,

            "payment.latestAttemptId":
              attemptId,

            "payment.status":
              "CREATED",

            paymentAttempts: {
              $elemMatch: {
                attemptId,
                gatewayOrderId:
                  orderId,
                status: "CREATED",
              },
            },
          },
          {
            $set: {
              "payment.status":
                "PENDING",

              "paymentAttempts.$[attempt].status":
                "PENDING",
            },
          },
          {
            arrayFilters: [
              {
                "attempt.attemptId":
                  attemptId,

                "attempt.gatewayOrderId":
                  orderId,

                "attempt.status":
                  "CREATED",
              },
            ],
          }
        );

      if (
        result.modifiedCount !== 1
      ) {
        const latest =
          await InterviewBooking.findById(
            booking._id
          ).select(
            "status payment.status payment.gatewayOrderId"
          );

        const stillOwned =
          latest?.status ===
            "PENDING_PAYMENT" &&
          latest?.payment
            ?.gatewayOrderId ===
            orderId &&
          latest?.payment
            ?.status ===
            "PENDING";

        if (!stillOwned) {
          fail(
            409,
            "Booking state changed during payment initialization. Please verify the booking."
          );
        }
      }
    } catch (error) {
      console.error(
        "[INTERVIEW] Failed to persist payment session",
        {
          bookingId:
            booking.bookingId,
          orderId,
          message:
            error.message,
        }
      );

      throw error;
    }

    return res.status(201).json({
      success: true,

      message:
        "Interview Cashfree payment session created",

      data: {
        bookingId:
          booking.bookingId,

        orderId,

        paymentSessionId:
          gatewayOrder
            .payment_session_id,

        gateway: GATEWAY,
        amount,
        currency,

        holdExpiresAt:
          booking.holdExpiresAt,

        remainingSeconds:
          Math.max(
            0,
            Math.ceil(
              (
                holdExpiry.getTime() -
                Date.now()
              ) / 1000
            )
          ),
      },
    });
  });

/* ==========================================
   FINALIZE VERIFIED INTERVIEW PAYMENT

   Called by:
   - Cashfree webhook
   - Public reconciliation endpoint
   - Internal payment reconciliation job

   No 10-minute restriction.
========================================== */

export async function finalizeInterviewPayment(
  orderId
) {
  const verified =
    await getVerifiedGatewayState(
      orderId
    );

  let outcome = {
    confirmed: false,
    paymentStatus: "PENDING",
    gatewayOrderStatus:
      verified.orderStatus,
  };

  await withTransaction(
    async (session) => {
      const booking =
        await InterviewBooking.findOne({
          "paymentAttempts.gatewayOrderId":
            orderId,
        }).session(session);

      if (!booking) {
        fail(
          404,
          "Payment order does not match a booking"
        );
      }

      const attempt =
        getAttempt(
          booking,
          orderId
        );

      if (!attempt) {
        fail(
          404,
          "Payment attempt not found"
        );
      }

      validateVerifiedAmount(
        booking,
        attempt,
        verified
      );

      const oldStatus =
        booking.status;

      /* ======================================
         SUCCESSFUL CASHFREE PAYMENT
      ====================================== */

      if (verified.paid) {
        const paymentId =
          String(
            verified
              .successfulPayment
              .cf_payment_id ||
              ""
          );

        if (
          booking.status ===
            "CONFIRMED" &&
          booking.payment.status ===
            "SUCCESS"
        ) {
          outcome = {
            confirmed: true,
            bookingId:
              booking.bookingId,
            paymentStatus:
              "SUCCESS",
            bookingStatus:
              "CONFIRMED",
            alreadyConfirmed:
              true,
            gatewayOrderStatus:
              verified.orderStatus,
          };

          return;
        }

        attempt.status =
          "SUCCESS";

        attempt.gatewayPaymentId =
          paymentId;

        attempt.paidAt =
          new Date();

        attempt.verifiedAt =
          new Date();

        booking.payment.status =
          "SUCCESS";

        booking.payment.gateway =
          GATEWAY;

        booking.payment.gatewayOrderId =
          orderId;

        booking.payment.gatewayPaymentId =
          paymentId;

        booking.payment.successfulAttemptId =
          attempt.attemptId;

        booking.payment.paidAt =
          new Date();

        const slot =
          await InterviewSlot.findOne({
            _id: booking.slotId,
            status: "HELD",
            active: true,
            isDeleted: false,

            "reservation.bookingId":
              booking._id,
          }).session(session);

        /*
          Late payment or reservation released.
          Preserve the payment and flag a refund.
        */

        if (
          oldStatus !==
            "PENDING_PAYMENT" ||
          !slot
        ) {
          if (
            ![
              "PENDING",
              "PROCESSING",
              "SUCCESS",
            ].includes(
              booking.refund
                ?.status
            )
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
              "Payment succeeded after interview reservation became unavailable";
          }

          addEvent(
            booking,
            "LATE_PAYMENT_REFUND_REQUIRED",
            oldStatus,
            oldStatus,
            "Verified payment cannot be attached to an available reservation"
          );

          await booking.save({
            session,
          });

          outcome = {
            confirmed: false,
            bookingId:
              booking.bookingId,
            bookingStatus:
              booking.status,
            paymentStatus:
              "SUCCESS",
            refundRequired:
              true,
            refundStatus:
              booking.refund
                .status,
            gatewayOrderStatus:
              verified.orderStatus,
          };

          return;
        }

        const updatedSlot =
          await InterviewSlot.updateOne(
            {
              _id: slot._id,
              status: "HELD",
              "reservation.bookingId":
                booking._id,
            },
            {
              $set: {
                status: "BOOKED",
                "reservation.bookedAt":
                  new Date(),
                "reservation.expiresAt":
                  null,
              },
            },
            { session }
          );

        if (
          updatedSlot.modifiedCount !==
          1
        ) {
          fail(
            409,
            "Unable to confirm reservation ownership"
          );
        }

        booking.status =
          "CONFIRMED";

        booking.confirmedAt =
          new Date();

        addEvent(
          booking,
          "PAYMENT_CONFIRMED",
          oldStatus,
          "CONFIRMED",
          "Cashfree payment verified successfully"
        );

        await booking.save({
          session,
        });

        outcome = {
          confirmed: true,
          newlyConfirmed: true,
          bookingId:
            booking.bookingId,
          bookingStatus:
            "CONFIRMED",
          paymentStatus:
            "SUCCESS",
          gatewayOrderStatus:
            verified.orderStatus,
        };

        return;
      }

      /* ======================================
         CASHFREE ORDER STILL PENDING
      ====================================== */

      if (verified.pending) {
        const latestState =
          normalize(
            verified.latestPayment
              ?.payment_status
          );

        if (
          booking.status ===
          "PENDING_PAYMENT"
        ) {
          if (
            [
              "CREATED",
              "NOT_STARTED",
              "PENDING",
            ].includes(
              booking.payment
                .status
            )
          ) {
            booking.payment.status =
              "PENDING";
          }

          if (
            attempt.status !==
            "SUCCESS"
          ) {
            attempt.status =
              "PENDING";
          }

          if (
            latestState ===
              "FAILED" ||
            TERMINAL_ATTEMPT_STATUSES
              .has(latestState)
          ) {
            const alreadyLogged =
              (
                booking.events ||
                []
              ).some(
                (event) =>
                  event.type ===
                    "PAYMENT_ATTEMPT_UNSUCCESSFUL" &&
                  event.reason ===
                    `${orderId}:${latestState}`
              );

            if (!alreadyLogged) {
              addEvent(
                booking,
                "PAYMENT_ATTEMPT_UNSUCCESSFUL",
                "PENDING_PAYMENT",
                "PENDING_PAYMENT",
                `${orderId}:${latestState}`
              );
            }
          }

          await booking.save({
            session,
          });
        }

        outcome = {
          confirmed: false,
          bookingId:
            booking.bookingId,
          bookingStatus:
            booking.status,
          paymentStatus:
            booking.payment
              .status,
          gatewayOrderStatus:
            verified.orderStatus,
          retryAfterSeconds:
            10,
        };

        return;
      }

      /* ======================================
         CASHFREE ORDER FAILED / EXPIRED
      ====================================== */

      if (verified.terminal) {
        if (
          booking.status !==
            "PENDING_PAYMENT" ||
          booking.payment.status ===
            "SUCCESS"
        ) {
          outcome = {
            confirmed:
              booking.status ===
              "CONFIRMED",
            bookingId:
              booking.bookingId,
            bookingStatus:
              booking.status,
            paymentStatus:
              booking.payment.status,
            gatewayOrderStatus:
              verified.orderStatus,
          };

          return;
        }

        attempt.status =
          "FAILED";

        attempt.verifiedAt =
          new Date();

        attempt.failureReason =
          `Cashfree order ${verified.orderStatus}`;

        booking.payment.status =
          "FAILED";

        const slot =
          await InterviewSlot.findOne({
            _id: booking.slotId,
            status: "HELD",
            "reservation.bookingId":
              booking._id,
          }).session(session);

        const otherUnresolved =
          booking.paymentAttempts.some(
            (item) =>
              item.gatewayOrderId !==
                orderId &&
              [
                "CREATED",
                "PENDING",
              ].includes(
                item.status
              )
          );

        if (otherUnresolved) {
          booking.payment.status =
            "PENDING";

          addEvent(
            booking,
            "PAYMENT_ATTEMPT_FAILED",
            oldStatus,
            oldStatus,
            `Order ${orderId} ended unsuccessfully; another attempt remains unresolved`
          );

          await booking.save({
            session,
          });

          outcome = {
            confirmed: false,
            bookingId:
              booking.bookingId,
            bookingStatus:
              booking.status,
            paymentStatus:
              "PENDING",
            gatewayOrderStatus:
              verified.orderStatus,
          };

          return;
        }

        if (slot) {
          const reopen =
            slot.active &&
            !slot.isDeleted &&
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

              reopen
                ? releaseReservationUpdate
                : {
                    $set: {
                      status:
                        "BLOCKED",
                      reservation:
                        clearReservation(),
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
              "Could not safely release failed payment reservation"
            );
          }
        }

        booking.status =
          verified.orderStatus ===
          "EXPIRED"
            ? "EXPIRED"
            : "PAYMENT_FAILED";

        addEvent(
          booking,
          "PAYMENT_FINAL_FAILURE",
          oldStatus,
          booking.status,
          `Cashfree order ${orderId}: ${verified.orderStatus}`
        );

        await booking.save({
          session,
        });

        outcome = {
          confirmed: false,
          bookingId:
            booking.bookingId,
          bookingStatus:
            booking.status,
          paymentStatus:
            "FAILED",
          gatewayOrderStatus:
            verified.orderStatus,
          slotReleased:
            Boolean(slot),
        };
      }
    }
  );

  if (outcome.newlyConfirmed) {
    await notifyConfirmedBooking(
      outcome.bookingId
    );
  }

  return outcome;
}

/* ==========================================
   CASHFREE WEBHOOK SIGNATURE VALIDATION
========================================== */

function verifyCashfreeWebhook(req) {
  const signature =
    req.get("x-webhook-signature");

  const timestamp =
    req.get("x-webhook-timestamp");

  const secret =
    process.env.CASHFREE_SECRET_KEY;

  if (
    !signature ||
    !timestamp ||
    !secret
  ) {
    fail(
      401,
      "Missing webhook authentication"
    );
  }

  if (!Buffer.isBuffer(req.body)) {
    fail(
      400,
      "Webhook request must contain raw body"
    );
  }

  const expected = crypto
    .createHmac(
      "sha256",
      secret
    )
    .update(
      timestamp +
        req.body.toString(
          "utf8"
        )
    )
    .digest("base64");

  const actualBuffer =
    Buffer.from(
      String(signature),
      "utf8"
    );

  const expectedBuffer =
    Buffer.from(
      expected,
      "utf8"
    );

  if (
    actualBuffer.length !==
      expectedBuffer.length ||
    !crypto.timingSafeEqual(
      actualBuffer,
      expectedBuffer
    )
  ) {
    fail(
      401,
      "Invalid Cashfree webhook signature"
    );
  }
}

/* ==========================================
   CASHFREE WEBHOOK

   POST /api/interviews/payment/cashfree/webhook

   Registered separately in index.js.

   No account JWT.
   Cashfree signature required.
========================================== */

export const interviewCashfreeWebhook =
  wrap(async (req, res) => {
    verifyCashfreeWebhook(
      req
    );

    let event;

    try {
      event = JSON.parse(
        req.body.toString(
          "utf8"
        )
      );
    } catch {
      fail(
        400,
        "Invalid webhook JSON"
      );
    }

    const orderId =
      event?.data?.order?.order_id;

    if (!orderId) {
      return res.status(200).json({
        success: true,
        ignored: true,
      });
    }

    const type =
      normalize(event.type);

    console.log(
      "[INTERVIEW WEBHOOK]",
      {
        type,
        orderId,
      }
    );

    const relevantEvents =
      new Set([
        "PAYMENT_SUCCESS_WEBHOOK",
        "PAYMENT_FAILED_WEBHOOK",
        "PAYMENT_USER_DROPPED_WEBHOOK",
      ]);

    if (
      !relevantEvents.has(
        type
      )
    ) {
      return res.status(200).json({
        success: true,
        ignored: true,
        eventType: type,
      });
    }

    const outcome =
      await finalizeInterviewPayment(
        orderId
      );

    console.log(
      "[INTERVIEW WEBHOOK RESULT]",
      {
        orderId,
        bookingStatus:
          outcome.bookingStatus,
        paymentStatus:
          outcome.paymentStatus,
        confirmed:
          outcome.confirmed,
      }
    );

    return res.status(200).json({
      success: true,
      data: outcome,
    });
  });

/* ==========================================
   PUBLIC PAYMENT RECONCILIATION

   POST /api/interviews/bookings/:id/reconcile

   No account JWT.
   No 10-minute limit.

   Always verifies payment directly with Cashfree.
========================================== */

export const reconcileInterviewPayment =
  wrap(async (req, res) => {
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

    const orderId =
      booking.payment
        ?.gatewayOrderId;

    if (!orderId) {
      return res.json({
        success: true,
        data: bookingResult(
          booking,
          {
            message:
              "Payment has not been initiated",
          }
        ),
      });
    }

    const outcome =
      await finalizeInterviewPayment(
        orderId
      );

    const updated =
      await InterviewBooking.findById(
        booking._id
      );

    if (!updated) {
      fail(
        404,
        "Interview booking not found after verification"
      );
    }

    return res.json({
      success: true,

      message:
        "Payment status verified",

      data: {
        ...outcome,

        status:
          updated.status,

        paymentStatus:
          updated.payment.status,

        refundStatus:
          updated.refund?.status,
      },
    });
  });

/* ==========================================
   ADMIN: INITIATE CASHFREE REFUND
========================================== */

export const initiateInterviewRefund =
  wrap(async (req, res) => {
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

    if (
      booking.payment.status !==
        "SUCCESS" ||
      booking.refund?.status !==
        "PENDING"
    ) {
      fail(
        409,
        "Booking does not have a pending paid refund"
      );
    }

    const orderId =
      booking.payment
        .gatewayOrderId;

    if (!orderId) {
      fail(
        409,
        "Gateway order ID missing"
      );
    }

    const refundAmount =
      Number(
        booking.refund.amount
      );

    if (
      !Number.isFinite(
        refundAmount
      ) ||
      refundAmount <= 0 ||
      refundAmount >
        Number(
          booking.slotSnapshot.price
        )
    ) {
      fail(
        400,
        "Invalid refund amount"
      );
    }

    const refundId =
      booking.refund
        .gatewayRefundId ||
      makeId("INTREF").slice(
        0,
        40
      );

    const claimed =
      await InterviewBooking.findOneAndUpdate(
        {
          _id: booking._id,
          "refund.status":
            "PENDING",
        },
        {
          $set: {
            "refund.status":
              "PROCESSING",

            "refund.gatewayRefundId":
              refundId,

            "refund.initiatedAt":
              new Date(),
          },
        },
        {
          new: true,
        }
      );

    if (!claimed) {
      fail(
        409,
        "Refund is already being processed"
      );
    }

    try {
      const response =
        await cashfreeCreateRefund({
          orderId,
          refundId,
          amount:
            refundAmount,

          reason:
            booking.refund
              .reason ||
            "Interview booking cancellation",
        });

      console.log(
        "[INTERVIEW REFUND REQUESTED]",
        {
          bookingId:
            booking.bookingId,
          refundId,
          gatewayStatus:
            response.refund_status,
        }
      );

      return res.json({
        success: true,

        message:
          "Refund initiation request submitted to Cashfree",

        data: {
          bookingId:
            booking.bookingId,

          refundId,

          refundAmount,

          gatewayStatus:
            response.refund_status,

          refundStatus:
            "PROCESSING",
        },
      });
    } catch (error) {
      console.error(
        "[INTERVIEW REFUND INITIATION]",
        error.response?.data ||
          error.message
      );

      fail(
        502,
        "Refund initiation result is uncertain. Verify the refund with Cashfree before retrying."
      );
    }
  });

/* ==========================================
   ADMIN: SYNCHRONIZE REFUND
========================================== */

export const syncInterviewRefund =
  wrap(async (req, res) => {
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

    const orderId =
      booking.payment
        .gatewayOrderId;

    const refundId =
      booking.refund
        ?.gatewayRefundId;

    if (
      !orderId ||
      !refundId
    ) {
      fail(
        404,
        "Refund has not been initiated"
      );
    }

    const refund =
      await cashfreeGetRefund({
        orderId,
        refundId,
      });

    const gatewayStatus =
      normalize(
        refund.refund_status
      );

    const statusMap = {
      SUCCESS: "SUCCESS",
      PENDING: "PROCESSING",
      ONHOLD: "PROCESSING",
      FAILED: "FAILED",
      CANCELLED: "FAILED",
    };

    const refundStatus =
      statusMap[
        gatewayStatus
      ] || "PROCESSING";

    const update = {
      "refund.status":
        refundStatus,
    };

    if (
      refundStatus ===
      "SUCCESS"
    ) {
      update[
        "refund.completedAt"
      ] = new Date();

      update[
        "refund.failureReason"
      ] = null;
    }

    if (
      refundStatus ===
      "FAILED"
    ) {
      update[
        "refund.failureReason"
      ] =
        refund.status_description ||
        "Gateway reported refund failure";
    }

    await InterviewBooking.updateOne(
      {
        _id:
          booking._id,

        "refund.gatewayRefundId":
          refundId,
      },
      {
        $set: update,
      }
    );

    return res.json({
      success: true,

      message:
        "Refund status synchronized",

      data: {
        bookingId:
          booking.bookingId,

        refundId,

        refundStatus,

        gatewayStatus,
      },
    });
  });
