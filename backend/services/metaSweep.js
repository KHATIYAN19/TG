import Order from "../models/Order.js";
import MemoryOrder from "../models/memory/MemoryOrder.js";
import { capiEnabled } from "./metaCapi.js";
import { sendBookPurchase } from "./books/metaPurchase.js";
import { sendPurchase as sendMemoryPurchase } from "./memory/metaCapi.js";

/*
  SAFETY NET: no Meta-ad sale goes unreported.
  Finds paid, Meta-attributed orders the server has not yet reported (Meta was down, the server restarted mid-send, an order was
  paid before this feature existed) and sends them. Meta only accepts events up to 7 days old, so only the last 6 days are tried.
  Re-sending is harmless: the event id (`purchase_<orderId>`) is the same as the browser's, so Meta dedupes.
*/
const WINDOW_MS = 6 * 24 * 60 * 60 * 1000;
const SETTLE_MS = 2 * 60 * 1000; // leave a just-paid order to its own send first

export const resendMissedMetaPurchases = async () => {
  if (!capiEnabled()) return { books: 0, memories: 0 };
  const since = new Date(Date.now() - WINDOW_MS);
  const settled = new Date(Date.now() - SETTLE_MS);

  const books = await Order.find({
    orderStatus: "PAID",
    "metadata.attribution.platform": "meta",
    "metadata.metaPurchaseSentAt": null,
    "payment.paidAt": { $gte: since, $lte: settled },
  }).limit(50);
  let sentBooks = 0;
  for (const o of books) if (await sendBookPurchase(o)) sentBooks++;

  const mems = await MemoryOrder.find({
    status: "paid",
    "attribution.platform": "meta",
    metaPurchaseSentAt: null,
    paidAt: { $gte: since, $lte: settled },
  }).limit(50);
  let sentMem = 0;
  for (const o of mems) if (await sendMemoryPurchase(o)) sentMem++;

  if (sentBooks || sentMem) console.log(`[meta-capi] sweep re-sent ${sentBooks} book and ${sentMem} memories purchase(s)`);
  return { books: sentBooks, memories: sentMem };
};
