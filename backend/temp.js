import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "node:fs/promises";

import Order from "./models/Order.js";
import Book from "./models/Book.js";

dotenv.config();

/* =====================================================
   CONFIGURATION
===================================================== */

const MONGO_URI = process.env.MONGO_URI;

// Standalone LLD book URL
const LLD_REDIRECT_URL = "/book/system-design/lld";

// Exclude orders with ₹1 payment
const EXCLUDE_ONE_RUPEE_ORDERS = true;

// JSON output file
const OUTPUT_FILE = "./lld-customers.json";

/* =====================================================
   NORMALIZE EMAIL
===================================================== */

const normalizeEmail = (email) => {
  if (!email || typeof email !== "string") {
    return null;
  }

  const normalized = email.trim().toLowerCase();

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(normalized)
    ? normalized
    : null;
};

/* =====================================================
   NORMALIZE NAME
===================================================== */

const normalizeName = (name) => {
  if (!name || typeof name !== "string") {
    return "Learner";
  }

  const normalized = name.trim();

  return normalized || "Learner";
};

/* =====================================================
   CHECK SUCCESSFUL PAYMENT
===================================================== */

const isSuccessfulOrder = (order) => {
  const paymentStatus = String(
    order.payment?.status || ""
  ).trim().toUpperCase();

  const orderStatus = String(
    order.orderStatus || ""
  ).trim().toUpperCase();

  const successfulStatuses = [
    "SUCCESS",
    "PAID",
    "COMPLETED",
    "CAPTURED",
  ];

  // Follow the existing HLD export logic.
  return (
    successfulStatuses.includes(paymentStatus) ||
    successfulStatuses.includes(orderStatus)
  );
};

/* =====================================================
   CHECK ₹1 ORDER
===================================================== */

const isOneRupeeOrder = (order) => {
  // Prefer actual paid amount over listed price.
  const amount =
    order.payment?.amount ??
    order.totalAmount ??
    order.book?.price;

  if (
    amount === undefined ||
    amount === null ||
    amount === ""
  ) {
    return false;
  }

  const numericAmount = Number(amount);

  return (
    Number.isFinite(numericAmount) &&
    numericAmount === 1
  );
};

/* =====================================================
   MAIN FUNCTION
===================================================== */

async function exportLLDCustomers() {
  try {
    /* ==========================================
       STEP 1: CONNECT MONGODB
    ========================================== */

    if (!MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing in .env"
      );
    }

    await mongoose.connect(MONGO_URI);

    console.log(
      "\nMongoDB connected successfully.\n"
    );

    /* ==========================================
       STEP 2: FIND STANDALONE LLD BOOK
    ========================================== */

    console.log(
      "Searching for standalone LLD book..."
    );

    const lldBook = await Book.findOne({
      redirectUrl: LLD_REDIRECT_URL,
      resourceType: { $ne: "bundle" },
    })
      .select(
        "_id title redirectUrl resourceType price"
      )
      .lean();

    if (!lldBook) {
      console.log(
        "\nExact LLD book not found."
      );

      // Debug: show possible LLD books.
      const possibleBooks = await Book.find({
        $or: [
          {
            title: {
              $regex: "low.?level.?design",
              $options: "i",
            },
          },
          {
            redirectUrl: {
              $regex: "lld",
              $options: "i",
            },
          },
        ],
      })
        .select(
          "_id title redirectUrl resourceType"
        )
        .lean();

      console.log(
        "\nPossible matching books:",
        possibleBooks
      );

      throw new Error(
        `Standalone LLD book not found: ${LLD_REDIRECT_URL}`
      );
    }

    console.log("\nLLD Book Found:");
    console.log("Title:", lldBook.title);
    console.log(
      "Book ID:",
      String(lldBook._id)
    );
    console.log(
      "Redirect URL:",
      lldBook.redirectUrl
    );
    console.log(
      "Resource Type:",
      lldBook.resourceType
    );

    /* ==========================================
       STEP 3: FETCH STANDALONE LLD ORDERS

       IMPORTANT:
       Match ONLY order.bookId = LLD book ID.

       This excludes:
       - HLD + LLD bundles
       - Other bundled products
       - Orders that contain LLD only as part
         of a multi-book purchase
    ========================================== */

    console.log(
      "\nFetching standalone LLD orders..."
    );

    const orders = await Order.find({
      bookId: lldBook._id,
    })
      .select(
        [
          "_id",
          "orderId",
          "bookId",
          "customer.name",
          "customer.email",
          "payment.status",
          "payment.amount",
          "totalAmount",
          "book.price",
          "orderStatus",
          "createdAt",
        ].join(" ")
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    console.log(
      "Total standalone LLD orders:",
      orders.length
    );

    /* ==========================================
       STEP 4: FILTER SUCCESSFUL PAYMENTS
    ========================================== */

    const successfulOrders = orders.filter(
      isSuccessfulOrder
    );

    console.log(
      "Successful standalone LLD orders:",
      successfulOrders.length
    );

    /* ==========================================
       STEP 5: EXCLUDE ₹1 ORDERS
    ========================================== */

    const validOrders =
      EXCLUDE_ONE_RUPEE_ORDERS
        ? successfulOrders.filter(
            (order) => !isOneRupeeOrder(order)
          )
        : successfulOrders;

    const excludedOneRupeeOrders =
      successfulOrders.length - validOrders.length;

    console.log(
      "Excluded ₹1 orders:",
      excludedOneRupeeOrders
    );

    console.log(
      "Valid paid LLD orders:",
      validOrders.length
    );

    /* ==========================================
       STEP 6: EXTRACT UNIQUE CUSTOMERS
    ========================================== */

    const customerMap = new Map();

    let invalidEmails = 0;
    let duplicateCustomers = 0;

    for (const order of validOrders) {
      const email = normalizeEmail(
        order.customer?.email
      );

      if (!email) {
        invalidEmails++;
        continue;
      }

      const name = normalizeName(
        order.customer?.name
      );

      if (customerMap.has(email)) {
        duplicateCustomers++;

        // Prefer actual name over fallback.
        const existing =
          customerMap.get(email);

        if (
          existing.name === "Learner" &&
          name !== "Learner"
        ) {
          existing.name = name;
        }

        continue;
      }

      customerMap.set(email, {
        name,
        email,
      });
    }

    /* ==========================================
       STEP 7: SORT CUSTOMERS
    ========================================== */

    const customers = [
      ...customerMap.values(),
    ].sort((a, b) =>
      a.email.localeCompare(b.email)
    );

    /* ==========================================
       STEP 8: PRINT JAVASCRIPT ARRAY
    ========================================== */

    console.log(
      "\n========== LLD CUSTOMERS ARRAY ==========\n"
    );

    console.log(
      `const customers = ${JSON.stringify(
        customers,
        null,
        2
      )};`
    );

    console.log(
      "\n=========================================\n"
    );

    /* ==========================================
       STEP 9: SAVE JSON FILE
    ========================================== */

    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(customers, null, 2),
      "utf8"
    );

    console.log(
      `Customer data saved to: ${OUTPUT_FILE}`
    );

    /* ==========================================
       STEP 10: PRINT SUMMARY
    ========================================== */

    console.log(
      "\n========================================="
    );

    console.log(
      "      LLD CUSTOMER EXPORT SUMMARY"
    );

    console.log(
      "=========================================\n"
    );

    console.log(
      "Book:",
      lldBook.title
    );

    console.log(
      "Book ID:",
      String(lldBook._id)
    );

    console.log(
      "Total standalone LLD orders:",
      orders.length
    );

    console.log(
      "Successful orders:",
      successfulOrders.length
    );

    console.log(
      "Excluded ₹1 orders:",
      excludedOneRupeeOrders
    );

    console.log(
      "Valid paid LLD orders:",
      validOrders.length
    );

    console.log(
      "Invalid customer emails:",
      invalidEmails
    );

    console.log(
      "Duplicate customer emails:",
      duplicateCustomers
    );

    console.log(
      "Total unique LLD customers:",
      customers.length
    );

    console.log(
      "\n=========================================\n"
    );

    return customers;

  } catch (error) {
    console.error(
      "\nError exporting LLD customers:",
      error
    );

    throw error;

  } finally {
    await mongoose.disconnect();

    console.log(
      "\nMongoDB disconnected."
    );
  }
}

/* =====================================================
   EXECUTE SCRIPT
===================================================== */

exportLLDCustomers().catch(() => {
  process.exitCode = 1;
});

export { exportLLDCustomers };
