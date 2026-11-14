/*
  CHRISTMAS THEMES
  The sender picks one. "Classic Christmas" (red, green and gold) is the default.
  Variable names match the Birthday template so the shared pieces (gallery, letter, gifts, volume) take on the colours automatically;
  the --xm-* ones colour the tree, its lights and its ornaments.
  Keep the ids in step with TEMPLATE_THEMES.christmas in the backend (and the colours in backend/services/memory/emailThemes.js).
*/
export const DEFAULT_THEME = "classic";

const BASE = {
  "--bd-card": "rgba(255,255,255,.84)", "--bd-card-solid": "#ffffff", "--bd-on-accent": "#ffffff",
  "--ch-1": "#6b3a22", "--ch-2": "#8a5133", "--ch-3": "#4a2514",
};

export const THEMES = {
  classic: {
    id: "classic", name: "Classic Christmas", blurb: "Red, green and gold, just like the old days", dark: false,
    swatch: ["#c1121f", "#1f7a3d", "#fff5ea"],
    confetti: ["#c1121f", "#1f7a3d", "#f2b632", "#ffffff", "#ff6b6b", "#8fd19e"],
    shapes: ["star", "circle", "rect", "star", "heart"], giftPattern: "stripes", boxes: ["classic", "hat", "tall", "bag"],
    snow: "#9fb8d6", float: [["snow", 26, "down"], ["star", 5, "twinkle"], ["sparkle", 6, "twinkle"]],
    vars: { ...BASE, "--bd-bg-a": "#fff5ea", "--bd-bg-b": "#ffd6d0", "--bd-bg-c": "#e6f4e4", "--bd-ink": "#3b0d12", "--bd-muted": "#7d3a40", "--bd-line": "rgba(193,18,31,.26)", "--bd-accent": "#c1121f", "--bd-accent-2": "#1f7a3d", "--gift-1": "#c1121f", "--gift-2": "#1f7a3d", "--gift-3": "#f2b632", "--gift-4": "#8f0d18", "--xm-tree-1": "#14532d", "--xm-tree-2": "#2f9e57", "--xm-trunk": "#6b3f22", "--xm-star": "#ffd23f", "--xm-orn-1": "#c1121f", "--xm-orn-2": "#f2b632", "--xm-orn-3": "#e8e8f0", "--xm-orn-4": "#3b82f6", "--xm-ground": "#ffffff", "--xm-glow": "#ffd23f" },
  },
  snowy: {
    id: "snowy", name: "Snowy Night", blurb: "A quiet, starry night with snow drifting down", dark: true,
    swatch: ["#8fd3ff", "#ffd86b", "#0b1630"],
    confetti: ["#8fd3ff", "#ffffff", "#ffd86b", "#c3d4ff", "#ff9ec0", "#b9f0ff"],
    shapes: ["star", "circle", "star", "rect"], giftPattern: "stars", boxes: ["classic", "tall", "hat", "bag"],
    snow: "#ffffff", float: [["snow", 34, "down"], ["star", 10, "twinkle"], ["sparkle", 8, "twinkle"]],
    vars: { ...BASE, "--bd-bg-a": "#0b1630", "--bd-bg-b": "#1c2e5c", "--bd-bg-c": "#27407a", "--bd-ink": "#f2f7ff", "--bd-muted": "#b8cdf0", "--bd-card": "rgba(255,255,255,.1)", "--bd-card-solid": "#1c2e5c", "--bd-line": "rgba(143,211,255,.34)", "--bd-accent": "#8fd3ff", "--bd-accent-2": "#ffd86b", "--bd-on-accent": "#0b1630", "--bd-name-a": "#8fd3ff", "--bd-name-b": "#ffffff", "--gift-1": "#8fd3ff", "--gift-2": "#ffd86b", "--gift-3": "#ff9ec0", "--gift-4": "#c3a6ff", "--xm-tree-1": "#0f5a43", "--xm-tree-2": "#2fbf8a", "--xm-trunk": "#5a3a24", "--xm-star": "#fff3b0", "--xm-orn-1": "#ff6b8b", "--xm-orn-2": "#8fd3ff", "--xm-orn-3": "#ffd86b", "--xm-orn-4": "#ffffff", "--xm-ground": "#dbe9ff", "--xm-glow": "#fff3b0" },
  },
  gingerbread: {
    id: "gingerbread", name: "Gingerbread Cozy", blurb: "Cinnamon, candy canes and a warm kitchen", dark: false,
    swatch: ["#b5522a", "#d9385a", "#fbefdc"],
    confetti: ["#b5522a", "#d9385a", "#ffffff", "#f2b632", "#7bbf8a", "#f4a261"],
    shapes: ["circle", "rect", "star", "heart", "circle"], giftPattern: "dots", boxes: ["classic", "bag", "hat", "tall"],
    snow: "#c9a98a", float: [["snow", 22, "down"], ["heart", 6, "up"], ["sparkle", 6, "twinkle"]],
    vars: { ...BASE, "--bd-bg-a": "#fbefdc", "--bd-bg-b": "#f0c9a0", "--bd-bg-c": "#fde6d2", "--bd-ink": "#4a2410", "--bd-muted": "#8a5233", "--bd-line": "rgba(181,82,42,.3)", "--bd-accent": "#b5522a", "--bd-accent-2": "#d9385a", "--gift-1": "#b5522a", "--gift-2": "#d9385a", "--gift-3": "#7bbf8a", "--gift-4": "#f2b632", "--xm-tree-1": "#2d6a4f", "--xm-tree-2": "#74b88a", "--xm-trunk": "#7a4a2a", "--xm-star": "#f2b632", "--xm-orn-1": "#d9385a", "--xm-orn-2": "#ffffff", "--xm-orn-3": "#b5522a", "--xm-orn-4": "#f2b632", "--xm-ground": "#fff8ee", "--xm-glow": "#f2b632" },
  },
  aurora: {
    id: "aurora", name: "Northern Lights", blurb: "Green and violet skies over a frozen forest", dark: true,
    swatch: ["#5cf2c0", "#b690ff", "#07201f"],
    confetti: ["#5cf2c0", "#b690ff", "#ffffff", "#9fe8ff", "#ff9ec0", "#fff3b0"],
    shapes: ["star", "circle", "star", "rect"], giftPattern: "waves", boxes: ["classic", "tall", "bag", "hat"],
    snow: "#d8fff4", float: [["snow", 26, "down"], ["sparkle", 12, "twinkle"], ["star", 8, "twinkle"]],
    vars: { ...BASE, "--bd-bg-a": "#07201f", "--bd-bg-b": "#0f4a4a", "--bd-bg-c": "#2a1f5c", "--bd-ink": "#eafff8", "--bd-muted": "#a5e6d6", "--bd-card": "rgba(255,255,255,.09)", "--bd-card-solid": "#0f4a4a", "--bd-line": "rgba(92,242,192,.32)", "--bd-accent": "#5cf2c0", "--bd-accent-2": "#b690ff", "--bd-on-accent": "#052a26", "--bd-name-a": "#5cf2c0", "--bd-name-b": "#b690ff", "--gift-1": "#5cf2c0", "--gift-2": "#b690ff", "--gift-3": "#9fe8ff", "--gift-4": "#ff9ec0", "--xm-tree-1": "#0b5d4b", "--xm-tree-2": "#34d1a0", "--xm-trunk": "#4a3a2a", "--xm-star": "#fff3b0", "--xm-orn-1": "#b690ff", "--xm-orn-2": "#5cf2c0", "--xm-orn-3": "#ff9ec0", "--xm-orn-4": "#9fe8ff", "--xm-ground": "#cdeee6", "--xm-glow": "#b690ff" },
  },
  golden: {
    id: "golden", name: "Golden Glow", blurb: "Ivory and gold with deep evergreen, quietly elegant", dark: false,
    swatch: ["#b8860b", "#1f6b4a", "#fffaf0"],
    confetti: ["#b8860b", "#e8c14b", "#fff3c4", "#1f6b4a", "#ffffff", "#d4a017"],
    shapes: ["star", "circle", "star", "rect"], giftPattern: "stars", boxes: ["classic", "tall", "hat", "bag"],
    snow: "#f3e6bd", float: [["snow", 18, "down"], ["sparkle", 14, "twinkle"], ["star", 8, "twinkle"]],
    vars: { ...BASE, "--bd-bg-a": "#fffaf0", "--bd-bg-b": "#f7e3b0", "--bd-bg-c": "#f1efe0", "--bd-ink": "#2d2a12", "--bd-muted": "#7a6a2a", "--bd-line": "rgba(184,134,11,.32)", "--bd-accent": "#b8860b", "--bd-accent-2": "#1f6b4a", "--gift-1": "#b8860b", "--gift-2": "#1f6b4a", "--gift-3": "#e8c14b", "--gift-4": "#8a6508", "--xm-tree-1": "#164e3a", "--xm-tree-2": "#2a8a64", "--xm-trunk": "#6b4a22", "--xm-star": "#f6d365", "--xm-orn-1": "#d4a017", "--xm-orn-2": "#fff3c4", "--xm-orn-3": "#b8860b", "--xm-orn-4": "#f6d365", "--xm-ground": "#fffdf5", "--xm-glow": "#f6d365" },
  },
};

Object.values(THEMES).forEach((t) => { t.balloons = t.confetti; });

/* same order as TEMPLATE_THEMES.christmas in the backend (the first one is the default) */
export const THEME_IDS = ["classic", "snowy", "gingerbread", "aurora", "golden"];
export const THEME_LIST = THEME_IDS.map((id) => THEMES[id]);
export const resolveTheme = (id) => THEMES[id] || THEMES[DEFAULT_THEME];
