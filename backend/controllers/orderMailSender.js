// import mongoose from "mongoose";
// import Order from "../models/Order.js";
// import Book from "../models/Book.js";
// import sendMail from "../utils/MailSender.js";
// import { validateCouponForPayment } from "../controllers/couponController.js";
// import crypto from "crypto";

// const TARGET_TREK_URL = "https://www.targettrek.in";
// const ALL_BOOKS_URL = `${TARGET_TREK_URL}/books`;
// const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

// const escapeHtml = (value = "") => {
//   return String(value)
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;")
//     .replaceAll('"', "&quot;")
//     .replaceAll("'", "&#039;");
// };

// const getCurrencySymbol = (currency = "INR") => {
//   const normalized = String(currency).trim().toUpperCase();

//   if (normalized === "INR") return "₹";
//   if (normalized === "USD") return "$";
//   if (normalized === "EUR") return "€";
//   if (normalized === "GBP") return "£";

//   return `${normalized} `;
// };

// const formatAmount = (amount, currency = "INR") => {
//   const number = Number(amount || 0);
//   return `${getCurrencySymbol(currency)}${number.toFixed(2)}`;
// };

// const getOrderQuery = (orderId) => {
//   if (mongoose.Types.ObjectId.isValid(orderId)) {
//     return {
//       $or: [{ _id: orderId }, { orderId }],
//     };
//   }

//   return { orderId };
// };

// const buildTargetTrekUrl = (redirectUrl = "") => {
//   const cleanedPath = String(redirectUrl).trim().replace(/^\/+/, "");

//   return cleanedPath
//     ? `${TARGET_TREK_URL}/${cleanedPath}`
//     : TARGET_TREK_URL;
// };

// const getBookCoverUrl = (coverImage) => {
//   let url = "";

//   if (typeof coverImage === "string") {
//     url = coverImage.trim();
//   } else if (coverImage && typeof coverImage === "object") {
//     url = String(
//       coverImage.secure_url ||
//         coverImage.url ||
//         ""
//     ).trim();
//   }

//   return /^https?:\/\//i.test(url)
//     ? url
//     : "";
// };

// const renderDetailRow = (
//   label,
//   value,
//   options = {}
// ) => {
//   if (
//     value === undefined ||
//     value === null ||
//     String(value).trim() === ""
//   ) {
//     return "";
//   }

//   const {
//     strong = false,
//     accent = false,
//     strike = false,
//   } = options;

//   const safeLabel = escapeHtml(label);
//   const safeValue = escapeHtml(value);

//   return `
//     <tr>
//       <td
//         style="
//           padding: 10px 0;
//           color: #64748b;
//           font-size: 13px;
//           line-height: 1.5;
//           vertical-align: top;
//         "
//       >
//         ${safeLabel}
//       </td>

//       <td
//         align="right"
//         style="
//           padding: 10px 0;
//           color: ${accent ? "#2563eb" : "#0f172a"};
//           font-size: ${accent ? "17px" : "13px"};
//           line-height: 1.5;
//           font-weight: ${
//             strong || accent
//               ? "800"
//               : "600"
//           };
//           text-decoration: ${
//             strike
//               ? "line-through"
//               : "none"
//           };
//           vertical-align: top;
//         "
//       >
//         ${safeValue}
//       </td>
//     </tr>
//   `;
// };

// export const buildPendingPurchaseEmail =
//   ({
//     order,
//     book,
//     couponCode = "",
//     couponDescription = "",
//     couponValidation = null,
//   }) => {
//     const customerName =
//       order.customer?.name?.trim() ||
//       "there";

//     const customerEmail =
//       order.customer?.email?.trim() ||
//       "";

//     const bookTitle =
//       book.title ||
//       order.book?.title ||
//       "your ebook";

//     const currency =
//       book.currency ||
//       order.book?.currency ||
//       "INR";

//     const currentPrice =
//       Number(book.price) ||
//       0;

//     const currentMrp =
//       Number(book.mrp) ||
//       0;

//     const oldOrderPriceValue =
//       Number(order.book?.price);

//     const hasOldOrderPrice =
//       Number.isFinite(
//         oldOrderPriceValue
//       ) &&
//       oldOrderPriceValue > 0;

//     const oldOrderPrice =
//       hasOldOrderPrice
//         ? oldOrderPriceValue
//         : null;

//     const purchaseUrl =
//       buildTargetTrekUrl(
//         book.redirectUrl
//       );

//     const coverImageUrl =
//       getBookCoverUrl(
//         book.coverImage
//       );

//     const orderStatus =
//       String(
//         order.orderStatus ||
//           ""
//       ).trim();

//     const paymentStatus =
//       String(
//         order.payment?.status ||
//           ""
//       ).trim();

//     const statusForDisplay =
//       paymentStatus ||
//       orderStatus ||
//       "Pending";

//     const priceChanged =
//       hasOldOrderPrice &&
//       Math.abs(
//         oldOrderPrice -
//           currentPrice
//       ) > 0.001;

//     const hasCoupon =
//       Boolean(
//         couponCode &&
//           couponDescription
//       );

//     const couponDiscountAmount =
//       couponValidation
//         ?.discountAmount ??
//       couponValidation?.data
//         ?.discountAmount ??
//       null;

//     const couponFinalAmount =
//       couponValidation
//         ?.finalAmount ??
//       couponValidation?.data
//         ?.finalAmount ??
//       null;

//     const hasDiscountAmount =
//       couponDiscountAmount !==
//         null &&
//       Number.isFinite(
//         Number(
//           couponDiscountAmount
//         )
//       );

//     const hasFinalAmount =
//       couponFinalAmount !== null &&
//       Number.isFinite(
//         Number(
//           couponFinalAmount
//         )
//       );

//     const safeCustomerName =
//       escapeHtml(
//         customerName
//       );

//     const safeCustomerEmail =
//       escapeHtml(
//         customerEmail
//       );

//     const safeBookTitle =
//       escapeHtml(
//         bookTitle
//       );

//     const safeBookSubtitle =
//       escapeHtml(
//         book.subtitle ||
//           ""
//       );

//     const safeBookDescription =
//       escapeHtml(
//         book.shortDescription ||
//           book.description ||
//           ""
//       );

//     const safeCouponCode =
//       escapeHtml(
//         couponCode
//       );

//     const safeCouponDescription =
//       escapeHtml(
//         couponDescription
//       );

//     const safePurchaseUrl =
//       escapeHtml(
//         purchaseUrl
//       );

//     const safeCoverImageUrl =
//       escapeHtml(
//         coverImageUrl
//       );

//     const safeAllBooksUrl =
//       escapeHtml(
//         ALL_BOOKS_URL
//       );

//     const subject =
//       hasCoupon
//         ? `Complete your ${bookTitle} purchase — special coupon inside | Target Trek`
//         : `Complete your ${bookTitle} purchase | Target Trek`;

//     const metadataText = [
//       book.edition
//         ? `Edition: ${book.edition}`
//         : "",

//       book.level
//         ? `Level: ${book.level}`
//         : "",

//       book.language
//         ? `Language: ${book.language}`
//         : "",

//       book.format
//         ? `Format: ${book.format}`
//         : "",

//       Array.isArray(
//         book.categories
//       ) &&
//       book.categories.length
//         ? `Categories: ${book.categories.join(
//             ", "
//           )}`
//         : "",
//     ]
//       .filter(Boolean)
//       .join("\n");

//     const couponText =
//       hasCoupon
//         ? `
// SPECIAL OFFER

// Coupon Code:
// ${couponCode}

// Offer:
// ${couponDescription}

// ${
//   hasDiscountAmount
//     ? `Discount: ${formatAmount(
//         couponDiscountAmount,
//         currency
//       )}`
//     : ""
// }

// ${
//   hasFinalAmount
//     ? `Price after coupon: ${formatAmount(
//         couponFinalAmount,
//         currency
//       )}`
//     : ""
// }
// `.trim()
//         : "";

//     const priceChangedText =
//       priceChanged
//         ? `
// PRICE UPDATED

// Previous Price:
// ${formatAmount(
//   oldOrderPrice,
//   currency
// )}

// Current Price:
// ${formatAmount(
//   currentPrice,
//   currency
// )}
// `.trim()
//         : "";

//     const text = `
// Hi ${customerName},

// You started purchasing "${bookTitle}" on Target Trek, but the payment was not completed.

// PURCHASE DETAILS

// Order ID:
// ${order.orderId || order._id || ""}

// Customer Email:
// ${customerEmail}

// Payment Status:
// ${statusForDisplay}

// Book:
// ${bookTitle}

// ${
//   book.subtitle
//     ? `Subtitle: ${book.subtitle}`
//     : ""
// }

// ${metadataText}

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

// ${couponText}

// ${priceChangedText}

// Complete your purchase:
// ${purchaseUrl}

// If the button in the HTML email does not open, copy and paste the link above into your browser.

// Explore all available Target Trek books:
// ${ALL_BOOKS_URL}

// Browse interview-focused resources across System Design, Backend Engineering, GenAI, and other developer topics to help you prepare for your next interview.

// Price, availability, and offers can change. The final amount shown during checkout will apply.

// If you have already completed this purchase, please ignore this email.

// Need help?

// Email:
// ${SUPPORT_EMAIL}

// Website:
// ${TARGET_TREK_URL}

// Regards,
// Team Target Trek
//     `.trim();

//     const bookMetadataItems = [
//       book.edition
//         ? {
//             label: "Edition",
//             value:
//               book.edition,
//           }
//         : null,

//       book.level
//         ? {
//             label: "Level",
//             value:
//               book.level,
//           }
//         : null,

//       book.language
//         ? {
//             label: "Language",
//             value:
//               book.language,
//           }
//         : null,

//       book.format
//         ? {
//             label: "Format",
//             value:
//               book.format,
//           }
//         : null,

//       Array.isArray(
//         book.categories
//       ) &&
//       book.categories.length
//         ? {
//             label:
//               "Categories",

//             value:
//               book.categories.join(
//                 ", "
//               ),
//           }
//         : null,
//     ].filter(Boolean);

//     const bookMetadataHtml =
//       bookMetadataItems.length
//         ? `
//       <table
//         width="100%"
//         cellspacing="0"
//         cellpadding="0"
//         border="0"
//         style="
//           margin-top: 14px;
//         "
//       >
//         ${bookMetadataItems
//           .map(
//             (item) => `
//           <tr>
//             <td
//               style="
//                 padding: 4px 0;
//                 color: #64748b;
//                 font-size: 12px;
//                 line-height: 1.5;
//                 width: 90px;
//               "
//             >
//               ${escapeHtml(
//                 item.label
//               )}
//             </td>

//             <td
//               style="
//                 padding: 4px 0;
//                 color: #334155;
//                 font-size: 12px;
//                 line-height: 1.5;
//                 font-weight: 600;
//               "
//             >
//               ${escapeHtml(
//                 item.value
//               )}
//             </td>
//           </tr>
//         `
//           )
//           .join("")}
//       </table>
//     `
//         : "";

//     const coverImageSection =
//       coverImageUrl
//         ? `
//       <td
//         width="150"
//         valign="top"
//         style="
//           padding:
//             18px
//             20px
//             18px
//             18px;
//         "
//       >
//         <img
//           src="${safeCoverImageUrl}"
//           alt="${safeBookTitle} cover"
//           width="130"
//           style="
//             display: block;
//             width: 130px;
//             max-width: 130px;
//             height: auto;
//             border: 0;
//             border-radius: 10px;
//             box-shadow:
//               0 4px 14px
//               rgba(15, 23, 42, 0.12);
//           "
//         />
//       </td>
//     `
//         : "";

//     const couponSection =
//       hasCoupon
//         ? `
//       <div
//         style="
//           margin-top: 22px;
//           background-color: #f0fdf4;
//           border: 1px solid #bbf7d0;
//           border-radius: 14px;
//           padding: 18px;
//         "
//       >
//         <div
//           style="
//             font-size: 11px;
//             font-weight: 800;
//             letter-spacing: 0.08em;
//             text-transform: uppercase;
//             color: #15803d;
//           "
//         >
//           Special offer for you
//         </div>

//         <div
//           style="
//             margin-top: 9px;
//             font-size: 14px;
//             line-height: 1.7;
//             color: #166534;
//           "
//         >
//           ${safeCouponDescription}
//         </div>

//         <table
//           width="100%"
//           cellspacing="0"
//           cellpadding="0"
//           border="0"
//           style="
//             margin-top: 14px;
//             background-color: #ffffff;
//             border: 1px dashed #86efac;
//             border-radius: 10px;
//           "
//         >
//           <tr>
//             <td
//               style="
//                 padding:
//                   15px
//                   16px;
//               "
//             >
//               <div
//                 style="
//                   color: #64748b;
//                   font-size: 10px;
//                   font-weight: 700;
//                   text-transform: uppercase;
//                   letter-spacing: 0.08em;
//                 "
//               >
//                 Coupon code
//               </div>

//               <div
//                 style="
//                   margin-top: 5px;
//                   color: #166534;
//                   font-size: 22px;
//                   font-weight: 800;
//                   letter-spacing: 0.08em;
//                 "
//               >
//                 ${safeCouponCode}
//               </div>
//             </td>
//           </tr>
//         </table>

//         ${
//           hasDiscountAmount
//             ? `
//           <div
//             style="
//               margin-top: 13px;
//               color: #166534;
//               font-size: 13px;
//               line-height: 1.6;
//             "
//           >
//             You save:
//             <strong>
//               ${formatAmount(
//                 couponDiscountAmount,
//                 currency
//               )}
//             </strong>
//           </div>
//         `
//             : ""
//         }

//         ${
//           hasFinalAmount
//             ? `
//           <div
//             style="
//               margin-top: 5px;
//               color: #166534;
//               font-size: 13px;
//               line-height: 1.6;
//             "
//           >
//             Price after coupon:
//             <strong>
//               ${formatAmount(
//                 couponFinalAmount,
//                 currency
//               )}
//             </strong>
//           </div>
//         `
//             : ""
//         }

//         <div
//           style="
//             margin-top: 10px;
//             color: #4d7c0f;
//             font-size: 11px;
//             line-height: 1.6;
//           "
//         >
//           This coupon has been validated for this email address
//           and book. The final amount displayed during checkout
//           will apply.
//         </div>
//       </div>
//     `
//         : "";

//     const priceChangedSection =
//       priceChanged
//         ? `
//       <div
//         style="
//           margin-top: 18px;
//           padding: 15px 16px;
//           background-color: #fff7ed;
//           border: 1px solid #fed7aa;
//           border-radius: 12px;
//         "
//       >
//         <div
//           style="
//             color: #9a3412;
//             font-size: 13px;
//             line-height: 1.65;
//           "
//         >
//           <strong>
//             Price updated
//           </strong>

//           <br />

//           The current book price is different from the price
//           recorded on your earlier purchase attempt.

//           <br />
//           <br />

//           Previous price:

//           <strong>
//             ${formatAmount(
//               oldOrderPrice,
//               currency
//             )}
//           </strong>

//           <br />

//           Current price:

//           <strong>
//             ${formatAmount(
//               currentPrice,
//               currency
//             )}
//           </strong>
//         </div>
//       </div>
//     `
//         : "";

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

//   <meta
//     name="color-scheme"
//     content="light"
//   />

//   <meta
//     name="supported-color-schemes"
//     content="light"
//   />

//   <title>
//     Complete Your Purchase
//   </title>

// </head>

// <body
//   style="
//     margin: 0;
//     padding: 0;
//     background-color: #f4f7fb;
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
//       width: 100%;
//       background-color: #f4f7fb;
//     "
//   >

//     <tr>

//       <td
//         align="center"
//         style="
//           padding:
//             32px
//             14px;
//         "
//       >

//         <table
//           width="100%"
//           cellspacing="0"
//           cellpadding="0"
//           border="0"
//           style="
//             width: 100%;
//             max-width: 680px;
//             background-color: #ffffff;
//             border:
//               1px solid #e2e8f0;
//             border-radius: 18px;
//             overflow: hidden;
//             box-shadow:
//               0 8px 28px
//               rgba(15, 23, 42, 0.06);
//           "
//         >

//           <tr>

//             <td
//               style="
//                 padding:
//                   24px
//                   30px;
//                 background-color: #eff6ff;
//                 border-bottom:
//                   1px solid #dbeafe;
//               "
//             >

//               <div
//                 style="
//                   color: #2563eb;
//                   font-size: 24px;
//                   font-weight: 800;
//                   letter-spacing: -0.4px;
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
//                 Learn. Build. Grow.
//               </div>

//             </td>

//           </tr>

//           <tr>

//             <td
//               style="
//                 padding:
//                   32px
//                   30px
//                   30px;
//               "
//             >

//               <div
//                 style="
//                   display: inline-block;
//                   padding:
//                     7px
//                     12px;
//                   background-color: #fff7ed;
//                   color: #c2410c;
//                   border-radius: 999px;
//                   font-size: 11px;
//                   font-weight: 800;
//                   letter-spacing: 0.07em;
//                   text-transform: uppercase;
//                 "
//               >
//                 Purchase not completed
//               </div>

//               <h1
//                 style="
//                   margin:
//                     18px
//                     0
//                     10px;
//                   color: #0f172a;
//                   font-size: 27px;
//                   line-height: 1.35;
//                 "
//               >
//                 Hi ${safeCustomerName},
//               </h1>

//               <p
//                 style="
//                   margin: 0;
//                   color: #475569;
//                   font-size: 15px;
//                   line-height: 1.75;
//                 "
//               >
//                 You started purchasing

//                 <strong
//                   style="
//                     color: #0f172a;
//                   "
//                 >
//                   ${safeBookTitle}
//                 </strong>

//                 on Target Trek, but the payment was not completed.
//                 Your book page is still available, so you can
//                 continue whenever you're ready.
//               </p>

//               <table
//                 width="100%"
//                 cellspacing="0"
//                 cellpadding="0"
//                 border="0"
//                 style="
//                   margin-top: 24px;
//                   background-color: #f8fafc;
//                   border:
//                     1px solid #e2e8f0;
//                   border-radius: 14px;
//                 "
//               >

//                 <tr>

//                   ${coverImageSection}

//                   <td
//                     valign="top"
//                     style="
//                       padding: ${
//                         coverImageUrl
//                           ? "18px 18px 18px 0"
//                           : "20px"
//                       };
//                     "
//                   >

//                     <div
//                       style="
//                         color: #2563eb;
//                         font-size: 11px;
//                         font-weight: 800;
//                         letter-spacing: 0.08em;
//                         text-transform: uppercase;
//                       "
//                     >
//                       Your selected book
//                     </div>

//                     <div
//                       style="
//                         margin-top: 7px;
//                         color: #0f172a;
//                         font-size: 19px;
//                         font-weight: 800;
//                         line-height: 1.4;
//                       "
//                     >
//                       ${safeBookTitle}
//                     </div>

//                     ${
//                       safeBookSubtitle
//                         ? `
//                       <div
//                         style="
//                           margin-top: 5px;
//                           color: #475569;
//                           font-size: 13px;
//                           line-height: 1.6;
//                         "
//                       >
//                         ${safeBookSubtitle}
//                       </div>
//                     `
//                         : ""
//                     }

//                     ${
//                       safeBookDescription
//                         ? `
//                       <div
//                         style="
//                           margin-top: 10px;
//                           color: #64748b;
//                           font-size: 12px;
//                           line-height: 1.65;
//                         "
//                       >
//                         ${safeBookDescription}
//                       </div>
//                     `
//                         : ""
//                     }

//                     ${bookMetadataHtml}

//                   </td>

//                 </tr>

//               </table>

//               <div
//                 style="
//                   margin-top: 22px;
//                   padding:
//                     18px
//                     20px;
//                   background-color: #ffffff;
//                   border:
//                     1px solid #e2e8f0;
//                   border-radius: 14px;
//                 "
//               >

//                 <div
//                   style="
//                     color: #0f172a;
//                     font-size: 14px;
//                     font-weight: 800;
//                     margin-bottom: 7px;
//                   "
//                 >
//                   Purchase details
//                 </div>

//                 <table
//                   width="100%"
//                   cellspacing="0"
//                   cellpadding="0"
//                   border="0"
//                 >

//                   ${renderDetailRow(
//                     "Order ID",
//                     order.orderId ||
//                       order._id ||
//                       "",
//                     {
//                       strong: true,
//                     }
//                   )}

//                   ${renderDetailRow(
//                     "Customer Email",
//                     customerEmail
//                   )}

//                   ${renderDetailRow(
//                     "Payment Status",
//                     statusForDisplay,
//                     {
//                       strong: true,
//                     }
//                   )}

//                   ${
//                     currentMrp >
//                     currentPrice
//                       ? renderDetailRow(
//                           "MRP",
//                           formatAmount(
//                             currentMrp,
//                             currency
//                           ),
//                           {
//                             strike:
//                               true,
//                           }
//                         )
//                       : ""
//                   }

//                   ${renderDetailRow(
//                     "Current Price",
//                     formatAmount(
//                       currentPrice,
//                       currency
//                     ),
//                     {
//                       accent: true,
//                     }
//                   )}

//                   ${
//                     currentMrp >
//                     currentPrice
//                       ? renderDetailRow(
//                           "Current Saving",
//                           formatAmount(
//                             currentMrp -
//                               currentPrice,
//                             currency
//                           ),
//                           {
//                             strong:
//                               true,
//                           }
//                         )
//                       : ""
//                   }

//                 </table>

//               </div>

//               <div
//                 style="
//                   margin:
//                     8px
//                     2px
//                     0;
//                   color: #94a3b8;
//                   font-size: 11px;
//                   line-height: 1.55;
//                   text-align: right;
//                 "
//               >
//                 Price, availability, and offers can change.
//                 The final amount displayed during checkout
//                 will apply.
//               </div>

//               ${priceChangedSection}

//               ${couponSection}

//               <table
//                 width="100%"
//                 cellspacing="0"
//                 cellpadding="0"
//                 border="0"
//                 style="
//                   margin-top: 28px;
//                 "
//               >

//                 <tr>

//                   <td
//                     align="center"
//                   >

//                     <a
//                       href="${safePurchaseUrl}"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       style="
//                         display: inline-block;
//                         padding:
//                           15px
//                           32px;
//                         background-color: #2563eb;
//                         color: #ffffff;
//                         text-decoration: none;
//                         border-radius: 10px;
//                         font-size: 15px;
//                         font-weight: 800;
//                       "
//                     >
//                       Complete Your Purchase
//                     </a>

//                   </td>

//                 </tr>

//               </table>

//               <div
//                 style="
//                   margin-top: 20px;
//                   padding:
//                     15px
//                     16px;
//                   background-color: #f8fafc;
//                   border:
//                     1px solid #e2e8f0;
//                   border-radius: 12px;
//                 "
//               >

//                 <div
//                   style="
//                     color: #475569;
//                     font-size: 12px;
//                     font-weight: 800;
//                   "
//                 >
//                   Button not opening?
//                 </div>

//                 <div
//                   style="
//                     margin-top: 6px;
//                     color: #64748b;
//                     font-size: 12px;
//                     line-height: 1.65;
//                   "
//                 >
//                   Copy and paste this secure Target Trek link
//                   into your browser:
//                 </div>

//                 <div
//                   style="
//                     margin-top: 8px;
//                     word-break: break-all;
//                   "
//                 >

//                   <a
//                     href="${safePurchaseUrl}"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     style="
//                       color: #2563eb;
//                       font-size: 12px;
//                       text-decoration: underline;
//                     "
//                   >
//                     ${safePurchaseUrl}
//                   </a>

//                 </div>

//               </div>

//               <div
//                 style="
//                   margin-top: 24px;
//                   padding: 20px;
//                   background-color: #eff6ff;
//                   border:
//                     1px solid #dbeafe;
//                   border-radius: 14px;
//                 "
//               >

//                 <div
//                   style="
//                     color: #1d4ed8;
//                     font-size: 16px;
//                     font-weight: 800;
//                     line-height: 1.4;
//                   "
//                 >
//                   Preparing for your next developer interview?
//                 </div>

//                 <div
//                   style="
//                     margin-top: 8px;
//                     color: #475569;
//                     font-size: 13px;
//                     line-height: 1.75;
//                   "
//                 >
//                   Explore all available books on Target Trek
//                   for interview-focused learning across
//                   System Design, Backend Engineering, GenAI,
//                   and other developer topics.

//                   Pick the resources that match the skills
//                   you want to strengthen for your next
//                   interview.
//                 </div>

//                 <div
//                   style="
//                     margin-top: 16px;
//                   "
//                 >

//                   <a
//                     href="${safeAllBooksUrl}"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     style="
//                       display: inline-block;
//                       padding:
//                         11px
//                         18px;
//                       background-color: #ffffff;
//                       border:
//                         1px solid #93c5fd;
//                       color: #1d4ed8;
//                       text-decoration: none;
//                       border-radius: 9px;
//                       font-size: 13px;
//                       font-weight: 800;
//                     "
//                   >
//                     Explore All Books
//                   </a>

//                 </div>

//                 <div
//                   style="
//                     margin-top: 10px;
//                     word-break: break-all;
//                   "
//                 >

//                   <a
//                     href="${safeAllBooksUrl}"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     style="
//                       color: #2563eb;
//                       font-size: 11px;
//                       text-decoration: underline;
//                     "
//                   >
//                     ${safeAllBooksUrl}
//                   </a>

//                 </div>

//               </div>

//               <div
//                 style="
//                   margin-top: 22px;
//                   padding:
//                     15px
//                     16px;
//                   background-color: #f0f9ff;
//                   border:
//                     1px solid #bae6fd;
//                   border-radius: 12px;
//                   color: #475569;
//                   font-size: 13px;
//                   line-height: 1.7;
//                 "
//               >

//                 <strong
//                   style="
//                     color: #0369a1;
//                   "
//                 >
//                   Already completed your payment?
//                 </strong>

//                 <br />

//                 If you've already completed this purchase,
//                 you can safely ignore this email.

//               </div>

//               <p
//                 style="
//                   margin:
//                     24px
//                     0
//                     0;
//                   color: #64748b;
//                   font-size: 13px;
//                   line-height: 1.7;
//                 "
//               >

//                 Need help with your purchase?

//                 <br />

//                 Contact us at

//                 <a
//                   href="mailto:${SUPPORT_EMAIL}"
//                   style="
//                     color: #2563eb;
//                     text-decoration: none;
//                     font-weight: 700;
//                   "
//                 >
//                   ${SUPPORT_EMAIL}
//                 </a>.

//               </p>

//               <p
//                 style="
//                   margin:
//                     18px
//                     0
//                     0;
//                   color: #475569;
//                   font-size: 14px;
//                   line-height: 1.7;
//                 "
//               >

//                 Regards,

//                 <br />

//                 <strong
//                   style="
//                     color: #0f172a;
//                   "
//                 >
//                   Team Target Trek
//                 </strong>

//               </p>

//             </td>

//           </tr>

//           <tr>

//             <td
//               align="center"
//               style="
//                 padding:
//                   24px
//                   26px;
//                 background-color: #f8fafc;
//                 border-top:
//                   1px solid #e2e8f0;
//               "
//             >

//               <div
//                 style="
//                   color: #2563eb;
//                   font-size: 15px;
//                   font-weight: 800;
//                 "
//               >
//                 Target Trek
//               </div>

//               <div
//                 style="
//                   margin-top: 8px;
//                   color: #94a3b8;
//                   font-size: 11px;
//                   line-height: 1.65;
//                 "
//               >
//                 This email was sent because a purchase
//                 was initiated using ${safeCustomerEmail}.
//               </div>

//               <div
//                 style="
//                   margin-top: 11px;
//                   font-size: 11px;
//                 "
//               >

//                 <a
//                   href="${TARGET_TREK_URL}"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   style="
//                     color: #2563eb;
//                     text-decoration: none;
//                   "
//                 >
//                   www.targettrek.in
//                 </a>

//                 <span
//                   style="
//                     margin:
//                       0
//                       7px;
//                     color: #cbd5e1;
//                   "
//                 >
//                   •
//                 </span>

//                 <a
//                   href="${ALL_BOOKS_URL}"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   style="
//                     color: #2563eb;
//                     text-decoration: none;
//                   "
//                 >
//                   All Books
//                 </a>

//                 <span
//                   style="
//                     margin:
//                       0
//                       7px;
//                     color: #cbd5e1;
//                   "
//                 >
//                   •
//                 </span>

//                 <a
//                   href="mailto:${SUPPORT_EMAIL}"
//                   style="
//                     color: #2563eb;
//                     text-decoration: none;
//                   "
//                 >
//                   Support
//                 </a>

//               </div>

//               <div
//                 style="
//                   margin-top: 10px;
//                   color: #94a3b8;
//                   font-size: 11px;
//                 "
//               >
//                 © ${new Date().getFullYear()}
//                 Target Trek.
//                 All rights reserved.
//               </div>

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

// const sendPendingPurchaseMail =
//   async (req, res) => {
//     try {
//       const {
//         orderId,
//       } = req.params;

//       const rawCouponCode =
//         typeof req.body
//           ?.couponCode ===
//         "string"
//           ? req.body.couponCode.trim()
//           : "";

//       const rawCouponDescription =
//         typeof req.body
//           ?.couponDescription ===
//         "string"
//           ? req.body.couponDescription.trim()
//           : "";

//       if (!orderId) {
//         return res
//           .status(400)
//           .json({
//             success: false,
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
//             success: false,
//             message:
//               "Coupon code and coupon description must both be provided, or both must be empty.",
//           });
//       }

//       const order =
//         await Order.findOne(
//           getOrderQuery(
//             orderId
//           )
//         );

//       if (!order) {
//         return res
//           .status(404)
//           .json({
//             success: false,
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
//             ""
//         )
//           .trim()
//           .toLowerCase();

//       const paymentStatus =
//         String(
//           order.payment
//             ?.status ||
//             ""
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
//             success: false,
//             message:
//               "Reminder email can only be sent for pending, failed, or bounced orders.",
//           });
//       }

//       const customerEmail =
//         order.customer?.email
//           ?.trim()
//           .toLowerCase();

//       if (!customerEmail) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Customer email is not available.",
//           });
//       }

//       const book =
//         await Book.findById(
//           order.bookId
//         ).select(`
//           title
//           subtitle
//           description
//           shortDescription
//           edition
//           categories
//           level
//           language
//           format
//           price
//           mrp
//           currency
//           paymentUrl
//           redirectUrl
//           coverImage
//           isActive
//           isPublished
//         `);

//       if (!book) {
//         return res
//           .status(404)
//           .json({
//             success: false,
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
//             success: false,
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
//             success: false,
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
//             success: false,
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
//                 400
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
//               .trim()
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

//         await Order.updateOne(
//           {
//             _id:
//               order._id,
//           },
//           {
//             $set: {
//               "pendingMail.lastStatus":
//                 "FAILED",

//               "pendingMail.lastError":
//                 mailError
//                   ?.message ||
//                 "Failed to send email",
//             },
//           }
//         );

//         return res
//           .status(500)
//           .json({
//             success: false,

//             message:
//               "Failed to send pending purchase email.",
//           });
//       }

//       const now =
//         new Date();

//       const adminIdentifier =
//         req.user?.email ||
//         req.admin?.email ||
//         req.user?._id ||
//         req.admin?._id ||
//         "ADMIN";

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
//               String(
//                 adminIdentifier
//               ),

//             "pendingMail.lastStatus":
//               "SENT",

//             "pendingMail.lastError":
//               null,

//             updatedBy:
//               String(
//                 adminIdentifier
//               ),
//           },
//         };

//       if (
//         !order.pendingMail
//           ?.firstSentAt
//       ) {
//         pendingMailUpdate.$set[
//           "pendingMail.firstSentAt"
//         ] = now;
//       }

//       const updatedOrder =
//         await Order.findByIdAndUpdate(
//           order._id,
//           pendingMailUpdate,
//           {
//             new: true,
//           }
//         );

//       return res
//         .status(200)
//         .json({
//           success: true,

//           message:
//             "Pending purchase email sent successfully.",

//           data: {
//             orderId:
//               updatedOrder.orderId,

//             mongoOrderId:
//               updatedOrder._id,

//             orderStatus:
//               updatedOrder.orderStatus,

//             paymentStatus:
//               updatedOrder.payment
//                 ?.status,

//             customer: {
//               name:
//                 updatedOrder.customer
//                   ?.name,

//               email:
//                 updatedOrder.customer
//                   ?.email,
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

//               categories:
//                 book.categories ||
//                 [],

//               level:
//                 book.level ||
//                 null,

//               language:
//                 book.language ||
//                 null,

//               format:
//                 book.format ||
//                 null,

//               currentPrice:
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

//             email: {
//               subject,

//               purchaseUrl,

//               allBooksUrl:
//                 ALL_BOOKS_URL,

//               coverImage:
//                 getBookCoverUrl(
//                   book.coverImage
//                 ) ||
//                 null,
//             },

//             pendingMail: {
//               sentCount:
//                 updatedOrder
//                   .pendingMail
//                   ?.sentCount ||
//                 0,

//               firstSentAt:
//                 updatedOrder
//                   .pendingMail
//                   ?.firstSentAt,

//               lastSentAt:
//                 updatedOrder
//                   .pendingMail
//                   ?.lastSentAt,

//               lastSentBy:
//                 updatedOrder
//                   .pendingMail
//                   ?.lastSentBy,

//               lastStatus:
//                 updatedOrder
//                   .pendingMail
//                   ?.lastStatus,

//               lastError:
//                 updatedOrder
//                   .pendingMail
//                   ?.lastError,
//             },
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
//           success: false,

//           message:
//             "Something went wrong while sending the pending purchase email.",
//         });
//     }
//   };






// const ACCESS_DURATION = 24 * 60 * 60 * 1000;


// const formatDate = (date) => {
//   if (!date) {
//     return "N/A";
//   }

//   const parsedDate = new Date(date);

//   if (Number.isNaN(parsedDate.getTime())) {
//     return "N/A";
//   }

//   return parsedDate.toLocaleString("en-IN", {
//     timeZone: "Asia/Kolkata",
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });
// };


// const getPaymentTransactionId = (order) => {
//   return (
//     order.payment?.mihpayid ||
//     order.payment?.transactionId ||
//     order.payment?.transaction_id ||
//     order.payment?.paymentId ||
//     order.payment?.payment_id ||
//     order.payment?.txnid ||
//     order.txnid ||
//     "N/A"
//   );
// };

// const getPaymentMethod = (order) => {
//   return (
//     order.payment?.mode ||
//     order.payment?.method ||
//     order.payment?.paymentMethod ||
//     order.paymentMethod ||
//     "Online Payment"
//   );
// };

// const getPaidAmount = (
//   order,
//   book
// ) => {
//   const possibleAmounts = [
//     order.payment?.amount,
//     order.finalAmount,
//     order.totalAmount,
//     order.amount,
//     order.book?.price,
//     book?.price,
//   ];

//   for (
//     const amount of possibleAmounts
//   ) {
//     const parsedAmount =
//       Number(amount);

//     if (
//       Number.isFinite(
//         parsedAmount
//       ) &&
//       parsedAmount >= 0
//     ) {
//       return parsedAmount;
//     }
//   }

//   return 0;
// };

// const getMrp = (
//   order,
//   book
// ) => {
//   const possibleMrps = [
//     order.book?.mrp,
//     order.mrp,
//     book?.mrp,
//   ];

//   for (
//     const mrp of possibleMrps
//   ) {
//     const parsedMrp =
//       Number(mrp);

//     if (
//       Number.isFinite(
//         parsedMrp
//       ) &&
//       parsedMrp > 0
//     ) {
//       return parsedMrp;
//     }
//   }

//   return 0;
// };

// const getCurrency = (
//   order,
//   book
// ) => {
//   return (
//     order.payment?.currency ||
//     order.book?.currency ||
//     order.currency ||
//     book?.currency ||
//     "INR"
//   );
// };

// const getCouponCode = (
//   order
// ) => {
//   return (
//     order.coupon?.code ||
//     order.coupon?.couponCode ||
//     order.couponCode ||
//     ""
//   );
// };

// const getDiscountAmount = (
//   order
// ) => {
//   const possibleDiscounts = [
//     order.coupon?.discountAmount,
//     order.discountAmount,
//     order.pricing?.discountAmount,
//   ];

//   for (
//     const discount of possibleDiscounts
//   ) {
//     const parsedDiscount =
//       Number(discount);

//     if (
//       Number.isFinite(
//         parsedDiscount
//       ) &&
//       parsedDiscount > 0
//     ) {
//       return parsedDiscount;
//     }
//   }

//   return 0;
// };

// const getPurchaseDate = (
//   order
// ) => {
//   return (
//     order.payment?.paidAt ||
//     order.payment?.completedAt ||
//     order.paidAt ||
//     order.updatedAt ||
//     order.createdAt
//   );
// };

// const generateAccessToken = () => {
//   return crypto
//     .randomBytes(32)
//     .toString("hex");
// };

// const hashAccessToken = (
//   token
// ) => {
//   return crypto
//     .createHash("sha256")
//     .update(token)
//     .digest("hex");
// };

// const buildAccessUrl = (
//   rawToken,
//   orderId
// ) => {
//   return (
//     `${TARGET_TREK_URL}/payment/success` +
//     `?token=${encodeURIComponent(rawToken)}` +
//     `&order=${encodeURIComponent(orderId)}`
//   );
// };

// const buildBookAccessEmail = ({
//   order,
//   book,
//   accessUrl,
//   accessExpiresAt,
// }) => {
//   const customerName =
//     order.customer?.name
//       ?.trim() ||
//     "there";

//   const customerEmail =
//     order.customer?.email
//       ?.trim() ||
//     "";

//   const bookTitle =
//     book.title ||
//     order.book?.title ||
//     "your ebook";

//   const bookSubtitle =
//     book.subtitle ||
//     order.book?.subtitle ||
//     "";

//   const currency =
//     getCurrency(
//       order,
//       book
//     );

//   const paidAmount =
//     getPaidAmount(
//       order,
//       book
//     );

//   const mrp =
//     getMrp(
//       order,
//       book
//     );

//   const couponCode =
//     getCouponCode(
//       order
//     );

//   const discountAmount =
//     getDiscountAmount(
//       order
//     );

//   const transactionId =
//     getPaymentTransactionId(
//       order
//     );

//   const paymentMethod =
//     getPaymentMethod(
//       order
//     );

//   const purchaseDate =
//     getPurchaseDate(
//       order
//     );

//   const orderStatus =
//     String(
//       order.orderStatus ||
//         "PAID"
//     ).toUpperCase();

//   const paymentStatus =
//     String(
//       order.payment?.status ||
//         "SUCCESS"
//     ).toUpperCase();

//   const coverImageUrl =
//     getBookCoverUrl(
//       book.coverImage
//     );

//   const safeCustomerName =
//     escapeHtml(
//       customerName
//     );

//   const safeCustomerEmail =
//     escapeHtml(
//       customerEmail
//     );

//   const safeBookTitle =
//     escapeHtml(
//       bookTitle
//     );

//   const safeBookSubtitle =
//     escapeHtml(
//       bookSubtitle
//     );

//   const safeTransactionId =
//     escapeHtml(
//       transactionId
//     );

//   const safePaymentMethod =
//     escapeHtml(
//       paymentMethod
//     );

//   const safeOrderStatus =
//     escapeHtml(
//       orderStatus
//     );

//   const safePaymentStatus =
//     escapeHtml(
//       paymentStatus
//     );

//   const safeCouponCode =
//     escapeHtml(
//       couponCode
//     );

//   const safeAccessUrl =
//     escapeHtml(
//       accessUrl
//     );

//   const safeCoverImageUrl =
//     escapeHtml(
//       coverImageUrl
//     );

//   const safeAllBooksUrl =
//     escapeHtml(
//       ALL_BOOKS_URL
//     );

//   const subject =
//     `Your ${bookTitle} access link | Target Trek`;

//   const text = `
// Hi ${customerName},

// Thanks for purchasing "${bookTitle}" from Target Trek.

// Your new book access link is ready.

// ACCESS YOUR BOOK

// ${accessUrl}

// If the button in the email does not work, copy and paste the link above into your browser.

// BOOK DETAILS

// Book:
// ${bookTitle}

// ${bookSubtitle ? `Subtitle:\n${bookSubtitle}\n` : ""}

// Order ID:
// ${order.orderId || order._id}

// Customer Email:
// ${customerEmail}

// Order Status:
// ${orderStatus}

// Payment Status:
// ${paymentStatus}

// Transaction ID:
// ${transactionId}

// Payment Method:
// ${paymentMethod}

// ${mrp > paidAmount ? `MRP:\n${formatAmount(mrp, currency)}\n` : ""}

// ${couponCode ? `Coupon Used:\n${couponCode}\n` : ""}

// ${
//   discountAmount > 0
//     ? `Discount:\n${formatAmount(
//         discountAmount,
//         currency
//       )}\n`
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

// This access link is valid until:
// ${formatDate(
//   accessExpiresAt
// )}

// Please do not share your access link with anyone.

// Facing any issue while accessing your book?

// Contact:
// ${SUPPORT_EMAIL}

// Explore more Target Trek books:
// ${ALL_BOOKS_URL}

// Regards,
// Team Target Trek
//   `.trim();

//   const html = `
// <!DOCTYPE html>

// <html lang="en">

// <head>

//   <meta charset="UTF-8" />

//   <meta
//     name="viewport"
//     content="width=device-width, initial-scale=1.0"
//   />

//   <meta
//     name="color-scheme"
//     content="light"
//   />

//   <meta
//     name="supported-color-schemes"
//     content="light"
//   />

//   <title>
//     Your Book Access
//   </title>

// </head>

// <body
//   style="
//     margin: 0;
//     padding: 0;
//     background-color: #f4f7fb;
//     font-family: Arial, Helvetica, sans-serif;
//     color: #0f172a;
//   "
// >

//   <table
//     width="100%"
//     cellspacing="0"
//     cellpadding="0"
//     border="0"
//     style="
//       width: 100%;
//       background-color: #f4f7fb;
//     "
//   >

//     <tr>

//       <td
//         align="center"
//         style="
//           padding: 32px 14px;
//         "
//       >

//         <table
//           width="100%"
//           cellspacing="0"
//           cellpadding="0"
//           border="0"
//           style="
//             width: 100%;
//             max-width: 680px;
//             background-color: #ffffff;
//             border: 1px solid #e2e8f0;
//             border-radius: 18px;
//             overflow: hidden;
//             box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
//           "
//         >

//           <!-- HEADER -->

//           <tr>

//             <td
//               style="
//                 padding: 24px 30px;
//                 background-color: #eff6ff;
//                 border-bottom: 1px solid #dbeafe;
//               "
//             >

//               <div
//                 style="
//                   color: #2563eb;
//                   font-size: 24px;
//                   font-weight: 800;
//                   letter-spacing: -0.4px;
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
//                 Learn. Build. Grow.
//               </div>

//             </td>

//           </tr>


//           <!-- BODY -->

//           <tr>

//             <td
//               style="
//                 padding: 32px 30px 30px;
//               "
//             >

//               <div
//                 style="
//                   display: inline-block;
//                   padding: 7px 12px;
//                   background-color: #ecfdf5;
//                   color: #15803d;
//                   border-radius: 999px;
//                   font-size: 11px;
//                   font-weight: 800;
//                   letter-spacing: 0.07em;
//                   text-transform: uppercase;
//                 "
//               >
//                 Payment successful
//               </div>


//               <h1
//                 style="
//                   margin: 18px 0 10px;
//                   color: #0f172a;
//                   font-size: 27px;
//                   line-height: 1.35;
//                 "
//               >
//                 Hi ${safeCustomerName},
//               </h1>


//               <p
//                 style="
//                   margin: 0;
//                   color: #475569;
//                   font-size: 15px;
//                   line-height: 1.75;
//                 "
//               >
//                 Thanks for purchasing

//                 <strong
//                   style="
//                     color: #0f172a;
//                   "
//                 >
//                   ${safeBookTitle}
//                 </strong>

//                 from Target Trek.
//               </p>


//               <p
//                 style="
//                   margin: 12px 0 0;
//                   color: #475569;
//                   font-size: 15px;
//                   line-height: 1.75;
//                 "
//               >
//                 We have generated a fresh secure access link
//                 for your purchased book. Click the button below
//                 to continue to your book.
//               </p>


//               <!-- BOOK CARD -->

//               <table
//                 width="100%"
//                 cellspacing="0"
//                 cellpadding="0"
//                 border="0"
//                 style="
//                   margin-top: 24px;
//                   background-color: #f8fafc;
//                   border: 1px solid #e2e8f0;
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
//                       src="${safeCoverImageUrl}"
//                       alt="${safeBookTitle}"
//                       width="120"
//                       style="
//                         display: block;
//                         width: 120px;
//                         max-width: 120px;
//                         height: auto;
//                         border: 0;
//                         border-radius: 9px;
//                         box-shadow: 0 4px 14px rgba(15,23,42,0.10);
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
//                         color: #2563eb;
//                         font-size: 11px;
//                         font-weight: 800;
//                         text-transform: uppercase;
//                         letter-spacing: 0.08em;
//                       "
//                     >
//                       Your purchased book
//                     </div>


//                     <div
//                       style="
//                         margin-top: 7px;
//                         color: #0f172a;
//                         font-size: 19px;
//                         font-weight: 800;
//                         line-height: 1.4;
//                       "
//                     >
//                       ${safeBookTitle}
//                     </div>


//                     ${
//                       safeBookSubtitle
//                         ? `
//                     <div
//                       style="
//                         margin-top: 6px;
//                         color: #64748b;
//                         font-size: 13px;
//                         line-height: 1.6;
//                       "
//                     >
//                       ${safeBookSubtitle}
//                     </div>
//                     `
//                         : ""
//                     }


//                     ${
//                       book.edition
//                         ? `
//                     <div
//                       style="
//                         margin-top: 12px;
//                         color: #64748b;
//                         font-size: 12px;
//                       "
//                     >
//                       Edition:
//                       <strong style="color:#334155;">
//                         ${escapeHtml(book.edition)}
//                       </strong>
//                     </div>
//                     `
//                         : ""
//                     }


//                     ${
//                       book.format
//                         ? `
//                     <div
//                       style="
//                         margin-top: 5px;
//                         color: #64748b;
//                         font-size: 12px;
//                       "
//                     >
//                       Format:
//                       <strong style="color:#334155;">
//                         ${escapeHtml(book.format)}
//                       </strong>
//                     </div>
//                     `
//                         : ""
//                     }

//                   </td>

//                 </tr>

//               </table>


//               <!-- ACCESS BUTTON -->

//               <table
//                 width="100%"
//                 cellspacing="0"
//                 cellpadding="0"
//                 border="0"
//                 style="
//                   margin-top: 28px;
//                 "
//               >

//                 <tr>

//                   <td
//                     align="center"
//                   >

//                     <a
//                       href="${safeAccessUrl}"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       style="
//                         display: inline-block;
//                         padding: 15px 34px;
//                         background-color: #2563eb;
//                         color: #ffffff;
//                         text-decoration: none;
//                         border-radius: 10px;
//                         font-size: 15px;
//                         font-weight: 800;
//                       "
//                     >
//                       Access Your Book
//                     </a>

//                   </td>

//                 </tr>

//               </table>


//               <!-- RAW LINK -->

//               <div
//                 style="
//                   margin-top: 22px;
//                   padding: 16px;
//                   background-color: #f8fafc;
//                   border: 1px solid #e2e8f0;
//                   border-radius: 12px;
//                 "
//               >

//                 <div
//                   style="
//                     color: #475569;
//                     font-size: 12px;
//                     font-weight: 800;
//                   "
//                 >
//                   Button not opening?
//                 </div>


//                 <div
//                   style="
//                     margin-top: 6px;
//                     color: #64748b;
//                     font-size: 12px;
//                     line-height: 1.65;
//                   "
//                 >
//                   Copy and paste this secure link into your browser:
//                 </div>


//                 <div
//                   style="
//                     margin-top: 8px;
//                     word-break: break-all;
//                   "
//                 >

//                   <a
//                     href="${safeAccessUrl}"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     style="
//                       color: #2563eb;
//                       font-size: 12px;
//                       line-height: 1.7;
//                       text-decoration: underline;
//                     "
//                   >
//                     ${safeAccessUrl}
//                   </a>

//                 </div>

//               </div>


//               <!-- PAYMENT DETAILS -->

//               <div
//                 style="
//                   margin-top: 26px;
//                   background-color: #ffffff;
//                   border: 1px solid #e2e8f0;
//                   border-radius: 14px;
//                   padding: 20px;
//                 "
//               >

//                 <div
//                   style="
//                     color: #0f172a;
//                     font-size: 16px;
//                     font-weight: 800;
//                     margin-bottom: 12px;
//                   "
//                 >
//                   Payment details
//                 </div>


//                 <table
//                   width="100%"
//                   cellspacing="0"
//                   cellpadding="0"
//                   border="0"
//                 >

//                   <tr>

//                     <td
//                       style="
//                         padding: 10px 0;
//                         color: #64748b;
//                         font-size: 13px;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       Order ID
//                     </td>

//                     <td
//                       align="right"
//                       style="
//                         padding: 10px 0;
//                         color: #0f172a;
//                         font-size: 13px;
//                         font-weight: 700;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       ${escapeHtml(
//                         order.orderId ||
//                           order._id
//                       )}
//                     </td>

//                   </tr>


//                   <tr>

//                     <td
//                       style="
//                         padding: 10px 0;
//                         color: #64748b;
//                         font-size: 13px;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       Customer Email
//                     </td>

//                     <td
//                       align="right"
//                       style="
//                         padding: 10px 0;
//                         color: #0f172a;
//                         font-size: 13px;
//                         font-weight: 600;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       ${safeCustomerEmail}
//                     </td>

//                   </tr>


//                   <tr>

//                     <td
//                       style="
//                         padding: 10px 0;
//                         color: #64748b;
//                         font-size: 13px;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       Order Status
//                     </td>

//                     <td
//                       align="right"
//                       style="
//                         padding: 10px 0;
//                         color: #15803d;
//                         font-size: 13px;
//                         font-weight: 800;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       ${safeOrderStatus}
//                     </td>

//                   </tr>


//                   <tr>

//                     <td
//                       style="
//                         padding: 10px 0;
//                         color: #64748b;
//                         font-size: 13px;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       Payment Status
//                     </td>

//                     <td
//                       align="right"
//                       style="
//                         padding: 10px 0;
//                         color: #15803d;
//                         font-size: 13px;
//                         font-weight: 800;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       ${safePaymentStatus}
//                     </td>

//                   </tr>


//                   <tr>

//                     <td
//                       style="
//                         padding: 10px 0;
//                         color: #64748b;
//                         font-size: 13px;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       Transaction ID
//                     </td>

//                     <td
//                       align="right"
//                       style="
//                         padding: 10px 0;
//                         color: #0f172a;
//                         font-size: 13px;
//                         font-weight: 600;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       ${safeTransactionId}
//                     </td>

//                   </tr>


//                   <tr>

//                     <td
//                       style="
//                         padding: 10px 0;
//                         color: #64748b;
//                         font-size: 13px;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       Payment Method
//                     </td>

//                     <td
//                       align="right"
//                       style="
//                         padding: 10px 0;
//                         color: #0f172a;
//                         font-size: 13px;
//                         font-weight: 600;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       ${safePaymentMethod}
//                     </td>

//                   </tr>


//                   ${
//                     mrp > paidAmount
//                       ? `
//                   <tr>

//                     <td
//                       style="
//                         padding: 10px 0;
//                         color: #64748b;
//                         font-size: 13px;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       MRP
//                     </td>

//                     <td
//                       align="right"
//                       style="
//                         padding: 10px 0;
//                         color: #64748b;
//                         font-size: 13px;
//                         font-weight: 600;
//                         text-decoration: line-through;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       ${formatAmount(
//                         mrp,
//                         currency
//                       )}
//                     </td>

//                   </tr>
//                   `
//                       : ""
//                   }


//                   ${
//                     couponCode
//                       ? `
//                   <tr>

//                     <td
//                       style="
//                         padding: 10px 0;
//                         color: #64748b;
//                         font-size: 13px;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       Coupon Used
//                     </td>

//                     <td
//                       align="right"
//                       style="
//                         padding: 10px 0;
//                         color: #2563eb;
//                         font-size: 13px;
//                         font-weight: 800;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       ${safeCouponCode}
//                     </td>

//                   </tr>
//                   `
//                       : ""
//                   }


//                   ${
//                     discountAmount > 0
//                       ? `
//                   <tr>

//                     <td
//                       style="
//                         padding: 10px 0;
//                         color: #64748b;
//                         font-size: 13px;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       Discount
//                     </td>

//                     <td
//                       align="right"
//                       style="
//                         padding: 10px 0;
//                         color: #15803d;
//                         font-size: 13px;
//                         font-weight: 700;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       -${formatAmount(
//                         discountAmount,
//                         currency
//                       )}
//                     </td>

//                   </tr>
//                   `
//                       : ""
//                   }


//                   <tr>

//                     <td
//                       style="
//                         padding: 12px 0;
//                         color: #0f172a;
//                         font-size: 14px;
//                         font-weight: 800;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       Amount Paid
//                     </td>

//                     <td
//                       align="right"
//                       style="
//                         padding: 12px 0;
//                         color: #2563eb;
//                         font-size: 17px;
//                         font-weight: 800;
//                         border-bottom: 1px solid #f1f5f9;
//                       "
//                     >
//                       ${formatAmount(
//                         paidAmount,
//                         currency
//                       )}
//                     </td>

//                   </tr>


//                   <tr>

//                     <td
//                       style="
//                         padding: 10px 0;
//                         color: #64748b;
//                         font-size: 13px;
//                       "
//                     >
//                       Purchase Date
//                     </td>

//                     <td
//                       align="right"
//                       style="
//                         padding: 10px 0;
//                         color: #0f172a;
//                         font-size: 13px;
//                         font-weight: 600;
//                       "
//                     >
//                       ${formatDate(
//                         purchaseDate
//                       )}
//                     </td>

//                   </tr>

//                 </table>

//               </div>


//               <!-- LINK EXPIRY -->

//               <div
//                 style="
//                   margin-top: 22px;
//                   padding: 16px;
//                   background-color: #fff7ed;
//                   border: 1px solid #fed7aa;
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

//                 This newly generated access link is valid until

//                 <strong>
//                   ${formatDate(
//                     accessExpiresAt
//                   )}
//                 </strong>.

//                 Please do not share this link publicly.

//               </div>


//               <!-- SUPPORT -->

//               <div
//                 style="
//                   margin-top: 24px;
//                   padding: 18px;
//                   background-color: #eff6ff;
//                   border: 1px solid #dbeafe;
//                   border-radius: 12px;
//                 "
//               >

//                 <div
//                   style="
//                     color: #1d4ed8;
//                     font-size: 14px;
//                     font-weight: 800;
//                   "
//                 >
//                   Facing any issue?
//                 </div>


//                 <div
//                   style="
//                     margin-top: 7px;
//                     color: #475569;
//                     font-size: 13px;
//                     line-height: 1.7;
//                   "
//                 >
//                   If you are unable to access your purchased book,
//                   contact our support team at

//                   <a
//                     href="mailto:${SUPPORT_EMAIL}"
//                     style="
//                       color: #2563eb;
//                       text-decoration: none;
//                       font-weight: 700;
//                     "
//                   >
//                     ${SUPPORT_EMAIL}
//                   </a>.

//                 </div>

//               </div>


//               <!-- EXPLORE -->

//               <div
//                 style="
//                   margin-top: 22px;
//                   text-align: center;
//                 "
//               >

//                 <a
//                   href="${safeAllBooksUrl}"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   style="
//                     color: #2563eb;
//                     font-size: 13px;
//                     font-weight: 700;
//                     text-decoration: none;
//                   "
//                 >
//                   Explore more Target Trek books →
//                 </a>

//               </div>


//               <p
//                 style="
//                   margin: 26px 0 0;
//                   color: #475569;
//                   font-size: 14px;
//                   line-height: 1.7;
//                 "
//               >
//                 Regards,
//                 <br />

//                 <strong
//                   style="
//                     color: #0f172a;
//                   "
//                 >
//                   Team Target Trek
//                 </strong>
//               </p>

//             </td>

//           </tr>


//           <!-- FOOTER -->

//           <tr>

//             <td
//               align="center"
//               style="
//                 padding: 22px 26px;
//                 background-color: #f8fafc;
//                 border-top: 1px solid #e2e8f0;
//               "
//             >

//               <div
//                 style="
//                   color: #64748b;
//                   font-size: 11px;
//                   line-height: 1.7;
//                 "
//               >
//                 © ${new Date().getFullYear()} Target Trek.
//                 All rights reserved.
//               </div>


//               <div
//                 style="
//                   margin-top: 6px;
//                   color: #94a3b8;
//                   font-size: 10px;
//                 "
//               >
//                 This email was sent because a book was purchased
//                 using ${safeCustomerEmail}.
//               </div>

//             </td>

//           </tr>

//         </table>

//       </td>

//     </tr>

//   </table>

// </body>

// </html>
//   `.trim();

//   return {
//     subject,
//     text,
//     html,
//   };
// };

// const resendBookAccessMail =
//   async (req, res) => {
//     try {
//       const {
//         orderId,
//       } = req.params;

//       if (!orderId) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Order ID is required.",
//           });
//       }

//       /*
//        * Find order using either MongoDB _id
//        * or your custom orderId.
//        */
//       const order =
//         await Order.findOne(
//           getOrderQuery(
//             orderId
//           )
//         );

//       if (!order) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Order not found.",
//           });
//       }


//       /*
//        * Validate successful order.
//        *
//        * Your existing successful payment flow uses:
//        *
//        * orderStatus = PAID
//        * payment.status = SUCCESS
//        */
//       const orderStatus =
//         String(
//           order.orderStatus ||
//             ""
//         )
//           .trim()
//           .toLowerCase();

//       const paymentStatus =
//         String(
//           order.payment?.status ||
//             ""
//         )
//           .trim()
//           .toLowerCase();


//       if (
//         orderStatus !== "paid" ||
//         paymentStatus !== "success"
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Book access email can only be sent for a successfully paid order.",
//           });
//       }


//       /*
//        * Keep the same payment verification
//        * checks used by your purchased-book
//        * access API.
//        */
//       if (
//         order.verification
//           ?.callbackHashVerified !==
//           true ||
//         order.verification
//           ?.payuVerified !==
//           true ||
//         order.verification
//           ?.amountVerified !==
//           true
//       ) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Payment verification is incomplete for this order.",
//           });
//       }


//       const customerEmail =
//         order.customer?.email
//           ?.trim()
//           .toLowerCase();

//       if (!customerEmail) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Customer email is not available.",
//           });
//       }


//       /*
//        * Fetch the purchased book.
//        */
//       const book =
//         await Book.findById(
//           order.bookId
//         ).select(`
//           title
//           subtitle
//           description
//           shortDescription
//           edition
//           categories
//           level
//           language
//           format
//           price
//           mrp
//           currency
//           redirectUrl
//           coverImage
//           isActive
//           isPublished
//         `);


//       if (!book) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Book associated with this order no longer exists.",
//           });
//       }


//       if (!book.isActive) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "This book is currently inactive. Access email was not sent.",
//           });
//       }


//       if (!book.isPublished) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "This book is currently unpublished. Access email was not sent.",
//           });
//       }


//       /*
//        * Store previous access information
//        * temporarily.
//        *
//        * If email sending fails we restore
//        * the previous token so the customer
//        * does not lose an existing working link.
//        */
//       const previousAccess = {
//         tokenHash:
//           order.access?.tokenHash ||
//           null,

//         expiresAt:
//           order.access?.expiresAt ||
//           null,

//         generatedAt:
//           order.access?.generatedAt ||
//           null,

//         lastAccessedAt:
//           order.access
//             ?.lastAccessedAt ||
//           null,

//         accessCount:
//           order.access
//             ?.accessCount ||
//           0,

//         revoked:
//           order.access
//             ?.revoked ??
//           false,
//       };


//       /*
//        * Generate NEW raw access token.
//        *
//        * Raw token is NEVER stored in MongoDB.
//        */
//       const rawAccessToken =
//         generateAccessToken();


//       /*
//        * Store only SHA-256 hash.
//        */
//       const accessTokenHash =
//         hashAccessToken(
//           rawAccessToken
//         );


//       const now =
//         new Date();


//       /*
//        * Same 24 hour duration used by
//        * the successful-payment flow.
//        */
//       const accessExpiresAt =
//         new Date(
//           Date.now() +
//             ACCESS_DURATION
//         );


//       /*
//        * Generate same style URL used after
//        * successful payment:
//        *
//        * /payment/success?token=...&order=...
//        */
//       const accessUrl =
//         buildAccessUrl(
//           rawAccessToken,
//           order.orderId ||
//             String(
//               order._id
//             )
//         );

//       console.log("Access URL generated:", accessUrl);


//       /*
//        * Replace old access token with
//        * newly generated access token.
//        */
//       await Order.updateOne(
//         {
//           _id:
//             order._id,
//         },
//         {
//           $set: {
//             "access.tokenHash":
//               accessTokenHash,

//             "access.expiresAt":
//               accessExpiresAt,

//             "access.generatedAt":
//               now,

//             "access.lastAccessedAt":
//               null,

//             "access.accessCount":
//               0,

//             "access.revoked":
//               false,
//           },
//         }
//       );


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
//           }
//         );


//       /*
//        * Send email.
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
//           "Book access mail send error:",
//           mailError
//         );


//         /*
//          * Restore old access token if
//          * sending the email failed.
//          */
//         await Order.updateOne(
//           {
//             _id:
//               order._id,
//           },
//           {
//             $set: {
//               "access.tokenHash":
//                 previousAccess
//                   .tokenHash,

//               "access.expiresAt":
//                 previousAccess
//                   .expiresAt,

//               "access.generatedAt":
//                 previousAccess
//                   .generatedAt,

//               "access.lastAccessedAt":
//                 previousAccess
//                   .lastAccessedAt,

//               "access.accessCount":
//                 previousAccess
//                   .accessCount,

//               "access.revoked":
//                 previousAccess
//                   .revoked,
//             },
//           }
//         );


//         return res
//           .status(500)
//           .json({
//             success: false,
//             message:
//               "Failed to send book access email.",
//           });
//       }


//       /*
//        * Return response.
//        *
//        * IMPORTANT:
//        * Do not return raw token or token hash
//        * in API response.
//        */
//       return res
//         .status(200)
//         .json({
//           success: true,

//           message:
//             "Book access email sent successfully.",

//           data: {
//             orderId:
//               order.orderId,

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
//               generatedAt:
//                 now,

//               expiresAt:
//                 accessExpiresAt,

//               revoked:
//                 false,

//               accessCount:
//                 0,
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
//           success: false,
//           message:
//             "Something went wrong while sending the book access email.",
//         });
//     }
//   };

// export {
//   sendPendingPurchaseMail,
//   resendBookAccessMail,
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
   CONSTANTS
========================================================= */

const TARGET_TREK_URL =
  "https://www.targettrek.in";

const ALL_BOOKS_URL =
  `${TARGET_TREK_URL}/books`;

const SUPPORT_EMAIL =
  "supporttargettrek@gmail.com";

/*
 * Default access duration:
 * 24 hours
 */
const ACCESS_DURATION =
  24 * 60 * 60 * 1000;


/* =========================================================
   COMMON HELPERS
========================================================= */

const escapeHtml = (
  value = ""
) => {
  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
};


const getCurrencySymbol = (
  currency = "INR"
) => {
  const normalized =
    String(currency)
      .trim()
      .toUpperCase();

  if (
    normalized === "INR"
  ) {
    return "₹";
  }

  if (
    normalized === "USD"
  ) {
    return "$";
  }

  if (
    normalized === "EUR"
  ) {
    return "€";
  }

  if (
    normalized === "GBP"
  ) {
    return "£";
  }

  return `${normalized} `;
};


const formatAmount = (
  amount,
  currency = "INR"
) => {
  const number =
    Number(
      amount || 0
    );

  return (
    `${getCurrencySymbol(
      currency
    )}${number.toFixed(2)}`
  );
};


const formatDate = (
  date
) => {
  if (!date) {
    return "N/A";
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "N/A";
  }

  return parsed.toLocaleString(
    "en-IN",
    {
      timeZone:
        "Asia/Kolkata",

      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",

      hour12:
        true,
    }
  );
};


/*
 * Supports:
 *
 * MongoDB _id
 *
 * OR
 *
 * your custom orderId
 */
const getOrderQuery = (
  orderId
) => {
  if (
    mongoose.Types
      .ObjectId
      .isValid(
        orderId
      )
  ) {
    return {
      $or: [
        {
          _id:
            orderId,
        },
        {
          orderId,
        },
      ],
    };
  }

  return {
    orderId,
  };
};


/* =========================================================
   REDIRECT URL
========================================================= */

/*
 * IMPORTANT FIX
 *
 * If redirectUrl is already:
 *
 * https://something.com/page
 *
 * DO NOT CHANGE IT.
 *
 *
 * If redirectUrl is:
 *
 * /books/hld
 *
 * OR
 *
 * books/hld
 *
 * then convert it into:
 *
 * https://www.targettrek.in/books/hld
 */
const buildTargetTrekUrl = (
  redirectUrl = ""
) => {
  const value =
    String(
      redirectUrl || ""
    ).trim();


  /*
   * No redirect URL
   */
  if (!value) {
    return TARGET_TREK_URL;
  }


  /*
   * Already complete URL.
   *
   * KEEP IT EXACTLY
   * AS IT IS.
   */
  if (
    /^https?:\/\//i.test(
      value
    )
  ) {
    try {
      const parsed =
        new URL(value);

      if (
        parsed.protocol ===
          "http:" ||
        parsed.protocol ===
          "https:"
      ) {
        return value;
      }
    } catch {
      /*
       * Invalid full URL.
       *
       * Continue below and
       * treat as relative.
       */
    }
  }


  /*
   * Relative path.
   */
  const cleanedPath =
    value.replace(
      /^\/+/,
      ""
    );


  return (
    `${TARGET_TREK_URL}/` +
    cleanedPath
  );
};


/* =========================================================
   BOOK COVER
========================================================= */

const getBookCoverUrl = (
  coverImage
) => {
  let url = "";


  if (
    typeof coverImage ===
    "string"
  ) {
    url =
      coverImage.trim();
  }

  else if (
    coverImage &&
    typeof coverImage ===
      "object"
  ) {
    url =
      String(
        coverImage
          .secure_url ||
        coverImage.url ||
        ""
      ).trim();
  }


  return (
    /^https?:\/\//i.test(
      url
    )
      ? url
      : ""
  );
};


/* =========================================================
   PAYMENT HELPERS
========================================================= */

const getPaymentTransactionId = (
  order
) => {
  return (
    order.payment
      ?.mihpayid ||

    order.payment
      ?.transactionId ||

    order.payment
      ?.transaction_id ||

    order.payment
      ?.paymentId ||

    order.payment
      ?.payment_id ||

    order.payment
      ?.txnid ||

    order.txnid ||

    "N/A"
  );
};


const getPaymentMethod = (
  order
) => {
  return (
    order.payment
      ?.mode ||

    order.payment
      ?.method ||

    order.payment
      ?.paymentMethod ||

    order.paymentMethod ||

    "Online Payment"
  );
};


const getPaidAmount = (
  order,
  book
) => {
  const values = [
    order.payment
      ?.amount,

    order.finalAmount,

    order.totalAmount,

    order.amount,

    order.book
      ?.price,

    book?.price,
  ];


  for (
    const value of values
  ) {
    const amount =
      Number(value);

    if (
      Number.isFinite(
        amount
      ) &&
      amount >= 0
    ) {
      return amount;
    }
  }


  return 0;
};


const getMrp = (
  order,
  book
) => {
  const values = [
    order.book
      ?.mrp,

    order.mrp,

    book?.mrp,
  ];


  for (
    const value of values
  ) {
    const mrp =
      Number(value);

    if (
      Number.isFinite(
        mrp
      ) &&
      mrp > 0
    ) {
      return mrp;
    }
  }


  return 0;
};


const getCurrency = (
  order,
  book
) => {
  return (
    order.payment
      ?.currency ||

    order.book
      ?.currency ||

    order.currency ||

    book?.currency ||

    "INR"
  );
};


const getCouponCode = (
  order
) => {
  return (
    order.coupon
      ?.code ||

    order.coupon
      ?.couponCode ||

    order.couponCode ||

    ""
  );
};


const getDiscountAmount = (
  order
) => {
  const values = [
    order.coupon
      ?.discountAmount,

    order.discountAmount,

    order.pricing
      ?.discountAmount,
  ];


  for (
    const value of values
  ) {
    const discount =
      Number(value);

    if (
      Number.isFinite(
        discount
      ) &&
      discount > 0
    ) {
      return discount;
    }
  }


  return 0;
};


const getPurchaseDate = (
  order
) => {
  return (
    order.payment
      ?.paidAt ||

    order.payment
      ?.completedAt ||

    order.paidAt ||

    order.updatedAt ||

    order.createdAt
  );
};


const getAdminIdentifier = (
  req
) => {
  return (
    req.user
      ?.email ||

    req.admin
      ?.email ||

    req.user
      ?._id ||

    req.admin
      ?._id ||

    "ADMIN"
  );
};


/* =========================================================
   ACCESS TOKEN HELPERS
========================================================= */

const generateAccessToken =
  () => {
    return crypto
      .randomBytes(
        32
      )
      .toString(
        "hex"
      );
  };


const hashAccessToken = (
  token
) => {
  return crypto
    .createHash(
      "sha256"
    )
    .update(
      token
    )
    .digest(
      "hex"
    );
};


const buildAccessUrl = (
  rawToken,
  orderId
) => {
  return (
    `${TARGET_TREK_URL}/payment/success` +

    `?token=${encodeURIComponent(
      rawToken
    )}` +

    `&order=${encodeURIComponent(
      orderId
    )}`
  );
};


/* =========================================================
   VALIDATE EXISTING ACCESS URL
========================================================= */

const isValidExistingAccessUrl = (
  accessUrl,
  expectedOrderId
) => {
  try {

    if (
      !accessUrl ||
      typeof accessUrl !==
        "string"
    ) {
      return false;
    }


    const parsed =
      new URL(
        accessUrl.trim()
      );


    const targetOrigin =
      new URL(
        TARGET_TREK_URL
      ).origin;


    /*
     * Must be Target Trek URL.
     */
    if (
      parsed.origin !==
      targetOrigin
    ) {
      return false;
    }


    /*
     * Must be access route.
     */
    if (
      parsed.pathname !==
      "/payment/success"
    ) {
      return false;
    }


    const token =
      parsed.searchParams.get(
        "token"
      );


    const order =
      parsed.searchParams.get(
        "order"
      );


    if (
      !token ||
      !order
    ) {
      return false;
    }


    /*
     * URL must belong to
     * this exact order.
     */
    return (
      String(order) ===
      String(
        expectedOrderId
      )
    );

  } catch {
    return false;
  }
};


/* =========================================================
   PAYMENT VALIDATION
========================================================= */

const validatePaidOrder = (
  order
) => {
  const orderStatus =
    String(
      order.orderStatus ||
      ""
    )
      .trim()
      .toLowerCase();


  const paymentStatus =
    String(
      order.payment
        ?.status ||
      ""
    )
      .trim()
      .toLowerCase();


  return (
    orderStatus ===
      "paid" &&

    paymentStatus ===
      "success"
  );
};


const validatePaymentVerification = (
  order
) => {
  return (
    order.verification
      ?.callbackHashVerified ===
      true &&

    order.verification
      ?.payuVerified ===
      true &&

    order.verification
      ?.amountVerified ===
      true
  );
};


/* =========================================================
   GET BOOK
========================================================= */

const getPurchasedBook =
  async (
    order
  ) => {

    return Book
      .findById(
        order.bookId
      )
      .select(`
        title
        subtitle
        description
        shortDescription
        edition
        categories
        level
        language
        format
        price
        mrp
        currency
        paymentUrl
        redirectUrl
        coverImage
        isActive
        isPublished
      `);
  };


/* =========================================================
   PENDING PURCHASE EMAIL
========================================================= */

export const buildPendingPurchaseEmail =
  ({
    order,

    book,

    couponCode = "",

    couponDescription = "",

    couponValidation = null,
  }) => {

    const customerName =
      order.customer
        ?.name
        ?.trim() ||
      "there";


    const customerEmail =
      order.customer
        ?.email
        ?.trim() ||
      "";


    const bookTitle =
      book.title ||

      order.book
        ?.title ||

      "your ebook";


    const currency =
      book.currency ||

      order.book
        ?.currency ||

      "INR";


    const currentPrice =
      Number(
        book.price
      ) ||
      0;


    const currentMrp =
      Number(
        book.mrp
      ) ||
      0;


    const oldOrderPrice =
      Number(
        order.book
          ?.price
      );


    const hasOldOrderPrice =
      Number.isFinite(
        oldOrderPrice
      ) &&
      oldOrderPrice > 0;


    const priceChanged =
      hasOldOrderPrice &&

      Math.abs(
        oldOrderPrice -
        currentPrice
      ) >
        0.001;


    /*
     * IMPORTANT:
     *
     * Existing full URL is
     * returned unchanged.
     */
    const purchaseUrl =
      buildTargetTrekUrl(
        book.redirectUrl
      );


    const coverImageUrl =
      getBookCoverUrl(
        book.coverImage
      );


    const paymentStatus =
      String(
        order.payment
          ?.status ||

        order.orderStatus ||

        "Pending"
      ).trim();


    const hasCoupon =
      Boolean(
        couponCode &&
        couponDescription
      );


    const discountAmount =
      couponValidation
        ?.discountAmount ??

      couponValidation
        ?.data
        ?.discountAmount ??

      null;


    const finalAmount =
      couponValidation
        ?.finalAmount ??

      couponValidation
        ?.data
        ?.finalAmount ??

      null;


    const safeName =
      escapeHtml(
        customerName
      );


    const safeEmail =
      escapeHtml(
        customerEmail
      );


    const safeTitle =
      escapeHtml(
        bookTitle
      );


    const safeSubtitle =
      escapeHtml(
        book.subtitle ||
        ""
      );


    const safeDescription =
      escapeHtml(
        book.shortDescription ||

        book.description ||

        ""
      );


    const safePurchaseUrl =
      escapeHtml(
        purchaseUrl
      );


    const safeCover =
      escapeHtml(
        coverImageUrl
      );


    const safeCouponCode =
      escapeHtml(
        couponCode
      );


    const safeCouponDescription =
      escapeHtml(
        couponDescription
      );


    const subject =
      hasCoupon

        ? `Complete your ${bookTitle} purchase — special coupon inside | Target Trek`

        : `Complete your ${bookTitle} purchase | Target Trek`;


    const text = `
Hi ${customerName},

You started purchasing "${bookTitle}" on Target Trek, but the payment was not completed.

Order ID:
${order.orderId || order._id || ""}

Customer Email:
${customerEmail}

Payment Status:
${paymentStatus}

Book:
${bookTitle}

${
  book.subtitle
    ? `Subtitle: ${book.subtitle}`
    : ""
}

${
  currentMrp >
  currentPrice

    ? `MRP: ${formatAmount(
        currentMrp,
        currency
      )}`

    : ""
}

Current Price:
${formatAmount(
  currentPrice,
  currency
)}

${
  priceChanged

    ? `Previous Price: ${formatAmount(
        oldOrderPrice,
        currency
      )}`

    : ""
}

${
  hasCoupon

    ? `
Coupon:
${couponCode}

Offer:
${couponDescription}

${
  discountAmount !==
  null

    ? `Discount: ${formatAmount(
        discountAmount,
        currency
      )}`

    : ""
}

${
  finalAmount !==
  null

    ? `Price after coupon: ${formatAmount(
        finalAmount,
        currency
      )}`

    : ""
}
`

    : ""
}

Complete your purchase:
${purchaseUrl}

Explore all books:
${ALL_BOOKS_URL}

Need help?
${SUPPORT_EMAIL}

Regards,
Team Target Trek
    `.trim();


    const html = `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta
    charset="UTF-8"
  />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    Complete Your Purchase
  </title>

</head>


<body
  style="
    margin: 0;
    background: #f4f7fb;
    font-family:
      Arial,
      Helvetica,
      sans-serif;
    color: #0f172a;
  "
>

  <table
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="
      background: #f4f7fb;
    "
  >

    <tr>

      <td
        align="center"
        style="
          padding:
            30px
            14px;
        "
      >

        <table
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            max-width: 680px;
            background: #ffffff;
            border:
              1px solid #e2e8f0;
            border-radius: 18px;
            overflow: hidden;
          "
        >


          <!-- HEADER -->

          <tr>

            <td
              style="
                padding:
                  24px
                  30px;
                background: #eff6ff;
                border-bottom:
                  1px solid #dbeafe;
              "
            >

              <div
                style="
                  font-size: 24px;
                  font-weight: 800;
                  color: #2563eb;
                "
              >
                Target Trek
              </div>


              <div
                style="
                  margin-top: 5px;
                  font-size: 12px;
                  color: #64748b;
                "
              >
                Learn. Build. Grow.
              </div>

            </td>

          </tr>


          <!-- BODY -->

          <tr>

            <td
              style="
                padding: 30px;
              "
            >

              <div
                style="
                  display: inline-block;
                  padding:
                    7px
                    12px;
                  background: #fff7ed;
                  color: #c2410c;
                  border-radius: 999px;
                  font-size: 11px;
                  font-weight: 800;
                "
              >
                PURCHASE NOT COMPLETED
              </div>


              <h1
                style="
                  margin:
                    18px
                    0
                    10px;
                  font-size: 27px;
                "
              >
                Hi ${safeName},
              </h1>


              <p
                style="
                  margin: 0;
                  color: #475569;
                  font-size: 15px;
                  line-height: 1.7;
                "
              >

                You started purchasing

                <strong>
                  ${safeTitle}
                </strong>,

                but the payment was not completed.

              </p>


              <!-- BOOK -->

              <table
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  margin-top: 24px;
                  background: #f8fafc;
                  border:
                    1px solid #e2e8f0;
                  border-radius: 14px;
                "
              >

                <tr>

                  ${
                    coverImageUrl

                      ? `
                  <td
                    width="140"
                    valign="top"
                    style="
                      padding: 18px;
                    "
                  >

                    <img
                      src="${safeCover}"
                      alt="${safeTitle}"
                      width="120"
                      style="
                        display: block;
                        width: 120px;
                        height: auto;
                        border-radius: 10px;
                      "
                    />

                  </td>
                  `

                      : ""
                  }


                  <td
                    valign="top"
                    style="
                      padding: 20px;
                    "
                  >

                    <div
                      style="
                        font-size: 11px;
                        font-weight: 800;
                        color: #2563eb;
                      "
                    >
                      YOUR SELECTED BOOK
                    </div>


                    <div
                      style="
                        margin-top: 7px;
                        font-size: 19px;
                        font-weight: 800;
                      "
                    >
                      ${safeTitle}
                    </div>


                    ${
                      safeSubtitle

                        ? `
                    <div
                      style="
                        margin-top: 5px;
                        color: #475569;
                        font-size: 13px;
                      "
                    >
                      ${safeSubtitle}
                    </div>
                    `

                        : ""
                    }


                    ${
                      safeDescription

                        ? `
                    <div
                      style="
                        margin-top: 10px;
                        color: #64748b;
                        font-size: 12px;
                        line-height: 1.6;
                      "
                    >
                      ${safeDescription}
                    </div>
                    `

                        : ""
                    }

                  </td>

                </tr>

              </table>


              <!-- PURCHASE DETAILS -->

              <div
                style="
                  margin-top: 20px;
                  padding: 18px;
                  border:
                    1px solid #e2e8f0;
                  border-radius: 14px;
                "
              >

                <div
                  style="
                    font-weight: 800;
                    margin-bottom: 12px;
                  "
                >
                  Purchase details
                </div>


                <div
                  style="
                    font-size: 13px;
                    line-height: 1.9;
                    color: #475569;
                  "
                >

                  Order ID:

                  <strong
                    style="
                      color: #0f172a;
                    "
                  >
                    ${escapeHtml(
                      order.orderId ||
                      order._id ||
                      ""
                    )}
                  </strong>

                  <br />


                  Email:

                  <strong
                    style="
                      color: #0f172a;
                    "
                  >
                    ${safeEmail}
                  </strong>

                  <br />


                  Payment Status:

                  <strong
                    style="
                      color: #0f172a;
                    "
                  >
                    ${escapeHtml(
                      paymentStatus
                    )}
                  </strong>

                  <br />


                  ${
                    currentMrp >
                    currentPrice

                      ? `
                  MRP:

                  <span
                    style="
                      text-decoration:
                        line-through;
                    "
                  >
                    ${formatAmount(
                      currentMrp,
                      currency
                    )}
                  </span>

                  <br />
                  `

                      : ""
                  }


                  Current Price:

                  <strong
                    style="
                      font-size: 17px;
                      color: #2563eb;
                    "
                  >
                    ${formatAmount(
                      currentPrice,
                      currency
                    )}
                  </strong>

                </div>

              </div>


              ${
                priceChanged

                  ? `
              <div
                style="
                  margin-top: 18px;
                  padding: 15px;
                  background: #fff7ed;
                  border:
                    1px solid #fed7aa;
                  border-radius: 12px;
                  color: #9a3412;
                  font-size: 13px;
                  line-height: 1.6;
                "
              >

                <strong>
                  Price updated.
                </strong>

                <br />

                Previous:
                ${formatAmount(
                  oldOrderPrice,
                  currency
                )}

                <br />

                Current:
                ${formatAmount(
                  currentPrice,
                  currency
                )}

              </div>
              `

                  : ""
              }


              ${
                hasCoupon

                  ? `
              <div
                style="
                  margin-top: 18px;
                  padding: 18px;
                  background: #f0fdf4;
                  border:
                    1px solid #bbf7d0;
                  border-radius: 14px;
                  color: #166534;
                "
              >

                <div
                  style="
                    font-size: 11px;
                    font-weight: 800;
                  "
                >
                  SPECIAL OFFER
                </div>


                <div
                  style="
                    margin-top: 8px;
                    font-size: 14px;
                  "
                >
                  ${safeCouponDescription}
                </div>


                <div
                  style="
                    margin-top: 12px;
                    padding: 12px;
                    background: #ffffff;
                    border:
                      1px dashed #86efac;
                    border-radius: 10px;
                    font-size: 20px;
                    font-weight: 800;
                  "
                >
                  ${safeCouponCode}
                </div>


                ${
                  discountAmount !==
                  null

                    ? `
                <div
                  style="
                    margin-top: 10px;
                    font-size: 13px;
                  "
                >

                  You save:

                  <strong>
                    ${formatAmount(
                      discountAmount,
                      currency
                    )}
                  </strong>

                </div>
                `

                    : ""
                }


                ${
                  finalAmount !==
                  null

                    ? `
                <div
                  style="
                    margin-top: 4px;
                    font-size: 13px;
                  "
                >

                  Price after coupon:

                  <strong>
                    ${formatAmount(
                      finalAmount,
                      currency
                    )}
                  </strong>

                </div>
                `

                    : ""
                }

              </div>
              `

                  : ""
              }


              <!-- CTA -->

              <div
                style="
                  margin-top: 28px;
                  text-align: center;
                "
              >

                <a
                  href="${safePurchaseUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    display: inline-block;
                    padding:
                      15px
                      30px;
                    background: #2563eb;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: 800;
                  "
                >
                  Complete Your Purchase
                </a>

              </div>


              <div
                style="
                  margin-top: 18px;
                  padding: 14px;
                  background: #f8fafc;
                  border-radius: 10px;
                  font-size: 12px;
                  color: #64748b;
                  word-break: break-all;
                "
              >

                Button not opening?
                Copy this URL:

                <br />


                <a
                  href="${safePurchaseUrl}"
                  style="
                    color: #2563eb;
                  "
                >
                  ${safePurchaseUrl}
                </a>

              </div>


              <div
                style="
                  margin-top: 22px;
                  text-align: center;
                "
              >

                <a
                  href="${ALL_BOOKS_URL}"
                  style="
                    color: #2563eb;
                    font-weight: 700;
                    text-decoration: none;
                  "
                >
                  Explore all Target Trek books →
                </a>

              </div>


              <p
                style="
                  margin-top: 24px;
                  color: #64748b;
                  font-size: 13px;
                  line-height: 1.7;
                "
              >

                Need help?

                <a
                  href="mailto:${SUPPORT_EMAIL}"
                  style="
                    color: #2563eb;
                  "
                >
                  ${SUPPORT_EMAIL}
                </a>

              </p>

            </td>

          </tr>

        </table>

      </td>

    </tr>

  </table>

</body>

</html>
    `.trim();


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

const sendPendingPurchaseMail =
  async (
    req,
    res
  ) => {

    try {

      const {
        orderId,
      } =
        req.params;


      const rawCouponCode =
        typeof req.body
          ?.couponCode ===
          "string"

          ? req.body
              .couponCode
              .trim()

          : "";


      const rawCouponDescription =
        typeof req.body
          ?.couponDescription ===
          "string"

          ? req.body
              .couponDescription
              .trim()

          : "";


      if (!orderId) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Order ID is required.",
          });
      }


      const hasCouponCode =
        Boolean(
          rawCouponCode
        );


      const hasCouponDescription =
        Boolean(
          rawCouponDescription
        );


      if (
        hasCouponCode !==
        hasCouponDescription
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Coupon code and coupon description must both be provided, or both must be empty.",
          });
      }


      const order =
        await Order
          .findOne(
            getOrderQuery(
              orderId
            )
          );


      if (!order) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Order not found.",
          });
      }


      const allowedStatuses =
        new Set([
          "pending",
          "failed",
          "bounced",
        ]);


      const orderStatus =
        String(
          order.orderStatus ||
          ""
        )
          .trim()
          .toLowerCase();


      const paymentStatus =
        String(
          order.payment
            ?.status ||
          ""
        )
          .trim()
          .toLowerCase();


      if (
        !allowedStatuses.has(
          orderStatus
        ) ||

        !allowedStatuses.has(
          paymentStatus
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Reminder email can only be sent for pending, failed, or bounced orders.",
          });
      }


      const customerEmail =
        order.customer
          ?.email
          ?.trim()
          .toLowerCase();


      if (
        !customerEmail
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Customer email is not available.",
          });
      }


      const book =
        await getPurchasedBook(
          order
        );


      if (!book) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Book associated with this order no longer exists.",
          });
      }


      if (
        !book.isActive
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "This book is currently inactive. Reminder email was not sent.",
          });
      }


      if (
        !book.isPublished
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "This book is currently unpublished. Reminder email was not sent.",
          });
      }


      if (
        !book.redirectUrl
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Book purchase page is not configured.",
          });
      }


      let couponValidation =
        null;


      if (
        hasCouponCode &&
        hasCouponDescription
      ) {

        try {

          couponValidation =
            await validateCouponForPayment(
              {
                couponCode:
                  rawCouponCode,

                bookId:
                  String(
                    book._id
                  ),

                book,

                email:
                  customerEmail,
              }
            );


          if (
            couponValidation
              ?.valid ===
              false ||

            couponValidation
              ?.success ===
              false
          ) {
            return res
              .status(400)
              .json({
                success:
                  false,

                message:
                  couponValidation
                    ?.message ||

                  "Coupon is not valid for this customer and book.",
              });
          }

        } catch (
          couponError
        ) {

          console.error(
            "Coupon validation error:",
            couponError
          );


          return res
            .status(
              couponError
                ?.statusCode ||
              400
            )
            .json({
              success:
                false,

              code:
                couponError
                  ?.code ||

                "COUPON_VALIDATION_FAILED",

              message:
                couponError
                  ?.message ||

                "Coupon is not valid for this customer and book.",
            });
        }
      }


      const finalCouponCode =
        hasCouponCode

          ? rawCouponCode
              .toUpperCase()

          : "";


      const finalCouponDescription =
        hasCouponDescription

          ? rawCouponDescription

          : "";


      const {
        subject,

        text,

        html,

        purchaseUrl,
      } =
        buildPendingPurchaseEmail(
          {
            order,

            book,

            couponCode:
              finalCouponCode,

            couponDescription:
              finalCouponDescription,

            couponValidation,
          }
        );


      /*
       * SEND MAIL
       */
      try {

        await sendMail(
          customerEmail,
          subject,
          text,
          html
        );

      } catch (
        mailError
      ) {

        console.error(
          "Pending mail send error:",
          mailError
        );


        await Order
          .updateOne(
            {
              _id:
                order._id,
            },
            {
              $set: {
                "pendingMail.lastStatus":
                  "FAILED",

                "pendingMail.lastError":
                  mailError
                    ?.message ||

                  "Failed to send email",
              },
            }
          );


        return res
          .status(500)
          .json({
            success:
              false,

            message:
              "Failed to send pending purchase email.",
          });
      }


      const now =
        new Date();


      const adminIdentifier =
        String(
          getAdminIdentifier(
            req
          )
        );


      const pendingMailUpdate =
        {
          $inc: {
            "pendingMail.sentCount":
              1,
          },

          $set: {
            "pendingMail.lastSentAt":
              now,

            "pendingMail.lastSentBy":
              adminIdentifier,

            "pendingMail.lastStatus":
              "SENT",

            "pendingMail.lastError":
              null,

            updatedBy:
              adminIdentifier,
          },
        };


      if (
        !order.pendingMail
          ?.firstSentAt
      ) {
        pendingMailUpdate
          .$set[
            "pendingMail.firstSentAt"
          ] =
          now;
      }


      const updatedOrder =
        await Order
          .findByIdAndUpdate(
            order._id,

            pendingMailUpdate,

            {
              new:
                true,
            }
          );


      return res
        .status(200)
        .json({
          success:
            true,

          message:
            "Pending purchase email sent successfully.",

          data: {

            orderId:
              updatedOrder
                .orderId,

            mongoOrderId:
              updatedOrder
                ._id,


            customer: {
              name:
                updatedOrder
                  .customer
                  ?.name,

              email:
                updatedOrder
                  .customer
                  ?.email,
            },


            book: {
              id:
                book._id,

              title:
                book.title,

              currentPrice:
                book.price,

              mrp:
                book.mrp,

              currency:
                book.currency,

              redirectUrl:
                book.redirectUrl,

              purchaseUrl,
            },


            coupon: {

              included:
                Boolean(
                  finalCouponCode
                ),

              code:
                finalCouponCode ||
                null,

              description:
                finalCouponDescription ||
                null,

              validation:
                couponValidation

                  ? {
                      valid:
                        true,

                      discountAmount:
                        couponValidation
                          ?.discountAmount ??

                        couponValidation
                          ?.data
                          ?.discountAmount ??

                        null,

                      finalAmount:
                        couponValidation
                          ?.finalAmount ??

                        couponValidation
                          ?.data
                          ?.finalAmount ??

                        null,
                    }

                  : null,
            },


            pendingMail:
              updatedOrder
                .pendingMail,
          },
        });

    } catch (
      error
    ) {

      console.error(
        "sendPendingPurchaseMail error:",
        error
      );


      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Something went wrong while sending the pending purchase email.",
        });
    }
  };


/* =========================================================
   BOOK ACCESS EMAIL
========================================================= */

const buildBookAccessEmail =
  ({
    order,

    book,

    accessUrl,

    accessExpiresAt,

    generatedNewAccess =
      false,
  }) => {

    const customerName =
      order.customer
        ?.name
        ?.trim() ||
      "there";


    const customerEmail =
      order.customer
        ?.email
        ?.trim() ||
      "";


    const bookTitle =
      book.title ||

      order.book
        ?.title ||

      "your ebook";


    const bookSubtitle =
      book.subtitle ||

      order.book
        ?.subtitle ||

      "";


    const currency =
      getCurrency(
        order,
        book
      );


    const paidAmount =
      getPaidAmount(
        order,
        book
      );


    const mrp =
      getMrp(
        order,
        book
      );


    const couponCode =
      getCouponCode(
        order
      );


    const discountAmount =
      getDiscountAmount(
        order
      );


    const transactionId =
      getPaymentTransactionId(
        order
      );


    const paymentMethod =
      getPaymentMethod(
        order
      );


    const purchaseDate =
      getPurchaseDate(
        order
      );


    const coverImageUrl =
      getBookCoverUrl(
        book.coverImage
      );


    const safeName =
      escapeHtml(
        customerName
      );


    const safeEmail =
      escapeHtml(
        customerEmail
      );


    const safeTitle =
      escapeHtml(
        bookTitle
      );


    const safeSubtitle =
      escapeHtml(
        bookSubtitle
      );


    const safeUrl =
      escapeHtml(
        accessUrl
      );


    const safeCover =
      escapeHtml(
        coverImageUrl
      );


    const safeTransactionId =
      escapeHtml(
        transactionId
      );


    const safePaymentMethod =
      escapeHtml(
        paymentMethod
      );


    const safeCoupon =
      escapeHtml(
        couponCode
      );


    const linkMessage =
      generatedNewAccess

        ? "Your new secure book access link is ready."

        : "Your existing secure book access link is still active.";


    const expiryMessage =
      generatedNewAccess

        ? "This newly generated access link is valid until"

        : "Your existing access link remains valid until";


    const subject =
      `Your ${bookTitle} access link | Target Trek`;


    const text = `
Hi ${customerName},

Thanks for purchasing "${bookTitle}" from Target Trek.

${linkMessage}

ACCESS YOUR BOOK

${accessUrl}

Book:
${bookTitle}

${
  bookSubtitle
    ? `Subtitle: ${bookSubtitle}`
    : ""
}

Order ID:
${order.orderId || order._id}

Customer Email:
${customerEmail}

Order Status:
${String(
  order.orderStatus ||
  "PAID"
).toUpperCase()}

Payment Status:
${String(
  order.payment
    ?.status ||
  "SUCCESS"
).toUpperCase()}

Transaction ID:
${transactionId}

Payment Method:
${paymentMethod}

${
  mrp >
  paidAmount

    ? `MRP: ${formatAmount(
        mrp,
        currency
      )}`

    : ""
}

${
  couponCode

    ? `Coupon Used: ${couponCode}`

    : ""
}

${
  discountAmount > 0

    ? `Discount: ${formatAmount(
        discountAmount,
        currency
      )}`

    : ""
}

Amount Paid:
${formatAmount(
  paidAmount,
  currency
)}

Purchase Date:
${formatDate(
  purchaseDate
)}

${expiryMessage}:
${formatDate(
  accessExpiresAt
)}

Please do not share this access link.

Need help?
${SUPPORT_EMAIL}

Explore more books:
${ALL_BOOKS_URL}

Regards,
Team Target Trek
    `.trim();


    const html = `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta
    charset="UTF-8"
  />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    Your Book Access
  </title>

</head>


<body
  style="
    margin: 0;
    background: #f4f7fb;
    font-family:
      Arial,
      Helvetica,
      sans-serif;
    color: #0f172a;
  "
>

  <table
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="
      background: #f4f7fb;
    "
  >

    <tr>

      <td
        align="center"
        style="
          padding:
            30px
            14px;
        "
      >

        <table
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            max-width: 680px;
            background: #ffffff;
            border:
              1px solid #e2e8f0;
            border-radius: 18px;
            overflow: hidden;
          "
        >


          <!-- HEADER -->

          <tr>

            <td
              style="
                padding:
                  24px
                  30px;
                background: #eff6ff;
                border-bottom:
                  1px solid #dbeafe;
              "
            >

              <div
                style="
                  font-size: 24px;
                  font-weight: 800;
                  color: #2563eb;
                "
              >
                Target Trek
              </div>


              <div
                style="
                  margin-top: 5px;
                  color: #64748b;
                  font-size: 12px;
                "
              >
                Your purchased book access
              </div>

            </td>

          </tr>


          <tr>

            <td
              style="
                padding: 30px;
              "
            >

              <h1
                style="
                  margin: 0;
                  font-size: 27px;
                "
              >
                Hi ${safeName},
              </h1>


              <p
                style="
                  margin:
                    12px
                    0
                    0;
                  color: #475569;
                  font-size: 15px;
                  line-height: 1.7;
                "
              >
                ${escapeHtml(
                  linkMessage
                )}
              </p>


              <!-- BOOK -->

              <table
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  margin-top: 24px;
                  background: #f8fafc;
                  border:
                    1px solid #e2e8f0;
                  border-radius: 14px;
                "
              >

                <tr>

                  ${
                    coverImageUrl

                      ? `
                  <td
                    width="140"
                    valign="top"
                    style="
                      padding: 18px;
                    "
                  >

                    <img
                      src="${safeCover}"
                      width="120"
                      alt="${safeTitle}"
                      style="
                        display: block;
                        width: 120px;
                        height: auto;
                        border-radius: 10px;
                      "
                    />

                  </td>
                  `

                      : ""
                  }


                  <td
                    valign="top"
                    style="
                      padding: 20px;
                    "
                  >

                    <div
                      style="
                        font-size: 11px;
                        font-weight: 800;
                        color: #2563eb;
                      "
                    >
                      YOUR PURCHASED BOOK
                    </div>


                    <div
                      style="
                        margin-top: 7px;
                        font-size: 19px;
                        font-weight: 800;
                      "
                    >
                      ${safeTitle}
                    </div>


                    ${
                      safeSubtitle

                        ? `
                    <div
                      style="
                        margin-top: 5px;
                        color: #64748b;
                        font-size: 13px;
                      "
                    >
                      ${safeSubtitle}
                    </div>
                    `

                        : ""
                    }

                  </td>

                </tr>

              </table>


              <!-- ACCESS BUTTON -->

              <div
                style="
                  margin-top: 26px;
                  text-align: center;
                "
              >

                <a
                  href="${safeUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    display: inline-block;
                    padding:
                      15px
                      32px;
                    background: #2563eb;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: 800;
                  "
                >
                  Access Your Book
                </a>

              </div>


              <!-- FALLBACK URL -->

              <div
                style="
                  margin-top: 18px;
                  padding: 14px;
                  background: #f8fafc;
                  border:
                    1px solid #e2e8f0;
                  border-radius: 10px;
                  font-size: 12px;
                  color: #64748b;
                  word-break: break-all;
                "
              >

                If the button does not work,
                copy this URL:

                <br />


                <a
                  href="${safeUrl}"
                  style="
                    color: #2563eb;
                  "
                >
                  ${safeUrl}
                </a>

              </div>


              <!-- PAYMENT DETAILS -->

              <div
                style="
                  margin-top: 22px;
                  padding: 18px;
                  border:
                    1px solid #e2e8f0;
                  border-radius: 14px;
                  font-size: 13px;
                  line-height: 1.9;
                  color: #475569;
                "
              >

                <strong
                  style="
                    color: #0f172a;
                  "
                >
                  Payment details
                </strong>

                <br />


                Order ID:
                ${escapeHtml(
                  order.orderId ||
                  order._id
                )}

                <br />


                Transaction ID:
                ${safeTransactionId}

                <br />


                Payment Method:
                ${safePaymentMethod}

                <br />


                ${
                  mrp >
                  paidAmount

                    ? `
                MRP:
                ${formatAmount(
                  mrp,
                  currency
                )}

                <br />
                `

                    : ""
                }


                ${
                  couponCode

                    ? `
                Coupon:
                ${safeCoupon}

                <br />
                `

                    : ""
                }


                ${
                  discountAmount >
                  0

                    ? `
                Discount:
                ${formatAmount(
                  discountAmount,
                  currency
                )}

                <br />
                `

                    : ""
                }


                Amount Paid:

                <strong
                  style="
                    color: #2563eb;
                  "
                >
                  ${formatAmount(
                    paidAmount,
                    currency
                  )}
                </strong>

                <br />


                Purchase Date:
                ${formatDate(
                  purchaseDate
                )}

              </div>


              <!-- EXPIRY -->

              <div
                style="
                  margin-top: 20px;
                  padding: 16px;
                  background: #fff7ed;
                  border:
                    1px solid #fed7aa;
                  border-radius: 12px;
                  color: #9a3412;
                  font-size: 13px;
                  line-height: 1.7;
                "
              >

                <strong>
                  Secure access link
                </strong>

                <br />


                ${escapeHtml(
                  expiryMessage
                )}

                <strong>
                  ${formatDate(
                    accessExpiresAt
                  )}
                </strong>.


                Please do not share this
                link publicly.

              </div>


              <!-- SUPPORT -->

              <p
                style="
                  margin-top: 24px;
                  color: #64748b;
                  font-size: 13px;
                  line-height: 1.7;
                "
              >

                Facing any issue?

                Contact

                <a
                  href="mailto:${SUPPORT_EMAIL}"
                  style="
                    color: #2563eb;
                  "
                >
                  ${SUPPORT_EMAIL}
                </a>.

              </p>


              <div
                style="
                  margin-top: 20px;
                  text-align: center;
                "
              >

                <a
                  href="${ALL_BOOKS_URL}"
                  style="
                    color: #2563eb;
                    font-weight: 700;
                    text-decoration: none;
                  "
                >
                  Explore more Target Trek books →
                </a>

              </div>


              <div
                style="
                  margin-top: 28px;
                  color: #475569;
                  font-size: 14px;
                  line-height: 1.7;
                "
              >

                Regards,

                <br />

                <strong>
                  Team Target Trek
                </strong>

              </div>

            </td>

          </tr>


          <!-- FOOTER -->

          <tr>

            <td
              align="center"
              style="
                padding: 18px;
                background: #f8fafc;
                border-top:
                  1px solid #e2e8f0;
                color: #94a3b8;
                font-size: 11px;
              "
            >

              This email was sent because
              a book was purchased using
              ${safeEmail}.

              <br />

              © ${new Date().getFullYear()}
              Target Trek.

            </td>

          </tr>

        </table>

      </td>

    </tr>

  </table>

</body>

</html>
    `.trim();


    return {
      subject,
      text,
      html,
    };
  };


/* =========================================================
   RESEND BOOK ACCESS EMAIL
========================================================= */

const resendBookAccessMail =
  async (
    req,
    res
  ) => {

    try {

      const {
        orderId,
      } =
        req.params;


      if (!orderId) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Order ID is required.",
          });
      }


      const order =
        await Order
          .findOne(
            getOrderQuery(
              orderId
            )
          );


      if (!order) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Order not found.",
          });
      }


      /*
       * PAID + SUCCESS required
       */
      if (
        !validatePaidOrder(
          order
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Book access email can only be sent for a successfully paid order.",
          });
      }


      /*
       * Payment verification
       */
      if (
        !validatePaymentVerification(
          order
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Payment verification is incomplete for this order.",
          });
      }


      const customerEmail =
        order.customer
          ?.email
          ?.trim()
          .toLowerCase();


      if (
        !customerEmail
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Customer email is not available.",
          });
      }


      const book =
        await getPurchasedBook(
          order
        );


      if (!book) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Book associated with this order no longer exists.",
          });
      }


      if (
        !book.isActive
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "This book is currently inactive. Access email was not sent.",
          });
      }


      if (
        !book.isPublished
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "This book is currently unpublished. Access email was not sent.",
          });
      }


      /*
       * Save previous access.
       *
       * Used only if a new token
       * is generated and email
       * sending fails.
       */
      const previousAccess =
        {
          tokenHash:
            order.access
              ?.tokenHash ||
            null,

          url:
            order.access
              ?.url ||
            null,

          expiresAt:
            order.access
              ?.expiresAt ||
            null,

          generatedAt:
            order.access
              ?.generatedAt ||
            null,

          lastAccessedAt:
            order.access
              ?.lastAccessedAt ||
            null,

          accessCount:
            Number(
              order.access
                ?.accessCount ||
              0
            ),

          revoked:
            order.access
              ?.revoked ??
            false,
        };


      const now =
        new Date();


      const accessOrderId =
        order.orderId ||

        String(
          order._id
        );


      /*
       * EXISTING URL
       */
      const existingAccessUrl =
        typeof order.access
          ?.url ===
          "string"

          ? order.access
              .url
              .trim()

          : "";


      /*
       * EXISTING EXPIRY
       */
      const existingExpiresAt =
        order.access
          ?.expiresAt

          ? new Date(
              order.access
                .expiresAt
            )

          : null;


      /*
       * Check expiry.
       */
      const hasValidExpiry =
        Boolean(
          existingExpiresAt &&

          !Number.isNaN(
            existingExpiresAt
              .getTime()
          ) &&

          existingExpiresAt
            .getTime() >
          now.getTime()
        );


      /*
       * Check URL.
       */
      const hasValidUrl =
        isValidExistingAccessUrl(
          existingAccessUrl,

          accessOrderId
        );


      /*
       * Token hash must exist.
       */
      const hasTokenHash =
        Boolean(
          order.access
            ?.tokenHash
        );


      /*
       * Revoked?
       */
      const isRevoked =
        order.access
          ?.revoked ===
        true;


      /*
       * REUSE ONLY WHEN:
       *
       * token exists
       * URL valid
       * expiry valid
       * not revoked
       */
      const canReuseExistingAccess =
        Boolean(
          hasTokenHash &&

          hasValidUrl &&

          hasValidExpiry &&

          !isRevoked
        );


      let accessUrl;

      let accessExpiresAt;

      let generatedAt;

      let accessCount;

      let generatedNewAccess =
        false;


      /* =====================================================
         REUSE EXISTING URL
      ===================================================== */

      if (
        canReuseExistingAccess
      ) {

        accessUrl =
          existingAccessUrl;


        accessExpiresAt =
          existingExpiresAt;


        generatedAt =
          order.access
            ?.generatedAt ||

          now;


        accessCount =
          Number(
            order.access
              ?.accessCount ||
            0
          );


        /*
         * IMPORTANT:
         *
         * DO NOT:
         *
         * generate token
         * change hash
         * change expiry
         * change generatedAt
         * reset accessCount
         * reset lastAccessedAt
         */
        console.log(
          "Reusing existing access URL:",
          {
            orderId:
              accessOrderId,

            expiresAt:
              accessExpiresAt,

            accessCount,
          }
        );
      }


      /* =====================================================
         GENERATE NEW URL
      ===================================================== */

      else {

        generatedNewAccess =
          true;


        const rawAccessToken =
          generateAccessToken();


        const accessTokenHash =
          hashAccessToken(
            rawAccessToken
          );


        accessExpiresAt =
          new Date(
            now.getTime() +
            ACCESS_DURATION
          );


        accessUrl =
          buildAccessUrl(
            rawAccessToken,

            accessOrderId
          );


        generatedAt =
          now;


        accessCount =
          0;


        /*
         * Save new URL/token.
         */
        await Order
          .updateOne(
            {
              _id:
                order._id,
            },
            {
              $set: {

                "access.tokenHash":
                  accessTokenHash,

                /*
                 * Required so the same
                 * valid link can later
                 * be resent.
                 */
                "access.url":
                  accessUrl,

                "access.expiresAt":
                  accessExpiresAt,

                "access.generatedAt":
                  generatedAt,

                "access.lastAccessedAt":
                  null,

                "access.accessCount":
                  0,

                "access.revoked":
                  false,
              },
            }
          );


        console.log(
          "New access URL generated:",
          {
            url:accessUrl,
            orderId:
              accessOrderId,

            expiresAt:
              accessExpiresAt,
          }
        );
      }


      /*
       * BUILD EMAIL
       */
      const {
        subject,

        text,

        html,
      } =
        buildBookAccessEmail(
          {
            order,

            book,

            accessUrl,

            accessExpiresAt,

            generatedNewAccess,
          }
        );


      /* =====================================================
         SEND EMAIL
      ===================================================== */

      try {

        await sendMail(
          customerEmail,
          subject,
          text,
          html
        );

      } catch (
        mailError
      ) {

        console.error(
          "Book access mail send error:",
          mailError
        );


        /*
         * Roll back ONLY when
         * we generated a new token.
         *
         * If existing URL was reused,
         * nothing changed.
         */
        if (
          generatedNewAccess
        ) {

          try {

            await Order
              .updateOne(
                {
                  _id:
                    order._id,
                },
                {
                  $set: {

                    "access.tokenHash":
                      previousAccess
                        .tokenHash,

                    "access.url":
                      previousAccess
                        .url,

                    "access.expiresAt":
                      previousAccess
                        .expiresAt,

                    "access.generatedAt":
                      previousAccess
                        .generatedAt,

                    "access.lastAccessedAt":
                      previousAccess
                        .lastAccessedAt,

                    "access.accessCount":
                      previousAccess
                        .accessCount,

                    "access.revoked":
                      previousAccess
                        .revoked,
                  },
                }
              );

          } catch (
            rollbackError
          ) {

            console.error(
              "Access rollback failed:",
              rollbackError
            );
          }
        }


        return res
          .status(500)
          .json({
            success:
              false,

            message:
              "Failed to send book access email.",
          });
      }


      /* =====================================================
         SUCCESS
      ===================================================== */

      return res
        .status(200)
        .json({
          success:
            true,


          message:
            generatedNewAccess

              ? "A new book access link was generated and emailed successfully."

              : "The existing valid book access link was emailed successfully.",


          data: {

            orderId:
              order.orderId ||

              String(
                order._id
              ),


            mongoOrderId:
              order._id,


            customer: {

              name:
                order.customer
                  ?.name ||
                null,

              email:
                customerEmail,
            },


            book: {

              id:
                book._id,

              title:
                book.title,

              subtitle:
                book.subtitle ||
                null,

              edition:
                book.edition ||
                null,

              format:
                book.format ||
                null,

              price:
                book.price,

              mrp:
                book.mrp,

              currency:
                book.currency,

              coverImage:
                getBookCoverUrl(
                  book.coverImage
                ) ||
                null,
            },


            payment: {

              orderStatus:
                order.orderStatus,

              status:
                order.payment
                  ?.status,

              transactionId:
                getPaymentTransactionId(
                  order
                ),

              paymentMethod:
                getPaymentMethod(
                  order
                ),

              amountPaid:
                getPaidAmount(
                  order,
                  book
                ),

              currency:
                getCurrency(
                  order,
                  book
                ),

              purchaseDate:
                getPurchaseDate(
                  order
                ),
            },


            access: {

              reusedExistingLink:
                !generatedNewAccess,

              generatedNewLink:
                generatedNewAccess,

              generatedAt,

              expiresAt:
                accessExpiresAt,

              revoked:
                false,

              accessCount,
            },


            email: {

              sentTo:
                customerEmail,

              subject,

              sentAt:
                now,
            },
          },
        });

    } catch (
      error
    ) {

      console.error(
        "resendBookAccessMail error:",
        error
      );


      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Something went wrong while sending the book access email.",
        });
    }
  };


/* =========================================================
   REVOKE BOOK ACCESS
========================================================= */

/*
 * Revoke current access.
 *
 * IMPORTANT:
 *
 * We DON'T delete:
 *
 * access.tokenHash
 * access.url
 * access.expiresAt
 *
 * We simply set:
 *
 * access.revoked = true
 *
 * This allows the same token
 * to later be reactivated.
 */
const revokeBookAccess =
  async (
    req,
    res
  ) => {

    try {

      const {
        orderId,
      } =
        req.params;


      if (!orderId) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Order ID is required.",
          });
      }


      const order =
        await Order
          .findOne(
            getOrderQuery(
              orderId
            )
          );


      if (!order) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Order not found.",
          });
      }


      /*
       * No token = nothing
       * to revoke.
       */
      if (
        !order.access
          ?.tokenHash
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "No book access link has been generated for this order.",
          });
      }


      /*
       * Already revoked.
       *
       * Treat this as success
       * instead of error.
       */
      if (
        order.access
          ?.revoked ===
        true
      ) {
        return res
          .status(200)
          .json({
            success:
              true,

            message:
              "Book access is already revoked.",

            data: {

              orderId:
                order.orderId ||

                String(
                  order._id
                ),

              mongoOrderId:
                order._id,


              access: {

                revoked:
                  true,

                expiresAt:
                  order.access
                    ?.expiresAt ||
                  null,

                generatedAt:
                  order.access
                    ?.generatedAt ||
                  null,

                lastAccessedAt:
                  order.access
                    ?.lastAccessedAt ||
                  null,

                accessCount:
                  Number(
                    order.access
                      ?.accessCount ||
                    0
                  ),
              },
            },
          });
      }


      const now =
        new Date();


      const adminIdentifier =
        String(
          getAdminIdentifier(
            req
          )
        );


      /*
       * ONLY revoke.
       *
       * Keep same URL/token.
       */
      const updatedOrder =
        await Order
          .findByIdAndUpdate(
            order._id,

            {
              $set: {

                "access.revoked":
                  true,

                updatedBy:
                  adminIdentifier,
              },
            },

            {
              new:
                true,
            }
          );


      return res
        .status(200)
        .json({
          success:
            true,

          message:
            "Book access revoked successfully.",


          data: {

            orderId:
              updatedOrder
                .orderId ||

              String(
                updatedOrder._id
              ),


            mongoOrderId:
              updatedOrder._id,


            revokedAt:
              now,


            access: {

              revoked:
                true,

              expiresAt:
                updatedOrder
                  .access
                  ?.expiresAt ||
                null,

              generatedAt:
                updatedOrder
                  .access
                  ?.generatedAt ||
                null,

              lastAccessedAt:
                updatedOrder
                  .access
                  ?.lastAccessedAt ||
                null,

              accessCount:
                Number(
                  updatedOrder
                    .access
                    ?.accessCount ||
                  0
                ),
            },
          },
        });

    } catch (
      error
    ) {

      console.error(
        "revokeBookAccess error:",
        error
      );


      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Something went wrong while revoking book access.",
        });
    }
  };


/* =========================================================
   EXTEND / REACTIVATE BOOK ACCESS
========================================================= */

/*
 * Request body:
 *
 * {
 *   "hours": 24
 * }
 *
 *
 * IMPORTANT:
 *
 * New expiry =
 *
 * CURRENT TIME + HOURS
 *
 *
 * Example:
 *
 * current:
 * 10:00 AM
 *
 * hours:
 * 5
 *
 * expiry:
 * 3:00 PM
 *
 *
 * NOT:
 *
 * previous expiry + 5 hours
 */
const extendBookAccess =
  async (
    req,
    res
  ) => {

    try {

      const {
        orderId,
      } =
        req.params;


      const hours =
        Number(
          req.body
            ?.hours
        );


      if (!orderId) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Order ID is required.",
          });
      }


      /*
       * Only allow positive
       * integer values.
       *
       * 1
       * 2
       * 5
       * 12
       * 24
       * 48
       * etc.
       */
      if (
        !Number.isFinite(
          hours
        ) ||

        !Number.isInteger(
          hours
        ) ||

        hours <= 0
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "hours must be a positive integer.",
          });
      }


      const order =
        await Order
          .findOne(
            getOrderQuery(
              orderId
            )
          );


      if (!order) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Order not found.",
          });
      }


      /*
       * IMPORTANT:
       *
       * We require tokenHash.
       *
       * We DON'T require access.url.
       *
       * Older orders may not have
       * access.url stored but their
       * original email URL can still
       * work.
       */
      if (
        !order.access
          ?.tokenHash
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "No existing book access token is available for this order. Generate/send an access link first.",
          });
      }


      const now =
        new Date();


      /*
       * CURRENT TIME + HOURS
       */
      const newExpiresAt =
        new Date(
          now.getTime() +

          hours *
          60 *
          60 *
          1000
        );


      const previousExpiresAt =
        order.access
          ?.expiresAt ||
        null;


      const wasRevoked =
        order.access
          ?.revoked ===
        true;


      const adminIdentifier =
        String(
          getAdminIdentifier(
            req
          )
        );


      /*
       * DO NOT CHANGE:
       *
       * tokenHash
       * url
       * generatedAt
       * accessCount
       * lastAccessedAt
       *
       *
       * ONLY CHANGE:
       *
       * expiresAt
       * revoked
       */
      const updatedOrder =
        await Order
          .findByIdAndUpdate(
            order._id,

            {
              $set: {

                "access.expiresAt":
                  newExpiresAt,

                /*
                 * Reactivate same token.
                 */
                "access.revoked":
                  false,

                updatedBy:
                  adminIdentifier,
              },
            },

            {
              new:
                true,
            }
          );


      return res
        .status(200)
        .json({
          success:
            true,


          message:
            wasRevoked

              ? (
                  `Book access reactivated for ` +
                  `${hours} hour` +
                  `${hours === 1 ? "" : "s"} ` +
                  `from the current time.`
                )

              : (
                  `Book access extended for ` +
                  `${hours} hour` +
                  `${hours === 1 ? "" : "s"} ` +
                  `from the current time.`
                ),


          data: {

            orderId:
              updatedOrder
                .orderId ||

              String(
                updatedOrder._id
              ),


            mongoOrderId:
              updatedOrder._id,


            hoursAddedFromNow:
              hours,


            previousExpiresAt,


            extendedAt:
              now,


            access: {

              revoked:
                false,

              expiresAt:
                updatedOrder
                  .access
                  ?.expiresAt ||

                newExpiresAt,

              generatedAt:
                updatedOrder
                  .access
                  ?.generatedAt ||
                null,

              lastAccessedAt:
                updatedOrder
                  .access
                  ?.lastAccessedAt ||
                null,

              accessCount:
                Number(
                  updatedOrder
                    .access
                    ?.accessCount ||
                  0
                ),
            },
          },
        });

    } catch (
      error
    ) {

      console.error(
        "extendBookAccess error:",
        error
      );


      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Something went wrong while extending book access.",
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