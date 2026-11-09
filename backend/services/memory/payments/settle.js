import MemoryOrder from "../../../models/memory/MemoryOrder.js";
import { grantCredits } from "../memoryService.js";

/*
  The ONE place where a payment turns into a page credit.
  Whatever the gateway, the order is paid only when the gateway itself confirms it AND the amount
  matches what we asked for. Safe to call any number of times (browser callback, webhook, status
  poll): the order flips to paid once and mints exactly one credit.
*/
export const settleOrder = async (order, status) => {
  if (order.status === "paid") return "paid";
  if (!status?.paid) return "pending";

  if (Number(status.amountPaise) !== Number(order.amount)) {
    console.error(`[memory] amount mismatch on order ${order._id}: expected ${order.amount}, gateway says ${status.amountPaise}`);
    await MemoryOrder.updateOne({ _id: order._id, status: "created" }, { status: "failed", failureReason: "AMOUNT_MISMATCH" });
    return "failed";
  }

  const won = await MemoryOrder.findOneAndUpdate(
    { _id: order._id, status: { $ne: "paid" } },
    { status: "paid", gatewayPaymentId: status.paymentId || null, paidAt: new Date(), failureReason: null },
    { new: true }
  );
  if (won) {
    try {
      await grantCredits(order.user, { source: "payment", ref: String(order._id) });
    } catch (e) {
      const dup = e?.code === 11000 || e?.writeErrors?.some((w) => w.code === 11000);
      if (!dup) throw e; // duplicate = credit already minted
    }
  }
  return "paid";
};

/** Ask the gateway for the truth and settle. Never trusts anything the browser sent. */
export const refreshOrder = async (order, adapter) => {
  if (order.status === "paid") return "paid";
  let status;
  try {
    status = await adapter.fetchStatus(order);
  } catch (e) {
    // The gateway could not be asked right now (bad keys, outage). Treat as "not confirmed yet": never relay its status code to the browser.
    console.error(`[memory] ${adapter.id} status check failed for order ${order._id}:`, e?.error?.description || e?.message || e);
    return "pending";
  }
  return settleOrder(order, status);
};
