import { withImages } from "../demoMedia";
import { DEFAULT_QUESTION } from "./audiences";

/* DUMMY DATA for the Christmas page. Same shape the live page is given. */
export const DUMMY_CHRISTMAS = {
  recipientName: "Emma",
  senderName: "James",
  audience: "friend",
  question: DEFAULT_QUESTION, // the wish they are asked to make
  since: "",
  message:
    "Dear Emma,\n\nAnother year, and somehow it is Christmas again. I wanted to make you something small to say how glad I am that you are in my life.\n\nThank you for the late-night chats, the bad jokes you laughed at anyway, and the way you show up every single time. This year was better because of you.\n\nI hope your Christmas is warm, loud, full of food and exactly the way you like it. Tell me your wish below, and let me see what I can do about it.\n\nMerry Christmas!",
  wishes: [],
  people: [],
  reasons: [
    "May your home be full of laughter",
    "I wish you a cup of hot chocolate every evening",
    "May every plan you made this year come true",
    "I wish you rest, real rest",
    "May the people you love stay close",
    "I wish you a year softer than the last",
  ],
  timeline: [
    { id: "t1", date: "January", title: "A brand new start", note: "We promised ourselves this would be our year." },
    { id: "t2", date: "June", title: "That unplanned road trip", note: "Wrong turns, great songs and the best sunset." },
    { id: "t3", date: "December", title: "Christmas lights walk", note: "Cold hands, warm hearts and way too much cocoa." },
  ],
  stats: [],
  promises: ["I will always pick up when you call", "I will plan a proper trip next year", "I will keep making you laugh"],
  gifts: [
    { id: 1, title: "Hot chocolate date", note: "A cafe of your choice. I'm paying." },
    { id: 2, title: "A movie night", note: "You pick the film. I bring the popcorn." },
  ],
  photos: withImages([
    { id: "p1", caption: "Winter walk", tone: ["#ffd6d0", "#c1121f"], emoji: "🎄" },
    { id: "p2", caption: "Cocoa break", tone: ["#f0c9a0", "#b5522a"], emoji: "☕" },
    { id: "p3", caption: "Snow day", tone: ["#cfe8ff", "#6aa9ff"], emoji: "⛄" },
    { id: "p4", caption: "Lights", tone: ["#fff3b0", "#f2b632"], emoji: "✨" },
  ]),
  mainPhotoId: "p1",
  video: null,
};
