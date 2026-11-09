import { THEME_LIST } from "./themes";
import { AUDIENCES, GREETING_PRESETS } from "./audiences";

/* What the sender can fill in for this template (used by the live customize panel and the page builder). */
export const EDITOR = {
  themes: THEME_LIST, age: false, since: false, audiences: AUDIENCES,
  question: true, questionLabel: "Greeting above the title", questionPlaceholder: "Happy Thanksgiving", questionPresets: GREETING_PRESETS,
  people: true, peopleTitle: "More people to thank (optional)",
  peopleHint: <>Thanking more than one person? Add a card for each with their name and why you are thankful. <b>None? That section is hidden.</b></>,
  reasons: true, reasonsTitle: "Things you are thankful for",
  reasonsHint: <>Each one becomes a leaf on the gratitude tree. <b>None? The tree is hidden.</b></>,
  timeline: true, timelineTitle: "Moments that mattered",
  timelineHint: <>Key moments in order, like &ldquo;Launch day&rdquo; or &ldquo;When you helped me move&rdquo;. <b>None? The timeline is hidden.</b></>,
  stats: true, statsTitle: "Numbers", statsHint: <>Facts like &ldquo;Projects shipped&rdquo; and &ldquo;12&rdquo;. They count up on the page.</>,
  promises: true, promisesTitle: "Your promises going forward",
  promisesHint: <>How you will pay it forward. They appear as cards to flip open. <b>None? That section is hidden.</b></>,
  giftsTitle: "A small gift (optional)",
  giftsHint: <>Name each gift, like &ldquo;An extra day off&rdquo;. They tap a box to open it. <b>None? That section is hidden.</b></>,
  giftSuggestions: ["Coffee on me", "An extra day off", "Team lunch", "A handwritten card", "Dinner at my place", "A gift card"],
  wishesTitle: "Lines under the title",
  wishesHint: "Short lines that type out on the first screen. Leave empty for lines that match who you are thanking.",
  messageTitle: "Your letter",
};
