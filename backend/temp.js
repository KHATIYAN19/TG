// import mongoose from "mongoose";
// import dotenv from "dotenv";

// import Order from "./models/Order.js";
// import Book from "./models/Book.js";

// dotenv.config();

// const HLD_REDIRECT_URL = "/book/system-design/hld";

// async function exportHLDEmails() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);

//     console.log("MongoDB connected.");

//     // 1. Find HLD book
//     const hldBook = await Book.findOne({
//       redirectUrl: HLD_REDIRECT_URL,
//     }).lean();

//     if (!hldBook) {
//       throw new Error("HLD book not found.");
//     }

//     console.log("HLD Book:", hldBook.title);

//     // 2. Find bundles containing HLD
//     const bundles = await Book.find({
//       resourceType: "bundle",
//       includedBooks: hldBook._id,
//     })
//       .select("_id")
//       .lean();

//     const productIds = [
//       hldBook._id,
//       ...bundles.map((bundle) => bundle._id),
//     ];

//     // 3. Find successful orders
//     const orders = await Order.find({
//       $and: [
//         {
//           $or: [
//             { bookId: { $in: productIds } },
//             { bookIds: hldBook._id },
//             { "books.id": hldBook._id },
//             { "books.bookId": hldBook._id },
//           ],
//         },
//         {
//           $or: [
//             {
//               "payment.status": {
//                 $in: ["success", "SUCCESS", "paid", "PAID"],
//               },
//             },
//             {
//               orderStatus: {
//                 $in: [
//                   "success",
//                   "SUCCESS",
//                   "paid",
//                   "PAID",
//                   "completed",
//                   "COMPLETED",
//                 ],
//               },
//             },
//           ],
//         },
//       ],
//     })
//       .select("customer.email book.price payment.amount totalAmount")
//       .lean();

//     // 4. Exclude ₹1 purchases
//     const validOrders = orders.filter((order) => {
//       const amount = Number(
//         order.payment?.amount ??
//         order.totalAmount ??
//         order.book?.price
//       );

//       return Number.isFinite(amount) && amount !== 1;
//     });

//     // 5. Extract unique email addresses
//     const uniqueEmails = [
//       ...new Set(
//         validOrders
//           .map((order) =>
//             order.customer?.email?.trim().toLowerCase()
//           )
//           .filter(Boolean)
//       ),
//     ];

//     // 6. Print comma-separated emails
//     console.log("\n========== HLD CUSTOMER EMAILS ==========\n");

//     console.log(uniqueEmails.join(","));

//     console.log("\n=========================================");

//     // 7. Print totals
//     console.log("Total successful orders:", orders.length);

//     console.log(
//       "Orders after excluding ₹1 purchases:",
//       validOrders.length
//     );

//     console.log(
//       "Total unique customer emails:",
//       uniqueEmails.length
//     );

//   } catch (error) {
//     console.error("Error:", error.message);
//   } finally {
//     await mongoose.disconnect();
//   }
// }

// exportHLDEmails();


// import mongoose from "mongoose";
// import dotenv from "dotenv";

// import Order from "./models/Order.js";
// import User from "./models/User.js";

// dotenv.config();

// const MONGO_URI = process.env.MONGO_URI;

// // Normalize email
// const normalizeEmail = (email) => {
//   if (!email || typeof email !== "string") {
//     return null;
//   }

//   const normalized = email.trim().toLowerCase();

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   return emailRegex.test(normalized)
//     ? normalized
//     : null;
// };

// // Check whether an order was placed for ₹1
// const isOneRupeeOrder = (order) => {
//   // Prioritize actual payment amount over book price.
//   // Assumes amounts are stored in rupees.
//   const amount =
//     order.payment?.amount ??
//     order.totalAmount ??
//     order.book?.price;

//   if (amount === null || amount === undefined || amount === "") {
//     return false;
//   }

//   return Number(amount) === 1;
// };

// async function exportAllEmails() {
//   try {
//     if (!MONGO_URI) {
//       throw new Error("MONGO_URI is missing in .env");
//     }

//     await mongoose.connect(MONGO_URI);

//     console.log("MongoDB connected successfully.");

//     // Store all email addresses in one Set.
//     // This automatically removes duplicates.
//     const uniqueEmails = new Set();

//     const stats = {
//       totalOrders: 0,
//       excludedOneRupeeOrders: 0,
//       validOrders: 0,
//       orderEmails: new Set(),
//       totalUsers: 0,
//       userEmails: new Set(),
//     };

//     // ==========================================
//     // 1. FETCH ALL ORDERS
//     // ==========================================

//     console.log("\nFetching customer orders...");

//     const orders = Order.find({})
//       .select(
//         "customer.email payment.amount totalAmount book.price"
//       )
//       .lean()
//       .cursor();

//     for await (const order of orders) {
//       stats.totalOrders++;

//       // Exclude orders with ₹1 payment amount
//       if (isOneRupeeOrder(order)) {
//         stats.excludedOneRupeeOrders++;
//         continue;
//       }

//       stats.validOrders++;

//       const email = normalizeEmail(
//         order.customer?.email
//       );

//       if (!email) continue;

//       uniqueEmails.add(email);
//       stats.orderEmails.add(email);
//     }

//     // ==========================================
//     // 2. FETCH ALL REGISTERED USERS
//     // ==========================================

//     console.log("Fetching registered users...");

//     const users = User.find({})
//       .select("email")
//       .lean()
//       .cursor();

//     for await (const user of users) {
//       stats.totalUsers++;

//       const email = normalizeEmail(user.email);

//       if (!email) continue;

//       uniqueEmails.add(email);
//       stats.userEmails.add(email);
//     }

//     // ==========================================
//     // 3. SORT UNIQUE EMAILS
//     // ==========================================

//     const emails = [...uniqueEmails].sort();

//     // ==========================================
//     // 4. PRINT COMMA-SEPARATED EMAILS
//     // ==========================================

//     console.log(
//       "\n================ ALL UNIQUE EMAILS ================\n"
//     );

//     console.log(emails.join(","));

//     console.log(
//       "\n===================================================\n"
//     );

//     // ==========================================
//     // 5. PRINT STATISTICS
//     // ==========================================

//     console.log("EMAIL EXPORT SUMMARY\n");

//     console.log(
//       "Total orders:",
//       stats.totalOrders
//     );

//     console.log(
//       "Excluded ₹1 orders:",
//       stats.excludedOneRupeeOrders
//     );

//     console.log(
//       "Remaining orders:",
//       stats.validOrders
//     );

//     console.log(
//       "Unique emails from orders:",
//       stats.orderEmails.size
//     );

//     console.log(
//       "Total registered users:",
//       stats.totalUsers
//     );

//     console.log(
//       "Unique emails from users:",
//       stats.userEmails.size
//     );

//     console.log(
//       "\nTOTAL UNIQUE EMAILS:",
//       emails.length
//     );

//     console.log(
//       "\n===================================================\n"
//     );

//   } catch (error) {
//     console.error(
//       "Error exporting emails:",
//       error.message
//     );

//     process.exitCode = 1;
//   } finally {
//     await mongoose.disconnect();
//   }
// }

// exportAllEmails();


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
