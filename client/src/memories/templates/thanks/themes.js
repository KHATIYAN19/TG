/*
  THANK YOU THEMES
  The sender picks one. "Harvest" is the default (autumn leaves, pumpkins: made for Thanksgiving).
  Variable names match the Birthday template so the shared pieces take on the colours automatically.
*/
export const DEFAULT_THEME = "harvest";

const BASE = {
  "--bd-card": "rgba(255,255,255,.82)", "--bd-card-solid": "#ffffff", "--bd-on-accent": "#ffffff",
  "--ch-1": "#6b3a22", "--ch-2": "#8a5133", "--ch-3": "#4a2514",
};

export const THEMES = {
  harvest: {
    id: "harvest", name: "Autumn Harvest", blurb: "Falling leaves, pumpkins and warm oranges", dark: false, art: "pumpkin",
    swatch: ["#d9611e", "#f2a33c", "#fff1dc"],
    confetti: ["#d9611e", "#f2a33c", "#c0392b", "#8a5133", "#ffd27d", "#ffffff"],
    shapes: ["petal", "petal", "circle", "star", "rect"], giftPattern: "waves", boxes: ["classic", "hat", "tall", "bag"],
    float: [["leaf", 22, "down"], ["petal", 8, "down"], ["sparkle", 5, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#fff1dc", "--bd-bg-b": "#ffd0a0", "--bd-bg-c": "#ffe6c7", "--bd-ink": "#4a2410", "--bd-muted": "#8a5233", "--bd-line": "rgba(217,97,30,.3)", "--bd-accent": "#d9611e", "--bd-accent-2": "#f2a33c", "--gift-1": "#d9611e", "--gift-2": "#f2a33c", "--gift-3": "#8a5133", "--gift-4": "#c0392b", "--th-leaf-1": "#d9611e", "--th-leaf-2": "#f2a33c", "--th-leaf-3": "#c0392b", "--th-leaf-4": "#b8860b" },
  },
  cozy: {
    id: "cozy", name: "Cozy Hearth", blurb: "Candlelight, warm browns and a crackling fire", dark: true, art: "pumpkin",
    swatch: ["#ffb454", "#c0643a", "#2a1810"],
    confetti: ["#ffb454", "#ff8a4c", "#ffe0a8", "#c0643a", "#ffffff", "#e8a04c"],
    shapes: ["circle", "star", "petal", "rect"], giftPattern: "dots", boxes: ["classic", "velvet", "hat", "tall"],
    float: [["firefly", 18, "up"], ["leaf", 10, "down"], ["sparkle", 8, "twinkle"]],
    vars: { ...BASE, "--bd-bg-a": "#2a1810", "--bd-bg-b": "#4a2a1a", "--bd-bg-c": "#3a2014", "--bd-ink": "#fff0e0", "--bd-muted": "#e0bf9f", "--bd-card": "rgba(255,255,255,.08)", "--bd-card-solid": "#3a2014", "--bd-line": "rgba(255,180,84,.34)", "--bd-accent": "#ffb454", "--bd-accent-2": "#ff8a4c", "--bd-on-accent": "#2a1810", "--bd-name-a": "#ffb454", "--bd-name-b": "#ffe0a8", "--gift-1": "#ffb454", "--gift-2": "#c0643a", "--gift-3": "#e8a04c", "--gift-4": "#a8452a", "--th-leaf-1": "#ffb454", "--th-leaf-2": "#ff8a4c", "--th-leaf-3": "#e8a04c", "--th-leaf-4": "#c0643a" },
  },
  sunshine: {
    id: "sunshine", name: "Sunshine", blurb: "Bright, happy yellows and sunflowers", dark: false, art: "sunflower",
    swatch: ["#f2b705", "#ff9f1c", "#fff8d6"],
    confetti: ["#f2b705", "#ffd23c", "#ff9f1c", "#ffffff", "#7bbf5a", "#fff0a0"],
    shapes: ["star", "circle", "petal", "rect"], giftPattern: "stars", boxes: ["classic", "hat", "tall", "bag"],
    float: [["sparkle", 12, "twinkle"], ["petal", 12, "down"], ["bee", 3, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#fff8d6", "--bd-bg-b": "#ffe58a", "--bd-bg-c": "#fff2b8", "--bd-ink": "#4a3a05", "--bd-muted": "#8a6d12", "--bd-line": "rgba(242,183,5,.4)", "--bd-accent": "#d99a00", "--bd-accent-2": "#ff9f1c", "--gift-1": "#d99a00", "--gift-2": "#7bbf5a", "--gift-3": "#ff9f1c", "--gift-4": "#e8603c", "--th-leaf-1": "#d99a00", "--th-leaf-2": "#7bbf5a", "--th-leaf-3": "#ff9f1c", "--th-leaf-4": "#b8860b" },
  },
  professional: {
    id: "professional", name: "Professional", blurb: "Clean, calm and polished: perfect for colleagues", dark: false, art: "badge",
    swatch: ["#2563eb", "#14b8a6", "#eef4ff"],
    confetti: ["#2563eb", "#14b8a6", "#60a5fa", "#fbbf24", "#ffffff", "#a5b4fc"],
    shapes: ["rect", "circle", "star", "rect"], giftPattern: "dots", boxes: ["classic", "tall", "bag", "hat"],
    float: [["dot", 14, "up"], ["sparkle", 8, "twinkle"], ["star", 5, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#eef4ff", "--bd-bg-b": "#d6e4ff", "--bd-bg-c": "#e6faf6", "--bd-ink": "#0f2142", "--bd-muted": "#4a5f85", "--bd-line": "rgba(37,99,235,.26)", "--bd-accent": "#2563eb", "--bd-accent-2": "#14b8a6", "--gift-1": "#2563eb", "--gift-2": "#14b8a6", "--gift-3": "#fbbf24", "--gift-4": "#6366f1", "--th-leaf-1": "#2563eb", "--th-leaf-2": "#14b8a6", "--th-leaf-3": "#6366f1", "--th-leaf-4": "#0ea5e9" },
  },
  meadow: {
    id: "meadow", name: "Spring Meadow", blurb: "Fresh greens, wildflowers and butterflies", dark: false, art: "sunflower",
    swatch: ["#3fa34d", "#f78fb3", "#eaf8e6"],
    confetti: ["#3fa34d", "#7bd389", "#f78fb3", "#ffd35c", "#ffffff", "#a98bff"],
    shapes: ["petal", "petal", "circle", "heart", "star"], giftPattern: "dots", boxes: ["classic", "hat", "bag", "tall"],
    float: [["petal", 14, "down"], ["leaf", 10, "down"], ["butterfly", 5, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#eaf8e6", "--bd-bg-b": "#c9ecc4", "--bd-bg-c": "#fff0f5", "--bd-ink": "#1f3d24", "--bd-muted": "#4f7a56", "--bd-line": "rgba(63,163,77,.34)", "--bd-accent": "#2f8f3f", "--bd-accent-2": "#f06292", "--gift-1": "#2f8f3f", "--gift-2": "#f06292", "--gift-3": "#ffb300", "--gift-4": "#8b6bd9", "--th-leaf-1": "#2f8f3f", "--th-leaf-2": "#7bd389", "--th-leaf-3": "#f06292", "--th-leaf-4": "#ffb300" },
  },
  twilight: {
    id: "twilight", name: "Twilight", blurb: "A deep blue evening with golden stars", dark: true, art: "moon",
    swatch: ["#ffd86b", "#8b9bff", "#0e1433"],
    confetti: ["#ffd86b", "#fff3b0", "#8b9bff", "#ffffff", "#ffa6c9", "#b7a6ff"],
    shapes: ["star", "circle", "star", "rect"], giftPattern: "stars", boxes: ["velvet", "classic", "tall", "hat"],
    float: [["star", 12, "twinkle"], ["sparkle", 12, "twinkle"], ["firefly", 8, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#0e1433", "--bd-bg-b": "#1c2566", "--bd-bg-c": "#2a1d5a", "--bd-ink": "#f3f4ff", "--bd-muted": "#b6bdf2", "--bd-card": "rgba(255,255,255,.09)", "--bd-card-solid": "#1c2566", "--bd-line": "rgba(255,216,107,.32)", "--bd-accent": "#ffd86b", "--bd-accent-2": "#8b9bff", "--bd-on-accent": "#1a1440", "--bd-name-a": "#ffd86b", "--bd-name-b": "#fff3b0", "--gift-1": "#ffd86b", "--gift-2": "#8b9bff", "--gift-3": "#ffa6c9", "--gift-4": "#b7a6ff", "--th-leaf-1": "#ffd86b", "--th-leaf-2": "#8b9bff", "--th-leaf-3": "#ffa6c9", "--th-leaf-4": "#b7a6ff" },
  },
};

Object.values(THEMES).forEach((t) => { t.balloons = t.confetti; });

/* same order as TEMPLATE_THEMES.thanks in the backend (the first one is the default) */
export const THEME_IDS = ["harvest", "cozy", "sunshine", "professional", "meadow", "twilight"];
export const THEME_LIST = THEME_IDS.map((id) => THEMES[id]);
export const resolveTheme = (id) => THEMES[id] || THEMES[DEFAULT_THEME];
