import { withImages, withVideo } from "../demoMedia";
/* DUMMY DATA for the Sorry page. Same shape the live page will be given later. */
export const DEFAULT_LINES = [
  "I'm so sorry.",
  "I never meant to hurt you.",
  "You deserve better than that.",
  "I miss your smile.",
  "Please, can we start again?",
];

export const DUMMY_SORRY = {
  recipientName: "Emma",
  senderName: "James",
  message:
    "Emma, I'm sorry. I know I hurt you, and no excuse in the world makes that okay. I wasn't listening, and I was careless with your feelings when you needed me most. You have always been kind to me, and you deserved the same from me.\n\nI've thought about it every day since. I miss our silly jokes, our late-night calls and the way you laugh at your own stories before you get to the end. I would give anything to take it back, but I can't, so I'm going to do better instead.\n\nWhatever you decide, thank you for reading this. You mean the world to me.",
  wishes: ["I'm so sorry, Emma", "You deserve better", "I miss your smile", "I'll do better", "Please forgive me", "You mean everything"],
  promises: [
    "I will listen before I speak",
    "I will never leave you on read",
    "I will say sorry first when I'm wrong",
    "I will make time for you, every day",
  ],
  gifts: [
    { id: 1, title: "A cup of chai", note: "Made just the way you like it." },
    { id: 2, title: "Your favourite chocolate", note: "The big bar. I'll share if you ask nicely." },
    { id: 3, title: "A long walk and a real talk", note: "No phones. Just us, and I'll listen this time." },
  ],
  photos: withImages([
    { id: "p1", caption: "Our first trip", tone: ["#ffb3d1", "#ff8fa3"], emoji: "🏖️" },
    { id: "p2", caption: "That silly selfie", tone: ["#ffd27d", "#ff9d5c"], emoji: "🤪" },
    { id: "p3", caption: "Coffee and gossip", tone: ["#c7b8ff", "#8f9bff"], emoji: "☕" },
    { id: "p4", caption: "Sunset walk", tone: ["#ffb199", "#ff6b9d"], emoji: "🌇" },
    { id: "p5", caption: "Road trip songs", tone: ["#9be7d0", "#4cc9f0"], emoji: "🚗" },
    { id: "p6", caption: "Best day ever", tone: ["#ffe29f", "#ffa99f"], emoji: "🌈" },
  ]),
  mainPhotoId: "p1",
  video: withVideo({ id: "v1", caption: "Something I want you to hear", tone: ["#a18cd1", "#fbc2eb"] }),
};
