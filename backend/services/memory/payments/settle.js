import MemoryOrder from "../../../models/memory/MemoryOrder.js";
import MemoryCredit from "../../../models/memory/MemoryCredit.js";
import MemoryPage from "../../../models/memory/MemoryPage.js";
import { sendPurchase } from "../metaCapi.js";
import { DAY_MS } from "../memoryService.js";
import { ADDON_DEFS, extraFromLines } from "../catalog.js";

const isDup = (e) => e?.code === 11000 || e?.writeErrors?.some((w) => w.code === 11000);

/* a paid "page" order becomes one pass. It covers the theme price that was paid (older orders have none recorded: they stay "any theme"). */
/**
 * An upgrade pays only the difference and ADDS it to what the pass/page was worth (so two tabs paying at once never lose money: the quote is always worked out fresh, and what is still missing shows again). So the room it raises is the pass or page that was already paid for:
 *   - the user's unused pass is raised to the full price of the new look (and gets any add-on room bought with it);
 *   - if that pass was spent on a page in the meantime, that page is raised instead, so nothing paid is ever lost.
 * Safe to repeat: the order id is written where it is applied.
 */
const applyUpgradeToCredit = async (order) => {
  const credit = await MemoryCredit.findById(order.upgradeCredit).select("+upgradeOrders");
  if (!credit) return false;
  if ((credit.upgradeOrders || []).some((id) => String(id) === String(order._id))) return true; // already applied
  if (credit.page) return applyUpgradeToPage({ ...order.toObject(), page: credit.page, kind: "upgrade" });
  // each field is added with $inc (never "read, add, write back"), so two upgrades settling at the same moment cannot overwrite each other's room
  const room = extraFromLines(order.addons);
  const inc = {};
  if (order.basePaise > 0) inc.maxPricePaise = order.basePaise; // a room-only order raises no price (and an any-look pass has none to raise)
  for (const [k, v] of Object.entries(room)) if (v > 0) inc[`extra.${k}`] = v;
  if (credit.extra == null) await MemoryCredit.updateOne({ _id: credit._id, extra: null }, { $set: { extra: {} } });
  const res = await MemoryCredit.updateOne(
    { _id: credit._id, page: null, upgradeOrders: { $ne: order._id } },
    { $set: { occasion: order.occasion || credit.occasion, theme: order.theme || credit.theme }, $inc: inc, $push: { upgradeOrders: order._id } }
  );
  if (!res.matchedCount) return applyUpgradeToCredit(order); // spent a moment ago: the re-read sends it to the page
  return true;
};

const applyUpgradeToPage = async (order) => {
  const page = await MemoryPage.findById(order.page).select("+addonOrders expiresAt paidPricePaise");
  if (!page) return false;
  if ((page.addonOrders || []).some((id) => String(id) === String(order._id))) return true;
  const extra = extraFromLines(order.addons);
  const inc = {};
  for (const k of Object.keys(ADDON_DEFS)) { const f = ADDON_DEFS[k].field; if (extra[f] > 0) inc[`extra.${f}`] = extra[f]; }
  const update = { $push: { addonOrders: order._id } };
  if (order.basePaise > 0 && page.paidPricePaise != null) inc.paidPricePaise = order.basePaise; // room-only orders raise no price
  if (Object.keys(inc).length) update.$inc = inc;
  if (extra.days > 0 && page.expiresAt) update.$set = { expiresAt: new Date(new Date(page.expiresAt).getTime() + extra.days * DAY_MS) };
  await MemoryPage.updateOne({ _id: page._id, addonOrders: { $ne: order._id } }, update);
  return true;
};

const grantPageCredit = async (order) => {
  if (order.upgradeCredit && (await applyUpgradeToCredit(order))) return; // raised the pass they already had
  const extra = extraFromLines(order.addons);
  const hasExtra = Object.values(extra).some((v) => v > 0);
  try {
    await MemoryCredit.create({
      user: order.user, source: "payment", ref: String(order._id),
      maxPricePaise: order.occasion ? order.basePaise : null, occasion: order.occasion || null, theme: order.theme || "",
      extra: hasExtra ? extra : null,
    });
  } catch (e) {
    if (!isDup(e)) throw e; // duplicate = the credit already exists
  }
};

/* a paid "addon" order adds its room to the page. The order's id is written to the page in the same update, so applying it twice does nothing. Returns false when the page is gone. */
const applyAddonOrder = async (order) => {
  const page = await MemoryPage.findById(order.page).select("+addonOrders expiresAt");
  if (!page) return false; // the page was deleted since: there is nothing to add room to
  if ((page.addonOrders || []).some((id) => String(id) === String(order._id))) return true;
  const extra = extraFromLines(order.addons);
  const inc = {};
  for (const k of Object.keys(ADDON_DEFS)) {
    const f = ADDON_DEFS[k].field;
    if (extra[f] > 0) inc[`extra.${f}`] = extra[f];
  }
  const update = { $push: { addonOrders: order._id } };
  if (Object.keys(inc).length) update.$inc = inc;
  if (extra.days > 0 && page.expiresAt) update.$set = { expiresAt: new Date(new Date(page.expiresAt).getTime() + extra.days * DAY_MS) };
  await MemoryPage.updateOne({ _id: page._id, addonOrders: { $ne: order._id } }, update);
  return true;
};

/**
 * Turn a PAID order into what was bought. Safe to repeat: finishes a half-done job, never does it twice.
 * Returns false when it could NOT be delivered (the page it was for has been deleted since). Such an order is never marked delivered:
 * it stays "paid, not fulfilled" with the reason PAGE_GONE, so it shows up in the admin's orders for a refund.
 */
export const fulfillOrder = async (order) => {
  if (order.fulfilledAt) return true;
  let delivered = true;
  if (order.kind === "addon") delivered = await applyAddonOrder(order);
  else if (order.kind === "upgrade") delivered = await applyUpgradeToPage(order);
  else await grantPageCredit(order);
  if (!delivered) {
    if (order.failureReason !== "PAGE_GONE") console.error(`[memory] order ${order._id} is PAID but its page ${order.page} no longer exists: nothing was delivered. Refund it.`);
    await MemoryOrder.updateOne({ _id: order._id, fulfilledAt: null }, { failureReason: "PAGE_GONE" });
    return false;
  }
  await MemoryOrder.updateOne({ _id: order._id, fulfilledAt: null }, { fulfilledAt: new Date(), failureReason: null });
  return true;
};

/*
  The ONE place where a payment turns into a page credit.
  Whatever the gateway, the order is paid only when the gateway itself confirms it AND the amount
  matches what we asked for. Safe to call any number of times (browser callback, webhook, status
  poll): the order flips to paid once and mints exactly one credit.
*/
export const settleOrder = async (order, status) => {
  if (order.status === "paid") {
    if (!order.fulfilledAt) await fulfillOrder(order).catch((e) => console.error(`[memory] could not finish order ${order._id}:`, e.message)); // a crash between "paid" and "delivered" is healed here
    return "paid";
  }
  if (!status?.paid) {
    // the gateway says the payment failed (declined, cancelled): record it, so the buyer is told instead of waiting forever.
    // A payment that still arrives later flips the order to paid as usual.
    if (status?.failed) {
      await MemoryOrder.updateOne({ _id: order._id, status: "created" }, { status: "failed", failureReason: status.reason || "GATEWAY_FAILED" });
      return "failed";
    }
    return order.status === "failed" ? "failed" : "pending";
  }

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
  if (won) await fulfillOrder(won);
  if (won) void sendPurchase(won); // Meta Conversions API; never awaited, never throws
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
    return order.status === "failed" ? "failed" : "pending";
  }
  return settleOrder(order, status);
};
