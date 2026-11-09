/*
  PROPOSAL THEMES
  The sender picks one. "Romance" is the default. Variable names match the Birthday template so the shared
  pieces (gallery, letter, volume) take on the colours; --pr-dark / --pr-spot colour the hushed "ask" stage.
*/
export const DEFAULT_THEME = "romance";

const BASE = {
  "--bd-card": "rgba(255,255,255,.82)", "--bd-card-solid": "#ffffff", "--bd-on-accent": "#ffffff",
  "--ch-1": "#6b3a22", "--ch-2": "#8a5133", "--ch-3": "#4a2514",
};

export const THEMES = {
  romance: {
    id: "romance", name: "Red Roses", blurb: "Deep red roses, hearts and candlelight", dark: false,
    swatch: ["#c8102e", "#ff8fa3", "#ffe6ea"],
    confetti: ["#c8102e", "#ff4d6d", "#ff8fa3", "#ffd1dc", "#ffffff", "#ffc94d"],
    shapes: ["heart", "heart", "petal", "petal", "star", "rect"], giftPattern: "hearts", boxes: ["velvet"],
    float: [["petal", 18, "down"], ["heart", 16, "up"], ["sparkle", 8, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#ffe6ea", "--bd-bg-b": "#ffb8c6", "--bd-bg-c": "#fff0f2", "--bd-ink": "#4a0b1c", "--bd-muted": "#8f3550", "--bd-line": "rgba(200,16,46,.26)", "--bd-accent": "#c8102e", "--bd-accent-2": "#ff4d6d", "--gift-1": "#c8102e", "--gift-2": "#ff6b8a", "--gift-3": "#8f0a22", "--gift-4": "#f59ec0", "--pr-dark": "#1a0510", "--pr-spot": "#5a1230" },
  },
  starlit: {
    id: "starlit", name: "Starlit Night", blurb: "A sky full of stars, just for the two of you", dark: true,
    swatch: ["#ffd86b", "#7c8cff", "#0b1030"],
    confetti: ["#ffd86b", "#fff3b0", "#9fb0ff", "#ffffff", "#ff9ec0", "#c3a6ff"],
    shapes: ["star", "star", "circle", "heart", "rect"], giftPattern: "stars", boxes: ["velvet"],
    float: [["star", 12, "twinkle"], ["sparkle", 14, "twinkle"], ["heart", 5, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#0b1030", "--bd-bg-b": "#1b2160", "--bd-bg-c": "#2b1a55", "--bd-ink": "#f3f4ff", "--bd-muted": "#b6bdf2", "--bd-card": "rgba(255,255,255,.09)", "--bd-card-solid": "#1b2160", "--bd-line": "rgba(255,216,107,.34)", "--bd-accent": "#ffd86b", "--bd-accent-2": "#ff9ec0", "--bd-on-accent": "#1a1440", "--bd-name-a": "#ffd86b", "--bd-name-b": "#fff3b0", "--gift-1": "#ffd86b", "--gift-2": "#7c8cff", "--gift-3": "#ff9ec0", "--gift-4": "#c3a6ff", "--pr-dark": "#050818", "--pr-spot": "#232a6e" },
  },
  blossom: {
    id: "blossom", name: "Cherry Blossom", blurb: "Soft pink petals drifting in the spring air", dark: false,
    swatch: ["#e8587f", "#ffc2d4", "#fff5f8"],
    confetti: ["#e8587f", "#ff9db8", "#ffc2d4", "#ffffff", "#ffe0ea", "#b7e4c7"],
    shapes: ["petal", "petal", "petal", "heart", "circle"], giftPattern: "dots", boxes: ["velvet"],
    float: [["petal", 26, "down"], ["heart", 6, "up"], ["butterfly", 4, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#fff5f8", "--bd-bg-b": "#ffd6e3", "--bd-bg-c": "#f3f9ee", "--bd-ink": "#4a1d33", "--bd-muted": "#8a4a68", "--bd-line": "rgba(232,88,127,.3)", "--bd-accent": "#e8587f", "--bd-accent-2": "#ff9db8", "--gift-1": "#e8587f", "--gift-2": "#ffa6c0", "--gift-3": "#7bbf8a", "--gift-4": "#b79cff", "--pr-dark": "#2a0f1e", "--pr-spot": "#6b2a4a" },
  },
  fairytale: {
    id: "fairytale", name: "Fairytale", blurb: "Lavender skies, golden sparkles and a castle", dark: false,
    swatch: ["#7c4dff", "#f3d57a", "#efe6ff"],
    confetti: ["#7c4dff", "#b79cff", "#f3d57a", "#ffffff", "#ff9ec4", "#8fd3ff"],
    shapes: ["star", "heart", "circle", "star", "rect"], giftPattern: "stars", boxes: ["velvet"],
    float: [["sparkle", 14, "twinkle"], ["star", 8, "up"], ["heart", 8, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#efe6ff", "--bd-bg-b": "#d3c0ff", "--bd-bg-c": "#ffeef8", "--bd-ink": "#2e1a5e", "--bd-muted": "#6a4fa6", "--bd-line": "rgba(124,77,255,.3)", "--bd-accent": "#7c4dff", "--bd-accent-2": "#e8b923", "--gift-1": "#7c4dff", "--gift-2": "#e8b923", "--gift-3": "#ff7ab0", "--gift-4": "#5cc8ff", "--pr-dark": "#150a35", "--pr-spot": "#4a2d98" },
  },
  sunrise: {
    id: "sunrise", name: "Golden Sunrise", blurb: "A warm new morning to begin forever", dark: false,
    swatch: ["#ff7a45", "#ffd27d", "#fff1dc"],
    confetti: ["#ff7a45", "#ffb347", "#ffd27d", "#ff6b8b", "#ffffff", "#fff0b8"],
    shapes: ["star", "heart", "circle", "petal"], giftPattern: "waves", boxes: ["velvet"],
    float: [["sparkle", 10, "up"], ["heart", 12, "up"], ["star", 6, "twinkle"]],
    vars: { ...BASE, "--bd-bg-a": "#fff1dc", "--bd-bg-b": "#ffc99b", "--bd-bg-c": "#ffe3ec", "--bd-ink": "#43210f", "--bd-muted": "#8a5233", "--bd-line": "rgba(255,122,69,.32)", "--bd-accent": "#e8602c", "--bd-accent-2": "#ffa63c", "--gift-1": "#e8602c", "--gift-2": "#ffa63c", "--gift-3": "#e8335f", "--gift-4": "#c78a2c", "--pr-dark": "#2a1006", "--pr-spot": "#7a3516" },
  },
};

Object.values(THEMES).forEach((t) => { t.balloons = t.confetti; });

/* same order as TEMPLATE_THEMES.proposal in the backend (the first one is the default) */
export const THEME_IDS = ["romance", "starlit", "blossom", "fairytale", "sunrise"];
export const THEME_LIST = THEME_IDS.map((id) => THEMES[id]);
export const resolveTheme = (id) => THEMES[id] || THEMES[DEFAULT_THEME];
