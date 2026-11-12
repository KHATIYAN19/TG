import { withImages, withVideo } from "../demoMedia";
/* DUMMY DATA for the Thank You page. Same shape the live page will be given later. */
export const DEFAULT_GREETING = "Happy Thanksgiving";

export const DUMMY_THANKS = {
  recipientName: "Emma",
  senderName: "Ravi",
  audience: "friend",
  question: DEFAULT_GREETING, // the greeting shown above the title
  since: "",
  message:
    "Dear Emma,\n\nI don't say it often enough, so I'm saying it properly today: thank you.\n\nThank you for answering my calls at odd hours, for sitting with me when I had nothing to say, and for celebrating my small wins like they were huge. You've made hard days lighter and good days brighter, and I'm so lucky you're in my life.\n\nWhatever I have to be thankful for this year, you are right at the top of the list. Happy Thanksgiving!",
  wishes: [],
  people: [],
  reasons: [
    "You listen without judging",
    "You showed up when I needed you most",
    "You laugh at my worst jokes",
    "You remember the little things",
    "You make ordinary days feel special",
    "You believe in me, even when I don't",
  ],
  timeline: [
    { id: "t1", date: "The very beginning", title: "The day we met", note: "I had no idea how much it would change." },
    { id: "t2", date: "A tough year", title: "You were there", note: "You didn't say much. You just stayed. It meant everything." },
    { id: "t3", date: "Last month", title: "That late-night call", note: "Two hours of talking and I felt like myself again." },
  ],
  stats: [
    { id: "s1", label: "Cups of chai shared", value: "300" },
    { id: "s2", label: "Late-night calls", value: "120" },
    { id: "s3", label: "Years of friendship", value: "8" },
  ],
  promises: ["I will always pick up when you call", "I will cheer for you the way you cheer for me", "I will never take you for granted"],
  gifts: [
    { id: 1, title: "Coffee on me", note: "Any time, any place. Just say when." },
    { id: 2, title: "Dinner at my place", note: "Your favourite dishes, cooked badly but with love." },
  ],
  photos: withImages([
    { id: "p1", caption: "That day out", tone: ["#ffd27d", "#f2a33c"], emoji: "🌳" },
    { id: "p2", caption: "Chai break", tone: ["#ffb199", "#d9611e"], emoji: "☕" },
    { id: "p3", caption: "Silly selfie", tone: ["#c7b8ff", "#8f9bff"], emoji: "🤳" },
    { id: "p4", caption: "Our favourite spot", tone: ["#9be7d0", "#4cc9f0"], emoji: "🌇" },
  ]),
  mainPhotoId: "p1",
  video: null,
};
