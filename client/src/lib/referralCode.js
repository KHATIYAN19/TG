/* The referral code saved from a ?ref= link (App.jsx). Sent with a checkout as a plain label; nothing is calculated from it. */
export const savedReferralCode = () => {
  try {
    const c = (localStorage.getItem("referralCode") || "").trim();
    return /^[a-zA-Z0-9_-]{1,64}$/.test(c) ? c : undefined;
  } catch {
    return undefined;
  }
};
