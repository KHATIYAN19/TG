import { withImages, withVideo } from "../demoMedia";
/* DUMMY DATA for the Proposal page. Same shape the live page will be given later. */
export const DEFAULT_QUESTION = "Will you marry me?";
export const DEFAULT_LINES = ["I have something to ask you.", "You make every day better.", "I can't imagine my life without you.", "Please read till the end."];
export const QUESTION_PRESETS = ["Will you marry me?", "Will you be my girlfriend?", "Will you be my boyfriend?", "Will you be mine forever?", "Will you go out with me?"];

/* A marriage-type question gets a ring; anything else gets a heart locket. */
export const kindFor = (q) => (/marry|wife|husband|spouse|engage|ring/i.test(q || "") ? "ring" : "heart");

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const yearsAgo = (y, m = 0) => { const t = new Date(); t.setFullYear(t.getFullYear() - y); t.setMonth(t.getMonth() - m); return iso(t); };

export const DUMMY_PROPOSAL = {
  recipientName: "Emma",
  senderName: "James",
  question: DEFAULT_QUESTION,
  since: yearsAgo(2, 5),
  message:
    "Emma,\n\nI have rehearsed this a hundred times and still my hands are shaking. So I will just say it the way it is.\n\nYou are the first person I want to tell good news to and the last person I want to talk to at night. You turned a city into home and a regular Tuesday into my favourite day.\n\nI don't need a perfect moment. I only need you. Whatever you answer, thank you for being exactly who you are.",
  wishes: DEFAULT_LINES,
  timeline: [
    { id: "t1", date: "A rainy evening", title: "The day we met", note: "You shared your umbrella and I never gave it back." },
    { id: "t2", date: "A few weeks later", title: "Our first date", note: "We talked until the cafe closed and then kept talking outside." },
    { id: "t3", date: "That summer", title: "I knew", note: "Somewhere between the wrong turns and the best sunset, I just knew." },
    { id: "t4", date: "Last year", title: "We made a home", note: "Two toothbrushes, one very comfy sofa." },
  ],
  reasons: [
    "The way you laugh at your own jokes",
    "How you remember the tiny things",
    "You make every place feel like home",
    "Your kindness to everyone, even strangers",
    "You believe in me when I forget to",
    "Because you are simply, completely you",
  ],
  promises: [
    "I will hold your hand through every storm",
    "I will always make you laugh",
    "I will choose you, every single day",
  ],
  gifts: [],
  stats: [],
  photos: withImages([
    { id: "p1", caption: "Our first trip", tone: ["#ffb3d1", "#ff8fa3"], emoji: "🏖️" },
    { id: "p2", caption: "That silly selfie", tone: ["#ffd27d", "#ff9d5c"], emoji: "🤪" },
    { id: "p3", caption: "Coffee and gossip", tone: ["#c7b8ff", "#8f9bff"], emoji: "☕" },
    { id: "p4", caption: "Sunset walk", tone: ["#ffb199", "#ff6b9d"], emoji: "🌇" },
  ]),
  mainPhotoId: "p1",
  video: null,
};
