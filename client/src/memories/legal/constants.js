/* Facts shared by the legal pages, the footer and the help links. Change them here. */
export const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
export const BRAND = "Target Trek";
export const PRODUCT = "Memories";
export const SITE_URL = "https://www.targettrek.in";
/* every page stays online this many days from the day it is created, then it is permanently removed (the server enforces it) */
export const PAGE_LIFETIME_DAYS = 30;
export const LEGAL_UPDATED = "9 November 2026";

export const LEGAL_LINKS = [
  ["Terms", "/memories/terms"],
  ["Privacy", "/memories/privacy"],
  ["Refunds", "/memories/refund"],
  ["Contact", "/memories/contact"],
];

export const mailto = (subject = "", body = "") =>
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
