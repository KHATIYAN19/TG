import { THEME_LIST } from "./themes";

/* What the sender can fill in for this template (used by the live customize panel and the page builder). */
export const EDITOR = {
  themes: THEME_LIST, age: false, since: true, timeline: true, reasons: true, stats: true, promises: true,
  promisesTitle: "Promises for the years ahead",
  promisesHint: <>What you promise each other. They appear as cards to flip open. <b>None? That section is hidden.</b></>,
  giftsTitle: "Gifts for them",
  giftsHint: <>Name each gift, like &ldquo;A candlelit dinner&rdquo;. They tap a velvet or wrapped box to open it. <b>None? That section is hidden.</b></>,
  giftSuggestions: ["A candlelit dinner", "Our love story, framed", "A weekend getaway", "A promise ring", "Flowers every month", "A handwritten letter"],
  wishesTitle: "Sweet lines",
  wishesHint: "Short lines that type out under the names and ride up on the wish lanterns. Leave empty for the default lines.",
  messageTitle: "Your letter",
};
