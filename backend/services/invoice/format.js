const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const below1000 = (n) => {
  const parts = [];
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} Hundred`);
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : ""));
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(" ");
};

const wholeInWords = (n) => {
  if (n === 0) return "Zero";
  const units = [
    [10000000, "Crore"],
    [100000, "Lakh"],
    [1000, "Thousand"],
  ];
  const out = [];
  for (const [size, name] of units) {
    if (n >= size) {
      out.push(`${wholeInWords(Math.floor(n / size))} ${name}`);
      n %= size;
    }
  }
  if (n > 0) out.push(below1000(n));
  return out.join(" ");
};

/** 1499.5 -> "Rupees One Thousand Four Hundred Ninety-Nine and Fifty Paise Only" (Indian lakh/crore system). */
export const amountInWords = (amount) => {
  const paise = Math.round((Number(amount) + Number.EPSILON) * 100);
  if (!Number.isFinite(paise) || paise < 0) return "";
  const rupees = Math.floor(paise / 100);
  const ps = paise % 100;
  let text = `Rupees ${wholeInWords(rupees)}`;
  if (ps) text += ` and ${wholeInWords(ps)} Paise`;
  return `${text} Only`;
};

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/** Plain amount with Indian digit grouping: 1234567.5 -> "12,34,567.50". The currency symbol is added by the caller. */
export const formatAmount = (n) =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(round2(n));

const istParts = (date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(date));
  return Object.fromEntries(parts.map((p) => [p.type, p.value]));
};

/** "19 Nov 2026, 04:35 PM IST" */
export const formatIst = (date) => {
  if (!date) return "";
  const p = istParts(date);
  return `${p.day} ${p.month} ${p.year}, ${p.hour}:${p.minute} ${String(p.dayPeriod).toUpperCase()} IST`;
};

/** The calendar year in India when the payment happened (the invoice-number year resets on 1 Jan IST). */
export const istYear = (date) => Number(istParts(date).year);
