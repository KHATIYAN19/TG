// import crypto from "crypto";
// import mongoose from "mongoose";

// import Book from "../models/Book.js";
// import Order from "../models/Order.js";
// import BookReview from "../models/BookReview.js";


// import sendMail  from "../utils/MailSender.js";

// const normalizeEmail = (email) => {
//   return String(email || "")
//     .trim()
//     .toLowerCase();
// };

// const escapeRegex = (value = "") => {
//   return String(value).replace(
//     /[.*+?^${}()|[\]\\]/g,
//     "\\$&"
//   );
// };

// const escapeHtml = (value = "") => {
//   return String(value)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");
// };

// const getAdminIdentifier = (req) => {
//   return (
//     req.user?.email ||
//     req.user?.username ||
//     req.user?.name ||
//     req.user?._id?.toString() ||
//     "admin"
//   );
// };

// const generateReviewToken = () => {
//   return crypto
//     .randomBytes(32)
//     .toString("hex");
// };

// const getFrontendUrl = () => {
//   return (
//     process.env.FRONTEND_URL ||
//     "https://www.targettrek.in"
//   ).replace(/\/$/, "");
// };

// const buildReviewUrl = (token) => {
//   return `${getFrontendUrl()}/review/${token}`;
// };

// // ======================================================
// // FIND ORDER
// // Supports Mongo _id OR orderId
// // ======================================================

// const findOrder = async (orderIdentifier) => {
//   if (
//     mongoose.Types.ObjectId.isValid(
//       orderIdentifier
//     )
//   ) {
//     const order =
//       await Order.findById(
//         orderIdentifier
//       );

//     if (order) {
//       return order;
//     }
//   }

//   return Order.findOne({
//     orderId: orderIdentifier,
//   });
// };

// // ======================================================
// // VALIDATE PURCHASE
// // ======================================================

// const getPurchaseContext =
//   async (orderIdentifier) => {
//     const order =
//       await findOrder(
//         orderIdentifier
//       );

//     if (!order) {
//       return {
//         error: true,
//         status: 404,
//         message: "Order not found.",
//       };
//     }

//     const allowedOrderStatuses = [
//       "PAID",
//       "PARTIALLY_REFUNDED",
//     ];

//     const allowedPaymentStatuses = [
//       "SUCCESS",
//       "PARTIALLY_REFUNDED",
//     ];

//     if (
//       !allowedOrderStatuses.includes(
//         order.orderStatus
//       ) ||
//       !allowedPaymentStatuses.includes(
//         order.payment?.status
//       )
//     ) {
//       return {
//         error: true,
//         status: 400,
//         message:
//           "Review can only be requested for a successful purchase.",
//       };
//     }

//     const email =
//       normalizeEmail(
//         order.customer?.email
//       );

//     if (!email) {
//       return {
//         error: true,
//         status: 400,
//         message:
//           "Customer email is not available for this order.",
//       };
//     }

//     const book =
//       await Book.findById(
//         order.bookId
//       );

//     if (!book) {
//       return {
//         error: true,
//         status: 404,
//         message:
//           "Book associated with this order was not found.",
//       };
//     }

//     return {
//       error: false,
//       order,
//       book,
//       email,
//     };
//   };

// // ======================================================
// // FIND EXISTING BOOK REVIEW
// // ======================================================

// const findExistingBookReview =
//   async (bookId, email) => {
//     return BookReview.findOne({
//       bookId,
//       "customer.email":
//         normalizeEmail(email),
//     }).select(
//       "+customer.name +customer.email +reviewLink.token"
//     );
//   };

// // ======================================================
// // GET OR CREATE REVIEW LINK
// //
// // Used by:
// // 1. Admin Create Link
// // 2. Admin Send Mail
// // ======================================================

// const ensureBookReviewLink =
//   async ({
//     order,
//     book,
//     email,
//     admin,
//   }) => {
//     let bookReview =
//       await findExistingBookReview(
//         book._id,
//         email
//       );

//     if (bookReview) {
//       if (bookReview.isDeleted) {
//         return {
//           error: true,
//           status: 409,
//           code: "REVIEW_DELETED",
//           message:
//             "This review record is soft deleted. Restore it before generating or sending the review link.",
//         };
//       }

//       if (
//         bookReview.isReviewed ||
//         bookReview.status ===
//           "REVIEW_SUBMITTED"
//       ) {
//         return {
//           error: true,
//           status: 409,
//           code: "ALREADY_REVIEWED",
//           message:
//             "Customer has already submitted a review for this book.",
//           bookReview,
//         };
//       }

//       if (
//         bookReview.reviewLink?.token
//       ) {
//         return {
//           error: false,
//           created: false,
//           bookReview,
//           reviewUrl:
//             buildReviewUrl(
//               bookReview.reviewLink
//                 .token
//             ),
//         };
//       }

//       const token =
//         generateReviewToken();

//       bookReview.reviewLink.token =
//         token;

//       bookReview.reviewLink.generatedAt =
//         new Date();

//       bookReview.reviewLink.generatedBy =
//         admin;

//       bookReview.updatedBy =
//         admin;

//       await bookReview.save();

//       return {
//         error: false,
//         created: true,
//         bookReview,
//         reviewUrl:
//           buildReviewUrl(token),
//       };
//     }

//     const token =
//       generateReviewToken();

//     try {
//       bookReview =
//         await BookReview.create({
//           bookId: book._id,

//           book: {
//             title: book.title,
//             slug: book.slug,
//             coverPageUrl:
//               book.coverPageUrl || "",
//           },

//           orderId: order._id,

//           orderNumber:
//             order.orderId,

//           customer: {
//             name:
//               order.customer?.name ||
//               null,

//             email,
//           },

//           reviewLink: {
//             token,
//             generatedAt:
//               new Date(),
//             generatedBy:
//               admin,
//           },

//           status:
//             "LINK_GENERATED",

//           isReviewed:
//             false,

//           isActive:
//             true,

//           verifiedPurchase:
//             true,

//           createdBy:
//             admin,
//         });

//       return {
//         error: false,
//         created: true,
//         bookReview,
//         reviewUrl:
//           buildReviewUrl(token),
//       };
//     } catch (error) {
//       // Handles two simultaneous requests.
//       if (error?.code === 11000) {
//         bookReview =
//           await findExistingBookReview(
//             book._id,
//             email
//           );

//         if (!bookReview) {
//           throw error;
//         }

//         if (bookReview.isDeleted) {
//           return {
//             error: true,
//             status: 409,
//             code: "REVIEW_DELETED",
//             message:
//               "This review record is soft deleted.",
//           };
//         }

//         if (bookReview.isReviewed) {
//           return {
//             error: true,
//             status: 409,
//             code: "ALREADY_REVIEWED",
//             message:
//               "Customer has already submitted a review.",
//           };
//         }

//         return {
//           error: false,
//           created: false,
//           bookReview,
//           reviewUrl:
//             buildReviewUrl(
//               bookReview.reviewLink
//                 .token
//             ),
//         };
//       }

//       throw error;
//     }
//   };

// // ======================================================
// // VALIDATE REVIEW BODY
// // ======================================================

// const validateReviewPayload = ({
//   rating,
//   title,
//   comment,
// }) => {
//   const numericRating =
//     Number(rating);

//   if (
//     !Number.isInteger(
//       numericRating
//     ) ||
//     numericRating < 1 ||
//     numericRating > 5
//   ) {
//     return {
//       valid: false,
//       message:
//         "Rating must be an integer between 1 and 5.",
//     };
//   }

//   const cleanedTitle =
//     String(title || "").trim();

//   const cleanedComment =
//     String(comment || "").trim();

//   if (
//     cleanedTitle.length > 120
//   ) {
//     return {
//       valid: false,
//       message:
//         "Review title cannot exceed 120 characters.",
//     };
//   }

//   if (!cleanedComment) {
//     return {
//       valid: false,
//       message:
//         "Review comment is required.",
//     };
//   }

//   if (
//     cleanedComment.length < 5
//   ) {
//     return {
//       valid: false,
//       message:
//         "Review must contain at least 5 characters.",
//     };
//   }

//   if (
//     cleanedComment.length > 3000
//   ) {
//     return {
//       valid: false,
//       message:
//         "Review cannot exceed 3000 characters.",
//     };
//   }

//   return {
//     valid: true,

//     data: {
//       rating: numericRating,
//       title: cleanedTitle,
//       comment: cleanedComment,
//     },
//   };
// };

// // ======================================================
// // REVIEW MAIL HTML
// // ======================================================

// const buildReviewMailHtml = ({
//   customerName,
//   book,
//   reviewUrl,
// }) => {
//   const safeName =
//     escapeHtml(
//       customerName || "Reader"
//     );

//   const safeTitle =
//     escapeHtml(book.title);

//   const safeCover =
//     escapeHtml(
//       book.coverPageUrl || ""
//     );

//   return `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <meta charset="UTF-8" />
//       </head>

//       <body
//         style="
//           margin:0;
//           padding:0;
//           background:#f8fafc;
//           font-family:Arial,Helvetica,sans-serif;
//           color:#0f172a;
//         "
//       >
//         <div
//           style="
//             max-width:620px;
//             margin:0 auto;
//             padding:30px 16px;
//           "
//         >
//           <div
//             style="
//               background:#ffffff;
//               border:1px solid #e2e8f0;
//               border-radius:16px;
//               padding:32px;
//             "
//           >
//             <h2
//               style="
//                 margin:0 0 18px;
//                 font-size:24px;
//               "
//             >
//               Share your experience
//             </h2>

//             <p
//               style="
//                 font-size:16px;
//                 line-height:1.6;
//               "
//             >
//               Hi ${safeName},
//             </p>

//             <p
//               style="
//                 font-size:16px;
//                 line-height:1.6;
//               "
//             >
//               Thank you for purchasing
//               <strong>${safeTitle}</strong>
//               from Target Trek.
//             </p>

//             ${
//               safeCover
//                 ? `
//                   <div
//                     style="
//                       text-align:center;
//                       margin:24px 0;
//                     "
//                   >
//                     <img
//                       src="${safeCover}"
//                       alt="${safeTitle}"
//                       style="
//                         max-width:170px;
//                         width:100%;
//                         border-radius:10px;
//                         border:1px solid #e2e8f0;
//                       "
//                     />
//                   </div>
//                 `
//                 : ""
//             }

//             <p
//               style="
//                 font-size:16px;
//                 line-height:1.6;
//               "
//             >
//               We'd love to hear your experience
//               with the book. Your feedback helps
//               us improve our resources and helps
//               other learners.
//             </p>

//             <div
//               style="
//                 text-align:center;
//                 margin:30px 0;
//               "
//             >
//               <a
//                 href="${reviewUrl}"
//                 style="
//                   display:inline-block;
//                   background:#0f172a;
//                   color:#ffffff;
//                   text-decoration:none;
//                   padding:14px 28px;
//                   border-radius:8px;
//                   font-weight:bold;
//                   font-size:16px;
//                 "
//               >
//                 Write a Review
//               </a>
//             </div>

//             <p
//               style="
//                 font-size:13px;
//                 line-height:1.6;
//                 color:#64748b;
//               "
//             >
//               This review link is unique to your
//               purchase. You can submit a review
//               only once.
//             </p>

//             <hr
//               style="
//                 border:none;
//                 border-top:1px solid #e2e8f0;
//                 margin:28px 0;
//               "
//             />

//             <p
//               style="
//                 font-size:13px;
//                 color:#64748b;
//                 line-height:1.6;
//               "
//             >
//               Target Trek<br/>
//               support@targettrek.in
//             </p>
//           </div>
//         </div>
//       </body>
//     </html>
//   `;
// };

// // ======================================================
// // ADMIN
// // CREATE / GET REVIEW LINK
// //
// // POST
// // /api/book-reviews/admin/order/:orderIdentifier/link
// // ======================================================

// export const createBookReviewLink =
//   async (req, res) => {
//     try {
//       const {
//         orderIdentifier,
//       } = req.params;

//       const purchase =
//         await getPurchaseContext(
//           orderIdentifier
//         );

//       if (purchase.error) {
//         return res
//           .status(purchase.status)
//           .json({
//             success: false,
//             message:
//               purchase.message,
//           });
//       }

//       const {
//         order,
//         book,
//         email,
//       } = purchase;

//       const admin =
//         getAdminIdentifier(req);

//       const result =
//         await ensureBookReviewLink({
//           order,
//           book,
//           email,
//           admin,
//         });

//       if (result.error) {
//         return res
//           .status(result.status)
//           .json({
//             success: false,
//             code: result.code,
//             message:
//               result.message,
//           });
//       }

//       return res
//         .status(
//           result.created
//             ? 201
//             : 200
//         )
//         .json({
//           success: true,

//           message:
//             result.created
//               ? "Book review link generated successfully."
//               : "Book review link already exists.",

//           data: {
//             bookReviewId:
//               result.bookReview._id,

//             alreadyGenerated:
//               !result.created,

//             reviewUrl:
//               result.reviewUrl,

//             generatedAt:
//               result.bookReview
//                 .reviewLink
//                 .generatedAt,

//             order: {
//               _id: order._id,
//               orderId:
//                 order.orderId,
//             },

//             book: {
//               _id: book._id,
//               title:
//                 book.title,
//               slug:
//                 book.slug,
//               coverPageUrl:
//                 book.coverPageUrl,
//             },
//           },
//         });
//     } catch (error) {
//       console.error(
//         "createBookReviewLink:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to generate book review link.",
//         });
//     }
//   };

// // ======================================================
// // ADMIN
// // SEND REVIEW MAIL
// //
// // POST
// // /api/book-reviews/admin/order/:orderIdentifier/send-mail
// //
// // If link doesn't exist -> creates it.
// // If link exists -> uses same link.
// // If reviewed -> mail not sent.
// // ======================================================

// export const sendBookReviewMail =
//   async (req, res) => {
//     try {
//       const {
//         orderIdentifier,
//       } = req.params;

//       const purchase =
//         await getPurchaseContext(
//           orderIdentifier
//         );

//       if (purchase.error) {
//         return res
//           .status(purchase.status)
//           .json({
//             success: false,
//             message:
//               purchase.message,
//           });
//       }

//       const {
//         order,
//         book,
//         email,
//       } = purchase;

//       const admin =
//         getAdminIdentifier(req);

//       const result =
//         await ensureBookReviewLink({
//           order,
//           book,
//           email,
//           admin,
//         });

//       if (result.error) {
//         return res
//           .status(result.status)
//           .json({
//             success: false,
//             code: result.code,
//             message:
//               result.message,
//           });
//       }

//       const bookReview =
//         result.bookReview;

//       const reviewUrl =
//         result.reviewUrl;

//       const html =
//         buildReviewMailHtml({
//           customerName:
//             order.customer?.name,

//           book,

//           reviewUrl,
//         });

//       const now =
//         new Date();

//       bookReview.reviewMail.lastAttemptAt =
//         now;

//       bookReview.reviewMail.lastSentBy =
//         admin;

//       try {
//         // Uses your existing external mail function.
//         await sendMail({
//           to: email,

//           subject:
//             `Share your review for ${book.title}`,

//           html,
//         });

//         bookReview.reviewMail.sentCount =
//           (
//             bookReview.reviewMail
//               .sentCount || 0
//           ) + 1;

//         if (
//           !bookReview.reviewMail
//             .firstSentAt
//         ) {
//           bookReview.reviewMail.firstSentAt =
//             now;
//         }

//         bookReview.reviewMail.lastSentAt =
//           now;

//         bookReview.reviewMail.lastStatus =
//           "SENT";

//         bookReview.reviewMail.lastError =
//           null;

//         bookReview.updatedBy =
//           admin;

//         await bookReview.save();

//         return res
//           .status(200)
//           .json({
//             success: true,

//             message:
//               "Book review mail sent successfully.",

//             data: {
//               bookReviewId:
//                 bookReview._id,

//               reviewUrl,

//               linkCreated:
//                 result.created,

//               sentCount:
//                 bookReview.reviewMail
//                   .sentCount,

//               firstSentAt:
//                 bookReview.reviewMail
//                   .firstSentAt,

//               lastSentAt:
//                 bookReview.reviewMail
//                   .lastSentAt,

//               order: {
//                 orderId:
//                   order.orderId,
//               },

//               book: {
//                 _id:
//                   book._id,

//                 title:
//                   book.title,

//                 slug:
//                   book.slug,
//               },
//             },
//           });
//       } catch (mailError) {
//         bookReview.reviewMail.lastStatus =
//           "FAILED";

//         bookReview.reviewMail.lastError =
//           String(
//             mailError?.message ||
//               "Unknown mail error"
//           ).slice(0, 1000);

//         bookReview.updatedBy =
//           admin;

//         await bookReview.save();

//         console.error(
//           "sendBookReviewMail mail error:",
//           mailError
//         );

//         return res
//           .status(502)
//           .json({
//             success: false,

//             message:
//               "Book review link is available, but email could not be sent.",

//             data: {
//               bookReviewId:
//                 bookReview._id,

//               reviewUrl,
//             },
//           });
//       }
//     } catch (error) {
//       console.error(
//         "sendBookReviewMail:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to send book review mail.",
//         });
//     }
//   };

// // ======================================================
// // PUBLIC
// // OPEN / VERIFY REVIEW LINK
// //
// // GET
// // /api/book-reviews/link/:token
// //
// // CUSTOMER NAME / EMAIL NEVER RETURNED.
// // ======================================================

// export const getBookReviewLink =
//   async (req, res) => {
//     try {
//       const { token } =
//         req.params;

//       if (
//         !token ||
//         token.length < 32
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Invalid review link.",
//           });
//       }

//       const bookReview =
//         await BookReview.findOne({
//           "reviewLink.token":
//             token,

//           isDeleted: false,
//         }).select(
//           "+reviewLink.token"
//         );

//       if (!bookReview) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Review link is invalid or no longer available.",
//           });
//       }

//       if (
//         bookReview.isReviewed ||
//         bookReview.status ===
//           "REVIEW_SUBMITTED"
//       ) {
//         return res
//           .status(200)
//           .json({
//             success: true,

//             data: {
//               canReview: false,

//               reason:
//                 "ALREADY_REVIEWED",

//               message:
//                 "Review has already been submitted for this book.",

//               book: {
//                 _id:
//                   bookReview.bookId,

//                 title:
//                   bookReview.book
//                     .title,

//                 slug:
//                   bookReview.book
//                     .slug,

//                 coverPageUrl:
//                   bookReview.book
//                     .coverPageUrl,
//               },
//             },
//           });
//       }

//       return res
//         .status(200)
//         .json({
//           success: true,

//           data: {
//             canReview: true,

//             book: {
//               _id:
//                 bookReview.bookId,

//               title:
//                 bookReview.book
//                   .title,

//               slug:
//                 bookReview.book
//                   .slug,

//               coverPageUrl:
//                 bookReview.book
//                   .coverPageUrl,
//             },

//             reviewFields: {
//               rating: {
//                 min: 1,
//                 max: 5,
//                 required: true,
//               },

//               title: {
//                 required: false,
//                 maxLength: 120,
//               },

//               comment: {
//                 required: true,
//                 minLength: 5,
//                 maxLength: 3000,
//               },
//             },
//           },
//         });
//     } catch (error) {
//       console.error(
//         "getBookReviewLink:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to verify review link.",
//         });
//     }
//   };

// // ======================================================
// // PUBLIC
// // SUBMIT REVIEW
// //
// // POST
// // /api/book-reviews/link/:token
// //
// // BODY:
// // {
// //   "rating": 5,
// //   "title": "Very useful",
// //   "comment": "Great book..."
// // }
// // ======================================================

// export const submitBookReview =
//   async (req, res) => {
//     try {
//       const { token } =
//         req.params;

//       if (
//         !token ||
//         token.length < 32
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Invalid review link.",
//           });
//       }

//       const validation =
//         validateReviewPayload(
//           req.body
//         );

//       if (!validation.valid) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               validation.message,
//           });
//       }

//       const {
//         rating,
//         title,
//         comment,
//       } = validation.data;

//       const now =
//         new Date();

//       // Atomic update prevents double submission
//       // from multiple simultaneous requests.
//       const bookReview =
//         await BookReview.findOneAndUpdate(
//           {
//             "reviewLink.token":
//               token,

//             isDeleted: false,

//             isReviewed: false,

//             status:
//               "LINK_GENERATED",
//           },
//           {
//             $set: {
//               "review.rating":
//                 rating,

//               "review.title":
//                 title,

//               "review.comment":
//                 comment,

//               "review.submittedAt":
//                 now,

//               "review.lastEditedAt":
//                 null,

//               "review.lastEditedBy":
//                 null,

//               "review.editedByAdmin":
//                 false,

//               status:
//                 "REVIEW_SUBMITTED",

//               isReviewed:
//                 true,

//               isActive:
//                 true,

//               updatedBy:
//                 "customer",
//             },
//           },
//           {
//             new: true,
//             runValidators: true,
//           }
//         );

//       if (!bookReview) {
//         const existing =
//           await BookReview.findOne({
//             "reviewLink.token":
//               token,
//           });

//         if (!existing) {
//           return res
//             .status(404)
//             .json({
//               success: false,
//               message:
//                 "Review link is invalid.",
//             });
//         }

//         if (existing.isDeleted) {
//           return res
//             .status(410)
//             .json({
//               success: false,
//               message:
//                 "This review link is no longer available.",
//             });
//         }

//         if (
//           existing.isReviewed ||
//           existing.status ===
//             "REVIEW_SUBMITTED"
//         ) {
//           return res
//             .status(409)
//             .json({
//               success: false,
//               code:
//                 "ALREADY_REVIEWED",
//               message:
//                 "You have already submitted a review for this book.",
//             });
//         }

//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Unable to submit review.",
//           });
//       }

//       return res
//         .status(201)
//         .json({
//           success: true,

//           message:
//             "Thank you! Your review has been submitted successfully.",

//           data: {
//             bookReviewId:
//               bookReview._id,

//             book: {
//               _id:
//                 bookReview.bookId,

//               title:
//                 bookReview.book
//                   .title,

//               slug:
//                 bookReview.book
//                   .slug,
//             },

//             review: {
//               rating:
//                 bookReview.review
//                   .rating,

//               title:
//                 bookReview.review
//                   .title,

//               comment:
//                 bookReview.review
//                   .comment,

//               submittedAt:
//                 bookReview.review
//                   .submittedAt,
//             },
//           },
//         });
//     } catch (error) {
//       console.error(
//         "submitBookReview:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to submit book review.",
//         });
//     }
//   };

// // ======================================================
// // PUBLIC
// // GET REVIEWS FOR A BOOK
// //
// // GET
// // /api/book-reviews/book/:bookIdentifier
// //
// // bookIdentifier can be:
// // Mongo ObjectId
// // OR slug
// //
// // Query:
// // ?page=1
// // &limit=10
// // &rating=5
// // &sort=newest
// //
// // sort:
// // newest
// // oldest
// // highest
// // lowest
// // ======================================================

// export const getPublicBookReviews =
//   async (req, res) => {
//     try {
//       const {
//         bookIdentifier,
//       } = req.params;

//       let book = null;

//       if (
//         mongoose.Types.ObjectId.isValid(
//           bookIdentifier
//         )
//       ) {
//         book =
//           await Book.findById(
//             bookIdentifier
//           )
//             .select(
//               "title slug coverPageUrl"
//             )
//             .lean();
//       }

//       if (!book) {
//         book =
//           await Book.findOne({
//             slug:
//               String(
//                 bookIdentifier
//               )
//                 .trim()
//                 .toLowerCase(),
//           })
//             .select(
//               "title slug coverPageUrl"
//             )
//             .lean();
//       }

//       if (!book) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Book not found.",
//           });
//       }

//       const page =
//         Math.max(
//           Number(req.query.page) ||
//             1,
//           1
//         );

//       const limit =
//         Math.min(
//           Math.max(
//             Number(
//               req.query.limit
//             ) || 10,
//             1
//           ),
//           50
//         );

//       const skip =
//         (page - 1) * limit;

//       const filter = {
//         bookId: book._id,

//         status:
//           "REVIEW_SUBMITTED",

//         isReviewed: true,

//         isActive: true,

//         isDeleted: false,
//       };

//       if (
//         req.query.rating !==
//         undefined
//       ) {
//         const rating =
//           Number(
//             req.query.rating
//           );

//         if (
//           !Number.isInteger(
//             rating
//           ) ||
//           rating < 1 ||
//           rating > 5
//         ) {
//           return res
//             .status(400)
//             .json({
//               success: false,
//               message:
//                 "Rating filter must be between 1 and 5.",
//             });
//         }

//         filter[
//           "review.rating"
//         ] = rating;
//       }

//       let sort = {
//         "review.submittedAt": -1,
//       };

//       switch (
//         req.query.sort
//       ) {
//         case "oldest":
//           sort = {
//             "review.submittedAt": 1,
//           };
//           break;

//         case "highest":
//           sort = {
//             "review.rating": -1,
//             "review.submittedAt": -1,
//           };
//           break;

//         case "lowest":
//           sort = {
//             "review.rating": 1,
//             "review.submittedAt": -1,
//           };
//           break;

//         default:
//           sort = {
//             "review.submittedAt": -1,
//           };
//       }

//       const statsFilter = {
//         bookId: book._id,
//         status:
//           "REVIEW_SUBMITTED",
//         isReviewed: true,
//         isActive: true,
//         isDeleted: false,
//       };

//       const [
//         bookReviews,
//         total,
//         stats,
//       ] = await Promise.all([
//         BookReview.find(filter)
//           .select(
//             "review verifiedPurchase"
//           )
//           .sort(sort)
//           .skip(skip)
//           .limit(limit)
//           .lean(),

//         BookReview.countDocuments(
//           filter
//         ),

//         BookReview.aggregate([
//           {
//             $match:
//               statsFilter,
//           },

//           {
//             $group: {
//               _id: null,

//               totalReviews: {
//                 $sum: 1,
//               },

//               averageRating: {
//                 $avg:
//                   "$review.rating",
//               },

//               rating1: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: [
//                         "$review.rating",
//                         1,
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               rating2: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: [
//                         "$review.rating",
//                         2,
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               rating3: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: [
//                         "$review.rating",
//                         3,
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               rating4: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: [
//                         "$review.rating",
//                         4,
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               rating5: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: [
//                         "$review.rating",
//                         5,
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },
//             },
//           },
//         ]),
//       ]);

//       const reviewStats =
//         stats[0] || {
//           totalReviews: 0,
//           averageRating: 0,
//           rating1: 0,
//           rating2: 0,
//           rating3: 0,
//           rating4: 0,
//           rating5: 0,
//         };

//       return res
//         .status(200)
//         .json({
//           success: true,

//           data: {
//             book,

//             stats: {
//               totalReviews:
//                 reviewStats
//                   .totalReviews,

//               averageRating:
//                 Number(
//                   reviewStats
//                     .averageRating ||
//                     0
//                 ).toFixed(1),

//               distribution: {
//                 1:
//                   reviewStats.rating1,
//                 2:
//                   reviewStats.rating2,
//                 3:
//                   reviewStats.rating3,
//                 4:
//                   reviewStats.rating4,
//                 5:
//                   reviewStats.rating5,
//               },
//             },

//             reviews:
//               bookReviews.map(
//                 (item) => ({
//                   _id:
//                     item._id,

//                   reviewer:
//                     "Verified Buyer",

//                   verifiedPurchase:
//                     item.verifiedPurchase,

//                   rating:
//                     item.review
//                       .rating,

//                   title:
//                     item.review
//                       .title,

//                   comment:
//                     item.review
//                       .comment,

//                   submittedAt:
//                     item.review
//                       .submittedAt,
//                 })
//               ),

//             pagination: {
//               page,
//               limit,
//               total,

//               totalPages:
//                 Math.ceil(
//                   total / limit
//                 ),

//               hasNextPage:
//                 page * limit <
//                 total,

//               hasPreviousPage:
//                 page > 1,
//             },
//           },
//         });
//     } catch (error) {
//       console.error(
//         "getPublicBookReviews:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to fetch book reviews.",
//         });
//     }
//   };

// // ======================================================
// // ADMIN
// // GET ALL BOOK REVIEWS
// //
// // GET
// // /api/book-reviews/admin
// //
// // Query Examples:
// //
// // ?page=1
// // &limit=20
// // &search=lavi
// // &bookId=...
// // &status=REVIEW_SUBMITTED
// // &isActive=true
// // &deleted=false
// // &rating=5
// // &mailStatus=SENT
// // ======================================================

// export const getAllBookReviews =
//   async (req, res) => {
//     try {
//       const page =
//         Math.max(
//           Number(req.query.page) ||
//             1,
//           1
//         );

//       const limit =
//         Math.min(
//           Math.max(
//             Number(
//               req.query.limit
//             ) || 20,
//             1
//           ),
//           100
//         );

//       const skip =
//         (page - 1) * limit;

//       const filter = {};

//       // ------------------------------------------
//       // BOOK
//       // ------------------------------------------

//       if (req.query.bookId) {
//         if (
//           !mongoose.Types.ObjectId.isValid(
//             req.query.bookId
//           )
//         ) {
//           return res
//             .status(400)
//             .json({
//               success: false,
//               message:
//                 "Invalid bookId.",
//             });
//         }

//         filter.bookId =
//           req.query.bookId;
//       }

//       // ------------------------------------------
//       // STATUS
//       // ------------------------------------------

//       if (req.query.status) {
//         if (
//           ![
//             "LINK_GENERATED",
//             "REVIEW_SUBMITTED",
//           ].includes(
//             req.query.status
//           )
//         ) {
//           return res
//             .status(400)
//             .json({
//               success: false,
//               message:
//                 "Invalid review status.",
//             });
//         }

//         filter.status =
//           req.query.status;
//       }

//       // ------------------------------------------
//       // ACTIVE
//       // ------------------------------------------

//       if (
//         req.query.isActive ===
//         "true"
//       ) {
//         filter.isActive = true;
//       }

//       if (
//         req.query.isActive ===
//         "false"
//       ) {
//         filter.isActive = false;
//       }

//       // ------------------------------------------
//       // DELETED
//       // ------------------------------------------

//       if (
//         req.query.deleted ===
//         "true"
//       ) {
//         filter.isDeleted = true;
//       } else if (
//         req.query.deleted ===
//         "all"
//       ) {
//         // No isDeleted filter.
//       } else {
//         filter.isDeleted = false;
//       }

//       // ------------------------------------------
//       // RATING
//       // ------------------------------------------

//       if (
//         req.query.rating !==
//         undefined
//       ) {
//         const rating =
//           Number(
//             req.query.rating
//           );

//         if (
//           !Number.isInteger(
//             rating
//           ) ||
//           rating < 1 ||
//           rating > 5
//         ) {
//           return res
//             .status(400)
//             .json({
//               success: false,
//               message:
//                 "Rating must be between 1 and 5.",
//             });
//         }

//         filter[
//           "review.rating"
//         ] = rating;
//       }

//       // ------------------------------------------
//       // MAIL STATUS
//       // ------------------------------------------

//       if (
//         req.query.mailStatus
//       ) {
//         if (
//           ![
//             "NOT_SENT",
//             "SENT",
//             "FAILED",
//           ].includes(
//             req.query.mailStatus
//           )
//         ) {
//           return res
//             .status(400)
//             .json({
//               success: false,
//               message:
//                 "Invalid mail status.",
//             });
//         }

//         filter[
//           "reviewMail.lastStatus"
//         ] =
//           req.query.mailStatus;
//       }

//       // ------------------------------------------
//       // SEARCH
//       // ------------------------------------------

//       if (
//         req.query.search?.trim()
//       ) {
//         const search =
//           new RegExp(
//             escapeRegex(
//               req.query.search.trim()
//             ),
//             "i"
//           );

//         filter.$or = [
//           {
//             "customer.name":
//               search,
//           },

//           {
//             "customer.email":
//               search,
//           },

//           {
//             orderNumber:
//               search,
//           },

//           {
//             "book.title":
//               search,
//           },

//           {
//             "book.slug":
//               search,
//           },

//           {
//             "review.title":
//               search,
//           },

//           {
//             "review.comment":
//               search,
//           },
//         ];
//       }

//       const [
//         bookReviews,
//         total,
//       ] = await Promise.all([
//         BookReview.find(filter)
//           .select(
//             "+customer.name +customer.email +reviewLink.token"
//           )
//           .sort({
//             createdAt: -1,
//           })
//           .skip(skip)
//           .limit(limit)
//           .lean(),

//         BookReview.countDocuments(
//           filter
//         ),
//       ]);

//       const results =
//         bookReviews.map(
//           (item) => ({
//             ...item,

//             reviewUrl:
//               item.reviewLink
//                 ?.token
//                 ? buildReviewUrl(
//                     item.reviewLink
//                       .token
//                   )
//                 : null,

//             reviewLink: {
//               generatedAt:
//                 item.reviewLink
//                   ?.generatedAt,

//               generatedBy:
//                 item.reviewLink
//                   ?.generatedBy,
//             },
//           })
//         );

//       return res
//         .status(200)
//         .json({
//           success: true,

//           data: {
//             bookReviews:
//               results,

//             pagination: {
//               page,
//               limit,
//               total,

//               totalPages:
//                 Math.ceil(
//                   total / limit
//                 ),

//               hasNextPage:
//                 page * limit <
//                 total,

//               hasPreviousPage:
//                 page > 1,
//             },
//           },
//         });
//     } catch (error) {
//       console.error(
//         "getAllBookReviews:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to fetch book reviews.",
//         });
//     }
//   };

// // ======================================================
// // ADMIN
// // GET REVIEWS PER BOOK
// //
// // GET
// // /api/book-reviews/admin/book/:bookId
// // ======================================================

// export const getBookReviewsForAdmin =
//   async (req, res) => {
//     try {
//       const { bookId } =
//         req.params;

//       if (
//         !mongoose.Types.ObjectId.isValid(
//           bookId
//         )
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Invalid book ID.",
//           });
//       }

//       const book =
//         await Book.findById(
//           bookId
//         )
//           .select(
//             "title slug coverPageUrl price mrp currency"
//           )
//           .lean();

//       if (!book) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Book not found.",
//           });
//       }

//       const page =
//         Math.max(
//           Number(req.query.page) ||
//             1,
//           1
//         );

//       const limit =
//         Math.min(
//           Math.max(
//             Number(
//               req.query.limit
//             ) || 20,
//             1
//           ),
//           100
//         );

//       const skip =
//         (page - 1) * limit;

//       const filter = {
//         bookId:
//           new mongoose.Types.ObjectId(
//             bookId
//           ),
//       };

//       if (
//         req.query.status
//       ) {
//         filter.status =
//           req.query.status;
//       }

//       if (
//         req.query.isActive ===
//         "true"
//       ) {
//         filter.isActive = true;
//       }

//       if (
//         req.query.isActive ===
//         "false"
//       ) {
//         filter.isActive = false;
//       }

//       if (
//         req.query.deleted ===
//         "true"
//       ) {
//         filter.isDeleted = true;
//       } else if (
//         req.query.deleted !==
//         "all"
//       ) {
//         filter.isDeleted = false;
//       }

//       if (
//         req.query.search?.trim()
//       ) {
//         const search =
//           new RegExp(
//             escapeRegex(
//               req.query.search.trim()
//             ),
//             "i"
//           );

//         filter.$or = [
//           {
//             "customer.name":
//               search,
//           },

//           {
//             "customer.email":
//               search,
//           },

//           {
//             orderNumber:
//               search,
//           },

//           {
//             "review.title":
//               search,
//           },

//           {
//             "review.comment":
//               search,
//           },
//         ];
//       }

//       const [
//         bookReviews,
//         total,
//       ] = await Promise.all([
//         BookReview.find(filter)
//           .select(
//             "+customer.name +customer.email +reviewLink.token"
//           )
//           .sort({
//             createdAt: -1,
//           })
//           .skip(skip)
//           .limit(limit)
//           .lean(),

//         BookReview.countDocuments(
//           filter
//         ),
//       ]);

//       const results =
//         bookReviews.map(
//           (item) => ({
//             ...item,

//             reviewUrl:
//               item.reviewLink
//                 ?.token
//                 ? buildReviewUrl(
//                     item.reviewLink
//                       .token
//                   )
//                 : null,

//             reviewLink: {
//               generatedAt:
//                 item.reviewLink
//                   ?.generatedAt,

//               generatedBy:
//                 item.reviewLink
//                   ?.generatedBy,
//             },
//           })
//         );

//       return res
//         .status(200)
//         .json({
//           success: true,

//           data: {
//             book,

//             bookReviews:
//               results,

//             pagination: {
//               page,
//               limit,
//               total,

//               totalPages:
//                 Math.ceil(
//                   total / limit
//                 ),
//             },
//           },
//         });
//     } catch (error) {
//       console.error(
//         "getBookReviewsForAdmin:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to fetch book reviews.",
//         });
//     }
//   };

// // ======================================================
// // ADMIN
// // BOOK REVIEW STATS
// //
// // GET
// // /api/book-reviews/admin/book/:bookId/stats
// // ======================================================

// export const getBookReviewStats =
//   async (req, res) => {
//     try {
//       const { bookId } =
//         req.params;

//       if (
//         !mongoose.Types.ObjectId.isValid(
//           bookId
//         )
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Invalid book ID.",
//           });
//       }

//       const objectBookId =
//         new mongoose.Types.ObjectId(
//           bookId
//         );

//       const book =
//         await Book.findById(
//           objectBookId
//         )
//           .select(
//             "title slug coverPageUrl"
//           )
//           .lean();

//       if (!book) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Book not found.",
//           });
//       }

//       const [
//         total,
//         totalActiveRecords,
//         linksGenerated,
//         submitted,
//         activeReviews,
//         inactiveReviews,
//         deleted,
//         ratingStats,
//         mailStats,
//       ] = await Promise.all([
//         BookReview.countDocuments({
//           bookId: objectBookId,
//         }),

//         BookReview.countDocuments({
//           bookId: objectBookId,
//           isDeleted: false,
//         }),

//         BookReview.countDocuments({
//           bookId: objectBookId,
//           status:
//             "LINK_GENERATED",
//           isDeleted: false,
//         }),

//         BookReview.countDocuments({
//           bookId: objectBookId,
//           status:
//             "REVIEW_SUBMITTED",
//           isDeleted: false,
//         }),

//         BookReview.countDocuments({
//           bookId: objectBookId,
//           status:
//             "REVIEW_SUBMITTED",
//           isActive: true,
//           isDeleted: false,
//         }),

//         BookReview.countDocuments({
//           bookId: objectBookId,
//           status:
//             "REVIEW_SUBMITTED",
//           isActive: false,
//           isDeleted: false,
//         }),

//         BookReview.countDocuments({
//           bookId: objectBookId,
//           isDeleted: true,
//         }),

//         BookReview.aggregate([
//           {
//             $match: {
//               bookId:
//                 objectBookId,

//               status:
//                 "REVIEW_SUBMITTED",

//               isDeleted: false,
//             },
//           },

//           {
//             $group: {
//               _id: null,

//               averageRating: {
//                 $avg:
//                   "$review.rating",
//               },

//               rating1: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: [
//                         "$review.rating",
//                         1,
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               rating2: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: [
//                         "$review.rating",
//                         2,
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               rating3: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: [
//                         "$review.rating",
//                         3,
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               rating4: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: [
//                         "$review.rating",
//                         4,
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               rating5: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: [
//                         "$review.rating",
//                         5,
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },
//             },
//           },
//         ]),

//         BookReview.aggregate([
//           {
//             $match: {
//               bookId:
//                 objectBookId,
//             },
//           },

//           {
//             $group: {
//               _id: null,

//               totalEmailsSent: {
//                 $sum:
//                   "$reviewMail.sentCount",
//               },
//             },
//           },
//         ]),
//       ]);

//       const rating =
//         ratingStats[0] || {};

//       return res
//         .status(200)
//         .json({
//           success: true,

//           data: {
//             book,

//             stats: {
//               totalReviewRecords:
//                 total,

//               totalActiveRecords,

//               pendingReviews:
//                 linksGenerated,

//               submittedReviews:
//                 submitted,

//               activeReviews,

//               inactiveReviews,

//               deletedReviews:
//                 deleted,

//               totalEmailsSent:
//                 mailStats[0]
//                   ?.totalEmailsSent ||
//                 0,

//               averageRating:
//                 Number(
//                   rating.averageRating ||
//                     0
//                 ).toFixed(1),

//               ratingDistribution: {
//                 1:
//                   rating.rating1 ||
//                   0,

//                 2:
//                   rating.rating2 ||
//                   0,

//                 3:
//                   rating.rating3 ||
//                   0,

//                 4:
//                   rating.rating4 ||
//                   0,

//                 5:
//                   rating.rating5 ||
//                   0,
//               },
//             },
//           },
//         });
//     } catch (error) {
//       console.error(
//         "getBookReviewStats:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to fetch book review statistics.",
//         });
//     }
//   };

// // ======================================================
// // ADMIN
// // GET SINGLE BOOK REVIEW
// //
// // GET
// // /api/book-reviews/admin/:bookReviewId
// // ======================================================

// export const getBookReviewById =
//   async (req, res) => {
//     try {
//       const {
//         bookReviewId,
//       } = req.params;

//       if (
//         !mongoose.Types.ObjectId.isValid(
//           bookReviewId
//         )
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Invalid book review ID.",
//           });
//       }

//       const bookReview =
//         await BookReview.findById(
//           bookReviewId
//         )
//           .select(
//             "+customer.name +customer.email +reviewLink.token"
//           )
//           .lean();

//       if (!bookReview) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Book review not found.",
//           });
//       }

//       const token =
//         bookReview.reviewLink
//           ?.token;

//       return res
//         .status(200)
//         .json({
//           success: true,

//           data: {
//             bookReview: {
//               ...bookReview,

//               reviewUrl:
//                 token
//                   ? buildReviewUrl(
//                       token
//                     )
//                   : null,

//               reviewLink: {
//                 generatedAt:
//                   bookReview
//                     .reviewLink
//                     ?.generatedAt,

//                 generatedBy:
//                   bookReview
//                     .reviewLink
//                     ?.generatedBy,
//               },
//             },
//           },
//         });
//     } catch (error) {
//       console.error(
//         "getBookReviewById:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to fetch book review.",
//         });
//     }
//   };

// // ======================================================
// // ADMIN
// // UPDATE BOOK REVIEW
// //
// // PATCH
// // /api/book-reviews/admin/:bookReviewId
// //
// // BODY CAN CONTAIN:
// // {
// //   "rating": 4,
// //   "title": "...",
// //   "comment": "...",
// //   "isActive": true,
// //   "adminNotes": "..."
// // }
// // ======================================================

// export const updateBookReview =
//   async (req, res) => {
//     try {
//       const {
//         bookReviewId,
//       } = req.params;

//       if (
//         !mongoose.Types.ObjectId.isValid(
//           bookReviewId
//         )
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Invalid book review ID.",
//           });
//       }

//       const bookReview =
//         await BookReview.findById(
//           bookReviewId
//         ).select(
//           "+customer.name +customer.email"
//         );

//       if (!bookReview) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Book review not found.",
//           });
//       }

//       if (bookReview.isDeleted) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Restore the book review before updating it.",
//           });
//       }

//       const admin =
//         getAdminIdentifier(req);

//       const {
//         rating,
//         title,
//         comment,
//         isActive,
//         adminNotes,
//       } = req.body;

//       const wantsToEditReview =
//         rating !== undefined ||
//         title !== undefined ||
//         comment !== undefined;

//       if (
//         wantsToEditReview &&
//         !bookReview.isReviewed
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Review content cannot be edited because the customer has not submitted a review yet.",
//           });
//       }

//       let reviewModified =
//         false;

//       if (
//         rating !== undefined
//       ) {
//         const numericRating =
//           Number(rating);

//         if (
//           !Number.isInteger(
//             numericRating
//           ) ||
//           numericRating < 1 ||
//           numericRating > 5
//         ) {
//           return res
//             .status(400)
//             .json({
//               success: false,
//               message:
//                 "Rating must be between 1 and 5.",
//             });
//         }

//         bookReview.review.rating =
//           numericRating;

//         reviewModified = true;
//       }

//       if (
//         title !== undefined
//       ) {
//         const cleanedTitle =
//           String(title).trim();

//         if (
//           cleanedTitle.length >
//           120
//         ) {
//           return res
//             .status(400)
//             .json({
//               success: false,
//               message:
//                 "Review title cannot exceed 120 characters.",
//             });
//         }

//         bookReview.review.title =
//           cleanedTitle;

//         reviewModified = true;
//       }

//       if (
//         comment !== undefined
//       ) {
//         const cleanedComment =
//           String(comment).trim();

//         if (
//           cleanedComment.length <
//             5 ||
//           cleanedComment.length >
//             3000
//         ) {
//           return res
//             .status(400)
//             .json({
//               success: false,
//               message:
//                 "Review comment must contain between 5 and 3000 characters.",
//             });
//         }

//         bookReview.review.comment =
//           cleanedComment;

//         reviewModified = true;
//       }

//       if (
//         typeof isActive ===
//         "boolean"
//       ) {
//         bookReview.isActive =
//           isActive;
//       }

//       if (
//         adminNotes !== undefined
//       ) {
//         const notes =
//           String(
//             adminNotes
//           ).trim();

//         if (
//           notes.length > 1000
//         ) {
//           return res
//             .status(400)
//             .json({
//               success: false,
//               message:
//                 "Admin notes cannot exceed 1000 characters.",
//             });
//         }

//         bookReview.adminNotes =
//           notes;
//       }

//       if (reviewModified) {
//         bookReview.review.lastEditedAt =
//           new Date();

//         bookReview.review.lastEditedBy =
//           admin;

//         bookReview.review.editedByAdmin =
//           true;
//       }

//       bookReview.updatedBy =
//         admin;

//       await bookReview.save();

//       return res
//         .status(200)
//         .json({
//           success: true,

//           message:
//             "Book review updated successfully.",

//           data: {
//             bookReview,
//           },
//         });
//     } catch (error) {
//       console.error(
//         "updateBookReview:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to update book review.",
//         });
//     }
//   };

// // ======================================================
// // ADMIN
// // SOFT DELETE
// //
// // PATCH
// // /api/book-reviews/admin/:bookReviewId/soft-delete
// // ======================================================

// export const softDeleteBookReview =
//   async (req, res) => {
//     try {
//       const {
//         bookReviewId,
//       } = req.params;

//       if (
//         !mongoose.Types.ObjectId.isValid(
//           bookReviewId
//         )
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Invalid book review ID.",
//           });
//       }

//       const admin =
//         getAdminIdentifier(req);

//       const bookReview =
//         await BookReview.findById(
//           bookReviewId
//         );

//       if (!bookReview) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Book review not found.",
//           });
//       }

//       if (bookReview.isDeleted) {
//         return res
//           .status(200)
//           .json({
//             success: true,
//             message:
//               "Book review is already deleted.",
//           });
//       }

//       bookReview.isDeleted =
//         true;

//       bookReview.isActive =
//         false;

//       bookReview.deletedAt =
//         new Date();

//       bookReview.deletedBy =
//         admin;

//       bookReview.updatedBy =
//         admin;

//       await bookReview.save();

//       return res
//         .status(200)
//         .json({
//           success: true,
//           message:
//             "Book review soft deleted successfully.",
//         });
//     } catch (error) {
//       console.error(
//         "softDeleteBookReview:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to delete book review.",
//         });
//     }
//   };

// // ======================================================
// // ADMIN
// // RESTORE SOFT-DELETED REVIEW
// //
// // PATCH
// // /api/book-reviews/admin/:bookReviewId/restore
// // ======================================================

// export const restoreBookReview =
//   async (req, res) => {
//     try {
//       const {
//         bookReviewId,
//       } = req.params;

//       if (
//         !mongoose.Types.ObjectId.isValid(
//           bookReviewId
//         )
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Invalid book review ID.",
//           });
//       }

//       const admin =
//         getAdminIdentifier(req);

//       const bookReview =
//         await BookReview.findById(
//           bookReviewId
//         );

//       if (!bookReview) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Book review not found.",
//           });
//       }

//       if (!bookReview.isDeleted) {
//         return res
//           .status(200)
//           .json({
//             success: true,
//             message:
//               "Book review is already active.",
//           });
//       }

//       bookReview.isDeleted =
//         false;

//       bookReview.deletedAt =
//         null;

//       bookReview.deletedBy =
//         null;

//       if (
//         bookReview.isReviewed
//       ) {
//         bookReview.isActive =
//           true;
//       }

//       bookReview.updatedBy =
//         admin;

//       await bookReview.save();

//       return res
//         .status(200)
//         .json({
//           success: true,

//           message:
//             "Book review restored successfully.",

//           data: {
//             bookReview,
//           },
//         });
//     } catch (error) {
//       console.error(
//         "restoreBookReview:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to restore book review.",
//         });
//     }
//   };

// // ======================================================
// // ADMIN
// // HARD DELETE
// //
// // DELETE
// // /api/book-reviews/admin/:bookReviewId
// // ======================================================

// export const hardDeleteBookReview =
//   async (req, res) => {
//     try {
//       const {
//         bookReviewId,
//       } = req.params;

//       if (
//         !mongoose.Types.ObjectId.isValid(
//           bookReviewId
//         )
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Invalid book review ID.",
//           });
//       }

//       const bookReview =
//         await BookReview.findById(
//           bookReviewId
//         );

//       if (!bookReview) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Book review not found.",
//           });
//       }

//       await BookReview.findByIdAndDelete(
//         bookReviewId
//       );

//       return res
//         .status(200)
//         .json({
//           success: true,
//           message:
//             "Book review permanently deleted successfully.",
//         });
//     } catch (error) {
//       console.error(
//         "hardDeleteBookReview:",
//         error
//       );

//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to permanently delete book review.",
//         });
//     }
//   };


import crypto from "crypto";
import mongoose from "mongoose";

import Book from "../models/Book.js";
import Order from "../models/Order.js";
import BookReview from "../models/BookReview.js";
import sendMail from "../utils/MailSender.js";

// ============================================================
// COMMON HELPERS
// ============================================================

const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const escapeHtml = (value = "") =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getAdminIdentifier = (req) =>
  req.user?.email ||
  req.user?.username ||
  req.user?.name ||
  req.user?._id?.toString() ||
  "admin";

const generateReviewToken = () =>
  crypto.randomBytes(32).toString("hex");

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || "https://www.targettrek.in")
    .replace(/\/$/, "");

const buildReviewUrl = (token) =>
  `${getFrontendUrl()}/review/${token}`;

const safeReviewUrl = (value) => {
  try {
    const url = new URL(String(value || ""));
    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
};

const sendError = (res, status, message, code) =>
  res.status(status).json({
    success: false,
    ...(code ? { code } : {}),
    message,
  });

const paginationOptions = (query, defaultLimit = 20, maxLimit = 100) => {
  const parsedPage = Number(query.page);
  const parsedLimit = Number(query.limit);

  const page = Number.isInteger(parsedPage) && parsedPage > 0
    ? parsedPage
    : 1;

  const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, maxLimit)
    : defaultLimit;

  return { page, limit, skip: (page - 1) * limit };
};

const paginationData = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPreviousPage: page > 1,
});

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const validReviewToken = (token) =>
  typeof token === "string" && /^[a-f0-9]{64}$/i.test(token);

const privateReviewSelection =
  "+customer.name +customer.email +reviewLink.token";

// For admin responses, expose the URL but never the raw token.
const formatAdminReview = (review) => {
  const item = review.toObject ? review.toObject() : review;
  const token = item.reviewLink?.token;

  return {
    ...item,
    reviewUrl: token ? buildReviewUrl(token) : null,
    reviewLink: {
      generatedAt: item.reviewLink?.generatedAt,
      generatedBy: item.reviewLink?.generatedBy,
    },
  };
};

// ============================================================
// FIND ORDER BY MONGODB ID OR ORDER NUMBER
// ============================================================

const findOrder = async (orderIdentifier) => {
  if (isValidId(orderIdentifier)) {
    const order = await Order.findById(orderIdentifier);
    if (order) return order;
  }

  return Order.findOne({ orderId: orderIdentifier });
};

// ============================================================
// VERIFY SUCCESSFUL PURCHASE
// ============================================================

const getPurchaseContext = async (orderIdentifier) => {
  const order = await findOrder(orderIdentifier);

  if (!order) {
    return {
      error: true,
      status: 404,
      message: "Order not found.",
    };
  }

  const allowedOrderStatuses = [
    "PAID",
    "PARTIALLY_REFUNDED",
  ];

  const allowedPaymentStatuses = [
    "SUCCESS",
    "PARTIALLY_REFUNDED",
  ];

  if (
    !allowedOrderStatuses.includes(order.orderStatus) ||
    !allowedPaymentStatuses.includes(order.payment?.status)
  ) {
    return {
      error: true,
      status: 400,
      message:
        "Review can only be requested for a successful purchase.",
    };
  }

  const email = normalizeEmail(order.customer?.email);

  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return {
      error: true,
      status: 400,
      message: "Customer email is missing or invalid.",
    };
  }

  const book = await Book.findById(order.bookId);

  if (!book) {
    return {
      error: true,
      status: 404,
      message: "Book associated with this order was not found.",
    };
  }

  return { error: false, order, book, email };
};

// ============================================================
// FIND EXISTING REVIEW
// ============================================================

const findExistingBookReview = async (bookId, email) => {
  return BookReview.findOne({
    bookId,
    "customer.email": normalizeEmail(email),
  }).select(privateReviewSelection);
};

// ============================================================
// GENERATE OR REUSE REVIEW LINK
// ============================================================

const ensureBookReviewLink = async ({
  order,
  book,
  email,
  admin,
}) => {
  let bookReview = await findExistingBookReview(
    book._id,
    email
  );

  const validateExisting = (review) => {
    if (review.isDeleted) {
      return {
        error: true,
        status: 409,
        code: "REVIEW_DELETED",
        message:
          "This review record is soft deleted. Restore it first.",
      };
    }

    if (
      review.isReviewed ||
      review.status === "REVIEW_SUBMITTED"
    ) {
      return {
        error: true,
        status: 409,
        code: "ALREADY_REVIEWED",
        message:
          "Customer has already submitted a review for this book.",
      };
    }

    return null;
  };

  if (bookReview) {
    const error = validateExisting(bookReview);
    if (error) return error;

    if (bookReview.reviewLink?.token) {
      return {
        error: false,
        created: false,
        bookReview,
        reviewUrl: buildReviewUrl(bookReview.reviewLink.token),
      };
    }

    const token = generateReviewToken();

    bookReview.set("reviewLink.token", token);
    bookReview.set("reviewLink.generatedAt", new Date());
    bookReview.set("reviewLink.generatedBy", admin);
    bookReview.updatedBy = admin;

    await bookReview.save();

    return {
      error: false,
      created: true,
      bookReview,
      reviewUrl: buildReviewUrl(token),
    };
  }

  const token = generateReviewToken();

  try {
    bookReview = await BookReview.create({
      bookId: book._id,

      book: {
        title: book.title,
        slug: book.slug,
        coverPageUrl: book.coverPageUrl || "",
      },

      orderId: order._id,
      orderNumber: order.orderId,

      customer: {
        name: order.customer?.name || null,
        email,
      },

      reviewLink: {
        token,
        generatedAt: new Date(),
        generatedBy: admin,
      },

      status: "LINK_GENERATED",
      isReviewed: false,
      isActive: true,
      isDeleted: false,
      verifiedPurchase: true,
      createdBy: admin,
    });

    return {
      error: false,
      created: true,
      bookReview,
      reviewUrl: buildReviewUrl(token),
    };
  } catch (error) {
    // Recover from simultaneous link-creation requests
    // when a unique MongoDB index prevents duplicates.
    if (error?.code !== 11000) throw error;

    bookReview = await findExistingBookReview(
      book._id,
      email
    );

    if (!bookReview) throw error;

    const validationError = validateExisting(bookReview);
    if (validationError) return validationError;

    if (!bookReview.reviewLink?.token) {
      throw new Error(
        "Concurrent review creation did not produce a token."
      );
    }

    return {
      error: false,
      created: false,
      bookReview,
      reviewUrl: buildReviewUrl(bookReview.reviewLink.token),
    };
  }
};

// ============================================================
// VALIDATE REVIEW PAYLOAD
// ============================================================

const validateReviewPayload = ({
  rating,
  title,
  comment,
} = {}) => {
  const numericRating = Number(rating);

  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return {
      valid: false,
      message: "Rating must be an integer between 1 and 5.",
    };
  }

  const cleanedTitle = String(title || "").trim();
  const cleanedComment = String(comment || "").trim();

  if (cleanedTitle.length > 120) {
    return {
      valid: false,
      message: "Review title cannot exceed 120 characters.",
    };
  }

  if (
    cleanedComment.length < 5 ||
    cleanedComment.length > 3000
  ) {
    return {
      valid: false,
      message:
        "Review comment must contain between 5 and 3000 characters.",
    };
  }

  return {
    valid: true,
    data: {
      rating: numericRating,
      title: cleanedTitle,
      comment: cleanedComment,
    },
  };
};

// ============================================================
// PROFESSIONAL TARGET TREK REVIEW EMAIL TEMPLATE
// ============================================================

const buildReviewMailHtml = ({
  customerName,
  book,
  reviewUrl,
}) => {
  const name = escapeHtml(
    String(customerName || "Reader").trim()
  );

  const title = escapeHtml(book.title || "Your Book");
  const subtitle = escapeHtml(book.subtitle || "");

  const cover = escapeHtml(
    safeReviewUrl(book.coverPageUrl)
  );

  const reviewLink = safeReviewUrl(reviewUrl);

  if (!reviewLink) {
    throw new Error("Invalid review URL.");
  }

  const link = escapeHtml(reviewLink);
  const site = escapeHtml(getFrontendUrl());
  const booksPage = `${site}/books`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport"
        content="width=device-width, initial-scale=1.0" />
  <title>Share Your Review | Target Trek</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f3f6fb;
  font-family:Arial,Helvetica,sans-serif;
  color:#172033;
">

<table role="presentation"
       cellpadding="0"
       cellspacing="0"
       width="100%"
       style="background:#f3f6fb;padding:30px 12px;">

<tr>
<td align="center">

<table role="presentation"
       cellpadding="0"
       cellspacing="0"
       width="100%"
       style="
         max-width:600px;
         background:#ffffff;
         border:1px solid #e4eaf2;
         border-radius:14px;
         overflow:hidden;
       ">

  <!-- HEADER -->
  <tr>
    <td align="center"
        style="background:#12233f;padding:32px 20px;">

      <a href="${site}"
         style="
           color:#ffffff;
           font-size:27px;
           font-weight:800;
           text-decoration:none;
           letter-spacing:0.4px;
         ">
        TARGET
        <span style="color:#7eb6ff;">TREK</span>
      </a>

      <p style="
        color:#c9d5e6;
        font-size:13px;
        margin:12px 0 0;
      ">
        Learn Better. Build Better. Grow Faster.
      </p>

    </td>
  </tr>

  <!-- GREETING -->
  <tr>
    <td style="padding:34px 30px 10px;">

      <p style="
        font-size:16px;
        line-height:26px;
        margin:0 0 18px;
      ">
        Hi <strong>${name}</strong>,
      </p>

      <h1 style="
        font-size:25px;
        line-height:34px;
        color:#172033;
        margin:0 0 16px;
      ">
        How are you enjoying your book?
      </h1>

      <p style="
        font-size:15px;
        line-height:26px;
        color:#526179;
        margin:0 0 16px;
      ">
        We hope you're enjoying
        <strong>${title}</strong>
        and finding it helpful in your learning journey!
      </p>

      <p style="
        font-size:15px;
        line-height:26px;
        color:#526179;
        margin:0;
      ">
        Thank you for choosing Target Trek as part
        of your learning and career preparation.
        We'd love to hear how the book is working for you.
      </p>

    </td>
  </tr>

  <!-- BOOK DETAILS -->
  <tr>
    <td style="padding:24px 30px;">

      <table role="presentation"
             width="100%"
             cellpadding="0"
             cellspacing="0"
             style="
               background:#f7f9fd;
               border:1px solid #e4eaf2;
               border-radius:10px;
             ">

        <tr>

          ${
            cover
              ? `
          <td width="112"
              style="padding:16px 8px 16px 16px;vertical-align:middle;">

            <img src="${cover}"
                 alt="${title} cover"
                 width="96"
                 style="
                   display:block;
                   width:96px;
                   max-width:100%;
                   height:auto;
                   border-radius:6px;
                   border:0;
                 " />
          </td>
          `
              : ""
          }

          <td style="padding:16px;vertical-align:middle;">

            <p style="
              color:#64748b;
              font-size:11px;
              font-weight:bold;
              letter-spacing:1px;
              margin:0 0 8px;
            ">
              YOUR PURCHASED BOOK
            </p>

            <h2 style="
              color:#172033;
              font-size:18px;
              line-height:25px;
              margin:0 0 8px;
            ">
              ${title}
            </h2>

            ${
              subtitle
                ? `
            <p style="
              color:#64748b;
              font-size:13px;
              line-height:21px;
              margin:0 0 8px;
            ">
              ${subtitle}
            </p>
            `
                : ""
            }

            <p style="
              color:#2563eb;
              font-size:12px;
              font-weight:bold;
              margin:10px 0 0;
            ">
              Target Trek Digital Books
            </p>

          </td>
        </tr>

      </table>

    </td>
  </tr>

  <!-- REVIEW REQUEST -->
  <tr>
    <td style="padding:0 30px 30px;">

      <h2 style="
        font-size:21px;
        line-height:29px;
        color:#172033;
        margin:0 0 14px;
      ">
        We'd love your honest feedback!
      </h2>

      <p style="
        color:#526179;
        font-size:15px;
        line-height:26px;
        margin:0 0 15px;
      ">
        Did you find the explanations helpful?
        Were the examples useful?
        Is there anything we could improve?
      </p>

      <p style="
        color:#526179;
        font-size:15px;
        line-height:26px;
        margin:0 0 25px;
      ">
        Whether you loved the book or have suggestions,
        your honest feedback means a lot to us.
        It helps us create better learning resources
        and helps other developers make informed decisions.
      </p>

      <!-- CTA BUTTON -->
      <table role="presentation"
             width="100%"
             cellpadding="0"
             cellspacing="0">

        <tr>
          <td align="center">

            <a href="${link}"
               target="_blank"
               style="
                 display:inline-block;
                 background:#2563eb;
                 color:#ffffff;
                 text-decoration:none;
                 padding:16px 34px;
                 border-radius:8px;
                 font-size:15px;
                 font-weight:bold;
               ">
              Share Your Review &#8594;
            </a>

          </td>
        </tr>
      </table>

      <p style="
        color:#64748b;
        font-size:12px;
        line-height:20px;
        text-align:center;
        margin:16px 0 0;
      ">
        It only takes a minute to share your experience.
      </p>

      <p style="
        color:#64748b;
        font-size:12px;
        line-height:20px;
        text-align:center;
        margin:8px 0 0;
      ">
        This review link is unique to your purchase
        and allows one review submission.
      </p>

      <!-- THANK YOU BOX -->
      <table role="presentation"
             width="100%"
             cellpadding="0"
             cellspacing="0"
             style="
               background:#eff6ff;
               border-radius:10px;
               margin-top:26px;
             ">

        <tr>
          <td style="padding:20px;">

            <p style="
              color:#1e40af;
              font-size:15px;
              font-weight:bold;
              margin:0 0 9px;
            ">
              Thank you for being part of Target Trek!
            </p>

            <p style="
              color:#526179;
              font-size:14px;
              line-height:24px;
              margin:0;
            ">
              We're continuously improving our books
              with practical explanations, real-world
              examples, and interview-focused content.

              Your feedback helps us get better.
            </p>

          </td>
        </tr>

      </table>

      <!-- SIGNATURE -->
      <p style="
        color:#526179;
        font-size:14px;
        line-height:24px;
        margin:26px 0 0;
      ">
        Happy Learning!
        <br />
        <strong>Team Target Trek</strong>
      </p>

    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td align="center"
        style="
          background:#f8fafc;
          border-top:1px solid #e4eaf2;
          padding:26px;
        ">

      <p style="
        font-size:14px;
        font-weight:bold;
        color:#172033;
        margin:0 0 12px;
      ">
        TARGET TREK
      </p>

      <p style="margin:0 0 14px;font-size:13px;">

        <a href="${booksPage}"
           style="color:#2563eb;text-decoration:none;">
          Explore More Books
        </a>

        &nbsp;|&nbsp;

        <a href="${site}"
           style="color:#2563eb;text-decoration:none;">
          Visit Website
        </a>

      </p>

      <p style="
        font-size:11px;
        line-height:19px;
        color:#8491a4;
        margin:0;
      ">
        You received this email because you purchased
        a digital book from Target Trek.
      </p>

      <p style="
        color:#8491a4;
        font-size:11px;
        margin:10px 0 0;
      ">
        &copy; ${new Date().getFullYear()} Target Trek.
        All rights reserved.
      </p>

    </td>
  </tr>

</table>
</td>
</tr>
</table>

</body>
</html>
`;
};

// ============================================================
// ADMIN - CREATE BOOK REVIEW LINK
// POST /api/book-reviews/admin/order/:orderIdentifier/link
// ============================================================

export const createBookReviewLink = async (req, res) => {
  try {
    const { orderIdentifier } = req.params;

    const purchase = await getPurchaseContext(orderIdentifier);

    if (purchase.error) {
      return sendError(res, purchase.status, purchase.message);
    }

    const { order, book, email } = purchase;
    const admin = getAdminIdentifier(req);

    const result = await ensureBookReviewLink({
      order,
      book,
      email,
      admin,
    });

    if (result.error) {
      return sendError(
        res,
        result.status,
        result.message,
        result.code
      );
    }

    return res.status(result.created ? 201 : 200).json({
      success: true,
      message: result.created
        ? "Book review link generated successfully."
        : "Book review link already exists.",

      data: {
        bookReviewId: result.bookReview._id,
        alreadyGenerated: !result.created,
        reviewUrl: result.reviewUrl,
        generatedAt: result.bookReview.reviewLink?.generatedAt,

        order: {
          _id: order._id,
          orderId: order.orderId,
        },

        book: {
          _id: book._id,
          title: book.title,
          slug: book.slug,
          coverPageUrl: book.coverPageUrl,
        },
      },
    });
  } catch (error) {
    console.error("createBookReviewLink:", error);

    return sendError(
      res,
      500,
      "Unable to generate book review link."
    );
  }
};

// ============================================================
// ADMIN - SEND BOOK REVIEW EMAIL
// POST /api/book-reviews/admin/order/:orderIdentifier/send-mail
// ============================================================

export const sendBookReviewMail = async (req, res) => {
  try {
    const { orderIdentifier } = req.params;

    // 1. Validate purchase
    const purchase = await getPurchaseContext(orderIdentifier);

    if (purchase.error) {
      return sendError(res, purchase.status, purchase.message);
    }

    const { order, book, email } = purchase;
    const admin = getAdminIdentifier(req);

    // 2. Generate/reuse link
    const result = await ensureBookReviewLink({
      order,
      book,
      email,
      admin,
    });

    if (result.error) {
      return sendError(
        res,
        result.status,
        result.message,
        result.code
      );
    }

    const bookReview = result.bookReview;
    const reviewUrl = result.reviewUrl;
    const customerName = order.customer?.name || "Reader";

    // 3. Build email
    const subject =
      `How are you enjoying ${book.title}? Share your review`;

    const html = buildReviewMailHtml({
      customerName,
      book,
      reviewUrl,
    });

    const text = [
      `Hi ${customerName},`,
      "",
      `We hope you're enjoying "${book.title}" and finding it helpful in your learning journey!`,
      "",
      "Thank you for purchasing your book from Target Trek.",
      "",
      "We'd love to hear your honest feedback.",
      "",
      "Did you find the explanations helpful?",
      "Were the practical examples useful?",
      "Is there anything we could improve?",
      "",
      "Your feedback helps us create better resources and helps other developers.",
      "",
      "Share your review here:",
      reviewUrl,
      "",
      "This link is unique to your purchase and allows one review submission.",
      "",
      "Thank you for being part of Target Trek!",
      "",
      "Happy Learning!",
      "Team Target Trek",
      "",
      `Explore more books: ${getFrontendUrl()}/books`,
    ].join("\n");

    const now = new Date();

    // 4. Send email separately from database tracking
    let mailInfo;

    try {
      console.log("Sending book review mail:", {
        orderId: order.orderId,
        bookTitle: book.title,
        recipient: email,
      });

      // IMPORTANT FIX:
      // MailSender.js expects positional arguments.
      mailInfo = await sendMail(
        email,
        subject,
        text,
        html
      );

      console.log("Book review mail accepted:", {
        messageId: mailInfo?.messageId,
        accepted: mailInfo?.accepted,
        rejected: mailInfo?.rejected,
      });
    } catch (mailError) {
      console.error("sendBookReviewMail send error:", {
        message: mailError?.message,
        code: mailError?.code,
        response: mailError?.response,
        stack: mailError?.stack,
      });

      try {
        bookReview.set("reviewMail.lastAttemptAt", now);
        bookReview.set("reviewMail.lastSentBy", admin);
        bookReview.set("reviewMail.lastStatus", "FAILED");
        bookReview.set(
          "reviewMail.lastError",
          String(mailError?.message || "Unknown mail error")
            .slice(0, 1000)
        );

        bookReview.updatedBy = admin;
        await bookReview.save();
      } catch (trackingError) {
        console.error(
          "Could not save failed email tracking:",
          trackingError
        );
      }

      return res.status(502).json({
        success: false,
        code: "REVIEW_MAIL_SEND_FAILED",
        message:
          "Book review link is available, but email could not be sent.",

        data: {
          bookReviewId: bookReview._id,
          reviewUrl,
        },
      });
    }

    // 5. Track successful mail sending
    try {
      const sentAt = new Date();

      bookReview.set("reviewMail.lastAttemptAt", now);
      bookReview.set("reviewMail.lastSentBy", admin);
      bookReview.set(
        "reviewMail.sentCount",
        (bookReview.reviewMail?.sentCount || 0) + 1
      );

      if (!bookReview.reviewMail?.firstSentAt) {
        bookReview.set("reviewMail.firstSentAt", sentAt);
      }

      bookReview.set("reviewMail.lastSentAt", sentAt);
      bookReview.set("reviewMail.lastStatus", "SENT");
      bookReview.set("reviewMail.lastError", null);

      bookReview.updatedBy = admin;

      await bookReview.save();
    } catch (trackingError) {
      console.error(
        "Email accepted but tracking failed:",
        trackingError
      );

      return res.status(500).json({
        success: false,
        code: "REVIEW_MAIL_TRACKING_FAILED",
        message:
          "Email was accepted by the mail provider, but tracking could not be saved. Check before resending.",

        data: {
          bookReviewId: bookReview._id,
          reviewUrl,
          emailAccepted: true,
          messageId: mailInfo?.messageId || null,
        },
      });
    }

    // 6. Success response
    return res.status(200).json({
      success: true,
      message: "Book review mail sent successfully.",

      data: {
        bookReviewId: bookReview._id,
        reviewUrl,
        linkCreated: result.created,

        sentCount: bookReview.reviewMail.sentCount,
        firstSentAt: bookReview.reviewMail.firstSentAt,
        lastSentAt: bookReview.reviewMail.lastSentAt,

        order: {
          orderId: order.orderId,
        },

        book: {
          _id: book._id,
          title: book.title,
          slug: book.slug,
        },
      },
    });
  } catch (error) {
    console.error("sendBookReviewMail:", error);

    return sendError(
      res,
      500,
      "Unable to send book review mail."
    );
  }
};

// ============================================================
// PUBLIC - VERIFY REVIEW LINK
// GET /api/book-reviews/link/:token
// ============================================================

export const getBookReviewLink = async (req, res) => {
  try {
    const { token } = req.params;

    if (!validReviewToken(token)) {
      return sendError(res, 400, "Invalid review link.");
    }

    const bookReview = await BookReview.findOne({
      "reviewLink.token": token,
      isDeleted: false,
    }).select("+reviewLink.token");

    if (!bookReview) {
      return sendError(
        res,
        404,
        "Review link is invalid or no longer available."
      );
    }

    const book = {
      _id: bookReview.bookId,
      title: bookReview.book.title,
      slug: bookReview.book.slug,
      coverPageUrl: bookReview.book.coverPageUrl,
    };

    if (
      bookReview.isReviewed ||
      bookReview.status === "REVIEW_SUBMITTED"
    ) {
      return res.status(200).json({
        success: true,
        data: {
          canReview: false,
          reason: "ALREADY_REVIEWED",
          message:
            "Review has already been submitted for this book.",
          book,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        canReview: true,
        book,
        reviewFields: {
          rating: { min: 1, max: 5, required: true },
          title: { required: false, maxLength: 120 },
          comment: {
            required: true,
            minLength: 5,
            maxLength: 3000,
          },
        },
      },
    });
  } catch (error) {
    console.error("getBookReviewLink:", error);

    return sendError(
      res,
      500,
      "Unable to verify review link."
    );
  }
};

// ============================================================
// PUBLIC - SUBMIT BOOK REVIEW
// POST /api/book-reviews/link/:token
// ============================================================

export const submitBookReview = async (req, res) => {
  try {
    const { token } = req.params;

    if (!validReviewToken(token)) {
      return sendError(res, 400, "Invalid review link.");
    }

    const validation = validateReviewPayload(req.body);

    if (!validation.valid) {
      return sendError(res, 400, validation.message);
    }

    const { rating, title, comment } = validation.data;
    const now = new Date();

    // Atomic update: only one successful submission.
    const bookReview = await BookReview.findOneAndUpdate(
      {
        "reviewLink.token": token,
        isDeleted: false,
        isReviewed: false,
        status: "LINK_GENERATED",
      },
      {
        $set: {
          "review.rating": rating,
          "review.title": title,
          "review.comment": comment,
          "review.submittedAt": now,
          "review.lastEditedAt": null,
          "review.lastEditedBy": null,
          "review.editedByAdmin": false,

          status: "REVIEW_SUBMITTED",
          isReviewed: true,
          isActive: true,
          updatedBy: "customer",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bookReview) {
      const existing = await BookReview.findOne({
        "reviewLink.token": token,
      });

      if (!existing) {
        return sendError(res, 404, "Review link is invalid.");
      }

      if (existing.isDeleted) {
        return sendError(
          res,
          410,
          "This review link is no longer available."
        );
      }

      if (
        existing.isReviewed ||
        existing.status === "REVIEW_SUBMITTED"
      ) {
        return sendError(
          res,
          409,
          "You have already submitted a review for this book.",
          "ALREADY_REVIEWED"
        );
      }

      return sendError(
        res,
        400,
        "Unable to submit review."
      );
    }

    return res.status(201).json({
      success: true,
      message:
        "Thank you! Your review has been submitted successfully.",

      data: {
        bookReviewId: bookReview._id,

        book: {
          _id: bookReview.bookId,
          title: bookReview.book.title,
          slug: bookReview.book.slug,
        },

        review: {
          rating: bookReview.review.rating,
          title: bookReview.review.title,
          comment: bookReview.review.comment,
          submittedAt: bookReview.review.submittedAt,
        },
      },
    });
  } catch (error) {
    console.error("submitBookReview:", error);

    return sendError(
      res,
      500,
      "Unable to submit book review."
    );
  }
};

// ============================================================
// RATING STATISTICS HELPER
// ============================================================

const ratingAggregation = (match) => [
  { $match: match },
  {
    $group: {
      _id: null,
      totalReviews: { $sum: 1 },
      averageRating: { $avg: "$review.rating" },

      rating1: {
        $sum: {
          $cond: [{ $eq: ["$review.rating", 1] }, 1, 0],
        },
      },

      rating2: {
        $sum: {
          $cond: [{ $eq: ["$review.rating", 2] }, 1, 0],
        },
      },

      rating3: {
        $sum: {
          $cond: [{ $eq: ["$review.rating", 3] }, 1, 0],
        },
      },

      rating4: {
        $sum: {
          $cond: [{ $eq: ["$review.rating", 4] }, 1, 0],
        },
      },

      rating5: {
        $sum: {
          $cond: [{ $eq: ["$review.rating", 5] }, 1, 0],
        },
      },
    },
  },
];

const formatRatingDistribution = (stats = {}) => ({
  1: stats.rating1 || 0,
  2: stats.rating2 || 0,
  3: stats.rating3 || 0,
  4: stats.rating4 || 0,
  5: stats.rating5 || 0,
});

// ============================================================
// PUBLIC - GET REVIEWS FOR ONE BOOK
// GET /api/book-reviews/book/:bookIdentifier
// ============================================================

export const getPublicBookReviews = async (req, res) => {
  try {
    const { bookIdentifier } = req.params;

    let book = null;

    if (isValidId(bookIdentifier)) {
      book = await Book.findById(bookIdentifier)
        .select("title slug coverPageUrl")
        .lean();
    }

    if (!book) {
      book = await Book.findOne({
        slug: String(bookIdentifier).trim().toLowerCase(),
      })
        .select("title slug coverPageUrl")
        .lean();
    }

    if (!book) {
      return sendError(res, 404, "Book not found.");
    }

    const { page, limit, skip } = paginationOptions(
      req.query,
      10,
      50
    );

    const filter = {
      bookId: book._id,
      status: "REVIEW_SUBMITTED",
      isReviewed: true,
      isActive: true,
      isDeleted: false,
    };

    if (req.query.rating !== undefined) {
      const rating = Number(req.query.rating);

      if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        return sendError(
          res,
          400,
          "Rating filter must be between 1 and 5."
        );
      }

      filter["review.rating"] = rating;
    }

    let sort = { "review.submittedAt": -1 };

    switch (req.query.sort) {
      case "oldest":
        sort = { "review.submittedAt": 1 };
        break;

      case "highest":
        sort = {
          "review.rating": -1,
          "review.submittedAt": -1,
        };
        break;

      case "lowest":
        sort = {
          "review.rating": 1,
          "review.submittedAt": -1,
        };
        break;
    }

    const statsFilter = {
      bookId: book._id,
      status: "REVIEW_SUBMITTED",
      isReviewed: true,
      isActive: true,
      isDeleted: false,
    };

    const [reviews, total, stats] = await Promise.all([
      BookReview.find(filter)
        .select("review verifiedPurchase")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      BookReview.countDocuments(filter),

      BookReview.aggregate(
        ratingAggregation(statsFilter)
      ),
    ]);

    const ratingStats = stats[0] || {};

    return res.status(200).json({
      success: true,
      data: {
        book,

        stats: {
          totalReviews: ratingStats.totalReviews || 0,
          averageRating: Number(
            ratingStats.averageRating || 0
          ).toFixed(1),
          distribution: formatRatingDistribution(ratingStats),
        },

        reviews: reviews.map((item) => ({
          _id: item._id,
          reviewer: "Verified Buyer",
          verifiedPurchase: item.verifiedPurchase,
          rating: item.review?.rating,
          title: item.review?.title,
          comment: item.review?.comment,
          submittedAt: item.review?.submittedAt,
        })),

        pagination: paginationData(page, limit, total),
      },
    });
  } catch (error) {
    console.error("getPublicBookReviews:", error);

    return sendError(
      res,
      500,
      "Unable to fetch book reviews."
    );
  }
};

// ============================================================
// ADMIN FILTER HELPER
// ============================================================

const buildAdminReviewFilter = (query, bookId = null) => {
  const filter = {};

  if (bookId) {
    if (!isValidId(bookId)) {
      return { error: "Invalid book ID." };
    }

    filter.bookId = new mongoose.Types.ObjectId(bookId);
  } else if (query.bookId) {
    if (!isValidId(query.bookId)) {
      return { error: "Invalid bookId." };
    }

    filter.bookId = new mongoose.Types.ObjectId(
      query.bookId
    );
  }

  if (query.status) {
    if (
      !["LINK_GENERATED", "REVIEW_SUBMITTED"].includes(
        query.status
      )
    ) {
      return { error: "Invalid review status." };
    }

    filter.status = query.status;
  }

  if (query.isActive === "true") {
    filter.isActive = true;
  } else if (query.isActive === "false") {
    filter.isActive = false;
  }

  if (query.deleted === "true") {
    filter.isDeleted = true;
  } else if (query.deleted !== "all") {
    filter.isDeleted = false;
  }

  if (query.rating !== undefined) {
    const rating = Number(query.rating);

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return { error: "Rating must be between 1 and 5." };
    }

    filter["review.rating"] = rating;
  }

  if (query.mailStatus) {
    if (
      !["NOT_SENT", "SENT", "FAILED"].includes(
        query.mailStatus
      )
    ) {
      return { error: "Invalid mail status." };
    }

    filter["reviewMail.lastStatus"] = query.mailStatus;
  }

  if (query.search?.trim()) {
    const search = new RegExp(
      escapeRegex(query.search.trim().slice(0, 200)),
      "i"
    );

    filter.$or = [
      { "customer.name": search },
      { "customer.email": search },
      { orderNumber: search },
      { "book.title": search },
      { "book.slug": search },
      { "review.title": search },
      { "review.comment": search },
    ];
  }

  return { filter };
};

// ============================================================
// ADMIN - GET ALL BOOK REVIEWS
// GET /api/book-reviews/admin
// ============================================================

export const getAllBookReviews = async (req, res) => {
  try {
    const { page, limit, skip } = paginationOptions(
      req.query
    );

    const built = buildAdminReviewFilter(req.query);

    if (built.error) {
      return sendError(res, 400, built.error);
    }

    const { filter } = built;

    const [reviews, total] = await Promise.all([
      BookReview.find(filter)
        .select(privateReviewSelection)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      BookReview.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,

      data: {
        bookReviews: reviews.map(formatAdminReview),
        pagination: paginationData(page, limit, total),
      },
    });
  } catch (error) {
    console.error("getAllBookReviews:", error);

    return sendError(
      res,
      500,
      "Unable to fetch book reviews."
    );
  }
};

// ============================================================
// ADMIN - GET REVIEWS FOR A BOOK
// GET /api/book-reviews/admin/book/:bookId
// ============================================================

export const getBookReviewsForAdmin = async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!isValidId(bookId)) {
      return sendError(res, 400, "Invalid book ID.");
    }

    const book = await Book.findById(bookId)
      .select("title slug coverPageUrl price mrp currency")
      .lean();

    if (!book) {
      return sendError(res, 404, "Book not found.");
    }

    const { page, limit, skip } = paginationOptions(
      req.query
    );

    const built = buildAdminReviewFilter(
      req.query,
      bookId
    );

    if (built.error) {
      return sendError(res, 400, built.error);
    }

    const { filter } = built;

    const [reviews, total] = await Promise.all([
      BookReview.find(filter)
        .select(privateReviewSelection)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      BookReview.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,

      data: {
        book,
        bookReviews: reviews.map(formatAdminReview),
        pagination: paginationData(page, limit, total),
      },
    });
  } catch (error) {
    console.error("getBookReviewsForAdmin:", error);

    return sendError(
      res,
      500,
      "Unable to fetch book reviews."
    );
  }
};

// ============================================================
// ADMIN - BOOK REVIEW STATISTICS
// GET /api/book-reviews/admin/book/:bookId/stats
// ============================================================

export const getBookReviewStats = async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!isValidId(bookId)) {
      return sendError(res, 400, "Invalid book ID.");
    }

    const objectBookId = new mongoose.Types.ObjectId(bookId);

    const book = await Book.findById(objectBookId)
      .select("title slug coverPageUrl")
      .lean();

    if (!book) {
      return sendError(res, 404, "Book not found.");
    }

    const base = { bookId: objectBookId };

    const [
      total,
      totalActiveRecords,
      linksGenerated,
      submitted,
      activeReviews,
      inactiveReviews,
      deleted,
      ratingStats,
      mailStats,
    ] = await Promise.all([
      BookReview.countDocuments(base),

      BookReview.countDocuments({
        ...base,
        isDeleted: false,
      }),

      BookReview.countDocuments({
        ...base,
        status: "LINK_GENERATED",
        isDeleted: false,
      }),

      BookReview.countDocuments({
        ...base,
        status: "REVIEW_SUBMITTED",
        isDeleted: false,
      }),

      BookReview.countDocuments({
        ...base,
        status: "REVIEW_SUBMITTED",
        isActive: true,
        isDeleted: false,
      }),

      BookReview.countDocuments({
        ...base,
        status: "REVIEW_SUBMITTED",
        isActive: false,
        isDeleted: false,
      }),

      BookReview.countDocuments({
        ...base,
        isDeleted: true,
      }),

      BookReview.aggregate(
        ratingAggregation({
          ...base,
          status: "REVIEW_SUBMITTED",
          isDeleted: false,
        })
      ),

      BookReview.aggregate([
        { $match: base },
        {
          $group: {
            _id: null,
            totalEmailsSent: {
              $sum: "$reviewMail.sentCount",
            },
          },
        },
      ]),
    ]);

    const rating = ratingStats[0] || {};

    return res.status(200).json({
      success: true,

      data: {
        book,

        stats: {
          totalReviewRecords: total,
          totalActiveRecords,
          pendingReviews: linksGenerated,
          submittedReviews: submitted,
          activeReviews,
          inactiveReviews,
          deletedReviews: deleted,

          totalEmailsSent:
            mailStats[0]?.totalEmailsSent || 0,

          averageRating: Number(
            rating.averageRating || 0
          ).toFixed(1),

          ratingDistribution:
            formatRatingDistribution(rating),
        },
      },
    });
  } catch (error) {
    console.error("getBookReviewStats:", error);

    return sendError(
      res,
      500,
      "Unable to fetch book review statistics."
    );
  }
};

// ============================================================
// ADMIN - GET SINGLE BOOK REVIEW
// GET /api/book-reviews/admin/:bookReviewId
// ============================================================

export const getBookReviewById = async (req, res) => {
  try {
    const { bookReviewId } = req.params;

    if (!isValidId(bookReviewId)) {
      return sendError(res, 400, "Invalid book review ID.");
    }

    const bookReview = await BookReview.findById(
      bookReviewId
    )
      .select(privateReviewSelection)
      .lean();

    if (!bookReview) {
      return sendError(res, 404, "Book review not found.");
    }

    return res.status(200).json({
      success: true,

      data: {
        bookReview: formatAdminReview(bookReview),
      },
    });
  } catch (error) {
    console.error("getBookReviewById:", error);

    return sendError(
      res,
      500,
      "Unable to fetch book review."
    );
  }
};

// ============================================================
// ADMIN - UPDATE BOOK REVIEW
// PATCH /api/book-reviews/admin/:bookReviewId
// ============================================================

export const updateBookReview = async (req, res) => {
  try {
    const { bookReviewId } = req.params;

    if (!isValidId(bookReviewId)) {
      return sendError(res, 400, "Invalid book review ID.");
    }

    const bookReview = await BookReview.findById(
      bookReviewId
    ).select("+customer.name +customer.email");

    if (!bookReview) {
      return sendError(res, 404, "Book review not found.");
    }

    if (bookReview.isDeleted) {
      return sendError(
        res,
        400,
        "Restore the book review before updating it."
      );
    }

    const admin = getAdminIdentifier(req);

    const {
      rating,
      title,
      comment,
      isActive,
      adminNotes,
    } = req.body || {};

    const wantsToEditReview =
      rating !== undefined ||
      title !== undefined ||
      comment !== undefined;

    if (wantsToEditReview && !bookReview.isReviewed) {
      return sendError(
        res,
        400,
        "Review content cannot be edited because the customer has not submitted a review yet."
      );
    }

    let reviewModified = false;

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return sendError(
          res,
          400,
          "Rating must be between 1 and 5."
        );
      }

      bookReview.review.rating = numericRating;
      reviewModified = true;
    }

    if (title !== undefined) {
      const cleanedTitle = String(title).trim();

      if (cleanedTitle.length > 120) {
        return sendError(
          res,
          400,
          "Review title cannot exceed 120 characters."
        );
      }

      bookReview.review.title = cleanedTitle;
      reviewModified = true;
    }

    if (comment !== undefined) {
      const cleanedComment = String(comment).trim();

      if (
        cleanedComment.length < 5 ||
        cleanedComment.length > 3000
      ) {
        return sendError(
          res,
          400,
          "Review comment must contain between 5 and 3000 characters."
        );
      }

      bookReview.review.comment = cleanedComment;
      reviewModified = true;
    }

    if (typeof isActive === "boolean") {
      bookReview.isActive = isActive;
    }

    if (adminNotes !== undefined) {
      const notes = String(adminNotes).trim();

      if (notes.length > 1000) {
        return sendError(
          res,
          400,
          "Admin notes cannot exceed 1000 characters."
        );
      }

      bookReview.adminNotes = notes;
    }

    if (reviewModified) {
      bookReview.review.lastEditedAt = new Date();
      bookReview.review.lastEditedBy = admin;
      bookReview.review.editedByAdmin = true;
    }

    bookReview.updatedBy = admin;

    await bookReview.save();

    return res.status(200).json({
      success: true,
      message: "Book review updated successfully.",

      data: {
        bookReview,
      },
    });
  } catch (error) {
    console.error("updateBookReview:", error);

    return sendError(
      res,
      500,
      "Unable to update book review."
    );
  }
};

// ============================================================
// ADMIN - SOFT DELETE BOOK REVIEW
// PATCH /api/book-reviews/admin/:bookReviewId/soft-delete
// ============================================================

export const softDeleteBookReview = async (req, res) => {
  try {
    const { bookReviewId } = req.params;

    if (!isValidId(bookReviewId)) {
      return sendError(res, 400, "Invalid book review ID.");
    }

    const bookReview = await BookReview.findById(
      bookReviewId
    );

    if (!bookReview) {
      return sendError(res, 404, "Book review not found.");
    }

    if (bookReview.isDeleted) {
      return res.status(200).json({
        success: true,
        message: "Book review is already deleted.",
      });
    }

    const admin = getAdminIdentifier(req);

    bookReview.isDeleted = true;
    bookReview.isActive = false;
    bookReview.deletedAt = new Date();
    bookReview.deletedBy = admin;
    bookReview.updatedBy = admin;

    await bookReview.save();

    return res.status(200).json({
      success: true,
      message: "Book review soft deleted successfully.",
    });
  } catch (error) {
    console.error("softDeleteBookReview:", error);

    return sendError(
      res,
      500,
      "Unable to delete book review."
    );
  }
};

// ============================================================
// ADMIN - RESTORE SOFT DELETED REVIEW
// PATCH /api/book-reviews/admin/:bookReviewId/restore
// ============================================================

export const restoreBookReview = async (req, res) => {
  try {
    const { bookReviewId } = req.params;

    if (!isValidId(bookReviewId)) {
      return sendError(res, 400, "Invalid book review ID.");
    }

    const bookReview = await BookReview.findById(
      bookReviewId
    );

    if (!bookReview) {
      return sendError(res, 404, "Book review not found.");
    }

    if (!bookReview.isDeleted) {
      return res.status(200).json({
        success: true,
        message: "Book review is already active.",
      });
    }

    const admin = getAdminIdentifier(req);

    bookReview.isDeleted = false;
    bookReview.deletedAt = null;
    bookReview.deletedBy = null;

    if (bookReview.isReviewed) {
      bookReview.isActive = true;
    }

    bookReview.updatedBy = admin;

    await bookReview.save();

    return res.status(200).json({
      success: true,
      message: "Book review restored successfully.",

      data: {
        bookReview,
      },
    });
  } catch (error) {
    console.error("restoreBookReview:", error);

    return sendError(
      res,
      500,
      "Unable to restore book review."
    );
  }
};

// ============================================================
// ADMIN - PERMANENTLY DELETE BOOK REVIEW
// DELETE /api/book-reviews/admin/:bookReviewId
// ============================================================

export const hardDeleteBookReview = async (req, res) => {
  try {
    const { bookReviewId } = req.params;

    if (!isValidId(bookReviewId)) {
      return sendError(res, 400, "Invalid book review ID.");
    }

    const bookReview = await BookReview.findById(
      bookReviewId
    );

    if (!bookReview) {
      return sendError(res, 404, "Book review not found.");
    }

    await BookReview.findByIdAndDelete(bookReviewId);

    return res.status(200).json({
      success: true,
      message:
        "Book review permanently deleted successfully.",
    });
  } catch (error) {
    console.error("hardDeleteBookReview:", error);

    return sendError(
      res,
      500,
      "Unable to permanently delete book review."
    );
  }
};
