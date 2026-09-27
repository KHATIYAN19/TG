// import React, { useEffect, useState } from "react";
// import {
//   CheckCircle2,
//   Loader2,
//   AlertCircle,
//   BookOpen,
//   ShieldCheck,
//   Clock3,
//   AlertTriangle,
// } from "lucide-react";
// import { Link, useSearchParams } from "react-router-dom";

// const BASE_URL =
//   import.meta.env.VITE_BASE_URL ||
//   "https://target-trek.onrender.com";

// const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

// export default function PaymentSuccess() {
//   const [searchParams] = useSearchParams();

//   const token = searchParams.get("token");
//   const orderId = searchParams.get("order");

//   const [book, setBook] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [showAccessModal, setShowAccessModal] =
//     useState(false);

//   const [acceptedTerms, setAcceptedTerms] =
//     useState(false);

//   const [pdfUnlocked, setPdfUnlocked] =
//     useState(false);

//   // ============================================================
//   // LOAD PURCHASED BOOK
//   // ============================================================

//   useEffect(() => {
//     if (!token) {
//       if (orderId) {
//         setError(
//           "Your payment was already processed. If you need access again, please contact support."
//         );
//       } else {
//         setError("Book access token is missing.");
//       }

//       setLoading(false);
//       return;
//     }

//     const controller = new AbortController();

//     const loadPurchasedBook = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await fetch(
//           `${BASE_URL}/payment/payu/access?token=${encodeURIComponent(
//             token
//           )}`,
//           {
//             method: "GET",
//             headers: {
//               Accept: "application/json",
//             },
//             signal: controller.signal,
//           }
//         );

//         const result = await response
//           .json()
//           .catch(() => null);

//         if (
//           !response.ok ||
//           !result?.success ||
//           !result?.data
//         ) {
//           throw new Error(
//             result?.message ||
//               "Unable to access your purchased ebook."
//           );
//         }

//         // Save verified book information.
//         setBook(result.data);

//         // Show conditions before showing the PDF.
//         setShowAccessModal(true);

//         // Remove sensitive token from browser address bar.
//         window.history.replaceState(
//           {},
//           document.title,
//           "/payment/success"
//         );
//       } catch (error) {
//         if (error?.name === "AbortError") {
//           return;
//         }

//         console.error(
//           "Purchased book access error:",
//           error
//         );

//         setError(
//           error?.message ||
//             "Unable to access your purchased ebook."
//         );
//       } finally {
//         if (!controller.signal.aborted) {
//           setLoading(false);
//         }
//       }
//     };

//     loadPurchasedBook();

//     return () => {
//       controller.abort();
//     };
//   }, [token, orderId]);

//   // ============================================================
//   // OPEN PDF
//   // ============================================================

//   const handleGetPdf = () => {
//     if (!acceptedTerms) {
//       return;
//     }

//     setPdfUnlocked(true);
//     setShowAccessModal(false);
//   };

//   // ============================================================
//   // LOADING
//   // ============================================================

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pt-24">
//         <div className="text-center">
//           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
//             <Loader2
//               size={30}
//               className="animate-spin text-blue-600"
//             />
//           </div>

//           <h1 className="mt-5 text-xl font-black text-slate-950">
//             Preparing your ebook
//           </h1>

//           <p className="mt-2 text-sm text-slate-500">
//             We're verifying your secure access.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ============================================================
//   // ERROR
//   // ============================================================

//   if (error || !book) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pb-10 pt-28">
//         <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-9">
//           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
//             <AlertCircle
//               size={27}
//               className="text-red-600"
//             />
//           </div>

//           <h1 className="mt-5 text-2xl font-black text-slate-950">
//             Unable to open ebook
//           </h1>

//           <p className="mt-3 text-sm leading-6 text-slate-500">
//             {error}
//           </p>

//           <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
//             If your payment was deducted, please do not
//             pay again.
//             <br />
//             Contact{" "}
//             <a
//               href={`mailto:${SUPPORT_EMAIL}`}
//               className="font-bold text-blue-600 hover:underline"
//             >
//               {SUPPORT_EMAIL}
//             </a>
//           </div>

//           <Link
//             to="/books"
//             className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
//           >
//             Go to Books
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   // ============================================================
//   // SUCCESS
//   // ============================================================

//   return (
//     <>
//       <div className="min-h-screen bg-slate-50 px-4 pb-10 pt-28 sm:px-6 sm:pb-12 sm:pt-32">
//         <div className="mx-auto max-w-7xl">

//           {/* ===================================================
//               PAYMENT SUCCESS
//           =================================================== */}

//           <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
//             <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
//               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
//                 <CheckCircle2
//                   size={26}
//                   className="text-emerald-700"
//                 />
//               </div>

//               <div className="flex-1">
//                 <h1 className="text-xl font-black text-emerald-950 sm:text-2xl">
//                   Payment Successful
//                 </h1>

//                 <p className="mt-1 text-sm text-emerald-800">
//                   Your purchase has been verified and your
//                   ebook is ready.
//                 </p>
//               </div>

//               <div className="inline-flex items-center gap-2 self-start rounded-full bg-white px-3 py-2 text-xs font-bold text-emerald-700 sm:self-auto">
//                 <ShieldCheck size={14} />
//                 Payment verified
//               </div>
//             </div>
//           </div>

//           {/* ===================================================
//               BOOK INFORMATION
//           =================================================== */}

//           <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
//             <div className="flex items-center gap-3">
//               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
//                 <BookOpen
//                   size={20}
//                   className="text-blue-600"
//                 />
//               </div>

//               <div>
//                 <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
//                   Your ebook
//                 </p>

//                 <h2 className="font-black text-slate-950">
//                   {book.title}
//                 </h2>
//               </div>
//             </div>

//             {book.expiresAt && (
//               <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
//                 <Clock3 size={14} />
//                 Temporary secure access
//               </div>
//             )}
//           </div>

//           {/* ===================================================
//               PDF
//           =================================================== */}

//           {pdfUnlocked ? (
//             <>
//               {/* Warning */}

//               <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
//                 <div className="flex items-start gap-3">
//                   <AlertTriangle
//                     size={19}
//                     className="mt-0.5 shrink-0 text-amber-600"
//                   />

//                   <div>
//                     <p className="text-sm font-black text-amber-900">
//                       Save your ebook now
//                     </p>

//                     <p className="mt-1 text-xs leading-5 text-amber-800">
//                       Please download/save your PDF before
//                       refreshing or closing this page.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* PDF Viewer */}

//               <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
//                 <iframe
//                   src={book.pdfUrl}
//                   title={book.title}
//                   className="h-[75vh] min-h-[600px] w-full border-0"
//                 />
//               </div>

//               <p className="mt-4 text-center text-xs leading-5 text-slate-400">
//                 This ebook is for your personal use. Please do
//                 not share your purchase access.
//               </p>
//             </>
//           ) : (
//             <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
//               <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
//                 <BookOpen
//                   size={23}
//                   className="text-blue-600"
//                 />
//               </div>

//               <h3 className="mt-4 text-lg font-black text-slate-950">
//                 Your ebook is ready
//               </h3>

//               <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
//                 Accept the access conditions to open your
//                 purchased PDF.
//               </p>

//               <button
//                 type="button"
//                 onClick={() =>
//                   setShowAccessModal(true)
//                 }
//                 className="mt-5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700"
//               >
//                 Open My Ebook
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* =====================================================
//           SMALL ACCESS MODAL
//       ===================================================== */}

//       {showAccessModal && !pdfUnlocked && (
//         <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">

//           {/* Background */}

//           <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />

//           {/* Modal */}

//           <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

//             {/* Header */}

//             <div className="text-center">
//               <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-50">
//                 <AlertTriangle
//                   size={21}
//                   className="text-amber-600"
//                 />
//               </div>

//               <h2 className="mt-3 text-xl font-black text-slate-950">
//                 Before You Open Your Ebook
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Please note these important points.
//               </p>
//             </div>

//             {/* Conditions */}

//             <div className="mt-5 space-y-2.5">
//               <ConditionItem>
//                 Save/download the PDF as soon as it
//                 opens.
//               </ConditionItem>

//               <ConditionItem>
//                 Don't refresh or close this page before
//                 saving it.
//               </ConditionItem>

//               <ConditionItem>
//                 This is one-time access. You may not be
//                 able to access the PDF again.
//               </ConditionItem>

//               <ConditionItem>
//                 Digital ebook purchases are
//                 non-refundable.
//               </ConditionItem>
//             </div>

//             {/* Checkbox */}

//             <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-3.5">
//               <input
//                 type="checkbox"
//                 checked={acceptedTerms}
//                 onChange={(event) =>
//                   setAcceptedTerms(
//                     event.target.checked
//                   )
//                 }
//                 className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
//               />

//               <span className="text-xs font-semibold leading-5 text-slate-700">
//                 I understand and accept these conditions.
//               </span>
//             </label>

//             {/* Get PDF */}

//             <button
//               type="button"
//               disabled={!acceptedTerms}
//               onClick={handleGetPdf}
//               className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
//             >
//               <BookOpen size={17} />
//               Get My PDF
//             </button>

//             {/* Support */}

//             <p className="mt-3 text-center text-[11px] text-slate-400">
//               Need help?{" "}
//               <a
//                 href={`mailto:${SUPPORT_EMAIL}`}
//                 className="font-bold text-blue-600 hover:underline"
//               >
//                 {SUPPORT_EMAIL}
//               </a>
//             </p>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// // ============================================================
// // CONDITION ITEM
// // ============================================================

// function ConditionItem({ children }) {
//   return (
//     <div className="flex items-start gap-2.5 text-sm text-slate-600">
//       <CheckCircle2
//         size={17}
//         className="mt-0.5 shrink-0 text-emerald-600"
//       />

//       <span>{children}</span>
//     </div>
//   );
// }

import React, {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  BookOpen,
  ShieldCheck,
  Clock3,
  AlertTriangle,
  Download,
  Smartphone,
} from "lucide-react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  "https://target-trek.onrender.com";

const SUPPORT_EMAIL =
  "supporttargettrek@gmail.com";

export default function PaymentSuccess() {
  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token");

  const orderId =
    searchParams.get("order");

  const [
    book,
    setBook,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    showAccessModal,
    setShowAccessModal,
  ] = useState(false);

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false);

  const [
    pdfUnlocked,
    setPdfUnlocked,
  ] = useState(false);

  const [
    downloading,
    setDownloading,
  ] = useState(false);

  const [
    downloadMessage,
    setDownloadMessage,
  ] = useState("");

  // ============================================================
  // LOAD PURCHASED BOOK
  // ============================================================

  useEffect(() => {
    if (!token) {
      if (orderId) {
        setError(
          "Your payment was already processed. If you need access again, please contact support."
        );
      } else {
        setError(
          "Book access token is missing."
        );
      }

      setLoading(false);

      return;
    }

    const controller =
      new AbortController();

    const loadPurchasedBook =
      async () => {
        try {
          setLoading(true);

          setError("");

          const response =
            await fetch(
              `${BASE_URL}/payment/payu/access?token=${encodeURIComponent(
                token
              )}`,
              {
                method: "GET",

                headers: {
                  Accept:
                    "application/json",
                },

                signal:
                  controller.signal,
              }
            );

          const result =
            await response
              .json()
              .catch(
                () => null
              );

          if (
            !response.ok ||
            !result?.success ||
            !result?.data
          ) {
            throw new Error(
              result?.message ||
                "Unable to access your purchased ebook."
            );
          }

          /*
           * result.data is expected to include:
           *
           * title
           * pdfUrl
           * expiresAt
           * etc.
           */
          setBook(
            result.data
          );

          /*
           * Show conditions before
           * giving PDF access.
           */
          setShowAccessModal(
            true
          );

          /*
           * Remove sensitive token
           * from browser URL.
           *
           * The token has already been used.
           */
          window.history.replaceState(
            {},
            document.title,
            "/payment/success"
          );
        } catch (error) {
          if (
            error?.name ===
            "AbortError"
          ) {
            return;
          }

          console.error(
            "Purchased book access error:",
            error
          );

          setError(
            error?.message ||
              "Unable to access your purchased ebook."
          );
        } finally {
          if (
            !controller.signal
              .aborted
          ) {
            setLoading(
              false
            );
          }
        }
      };

    loadPurchasedBook();

    return () => {
      controller.abort();
    };
  }, [
    token,
    orderId,
  ]);

  // ============================================================
  // UNLOCK PDF
  // ============================================================

  const handleGetPdf =
    () => {
      if (
        !acceptedTerms
      ) {
        return;
      }

      setPdfUnlocked(
        true
      );

      setShowAccessModal(
        false
      );
    };

  // ============================================================
  // SAFE PDF FILE NAME
  // ============================================================

  const getPdfFileName =
    () => {
      const title =
        book?.title ||
        "Target-Trek-Ebook";

      const safeTitle =
        String(title)
          .trim()
          .replace(
            /[^a-zA-Z0-9-_ ]/g,
            ""
          )
          .replace(
            /\s+/g,
            "-"
          )
          .substring(
            0,
            100
          );

      return `${
        safeTitle ||
        "Target-Trek-Ebook"
      }.pdf`;
    };

  // ============================================================
  // DEVICE DETECTION
  // ============================================================

  const isAppleMobileDevice =
    () => {
      const userAgent =
        navigator.userAgent ||
        "";

      const platform =
        navigator.platform ||
        "";

      /*
       * Normal iPhone/iPad detection
       */
      const normalIOS =
        /iPad|iPhone|iPod/i.test(
          userAgent
        );

      /*
       * Newer iPads sometimes identify
       * themselves as Mac.
       */
      const modernIPad =
        platform ===
          "MacIntel" &&
        navigator.maxTouchPoints >
          1;

      return (
        normalIOS ||
        modernIPad
      );
    };

  // ============================================================
  // STANDARD BLOB DOWNLOAD
  // ============================================================

  const triggerBlobDownload =
    (
      blob,
      fileName
    ) => {
      const blobUrl =
        window.URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href =
        blobUrl;

      anchor.download =
        fileName;

      anchor.style.display =
        "none";

      document.body.appendChild(
        anchor
      );

      anchor.click();

      document.body.removeChild(
        anchor
      );

      /*
       * Don't revoke immediately.
       *
       * Mobile devices sometimes need
       * more time before starting download.
       */
      setTimeout(() => {
        window.URL.revokeObjectURL(
          blobUrl
        );
      }, 30000);
    };

  // ============================================================
  // IOS / IPAD SAVE
  // ============================================================

  const saveOnAppleDevice =
    async (
      blob,
      fileName
    ) => {
      try {
        const file =
          new File(
            [blob],
            fileName,
            {
              type:
                "application/pdf",
            }
          );

        /*
         * iOS Safari supports sharing files.
         *
         * User can choose:
         *
         * Save to Files
         * AirDrop
         * Drive
         * etc.
         */
        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({
            files: [
              file,
            ],
          })
        ) {
          await navigator.share({
            title:
              book?.title ||
              "Target Trek Ebook",

            text:
              "Save your purchased Target Trek ebook.",

            files: [
              file,
            ],
          });

          return true;
        }

        return false;
      } catch (error) {
        /*
         * User cancelling Share
         * is not a real application error.
         */
        if (
          error?.name ===
          "AbortError"
        ) {
          return true;
        }

        console.error(
          "Apple PDF save error:",
          error
        );

        return false;
      }
    };

  // ============================================================
  // FILE SYSTEM ACCESS API
  // ============================================================

  const saveUsingFilePicker =
    async (
      blob,
      fileName
    ) => {
      /*
       * Chrome / Edge desktop
       *
       * This provides a real native
       * Save As dialog.
       */
      if (
        !window.showSaveFilePicker
      ) {
        return false;
      }

      try {
        const handle =
          await window.showSaveFilePicker(
            {
              suggestedName:
                fileName,

              types: [
                {
                  description:
                    "PDF Document",

                  accept: {
                    "application/pdf":
                      [
                        ".pdf",
                      ],
                  },
                },
              ],
            }
          );

        const writable =
          await handle.createWritable();

        await writable.write(
          blob
        );

        await writable.close();

        return true;
      } catch (error) {
        /*
         * User cancelled Save dialog.
         */
        if (
          error?.name ===
          "AbortError"
        ) {
          return true;
        }

        console.error(
          "File picker save error:",
          error
        );

        return false;
      }
    };

  // ============================================================
  // DOWNLOAD PDF
  // ============================================================

  const handleDownloadPdf =
    async () => {
      if (
        !book?.pdfUrl
      ) {
        setDownloadMessage(
          "PDF file is not available. Please contact support."
        );

        return;
      }

      if (downloading) {
        return;
      }

      try {
        setDownloading(
          true
        );

        setDownloadMessage(
          "Preparing your ebook..."
        );

        /*
         * Download PDF into memory.
         *
         * This avoids depending on
         * iframe/browser PDF controls.
         */
        const response =
          await fetch(
            book.pdfUrl,
            {
              method:
                "GET",

              headers: {
                Accept:
                  "application/pdf,*/*",
              },

              cache:
                "no-store",
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            "Unable to retrieve the PDF."
          );
        }

        const originalBlob =
          await response.blob();

        if (
          !originalBlob ||
          originalBlob.size ===
            0
        ) {
          throw new Error(
            "The PDF file is empty."
          );
        }

        /*
         * Force PDF MIME type.
         */
        const pdfBlob =
          originalBlob.type
            ?.toLowerCase()
            .includes(
              "pdf"
            )
            ? originalBlob
            : new Blob(
                [
                  originalBlob,
                ],
                {
                  type:
                    "application/pdf",
                }
              );

        const fileName =
          getPdfFileName();

        // ====================================================
        // IPHONE / IPAD
        // ====================================================

        if (
          isAppleMobileDevice()
        ) {
          setDownloadMessage(
            "Opening your device's save options..."
          );

          const saved =
            await saveOnAppleDevice(
              pdfBlob,
              fileName
            );

          if (saved) {
            setDownloadMessage(
              "Choose “Save to Files” to save your ebook on your iPhone or iPad."
            );

            return;
          }

          /*
           * Older Safari fallback
           */
          triggerBlobDownload(
            pdfBlob,
            fileName
          );

          setDownloadMessage(
            "Download started. Check the Downloads section in Safari or the Files app."
          );

          return;
        }

        // ====================================================
        // DESKTOP CHROME / EDGE
        // ====================================================

        if (
          window.showSaveFilePicker
        ) {
          setDownloadMessage(
            "Choose where you want to save your ebook."
          );

          const saved =
            await saveUsingFilePicker(
              pdfBlob,
              fileName
            );

          if (saved) {
            setDownloadMessage(
              "Your ebook has been saved successfully."
            );

            return;
          }
        }

        // ====================================================
        // ANDROID / FIREFOX / SAFARI / OTHER BROWSERS
        // ====================================================

        triggerBlobDownload(
          pdfBlob,
          fileName
        );

        setDownloadMessage(
          "Your download has started. Check your Downloads folder."
        );
      } catch (error) {
        console.error(
          "PDF download error:",
          error
        );

        /*
         * LAST FALLBACK
         *
         * Some mobile in-app browsers
         * block cross-origin fetch.
         *
         * We use an invisible <a>.
         *
         * There is NO visible
         * 'Open PDF' button.
         */
        try {
          const anchor =
            document.createElement(
              "a"
            );

          anchor.href =
            book.pdfUrl;

          anchor.download =
            getPdfFileName();

          anchor.rel =
            "noopener noreferrer";

          anchor.style.display =
            "none";

          document.body.appendChild(
            anchor
          );

          anchor.click();

          document.body.removeChild(
            anchor
          );

          setDownloadMessage(
            "Your browser is preparing the ebook download. Check your Downloads or Files folder."
          );
        } catch (
          fallbackError
        ) {
          console.error(
            "PDF fallback error:",
            fallbackError
          );

          setDownloadMessage(
            "Your browser prevented the download. Please try Chrome, Safari or contact support."
          );
        }
      } finally {
        setDownloading(
          false
        );
      }
    };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pt-24">
        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <Loader2
              size={30}
              className="animate-spin text-blue-600"
            />
          </div>

          <h1 className="mt-5 text-xl font-black text-slate-950">
            Preparing your ebook
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            We're verifying your secure access.
          </p>

        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (
    error ||
    !book
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pb-10 pt-28">

        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-9">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle
              size={27}
              className="text-red-600"
            />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Unable to open ebook
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">

            If your payment was deducted,
            please do not pay again.

            <br />

            Contact{" "}

            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-bold text-blue-600 hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>

          </div>

          <Link
            to="/books"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Go to Books
          </Link>

        </div>
      </div>
    );
  }

  // ============================================================
  // SUCCESS
  // ============================================================

  return (
    <>
      <div className="min-h-screen bg-slate-50 px-4 pb-10 pt-28 sm:px-6 sm:pb-12 sm:pt-32">

        <div className="mx-auto max-w-7xl">

          {/* ===================================================
              PAYMENT SUCCESS
          =================================================== */}

          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">

                <CheckCircle2
                  size={26}
                  className="text-emerald-700"
                />

              </div>

              <div className="flex-1">

                <h1 className="text-xl font-black text-emerald-950 sm:text-2xl">
                  Payment Successful
                </h1>

                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  Your purchase has been verified and your ebook is ready.
                </p>

              </div>

              <div className="inline-flex items-center gap-2 self-start rounded-full bg-white px-3 py-2 text-xs font-bold text-emerald-700 sm:self-auto">

                <ShieldCheck
                  size={14}
                />

                Payment verified

              </div>

            </div>

          </div>

          {/* ===================================================
              BOOK INFORMATION
          =================================================== */}

          <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

                <BookOpen
                  size={20}
                  className="text-blue-600"
                />

              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Your ebook
                </p>

                <h2 className="font-black text-slate-950">
                  {book.title}
                </h2>

              </div>

            </div>

            {book.expiresAt && (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">

                <Clock3
                  size={14}
                />

                Temporary secure access

              </div>
            )}

          </div>

          {/* ===================================================
              PDF
          =================================================== */}

          {pdfUnlocked ? (
            <>

              {/* DOWNLOAD WARNING */}

              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">

                <div className="flex items-start gap-3">

                  <AlertTriangle
                    size={19}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <div>

                    <p className="text-sm font-black text-amber-900">
                      Save your ebook now
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-800">
                      Please download your PDF before refreshing or
                      closing this page.
                    </p>

                  </div>

                </div>

              </div>

              {/* ===================================================
                  DOWNLOAD AREA
              =================================================== */}

              <div className="mb-5 rounded-3xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6">

                <div className="flex items-start gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                    <Download
                      size={21}
                    />

                  </div>

                  <div>

                    <h3 className="font-black text-slate-950">
                      Download your purchased ebook
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Save the PDF to your phone, iPad, tablet,
                      laptop or computer.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    handleDownloadPdf
                  }
                  disabled={
                    downloading
                  }
                  className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto sm:min-w-[230px]"
                >
                  {downloading ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Download
                      size={18}
                    />
                  )}

                  {downloading
                    ? "Preparing PDF..."
                    : "Download PDF"}

                </button>

                {downloadMessage && (
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">

                    <p className="text-xs font-semibold leading-5 text-slate-600">
                      {downloadMessage}
                    </p>

                  </div>
                )}

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-3 sm:hidden">

                  <Smartphone
                    size={16}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <p className="text-[11px] font-medium leading-5 text-blue-800">
                    On iPhone or iPad, tap Download PDF and choose
                    <strong> Save to Files </strong>
                    when the device save menu appears.
                  </p>

                </div>

              </div>

              {/* ===================================================
                  PDF PREVIEW
              =================================================== */}

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 md:hidden">

                  <p className="text-xs font-semibold leading-5 text-slate-500">
                    You can preview your ebook below. To keep a copy
                    on your device, use the{" "}
                    <strong className="text-blue-600">
                      Download PDF
                    </strong>{" "}
                    button above.
                  </p>

                </div>

                <iframe
                  src={
                    book.pdfUrl
                  }
                  title={
                    book.title
                  }
                  className="h-[65vh] min-h-[500px] w-full border-0 sm:h-[75vh] sm:min-h-[600px]"
                  allow="fullscreen"
                />

              </div>

              {/* ===================================================
                  DOWNLOAD BUTTON BELOW PDF TOO
              =================================================== */}

              <div className="mt-5 flex justify-center">

                <button
                  type="button"
                  onClick={
                    handleDownloadPdf
                  }
                  disabled={
                    downloading
                  }
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
                >
                  {downloading ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Download
                      size={18}
                    />
                  )}

                  {downloading
                    ? "Preparing PDF..."
                    : "Download Ebook"}

                </button>

              </div>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                This ebook is for your personal use. Please do not
                share your purchase access.
              </p>

            </>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">

                <BookOpen
                  size={23}
                  className="text-blue-600"
                />

              </div>

              <h3 className="mt-4 text-lg font-black text-slate-950">
                Your ebook is ready
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Accept the access conditions to view and download
                your purchased PDF.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowAccessModal(
                    true
                  )
                }
                className="mt-5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Access My Ebook
              </button>

            </div>
          )}

        </div>

      </div>

      {/* =====================================================
          ACCESS CONDITIONS MODAL
      ===================================================== */}

      {showAccessModal &&
        !pdfUnlocked && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto px-4 py-6">

            {/* Background */}

            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />

            {/* Modal */}

            <div className="relative z-10 my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

              {/* Header */}

              <div className="text-center">

                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-50">

                  <AlertTriangle
                    size={21}
                    className="text-amber-600"
                  />

                </div>

                <h2 className="mt-3 text-xl font-black text-slate-950">
                  Before You Access Your Ebook
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Please note these important points.
                </p>

              </div>

              {/* Conditions */}

              <div className="mt-5 space-y-2.5">

                <ConditionItem>
                  Download and save the PDF to your device as soon
                  as possible.
                </ConditionItem>

                <ConditionItem>
                  On mobile and iPad, use the blue Download PDF
                  button shown above the preview.
                </ConditionItem>

                <ConditionItem>
                  Don't refresh or close this page before saving
                  your ebook.
                </ConditionItem>

                <ConditionItem>
                  This is temporary secure access. If your access
                  expires, contact our support team.
                </ConditionItem>

                <ConditionItem>
                  Digital ebook purchases are non-refundable.
                </ConditionItem>

              </div>

              {/* Checkbox */}

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-3.5">

                <input
                  type="checkbox"
                  checked={
                    acceptedTerms
                  }
                  onChange={(
                    event
                  ) =>
                    setAcceptedTerms(
                      event.target
                        .checked
                    )
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
                />

                <span className="text-xs font-semibold leading-5 text-slate-700">
                  I understand and accept these conditions.
                </span>

              </label>

              {/* Access PDF */}

              <button
                type="button"
                disabled={
                  !acceptedTerms
                }
                onClick={
                  handleGetPdf
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <BookOpen
                  size={17}
                />

                View My PDF
              </button>

              {/* Support */}

              <p className="mt-3 text-center text-[11px] text-slate-400">
                Need help?{" "}

                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-bold text-blue-600 hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>

              </p>

            </div>

          </div>
        )}
    </>
  );
}

// ============================================================
// CONDITION ITEM
// ============================================================

function ConditionItem({
  children,
}) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-slate-600">

      <CheckCircle2
        size={17}
        className="mt-0.5 shrink-0 text-emerald-600"
      />

      <span>
        {children}
      </span>

    </div>
  );
}