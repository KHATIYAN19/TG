/*
  Lightweight, client-side hint that mirrors the server's contact-info filter.
  It exists only to warn people while they type; the SERVER is the authority
  and rejects anything that slips through here.
*/
const norm = (v) =>
  String(v || "")
    .normalize("NFKC")
    .replace(/[\u200B-\u200F\u2060\uFEFF]/g, "")
    .toLowerCase();

export const looksLikeContact = (text, { entity = false } = {}) => {
  const t = norm(text);
  if (!t.trim()) return false;

  if (/[a-z0-9._%+-]+\s*(?:@|\(\s*at\s*\)|\[\s*at\s*\])\s*[a-z0-9-]+\s*(?:\.|\(\s*dot\s*\)|\bdot\b)\s*[a-z]{2,}/.test(t)) return true;
  if (/(?:\d[\s().\-_/]*){9,}/.test(t.replace(/\b(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}\b/g, " "))) return true;
  if (/\+\s*\d{1,3}[\s.-]*\d{3,}/.test(t)) return true;
  if (/(?:https?:)?\/\/\S+|\bwww\s*\./.test(t)) return true;
  if (/(?:^|[\s([{,;:])@[a-z0-9._]{3,}/.test(t)) return true;

  if (!entity) {
    const cleaned = t.replace(/(socket\.io|node\.js|asp\.net|\.net|next\.js|nuxt\.js|vue\.js|react\.js|express\.js)/g, " ");
    if (/\b[a-z0-9-]{2,}\.(?:com|in|io|me|co|net|org|app|dev|ly|ai|xyz|tech|info)\b/.test(cleaned)) return true;
    if (/\b(?:whats\s?app|telegram|insta(?:gram)?|snapchat|discord|linkedin)\b[^a-z0-9]{0,6}(?:id|handle|number|me|dm|@|\d)/.test(t)) return true;
    if (/\b(?:dm|message|text|ping|call|mail|email)\s+me\b|\bmy\s+(?:number|phone|mobile|email|whatsapp)\b|\bmy\s+name\s+is\b/.test(t)) return true;
  }
  return false;
};

export const CONTACT_WARNING =
  "That looks like contact information. Please remove it. You can share it with your buddy after you match.";
