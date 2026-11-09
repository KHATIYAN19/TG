/*
  SORRY THEMES
  The sender picks one. Each has its own mascot that is sad at first and cheers up as the receiver comforts
  it, its own colours, decor and floating things. Variable names match the Birthday template so the shared
  pieces (gifts, chocolate, gallery, letter, volume) pick up the colours automatically.
*/
export const DEFAULT_THEME = "teddy";

const BASE = {
  "--bd-card": "rgba(255,255,255,.8)", "--bd-card-solid": "#ffffff", "--bd-on-accent": "#ffffff",
  "--ch-1": "#6b3a22", "--ch-2": "#8a5133", "--ch-3": "#4a2514",
};

export const THEMES = {
  teddy: {
    id: "teddy", name: "Teddy Hugs", blurb: "Honey colours and a teddy who needs a hug", dark: false, mascot: "teddy",
    swatch: ["#c2693a", "#ffb98a", "#fff0de"],
    confetti: ["#c2693a", "#ff8fa3", "#f2b84b", "#ffd9b8", "#ffffff", "#7aa874"],
    shapes: ["heart", "heart", "circle", "star", "petal"], giftPattern: "hearts",
    float: [["bear", 7, "up"], ["heart", 12, "up"], ["star", 6, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#fff0de", "--bd-bg-b": "#ffdcbf", "--bd-bg-c": "#ffe8d6", "--bd-ink": "#4a2a18", "--bd-muted": "#8a5a3c", "--bd-line": "rgba(194,105,58,.28)", "--bd-accent": "#c2693a", "--bd-accent-2": "#ff8fa3", "--gift-1": "#c2693a", "--gift-2": "#ff8fa3", "--gift-3": "#f2b84b", "--gift-4": "#7aa874" },
  },
  rain: {
    id: "rain", name: "Rain & Rainbow", blurb: "Grey skies that clear into a rainbow as you forgive", dark: false, mascot: "cloud",
    swatch: ["#3b82f6", "#9cc7ff", "#cfd8e3"],
    confetti: ["#ef4444", "#f59e0b", "#facc15", "#22c55e", "#3b82f6", "#a855f7", "#ffffff"],
    shapes: ["circle", "rect", "star", "heart"], giftPattern: "dots",
    float: [["sparkle", 10, "up"], ["heart", 5, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#d4efff", "--bd-bg-b": "#fff1c9", "--bd-bg-c": "#ffd9ec", "--bd-ink": "#1d3552", "--bd-muted": "#51708f", "--bd-line": "rgba(59,130,246,.28)", "--bd-accent": "#3b82f6", "--bd-accent-2": "#ec4899", "--gift-1": "#3b82f6", "--gift-2": "#ec4899", "--gift-3": "#f59e0b", "--gift-4": "#22c55e" },
  },
  rose: {
    id: "rose", name: "Rose Garden", blurb: "A drooping rose that blooms again", dark: false, mascot: "rose",
    swatch: ["#be123c", "#f9a8c4", "#ffe9ee"],
    confetti: ["#be123c", "#f472b6", "#fda4af", "#ffe4e6", "#ffffff"],
    shapes: ["petal", "petal", "heart", "rect"], giftPattern: "hearts",
    float: [["petal", 16, "down"], ["heart", 6, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#ffe9ee", "--bd-bg-b": "#fbc9d6", "--bd-bg-c": "#fff1ee", "--bd-ink": "#4c0519", "--bd-muted": "#9a3b5a", "--bd-line": "rgba(190,18,60,.26)", "--bd-accent": "#be123c", "--bd-accent-2": "#f472b6", "--gift-1": "#be123c", "--gift-2": "#f472b6", "--gift-3": "#9f1239", "--gift-4": "#fb7185" },
  },
  starry: {
    id: "starry", name: "Starry Night", blurb: "A little star that wishes it could take it back", dark: true, mascot: "star",
    swatch: ["#ffd86b", "#8ea2ff", "#0b1030"],
    confetti: ["#ffd86b", "#8ea2ff", "#c4b5fd", "#ffffff", "#7dd3fc"],
    shapes: ["star", "star", "circle", "rect"], giftPattern: "stars",
    float: [["star", 16, "twinkle"], ["sparkle", 8, "twinkle"], ["firefly", 10, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#0b1030", "--bd-bg-b": "#1a1f4d", "--bd-bg-c": "#2b2466", "--bd-ink": "#eef1ff", "--bd-muted": "#aab3e8", "--bd-card": "rgba(255,255,255,.09)", "--bd-card-solid": "#1a1f4d", "--bd-line": "rgba(255,216,107,.3)", "--bd-accent": "#ffd86b", "--bd-accent-2": "#8ea2ff", "--bd-on-accent": "#1a1740", "--bd-name-a": "#ffd86b", "--bd-name-b": "#ffeaa8", "--gift-1": "#ffd86b", "--gift-2": "#8ea2ff", "--gift-3": "#c4b5fd", "--gift-4": "#7dd3fc" },
  },
  sunflower: {
    id: "sunflower", name: "Sunny Sunflowers", blurb: "A drooping sunflower and a field of fresh starts", dark: false, mascot: "sunflower",
    swatch: ["#f59e0b", "#ffe27a", "#16a34a"],
    confetti: ["#f59e0b", "#facc15", "#fde68a", "#16a34a", "#ffffff"],
    shapes: ["petal", "petal", "circle", "star"], giftPattern: "dots",
    float: [["bee", 3, "up"], ["petal", 10, "down"], ["sparkle", 6, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#fff6bf", "--bd-bg-b": "#ffe27a", "--bd-bg-c": "#ffedd0", "--bd-ink": "#4a3200", "--bd-muted": "#8a6a1a", "--bd-line": "rgba(245,158,11,.32)", "--bd-accent": "#e08700", "--bd-accent-2": "#16a34a", "--bd-name-a": "#e08700", "--bd-name-b": "#f5b400", "--gift-1": "#f59e0b", "--gift-2": "#16a34a", "--gift-3": "#ef4444", "--gift-4": "#8b5cf6" },
  },
  friends: {
    id: "friends", name: "Friends Again", blurb: "Two friends who drifted apart, and a puzzle that fits", dark: false, mascot: "friends",
    swatch: ["#00a896", "#ff7a45", "#ffc233"],
    confetti: ["#00a896", "#ff7a45", "#ffc233", "#7c5cff", "#ff5c8a", "#ffffff"],
    shapes: ["star", "heart", "rect", "circle"], giftPattern: "stars",
    float: [["puzzle", 8, "up"], ["star", 8, "up"], ["heart", 4, "up"], ["note", 4, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#d9f6f2", "--bd-bg-b": "#fff3c4", "--bd-bg-c": "#ffe0c7", "--bd-ink": "#0f3b3a", "--bd-muted": "#3f7a77", "--bd-line": "rgba(0,168,150,.3)", "--bd-accent": "#00a896", "--bd-accent-2": "#ff7a45", "--bd-name-a": "#00a896", "--bd-name-b": "#2bc4e8", "--gift-1": "#00a896", "--gift-2": "#ff7a45", "--gift-3": "#ffc233", "--gift-4": "#7c5cff" },
  },
};

/* the shared floating-decor code reads `balloons` for colours; use each theme's confetti colours */
Object.values(THEMES).forEach((t) => { t.balloons = t.confetti; });

/* same order as TEMPLATE_THEMES.sorry in the backend (the first one is the default) */
export const THEME_IDS = ["teddy", "rain", "rose", "starry", "sunflower", "friends"];
export const THEME_LIST = THEME_IDS.map((id) => THEMES[id]);
export const resolveTheme = (id) => THEMES[id] || THEMES[DEFAULT_THEME];
