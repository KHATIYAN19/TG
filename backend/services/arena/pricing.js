/* Pure money helpers. All amounts are integer paise. */

export const MIN_GATEWAY_PAISE = 100; // Razorpay minimum is ₹1.00

/**
 * Discount for a coupon applied to a price.
 * Returns an integer number of paise, never more than the price.
 */
export const computeDiscountPaise = (coupon, pricePaise) => {
  if (!coupon || !(pricePaise > 0)) return 0;

  let discount =
    coupon.discountType === "PERCENTAGE"
      ? Math.floor((pricePaise * coupon.discountValue) / 100)
      : coupon.discountValue;

  if (coupon.maxDiscountPaise != null) {
    discount = Math.min(discount, coupon.maxDiscountPaise);
  }

  return Math.max(0, Math.min(discount, pricePaise));
};

/**
 * Final amount to charge. A non-zero amount below the gateway
 * minimum is raised to the minimum; zero stays zero (free entry).
 */
export const computePricing = (listPricePaise, coupon) => {
  const discountPaise = computeDiscountPaise(coupon, listPricePaise);
  let finalPaise = listPricePaise - discountPaise;

  if (finalPaise > 0 && finalPaise < MIN_GATEWAY_PAISE) {
    finalPaise = MIN_GATEWAY_PAISE;
  }

  return {
    listPricePaise,
    discountPaise: listPricePaise - finalPaise,
    finalPaise,
  };
};

/**
 * Cancellation (before a match only): the member keeps
 * (100 - fee)% of what they actually paid.
 */
export const computeCancellation = (paidPaise, feePercent) => {
  if (!(paidPaise > 0)) {
    return { feePaise: 0, refundPaise: 0 };
  }

  const pct = Math.min(100, Math.max(0, feePercent));
  const feePaise = Math.round((paidPaise * pct) / 100);

  return { feePaise, refundPaise: paidPaise - feePaise };
};

export const rupees = (paise) => `₹${(paise / 100).toFixed(paise % 100 ? 2 : 0)}`;
