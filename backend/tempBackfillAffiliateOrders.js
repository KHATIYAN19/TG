/**
 * TEMPORARY / ONE-OFF SCRIPT
 *
 * Fills in the affiliate details on existing orders so affiliates can
 * see their sales.
 *
 * WHY: only the Cashfree checkout attaches the affiliate's account and
 * commission to an order when it is created. Orders paid through PayU
 * or Razorpay were saved with just the referral code (for example
 * "bbb"), so they have no affiliateUserId and never show up on the
 * affiliate's dashboard.
 *
 * WHAT IT DOES: for every affiliate member (role "affiliate"), finds
 * orders whose payment.affiliateCode matches their affiliate code but
 * which have no payment.affiliateUserId yet, and sets:
 *
 *   payment.affiliateUserId   the affiliate's user id
 *   payment.affiliateType     PERCENTAGE | FIXED
 *   payment.affiliateValue    the commission value
 *   payment.affiliateAmount   the commission for that order
 *   payment.remainingAmount   payment.amount - affiliateAmount
 *
 * SAFE BY DEFAULT: it only previews. Nothing is written unless you add
 * --apply. Running it again is harmless: orders that already have an
 * affiliateUserId are never touched.
 *
 * USAGE (from the backend folder):
 *
 *   node tempBackfillAffiliateOrders.js --code=BBB            preview one code
 *   node tempBackfillAffiliateOrders.js --code=BBB --apply    write it
 *   node tempBackfillAffiliateOrders.js                       preview ALL affiliates
 *   node tempBackfillAffiliateOrders.js --apply               write ALL affiliates
 *
 * NOTE: the commission uses each affiliate's CURRENT commission
 * settings, because the rate at the time of the order was not saved on
 * these orders. Delete this file when you are done.
 */

import "dotenv/config";
import mongoose from "mongoose";

import User from "./models/User.js";
import Order from "./models/Order.js";
import connectDB from "./utils/dbConnection.js";

/* ---------------------------------------------------
   ARGUMENTS
--------------------------------------------------- */

const args = process.argv.slice(2);

const APPLY = args.includes("--apply");

const codeArg = args.find((a) => a.startsWith("--code="));
const ONLY_CODE = codeArg
  ? codeArg.slice("--code=".length).trim().toUpperCase()
  : null;

if (codeArg && !/^[A-Z0-9_-]{3,30}$/.test(ONLY_CODE || "")) {
  console.error(
    "Invalid --code. Use letters, numbers, - or _ (3-30 characters)."
  );
  process.exit(1);
}

/* ---------------------------------------------------
   HELPERS
--------------------------------------------------- */

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Same rules the live checkout uses (see resolveAffiliate in services/books/bookOrderHelpers.js). */
const calculateCommission = ({ type, value, amount, currency }) => {
  if (!["percentage", "fixed"].includes(type)) {
    return { error: "invalid commission type" };
  }

  if (!Number.isFinite(value) || value <= 0) {
    return { error: "invalid commission value" };
  }

  if (type === "percentage" && value > 100) {
    return { error: "percentage above 100" };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "order amount is zero or missing" };
  }

  if (
    type === "fixed" &&
    String(currency || "INR").toUpperCase() !== "INR"
  ) {
    return { error: "fixed commission on a non-INR order" };
  }

  const raw =
    type === "percentage"
      ? roundMoney((amount * value) / 100)
      : roundMoney(value);

  const affiliateAmount = Math.min(Math.max(raw, 0), amount);

  return {
    affiliateType: type === "percentage" ? "PERCENTAGE" : "FIXED",
    affiliateValue: value,
    affiliateAmount,
    remainingAmount: roundMoney(amount - affiliateAmount),
  };
};

const money = (n) => `Rs. ${roundMoney(n).toFixed(2)}`;

/* ---------------------------------------------------
   MAIN
--------------------------------------------------- */

const run = async () => {
  await connectDB();

  console.log(
    `\n${APPLY ? "APPLYING CHANGES" : "PREVIEW ONLY (nothing will be written, add --apply to save)"}`
  );
  console.log(
    ONLY_CODE
      ? `Affiliate code: ${ONLY_CODE}`
      : "Affiliate code: ALL affiliate members"
  );

  const userFilter = {
    role: "affiliate",
    isDeleted: { $ne: true },
    "affiliate.code": ONLY_CODE || { $exists: true },
  };

  const affiliates = await User.find(userFilter)
    .select("_id name email status affiliate")
    .lean();

  if (!affiliates.length) {
    console.log(
      ONLY_CODE
        ? `\nNo affiliate member has the code ${ONLY_CODE}.`
        : "\nNo affiliate members found."
    );
    return;
  }

  const totals = {
    affiliates: 0,
    matched: 0,
    updated: 0,
    skipped: 0,
    paidCommission: 0,
  };

  for (const user of affiliates) {
    const aff = user.affiliate || {};
    const code = String(aff.code || "").toUpperCase();

    console.log(
      `\n== ${code}  (${user.name || "unnamed"}, ${user.email || "no email"})`
    );

    if (user.status !== "active" || aff.status !== "active") {
      console.log(
        `   skipped: affiliate is not active (account: ${user.status}, affiliate: ${aff.status}).`
      );
      continue;
    }

    totals.affiliates += 1;

    // Order codes are stored lowercase, but match any case to be safe.
    const orders = await Order.find({
      "payment.affiliateCode": new RegExp(`^${escapeRegex(code)}$`, "i"),
      $or: [
        { "payment.affiliateUserId": null },
        { "payment.affiliateUserId": { $exists: false } },
      ],
    })
      .select(
        "orderId orderStatus book.currency payment.amount payment.affiliateCode"
      )
      .lean();

    // Orders for this code that already belong to a different user.
    const conflicts = await Order.countDocuments({
      "payment.affiliateCode": new RegExp(`^${escapeRegex(code)}$`, "i"),
      "payment.affiliateUserId": { $nin: [null, user._id] },
    });

    if (conflicts) {
      console.log(
        `   note: ${conflicts} order(s) with this code already belong to another user and are left alone.`
      );
    }

    if (!orders.length) {
      console.log("   nothing to update.");
      continue;
    }

    console.log(
      `   commission: ${aff.commissionType} ${aff.commissionValue}${aff.commissionType === "percentage" ? "%" : " (fixed)"}`
    );

    const operations = [];
    const byStatus = {};
    const skippedReasons = {};
    let paidCommission = 0;

    for (const order of orders) {
      const result = calculateCommission({
        type: aff.commissionType,
        value: Number(aff.commissionValue),
        amount: Number(order.payment?.amount),
        currency: order.book?.currency,
      });

      if (result.error) {
        skippedReasons[result.error] =
          (skippedReasons[result.error] || 0) + 1;
        continue;
      }

      byStatus[order.orderStatus] =
        (byStatus[order.orderStatus] || 0) + 1;

      if (order.orderStatus === "PAID") {
        paidCommission += result.affiliateAmount;
      }

      operations.push({
        updateOne: {
          // Re-checks the order is still unclaimed, so it is race-safe.
          filter: {
            _id: order._id,
            $or: [
              { "payment.affiliateUserId": null },
              { "payment.affiliateUserId": { $exists: false } },
            ],
          },
          update: {
            $set: {
              "payment.affiliateUserId": user._id,
              "payment.affiliateType": result.affiliateType,
              "payment.affiliateValue": result.affiliateValue,
              "payment.affiliateAmount": result.affiliateAmount,
              "payment.remainingAmount": result.remainingAmount,
            },
          },
        },
      });
    }

    const skipped = Object.values(skippedReasons).reduce(
      (a, b) => a + b,
      0
    );

    console.log(`   orders found: ${orders.length}`);
    console.log(
      `   to update: ${operations.length}  ` +
        `(${Object.entries(byStatus)
          .map(([s, n]) => `${s}: ${n}`)
          .join(", ") || "none"})`
    );
    console.log(
      `   commission on PAID orders: ${money(paidCommission)}`
    );

    if (skipped) {
      console.log(
        `   skipped ${skipped}: ${Object.entries(skippedReasons)
          .map(([r, n]) => `${n} x ${r}`)
          .join("; ")}`
      );
    }

    // Show a few examples so the numbers can be sanity-checked.
    orders.slice(0, 3).forEach((order) => {
      const r = calculateCommission({
        type: aff.commissionType,
        value: Number(aff.commissionValue),
        amount: Number(order.payment?.amount),
        currency: order.book?.currency,
      });

      if (!r.error) {
        console.log(
          `     e.g. ${order.orderId}: paid ${money(order.payment.amount)} -> commission ${money(r.affiliateAmount)} [${order.orderStatus}]`
        );
      }
    });

    let updated = operations.length;

    if (APPLY && operations.length) {
      const written = await Order.bulkWrite(operations, {
        ordered: false,
      });

      updated = written.modifiedCount;

      console.log(`   UPDATED ${updated} order(s).`);
    }

    totals.matched += orders.length;
    totals.updated += updated;
    totals.skipped += skipped;
    totals.paidCommission += paidCommission;
  }

  console.log("\n--------------------------------------------");
  console.log(
    `${APPLY ? "Done" : "Preview complete"}: ` +
      `${totals.affiliates} active affiliate(s), ` +
      `${totals.matched} order(s) found, ` +
      `${totals.updated} ${APPLY ? "updated" : "would be updated"}, ` +
      `${totals.skipped} skipped.`
  );
  console.log(
    `Commission on PAID orders: ${money(totals.paidCommission)}`
  );

  if (!APPLY && totals.updated > 0) {
    console.log(
      "\nLooks right? Run again with --apply to save these changes."
    );
  }
};

run()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
