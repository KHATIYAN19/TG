// import React, {
//   useEffect,
//   useState,
// } from "react";

// import {
//   X,
//   User,
//   Mail,
//   Phone,
//   LockKeyhole,
//   Loader2,
//   CreditCard,
//   ShieldCheck,
//   Tag,
//   CheckCircle2,
//   Percent,
// } from "lucide-react";

// const BASE_URL =
//   import.meta.env.VITE_BASE_URL ||
//   "https://target-trek.onrender.com";

// export default function PayUCheckoutModal({
//   isOpen,
//   onClose,
//   product,
// }) {
//   const [formData, setFormData] =
//     useState({
//       firstname: "",
//       email: "",
//       phone: "",
//     });

//   const [errors, setErrors] =
//     useState({});

//   const [
//     paymentLoading,
//     setPaymentLoading,
//   ] = useState(false);

//   const [
//     serverError,
//     setServerError,
//   ] = useState("");

//   // Coupon states
//   const [
//     showCouponInput,
//     setShowCouponInput,
//   ] = useState(false);

//   const [
//     couponCode,
//     setCouponCode,
//   ] = useState("");

//   const [
//     couponLoading,
//     setCouponLoading,
//   ] = useState(false);

//   const [
//     couponError,
//     setCouponError,
//   ] = useState("");

//   const [
//     appliedCoupon,
//     setAppliedCoupon,
//   ] = useState(null);

//   // --------------------------------------------------
//   // Pricing
//   // --------------------------------------------------

//   const originalAmount =
//     Number(product?.price || 0);

//   const discountAmount =
//     Number(
//       appliedCoupon?.discountAmount ||
//         0
//     );

//   const finalAmount =
//     appliedCoupon
//       ? Number(
//           appliedCoupon.finalAmount
//         )
//       : originalAmount;

//   // --------------------------------------------------
//   // Reset coupon when modal closes
//   // --------------------------------------------------

//   useEffect(() => {
//     if (!isOpen) {
//       setShowCouponInput(false);
//       setCouponCode("");
//       setCouponError("");
//       setAppliedCoupon(null);
//       setCouponLoading(false);
//       setServerError("");
//     }
//   }, [isOpen]);

//   // --------------------------------------------------
//   // Lock background scroll
//   // --------------------------------------------------

//   useEffect(() => {
//     if (!isOpen) return;

//     const oldOverflow =
//       document.body.style.overflow;

//     document.body.style.overflow =
//       "hidden";

//     return () => {
//       document.body.style.overflow =
//         oldOverflow;
//     };
//   }, [isOpen]);

//   // --------------------------------------------------
//   // ESC closes modal
//   // --------------------------------------------------

//   useEffect(() => {
//     if (!isOpen) return;

//     const handleEscape = (
//       event
//     ) => {
//       if (
//         event.key === "Escape" &&
//         !paymentLoading &&
//         !couponLoading
//       ) {
//         onClose();
//       }
//     };

//     window.addEventListener(
//       "keydown",
//       handleEscape
//     );

//     return () => {
//       window.removeEventListener(
//         "keydown",
//         handleEscape
//       );
//     };
//   }, [
//     isOpen,
//     onClose,
//     paymentLoading,
//     couponLoading,
//   ]);

//   // --------------------------------------------------
//   // Format money
//   // --------------------------------------------------

//   const formatMoney = (
//     amount
//   ) => {
//     try {
//       return new Intl.NumberFormat(
//         "en-IN",
//         {
//           style: "currency",

//           currency:
//             product?.currency ||
//             "INR",

//           maximumFractionDigits:
//             2,
//         }
//       ).format(
//         Number(amount || 0)
//       );
//     } catch {
//       return `₹${Number(
//         amount || 0
//       )}`;
//     }
//   };

//   // --------------------------------------------------
//   // Input change
//   // --------------------------------------------------

//   const handleChange = (
//     event
//   ) => {
//     const {
//       name,
//       value,
//     } = event.target;

//     let finalValue = value;

//     if (name === "phone") {
//       finalValue = value
//         .replace(/\D/g, "")
//         .slice(0, 10);
//     }

//     setFormData(
//       (prev) => ({
//         ...prev,
//         [name]:
//           finalValue,
//       })
//     );

//     setErrors(
//       (prev) => ({
//         ...prev,
//         [name]: "",
//       })
//     );

//     setServerError("");

//     /*
//      * Per-user coupon validation can depend
//      * on email.
//      *
//      * If email changes after coupon was
//      * validated, require re-validation.
//      */
//     if (
//       name === "email" &&
//       appliedCoupon
//     ) {
//       setAppliedCoupon(null);

//       setCouponError(
//         "Email changed. Please apply the coupon again."
//       );
//     }
//   };

//   // --------------------------------------------------
//   // Coupon input
//   // --------------------------------------------------

//   const handleCouponChange = (
//     event
//   ) => {
//     const value =
//       event.target.value
//         .toUpperCase()
//         .replace(/\s+/g, "");

//     setCouponCode(value);

//     setCouponError("");

//     /*
//      * If user modifies an already applied
//      * code, remove the old discount.
//      */
//     if (appliedCoupon) {
//       setAppliedCoupon(null);
//     }
//   };

//   // --------------------------------------------------
//   // Apply coupon
//   // --------------------------------------------------

//   const handleApplyCoupon =
//     async () => {
//       const normalizedCode =
//         couponCode
//           .trim()
//           .toUpperCase();

//       if (!normalizedCode) {
//         return;
//       }

//       if (!product?._id) {
//         setCouponError(
//           "Book information is unavailable."
//         );

//         return;
//       }

//       try {
//         setCouponLoading(true);
//         setCouponError("");
//         setAppliedCoupon(null);
//         setServerError("");

//         const response =
//           await fetch(
//             `${BASE_URL}/api/coupon/validate`,
//             {
//               method: "POST",

//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },

//               body:
//                 JSON.stringify({
//                   couponCode:
//                     normalizedCode,

//                   bookId:
//                     product._id,

//                   email:
//                     formData.email
//                       .trim()
//                       .toLowerCase() ||
//                     null,
//                 }),
//             }
//           );

//         const result =
//           await response
//             .json()
//             .catch(
//               () => null
//             );

//         if (
//           !response.ok ||
//           !result?.success
//         ) {
//           throw new Error(
//             result?.message ||
//               "Unable to apply coupon."
//           );
//         }

//         setAppliedCoupon(
//           result.data
//         );

//         setCouponCode(
//           result.data
//             ?.couponCode ||
//             normalizedCode
//         );

//         setCouponError("");
//       } catch (error) {
//         console.error(
//           "Coupon validation error:",
//           error
//         );

//         setAppliedCoupon(null);

//         setCouponError(
//           error?.message ||
//             "Unable to apply coupon."
//         );
//       } finally {
//         setCouponLoading(false);
//       }
//     };

//   // --------------------------------------------------
//   // Remove coupon
//   // --------------------------------------------------

//   const handleRemoveCoupon =
//     () => {
//       setAppliedCoupon(null);

//       setCouponCode("");

//       setCouponError("");

//       setShowCouponInput(
//         false
//       );
//     };

//   // --------------------------------------------------
//   // Form validation
//   // --------------------------------------------------

//   const validateForm = () => {
//     const newErrors = {};

//     if (
//       !formData.firstname.trim()
//     ) {
//       newErrors.firstname =
//         "Please enter your name.";
//     }

//     if (
//       !formData.email.trim()
//     ) {
//       newErrors.email =
//         "Please enter your email.";
//     } else {
//       const emailRegex =
//         /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//       if (
//         !emailRegex.test(
//           formData.email.trim()
//         )
//       ) {
//         newErrors.email =
//           "Please enter a valid email.";
//       }
//     }

//     if (
//       !formData.phone.trim()
//     ) {
//       newErrors.phone =
//         "Please enter your phone number.";
//     } else if (
//       !/^[6-9]\d{9}$/.test(
//         formData.phone
//       )
//     ) {
//       newErrors.phone =
//         "Please enter a valid 10-digit Indian phone number.";
//     }

//     setErrors(newErrors);

//     return (
//       Object.keys(
//         newErrors
//       ).length === 0
//     );
//   };

//   // --------------------------------------------------
//   // Affiliate
//   // --------------------------------------------------

//   const getAffiliateCode =
//     () => {
//       try {
//         const affiliateCode =
//           localStorage.getItem(
//             "referralCode"
//           );

//         if (!affiliateCode) {
//           return "tt";
//         }

//         return affiliateCode
//           .trim()
//           .toLowerCase();
//       } catch (error) {
//         console.error(
//           "Unable to read affiliate code:",
//           error
//         );

//         return "tt";
//       }
//     };

//   // --------------------------------------------------
//   // Submit PayU form
//   // --------------------------------------------------

//   const submitToPayU = (
//     paymentUrl,
//     paymentData
//   ) => {
//     if (
//       !paymentUrl ||
//       !paymentData
//     ) {
//       throw new Error(
//         "Invalid PayU payment response."
//       );
//     }

//     const form =
//       document.createElement(
//         "form"
//       );

//     form.method = "POST";

//     form.action =
//       paymentUrl;

//     form.style.display =
//       "none";

//     Object.entries(
//       paymentData
//     ).forEach(
//       ([key, value]) => {
//         const input =
//           document.createElement(
//             "input"
//           );

//         input.type =
//           "hidden";

//         input.name =
//           key;

//         input.value =
//           value ?? "";

//         form.appendChild(
//           input
//         );
//       }
//     );

//     document.body.appendChild(
//       form
//     );

//     form.submit();
//   };

//   // --------------------------------------------------
//   // Payment
//   // --------------------------------------------------

//   const handlePayment =
//     async (event) => {
//       event.preventDefault();

//       if (!validateForm()) {
//         return;
//       }

//       if (!product?._id) {
//         setServerError(
//           "Book information is unavailable. Please refresh the page."
//         );

//         return;
//       }

//       try {
//         setPaymentLoading(true);

//         setServerError("");

//         const affiliateCode =
//           getAffiliateCode();

//         const params =
//           new URLSearchParams(
//             window.location.search
//           );

//         /*
//          * IMPORTANT:
//          *
//          * Only send couponCode if it was
//          * successfully validated.
//          *
//          * Backend will validate it AGAIN
//          * before creating PayU payment.
//          */
//         const validatedCouponCode =
//           appliedCoupon
//             ? couponCode
//                 .trim()
//                 .toUpperCase()
//             : null;

//         const response =
//           await fetch(
//             `${BASE_URL}/payment/payu/create`,
//             {
//               method:
//                 "POST",

//               headers: {
//                 "Content-Type":
//                   "application/json",
//               },

//               body:
//                 JSON.stringify({
//                   bookId:
//                     product._id,

//                   firstname:
//                     formData.firstname.trim(),

//                   email:
//                     formData.email
//                       .trim()
//                       .toLowerCase(),

//                   phone:
//                     formData.phone.trim(),

//                   couponCode:
//                     validatedCouponCode,

//                   affiliateCode,

//                   utmSource:
//                     params.get(
//                       "utm_source"
//                     ) ||
//                     null,

//                   utmMedium:
//                     params.get(
//                       "utm_medium"
//                     ) ||
//                     null,

//                   utmCampaign:
//                     params.get(
//                       "utm_campaign"
//                     ) ||
//                     null,
//                 }),
//             }
//           );

//         const result =
//           await response
//             .json()
//             .catch(
//               () => null
//             );

//         if (
//           !response.ok ||
//           !result?.success
//         ) {
//           throw new Error(
//             result?.message ||
//               "Unable to start payment."
//           );
//         }

//         const paymentUrl =
//           result?.data
//             ?.paymentUrl;

//         const paymentData =
//           result?.data
//             ?.paymentData;

//         if (
//           !paymentUrl ||
//           !paymentData
//         ) {
//           throw new Error(
//             "Invalid payment information received from server."
//           );
//         }

//         /*
//          * Backend may have revalidated
//          * coupon and recalculated amount.
//          *
//          * paymentData.amount from backend
//          * is authoritative.
//          */

//         submitToPayU(
//           paymentUrl,
//           paymentData
//         );
//       } catch (error) {
//         console.error(
//           "PayU payment error:",
//           error
//         );

//         setServerError(
//           error?.message ||
//             "Unable to start payment. Please try again."
//         );

//         setPaymentLoading(
//           false
//         );
//       }
//     };

//   if (!isOpen) {
//     return null;
//   }

//   return (
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">

//       {/* Overlay */}
//       <button
//         type="button"
//         aria-label="Close checkout"
//         disabled={
//           paymentLoading ||
//           couponLoading
//         }
//         onClick={() => {
//           if (
//             !paymentLoading &&
//             !couponLoading
//           ) {
//             onClose();
//           }
//         }}
//         className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-sm"
//       />


//       {/* Modal */}
//       <div className="relative z-10 max-h-[95vh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">

//         {/* Header */}
//         <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

//           <div className="flex items-start justify-between gap-4">

//             <div>

//               <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">

//                 <ShieldCheck
//                   size={14}
//                 />

//                 Secure Checkout

//               </div>


//               <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
//                 Complete your purchase
//               </h2>


//               <p className="mt-1 text-sm text-slate-500">
//                 Enter your details to continue to PayU.
//               </p>

//             </div>


//             <button
//               type="button"
//               disabled={
//                 paymentLoading ||
//                 couponLoading
//               }
//               onClick={
//                 onClose
//               }
//               className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               <X
//                 size={18}
//               />
//             </button>

//           </div>

//         </div>


//         {/* Product */}
//         <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">

//           <div className="flex items-center gap-4">

//             {product?.coverPageUrl && (
//               <img
//                 src={
//                   product.coverPageUrl
//                 }
//                 alt={
//                   product.title
//                 }
//                 className="h-16 w-12 shrink-0 rounded-lg border border-slate-200 object-cover shadow-sm"
//               />
//             )}


//             <div className="min-w-0 flex-1">

//               <p className="line-clamp-2 text-sm font-bold text-slate-900">
//                 {product?.title ||
//                   "Target Trek Ebook"}
//               </p>


//               <div className="mt-1 flex flex-wrap items-center gap-2">

//                 {appliedCoupon ? (
//                   <>
//                     <span className="text-lg font-black text-blue-600">
//                       {formatMoney(
//                         finalAmount
//                       )}
//                     </span>

//                     <span className="text-xs text-slate-400 line-through">
//                       {formatMoney(
//                         originalAmount
//                       )}
//                     </span>

//                     <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
//                       Coupon Applied
//                     </span>
//                   </>
//                 ) : (
//                   <>
//                     <span className="text-lg font-black text-blue-600">
//                       {formatMoney(
//                         product?.price
//                       )}
//                     </span>

//                     {Number(
//                       product?.mrp
//                     ) >
//                       Number(
//                         product?.price
//                       ) && (
//                       <span className="text-xs text-slate-400 line-through">
//                         {formatMoney(
//                           product?.mrp
//                         )}
//                       </span>
//                     )}
//                   </>
//                 )}

//               </div>

//             </div>

//           </div>

//         </div>


//         {/* Form */}
//         <form
//           onSubmit={
//             handlePayment
//           }
//           className="space-y-4 px-5 py-5 sm:px-6 sm:py-6"
//         >

//           {/* Name */}
//           <div>

//             <label
//               htmlFor="checkout-name"
//               className="mb-1.5 block text-sm font-bold text-slate-700"
//             >
//               Full Name
//             </label>


//             <div className="relative">

//               <User
//                 size={18}
//                 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
//               />


//               <input
//                 id="checkout-name"
//                 type="text"
//                 name="firstname"
//                 autoComplete="name"
//                 value={
//                   formData.firstname
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 disabled={
//                   paymentLoading
//                 }
//                 placeholder="Enter your full name"
//                 className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
//                   errors.firstname
//                     ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
//                     : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
//                 }`}
//               />

//             </div>


//             {errors.firstname && (
//               <p className="mt-1.5 text-xs font-medium text-red-600">
//                 {
//                   errors.firstname
//                 }
//               </p>
//             )}

//           </div>


//           {/* Email */}
//           <div>

//             <label
//               htmlFor="checkout-email"
//               className="mb-1.5 block text-sm font-bold text-slate-700"
//             >
//               Email
//             </label>


//             <div className="relative">

//               <Mail
//                 size={18}
//                 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
//               />


//               <input
//                 id="checkout-email"
//                 type="email"
//                 name="email"
//                 autoComplete="email"
//                 value={
//                   formData.email
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 disabled={
//                   paymentLoading
//                 }
//                 placeholder="you@example.com"
//                 className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
//                   errors.email
//                     ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
//                     : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
//                 }`}
//               />

//             </div>


//             {errors.email && (
//               <p className="mt-1.5 text-xs font-medium text-red-600">
//                 {
//                   errors.email
//                 }
//               </p>
//             )}

//           </div>


//           {/* Phone */}
//           <div>

//             <label
//               htmlFor="checkout-phone"
//               className="mb-1.5 block text-sm font-bold text-slate-700"
//             >
//               Phone Number
//             </label>


//             <div className="relative">

//               <Phone
//                 size={18}
//                 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
//               />


//               <input
//                 id="checkout-phone"
//                 type="tel"
//                 inputMode="numeric"
//                 name="phone"
//                 autoComplete="tel"
//                 value={
//                   formData.phone
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 disabled={
//                   paymentLoading
//                 }
//                 placeholder="9876543210"
//                 className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
//                   errors.phone
//                     ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
//                     : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
//                 }`}
//               />

//             </div>


//             {errors.phone && (
//               <p className="mt-1.5 text-xs font-medium text-red-600">
//                 {
//                   errors.phone
//                 }
//               </p>
//             )}

//           </div>


//           {/* Coupon */}
//           <div className="border-t border-slate-100 pt-1">

//             {!showCouponInput &&
//             !appliedCoupon ? (
//               <button
//                 type="button"
//                 disabled={
//                   paymentLoading
//                 }
//                 onClick={() => {
//                   setShowCouponInput(
//                     true
//                   );

//                   setCouponError(
//                     ""
//                   );
//                 }}
//                 className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 transition hover:text-blue-700"
//               >
//                 <Tag
//                   size={15}
//                 />

//                 Have a coupon?
//               </button>
//             ) : (
//               <div>

//                 {!appliedCoupon && (
//                   <>
//                     <label
//                       htmlFor="coupon-code"
//                       className="mb-1.5 block text-sm font-bold text-slate-700"
//                     >
//                       Coupon Code
//                     </label>


//                     <div className="flex gap-2">

//                       <div className="relative flex-1">

//                         <Tag
//                           size={17}
//                           className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
//                         />


//                         <input
//                           id="coupon-code"
//                           type="text"
//                           value={
//                             couponCode
//                           }
//                           onChange={
//                             handleCouponChange
//                           }
//                           onKeyDown={(
//                             event
//                           ) => {
//                             if (
//                               event.key ===
//                                 "Enter" &&
//                               couponCode.trim() &&
//                               !couponLoading
//                             ) {
//                               event.preventDefault();

//                               handleApplyCoupon();
//                             }
//                           }}
//                           disabled={
//                             paymentLoading ||
//                             couponLoading
//                           }
//                           placeholder="Enter coupon code"
//                           className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm font-bold uppercase tracking-wide text-slate-900 outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 ${
//                             couponError
//                               ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
//                               : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
//                           }`}
//                         />

//                       </div>


//                       <button
//                         type="button"
//                         disabled={
//                           !couponCode.trim() ||
//                           couponLoading ||
//                           paymentLoading
//                         }
//                         onClick={
//                           handleApplyCoupon
//                         }
//                         className="min-w-[88px] rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
//                       >
//                         {couponLoading ? (
//                           <Loader2
//                             size={17}
//                             className="mx-auto animate-spin"
//                           />
//                         ) : (
//                           "Apply"
//                         )}
//                       </button>

//                     </div>
//                   </>
//                 )}


//                 {/* Coupon error */}
//                 {couponError &&
//                   !appliedCoupon && (
//                     <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">

//                       <p className="text-xs font-semibold text-red-700">
//                         {
//                           couponError
//                         }
//                       </p>

//                     </div>
//                   )}


//                 {/* Coupon success */}
//                 {appliedCoupon && (
//                   <div className="rounded-xl border border-green-200 bg-green-50 p-3.5">

//                     <div className="flex items-start justify-between gap-3">

//                       <div className="flex gap-2.5">

//                         <CheckCircle2
//                           size={19}
//                           className="mt-0.5 shrink-0 text-green-600"
//                         />


//                         <div>

//                           <div className="flex flex-wrap items-center gap-2">

//                             <p className="text-sm font-black text-green-800">
//                               {
//                                 appliedCoupon.couponCode
//                               }
//                             </p>


//                             <span className="rounded-full bg-green-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-green-800">
//                               Applied
//                             </span>

//                           </div>


//                           {appliedCoupon.couponName && (
//                             <p className="mt-0.5 text-xs font-medium text-green-700">
//                               {
//                                 appliedCoupon.couponName
//                               }
//                             </p>
//                           )}


//                           <p className="mt-1 text-xs font-bold text-green-700">
//                             You saved{" "}
//                             {formatMoney(
//                               appliedCoupon.discountAmount
//                             )}
//                           </p>

//                         </div>

//                       </div>


//                       <button
//                         type="button"
//                         disabled={
//                           paymentLoading
//                         }
//                         onClick={
//                           handleRemoveCoupon
//                         }
//                         className="text-xs font-bold text-red-500 transition hover:text-red-600"
//                       >
//                         Remove
//                       </button>

//                     </div>

//                   </div>
//                 )}

//               </div>
//             )}

//           </div>


//           {/* Price breakdown */}
//           {appliedCoupon && (
//             <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

//               <div className="flex items-center justify-between text-sm">

//                 <span className="text-slate-500">
//                   Price
//                 </span>

//                 <span className="font-semibold text-slate-700">
//                   {formatMoney(
//                     originalAmount
//                   )}
//                 </span>

//               </div>


//               <div className="mt-2 flex items-center justify-between text-sm">

//                 <div className="flex items-center gap-1.5 text-green-600">

//                   <Percent
//                     size={14}
//                   />

//                   <span className="font-semibold">
//                     Coupon{" "}
//                     {
//                       appliedCoupon.couponCode
//                     }
//                   </span>

//                 </div>


//                 <span className="font-bold text-green-600">
//                   -
//                   {formatMoney(
//                     discountAmount
//                   )}
//                 </span>

//               </div>


//               <div className="my-3 border-t border-dashed border-slate-300" />


//               <div className="flex items-center justify-between">

//                 <span className="text-sm font-black text-slate-900">
//                   Final Amount
//                 </span>

//                 <span className="text-xl font-black text-blue-600">
//                   {formatMoney(
//                     finalAmount
//                   )}
//                 </span>

//               </div>

//             </div>
//           )}


//           {/* Server error */}
//           {serverError && (
//             <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">

//               <p className="text-sm font-medium text-red-700">
//                 {
//                   serverError
//                 }
//               </p>

//             </div>
//           )}


//           {/* Pay button */}
//           <button
//             type="submit"
//             disabled={
//               paymentLoading ||
//               couponLoading
//             }
//             className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//           >

//             {paymentLoading ? (
//               <>
//                 <Loader2
//                   size={18}
//                   className="animate-spin"
//                 />

//                 Connecting to PayU...
//               </>
//             ) : (
//               <>
//                 <CreditCard
//                   size={18}
//                 />

//                 Pay{" "}
//                 {formatMoney(
//                   finalAmount
//                 )}
//               </>
//             )}

//           </button>


//           <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">

//             <LockKeyhole
//               size={13}
//             />

//             Payment securely processed by PayU

//           </div>

//         </form>

//       </div>

//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  LockKeyhole,
  Loader2,
  CreditCard,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Percent,
} from "lucide-react";

const BASE_URL =
  import.meta.env.VITE_BASE_URL || "https://target-trek.onrender.com";

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export default function PayUCheckoutModal({
  isOpen,
  onClose,
  product,
}) {
  const [theme, setTheme] = useState(getStoredTheme);

  const [formData, setFormData] = useState({
    firstname: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const isDark = theme === "dark";

  const originalAmount = Number(product?.price || 0);

  const discountAmount = Number(
    appliedCoupon?.discountAmount || 0
  );

  const finalAmount = appliedCoupon
    ? Number(appliedCoupon.finalAmount)
    : originalAmount;

  useEffect(() => {
    if (!isOpen) {
      setShowCouponInput(false);
      setCouponCode("");
      setCouponError("");
      setAppliedCoupon(null);
      setCouponLoading(false);
      setServerError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const syncTheme = () => {
      setTheme(getStoredTheme());
    };

    syncTheme();

    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        !paymentLoading &&
        !couponLoading
      ) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    isOpen,
    onClose,
    paymentLoading,
    couponLoading,
  ]);

  const formatMoney = (amount) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: product?.currency || "INR",
        maximumFractionDigits: 2,
      }).format(Number(amount || 0));
    } catch {
      return `₹${Number(amount || 0)}`;
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    let finalValue = value;

    if (name === "phone") {
      finalValue = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");

    if (
      name === "email" &&
      appliedCoupon
    ) {
      setAppliedCoupon(null);

      setCouponError(
        "Email changed. Please apply the coupon again."
      );
    }
  };

  const handleCouponChange = (event) => {
    const value = event.target.value
      .toUpperCase()
      .replace(/\s+/g, "");

    setCouponCode(value);
    setCouponError("");

    if (appliedCoupon) {
      setAppliedCoupon(null);
    }
  };

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCode
      .trim()
      .toUpperCase();

    if (!normalizedCode) {
      return;
    }

    if (!product?._id) {
      setCouponError(
        "Book information is unavailable."
      );

      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");
      setAppliedCoupon(null);
      setServerError("");

      const response = await fetch(
        `${BASE_URL}/api/coupon/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            couponCode: normalizedCode,
            bookId: product._id,
            email:
              formData.email
                .trim()
                .toLowerCase() || null,
          }),
        }
      );

      const result = await response
        .json()
        .catch(() => null);

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Unable to apply coupon."
        );
      }

      setAppliedCoupon(result.data);

      setCouponCode(
        result.data?.couponCode ||
          normalizedCode
      );

      setCouponError("");
    } catch (error) {
      console.error(
        "Coupon validation error:",
        error
      );

      setAppliedCoupon(null);

      setCouponError(
        error?.message ||
          "Unable to apply coupon."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setShowCouponInput(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname =
        "Please enter your name.";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Please enter your email.";
    } else {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          formData.email.trim()
        )
      ) {
        newErrors.email =
          "Please enter a valid email.";
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Please enter your phone number.";
    } else if (
      !/^[6-9]\d{9}$/.test(
        formData.phone
      )
    ) {
      newErrors.phone =
        "Please enter a valid 10-digit Indian phone number.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const getAffiliateCode = () => {
    try {
      const affiliateCode =
        localStorage.getItem(
          "referralCode"
        );

      if (!affiliateCode) {
        return "tt";
      }

      return affiliateCode
        .trim()
        .toLowerCase();
    } catch (error) {
      console.error(
        "Unable to read affiliate code:",
        error
      );

      return "tt";
    }
  };

  const submitToPayU = (
    paymentUrl,
    paymentData
  ) => {
    if (!paymentUrl || !paymentData) {
      throw new Error(
        "Invalid PayU payment response."
      );
    }

    const form =
      document.createElement("form");

    form.method = "POST";
    form.action = paymentUrl;
    form.style.display = "none";

    Object.entries(paymentData).forEach(
      ([key, value]) => {
        const input =
          document.createElement(
            "input"
          );

        input.type = "hidden";
        input.name = key;
        input.value = value ?? "";

        form.appendChild(input);
      }
    );

    document.body.appendChild(form);

    form.submit();
  };

  const handlePayment = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!product?._id) {
      setServerError(
        "Book information is unavailable. Please refresh the page."
      );

      return;
    }

    try {
      setPaymentLoading(true);
      setServerError("");

      const affiliateCode =
        getAffiliateCode();

      const params =
        new URLSearchParams(
          window.location.search
        );

      const validatedCouponCode =
        appliedCoupon
          ? couponCode
              .trim()
              .toUpperCase()
          : null;

      const response = await fetch(
        `${BASE_URL}/payment/payu/create`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            bookId: product._id,
            firstname:
              formData.firstname.trim(),
            email: formData.email
              .trim()
              .toLowerCase(),
            phone: formData.phone.trim(),
            couponCode:
              validatedCouponCode,
            affiliateCode,
            utmSource:
              params.get("utm_source") ||
              null,
            utmMedium:
              params.get("utm_medium") ||
              null,
            utmCampaign:
              params.get(
                "utm_campaign"
              ) || null,
          }),
        }
      );

      const result = await response
        .json()
        .catch(() => null);

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Unable to start payment."
        );
      }

      const paymentUrl =
        result?.data?.paymentUrl;

      const paymentData =
        result?.data?.paymentData;

      if (
        !paymentUrl ||
        !paymentData
      ) {
        throw new Error(
          "Invalid payment information received from server."
        );
      }

      submitToPayU(
        paymentUrl,
        paymentData
      );
    } catch (error) {
      console.error(
        "PayU payment error:",
        error
      );

      setServerError(
        error?.message ||
          "Unable to start payment. Please try again."
      );

      setPaymentLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6">
      <button
        type="button"
        aria-label="Close checkout"
        disabled={
          paymentLoading ||
          couponLoading
        }
        onClick={() => {
          if (
            !paymentLoading &&
            !couponLoading
          ) {
            onClose();
          }
        }}
        className={`absolute inset-0 cursor-default backdrop-blur-sm transition-colors ${
          isDark
            ? "bg-black/70"
            : "bg-slate-950/50"
        }`}
      />

      <div
        className={`relative z-10 w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border shadow-2xl transition-colors sm:rounded-3xl ${
          isDark
            ? "border-slate-700/80 bg-slate-900 shadow-black/50"
            : "border-slate-200 bg-white shadow-slate-950/20"
        } max-h-[calc(100dvh-1rem)] sm:max-h-[95vh]`}
      >
        <div
          className={`border-b px-4 py-4 transition-colors sm:px-6 sm:py-5 ${
            isDark
              ? "border-slate-800"
              : "border-slate-100"
          }`}
        >
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <div
                className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold sm:gap-2 sm:px-3 sm:text-xs ${
                  isDark
                    ? "bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-400/20"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                <ShieldCheck
                  size={14}
                  className="shrink-0"
                />
                Secure Checkout
              </div>

              <h2
                className={`text-lg font-black leading-tight sm:text-2xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-950"
                }`}
              >
                Complete your purchase
              </h2>

              <p
                className={`mt-1 text-xs leading-relaxed sm:text-sm ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Enter your details to
                continue to PayU.
              </p>
            </div>

            <button
              type="button"
              aria-label="Close checkout modal"
              disabled={
                paymentLoading ||
                couponLoading
              }
              onClick={onClose}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isDark
                  ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div
          className={`border-b px-4 py-3.5 transition-colors sm:px-6 sm:py-4 ${
            isDark
              ? "border-slate-800 bg-slate-950/40"
              : "border-slate-100 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {product?.coverPageUrl && (
              <img
                src={
                  product.coverPageUrl
                }
                alt={
                  product.title ||
                  "Target Trek Ebook"
                }
                className={`h-16 w-12 shrink-0 rounded-lg border object-cover shadow-sm sm:h-[72px] sm:w-[54px] ${
                  isDark
                    ? "border-slate-700"
                    : "border-slate-200"
                }`}
              />
            )}

            <div className="min-w-0 flex-1">
              <p
                className={`line-clamp-2 text-sm font-bold leading-snug ${
                  isDark
                    ? "text-slate-100"
                    : "text-slate-900"
                }`}
              >
                {product?.title ||
                  "Target Trek Ebook"}
              </p>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                {appliedCoupon ? (
                  <>
                    <span
                      className={`text-lg font-black ${
                        isDark
                          ? "text-blue-400"
                          : "text-blue-600"
                      }`}
                    >
                      {formatMoney(
                        finalAmount
                      )}
                    </span>

                    <span
                      className={`text-xs line-through ${
                        isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      {formatMoney(
                        originalAmount
                      )}
                    </span>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isDark
                          ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-400/20"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      Coupon Applied
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={`text-lg font-black ${
                        isDark
                          ? "text-blue-400"
                          : "text-blue-600"
                      }`}
                    >
                      {formatMoney(
                        product?.price
                      )}
                    </span>

                    {Number(
                      product?.mrp
                    ) >
                      Number(
                        product?.price
                      ) && (
                      <span
                        className={`text-xs line-through ${
                          isDark
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        {formatMoney(
                          product?.mrp
                        )}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handlePayment}
          className="space-y-3.5 px-4 py-4 sm:space-y-4 sm:px-6 sm:py-6"
        >
          <div>
            <label
              htmlFor="checkout-name"
              className={`mb-1.5 block text-sm font-bold ${
                isDark
                  ? "text-slate-300"
                  : "text-slate-700"
              }`}
            >
              Full Name
            </label>

            <div className="relative">
              <User
                size={18}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  errors.firstname
                    ? "text-red-400"
                    : isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                }`}
              />

              <input
                id="checkout-name"
                type="text"
                name="firstname"
                autoComplete="name"
                value={
                  formData.firstname
                }
                onChange={handleChange}
                disabled={
                  paymentLoading
                }
                placeholder="Enter your full name"
                className={`w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm outline-none transition sm:py-3 ${
                  isDark
                    ? "bg-slate-950 text-slate-100 placeholder:text-slate-600"
                    : "bg-white text-slate-900 placeholder:text-slate-400"
                } ${
                  errors.firstname
                    ? isDark
                      ? "border-red-500 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
                      : "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                    : isDark
                      ? "border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              />
            </div>

            {errors.firstname && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors.firstname}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="checkout-email"
              className={`mb-1.5 block text-sm font-bold ${
                isDark
                  ? "text-slate-300"
                  : "text-slate-700"
              }`}
            >
              Email
            </label>

            <div className="relative">
              <Mail
                size={18}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  errors.email
                    ? "text-red-400"
                    : isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                }`}
              />

              <input
                id="checkout-email"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={
                  paymentLoading
                }
                placeholder="you@example.com"
                className={`w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm outline-none transition sm:py-3 ${
                  isDark
                    ? "bg-slate-950 text-slate-100 placeholder:text-slate-600"
                    : "bg-white text-slate-900 placeholder:text-slate-400"
                } ${
                  errors.email
                    ? isDark
                      ? "border-red-500 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
                      : "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                    : isDark
                      ? "border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              />
            </div>

            {errors.email && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="checkout-phone"
              className={`mb-1.5 block text-sm font-bold ${
                isDark
                  ? "text-slate-300"
                  : "text-slate-700"
              }`}
            >
              Phone Number
            </label>

            <div className="relative">
              <Phone
                size={18}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  errors.phone
                    ? "text-red-400"
                    : isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                }`}
              />

              <input
                id="checkout-phone"
                type="tel"
                inputMode="numeric"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={
                  paymentLoading
                }
                placeholder="9876543210"
                className={`w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm outline-none transition sm:py-3 ${
                  isDark
                    ? "bg-slate-950 text-slate-100 placeholder:text-slate-600"
                    : "bg-white text-slate-900 placeholder:text-slate-400"
                } ${
                  errors.phone
                    ? isDark
                      ? "border-red-500 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
                      : "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                    : isDark
                      ? "border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              />
            </div>

            {errors.phone && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {errors.phone}
              </p>
            )}
          </div>

          <div
            className={`border-t pt-2 ${
              isDark
                ? "border-slate-800"
                : "border-slate-100"
            }`}
          >
            {!showCouponInput &&
            !appliedCoupon ? (
              <button
                type="button"
                disabled={
                  paymentLoading
                }
                onClick={() => {
                  setShowCouponInput(
                    true
                  );
                  setCouponError("");
                }}
                className={`inline-flex items-center gap-1.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isDark
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                <Tag size={15} />
                Have a coupon?
              </button>
            ) : (
              <div>
                {!appliedCoupon && (
                  <>
                    <label
                      htmlFor="coupon-code"
                      className={`mb-1.5 block text-sm font-bold ${
                        isDark
                          ? "text-slate-300"
                          : "text-slate-700"
                      }`}
                    >
                      Coupon Code
                    </label>

                    <div className="flex gap-2">
                      <div className="relative min-w-0 flex-1">
                        <Tag
                          size={17}
                          className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                            couponError
                              ? "text-red-400"
                              : isDark
                                ? "text-slate-500"
                                : "text-slate-400"
                          }`}
                        />

                        <input
                          id="coupon-code"
                          type="text"
                          value={
                            couponCode
                          }
                          onChange={
                            handleCouponChange
                          }
                          onKeyDown={(
                            event
                          ) => {
                            if (
                              event.key ===
                                "Enter" &&
                              couponCode.trim() &&
                              !couponLoading
                            ) {
                              event.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          disabled={
                            paymentLoading ||
                            couponLoading
                          }
                          placeholder="Enter coupon code"
                          className={`w-full min-w-0 rounded-xl border py-2.5 pl-10 pr-3 text-sm font-bold uppercase tracking-wide outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal sm:py-3 sm:pr-4 ${
                            isDark
                              ? "bg-slate-950 text-slate-100 placeholder:text-slate-600"
                              : "bg-white text-slate-900 placeholder:text-slate-400"
                          } ${
                            couponError
                              ? isDark
                                ? "border-red-500 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
                                : "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                              : isDark
                                ? "border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        />
                      </div>

                      <button
                        type="button"
                        disabled={
                          !couponCode.trim() ||
                          couponLoading ||
                          paymentLoading
                        }
                        onClick={
                          handleApplyCoupon
                        }
                        className={`min-w-[76px] shrink-0 rounded-xl px-3 py-2.5 text-sm font-bold transition sm:min-w-[88px] sm:px-4 sm:py-3 ${
                          isDark
                            ? "bg-slate-100 text-slate-950 hover:bg-white disabled:bg-slate-800 disabled:text-slate-600"
                            : "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300"
                        } disabled:cursor-not-allowed`}
                      >
                        {couponLoading ? (
                          <Loader2
                            size={17}
                            className="mx-auto animate-spin"
                          />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                  </>
                )}

                {couponError &&
                  !appliedCoupon && (
                    <div
                      className={`mt-2 rounded-lg border px-3 py-2.5 ${
                        isDark
                          ? "border-red-500/30 bg-red-500/10"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold ${
                          isDark
                            ? "text-red-400"
                            : "text-red-700"
                        }`}
                      >
                        {couponError}
                      </p>
                    </div>
                  )}

                {appliedCoupon && (
                  <div
                    className={`rounded-xl border p-3 sm:p-3.5 ${
                      isDark
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-green-200 bg-green-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-2.5">
                        <CheckCircle2
                          size={19}
                          className={`mt-0.5 shrink-0 ${
                            isDark
                              ? "text-emerald-400"
                              : "text-green-600"
                          }`}
                        />

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p
                              className={`break-all text-sm font-black ${
                                isDark
                                  ? "text-emerald-300"
                                  : "text-green-800"
                              }`}
                            >
                              {
                                appliedCoupon.couponCode
                              }
                            </p>

                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                                isDark
                                  ? "bg-emerald-400/15 text-emerald-300"
                                  : "bg-green-200 text-green-800"
                              }`}
                            >
                              Applied
                            </span>
                          </div>

                          {appliedCoupon.couponName && (
                            <p
                              className={`mt-0.5 text-xs font-medium ${
                                isDark
                                  ? "text-emerald-400"
                                  : "text-green-700"
                              }`}
                            >
                              {
                                appliedCoupon.couponName
                              }
                            </p>
                          )}

                          <p
                            className={`mt-1 text-xs font-bold ${
                              isDark
                                ? "text-emerald-400"
                                : "text-green-700"
                            }`}
                          >
                            You saved{" "}
                            {formatMoney(
                              appliedCoupon.discountAmount
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={
                          paymentLoading
                        }
                        onClick={
                          handleRemoveCoupon
                        }
                        className="shrink-0 text-xs font-bold text-red-500 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {appliedCoupon && (
            <div
              className={`rounded-xl border p-3.5 sm:p-4 ${
                isDark
                  ? "border-slate-700 bg-slate-950/70"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <span
                  className={
                    isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }
                >
                  Price
                </span>

                <span
                  className={`font-semibold ${
                    isDark
                      ? "text-slate-300"
                      : "text-slate-700"
                  }`}
                >
                  {formatMoney(
                    originalAmount
                  )}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <div
                  className={`flex min-w-0 items-center gap-1.5 ${
                    isDark
                      ? "text-emerald-400"
                      : "text-green-600"
                  }`}
                >
                  <Percent
                    size={14}
                    className="shrink-0"
                  />

                  <span className="truncate font-semibold">
                    Coupon{" "}
                    {
                      appliedCoupon.couponCode
                    }
                  </span>
                </div>

                <span
                  className={`shrink-0 font-bold ${
                    isDark
                      ? "text-emerald-400"
                      : "text-green-600"
                  }`}
                >
                  -
                  {formatMoney(
                    discountAmount
                  )}
                </span>
              </div>

              <div
                className={`my-3 border-t border-dashed ${
                  isDark
                    ? "border-slate-700"
                    : "border-slate-300"
                }`}
              />

              <div className="flex items-center justify-between gap-3">
                <span
                  className={`text-sm font-black ${
                    isDark
                      ? "text-slate-100"
                      : "text-slate-900"
                  }`}
                >
                  Final Amount
                </span>

                <span
                  className={`text-lg font-black sm:text-xl ${
                    isDark
                      ? "text-blue-400"
                      : "text-blue-600"
                  }`}
                >
                  {formatMoney(
                    finalAmount
                  )}
                </span>
              </div>
            </div>
          )}

          {serverError && (
            <div
              className={`rounded-xl border px-3.5 py-3 sm:px-4 ${
                isDark
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  isDark
                    ? "text-red-400"
                    : "text-red-700"
                }`}
              >
                {serverError}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={
              paymentLoading ||
              couponLoading
            }
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black text-white shadow-lg transition sm:px-5 sm:py-3.5 ${
              isDark
                ? "bg-blue-600 shadow-blue-950/40 hover:bg-blue-500"
                : "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {paymentLoading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Connecting to PayU...
              </>
            ) : (
              <>
                <CreditCard
                  size={18}
                />
                Pay{" "}
                {formatMoney(
                  finalAmount
                )}
              </>
            )}
          </button>

          <div
            className={`flex items-center justify-center gap-2 pb-0.5 text-center text-[11px] sm:text-xs ${
              isDark
                ? "text-slate-500"
                : "text-slate-400"
            }`}
          >
            <LockKeyhole
              size={13}
              className="shrink-0"
            />
            <span>
              Payment securely processed
              by PayU
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}