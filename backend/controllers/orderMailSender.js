// import mongoose from "mongoose";
// import crypto from "crypto";

// import Order from "../models/Order.js";
// import Book from "../models/Book.js";

// import sendMail from "../utils/MailSender.js";

// import {
//   validateCouponForPayment,
// } from "../controllers/couponController.js";


// /* =========================================================
//    CONSTANTS
// ========================================================= */

// const TARGET_TREK_URL =
//   "https://www.targettrek.in";

// const ALL_BOOKS_URL =
//   `${TARGET_TREK_URL}/books`;

// const SUPPORT_EMAIL =
//   "supporttargettrek@gmail.com";

// /*
//  * Default access duration:
//  * 24 hours
//  */
// const ACCESS_DURATION =
//   24 * 60 * 60 * 1000;


// /* =========================================================
//    COMMON HELPERS
// ========================================================= */

// const escapeHtml = (
//   value = ""
// ) => {
//   return String(value)
//     .replaceAll(
//       "&",
//       "&amp;"
//     )
//     .replaceAll(
//       "<",
//       "&lt;"
//     )
//     .replaceAll(
//       ">",
//       "&gt;"
//     )
//     .replaceAll(
//       '"',
//       "&quot;"
//     )
//     .replaceAll(
//       "'",
//       "&#039;"
//     );
// };


// const getCurrencySymbol = (
//   currency = "INR"
// ) => {
//   const normalized =
//     String(currency)
//       .trim()
//       .toUpperCase();

//   if (
//     normalized === "INR"
//   ) {
//     return "₹";
//   }

//   if (
//     normalized === "USD"
//   ) {
//     return "$";
//   }

//   if (
//     normalized === "EUR"
//   ) {
//     return "€";
//   }

//   if (
//     normalized === "GBP"
//   ) {
//     return "£";
//   }

//   return `${normalized} `;
// };


// const formatAmount = (
//   amount,
//   currency = "INR"
// ) => {
//   const number =
//     Number(
//       amount || 0
//     );

//   return (
//     `${getCurrencySymbol(
//       currency
//     )}${number.toFixed(2)}`
//   );
// };


// const formatDate = (
//   date
// ) => {
//   if (!date) {
//     return "N/A";
//   }

//   const parsed =
//     new Date(date);

//   if (
//     Number.isNaN(
//       parsed.getTime()
//     )
//   ) {
//     return "N/A";
//   }

//   return parsed.toLocaleString(
//     "en-IN",
//     {
//       timeZone:
//         "Asia/Kolkata",

//       day:
//         "2-digit",

//       month:
//         "short",

//       year:
//         "numeric",

//       hour:
//         "2-digit",

//       minute:
//         "2-digit",

//       hour12:
//         true,
//     }
//   );
// };


// /*
//  * Supports:
//  *
//  * MongoDB _id
//  *
//  * OR
//  *
//  * your custom orderId
//  */
// const getOrderQuery = (
//   orderId
// ) => {
//   if (
//     mongoose.Types
//       .ObjectId
//       .isValid(
//         orderId
//       )
//   ) {
//     return {
//       $or: [
//         {
//           _id:
//             orderId,
//         },
//         {
//           orderId,
//         },
//       ],
//     };
//   }

//   return {
//     orderId,
//   };
// };


// /* =========================================================
//    REDIRECT URL
// ========================================================= */

// /*
//  * IMPORTANT FIX
//  *
//  * If redirectUrl is already:
//  *
//  * https://something.com/page
//  *
//  * DO NOT CHANGE IT.
//  *
//  *
//  * If redirectUrl is:
//  *
//  * /books/hld
//  *
//  * OR
//  *
//  * books/hld
//  *
//  * then convert it into:
//  *
//  * https://www.targettrek.in/books/hld
//  */
// const buildTargetTrekUrl = (
//   redirectUrl = ""
// ) => {
//   const value =
//     String(
//       redirectUrl || ""
//     ).trim();


//   /*
//    * No redirect URL
//    */
//   if (!value) {
//     return TARGET_TREK_URL;
//   }


//   /*
//    * Already complete URL.
//    *
//    * KEEP IT EXACTLY
//    * AS IT IS.
//    */
//   if (
//     /^https?:\/\//i.test(
//       value
//     )
//   ) {
//     try {
//       const parsed =
//         new URL(value);

//       if (
//         parsed.protocol ===
//           "http:" ||
//         parsed.protocol ===
//           "https:"
//       ) {
//         return value;
//       }
//     } catch {
//       /*
//        * Invalid full URL.
//        *
//        * Continue below and
//        * treat as relative.
//        */
//     }
//   }


//   /*
//    * Relative path.
//    */
//   const cleanedPath =
//     value.replace(
//       /^\/+/,
//       ""
//     );


//   return (
//     `${TARGET_TREK_URL}/` +
//     cleanedPath
//   );
// };


// /* =========================================================
//    BOOK COVER
// ========================================================= */

// const getBookCoverUrl = (
//   coverImage
// ) => {
//   let url = "";


//   if (
//     typeof coverImage ===
//     "string"
//   ) {
//     url =
//       coverImage.trim();
//   }

//   else if (
//     coverImage &&
//     typeof coverImage ===
//       "object"
//   ) {
//     url =
//       String(
//         coverImage
//           .secure_url ||
//         coverImage.url ||
//         ""
//       ).trim();
//   }


//   return (
//     /^https?:\/\//i.test(
//       url
//     )
//       ? url
//       : ""
//   );
// };


// /* =========================================================
//    PAYMENT HELPERS
// ========================================================= */

// const getPaymentTransactionId = (
//   order
// ) => {
//   return (
//     order.payment
//       ?.mihpayid ||

//     order.payment
//       ?.transactionId ||

//     order.payment
//       ?.transaction_id ||

//     order.payment
//       ?.paymentId ||

//     order.payment
//       ?.payment_id ||

//     order.payment
//       ?.txnid ||

//     order.txnid ||

//     "N/A"
//   );
// };


// const getPaymentMethod = (
//   order
// ) => {
//   return (
//     order.payment
//       ?.mode ||

//     order.payment
//       ?.method ||

//     order.payment
//       ?.paymentMethod ||

//     order.paymentMethod ||

//     "Online Payment"
//   );
// };


// const getPaidAmount = (
//   order,
//   book
// ) => {
//   const values = [
//     order.payment
//       ?.amount,

//     order.finalAmount,

//     order.totalAmount,

//     order.amount,

//     order.book
//       ?.price,

//     book?.price,
//   ];


//   for (
//     const value of values
//   ) {
//     const amount =
//       Number(value);

//     if (
//       Number.isFinite(
//         amount
//       ) &&
//       amount >= 0
//     ) {
//       return amount;
//     }
//   }


//   return 0;
// };


// const getMrp = (
//   order,
//   book
// ) => {
//   const values = [
//     order.book
//       ?.mrp,

//     order.mrp,

//     book?.mrp,
//   ];


//   for (
//     const value of values
//   ) {
//     const mrp =
//       Number(value);

//     if (
//       Number.isFinite(
//         mrp
//       ) &&
//       mrp > 0
//     ) {
//       return mrp;
//     }
//   }


//   return 0;
// };


// const getCurrency = (
//   order,
//   book
// ) => {
//   return (
//     order.payment
//       ?.currency ||

//     order.book
//       ?.currency ||

//     order.currency ||

//     book?.currency ||

//     "INR"
//   );
// };


// const getCouponCode = (
//   order
// ) => {
//   return (
//     order.coupon
//       ?.code ||

//     order.coupon
//       ?.couponCode ||

//     order.couponCode ||

//     ""
//   );
// };


// const getDiscountAmount = (
//   order
// ) => {
//   const values = [
//     order.coupon
//       ?.discountAmount,

//     order.discountAmount,

//     order.pricing
//       ?.discountAmount,
//   ];


//   for (
//     const value of values
//   ) {
//     const discount =
//       Number(value);

//     if (
//       Number.isFinite(
//         discount
//       ) &&
//       discount > 0
//     ) {
//       return discount;
//     }
//   }


//   return 0;
// };


// const getPurchaseDate = (
//   order
// ) => {
//   return (
//     order.payment
//       ?.paidAt ||

//     order.payment
//       ?.completedAt ||

//     order.paidAt ||

//     order.updatedAt ||

//     order.createdAt
//   );
// };


// const getAdminIdentifier = (
//   req
// ) => {
//   return (
//     req.user
//       ?.email ||

//     req.admin
//       ?.email ||

//     req.user
//       ?._id ||

//     req.admin
//       ?._id ||

//     "ADMIN"
//   );
// };


// /* =========================================================
//    ACCESS TOKEN HELPERS
// ========================================================= */

// const generateAccessToken =
//   () => {
//     return crypto
//       .randomBytes(
//         32
//       )
//       .toString(
//         "hex"
//       );
//   };


// const hashAccessToken = (
//   token
// ) => {
//   return crypto
//     .createHash(
//       "sha256"
//     )
//     .update(
//       token
//     )
//     .digest(
//       "hex"
//     );
// };


// const buildAccessUrl = (
//   rawToken,
//   orderId
// ) => {
//   return (
//     `${TARGET_TREK_URL}/payment/success` +

//     `?token=${encodeURIComponent(
//       rawToken
//     )}` +

//     `&order=${encodeURIComponent(
//       orderId
//     )}`
//   );
// };


// /* =========================================================
//    VALIDATE EXISTING ACCESS URL
// ========================================================= */

// const isValidExistingAccessUrl = (
//   accessUrl,
//   expectedOrderId
// ) => {
//   try {

//     if (
//       !accessUrl ||
//       typeof accessUrl !==
//         "string"
//     ) {
//       return false;
//     }


//     const parsed =
//       new URL(
//         accessUrl.trim()
//       );


//     const targetOrigin =
//       new URL(
//         TARGET_TREK_URL
//       ).origin;


//     /*
//      * Must be Target Trek URL.
//      */
//     if (
//       parsed.origin !==
//       targetOrigin
//     ) {
//       return false;
//     }


//     /*
//      * Must be access route.
//      */
//     if (
//       parsed.pathname !==
//       "/payment/success"
//     ) {
//       return false;
//     }


//     const token =
//       parsed.searchParams.get(
//         "token"
//       );


//     const order =
//       parsed.searchParams.get(
//         "order"
//       );


//     if (
//       !token ||
//       !order
//     ) {
//       return false;
//     }


//     /*
//      * URL must belong to
//      * this exact order.
//      */
//     return (
//       String(order) ===
//       String(
//         expectedOrderId
//       )
//     );

//   } catch {
//     return false;
//   }
// };


// /* =========================================================
//    PAYMENT VALIDATION
// ========================================================= */

// const validatePaidOrder = (
//   order
// ) => {
//   const orderStatus =
//     String(
//       order.orderStatus ||
//       ""
//     )
//       .trim()
//       .toLowerCase();


//   const paymentStatus =
//     String(
//       order.payment
//         ?.status ||
//       ""
//     )
//       .trim()
//       .toLowerCase();


//   return (
//     orderStatus ===
//       "paid" &&

//     paymentStatus ===
//       "success"
//   );
// };


// const validatePaymentVerification = (
//   order
// ) => {
//   return (
//     order.verification
//       ?.callbackHashVerified ===
//       true &&

//     order.verification
//       ?.payuVerified ===
//       true &&

//     order.verification
//       ?.amountVerified ===
//       true
//   );
// };


// /* =========================================================
//    GET BOOK
// ========================================================= */

// const getPurchasedBook =
//   async (
//     order
//   ) => {

//     return Book
//       .findById(
//         order.bookId
//       )
//       .select(`
//         title
//         subtitle
//         description
//         shortDescription
//         edition
//         categories
//         level
//         language
//         format
//         price
//         mrp
//         currency
//         paymentUrl
//         redirectUrl
//         coverImage
//         isActive
//         isPublished
//       `);
//   };


// /* =========================================================
//    PENDING PURCHASE EMAIL
// ========================================================= */

// export const buildPendingPurchaseEmail =
//   ({
//     order,

//     book,

//     couponCode = "",

//     couponDescription = "",

//     couponValidation = null,
//   }) => {

//     const customerName =
//       order.customer
//         ?.name
//         ?.trim() ||
//       "there";


//     const customerEmail =
//       order.customer
//         ?.email
//         ?.trim() ||
//       "";


//     const bookTitle =
//       book.title ||

//       order.book
//         ?.title ||

//       "your ebook";


//     const currency =
//       book.currency ||

//       order.book
//         ?.currency ||

//       "INR";


//     const currentPrice =
//       Number(
//         book.price
//       ) ||
//       0;


//     const currentMrp =
//       Number(
//         book.mrp
//       ) ||
//       0;


//     const oldOrderPrice =
//       Number(
//         order.book
//           ?.price
//       );


//     const hasOldOrderPrice =
//       Number.isFinite(
//         oldOrderPrice
//       ) &&
//       oldOrderPrice > 0;


//     const priceChanged =
//       hasOldOrderPrice &&

//       Math.abs(
//         oldOrderPrice -
//         currentPrice
//       ) >
//         0.001;


//     /*
//      * IMPORTANT:
//      *
//      * Existing full URL is
//      * returned unchanged.
//      */
//     const purchaseUrl =
//       buildTargetTrekUrl(
//         book.redirectUrl
//       );


//     const coverImageUrl =
//       getBookCoverUrl(
//         book.coverImage
//       );


//     const paymentStatus =
//       String(
//         order.payment
//           ?.status ||

//         order.orderStatus ||

//         "Pending"
//       ).trim();


//     const hasCoupon =
//       Boolean(
//         couponCode &&
//         couponDescription
//       );


//     const discountAmount =
//       couponValidation
//         ?.discountAmount ??

//       couponValidation
//         ?.data
//         ?.discountAmount ??

//       null;


//     const finalAmount =
//       couponValidation
//         ?.finalAmount ??

//       couponValidation
//         ?.data
//         ?.finalAmount ??

//       null;


//     const safeName =
//       escapeHtml(
//         customerName
//       );


//     const safeEmail =
//       escapeHtml(
//         customerEmail
//       );


//     const safeTitle =
//       escapeHtml(
//         bookTitle
//       );


//     const safeSubtitle =
//       escapeHtml(
//         book.subtitle ||
//         ""
//       );


//     const safeDescription =
//       escapeHtml(
//         book.shortDescription ||

//         book.description ||

//         ""
//       );


//     const safePurchaseUrl =
//       escapeHtml(
//         purchaseUrl
//       );


//     const safeCover =
//       escapeHtml(
//         coverImageUrl
//       );


//     const safeCouponCode =
//       escapeHtml(
//         couponCode
//       );


//     const safeCouponDescription =
//       escapeHtml(
//         couponDescription
//       );


//     const subject =
//       hasCoupon

//         ? `Complete your ${bookTitle} purchase — special coupon inside | Target Trek`

//         : `Complete your ${bookTitle} purchase | Target Trek`;


//     const text = `
// Hi ${customerName},

// You started purchasing "${bookTitle}" on Target Trek, but the payment was not completed.

// Order ID:
// ${order.orderId || order._id || ""}

// Customer Email:
// ${customerEmail}

// Payment Status:
// ${paymentStatus}

// Book:
// ${bookTitle}

// ${
//   book.subtitle
//     ? `Subtitle: ${book.subtitle}`
//     : ""
// }

// ${
//   currentMrp >
//   currentPrice

//     ? `MRP: ${formatAmount(
//         currentMrp,
//         currency
//       )}`

//     : ""
// }

// Current Price:
// ${formatAmount(
//   currentPrice,
//   currency
// )}

// ${
//   priceChanged

//     ? `Previous Price: ${formatAmount(
//         oldOrderPrice,
//         currency
//       )}`

//     : ""
// }

// ${
//   hasCoupon

//     ? `
// Coupon:
// ${couponCode}

// Offer:
// ${couponDescription}

// ${
//   discountAmount !==
//   null

//     ? `Discount: ${formatAmount(
//         discountAmount,
//         currency
//       )}`

//     : ""
// }

// ${
//   finalAmount !==
//   null

//     ? `Price after coupon: ${formatAmount(
//         finalAmount,
//         currency
//       )}`

//     : ""
// }
// `

//     : ""
// }

// Complete your purchase:
// ${purchaseUrl}

// Explore all books:
// ${ALL_BOOKS_URL}

// Need help?
// ${SUPPORT_EMAIL}

// Regards,
// Team Target Trek
//     `.trim();


//     const html = `
// <!DOCTYPE html>

// <html lang="en">

// <head>

//   <meta
//     charset="UTF-8"
//   />

//   <meta
//     name="viewport"
//     content="width=device-width, initial-scale=1.0"
//   />

//   <title>
//     Complete Your Purchase
//   </title>

// </head>


// <body
//   style="
//     margin: 0;
//     background: #f4f7fb;
//     font-family:
//       Arial,
//       Helvetica,
//       sans-serif;
//     color: #0f172a;
//   "
// >

//   <table
//     width="100%"
//     cellspacing="0"
//     cellpadding="0"
//     border="0"
//     style="
//       background: #f4f7fb;
//     "
//   >

//     <tr>

//       <td
//         align="center"
//         style="
//           padding:
//             30px
//             14px;
//         "
//       >

//         <table
//           width="100%"
//           cellspacing="0"
//           cellpadding="0"
//           border="0"
//           style="
//             max-width: 680px;
//             background: #ffffff;
//             border:
//               1px solid #e2e8f0;
//             border-radius: 18px;
//             overflow: hidden;
//           "
//         >


//           <!-- HEADER -->

//           <tr>

//             <td
//               style="
//                 padding:
//                   24px
//                   30px;
//                 background: #eff6ff;
//                 border-bottom:
//                   1px solid #dbeafe;
//               "
//             >

//               <div
//                 style="
//                   font-size: 24px;
//                   font-weight: 800;
//                   color: #2563eb;
//                 "
//               >
//                 Target Trek
//               </div>


//               <div
//                 style="
//                   margin-top: 5px;
//                   font-size: 12px;
//                   color: #64748b;
//                 "
//               >
//                 Learn. Build. Grow.
//               </div>

//             </td>

//           </tr>


//           <!-- BODY -->

//           <tr>

//             <td
//               style="
//                 padding: 30px;
//               "
//             >

//               <div
//                 style="
//                   display: inline-block;
//                   padding:
//                     7px
//                     12px;
//                   background: #fff7ed;
//                   color: #c2410c;
//                   border-radius: 999px;
//                   font-size: 11px;
//                   font-weight: 800;
//                 "
//               >
//                 PURCHASE NOT COMPLETED
//               </div>


//               <h1
//                 style="
//                   margin:
//                     18px
//                     0
//                     10px;
//                   font-size: 27px;
//                 "
//               >
//                 Hi ${safeName},
//               </h1>


//               <p
//                 style="
//                   margin: 0;
//                   color: #475569;
//                   font-size: 15px;
//                   line-height: 1.7;
//                 "
//               >

//                 You started purchasing

//                 <strong>
//                   ${safeTitle}
//                 </strong>,

//                 but the payment was not completed.

//               </p>


//               <!-- BOOK -->

//               <table
//                 width="100%"
//                 cellspacing="0"
//                 cellpadding="0"
//                 border="0"
//                 style="
//                   margin-top: 24px;
//                   background: #f8fafc;
//                   border:
//                     1px solid #e2e8f0;
//                   border-radius: 14px;
//                 "
//               >

//                 <tr>

//                   ${
//                     coverImageUrl

//                       ? `
//                   <td
//                     width="140"
//                     valign="top"
//                     style="
//                       padding: 18px;
//                     "
//                   >

//                     <img
//                       src="${safeCover}"
//                       alt="${safeTitle}"
//                       width="120"
//                       style="
//                         display: block;
//                         width: 120px;
//                         height: auto;
//                         border-radius: 10px;
//                       "
//                     />

//                   </td>
//                   `

//                       : ""
//                   }


//                   <td
//                     valign="top"
//                     style="
//                       padding: 20px;
//                     "
//                   >

//                     <div
//                       style="
//                         font-size: 11px;
//                         font-weight: 800;
//                         color: #2563eb;
//                       "
//                     >
//                       YOUR SELECTED BOOK
//                     </div>


//                     <div
//                       style="
//                         margin-top: 7px;
//                         font-size: 19px;
//                         font-weight: 800;
//                       "
//                     >
//                       ${safeTitle}
//                     </div>


//                     ${
//                       safeSubtitle

//                         ? `
//                     <div
//                       style="
//                         margin-top: 5px;
//                         color: #475569;
//                         font-size: 13px;
//                       "
//                     >
//                       ${safeSubtitle}
//                     </div>
//                     `

//                         : ""
//                     }


//                     ${
//                       safeDescription

//                         ? `
//                     <div
//                       style="
//                         margin-top: 10px;
//                         color: #64748b;
//                         font-size: 12px;
//                         line-height: 1.6;
//                       "
//                     >
//                       ${safeDescription}
//                     </div>
//                     `

//                         : ""
//                     }

//                   </td>

//                 </tr>

//               </table>


//               <!-- PURCHASE DETAILS -->

//               <div
//                 style="
//                   margin-top: 20px;
//                   padding: 18px;
//                   border:
//                     1px solid #e2e8f0;
//                   border-radius: 14px;
//                 "
//               >

//                 <div
//                   style="
//                     font-weight: 800;
//                     margin-bottom: 12px;
//                   "
//                 >
//                   Purchase details
//                 </div>


//                 <div
//                   style="
//                     font-size: 13px;
//                     line-height: 1.9;
//                     color: #475569;
//                   "
//                 >

//                   Order ID:

//                   <strong
//                     style="
//                       color: #0f172a;
//                     "
//                   >
//                     ${escapeHtml(
//                       order.orderId ||
//                       order._id ||
//                       ""
//                     )}
//                   </strong>

//                   <br />


//                   Email:

//                   <strong
//                     style="
//                       color: #0f172a;
//                     "
//                   >
//                     ${safeEmail}
//                   </strong>

//                   <br />


//                   Payment Status:

//                   <strong
//                     style="
//                       color: #0f172a;
//                     "
//                   >
//                     ${escapeHtml(
//                       paymentStatus
//                     )}
//                   </strong>

//                   <br />


//                   ${
//                     currentMrp >
//                     currentPrice

//                       ? `
//                   MRP:

//                   <span
//                     style="
//                       text-decoration:
//                         line-through;
//                     "
//                   >
//                     ${formatAmount(
//                       currentMrp,
//                       currency
//                     )}
//                   </span>

//                   <br />
//                   `

//                       : ""
//                   }


//                   Current Price:

//                   <strong
//                     style="
//                       font-size: 17px;
//                       color: #2563eb;
//                     "
//                   >
//                     ${formatAmount(
//                       currentPrice,
//                       currency
//                     )}
//                   </strong>

//                 </div>

//               </div>


//               ${
//                 priceChanged

//                   ? `
//               <div
//                 style="
//                   margin-top: 18px;
//                   padding: 15px;
//                   background: #fff7ed;
//                   border:
//                     1px solid #fed7aa;
//                   border-radius: 12px;
//                   color: #9a3412;
//                   font-size: 13px;
//                   line-height: 1.6;
//                 "
//               >

//                 <strong>
//                   Price updated.
//                 </strong>

//                 <br />

//                 Previous:
//                 ${formatAmount(
//                   oldOrderPrice,
//                   currency
//                 )}

//                 <br />

//                 Current:
//                 ${formatAmount(
//                   currentPrice,
//                   currency
//                 )}

//               </div>
//               `

//                   : ""
//               }


//               ${
//                 hasCoupon

//                   ? `
//               <div
//                 style="
//                   margin-top: 18px;
//                   padding: 18px;
//                   background: #f0fdf4;
//                   border:
//                     1px solid #bbf7d0;
//                   border-radius: 14px;
//                   color: #166534;
//                 "
//               >

//                 <div
//                   style="
//                     font-size: 11px;
//                     font-weight: 800;
//                   "
//                 >
//                   SPECIAL OFFER
//                 </div>


//                 <div
//                   style="
//                     margin-top: 8px;
//                     font-size: 14px;
//                   "
//                 >
//                   ${safeCouponDescription}
//                 </div>


//                 <div
//                   style="
//                     margin-top: 12px;
//                     padding: 12px;
//                     background: #ffffff;
//                     border:
//                       1px dashed #86efac;
//                     border-radius: 10px;
//                     font-size: 20px;
//                     font-weight: 800;
//                   "
//                 >
//                   ${safeCouponCode}
//                 </div>


//                 ${
//                   discountAmount !==
//                   null

//                     ? `
//                 <div
//                   style="
//                     margin-top: 10px;
//                     font-size: 13px;
//                   "
//                 >

//                   You save:

//                   <strong>
//                     ${formatAmount(
//                       discountAmount,
//                       currency
//                     )}
//                   </strong>

//                 </div>
//                 `

//                     : ""
//                 }


//                 ${
//                   finalAmount !==
//                   null

//                     ? `
//                 <div
//                   style="
//                     margin-top: 4px;
//                     font-size: 13px;
//                   "
//                 >

//                   Price after coupon:

//                   <strong>
//                     ${formatAmount(
//                       finalAmount,
//                       currency
//                     )}
//                   </strong>

//                 </div>
//                 `

//                     : ""
//                 }

//               </div>
//               `

//                   : ""
//               }


//               <!-- CTA -->

//               <div
//                 style="
//                   margin-top: 28px;
//                   text-align: center;
//                 "
//               >

//                 <a
//                   href="${safePurchaseUrl}"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   style="
//                     display: inline-block;
//                     padding:
//                       15px
//                       30px;
//                     background: #2563eb;
//                     color: #ffffff;
//                     text-decoration: none;
//                     border-radius: 10px;
//                     font-size: 15px;
//                     font-weight: 800;
//                   "
//                 >
//                   Complete Your Purchase
//                 </a>

//               </div>


//               <div
//                 style="
//                   margin-top: 18px;
//                   padding: 14px;
//                   background: #f8fafc;
//                   border-radius: 10px;
//                   font-size: 12px;
//                   color: #64748b;
//                   word-break: break-all;
//                 "
//               >

//                 Button not opening?
//                 Copy this URL:

//                 <br />


//                 <a
//                   href="${safePurchaseUrl}"
//                   style="
//                     color: #2563eb;
//                   "
//                 >
//                   ${safePurchaseUrl}
//                 </a>

//               </div>


//               <div
//                 style="
//                   margin-top: 22px;
//                   text-align: center;
//                 "
//               >

//                 <a
//                   href="${ALL_BOOKS_URL}"
//                   style="
//                     color: #2563eb;
//                     font-weight: 700;
//                     text-decoration: none;
//                   "
//                 >
//                   Explore all Target Trek books →
//                 </a>

//               </div>


//               <p
//                 style="
//                   margin-top: 24px;
//                   color: #64748b;
//                   font-size: 13px;
//                   line-height: 1.7;
//                 "
//               >

//                 Need help?

//                 <a
//                   href="mailto:${SUPPORT_EMAIL}"
//                   style="
//                     color: #2563eb;
//                   "
//                 >
//                   ${SUPPORT_EMAIL}
//                 </a>

//               </p>

//             </td>

//           </tr>

//         </table>

//       </td>

//     </tr>

//   </table>

// </body>

// </html>
//     `.trim();


//     return {
//       subject,
//       text,
//       html,
//       purchaseUrl,
//     };
//   };


// /* =========================================================
//    SEND PENDING PURCHASE EMAIL
// ========================================================= */

// const sendPendingPurchaseMail =
//   async (
//     req,
//     res
//   ) => {

//     try {

//       const {
//         orderId,
//       } =
//         req.params;


//       const rawCouponCode =
//         typeof req.body
//           ?.couponCode ===
//           "string"

//           ? req.body
//               .couponCode
//               .trim()

//           : "";


//       const rawCouponDescription =
//         typeof req.body
//           ?.couponDescription ===
//           "string"

//           ? req.body
//               .couponDescription
//               .trim()

//           : "";


//       if (!orderId) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "Order ID is required.",
//           });
//       }


//       const hasCouponCode =
//         Boolean(
//           rawCouponCode
//         );


//       const hasCouponDescription =
//         Boolean(
//           rawCouponDescription
//         );


//       if (
//         hasCouponCode !==
//         hasCouponDescription
//       ) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "Coupon code and coupon description must both be provided, or both must be empty.",
//           });
//       }


//       const order =
//         await Order
//           .findOne(
//             getOrderQuery(
//               orderId
//             )
//           );


//       if (!order) {
//         return res
//           .status(404)
//           .json({
//             success:
//               false,

//             message:
//               "Order not found.",
//           });
//       }


//       const allowedStatuses =
//         new Set([
//           "pending",
//           "failed",
//           "bounced",
//         ]);


//       const orderStatus =
//         String(
//           order.orderStatus ||
//           ""
//         )
//           .trim()
//           .toLowerCase();


//       const paymentStatus =
//         String(
//           order.payment
//             ?.status ||
//           ""
//         )
//           .trim()
//           .toLowerCase();


//       if (
//         !allowedStatuses.has(
//           orderStatus
//         ) ||

//         !allowedStatuses.has(
//           paymentStatus
//         )
//       ) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "Reminder email can only be sent for pending, failed, or bounced orders.",
//           });
//       }


//       const customerEmail =
//         order.customer
//           ?.email
//           ?.trim()
//           .toLowerCase();


//       if (
//         !customerEmail
//       ) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "Customer email is not available.",
//           });
//       }


//       const book =
//         await getPurchasedBook(
//           order
//         );


//       if (!book) {
//         return res
//           .status(404)
//           .json({
//             success:
//               false,

//             message:
//               "Book associated with this order no longer exists.",
//           });
//       }


//       if (
//         !book.isActive
//       ) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "This book is currently inactive. Reminder email was not sent.",
//           });
//       }


//       if (
//         !book.isPublished
//       ) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "This book is currently unpublished. Reminder email was not sent.",
//           });
//       }


//       if (
//         !book.redirectUrl
//       ) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "Book purchase page is not configured.",
//           });
//       }


//       let couponValidation =
//         null;


//       if (
//         hasCouponCode &&
//         hasCouponDescription
//       ) {

//         try {

//           couponValidation =
//             await validateCouponForPayment(
//               {
//                 couponCode:
//                   rawCouponCode,

//                 bookId:
//                   String(
//                     book._id
//                   ),

//                 book,

//                 email:
//                   customerEmail,
//               }
//             );


//           if (
//             couponValidation
//               ?.valid ===
//               false ||

//             couponValidation
//               ?.success ===
//               false
//           ) {
//             return res
//               .status(400)
//               .json({
//                 success:
//                   false,

//                 message:
//                   couponValidation
//                     ?.message ||

//                   "Coupon is not valid for this customer and book.",
//               });
//           }

//         } catch (
//           couponError
//         ) {

//           console.error(
//             "Coupon validation error:",
//             couponError
//           );


//           return res
//             .status(
//               couponError
//                 ?.statusCode ||
//               400
//             )
//             .json({
//               success:
//                 false,

//               code:
//                 couponError
//                   ?.code ||

//                 "COUPON_VALIDATION_FAILED",

//               message:
//                 couponError
//                   ?.message ||

//                 "Coupon is not valid for this customer and book.",
//             });
//         }
//       }


//       const finalCouponCode =
//         hasCouponCode

//           ? rawCouponCode
//               .toUpperCase()

//           : "";


//       const finalCouponDescription =
//         hasCouponDescription

//           ? rawCouponDescription

//           : "";


//       const {
//         subject,

//         text,

//         html,

//         purchaseUrl,
//       } =
//         buildPendingPurchaseEmail(
//           {
//             order,

//             book,

//             couponCode:
//               finalCouponCode,

//             couponDescription:
//               finalCouponDescription,

//             couponValidation,
//           }
//         );


//       /*
//        * SEND MAIL
//        */
//       try {

//         await sendMail(
//           customerEmail,
//           subject,
//           text,
//           html
//         );

//       } catch (
//         mailError
//       ) {

//         console.error(
//           "Pending mail send error:",
//           mailError
//         );


//         await Order
//           .updateOne(
//             {
//               _id:
//                 order._id,
//             },
//             {
//               $set: {
//                 "pendingMail.lastStatus":
//                   "FAILED",

//                 "pendingMail.lastError":
//                   mailError
//                     ?.message ||

//                   "Failed to send email",
//               },
//             }
//           );


//         return res
//           .status(500)
//           .json({
//             success:
//               false,

//             message:
//               "Failed to send pending purchase email.",
//           });
//       }


//       const now =
//         new Date();


//       const adminIdentifier =
//         String(
//           getAdminIdentifier(
//             req
//           )
//         );


//       const pendingMailUpdate =
//         {
//           $inc: {
//             "pendingMail.sentCount":
//               1,
//           },

//           $set: {
//             "pendingMail.lastSentAt":
//               now,

//             "pendingMail.lastSentBy":
//               adminIdentifier,

//             "pendingMail.lastStatus":
//               "SENT",

//             "pendingMail.lastError":
//               null,

//             updatedBy:
//               adminIdentifier,
//           },
//         };


//       if (
//         !order.pendingMail
//           ?.firstSentAt
//       ) {
//         pendingMailUpdate
//           .$set[
//             "pendingMail.firstSentAt"
//           ] =
//           now;
//       }


//       const updatedOrder =
//         await Order
//           .findByIdAndUpdate(
//             order._id,

//             pendingMailUpdate,

//             {
//               new:
//                 true,
//             }
//           );


//       return res
//         .status(200)
//         .json({
//           success:
//             true,

//           message:
//             "Pending purchase email sent successfully.",

//           data: {

//             orderId:
//               updatedOrder
//                 .orderId,

//             mongoOrderId:
//               updatedOrder
//                 ._id,


//             customer: {
//               name:
//                 updatedOrder
//                   .customer
//                   ?.name,

//               email:
//                 updatedOrder
//                   .customer
//                   ?.email,
//             },


//             book: {
//               id:
//                 book._id,

//               title:
//                 book.title,

//               currentPrice:
//                 book.price,

//               mrp:
//                 book.mrp,

//               currency:
//                 book.currency,

//               redirectUrl:
//                 book.redirectUrl,

//               purchaseUrl,
//             },


//             coupon: {

//               included:
//                 Boolean(
//                   finalCouponCode
//                 ),

//               code:
//                 finalCouponCode ||
//                 null,

//               description:
//                 finalCouponDescription ||
//                 null,

//               validation:
//                 couponValidation

//                   ? {
//                       valid:
//                         true,

//                       discountAmount:
//                         couponValidation
//                           ?.discountAmount ??

//                         couponValidation
//                           ?.data
//                           ?.discountAmount ??

//                         null,

//                       finalAmount:
//                         couponValidation
//                           ?.finalAmount ??

//                         couponValidation
//                           ?.data
//                           ?.finalAmount ??

//                         null,
//                     }

//                   : null,
//             },


//             pendingMail:
//               updatedOrder
//                 .pendingMail,
//           },
//         });

//     } catch (
//       error
//     ) {

//       console.error(
//         "sendPendingPurchaseMail error:",
//         error
//       );


//       return res
//         .status(500)
//         .json({
//           success:
//             false,

//           message:
//             "Something went wrong while sending the pending purchase email.",
//         });
//     }
//   };


// /* =========================================================
//    BOOK ACCESS EMAIL
// ========================================================= */

// const buildBookAccessEmail =
//   ({
//     order,

//     book,

//     accessUrl,

//     accessExpiresAt,

//     generatedNewAccess =
//       false,
//   }) => {

//     const customerName =
//       order.customer
//         ?.name
//         ?.trim() ||
//       "there";


//     const customerEmail =
//       order.customer
//         ?.email
//         ?.trim() ||
//       "";


//     const bookTitle =
//       book.title ||

//       order.book
//         ?.title ||

//       "your ebook";


//     const bookSubtitle =
//       book.subtitle ||

//       order.book
//         ?.subtitle ||

//       "";


//     const currency =
//       getCurrency(
//         order,
//         book
//       );


//     const paidAmount =
//       getPaidAmount(
//         order,
//         book
//       );


//     const mrp =
//       getMrp(
//         order,
//         book
//       );


//     const couponCode =
//       getCouponCode(
//         order
//       );


//     const discountAmount =
//       getDiscountAmount(
//         order
//       );


//     const transactionId =
//       getPaymentTransactionId(
//         order
//       );


//     const paymentMethod =
//       getPaymentMethod(
//         order
//       );


//     const purchaseDate =
//       getPurchaseDate(
//         order
//       );


//     const coverImageUrl =
//       getBookCoverUrl(
//         book.coverImage
//       );


//     const safeName =
//       escapeHtml(
//         customerName
//       );


//     const safeEmail =
//       escapeHtml(
//         customerEmail
//       );


//     const safeTitle =
//       escapeHtml(
//         bookTitle
//       );


//     const safeSubtitle =
//       escapeHtml(
//         bookSubtitle
//       );


//     const safeUrl =
//       escapeHtml(
//         accessUrl
//       );


//     const safeCover =
//       escapeHtml(
//         coverImageUrl
//       );


//     const safeTransactionId =
//       escapeHtml(
//         transactionId
//       );


//     const safePaymentMethod =
//       escapeHtml(
//         paymentMethod
//       );


//     const safeCoupon =
//       escapeHtml(
//         couponCode
//       );


//     const linkMessage =
//       generatedNewAccess

//         ? "Your new secure book access link is ready."

//         : "Your existing secure book access link is still active.";


//     const expiryMessage =
//       generatedNewAccess

//         ? "This newly generated access link is valid until"

//         : "Your existing access link remains valid until";


//     const subject =
//       `Your ${bookTitle} access link | Target Trek`;


//     const text = `
// Hi ${customerName},

// Thanks for purchasing "${bookTitle}" from Target Trek.

// ${linkMessage}

// ACCESS YOUR BOOK

// ${accessUrl}

// Book:
// ${bookTitle}

// ${
//   bookSubtitle
//     ? `Subtitle: ${bookSubtitle}`
//     : ""
// }

// Order ID:
// ${order.orderId || order._id}

// Customer Email:
// ${customerEmail}

// Order Status:
// ${String(
//   order.orderStatus ||
//   "PAID"
// ).toUpperCase()}

// Payment Status:
// ${String(
//   order.payment
//     ?.status ||
//   "SUCCESS"
// ).toUpperCase()}

// Transaction ID:
// ${transactionId}

// Payment Method:
// ${paymentMethod}

// ${
//   mrp >
//   paidAmount

//     ? `MRP: ${formatAmount(
//         mrp,
//         currency
//       )}`

//     : ""
// }

// ${
//   couponCode

//     ? `Coupon Used: ${couponCode}`

//     : ""
// }

// ${
//   discountAmount > 0

//     ? `Discount: ${formatAmount(
//         discountAmount,
//         currency
//       )}`

//     : ""
// }

// Amount Paid:
// ${formatAmount(
//   paidAmount,
//   currency
// )}

// Purchase Date:
// ${formatDate(
//   purchaseDate
// )}

// ${expiryMessage}:
// ${formatDate(
//   accessExpiresAt
// )}

// Please do not share this access link.

// Need help?
// ${SUPPORT_EMAIL}

// Explore more books:
// ${ALL_BOOKS_URL}

// Regards,
// Team Target Trek
//     `.trim();


//     const html = `
// <!DOCTYPE html>

// <html lang="en">

// <head>

//   <meta
//     charset="UTF-8"
//   />

//   <meta
//     name="viewport"
//     content="width=device-width, initial-scale=1.0"
//   />

//   <title>
//     Your Book Access
//   </title>

// </head>


// <body
//   style="
//     margin: 0;
//     background: #f4f7fb;
//     font-family:
//       Arial,
//       Helvetica,
//       sans-serif;
//     color: #0f172a;
//   "
// >

//   <table
//     width="100%"
//     cellspacing="0"
//     cellpadding="0"
//     border="0"
//     style="
//       background: #f4f7fb;
//     "
//   >

//     <tr>

//       <td
//         align="center"
//         style="
//           padding:
//             30px
//             14px;
//         "
//       >

//         <table
//           width="100%"
//           cellspacing="0"
//           cellpadding="0"
//           border="0"
//           style="
//             max-width: 680px;
//             background: #ffffff;
//             border:
//               1px solid #e2e8f0;
//             border-radius: 18px;
//             overflow: hidden;
//           "
//         >


//           <!-- HEADER -->

//           <tr>

//             <td
//               style="
//                 padding:
//                   24px
//                   30px;
//                 background: #eff6ff;
//                 border-bottom:
//                   1px solid #dbeafe;
//               "
//             >

//               <div
//                 style="
//                   font-size: 24px;
//                   font-weight: 800;
//                   color: #2563eb;
//                 "
//               >
//                 Target Trek
//               </div>


//               <div
//                 style="
//                   margin-top: 5px;
//                   color: #64748b;
//                   font-size: 12px;
//                 "
//               >
//                 Your purchased book access
//               </div>

//             </td>

//           </tr>


//           <tr>

//             <td
//               style="
//                 padding: 30px;
//               "
//             >

//               <h1
//                 style="
//                   margin: 0;
//                   font-size: 27px;
//                 "
//               >
//                 Hi ${safeName},
//               </h1>


//               <p
//                 style="
//                   margin:
//                     12px
//                     0
//                     0;
//                   color: #475569;
//                   font-size: 15px;
//                   line-height: 1.7;
//                 "
//               >
//                 ${escapeHtml(
//                   linkMessage
//                 )}
//               </p>


//               <!-- BOOK -->

//               <table
//                 width="100%"
//                 cellspacing="0"
//                 cellpadding="0"
//                 border="0"
//                 style="
//                   margin-top: 24px;
//                   background: #f8fafc;
//                   border:
//                     1px solid #e2e8f0;
//                   border-radius: 14px;
//                 "
//               >

//                 <tr>

//                   ${
//                     coverImageUrl

//                       ? `
//                   <td
//                     width="140"
//                     valign="top"
//                     style="
//                       padding: 18px;
//                     "
//                   >

//                     <img
//                       src="${safeCover}"
//                       width="120"
//                       alt="${safeTitle}"
//                       style="
//                         display: block;
//                         width: 120px;
//                         height: auto;
//                         border-radius: 10px;
//                       "
//                     />

//                   </td>
//                   `

//                       : ""
//                   }


//                   <td
//                     valign="top"
//                     style="
//                       padding: 20px;
//                     "
//                   >

//                     <div
//                       style="
//                         font-size: 11px;
//                         font-weight: 800;
//                         color: #2563eb;
//                       "
//                     >
//                       YOUR PURCHASED BOOK
//                     </div>


//                     <div
//                       style="
//                         margin-top: 7px;
//                         font-size: 19px;
//                         font-weight: 800;
//                       "
//                     >
//                       ${safeTitle}
//                     </div>


//                     ${
//                       safeSubtitle

//                         ? `
//                     <div
//                       style="
//                         margin-top: 5px;
//                         color: #64748b;
//                         font-size: 13px;
//                       "
//                     >
//                       ${safeSubtitle}
//                     </div>
//                     `

//                         : ""
//                     }

//                   </td>

//                 </tr>

//               </table>


//               <!-- ACCESS BUTTON -->

//               <div
//                 style="
//                   margin-top: 26px;
//                   text-align: center;
//                 "
//               >

//                 <a
//                   href="${safeUrl}"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   style="
//                     display: inline-block;
//                     padding:
//                       15px
//                       32px;
//                     background: #2563eb;
//                     color: #ffffff;
//                     text-decoration: none;
//                     border-radius: 10px;
//                     font-size: 15px;
//                     font-weight: 800;
//                   "
//                 >
//                   Access Your Book
//                 </a>

//               </div>


//               <!-- FALLBACK URL -->

//               <div
//                 style="
//                   margin-top: 18px;
//                   padding: 14px;
//                   background: #f8fafc;
//                   border:
//                     1px solid #e2e8f0;
//                   border-radius: 10px;
//                   font-size: 12px;
//                   color: #64748b;
//                   word-break: break-all;
//                 "
//               >

//                 If the button does not work,
//                 copy this URL:

//                 <br />


//                 <a
//                   href="${safeUrl}"
//                   style="
//                     color: #2563eb;
//                   "
//                 >
//                   ${safeUrl}
//                 </a>

//               </div>


//               <!-- PAYMENT DETAILS -->

//               <div
//                 style="
//                   margin-top: 22px;
//                   padding: 18px;
//                   border:
//                     1px solid #e2e8f0;
//                   border-radius: 14px;
//                   font-size: 13px;
//                   line-height: 1.9;
//                   color: #475569;
//                 "
//               >

//                 <strong
//                   style="
//                     color: #0f172a;
//                   "
//                 >
//                   Payment details
//                 </strong>

//                 <br />


//                 Order ID:
//                 ${escapeHtml(
//                   order.orderId ||
//                   order._id
//                 )}

//                 <br />


//                 Transaction ID:
//                 ${safeTransactionId}

//                 <br />


//                 Payment Method:
//                 ${safePaymentMethod}

//                 <br />


//                 ${
//                   mrp >
//                   paidAmount

//                     ? `
//                 MRP:
//                 ${formatAmount(
//                   mrp,
//                   currency
//                 )}

//                 <br />
//                 `

//                     : ""
//                 }


//                 ${
//                   couponCode

//                     ? `
//                 Coupon:
//                 ${safeCoupon}

//                 <br />
//                 `

//                     : ""
//                 }


//                 ${
//                   discountAmount >
//                   0

//                     ? `
//                 Discount:
//                 ${formatAmount(
//                   discountAmount,
//                   currency
//                 )}

//                 <br />
//                 `

//                     : ""
//                 }


//                 Amount Paid:

//                 <strong
//                   style="
//                     color: #2563eb;
//                   "
//                 >
//                   ${formatAmount(
//                     paidAmount,
//                     currency
//                   )}
//                 </strong>

//                 <br />


//                 Purchase Date:
//                 ${formatDate(
//                   purchaseDate
//                 )}

//               </div>


//               <!-- EXPIRY -->

//               <div
//                 style="
//                   margin-top: 20px;
//                   padding: 16px;
//                   background: #fff7ed;
//                   border:
//                     1px solid #fed7aa;
//                   border-radius: 12px;
//                   color: #9a3412;
//                   font-size: 13px;
//                   line-height: 1.7;
//                 "
//               >

//                 <strong>
//                   Secure access link
//                 </strong>

//                 <br />


//                 ${escapeHtml(
//                   expiryMessage
//                 )}

//                 <strong>
//                   ${formatDate(
//                     accessExpiresAt
//                   )}
//                 </strong>.


//                 Please do not share this
//                 link publicly.

//               </div>


//               <!-- SUPPORT -->

//               <p
//                 style="
//                   margin-top: 24px;
//                   color: #64748b;
//                   font-size: 13px;
//                   line-height: 1.7;
//                 "
//               >

//                 Facing any issue?

//                 Contact

//                 <a
//                   href="mailto:${SUPPORT_EMAIL}"
//                   style="
//                     color: #2563eb;
//                   "
//                 >
//                   ${SUPPORT_EMAIL}
//                 </a>.

//               </p>


//               <div
//                 style="
//                   margin-top: 20px;
//                   text-align: center;
//                 "
//               >

//                 <a
//                   href="${ALL_BOOKS_URL}"
//                   style="
//                     color: #2563eb;
//                     font-weight: 700;
//                     text-decoration: none;
//                   "
//                 >
//                   Explore more Target Trek books →
//                 </a>

//               </div>


//               <div
//                 style="
//                   margin-top: 28px;
//                   color: #475569;
//                   font-size: 14px;
//                   line-height: 1.7;
//                 "
//               >

//                 Regards,

//                 <br />

//                 <strong>
//                   Team Target Trek
//                 </strong>

//               </div>

//             </td>

//           </tr>


//           <!-- FOOTER -->

//           <tr>

//             <td
//               align="center"
//               style="
//                 padding: 18px;
//                 background: #f8fafc;
//                 border-top:
//                   1px solid #e2e8f0;
//                 color: #94a3b8;
//                 font-size: 11px;
//               "
//             >

//               This email was sent because
//               a book was purchased using
//               ${safeEmail}.

//               <br />

//               © ${new Date().getFullYear()}
//               Target Trek.

//             </td>

//           </tr>

//         </table>

//       </td>

//     </tr>

//   </table>

// </body>

// </html>
//     `.trim();


//     return {
//       subject,
//       text,
//       html,
//     };
//   };


// /* =========================================================
//    RESEND BOOK ACCESS EMAIL
// ========================================================= */

// const resendBookAccessMail =
//   async (
//     req,
//     res
//   ) => {

//     try {

//       const {
//         orderId,
//       } =
//         req.params;


//       if (!orderId) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "Order ID is required.",
//           });
//       }


//       const order =
//         await Order
//           .findOne(
//             getOrderQuery(
//               orderId
//             )
//           );


//       if (!order) {
//         return res
//           .status(404)
//           .json({
//             success:
//               false,

//             message:
//               "Order not found.",
//           });
//       }


//       /*
//        * PAID + SUCCESS required
//        */
//       if (
//         !validatePaidOrder(
//           order
//         )
//       ) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "Book access email can only be sent for a successfully paid order.",
//           });
//       }


//       /*
//        * Payment verification
//        */
//       if (
//         !validatePaymentVerification(
//           order
//         )
//       ) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "Payment verification is incomplete for this order.",
//           });
//       }


//       const customerEmail =
//         order.customer
//           ?.email
//           ?.trim()
//           .toLowerCase();


//       if (
//         !customerEmail
//       ) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "Customer email is not available.",
//           });
//       }


//       const book =
//         await getPurchasedBook(
//           order
//         );


//       if (!book) {
//         return res
//           .status(404)
//           .json({
//             success:
//               false,

//             message:
//               "Book associated with this order no longer exists.",
//           });
//       }


//       if (
//         !book.isActive
//       ) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "This book is currently inactive. Access email was not sent.",
//           });
//       }


//       if (
//         !book.isPublished
//       ) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "This book is currently unpublished. Access email was not sent.",
//           });
//       }


//       /*
//        * Save previous access.
//        *
//        * Used only if a new token
//        * is generated and email
//        * sending fails.
//        */
//       const previousAccess =
//         {
//           tokenHash:
//             order.access
//               ?.tokenHash ||
//             null,

//           url:
//             order.access
//               ?.url ||
//             null,

//           expiresAt:
//             order.access
//               ?.expiresAt ||
//             null,

//           generatedAt:
//             order.access
//               ?.generatedAt ||
//             null,

//           lastAccessedAt:
//             order.access
//               ?.lastAccessedAt ||
//             null,

//           accessCount:
//             Number(
//               order.access
//                 ?.accessCount ||
//               0
//             ),

//           revoked:
//             order.access
//               ?.revoked ??
//             false,
//         };


//       const now =
//         new Date();


//       const accessOrderId =
//         order.orderId ||

//         String(
//           order._id
//         );


//       /*
//        * EXISTING URL
//        */
//       const existingAccessUrl =
//         typeof order.access
//           ?.url ===
//           "string"

//           ? order.access
//               .url
//               .trim()

//           : "";


//       /*
//        * EXISTING EXPIRY
//        */
//       const existingExpiresAt =
//         order.access
//           ?.expiresAt

//           ? new Date(
//               order.access
//                 .expiresAt
//             )

//           : null;


//       /*
//        * Check expiry.
//        */
//       const hasValidExpiry =
//         Boolean(
//           existingExpiresAt &&

//           !Number.isNaN(
//             existingExpiresAt
//               .getTime()
//           ) &&

//           existingExpiresAt
//             .getTime() >
//           now.getTime()
//         );


//       /*
//        * Check URL.
//        */
//       const hasValidUrl =
//         isValidExistingAccessUrl(
//           existingAccessUrl,

//           accessOrderId
//         );


//       /*
//        * Token hash must exist.
//        */
//       const hasTokenHash =
//         Boolean(
//           order.access
//             ?.tokenHash
//         );


//       /*
//        * Revoked?
//        */
//       const isRevoked =
//         order.access
//           ?.revoked ===
//         true;


//       /*
//        * REUSE ONLY WHEN:
//        *
//        * token exists
//        * URL valid
//        * expiry valid
//        * not revoked
//        */
//       const canReuseExistingAccess =
//         Boolean(
//           hasTokenHash &&

//           hasValidUrl &&

//           hasValidExpiry &&

//           !isRevoked
//         );


//       let accessUrl;

//       let accessExpiresAt;

//       let generatedAt;

//       let accessCount;

//       let generatedNewAccess =
//         false;


//       /* =====================================================
//          REUSE EXISTING URL
//       ===================================================== */

//       if (
//         canReuseExistingAccess
//       ) {

//         accessUrl =
//           existingAccessUrl;


//         accessExpiresAt =
//           existingExpiresAt;


//         generatedAt =
//           order.access
//             ?.generatedAt ||

//           now;


//         accessCount =
//           Number(
//             order.access
//               ?.accessCount ||
//             0
//           );


//         /*
//          * IMPORTANT:
//          *
//          * DO NOT:
//          *
//          * generate token
//          * change hash
//          * change expiry
//          * change generatedAt
//          * reset accessCount
//          * reset lastAccessedAt
//          */
//         console.log(
//           "Reusing existing access URL:",
//           {
//             orderId:
//               accessOrderId,

//             expiresAt:
//               accessExpiresAt,

//             accessCount,
//           }
//         );
//       }


//       /* =====================================================
//          GENERATE NEW URL
//       ===================================================== */

//       else {

//         generatedNewAccess =
//           true;


//         const rawAccessToken =
//           generateAccessToken();


//         const accessTokenHash =
//           hashAccessToken(
//             rawAccessToken
//           );


//         accessExpiresAt =
//           new Date(
//             now.getTime() +
//             ACCESS_DURATION
//           );


//         accessUrl =
//           buildAccessUrl(
//             rawAccessToken,

//             accessOrderId
//           );


//         generatedAt =
//           now;


//         accessCount =
//           0;


//         /*
//          * Save new URL/token.
//          */
//         await Order
//           .updateOne(
//             {
//               _id:
//                 order._id,
//             },
//             {
//               $set: {

//                 "access.tokenHash":
//                   accessTokenHash,

//                 /*
//                  * Required so the same
//                  * valid link can later
//                  * be resent.
//                  */
//                 "access.url":
//                   accessUrl,

//                 "access.expiresAt":
//                   accessExpiresAt,

//                 "access.generatedAt":
//                   generatedAt,

//                 "access.lastAccessedAt":
//                   null,

//                 "access.accessCount":
//                   0,

//                 "access.revoked":
//                   false,
//               },
//             }
//           );


//         console.log(
//           "New access URL generated:",
//           {
//             url:accessUrl,
//             orderId:
//               accessOrderId,

//             expiresAt:
//               accessExpiresAt,
//           }
//         );
//       }


//       /*
//        * BUILD EMAIL
//        */
//       const {
//         subject,

//         text,

//         html,
//       } =
//         buildBookAccessEmail(
//           {
//             order,

//             book,

//             accessUrl,

//             accessExpiresAt,

//             generatedNewAccess,
//           }
//         );


//       /* =====================================================
//          SEND EMAIL
//       ===================================================== */

//       try {

//         await sendMail(
//           customerEmail,
//           subject,
//           text,
//           html
//         );

//       } catch (
//         mailError
//       ) {

//         console.error(
//           "Book access mail send error:",
//           mailError
//         );


//         /*
//          * Roll back ONLY when
//          * we generated a new token.
//          *
//          * If existing URL was reused,
//          * nothing changed.
//          */
//         if (
//           generatedNewAccess
//         ) {

//           try {

//             await Order
//               .updateOne(
//                 {
//                   _id:
//                     order._id,
//                 },
//                 {
//                   $set: {

//                     "access.tokenHash":
//                       previousAccess
//                         .tokenHash,

//                     "access.url":
//                       previousAccess
//                         .url,

//                     "access.expiresAt":
//                       previousAccess
//                         .expiresAt,

//                     "access.generatedAt":
//                       previousAccess
//                         .generatedAt,

//                     "access.lastAccessedAt":
//                       previousAccess
//                         .lastAccessedAt,

//                     "access.accessCount":
//                       previousAccess
//                         .accessCount,

//                     "access.revoked":
//                       previousAccess
//                         .revoked,
//                   },
//                 }
//               );

//           } catch (
//             rollbackError
//           ) {

//             console.error(
//               "Access rollback failed:",
//               rollbackError
//             );
//           }
//         }


//         return res
//           .status(500)
//           .json({
//             success:
//               false,

//             message:
//               "Failed to send book access email.",
//           });
//       }


//       /* =====================================================
//          SUCCESS
//       ===================================================== */

//       return res
//         .status(200)
//         .json({
//           success:
//             true,


//           message:
//             generatedNewAccess

//               ? "A new book access link was generated and emailed successfully."

//               : "The existing valid book access link was emailed successfully.",


//           data: {

//             orderId:
//               order.orderId ||

//               String(
//                 order._id
//               ),


//             mongoOrderId:
//               order._id,


//             customer: {

//               name:
//                 order.customer
//                   ?.name ||
//                 null,

//               email:
//                 customerEmail,
//             },


//             book: {

//               id:
//                 book._id,

//               title:
//                 book.title,

//               subtitle:
//                 book.subtitle ||
//                 null,

//               edition:
//                 book.edition ||
//                 null,

//               format:
//                 book.format ||
//                 null,

//               price:
//                 book.price,

//               mrp:
//                 book.mrp,

//               currency:
//                 book.currency,

//               coverImage:
//                 getBookCoverUrl(
//                   book.coverImage
//                 ) ||
//                 null,
//             },


//             payment: {

//               orderStatus:
//                 order.orderStatus,

//               status:
//                 order.payment
//                   ?.status,

//               transactionId:
//                 getPaymentTransactionId(
//                   order
//                 ),

//               paymentMethod:
//                 getPaymentMethod(
//                   order
//                 ),

//               amountPaid:
//                 getPaidAmount(
//                   order,
//                   book
//                 ),

//               currency:
//                 getCurrency(
//                   order,
//                   book
//                 ),

//               purchaseDate:
//                 getPurchaseDate(
//                   order
//                 ),
//             },


//             access: {

//               reusedExistingLink:
//                 !generatedNewAccess,

//               generatedNewLink:
//                 generatedNewAccess,

//               generatedAt,

//               expiresAt:
//                 accessExpiresAt,

//               revoked:
//                 false,

//               accessCount,
//             },


//             email: {

//               sentTo:
//                 customerEmail,

//               subject,

//               sentAt:
//                 now,
//             },
//           },
//         });

//     } catch (
//       error
//     ) {

//       console.error(
//         "resendBookAccessMail error:",
//         error
//       );


//       return res
//         .status(500)
//         .json({
//           success:
//             false,

//           message:
//             "Something went wrong while sending the book access email.",
//         });
//     }
//   };


// /* =========================================================
//    REVOKE BOOK ACCESS
// ========================================================= */

// /*
//  * Revoke current access.
//  *
//  * IMPORTANT:
//  *
//  * We DON'T delete:
//  *
//  * access.tokenHash
//  * access.url
//  * access.expiresAt
//  *
//  * We simply set:
//  *
//  * access.revoked = true
//  *
//  * This allows the same token
//  * to later be reactivated.
//  */
// const revokeBookAccess =
//   async (
//     req,
//     res
//   ) => {

//     try {

//       const {
//         orderId,
//       } =
//         req.params;


//       if (!orderId) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "Order ID is required.",
//           });
//       }


//       const order =
//         await Order
//           .findOne(
//             getOrderQuery(
//               orderId
//             )
//           );


//       if (!order) {
//         return res
//           .status(404)
//           .json({
//             success:
//               false,

//             message:
//               "Order not found.",
//           });
//       }


//       /*
//        * No token = nothing
//        * to revoke.
//        */
//       if (
//         !order.access
//           ?.tokenHash
//       ) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "No book access link has been generated for this order.",
//           });
//       }


//       /*
//        * Already revoked.
//        *
//        * Treat this as success
//        * instead of error.
//        */
//       if (
//         order.access
//           ?.revoked ===
//         true
//       ) {
//         return res
//           .status(200)
//           .json({
//             success:
//               true,

//             message:
//               "Book access is already revoked.",

//             data: {

//               orderId:
//                 order.orderId ||

//                 String(
//                   order._id
//                 ),

//               mongoOrderId:
//                 order._id,


//               access: {

//                 revoked:
//                   true,

//                 expiresAt:
//                   order.access
//                     ?.expiresAt ||
//                   null,

//                 generatedAt:
//                   order.access
//                     ?.generatedAt ||
//                   null,

//                 lastAccessedAt:
//                   order.access
//                     ?.lastAccessedAt ||
//                   null,

//                 accessCount:
//                   Number(
//                     order.access
//                       ?.accessCount ||
//                     0
//                   ),
//               },
//             },
//           });
//       }


//       const now =
//         new Date();


//       const adminIdentifier =
//         String(
//           getAdminIdentifier(
//             req
//           )
//         );


//       /*
//        * ONLY revoke.
//        *
//        * Keep same URL/token.
//        */
//       const updatedOrder =
//         await Order
//           .findByIdAndUpdate(
//             order._id,

//             {
//               $set: {

//                 "access.revoked":
//                   true,

//                 updatedBy:
//                   adminIdentifier,
//               },
//             },

//             {
//               new:
//                 true,
//             }
//           );


//       return res
//         .status(200)
//         .json({
//           success:
//             true,

//           message:
//             "Book access revoked successfully.",


//           data: {

//             orderId:
//               updatedOrder
//                 .orderId ||

//               String(
//                 updatedOrder._id
//               ),


//             mongoOrderId:
//               updatedOrder._id,


//             revokedAt:
//               now,


//             access: {

//               revoked:
//                 true,

//               expiresAt:
//                 updatedOrder
//                   .access
//                   ?.expiresAt ||
//                 null,

//               generatedAt:
//                 updatedOrder
//                   .access
//                   ?.generatedAt ||
//                 null,

//               lastAccessedAt:
//                 updatedOrder
//                   .access
//                   ?.lastAccessedAt ||
//                 null,

//               accessCount:
//                 Number(
//                   updatedOrder
//                     .access
//                     ?.accessCount ||
//                   0
//                 ),
//             },
//           },
//         });

//     } catch (
//       error
//     ) {

//       console.error(
//         "revokeBookAccess error:",
//         error
//       );


//       return res
//         .status(500)
//         .json({
//           success:
//             false,

//           message:
//             "Something went wrong while revoking book access.",
//         });
//     }
//   };


// /* =========================================================
//    EXTEND / REACTIVATE BOOK ACCESS
// ========================================================= */

// /*
//  * Request body:
//  *
//  * {
//  *   "hours": 24
//  * }
//  *
//  *
//  * IMPORTANT:
//  *
//  * New expiry =
//  *
//  * CURRENT TIME + HOURS
//  *
//  *
//  * Example:
//  *
//  * current:
//  * 10:00 AM
//  *
//  * hours:
//  * 5
//  *
//  * expiry:
//  * 3:00 PM
//  *
//  *
//  * NOT:
//  *
//  * previous expiry + 5 hours
//  */
// const extendBookAccess =
//   async (
//     req,
//     res
//   ) => {

//     try {

//       const {
//         orderId,
//       } =
//         req.params;


//       const hours =
//         Number(
//           req.body
//             ?.hours
//         );


//       if (!orderId) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "Order ID is required.",
//           });
//       }


//       /*
//        * Only allow positive
//        * integer values.
//        *
//        * 1
//        * 2
//        * 5
//        * 12
//        * 24
//        * 48
//        * etc.
//        */
//       if (
//         !Number.isFinite(
//           hours
//         ) ||

//         !Number.isInteger(
//           hours
//         ) ||

//         hours <= 0
//       ) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "hours must be a positive integer.",
//           });
//       }


//       const order =
//         await Order
//           .findOne(
//             getOrderQuery(
//               orderId
//             )
//           );


//       if (!order) {
//         return res
//           .status(404)
//           .json({
//             success:
//               false,

//             message:
//               "Order not found.",
//           });
//       }


//       /*
//        * IMPORTANT:
//        *
//        * We require tokenHash.
//        *
//        * We DON'T require access.url.
//        *
//        * Older orders may not have
//        * access.url stored but their
//        * original email URL can still
//        * work.
//        */
//       if (
//         !order.access
//           ?.tokenHash
//       ) {
//         return res
//           .status(400)
//           .json({
//             success:
//               false,

//             message:
//               "No existing book access token is available for this order. Generate/send an access link first.",
//           });
//       }


//       const now =
//         new Date();


//       /*
//        * CURRENT TIME + HOURS
//        */
//       const newExpiresAt =
//         new Date(
//           now.getTime() +

//           hours *
//           60 *
//           60 *
//           1000
//         );


//       const previousExpiresAt =
//         order.access
//           ?.expiresAt ||
//         null;


//       const wasRevoked =
//         order.access
//           ?.revoked ===
//         true;


//       const adminIdentifier =
//         String(
//           getAdminIdentifier(
//             req
//           )
//         );


//       /*
//        * DO NOT CHANGE:
//        *
//        * tokenHash
//        * url
//        * generatedAt
//        * accessCount
//        * lastAccessedAt
//        *
//        *
//        * ONLY CHANGE:
//        *
//        * expiresAt
//        * revoked
//        */
//       const updatedOrder =
//         await Order
//           .findByIdAndUpdate(
//             order._id,

//             {
//               $set: {

//                 "access.expiresAt":
//                   newExpiresAt,

//                 /*
//                  * Reactivate same token.
//                  */
//                 "access.revoked":
//                   false,

//                 updatedBy:
//                   adminIdentifier,
//               },
//             },

//             {
//               new:
//                 true,
//             }
//           );


//       return res
//         .status(200)
//         .json({
//           success:
//             true,


//           message:
//             wasRevoked

//               ? (
//                   `Book access reactivated for ` +
//                   `${hours} hour` +
//                   `${hours === 1 ? "" : "s"} ` +
//                   `from the current time.`
//                 )

//               : (
//                   `Book access extended for ` +
//                   `${hours} hour` +
//                   `${hours === 1 ? "" : "s"} ` +
//                   `from the current time.`
//                 ),


//           data: {

//             orderId:
//               updatedOrder
//                 .orderId ||

//               String(
//                 updatedOrder._id
//               ),


//             mongoOrderId:
//               updatedOrder._id,


//             hoursAddedFromNow:
//               hours,


//             previousExpiresAt,


//             extendedAt:
//               now,


//             access: {

//               revoked:
//                 false,

//               expiresAt:
//                 updatedOrder
//                   .access
//                   ?.expiresAt ||

//                 newExpiresAt,

//               generatedAt:
//                 updatedOrder
//                   .access
//                   ?.generatedAt ||
//                 null,

//               lastAccessedAt:
//                 updatedOrder
//                   .access
//                   ?.lastAccessedAt ||
//                 null,

//               accessCount:
//                 Number(
//                   updatedOrder
//                     .access
//                     ?.accessCount ||
//                   0
//                 ),
//             },
//           },
//         });

//     } catch (
//       error
//     ) {

//       console.error(
//         "extendBookAccess error:",
//         error
//       );


//       return res
//         .status(500)
//         .json({
//           success:
//             false,

//           message:
//             "Something went wrong while extending book access.",
//         });
//     }
//   };


// /* =========================================================
//    EXPORTS
// ========================================================= */

// export {
//   sendPendingPurchaseMail,
//   resendBookAccessMail,
//   revokeBookAccess,
//   extendBookAccess,
// };


import mongoose from "mongoose";
import crypto from "crypto";

import Order from "../models/Order.js";
import Book from "../models/Book.js";
import sendMail from "../utils/MailSender.js";

import {
  validateCouponForPayment,
} from "../controllers/couponController.js";

/* =========================================================
   CONFIG
========================================================= */

const SITE_URL = "https://www.targettrek.in";
const BOOKS_URL = `${SITE_URL}/books`;
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const ACCESS_DURATION = 24 * 60 * 60 * 1000;

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

const escapeHtml = (value = "") =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const first = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
  );

const appError = (code, message, status = 400) =>
  Object.assign(new Error(message), {
    code,
    status,
  });

const formatAmount = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getAdminIdentifier = (req) =>
  String(
    req.user?.email ||
    req.admin?.email ||
    req.user?._id ||
    req.admin?._id ||
    "ADMIN"
  );

const getOrderQuery = (value) => {
  const id = String(value || "").trim();

  if (!id) {
    throw appError(
      "INVALID_ORDER_ID",
      "Order ID is required."
    );
  }

  if (mongoose.isValidObjectId(id)) {
    return {
      $or: [
        { _id: new mongoose.Types.ObjectId(id) },
        { orderId: id },
      ],
    };
  }

  return { orderId: id };
};

const getPurchasedBook = async (order) =>
  Book.findById(order.bookId).select(
    "title subtitle description shortDescription " +
    "edition categories level language format " +
    "price mrp currency redirectUrl paymentUrl " +
    "coverImage coverPageUrl isActive isPublished"
  );

const getCoverUrl = (book) => {
  const cover =
    book?.coverImage ||
    book?.coverPageUrl ||
    "";

  const url =
    typeof cover === "string"
      ? cover
      : cover?.secure_url || cover?.url || "";

  return /^https:\/\//i.test(url) ? url : "";
};

const getPurchaseURL = (book) => {
  const value = String(book.redirectUrl || "").trim();

  if (!value) return BOOKS_URL;

  try {
    const url = new URL(value, SITE_URL);

    // Avoid redirecting customer emails to arbitrary hosts.
    if (url.origin !== new URL(SITE_URL).origin) {
      return BOOKS_URL;
    }

    return url.toString();
  } catch {
    return BOOKS_URL;
  }
};

const getCurrency = (order) =>
  String(order.book?.currency || "INR").toUpperCase();

const getPaidAmount = (order) =>
  Number(
    first(
      order.payment?.amount,
      order.coupon?.applied
        ? order.coupon?.finalAmount
        : null,
      order.book?.price
    ) || 0
  );

const getTransactionId = (order) =>
  first(
    order.payment?.transactionId,
    order.payment?.paymentId,
    order.orderId
  ) || "N/A";

/* =========================================================
   ACCESS TOKEN HELPERS
========================================================= */

const generateAccessToken = () =>
  crypto.randomBytes(32).toString("hex");

const hashAccessToken = (token) =>
  crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

const buildAccessUrl = (token, orderId) =>
  `${SITE_URL}/payment/success` +
  `?token=${encodeURIComponent(token)}` +
  `&order=${encodeURIComponent(orderId)}`;

/* =========================================================
   PAYMENT STATUS CHECK
========================================================= */

const validatePaidOrder = (order) => {
  const orderStatus = normalize(order.orderStatus);
  const paymentStatus = normalize(order.payment?.status);
  const refundStatus = normalize(order.refund?.status);

  const eligibleOrder =
    orderStatus === "paid" ||
    orderStatus === "partially_refunded";

  const eligiblePayment =
    paymentStatus === "success" ||
    paymentStatus === "partially_refunded";

  const fullyRefunded =
    orderStatus === "refunded" ||
    paymentStatus === "refunded" ||
    refundStatus === "refunded";

  return (
    eligibleOrder &&
    eligiblePayment &&
    !fullyRefunded &&
    order.access?.revoked !== true
  );
};

/* =========================================================
   GATEWAY SNAPSHOT HELPERS

   Matches actual schema:
   payment.createResponse
   payment.callbackResponse
   payment.verificationResponse
========================================================= */

const parseObject = (value) => {
  if (!value) return {};

  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const getSnapshots = (order) => {
  const results = [];

  for (const response of [
    order.payment?.createResponse,
    order.payment?.callbackResponse,
    order.payment?.verificationResponse,
  ]) {
    const root = parseObject(response);
    results.push(root);

    for (const key of [
      "data",
      "payload",
      "payment",
      "order",
    ]) {
      const nested = parseObject(root[key]);

      if (Object.keys(nested).length > 0) {
        results.push(nested);
      }
    }
  }

  return results;
};

const getSnapshotField = (order, ...keys) => {
  for (const snapshot of getSnapshots(order)) {
    for (const key of keys) {
      const value = snapshot[key];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }
  }

  return null;
};

const getProvider = (order) => {
  const provider = normalize(order.payment?.provider);

  if (provider.includes("cashfree")) return "cashfree";
  if (provider.includes("razorpay")) return "razorpay";
  if (provider.includes("payu")) return "payu";

  throw appError(
    "UNKNOWN_PROVIDER",
    "Unsupported or missing payment provider."
  );
};

const verifyAmount = (actual, order) => {
  const expected = Number(order.payment?.amount);

  if (
    order.payment?.amount == null ||
    !Number.isFinite(expected) ||
    expected < 0
  ) {
    throw appError(
      "STORED_AMOUNT_INVALID",
      "Stored payment amount is invalid."
    );
  }

  const received = Number(actual);

  if (
    actual == null ||
    !Number.isFinite(received) ||
    Math.abs(expected - received) > 0.01
  ) {
    throw appError(
      "AMOUNT_MISMATCH",
      "Gateway amount does not match the stored order."
    );
  }
};

const verifyCurrency = (actual, order) => {
  if (normalize(actual) !== normalize(getCurrency(order))) {
    throw appError(
      "CURRENCY_MISMATCH",
      "Gateway currency does not match the order."
    );
  }
};

const gatewayRequest = async (url, options = {}) => {
  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    12000
  );

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw appError(
        "GATEWAY_HTTP_ERROR",
        `Gateway verification failed with HTTP ${response.status}.`,
        502
      );
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw appError(
        "GATEWAY_TIMEOUT",
        "Gateway verification timed out.",
        504
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

/* =========================================================
   CASHFREE VERIFICATION
========================================================= */

const verifyCashfree = async (order) => {
  const clientId =
    process.env.CASHFREE_APP_ID ||
    process.env.CASHFREE_CLIENT_ID;

  const clientSecret =
    process.env.CASHFREE_SECRET_KEY ||
    process.env.CASHFREE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw appError(
      "CASHFREE_CONFIG_MISSING",
      "Cashfree credentials are not configured."
    );
  }

  const gatewayOrderId = first(
    getSnapshotField(order, "order_id"),
    order.orderId
  );

  if (!gatewayOrderId) {
    throw appError(
      "CASHFREE_ORDER_MISSING",
      "Cashfree order ID is missing."
    );
  }

  const sandbox = ["sandbox", "test"].includes(
    normalize(process.env.CASHFREE_ENV)
  );

  const base = sandbox
    ? "https://sandbox.cashfree.com/pg"
    : "https://api.cashfree.com/pg";

  const headers = {
    "x-client-id": clientId,
    "x-client-secret": clientSecret,
    "x-api-version":
      process.env.CASHFREE_API_VERSION ||
      "2023-08-01",
    Accept: "application/json",
  };

  const gatewayOrder = await gatewayRequest(
    `${base}/orders/${encodeURIComponent(gatewayOrderId)}`,
    { headers }
  );

  if (String(gatewayOrder.order_id) !== String(gatewayOrderId)) {
    throw appError(
      "CASHFREE_ORDER_MISMATCH",
      "Cashfree order ID does not match."
    );
  }

  if (normalize(gatewayOrder.order_status) !== "paid") {
    throw appError(
      "CASHFREE_NOT_PAID",
      "Cashfree has not confirmed this order as PAID."
    );
  }

  verifyAmount(gatewayOrder.order_amount, order);
  verifyCurrency(gatewayOrder.order_currency, order);

  // Fetch payment records to check for a successful payment.
  const records = await gatewayRequest(
    `${base}/orders/${encodeURIComponent(gatewayOrderId)}/payments`,
    { headers }
  );

  if (!Array.isArray(records)) {
    throw appError(
      "CASHFREE_PAYMENT_RESPONSE",
      "Cashfree did not return a payment list."
    );
  }

  const successful = records.filter(
    (p) => normalize(p.payment_status) === "success"
  );

  if (!successful.length) {
    throw appError(
      "CASHFREE_PAYMENT_NOT_FOUND",
      "No successful Cashfree payment was found."
    );
  }

  const storedPaymentId = first(
    order.payment?.paymentId,
    getSnapshotField(order, "cf_payment_id")
  );

  const matchedPayment = successful.find((p) => {
    if (
      storedPaymentId &&
      String(p.cf_payment_id) !== String(storedPaymentId)
    ) {
      return false;
    }

    return (
      String(p.order_id || gatewayOrderId) ===
        String(gatewayOrderId) &&
      Number.isFinite(Number(p.payment_amount)) &&
      Math.abs(
        Number(p.payment_amount) -
        Number(order.payment.amount)
      ) <= 0.01 &&
      normalize(p.payment_currency || gatewayOrder.order_currency) ===
        normalize(getCurrency(order))
    );
  });

  if (!matchedPayment) {
    throw appError(
      "CASHFREE_PAYMENT_MISMATCH",
      "No Cashfree payment matches the stored payment details."
    );
  }

  return {
    provider: "cashfree",
    gatewayOrderId,
    paymentId: matchedPayment.cf_payment_id,
  };
};

/* =========================================================
   RAZORPAY VERIFICATION
========================================================= */

const verifyRazorpay = async (order) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !secret) {
    throw appError(
      "RAZORPAY_CONFIG_MISSING",
      "Razorpay credentials are missing."
    );
  }

  const paymentId = first(
    order.payment?.paymentId?.startsWith?.("pay_")
      ? order.payment.paymentId
      : null,
    getSnapshotField(order, "razorpay_payment_id"),
    order.payment?.transactionId?.startsWith?.("pay_")
      ? order.payment.transactionId
      : null
  );

  const razorpayOrderId = first(
    getSnapshotField(order, "razorpay_order_id"),
    getSnapshotField(order, "order_id"),
    order.orderId?.startsWith?.("order_")
      ? order.orderId
      : null
  );

  if (
    !String(paymentId || "").startsWith("pay_") ||
    !String(razorpayOrderId || "").startsWith("order_")
  ) {
    throw appError(
      "RAZORPAY_IDS_MISSING",
      "Razorpay payment ID or gateway order ID was not saved."
    );
  }

  const authorization = Buffer.from(
    `${keyId}:${secret}`
  ).toString("base64");

  const headers = {
    Authorization: `Basic ${authorization}`,
    Accept: "application/json",
  };

  const payment = await gatewayRequest(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
    { headers }
  );

  if (String(payment.id) !== String(paymentId)) {
    throw appError(
      "RAZORPAY_ID_MISMATCH",
      "Razorpay payment ID does not match."
    );
  }

  if (String(payment.order_id) !== String(razorpayOrderId)) {
    throw appError(
      "RAZORPAY_ORDER_MISMATCH",
      "Razorpay order ID does not match."
    );
  }

  if (
    normalize(payment.status) !== "captured" ||
    payment.captured !== true
  ) {
    throw appError(
      "RAZORPAY_NOT_CAPTURED",
      "Razorpay payment has not been captured."
    );
  }

  // For INR payments, Razorpay returns paise.
  // This controller currently supports INR orders.
  if (getCurrency(order) !== "INR") {
    throw appError(
      "RAZORPAY_CURRENCY_UNSUPPORTED",
      "Configure currency-specific subunits before verifying non-INR Razorpay payments."
    );
  }

  verifyAmount(Number(payment.amount) / 100, order);
  verifyCurrency(payment.currency, order);

  const gatewayOrder = await gatewayRequest(
    `https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpayOrderId)}`,
    { headers }
  );

  if (String(gatewayOrder.id) !== String(razorpayOrderId)) {
    throw appError(
      "RAZORPAY_ORDER_MISMATCH",
      "Razorpay returned a different order."
    );
  }

  verifyAmount(Number(gatewayOrder.amount) / 100, order);
  verifyCurrency(gatewayOrder.currency, order);

  return {
    provider: "razorpay",
    gatewayOrderId: razorpayOrderId,
    paymentId,
  };
};

/* =========================================================
   PAYU VERIFICATION
========================================================= */

const verifyPayU = async (order) => {
  const key =
    process.env.PAYU_KEY ||
    process.env.PAYU_MERCHANT_KEY;

  const salt =
    process.env.PAYU_SALT ||
    process.env.PAYU_MERCHANT_SALT;

  if (!key || !salt) {
    throw appError(
      "PAYU_CONFIG_MISSING",
      "PayU merchant credentials are missing."
    );
  }

  const txnid = first(
    getSnapshotField(order, "txnid"),
    order.payment?.transactionId,
    order.orderId
  );

  if (!txnid) {
    throw appError(
      "PAYU_TXNID_MISSING",
      "PayU transaction ID is missing."
    );
  }

  if (getCurrency(order) !== "INR") {
    throw appError(
      "PAYU_CURRENCY_MISMATCH",
      "PayU India order currency must be INR."
    );
  }

  const command = "verify_payment";

  const hash = crypto
    .createHash("sha512")
    .update(`${key}|${command}|${txnid}|${salt}`)
    .digest("hex");

  const payload = new URLSearchParams({
    key,
    command,
    var1: String(txnid),
    hash,
  });

  const test = ["test", "sandbox"].includes(
    normalize(process.env.PAYU_ENV)
  );

  const endpoint = test
    ? "https://test.payu.in/merchant/postservice.php?form=2"
    : "https://info.payu.in/merchant/postservice.php?form=2";

  const result = await gatewayRequest(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: payload.toString(),
  });

  const transaction =
    result?.transaction_details?.[String(txnid)];

  if (!transaction) {
    throw appError(
      "PAYU_TRANSACTION_MISSING",
      "PayU did not return the requested transaction."
    );
  }

  if (normalize(transaction.status) !== "success") {
    throw appError(
      "PAYU_NOT_SUCCESS",
      "PayU has not confirmed this payment as successful."
    );
  }

  if (
    transaction.txnid &&
    String(transaction.txnid) !== String(txnid)
  ) {
    throw appError(
      "PAYU_TXNID_MISMATCH",
      "PayU returned a different transaction ID."
    );
  }

  verifyAmount(
    first(transaction.amt, transaction.amount),
    order
  );

  return {
    provider: "payu",
    transactionId: txnid,
    gatewayPaymentId: transaction.mihpayid || null,
  };
};

/* =========================================================
   MULTI-GATEWAY VERIFICATION
========================================================= */

const verifyPaymentWithGateway = async (order) => {
  const provider = getProvider(order);

  if (provider === "cashfree") {
    return verifyCashfree(order);
  }

  if (provider === "razorpay") {
    return verifyRazorpay(order);
  }

  return verifyPayU(order);
};

/* =========================================================
   SHARED EMAIL LAYOUT
========================================================= */

const emailShell = ({
  title,
  subtitle,
  body,
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport"
        content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f8fafc;
  font-family:Arial,Helvetica,sans-serif;
  color:#0f172a;
">
  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="background:#f8fafc;"
  >
    <tr>
      <td align="center" style="padding:30px 14px;">
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="
            max-width:650px;
            background:#ffffff;
            border:1px solid #e2e8f0;
            border-radius:16px;
          "
        >
          <tr>
            <td style="
              padding:25px;
              background:#fff7ed;
              border-bottom:1px solid #fed7aa;
            ">
              <div style="
                color:#ea580c;
                font-size:25px;
                font-weight:800;
              ">
                Target Trek
              </div>

              <div style="
                margin-top:6px;
                color:#64748b;
                font-size:12px;
              ">
                Learn. Build. Grow.
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 25px;">
              <h1 style="
                margin:0;
                font-size:24px;
                line-height:1.3;
              ">
                ${escapeHtml(title)}
              </h1>

              <p style="
                color:#64748b;
                font-size:14px;
                line-height:1.7;
              ">
                ${escapeHtml(subtitle)}
              </p>

              ${body}

              <p style="
                margin-top:30px;
                font-size:13px;
                color:#64748b;
                line-height:1.7;
              ">
                Need help?
                <a href="mailto:${SUPPORT_EMAIL}"
                   style="color:#ea580c;">
                  ${SUPPORT_EMAIL}
                </a>
              </p>

              <p style="
                margin-top:20px;
                font-size:12px;
                color:#94a3b8;
              ">
                Team Target Trek
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

const emailButton = (url, text) => `
  <table role="presentation" cellpadding="0"
         cellspacing="0" style="margin:25px 0;">
    <tr>
      <td style="
        background:#ea580c;
        border-radius:10px;
        padding:15px 25px;
      ">
        <a href="${escapeHtml(url)}"
           style="
             color:#ffffff;
             font-size:14px;
             font-weight:800;
             text-decoration:none;
           ">
          ${escapeHtml(text)}
        </a>
      </td>
    </tr>
  </table>
`;

const emailBookCard = (book) => {
  const cover = getCoverUrl(book);

  return `
    <div style="
      margin:22px 0;
      padding:16px;
      background:#f8fafc;
      border:1px solid #e2e8f0;
      border-radius:12px;
    ">
      ${
        cover
          ? `<img
               src="${escapeHtml(cover)}"
               alt="${escapeHtml(book.title)}"
               width="100"
               style="
                 border-radius:8px;
                 display:block;
                 margin-bottom:12px;
               "
             />`
          : ""
      }

      <div style="
        font-size:18px;
        font-weight:800;
        color:#0f172a;
      ">
        ${escapeHtml(book.title)}
      </div>

      ${
        book.subtitle
          ? `<p style="
                color:#64748b;
                font-size:13px;
              ">
                ${escapeHtml(book.subtitle)}
             </p>`
          : ""
      }
    </div>
  `;
};

/* =========================================================
   BUILD PENDING PURCHASE EMAIL
========================================================= */

export const buildPendingPurchaseEmail = ({
  order,
  book,
  couponCode = "",
  couponDescription = "",
  couponValidation = null,
}) => {
  const name = order.customer?.name || "there";
  const email = order.customer?.email || "";

  const price = Number(book.price || 0);
  const mrp = Number(book.mrp || 0);
  const currency = book.currency || "INR";

  const purchaseUrl = getPurchaseURL(book);

  const discount =
    couponValidation?.discountAmount ??
    couponValidation?.data?.discountAmount ??
    null;

  const finalAmount =
    couponValidation?.finalAmount ??
    couponValidation?.data?.finalAmount ??
    null;

  const hasCoupon =
    Boolean(couponCode && couponDescription);

  const subject = hasCoupon
    ? `Complete your ${book.title} purchase — coupon inside | Target Trek`
    : `Complete your ${book.title} purchase | Target Trek`;

  const text = `
Hi ${name},

You started purchasing "${book.title}" but did not complete payment.

Order ID: ${order.orderId}
Customer Email: ${email}

Book: ${book.title}
Current Price: ${formatAmount(price, currency)}
${mrp > price ? `MRP: ${formatAmount(mrp, currency)}` : ""}

${
  hasCoupon
    ? `Coupon: ${couponCode}
Offer: ${couponDescription}
${discount != null ? `Discount: ${formatAmount(discount, currency)}` : ""}
${finalAmount != null ? `Final Price: ${formatAmount(finalAmount, currency)}` : ""}`
    : ""
}

Complete your purchase:
${purchaseUrl}

Explore all books:
${BOOKS_URL}

Support:
${SUPPORT_EMAIL}

Team Target Trek
  `.trim();

  const couponHtml = hasCoupon
    ? `
      <div style="
        padding:18px;
        background:#f0fdf4;
        border:1px solid #bbf7d0;
        border-radius:12px;
        margin:20px 0;
      ">
        <strong>Special Offer</strong>

        <p>${escapeHtml(couponDescription)}</p>

        <p style="font-size:20px;font-weight:800;">
          ${escapeHtml(couponCode)}
        </p>

        ${
          discount != null
            ? `<p>You save:
                 ${escapeHtml(formatAmount(discount, currency))}
               </p>`
            : ""
        }

        ${
          finalAmount != null
            ? `<p>Final price:
                 ${escapeHtml(formatAmount(finalAmount, currency))}
               </p>`
            : ""
        }
      </div>
    `
    : "";

  const html = emailShell({
    title: `Hi ${name},`,
    subtitle:
      "Your Target Trek purchase is waiting for you.",

    body: `
      <p style="font-size:14px;line-height:1.7;">
        You started purchasing
        <strong>${escapeHtml(book.title)}</strong>,
        but the payment was not completed.
      </p>

      ${emailBookCard(book)}

      <p>
        Order ID:
        <strong>${escapeHtml(order.orderId)}</strong>
      </p>

      ${
        mrp > price
          ? `<p>
               MRP:
               <del>${escapeHtml(formatAmount(mrp, currency))}</del>
             </p>`
          : ""
      }

      <p style="font-size:18px;font-weight:800;color:#ea580c;">
        ${escapeHtml(formatAmount(price, currency))}
      </p>

      ${couponHtml}

      ${emailButton(purchaseUrl, "Complete Your Purchase")}

      <p style="font-size:12px;word-break:break-all;">
        ${escapeHtml(purchaseUrl)}
      </p>
    `,
  });

  return {
    subject,
    text,
    html,
    purchaseUrl,
  };
};

/* =========================================================
   SEND PENDING PURCHASE EMAIL
========================================================= */

const sendPendingPurchaseMail = async (req, res) => {
  try {
    const order = await Order.findOne(
      getOrderQuery(req.params.orderId)
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const allowed = new Set([
      "pending",
      "failed",
      "cancelled",
    ]);

    if (
      !allowed.has(normalize(order.orderStatus)) ||
      !allowed.has(normalize(order.payment?.status))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Purchase reminders are only available for unpaid orders.",
      });
    }

    const email = String(
      order.customer?.email || ""
    )
      .trim()
      .toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Customer email is invalid.",
      });
    }

    const book = await getPurchasedBook(order);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    if (book.isActive === false || book.isPublished === false) {
      return res.status(400).json({
        success: false,
        message: "This book is not available for purchase.",
      });
    }

    if (!book.redirectUrl) {
      return res.status(400).json({
        success: false,
        message: "Book purchase URL is not configured.",
      });
    }

    const couponCode =
      typeof req.body?.couponCode === "string"
        ? req.body.couponCode.trim().toUpperCase()
        : "";

    const couponDescription =
      typeof req.body?.couponDescription === "string"
        ? req.body.couponDescription.trim()
        : "";

    if (Boolean(couponCode) !== Boolean(couponDescription)) {
      return res.status(400).json({
        success: false,
        message:
          "Coupon code and description must both be provided.",
      });
    }

    let couponValidation = null;

    if (couponCode) {
      couponValidation = await validateCouponForPayment({
        couponCode,
        bookId: String(book._id),
        book,
        email,
      });

      if (
        couponValidation?.valid === false ||
        couponValidation?.success === false
      ) {
        return res.status(400).json({
          success: false,
          message:
            couponValidation?.message ||
            "Coupon validation failed.",
        });
      }
    }

    const message = buildPendingPurchaseEmail({
      order,
      book,
      couponCode,
      couponDescription,
      couponValidation,
    });

    try {
      await sendMail(
        email,
        message.subject,
        message.text,
        message.html
      );
    } catch (error) {
      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            "pendingMail.lastStatus": "FAILED",
            "pendingMail.lastError": String(
              error.message || "Mail failed"
            ).slice(0, 500),
          },
        }
      );

      return res.status(502).json({
        success: false,
        message: "Unable to send pending purchase email.",
      });
    }

    const now = new Date();

    const update = {
      $inc: {
        "pendingMail.sentCount": 1,
      },
      $set: {
        "pendingMail.lastSentAt": now,
        "pendingMail.lastSentBy": getAdminIdentifier(req),
        "pendingMail.lastStatus": "SENT",
        "pendingMail.lastError": null,
        updatedBy: getAdminIdentifier(req),
      },
    };

    if (!order.pendingMail?.firstSentAt) {
      update.$set["pendingMail.firstSentAt"] = now;
    }

    const updated = await Order.findByIdAndUpdate(
      order._id,
      update,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Pending purchase email sent successfully.",
      data: {
        orderId: updated.orderId,
        customerEmail: email,
        bookTitle: book.title,
        couponCode: couponCode || null,
        purchaseUrl: message.purchaseUrl,
        pendingMail: updated.pendingMail,
      },
    });
  } catch (error) {
    console.error("sendPendingPurchaseMail:", error);

    return res.status(error.status || 500).json({
      success: false,
      code: error.code || "PENDING_MAIL_ERROR",
      message:
        error.status ? error.message : "Unable to send reminder.",
    });
  }
};

/* =========================================================
   BUILD BOOK ACCESS EMAIL
========================================================= */

const buildBookAccessEmail = ({
  order,
  book,
  accessUrl,
  accessExpiresAt,
  generatedNewAccess = true,
}) => {
  const name = order.customer?.name || "there";
  const title = book.title || order.book?.title || "Your book";
  const currency = getCurrency(order);

  const amount = getPaidAmount(order);
  const transactionId = getTransactionId(order);
  const method = order.payment?.method || "Online Payment";

  const subject = `Your ${title} access link | Target Trek`;

  const text = `
Hi ${name},

Thank you for purchasing "${title}" from Target Trek.

Your secure book access link is ready:

${accessUrl}

Order ID: ${order.orderId}
Transaction ID: ${transactionId}
Payment Gateway: ${order.payment?.provider || "Online"}
Payment Method: ${method}
Amount Paid: ${formatAmount(amount, currency)}
Purchase Date: ${formatDate(
    order.payment?.paidAt || order.createdAt
  )}

Your access link expires on:
${formatDate(accessExpiresAt)}

Do not share this link.

Support: ${SUPPORT_EMAIL}

Team Target Trek
  `.trim();

  const html = emailShell({
    title: `Hi ${name},`,
    subtitle:
      "Your payment is complete and your book is ready.",

    body: `
      <p style="font-size:14px;line-height:1.7;">
        Thank you for purchasing
        <strong>${escapeHtml(title)}</strong>.
      </p>

      ${emailBookCard(book)}

      ${emailButton(accessUrl, "Access Your Book")}

      <div style="
        margin-top:18px;
        padding:14px;
        border:1px solid #e2e8f0;
        border-radius:10px;
        background:#f8fafc;
      ">
        <strong>Payment Details</strong>

        <p>Order ID:
          ${escapeHtml(order.orderId)}
        </p>

        <p>Transaction:
          ${escapeHtml(transactionId)}
        </p>

        <p>Payment Method:
          ${escapeHtml(method)}
        </p>

        <p>Amount Paid:
          <strong>
            ${escapeHtml(formatAmount(amount, currency))}
          </strong>
        </p>

        <p>Purchase Date:
          ${escapeHtml(formatDate(
            order.payment?.paidAt || order.createdAt
          ))}
        </p>
      </div>

      <div style="
        padding:16px;
        margin-top:20px;
        background:#fff7ed;
        border:1px solid #fed7aa;
        border-radius:12px;
        color:#9a3412;
      ">
        <strong>Secure Access Link</strong>

        <p>
          This link is valid until
          <strong>
            ${escapeHtml(formatDate(accessExpiresAt))}
          </strong>.
        </p>

        <p>
          Do not share the access link with anyone.
        </p>
      </div>

      <p style="
        font-size:12px;
        word-break:break-all;
      ">
        Link:
        <a href="${escapeHtml(accessUrl)}">
          ${escapeHtml(accessUrl)}
        </a>
      </p>
    `,
  });

  return {
    subject,
    text,
    html,
    accessUrl,
    accessExpiresAt,
    generatedNewAccess,
  };
};

/* =========================================================
   RESEND ACCESS EMAIL

   1. Find order
   2. Check paid status
   3. Check customer
   4. Verify live gateway
   5. Atomically rotate token
   6. Send email
   7. Roll back token on mail failure
========================================================= */

const resendBookAccessMail = async (req, res) => {
  try {
    const order = await Order.findOne(
      getOrderQuery(req.params.orderId)
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!validatePaidOrder(order)) {
      return res.status(400).json({
        success: false,
        code: "ORDER_NOT_PAID",
        message:
          "Order is not eligible for book access. Payment must be successful and access must not be revoked or fully refunded.",
      });
    }

    const customerEmail = String(
      order.customer?.email || ""
    )
      .trim()
      .toLowerCase();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer email is invalid.",
      });
    }

    const book = await getPurchasedBook(order);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Purchased book not found.",
      });
    }

    // Historical paid purchases are not blocked merely
    // because a product is no longer published.

    let verification;

    try {
      verification = await verifyPaymentWithGateway(order);
    } catch (error) {
      console.error("Gateway verification failure:", {
        orderId: order.orderId,
        provider: order.payment?.provider,
        code: error.code,
        message: error.message,
      });

      return res.status(error.status || 409).json({
        success: false,
        code: error.code || "GATEWAY_VERIFICATION_FAILED",
        message:
          "Payment verification failed. Access email was not sent.",
        reason: error.message,
      });
    }

    const now = new Date();
    const token = generateAccessToken();
    const tokenHash = hashAccessToken(token);

    const expiresAt = new Date(
      now.getTime() + ACCESS_DURATION
    );

    const accessUrl = buildAccessUrl(
      token,
      order.orderId
    );

    const previousAccess = {
      tokenHash: order.access?.tokenHash ?? null,
      expiresAt: order.access?.expiresAt ?? null,
      generatedAt: order.access?.generatedAt ?? null,
      lastAccessedAt:
        order.access?.lastAccessedAt ?? null,
      accessCount: order.access?.accessCount ?? 0,
      revoked: order.access?.revoked ?? false,
    };

    const verificationField = {
      cashfree: "verification.cashfreeVerified",
      razorpay: "verification.razorpayVerified",
      payu: "verification.payuVerified",
    }[verification.provider];

    // Optimistic lock prevents two concurrent resends
    // from overwriting each other's access token.
    const updated = await Order.findOneAndUpdate(
      {
        _id: order._id,
        orderStatus: order.orderStatus,
        "payment.status": order.payment.status,
        "payment.provider": order.payment.provider,
        "access.revoked": { $ne: true },
        "access.tokenHash": previousAccess.tokenHash,
      },
      {
        $set: {
          "access.tokenHash": tokenHash,
          "access.expiresAt": expiresAt,
          "access.generatedAt": now,
          "access.lastAccessedAt": null,
          "access.accessCount": 0,
          "access.revoked": false,

          [verificationField]: true,
          "verification.amountVerified": true,
          "verification.verifiedAt": now,

          updatedBy: getAdminIdentifier(req),
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({
        success: false,
        code: "ORDER_CHANGED",
        message:
          "Order or access state changed during verification. Retry after reviewing the order.",
      });
    }

    const email = buildBookAccessEmail({
      order: updated,
      book,
      accessUrl,
      accessExpiresAt: expiresAt,
      generatedNewAccess: true,
    });

    try {
      await sendMail(
        customerEmail,
        email.subject,
        email.text,
        email.html
      );
    } catch (error) {
      // Restore previous access only if our generated
      // token is still the active token.
      await Order.updateOne(
        {
          _id: order._id,
          "access.tokenHash": tokenHash,
        },
        {
          $set: {
            "access.tokenHash": previousAccess.tokenHash,
            "access.expiresAt": previousAccess.expiresAt,
            "access.generatedAt": previousAccess.generatedAt,
            "access.lastAccessedAt":
              previousAccess.lastAccessedAt,
            "access.accessCount": previousAccess.accessCount,
            "access.revoked": previousAccess.revoked,
          },
        }
      );

      console.error("Access mail failure:", error.message);

      return res.status(502).json({
        success: false,
        code: "ACCESS_EMAIL_FAILED",
        message:
          "Payment was verified but the email could not be sent.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Payment verified and a fresh 24-hour access email sent successfully.",
      data: {
        orderId: order.orderId,
        mongoOrderId: order._id,
        customer: {
          name: order.customer?.name,
          email: customerEmail,
        },
        book: {
          id: book._id,
          title: book.title,
        },
        payment: {
          provider: verification.provider,
          status: order.payment.status,
          verified: true,
          amount: order.payment.amount,
          currency: getCurrency(order),
        },
        access: {
          generatedAt: now,
          expiresAt,
          revoked: false,
          accessCount: 0,
        },
        email: {
          sent: true,
          sentTo: customerEmail,
        },
      },
    });
  } catch (error) {
    console.error("resendBookAccessMail:", error);

    return res.status(error.status || 500).json({
      success: false,
      code: error.code || "ACCESS_RESEND_ERROR",
      message:
        error.status
          ? error.message
          : "Unable to resend access email.",
    });
  }
};

/* =========================================================
   REVOKE BOOK ACCESS
========================================================= */

const revokeBookAccess = async (req, res) => {
  try {
    const order = await Order.findOne(
      getOrderQuery(req.params.orderId)
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!order.access?.tokenHash) {
      return res.status(400).json({
        success: false,
        message: "No active access token exists for this order.",
      });
    }

    if (order.access?.revoked) {
      return res.status(400).json({
        success: false,
        message: "Book access is already revoked.",
      });
    }

    const updated = await Order.findOneAndUpdate(
      {
        _id: order._id,
        "access.revoked": { $ne: true },
      },
      {
        $set: {
          "access.revoked": true,
          updatedBy: getAdminIdentifier(req),
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({
        success: false,
        message: "Book access was changed by another request.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book access revoked successfully.",
      data: {
        orderId: updated.orderId,
        access: {
          revoked: updated.access.revoked,
          expiresAt: updated.access.expiresAt,
          accessCount: updated.access.accessCount,
        },
      },
    });
  } catch (error) {
    console.error("revokeBookAccess:", error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.status
          ? error.message
          : "Unable to revoke book access.",
    });
  }
};

/* =========================================================
   EXTEND BOOK ACCESS

   Request body:
   {
     "hours": 24
   }
========================================================= */

const extendBookAccess = async (req, res) => {
  try {
    const hours = Number(req.body?.hours);

    if (
      !Number.isSafeInteger(hours) ||
      hours <= 0 ||
      hours > 720
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Hours must be a positive integer between 1 and 720.",
      });
    }

    const order = await Order.findOne(
      getOrderQuery(req.params.orderId)
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!validatePaidOrder(order)) {
      return res.status(400).json({
        success: false,
        message:
          "Only paid, non-revoked orders can have access extended.",
      });
    }

    if (!order.access?.tokenHash) {
      return res.status(400).json({
        success: false,
        message:
          "No access token exists. Send an access email first.",
      });
    }

    const now = new Date();

    const oldExpiry = order.access?.expiresAt
      ? new Date(order.access.expiresAt)
      : now;

    const base =
      oldExpiry.getTime() > now.getTime()
        ? oldExpiry
        : now;

    const newExpiry = new Date(
      base.getTime() + hours * 60 * 60 * 1000
    );

    const updated = await Order.findOneAndUpdate(
      {
        _id: order._id,
        "access.revoked": { $ne: true },
        "access.tokenHash": order.access.tokenHash,
        "access.expiresAt": order.access.expiresAt,
        orderStatus: order.orderStatus,
        "payment.status": order.payment.status,
      },
      {
        $set: {
          "access.expiresAt": newExpiry,
          updatedBy: getAdminIdentifier(req),
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({
        success: false,
        message:
          "Access was changed concurrently. Please reload and retry.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Book access extended by ${hours} hours.`,
      data: {
        orderId: updated.orderId,
        hoursAdded: hours,
        previousExpiry: oldExpiry,
        newExpiry: updated.access.expiresAt,
        revoked: updated.access.revoked,
      },
    });
  } catch (error) {
    console.error("extendBookAccess:", error);

    return res.status(error.status || 500).json({
      success: false,
      message:
        error.status
          ? error.message
          : "Unable to extend book access.",
    });
  }
};

/* =========================================================
   EXPORTS
========================================================= */

export {
  sendPendingPurchaseMail,
  resendBookAccessMail,
  revokeBookAccess,
  extendBookAccess,
};
