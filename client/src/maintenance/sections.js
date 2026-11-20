/*
  Maintenance: which page paths belong to which section.
  Turn sections on with VITE_MAINTENANCE (see maintenanceConfig.js).
  Order matters: the first match wins, so more specific prefixes come first.
*/
export const SECTION_PAGES = [
  { key: "referral", home: "/referral", paths: ["/resume-review/referral", "/referral", "/referal"] },
  { key: "resume", home: "/resume-review", paths: ["/resume-review"] },
  { key: "prep-buddy", home: "/prep-buddy", paths: ["/prep-buddy"] },
  { key: "books", home: "/books", paths: ["/books", "/book", "/payment/success", "/payment/failed"] },
  { key: "memories", home: "/memories", paths: ["/memories", "/m"] },
  { key: "mock-interviews", home: "/mock-interviews", paths: ["/mock-interviews", "/mentorship"] },
  { key: "interview-experiences", home: "/interviews", paths: ["/interviews", "/interview"] },
  { key: "blogs", home: "/blogs", paths: ["/blogs", "/blog"] },
  { key: "resources", home: "/resources", paths: ["/resources", "/learn"] },
];

/* Fallback labels, used when the status has not loaded (e.g. the build-time switch below). */
export const SECTION_LABELS = {
  books: "Books & ebooks",
  "prep-buddy": "Prep Buddy",
  resume: "Resume Lab",
  referral: "Referrals",
  memories: "Memories",
  "mock-interviews": "Mock interviews & mentorship",
  "interview-experiences": "Interview experiences",
  blogs: "Blogs",
  resources: "Free resources & learn",
};

/* Pages that stay open even during site-wide maintenance, so admins can still sign in. */
const ALWAYS_OPEN = ["/admin", "/login", "/signup", "/set-password", "/privacy-policy", "/terms-of-service", "/refund-policy"];

const under = (path, prefix) => path === prefix || path.startsWith(`${prefix}/`);

export const isAlwaysOpen = (path) => ALWAYS_OPEN.some((p) => under(path, p));

export const sectionForPath = (path) => SECTION_PAGES.find((s) => s.paths.some((p) => under(path, p)))?.key || null;

export const sectionHome = (key) => SECTION_PAGES.find((s) => s.key === key)?.home || "/";
