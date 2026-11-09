/*
  Phone numbers: a country code plus the national number.

  - `countryCode` is the dial code with a plus, e.g. "+91".
  - `mobile` is the national number, digits only, with no country code and no leading zero (so it stays the same
    value the rest of the system has always stored for Indian numbers, and gateways can use it directly).
  - A number saved before country codes existed has no `countryCode`; it is treated as +91.

  The country list below is mirrored on the client (client/src/utils/countries.js). Keep the two in step.
*/
export const DEFAULT_DIAL = "+91";

// [ISO, dial, name, minDigits, maxDigits, optional pattern]
const RAW = [
  ["IN", "+91", "India", 10, 10, /^[6-9]\d{9}$/],
  ["US", "+1", "United States / Canada", 10, 10],
  ["GB", "+44", "United Kingdom", 9, 10],
  ["AE", "+971", "United Arab Emirates", 8, 9],
  ["SA", "+966", "Saudi Arabia", 8, 9],
  ["QA", "+974", "Qatar", 8, 8],
  ["KW", "+965", "Kuwait", 8, 8],
  ["OM", "+968", "Oman", 8, 8],
  ["BH", "+973", "Bahrain", 8, 8],
  ["SG", "+65", "Singapore", 8, 8],
  ["MY", "+60", "Malaysia", 8, 10],
  ["AU", "+61", "Australia", 9, 9],
  ["NZ", "+64", "New Zealand", 8, 10],
  ["NP", "+977", "Nepal", 10, 10],
  ["BD", "+880", "Bangladesh", 10, 10],
  ["LK", "+94", "Sri Lanka", 9, 9],
  ["PK", "+92", "Pakistan", 10, 10],
  ["DE", "+49", "Germany", 7, 11],
  ["FR", "+33", "France", 9, 9],
  ["IT", "+39", "Italy", 9, 11],
  ["ES", "+34", "Spain", 9, 9],
  ["NL", "+31", "Netherlands", 9, 9],
  ["IE", "+353", "Ireland", 8, 9],
  ["ZA", "+27", "South Africa", 9, 9],
  ["NG", "+234", "Nigeria", 10, 10],
  ["KE", "+254", "Kenya", 9, 9],
  ["PH", "+63", "Philippines", 10, 10],
  ["ID", "+62", "Indonesia", 9, 12],
  ["TH", "+66", "Thailand", 9, 9],
  ["JP", "+81", "Japan", 10, 10],
  ["KR", "+82", "South Korea", 9, 10],
  ["CN", "+86", "China", 11, 11],
  ["BR", "+55", "Brazil", 10, 11],
  ["MX", "+52", "Mexico", 10, 10],
];

export const COUNTRIES = RAW.map(([iso, dial, name, min, max, pattern]) => ({ iso, dial, name, min, max, pattern }));
// "+1" is shared (US and Canada), so the first entry for a dial code wins.
const BY_DIAL = new Map();
for (const c of COUNTRIES) if (!BY_DIAL.has(c.dial)) BY_DIAL.set(c.dial, c);

export const isKnownDial = (dial) => BY_DIAL.has(dial);
export const countryOf = (dial) => BY_DIAL.get(dial || DEFAULT_DIAL) || null;

/** Digits only. Strips spaces, dashes, brackets. */
export const digitsOf = (v) => String(v ?? "").replace(/\D/g, "");

/**
 * Check a national number for a country. Returns an error message, or "" when it is fine.
 * Leading zeros are not allowed (they are a dialing habit, not part of the number).
 */
export const mobileProblem = (dial, mobile) => {
  const c = countryOf(dial);
  if (!c) return "Choose a valid country code";
  const m = String(mobile ?? "");
  if (!/^\d+$/.test(m)) return "Mobile number can only have digits";
  if (m.startsWith("0")) return "Enter the number without a leading 0";
  if (m.length < c.min || m.length > c.max) {
    return c.min === c.max ? `Enter a valid ${c.min}-digit mobile number for ${c.name}` : `Enter a valid ${c.min} to ${c.max}-digit mobile number for ${c.name}`;
  }
  if (c.pattern && !c.pattern.test(m)) return `Enter a valid ${c.name} mobile number`;
  return "";
};

/** "+91 98765 43210" style text for screens and the admin. Works for old users that have no country code. */
export const formatPhone = (dial, mobile) => (mobile ? `${dial || DEFAULT_DIAL} ${mobile}` : "");

// Cashfree and PayU insist on a 10-digit number. For an account whose number is not 10 digits (most foreign numbers), this stand-in is sent
// to the gateway instead. It is only the gateway's contact field; the real number stays on the account. Override with PAYMENT_FALLBACK_PHONE.
export const FALLBACK_GATEWAY_PHONE = /^\d{10}$/.test(process.env.PAYMENT_FALLBACK_PHONE || "") ? process.env.PAYMENT_FALLBACK_PHONE : "9232323232";

/**
 * The number to hand to an Indian payment gateway (Cashfree, PayU), which wants exactly 10 digits.
 * - the account's own number when it is 10 digits;
 * - the stand-in number when the account has a number of another length (foreign numbers);
 * - "" when the account has no number at all, so the caller can say so.
 */
export const gatewayPhone = (user) => {
  const m = digitsOf(user?.mobile);
  if (!m) return "";
  return m.length === 10 ? m : FALLBACK_GATEWAY_PHONE;
};
