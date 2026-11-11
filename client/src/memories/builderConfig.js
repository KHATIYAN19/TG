import { BIRTHDAY_EDITOR } from "./templates/birthday/SenderEditor";
import { EDITOR as SORRY_EDITOR } from "./templates/sorry/editor";
import { EDITOR as PROPOSAL_EDITOR } from "./templates/proposal/editor";
import { EDITOR as ANNIVERSARY_EDITOR } from "./templates/anniversary/editor";
import { EDITOR as THANKS_EDITOR } from "./templates/thanks/editor";
import { QUESTION_PRESETS } from "./templates/proposal/dummy";
import { GREETING_PRESETS } from "./templates/thanks/audiences";

/*
  THE PAGE BUILDER'S RULES, one entry per template: which fields the sender fills in (the same config the live customize panel uses),
  what a brand-new page starts with, and how the form turns into what the server stores.
*/
export const BUILDERS = {
  birthday: { editor: BIRTHDAY_EDITOR, fields: ["age", "gifts", "wishes"], blurb: "Their name, age, balloon wishes, gifts and a letter." },
  sorry: { editor: SORRY_EDITOR, fields: ["gifts", "promises", "wishes"], blurb: "Your apology, promises and little peace offerings." },
  proposal: { editor: PROPOSAL_EDITOR, fields: ["since", "question", "timeline", "reasons", "promises", "wishes"], blurb: "Your question, your story, why it's them and your vows." },
  anniversary: { editor: ANNIVERSARY_EDITOR, fields: ["since", "timeline", "reasons", "stats", "promises", "gifts", "wishes"], blurb: "Your date, story, reasons, numbers, promises and gifts." },
  thanks: { editor: THANKS_EDITOR, fields: ["audience", "question", "people", "reasons", "timeline", "stats", "promises", "gifts", "wishes"], blurb: "Who you're thanking, what you're grateful for, and a letter." },
};

export const emptyData = (templateId, senderName = "") => ({
  recipientName: "", senderName, message: "", age: null, gifts: [], wishes: [], promises: [], since: "",
  question: templateId === "proposal" ? QUESTION_PRESETS[0] : templateId === "thanks" ? GREETING_PRESETS[0] : "",
  audience: templateId === "thanks" ? "friend" : "", people: [], timeline: [], reasons: [], stats: [],
});

/** A page as the server sends it, shaped like the form (ids are kept so list items stay stable while editing). */
export const toForm = (page) => ({
  recipientName: page.recipientName || "", senderName: page.senderName || "", message: page.message || "", age: page.age ?? null,
  gifts: (page.gifts || []).map((g, i) => ({ id: g.id || `g${i}`, title: g.title || "", note: g.note || "", emoji: g.emoji || "" })),
  wishes: page.wishes || [], promises: page.promises || [], since: page.since || "", question: page.question || "", audience: page.audience || "",
  people: (page.people || []).map((x, i) => ({ id: x.id || `pp${i}`, date: x.date || "", title: x.title || "", note: x.note || "" })),
  timeline: (page.timeline || []).map((x, i) => ({ id: x.id || `t${i}`, date: x.date || "", title: x.title || "", note: x.note || "" })),
  reasons: page.reasons || [],
  stats: (page.stats || []).map((x, i) => ({ id: x.id || `s${i}`, label: x.label || "", value: x.value || "" })),
});

const trimmed = (arr) => (arr || []).map((x) => String(x || "").trim()).filter(Boolean);
const entries = (arr) => (arr || []).filter((x) => x.title && x.title.trim()).map((x) => ({ date: (x.date || "").trim(), title: x.title.trim(), note: (x.note || "").trim() }));

/** The form -> the body the server accepts. Blank rows are dropped; only fields this template uses are sent. */
export const toPayload = (templateId, data, themeId, { withNames = true } = {}) => {
  const use = new Set(BUILDERS[templateId].fields);
  return {
    ...(withNames ? { recipientName: data.recipientName.trim(), senderName: data.senderName.trim() } : {}),
    message: (data.message || "").trim(),
    style: themeId,
    ...(use.has("age") ? { age: data.age || null } : {}),
    ...(use.has("gifts") ? { gifts: (data.gifts || []).filter((g) => g.title && g.title.trim()).map((g) => ({ title: g.title.trim(), note: (g.note || "").trim(), emoji: (g.emoji || "").trim() })) } : {}),
    ...(use.has("wishes") ? { wishes: trimmed(data.wishes) } : {}),
    ...(use.has("promises") ? { promises: trimmed(data.promises) } : {}),
    ...(use.has("reasons") ? { reasons: trimmed(data.reasons) } : {}),
    ...(use.has("since") ? { since: data.since || "" } : {}),
    ...(use.has("question") ? { question: (data.question || "").trim() } : {}),
    ...(use.has("audience") ? { audience: data.audience || "" } : {}),
    ...(use.has("people") ? { people: entries(data.people) } : {}),
    ...(use.has("timeline") ? { timeline: entries(data.timeline) } : {}),
    ...(use.has("stats") ? { stats: (data.stats || []).filter((x) => x.label && x.label.trim() && x.value && String(x.value).trim()).map((x) => ({ label: x.label.trim(), value: String(x.value).trim() })) } : {}),
  };
};

/** The page's uploaded photos and videos, shaped like the gallery on the template pages expect them. */
export const galleryFrom = (media = []) => {
  const photos = media.filter((m) => m.kind === "photo" && m.url).map((m) => ({ id: m.id, url: m.url, caption: m.caption || "", w: m.width || null, h: m.height || null }));
  const video = media.find((m) => m.kind === "video" && m.isMain && m.url) || media.find((m) => m.kind === "video" && m.url);
  const main = media.find((m) => m.kind === "photo" && m.isMain);
  return photos.length || video ? { photos, video: video ? { id: video.id, url: video.url, caption: video.caption || "", w: video.width || null, h: video.height || null } : null, mainPhotoId: main?.id || photos[0]?.id } : null;
};
