/*
  ANNIVERSARY THEMES
  The sender picks one. "Lovey Dovey" is the default (doves, hearts, a rose bouquet). Variable names match the
  Birthday template so the shared pieces (gifts, gallery, letter, volume) take on the colours automatically.
*/
export const DEFAULT_THEME = "lovey";

const BASE = {
  "--bd-card": "rgba(255,255,255,.8)", "--bd-card-solid": "#ffffff", "--bd-on-accent": "#ffffff",
  "--ch-1": "#6b3a22", "--ch-2": "#8a5133", "--ch-3": "#4a2514",
};

export const THEMES = {
  lovey: {
    id: "lovey", name: "Lovey Dovey", blurb: "Doves, hearts and a rose bouquet", dark: false,
    swatch: ["#e11d48", "#ff9ec0", "#ffe3ec"],
    confetti: ["#e11d48", "#ff6b9d", "#ff9ec4", "#ffd1dc", "#ffffff", "#d8a7ff"],
    shapes: ["heart", "heart", "heart", "petal", "rect", "star"], giftPattern: "hearts", boxes: ["velvet", "classic", "hat", "tall"],
    float: [["heart", 26, "up"], ["petal", 12, "down"], ["sparkle", 8, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#ffe3ec", "--bd-bg-b": "#ffc4d8", "--bd-bg-c": "#fff0f4", "--bd-ink": "#4a0f2a", "--bd-muted": "#94406a", "--bd-line": "rgba(225,29,72,.26)", "--bd-accent": "#e11d48", "--bd-accent-2": "#ff6b9d", "--gift-1": "#e11d48", "--gift-2": "#ff7ab0", "--gift-3": "#b4233f", "--gift-4": "#f59ec0" },
  },
  golden: {
    id: "golden", name: "Golden Years", blurb: "Champagne gold, sparkle and elegance", dark: false,
    swatch: ["#b8860b", "#f3d57a", "#fff7e1"],
    confetti: ["#b8860b", "#e8b923", "#f6e08a", "#ffffff", "#f3d9a4", "#d4a017"],
    shapes: ["star", "rect", "circle", "star"], giftPattern: "stars", boxes: ["velvet", "tall", "hat", "classic"],
    float: [["sparkle", 14, "twinkle"], ["star", 8, "up"], ["dot", 10, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#fff7e1", "--bd-bg-b": "#f8e3ad", "--bd-bg-c": "#fff1d2", "--bd-ink": "#4a3510", "--bd-muted": "#8a6a26", "--bd-line": "rgba(184,134,11,.32)", "--bd-accent": "#b8860b", "--bd-accent-2": "#e8b923", "--bd-name-a": "#b8860b", "--bd-name-b": "#e8b923", "--gift-1": "#b8860b", "--gift-2": "#e8b923", "--gift-3": "#a05a2c", "--gift-4": "#7a6a3a" },
  },
  candlelight: {
    id: "candlelight", name: "Candlelight Dinner", blurb: "Warm candles and fairy lights in the dark", dark: true,
    swatch: ["#ffc46b", "#ff6b8b", "#2a0a14"],
    confetti: ["#ffc46b", "#ff6b8b", "#ffe0a8", "#ffffff", "#e8a04c", "#c94d6d"],
    shapes: ["heart", "star", "circle", "rect"], giftPattern: "hearts", boxes: ["velvet", "classic", "tall", "hat"],
    float: [["firefly", 16, "up"], ["sparkle", 10, "twinkle"], ["heart", 6, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#2a0a14", "--bd-bg-b": "#4a1024", "--bd-bg-c": "#3a1420", "--bd-ink": "#fff1e6", "--bd-muted": "#e8b9b0", "--bd-card": "rgba(255,255,255,.08)", "--bd-card-solid": "#3a1420", "--bd-line": "rgba(255,196,107,.32)", "--bd-accent": "#ffc46b", "--bd-accent-2": "#ff6b8b", "--bd-on-accent": "#2a0a14", "--bd-name-a": "#ffc46b", "--bd-name-b": "#ffe3b0", "--gift-1": "#ffc46b", "--gift-2": "#ff6b8b", "--gift-3": "#c94d6d", "--gift-4": "#e8a04c" },
  },
  garden: {
    id: "garden", name: "Garden of Love", blurb: "Blooming flowers, vines and butterflies", dark: false,
    swatch: ["#d9467f", "#5fae4e", "#eaf7e4"],
    confetti: ["#d9467f", "#f08ab0", "#5fae4e", "#ffd35c", "#ffffff", "#8b6bd9"],
    shapes: ["petal", "petal", "heart", "circle"], giftPattern: "dots", boxes: ["classic", "velvet", "hat", "tall"],
    float: [["petal", 16, "down"], ["leaf", 8, "down"], ["butterfly", 5, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#eaf7e4", "--bd-bg-b": "#fde4ee", "--bd-bg-c": "#fff3e0", "--bd-ink": "#2d4a2a", "--bd-muted": "#5f7f5a", "--bd-line": "rgba(95,174,78,.38)", "--bd-accent": "#d9467f", "--bd-accent-2": "#5fae4e", "--bd-name-a": "#d9467f", "--bd-name-b": "#f08ab0", "--gift-1": "#d9467f", "--gift-2": "#5fae4e", "--gift-3": "#f2a33c", "--gift-4": "#8b6bd9" },
  },
  sunset: {
    id: "sunset", name: "Sunset Beach", blurb: "A golden sunset, waves and wish lanterns", dark: false,
    swatch: ["#ff5e7e", "#ffb347", "#b79cff"],
    confetti: ["#ff5e7e", "#ffb347", "#ffd27d", "#b79cff", "#ffffff", "#ff8a5c"],
    shapes: ["star", "heart", "circle", "petal"], giftPattern: "waves", boxes: ["classic", "velvet", "hat", "tall"],
    float: [["star", 8, "twinkle"], ["heart", 10, "up"], ["sparkle", 8, "up"]],
    vars: { ...BASE, "--bd-bg-a": "#ffd9b8", "--bd-bg-b": "#ff9fb2", "--bd-bg-c": "#b79cff", "--bd-ink": "#3a1a3f", "--bd-muted": "#6f3f6f", "--bd-line": "rgba(255,94,126,.34)", "--bd-accent": "#e8335f", "--bd-accent-2": "#ff9a3c", "--gift-1": "#e8335f", "--gift-2": "#ff9a3c", "--gift-3": "#7c5cff", "--gift-4": "#ff6e4a" },
  },
};

Object.values(THEMES).forEach((t) => { t.balloons = t.confetti; });

/* same order as TEMPLATE_THEMES.anniversary in the backend (the first one is the default) */
export const THEME_IDS = ["lovey", "golden", "candlelight", "garden", "sunset"];
export const THEME_LIST = THEME_IDS.map((id) => THEMES[id]);
export const resolveTheme = (id) => THEMES[id] || THEMES[DEFAULT_THEME];
