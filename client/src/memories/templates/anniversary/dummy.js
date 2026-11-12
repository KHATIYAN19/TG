import { withImages, withVideo } from "../demoMedia";
/* DUMMY DATA for the Anniversary page. Same shape the live page will be given later. */
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const yearsAgo = (y, m = 0, d = 0) => { const t = new Date(); t.setFullYear(t.getFullYear() - y); t.setMonth(t.getMonth() - m); t.setDate(t.getDate() - d); return iso(t); };

export const DEFAULT_LINES = ["Every day with you is my favourite.", "You are my home.", "I would choose you again and again.", "Forever is just the beginning."];

export const DUMMY_ANNIVERSARY = {
  recipientName: "Emma",
  senderName: "Ravi",
  since: yearsAgo(3, 4, 9),
  message:
    "My love,\n\nI still remember the first time I saw you laugh, and how the whole room seemed to get lighter. I had no idea then that you would become my favourite person, my safest place and my best friend.\n\nThank you for every ordinary day you made feel special. For the late-night chats, the silly dances in the kitchen, the way you hold my hand when I'm nervous and never let go. You make me want to be better, every single day.\n\nI don't know what the future holds, but I know I want to spend all of it with you. Happy Anniversary, my heart.",
  wishes: ["Happy Anniversary, my love", "Every day with you is my favourite", "You are my home", "I would choose you again and again", "Forever is just the beginning"],
  timeline: [
    { id: "t1", date: "A rainy evening", title: "The day we met", note: "You shared your umbrella and I never gave it back." },
    { id: "t2", date: "A few weeks later", title: "Our first date", note: "We talked until the cafe closed and then kept talking outside." },
    { id: "t3", date: "That summer", title: "Our first trip together", note: "Wrong turns, great playlists and the best sunsets." },
    { id: "t4", date: "One quiet night", title: "Our first \"I love you\"", note: "I said it first. You said it better." },
    { id: "t5", date: "Last year", title: "We made a home", note: "Two toothbrushes, one very comfy sofa." },
  ],
  reasons: [
    "The way you laugh at your own jokes",
    "How you always remember the little things",
    "You make every place feel like home",
    "Your kindness to everyone, even strangers",
    "The way you sing in the shower",
    "How you hold my hand without thinking",
    "You believe in me when I forget to",
    "Your terrible, wonderful dance moves",
    "You make ordinary days feel like holidays",
    "Because you are simply, completely you",
  ],
  stats: [
    { id: "s1", label: "Movies watched together", value: "186" },
    { id: "s2", label: "Cups of chai shared", value: "1,000" },
    { id: "s3", label: "Sunsets we watched", value: "214" },
    { id: "s4", label: "Songs on our playlist", value: "312" },
  ],
  promises: [
    "I will hold your hand through every storm",
    "I will always make you laugh",
    "I will never stop dating you",
    "I will choose you, every single day",
  ],
  gifts: [
    { id: 1, title: "A candlelit dinner", note: "Just us, your favourite food and a very long hug." },
    { id: 2, title: "Our love story, framed", note: "Every photo we love, in one place." },
    { id: 3, title: "A weekend getaway", note: "Pack a bag. I've planned everything." },
    { id: 4, title: "A promise ring", note: "A small circle for a very big promise." },
  ],
  photos: withImages([
    { id: "p1", caption: "Our first trip", tone: ["#ffb3d1", "#ff8fa3"], emoji: "🏖️" },
    { id: "p2", caption: "That silly selfie", tone: ["#ffd27d", "#ff9d5c"], emoji: "🤪" },
    { id: "p3", caption: "Coffee and gossip", tone: ["#c7b8ff", "#8f9bff"], emoji: "☕" },
    { id: "p4", caption: "Sunset walk", tone: ["#ffb199", "#ff6b9d"], emoji: "🌇" },
    { id: "p5", caption: "Road trip songs", tone: ["#9be7d0", "#4cc9f0"], emoji: "🚗" },
    { id: "p6", caption: "Our first home", tone: ["#ffe29f", "#ffa99f"], emoji: "🏡" },
  ]),
  mainPhotoId: "p1",
  video: withVideo({ id: "v1", caption: "Our favourite memory", tone: ["#a18cd1", "#fbc2eb"] }),
};
