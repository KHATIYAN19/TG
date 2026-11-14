import { THEME_LIST } from "./themes";
import { AUDIENCES, WISH_QUESTIONS } from "./audiences";

/* What the sender can fill in for this template (used by the live customize panel and the page builder). */
export const EDITOR = {
  themes: THEME_LIST, age: false, since: false, audiences: AUDIENCES,
  question: true, questionLabel: "The wish you ask them", questionPlaceholder: "What do you wish for this Christmas?", questionPresets: WISH_QUESTIONS,
  reasons: true, reasonsTitle: "Wishes for them",
  reasonsHint: <>Each one hangs on the Christmas tree as an ornament they tap to read. <b>None? The tree is hidden.</b></>,
  timeline: true, timelineTitle: "Moments from this year",
  timelineHint: <>Your year in order, like &ldquo;The road trip&rdquo; or &ldquo;Our first snow&rdquo;. <b>None? The timeline is hidden.</b></>,
  stats: false,
  promises: true, promisesTitle: "Your promises for next year",
  promisesHint: <>They appear as cards to flip open. <b>None? That section is hidden.</b></>,
  giftsTitle: "Gifts under the tree",
  giftsHint: <>Name each gift, like &ldquo;Hot chocolate date&rdquo;. They tap a box to open it. <b>None? That section is hidden.</b></>,
  giftSuggestions: ["Hot chocolate date", "A movie night", "Dinner at my place", "A handwritten card", "A day out", "A surprise trip"],
  wishesTitle: "Lines under the title",
  wishesHint: "Short lines that type out on the first screen. Leave empty for lines that match who it is for.",
  messageTitle: "Your Christmas letter",
};
