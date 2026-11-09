import MemoryOrder from "../../models/memory/MemoryOrder.js";

/*
  An earlier version of the Memories orders stored a Razorpay-only field with a UNIQUE index (razorpayOrderId_1).
  Orders are gateway-neutral now (gatewayOrderId), so new orders don't have that field, and MongoDB treats every missing value as the
  same "null": the second order then fails with E11000 duplicate key. Dropping the leftover index fixes it. Safe to run any number of times.
*/
const isLegacy = (index) => Object.keys(index.key || {}).some((k) => /^razorpay/i.test(k));

export const dropLegacyMemoryIndexes = async () => {
  const dropped = [];
  let indexes = [];
  try {
    indexes = await MemoryOrder.collection.indexes();
  } catch (e) {
    if (e?.codeName === "NamespaceNotFound" || e?.code === 26) return dropped; // no collection yet, nothing to clean
    throw e;
  }
  for (const index of indexes) {
    if (!isLegacy(index)) continue;
    try {
      await MemoryOrder.collection.dropIndex(index.name);
      dropped.push(index.name);
    } catch (e) {
      if (e?.codeName !== "IndexNotFound") throw e;
    }
  }
  if (dropped.length) console.warn(`[memory] dropped leftover order index: ${dropped.join(", ")}`);
  return dropped;
};

/** True when a write failed because of one of those leftover indexes. */
export const isLegacyIndexError = (e) => e?.code === 11000 && Object.keys(e.keyPattern || {}).some((k) => /^razorpay/i.test(k));
