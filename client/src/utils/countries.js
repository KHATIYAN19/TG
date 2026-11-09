/*
  Country codes for phone numbers. Mirrors backend/utils/phone.js (same list, same length rules). Keep the two in step.
  A number is a dial code ("+91") plus the national number: digits only, no country code, no leading 0.
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
const BY_DIAL = new Map();
for (const c of COUNTRIES) if (!BY_DIAL.has(c.dial)) BY_DIAL.set(c.dial, c);

export const countryOf = (dial) => BY_DIAL.get(dial || DEFAULT_DIAL) || null;
/** The flag emoji for an ISO country code. */
export const flagOf = (iso) => String.fromCodePoint(...[...iso].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
/** Digits only. */
export const digitsOf = (v) => String(v ?? "").replace(/\D/g, "");

/** An error message for a national number in a country, or "" when it is fine. */
export const mobileProblem = (dial, mobile) => {
  const c = countryOf(dial);
  if (!c) return "Choose a valid country code";
  const m = digitsOf(mobile);
  if (!m) return "Enter your mobile number";
  if (m.startsWith("0")) return "Enter the number without a leading 0";
  if (m.length < c.min || m.length > c.max) return c.min === c.max ? `Enter a valid ${c.min}-digit mobile number` : `Enter a valid ${c.min} to ${c.max}-digit mobile number`;
  if (c.pattern && !c.pattern.test(m)) return `Enter a valid ${c.name} mobile number`;
  return "";
};

/** "+91 98765 43210" for display. */
export const formatPhone = (dial, mobile) => (mobile ? `${dial || DEFAULT_DIAL} ${mobile}` : "");
