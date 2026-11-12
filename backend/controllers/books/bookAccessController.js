import Book from "../../models/Book.js";
import Order from "../../models/Order.js";
import { publicAttribution } from "../../utils/attribution.js";
import { isAutoEbookEmailEnabled } from "../../utils/ebookEmailDelivery.js";
import { hashDownloadToken } from "../../utils/payu.js";

const maskEmail = (email) => {
  const [user = "", domain = ""] = String(email || "").split("@");

  if (!user || !domain) {
    return "";
  }

  return `${user.slice(0, 2)}${"*".repeat(Math.max(user.length - 2, 2))}@${domain}`;
};

export const getPurchasedBookAccess = async (req, res) => {
  try {
    const { token } = req.query;

    if (
      typeof token !== "string" ||
      !token.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Access token is required."
      });
    }

    const tokenHash = hashDownloadToken(token);

    // -----------------------------------------
    // 1. VERIFY EXISTING ORDER ACCESS
    // -----------------------------------------

    const orderQuery = {
      "access.tokenHash": tokenHash,

      orderStatus: "PAID",

      "payment.status": "SUCCESS",

      "verification.amountVerified": true,

      "access.revoked": false,

      "access.expiresAt": {
        $gt: new Date()
      },

      $or: [
        {
          "payment.provider": "PayU",
          "verification.callbackHashVerified": true,
          "verification.payuVerified": true
        },
        {
          "payment.provider": "Razorpay",
          "verification.callbackHashVerified": true,
          "verification.razorpayVerified": true
        },
        {
          "payment.provider": "Cashfree",
          "verification.cashfreeVerified": true
        },
        {
          // Any gateway added later through services/payments.
          "payment.provider": { $nin: ["PayU", "Razorpay", "Cashfree"] },
          "verification.callbackHashVerified": true
        }
      ]
    };

    // Only the fields this endpoint needs: orders also hold large
    // PayU callback/verification blobs that would slow every read.
    const order = await Order.findOne(orderQuery)
      .select(
        "orderId bookId book customer.email " +
        "payment.amount purchasedBookIds offer " +
        "metadata.attribution access.expiresAt"
      )
      .lean();

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "Access link is invalid or expired."
      });
    }

    // -----------------------------------------
    // 2. GET PURCHASED PRODUCT
    // -----------------------------------------

    const productSelect =
      "_id title slug subtitle description " +
      "resourceType coverPageUrl pdfUrl fileName " +
      "includedBooks isActive sendEbookEmailOnPurchase";

    const bookSelect =
      "_id title slug subtitle description " +
      "resourceType coverPageUrl pdfUrl fileName";

    const orderSnapshotIds = Array.isArray(order.purchasedBookIds)
      ? order.purchasedBookIds.map((id) => String(id))
      : [];

    // When the purchase-time snapshot exists, product and books are
    // independent: load them together (one round trip instead of two).
    const productPromise = Book.findById(order.bookId)
      .select(productSelect)
      .lean();

    const snapshotBooksPromise = orderSnapshotIds.length
      ? Book.find({ _id: { $in: orderSnapshotIds } })
          .select(bookSelect)
          .lean()
      : null;

    const purchasedProduct = await productPromise;

    if (!purchasedProduct) {
      return res.status(404).json({
        success: false,
        message: "Purchased product not found."
      });
    }

    // -----------------------------------------
    // 3. IDENTIFY SINGLE OR BUNDLE
    // -----------------------------------------

    const isOfferOrder = Boolean(order.offer?.offerId);

    const autoEbookMail = await isAutoEbookEmailEnabled();

    const isBundle =
      purchasedProduct.resourceType === "bundle" || isOfferOrder;

    let purchasedBooks = [];

    // Prefer purchase-time entitlement snapshot.
    // Older orders fall back to includedBooks.
    const snapshotIds = Array.isArray(
      order.purchasedBookIds
    )
      ? order.purchasedBookIds
      : [];

    const includedIds = Array.isArray(
      purchasedProduct.includedBooks
    )
      ? purchasedProduct.includedBooks
      : [];

    let selectedIds = [];

    if (snapshotIds.length > 0) {
      selectedIds = snapshotIds;
    } else if (isBundle) {
      selectedIds = includedIds;
    } else {
      selectedIds = [purchasedProduct._id];
    }

    selectedIds = [
      ...new Set(
        selectedIds.map((id) => String(id))
      )
    ];

    if (selectedIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No books configured for this purchase."
      });
    }

    // -----------------------------------------
    // 4. LOAD ALL INCLUDED BOOK DETAILS
    // -----------------------------------------

    const foundBooks = snapshotBooksPromise
      ? await snapshotBooksPromise
      : await Book.find({ _id: { $in: selectedIds } })
          .select(bookSelect)
          .lean();

    const bookMap = new Map(
      foundBooks.map((book) => [
        String(book._id),
        book
      ])
    );

    // Preserve original bundle ordering.
    purchasedBooks = selectedIds
      .map((id) => bookMap.get(id))
      .filter(Boolean);

    // Do not silently return an incomplete bundle.
    if (purchasedBooks.length !== selectedIds.length) {
      return res.status(409).json({
        success: false,
        message:
          "Some purchased books are unavailable. Please contact support."
      });
    }

    const missingPdf = purchasedBooks.find(
      (book) => !book.pdfUrl
    );

    if (missingPdf) {
      return res.status(409).json({
        success: false,
        message:
          "One or more purchased PDFs are unavailable."
      });
    }

    // -----------------------------------------
    // 5. REVALIDATE ACCESS AND RECORD USAGE
    // -----------------------------------------

    // The order was just validated by the same query above, so the
    // usage counter does not need to hold up the response.
    Order.updateOne(orderQuery, {
      $set: { "access.lastAccessedAt": new Date() },
      $inc: { "access.accessCount": 1 }
    }).catch((error) =>
      console.error("Unable to record access usage:", error.message)
    );

    // -----------------------------------------
    // 6. FORMAT BOOK DATA
    // -----------------------------------------

    const books = purchasedBooks.map((book) => ({
      id: String(book._id),

      title: book.title,

      slug: book.slug,

      subtitle: book.subtitle || "",

      description: book.description || "",

      resourceType: book.resourceType,

      coverPageUrl: book.coverPageUrl || "",

      pdfUrl: book.pdfUrl,

      fileName:
        book.fileName ||
        `${book.slug || "ebook"}.pdf`
    }));

    const singleBook =
      !isBundle && books.length === 1
        ? books[0]
        : null;

    // -----------------------------------------
    // 7. RETURN UNIFIED API RESPONSE
    // -----------------------------------------

    return res.status(200).json({
      success: true,

      message: isBundle
        ? "Bundle books loaded successfully."
        : "Purchased book loaded successfully.",

      data: {
        orderId: order.orderId,

        isBundle,

        purchaseType: isBundle
          ? "bundle"
          : "single",

        totalBooks: books.length,

        // Overall purchased product
        product: {
          id: String(purchasedProduct._id),

          title: order.book?.title ||
            purchasedProduct.title,

          resourceType:
            purchasedProduct.resourceType,

          coverPageUrl:
            purchasedProduct.coverPageUrl || "",

          price: order.book?.price ?? null,

          mrp: order.book?.mrp ?? null,

          currency:
            order.book?.currency || "INR"
        },

        // Actual amount paid after coupon
        payment: {
          amount: order.payment?.amount ?? null,
          currency:
            order.book?.currency || "INR"
        },

        // Whether the PDF(s) will also be emailed to the buyer.
        // Only the masked address is exposed.
        emailDelivery: {
          enabled:
            autoEbookMail &&
            (purchasedProduct.sendEbookEmailOnPurchase === true ||
              isOfferOrder),
          maskedEmail: maskEmail(order.customer?.email)
        },

        // Ad attribution stored at checkout time
        attribution: publicAttribution(
          order.metadata?.attribution
        ),

        // Legacy single-book response fields
        title: singleBook?.title ||
          order.book?.title ||
          purchasedProduct.title,

        coverPageUrl:
          singleBook?.coverPageUrl ||
          purchasedProduct.coverPageUrl ||
          "",

        pdfUrl: singleBook?.pdfUrl || null,

        // Unified download list
        books,

        expiresAt: order.access.expiresAt
      }
    });

  } catch (error) {
    console.error(
      "Get purchased book access error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load purchased ebooks."
    });
  }
};
