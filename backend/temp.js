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


import mongoose from "mongoose";
import dotenv from "dotenv";

import Order from "./models/Order.js";
import User from "./models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Normalize email
const normalizeEmail = (email) => {
  if (!email || typeof email !== "string") {
    return null;
  }

  const normalized = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(normalized)
    ? normalized
    : null;
};

// Check whether an order was placed for ₹1
const isOneRupeeOrder = (order) => {
  // Prioritize actual payment amount over book price.
  // Assumes amounts are stored in rupees.
  const amount =
    order.payment?.amount ??
    order.totalAmount ??
    order.book?.price;

  if (amount === null || amount === undefined || amount === "") {
    return false;
  }

  return Number(amount) === 1;
};

async function exportAllEmails() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected successfully.");

    // Store all email addresses in one Set.
    // This automatically removes duplicates.
    const uniqueEmails = new Set();

    const stats = {
      totalOrders: 0,
      excludedOneRupeeOrders: 0,
      validOrders: 0,
      orderEmails: new Set(),
      totalUsers: 0,
      userEmails: new Set(),
    };

    // ==========================================
    // 1. FETCH ALL ORDERS
    // ==========================================

    console.log("\nFetching customer orders...");

    const orders = Order.find({})
      .select(
        "customer.email payment.amount totalAmount book.price"
      )
      .lean()
      .cursor();

    for await (const order of orders) {
      stats.totalOrders++;

      // Exclude orders with ₹1 payment amount
      if (isOneRupeeOrder(order)) {
        stats.excludedOneRupeeOrders++;
        continue;
      }

      stats.validOrders++;

      const email = normalizeEmail(
        order.customer?.email
      );

      if (!email) continue;

      uniqueEmails.add(email);
      stats.orderEmails.add(email);
    }

    // ==========================================
    // 2. FETCH ALL REGISTERED USERS
    // ==========================================

    console.log("Fetching registered users...");

    const users = User.find({})
      .select("email")
      .lean()
      .cursor();

    for await (const user of users) {
      stats.totalUsers++;

      const email = normalizeEmail(user.email);

      if (!email) continue;

      uniqueEmails.add(email);
      stats.userEmails.add(email);
    }

    // ==========================================
    // 3. SORT UNIQUE EMAILS
    // ==========================================

    const emails = [...uniqueEmails].sort();

    // ==========================================
    // 4. PRINT COMMA-SEPARATED EMAILS
    // ==========================================

    console.log(
      "\n================ ALL UNIQUE EMAILS ================\n"
    );

    console.log(emails.join(","));

    console.log(
      "\n===================================================\n"
    );

    // ==========================================
    // 5. PRINT STATISTICS
    // ==========================================

    console.log("EMAIL EXPORT SUMMARY\n");

    console.log(
      "Total orders:",
      stats.totalOrders
    );

    console.log(
      "Excluded ₹1 orders:",
      stats.excludedOneRupeeOrders
    );

    console.log(
      "Remaining orders:",
      stats.validOrders
    );

    console.log(
      "Unique emails from orders:",
      stats.orderEmails.size
    );

    console.log(
      "Total registered users:",
      stats.totalUsers
    );

    console.log(
      "Unique emails from users:",
      stats.userEmails.size
    );

    console.log(
      "\nTOTAL UNIQUE EMAILS:",
      emails.length
    );

    console.log(
      "\n===================================================\n"
    );

  } catch (error) {
    console.error(
      "Error exporting emails:",
      error.message
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

exportAllEmails();