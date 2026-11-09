/*
  BIRTHDAY THEMES
  The admin picks one (Admin > Memory Pages > Settings). Each theme is a set of CSS variables that
  the whole page, the cake SVG and the chocolate read from, plus the colours used by the balloons
  and the confetti. Add a theme here and add its id to TEMPLATE_THEMES in the backend service.
*/
export const DEFAULT_THEME = "candy";

export const THEMES = {
  candy: {
    id: "candy", name: "Candy Pop", blurb: "Bubblegum pink with a peachy glow", dark: false,
    swatch: ["#ff4d94", "#ffb3d1", "#ffe3ef"],
    balloons: ["#ff5c9d", "#ffb347", "#7dd3fc", "#a78bfa", "#34d399", "#fb7185", "#fde047"],
    confetti: ["#ff4d94", "#ffb347", "#7dd3fc", "#a78bfa", "#34d399", "#fde047", "#ffffff"],
    shapes: ["rect", "rect", "circle", "star", "heart"], balloonShapes: ["round", "round", "round", "star"], giftPattern: "dots",
    vars: {
      "--bd-bg-a": "#ffe3ef", "--bd-bg-b": "#ffd3e6", "--bd-bg-c": "#ffe9d6",
      "--bd-ink": "#4a1535", "--bd-muted": "#8a4a6a", "--bd-card": "rgba(255,255,255,.78)", "--bd-card-solid": "#ffffff",
      "--bd-line": "rgba(255,77,148,.22)", "--bd-accent": "#ff4d94", "--bd-accent-2": "#ff9a5c", "--bd-on-accent": "#ffffff",
      "--ck-sponge": "#ffc9a8", "--ck-sponge-2": "#f2a57f", "--ck-cream": "#fff6fb", "--ck-frost": "#ff8dbd", "--ck-frost-2": "#ff63a5",
      "--ck-fill": "#ff4d8d", "--ck-plate": "#ffffff", "--ck-plate-2": "#ffd9e8", "--ck-berry": "#e11d48", "--ck-text": "#ffffff",
      "--ch-1": "#6b3a22", "--ch-2": "#8a5133", "--ch-3": "#4a2514",
      "--gift-1": "#ff4d94", "--gift-2": "#7c5cff", "--gift-3": "#ff9a5c", "--gift-4": "#22c3a6",
    },
  },
  citrus: {
    id: "citrus", name: "Sunny Citrus", blurb: "Lemon yellow, orange and a splash of teal", dark: false,
    swatch: ["#ff8a00", "#ffd23f", "#fff4cc"],
    balloons: ["#ff8a00", "#ffd23f", "#22c3a6", "#ff5c5c", "#4cc9f0", "#a3e635"],
    confetti: ["#ff8a00", "#ffd23f", "#22c3a6", "#ff5c5c", "#4cc9f0", "#ffffff"],
    shapes: ["rect", "circle", "circle", "star"], balloonShapes: ["round", "round", "star"], giftPattern: "stripes",
    vars: {
      "--bd-bg-a": "#fff4cc", "--bd-bg-b": "#ffe69a", "--bd-bg-c": "#ffd9b0",
      "--bd-ink": "#4a2a05", "--bd-muted": "#8a5a1a", "--bd-card": "rgba(255,255,255,.8)", "--bd-card-solid": "#ffffff",
      "--bd-line": "rgba(255,138,0,.28)", "--bd-accent": "#ff8a00", "--bd-accent-2": "#22c3a6", "--bd-on-accent": "#ffffff",
      "--ck-sponge": "#ffe08a", "--ck-sponge-2": "#f5c04a", "--ck-cream": "#fffbe8", "--ck-frost": "#ffb142", "--ck-frost-2": "#ff9100",
      "--ck-fill": "#ff9100", "--ck-plate": "#ffffff", "--ck-plate-2": "#ffe9b8", "--ck-berry": "#ff3b30", "--ck-text": "#ffffff",
      "--ch-1": "#7a4524", "--ch-2": "#955a33", "--ch-3": "#54301a",
      "--gift-1": "#ff8a00", "--gift-2": "#22c3a6", "--gift-3": "#ff5c5c", "--gift-4": "#4cc9f0",
    },
  },
  dreamy: {
    id: "dreamy", name: "Dreamy Lavender", blurb: "Soft lilac and sky blue, like a daydream", dark: false,
    swatch: ["#7c5cff", "#c7b8ff", "#e8e2ff"],
    balloons: ["#7c5cff", "#a78bfa", "#60a5fa", "#f472b6", "#5eead4", "#fcd34d"],
    confetti: ["#7c5cff", "#a78bfa", "#60a5fa", "#f472b6", "#5eead4", "#ffffff"],
    shapes: ["star", "circle", "rect", "heart"], balloonShapes: ["round", "round", "star"], giftPattern: "stars",
    vars: {
      "--bd-bg-a": "#ece6ff", "--bd-bg-b": "#dcd3ff", "--bd-bg-c": "#d6ecff",
      "--bd-ink": "#2b1d5a", "--bd-muted": "#6b5aa6", "--bd-card": "rgba(255,255,255,.78)", "--bd-card-solid": "#ffffff",
      "--bd-line": "rgba(124,92,255,.26)", "--bd-accent": "#7c5cff", "--bd-accent-2": "#f472b6", "--bd-on-accent": "#ffffff",
      "--ck-sponge": "#fbe3f1", "--ck-sponge-2": "#eec2de", "--ck-cream": "#ffffff", "--ck-frost": "#b9a4ff", "--ck-frost-2": "#9577ff",
      "--ck-fill": "#9577ff", "--ck-plate": "#ffffff", "--ck-plate-2": "#e4dcff", "--ck-berry": "#5b2d9e", "--ck-text": "#ffffff",
      "--ch-1": "#5e3a3a", "--ch-2": "#7a4d4d", "--ch-3": "#432828",
      "--gift-1": "#7c5cff", "--gift-2": "#f472b6", "--gift-3": "#60a5fa", "--gift-4": "#34d399",
    },
  },
  midnight: {
    id: "midnight", name: "Midnight Party", blurb: "A starry night with gold and neon confetti", dark: true,
    swatch: ["#ffd166", "#ff4fa3", "#1b1140"],
    balloons: ["#ff4fa3", "#ffd166", "#4cc9f0", "#9b5cff", "#2ee6a6", "#ff7a59"],
    confetti: ["#ffd166", "#ff4fa3", "#4cc9f0", "#9b5cff", "#2ee6a6", "#ffffff"],
    shapes: ["star", "rect", "circle", "star"], balloonShapes: ["round", "round", "star"], giftPattern: "stars",
    vars: {
      "--bd-bg-a": "#1b1140", "--bd-bg-b": "#2a1862", "--bd-bg-c": "#3b1d6e",
      "--bd-ink": "#fff6e5", "--bd-muted": "#c9b8f0", "--bd-card": "rgba(255,255,255,.09)", "--bd-card-solid": "#2a1862",
      "--bd-line": "rgba(255,209,102,.3)", "--bd-accent": "#ffd166", "--bd-accent-2": "#ff4fa3", "--bd-on-accent": "#2a1235",
      "--ck-sponge": "#7a4a30", "--ck-sponge-2": "#5a3320", "--ck-cream": "#ffe7c2", "--ck-frost": "#ff4fa3", "--ck-frost-2": "#d92b86",
      "--ck-fill": "#ffd166", "--ck-plate": "#f4e9ff", "--ck-plate-2": "#b9a4e8", "--ck-berry": "#ff2d55", "--ck-text": "#fff6e5",
      "--ch-1": "#5a301c", "--ch-2": "#7a4630", "--ch-3": "#3a1c10",
      "--gift-1": "#ff4fa3", "--gift-2": "#ffd166", "--gift-3": "#4cc9f0", "--gift-4": "#9b5cff",
    },
  },
  love: {
    id: "love", name: "Love", blurb: "Hearts, roses and a bouquet, for someone special", dark: false,
    swatch: ["#e11d48", "#ff7a9a", "#ffe1e8"],
    balloons: ["#e11d48", "#ff5c8a", "#ff9ec4", "#b4233f", "#ffffff", "#d8a7ff", "#fb7185"],
    confetti: ["#e11d48", "#ff5c8a", "#ff9ec4", "#fb7185", "#ffffff", "#ffd1dc", "#d8a7ff"],
    shapes: ["heart", "heart", "heart", "petal", "petal", "rect", "star"], balloonShapes: ["heart", "heart", "round"], giftPattern: "hearts",
    vars: {
      "--bd-bg-a": "#ffe1e8", "--bd-bg-b": "#ffc6d6", "--bd-bg-c": "#ffe9ee",
      "--bd-ink": "#4a0f26", "--bd-muted": "#8e3a5a", "--bd-card": "rgba(255,255,255,.78)", "--bd-card-solid": "#ffffff",
      "--bd-line": "rgba(225,29,72,.24)", "--bd-accent": "#e11d48", "--bd-accent-2": "#ff5c8a", "--bd-on-accent": "#ffffff",
      "--ck-sponge": "#c02a48", "--ck-sponge-2": "#8f1c33", "--ck-cream": "#fff3f5", "--ck-frost": "#ff7a9a", "--ck-frost-2": "#e8487a",
      "--ck-fill": "#fff0f3", "--ck-plate": "#ffffff", "--ck-plate-2": "#ffd1dc", "--ck-berry": "#d10f3b", "--ck-text": "#ffffff",
      "--ch-1": "#5a2a22", "--ch-2": "#7a3f33", "--ch-3": "#3e1c16",
      "--gift-1": "#e11d48", "--gift-2": "#ff7ab0", "--gift-3": "#b4233f", "--gift-4": "#f59ec0",
    },
  },
  friendship: {
    id: "friendship", name: "Friendship", blurb: "Bunting, bracelets and best-friend vibes", dark: false,
    swatch: ["#00a896", "#ff7a45", "#ffc233"],
    balloons: ["#00a896", "#ff7a45", "#ffc233", "#7c5cff", "#ff5c8a", "#4cc9f0"],
    confetti: ["#00a896", "#ff7a45", "#ffc233", "#7c5cff", "#ff5c8a", "#4cc9f0", "#ffffff"],
    shapes: ["star", "star", "rect", "circle", "heart"], balloonShapes: ["round", "star", "round"], giftPattern: "stars",
    vars: {
      "--bd-bg-a": "#d9f6f2", "--bd-bg-b": "#fff3c4", "--bd-bg-c": "#ffe0c7",
      "--bd-name-a": "#00a896", "--bd-name-b": "#2bc4e8",
      "--bd-ink": "#0f3b3a", "--bd-muted": "#3f7a77", "--bd-card": "rgba(255,255,255,.8)", "--bd-card-solid": "#ffffff",
      "--bd-line": "rgba(0,168,150,.28)", "--bd-accent": "#00a896", "--bd-accent-2": "#ff7a45", "--bd-on-accent": "#ffffff",
      "--ck-sponge": "#ffe7b8", "--ck-sponge-2": "#f2c978", "--ck-cream": "#fffdf5", "--ck-frost": "#5ed6c6", "--ck-frost-2": "#20b8a6",
      "--ck-fill": "#ff9a5c", "--ck-plate": "#ffffff", "--ck-plate-2": "#c8f1eb", "--ck-berry": "#ff7a45", "--ck-text": "#ffffff",
      "--ch-1": "#6b3a22", "--ch-2": "#8a5133", "--ch-3": "#4a2514",
      "--gift-1": "#00a896", "--gift-2": "#ff7a45", "--gift-3": "#ffc233", "--gift-4": "#7c5cff",
    },
  },
  tropical: {
    id: "tropical", name: "Tropical", blurb: "Palm leaves, hibiscus and a sunny beach", dark: false,
    swatch: ["#ff6f59", "#00b4b6", "#ffe08a"],
    balloons: ["#ff6f59", "#00b4b6", "#ffc233", "#8bc34a", "#ff4d94", "#ff9a3c"],
    confetti: ["#ff6f59", "#00b4b6", "#ffc233", "#8bc34a", "#ff4d94", "#ffffff"],
    shapes: ["petal", "petal", "circle", "star", "rect"], balloonShapes: ["round", "round", "star"], giftPattern: "waves",
    vars: {
      "--bd-bg-a": "#c9f3f5", "--bd-bg-b": "#fff1c9", "--bd-bg-c": "#ffd9c2",
      "--bd-name-a": "#ff6f59", "--bd-name-b": "#ffa63c",
      "--bd-ink": "#06424a", "--bd-muted": "#327a82", "--bd-card": "rgba(255,255,255,.8)", "--bd-card-solid": "#ffffff",
      "--bd-line": "rgba(0,180,182,.3)", "--bd-accent": "#ff6f59", "--bd-accent-2": "#00b4b6", "--bd-on-accent": "#ffffff",
      "--ck-sponge": "#ffe08a", "--ck-sponge-2": "#f5bb4b", "--ck-cream": "#fffaf0", "--ck-frost": "#ff9a6b", "--ck-frost-2": "#ff6f59",
      "--ck-fill": "#00b4b6", "--ck-plate": "#ffffff", "--ck-plate-2": "#ffe4a8", "--ck-berry": "#ff3d7f", "--ck-text": "#ffffff",
      "--ch-1": "#6e4326", "--ch-2": "#8c5a36", "--ch-3": "#4a2c18",
      "--gift-1": "#ff6f59", "--gift-2": "#00b4b6", "--gift-3": "#ffc233", "--gift-4": "#8bc34a",
    },
  },
  galaxy: {
    id: "galaxy", name: "Galaxy", blurb: "Planets, rockets and a sky full of stars", dark: true,
    swatch: ["#7cf0ff", "#c084fc", "#0b0b2b"],
    balloons: ["#7cf0ff", "#c084fc", "#ff7ad9", "#ffd166", "#86efac", "#60a5fa"],
    confetti: ["#7cf0ff", "#c084fc", "#ff7ad9", "#ffd166", "#ffffff", "#60a5fa"],
    shapes: ["star", "star", "circle", "rect", "star"], balloonShapes: ["round", "star", "round"], giftPattern: "stars",
    vars: {
      "--bd-bg-a": "#0b0b2b", "--bd-bg-b": "#1c1250", "--bd-bg-c": "#2d1b69",
      "--bd-ink": "#f2eeff", "--bd-muted": "#b9aef0", "--bd-card": "rgba(255,255,255,.09)", "--bd-card-solid": "#1c1250",
      "--bd-line": "rgba(124,240,255,.3)", "--bd-accent": "#7cf0ff", "--bd-accent-2": "#c084fc", "--bd-on-accent": "#14123a",
      "--ck-sponge": "#3b2a7a", "--ck-sponge-2": "#2b1d5c", "--ck-cream": "#e8e4ff", "--ck-frost": "#6d5bff", "--ck-frost-2": "#4a3fd1",
      "--ck-fill": "#7cf0ff", "--ck-plate": "#e6e0ff", "--ck-plate-2": "#9b90e0", "--ck-berry": "#ff7ad9", "--ck-text": "#ffffff",
      "--ch-1": "#5a301c", "--ch-2": "#7a4630", "--ch-3": "#3a1c10",
      "--gift-1": "#7cf0ff", "--gift-2": "#c084fc", "--gift-3": "#ffd166", "--gift-4": "#ff7ad9",
    },
  },
};

/* same order as TEMPLATE_THEMES.birthday in the backend (the first one is the default) */
export const THEME_IDS = ["candy", "love", "friendship", "citrus", "dreamy", "midnight", "tropical", "galaxy"];
export const THEME_LIST = THEME_IDS.map((id) => THEMES[id]);
export const resolveTheme = (id) => THEMES[id] || THEMES[DEFAULT_THEME];
