/*
  Referral code on a payment: just a label, stored as typed (upper-cased). Nothing is calculated from it.
  The partner ledger reads it so an admin can choose which referral codes a partner sees (services/partner).
  "TT" means a direct Target Trek sale, so it is not a referral.
*/
const CODE_RX = /^[A-Z0-9_-]{2,40}$/;

export const cleanReferralCode = (v) => {
  const c = typeof v === "string" ? v.trim().toUpperCase() : "";
  return CODE_RX.test(c) && c !== "TT" ? c : "";
};
