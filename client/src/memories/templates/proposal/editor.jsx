import { THEME_LIST } from "./themes";
import { QUESTION_PRESETS } from "./dummy";

/* What the sender can fill in for this template (used by the live customize panel and the page builder). */
export const EDITOR = {
  themes: THEME_LIST, age: false, since: true, question: true, questionPresets: QUESTION_PRESETS,
  timeline: true, reasons: true, stats: false, promises: true, gifts: false,
  promisesTitle: "Your vows and promises",
  promisesHint: <>What you promise them. They appear as cards to flip open. <b>None? That section is hidden.</b></>,
  giftsTitle: "Gifts", giftsHint: "", giftSuggestions: [],
  wishesTitle: "Lines under the title",
  wishesHint: "Short lines that type out on the first screen. Leave empty for the default lines.",
  messageTitle: "Your letter (read just before the question)",
};
