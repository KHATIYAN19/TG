import path from "path";
import { fileURLToPath } from "url";
import React from "react";
import { Document, Font, Link, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

/*
  Draws a ResumeDraft as an ATS-friendly PDF.

  WHAT MAKES THESE RESUMES SAFE FOR APPLICANT TRACKING SYSTEMS (and still good-looking to a human):
    - ONE column of real, selectable text in reading order. No tables, text boxes, icons, photos or graphics carry any information.
    - Standard section names (Summary, Education, Experience, Projects, Skills) so parsers find them.
    - Embedded open-licence fonts (Carlito, Crimson Text, PT Serif, IBM Plex Mono) instead of the plain system fonts: more polish, same parseability.
    - Working links (email, LinkedIn, GitHub, project links) and a clean header that is plain text, never a header/footer region.
  Six looks (templates) share one layout engine; each is a bundle of design tokens. The resume is fitted to ONE A4 page: if it spills, type and spacing
  shrink a step at a time, down to a size that is still easy to read.

  The person can also pick an accent colour and the spacing (design.accent, design.spacing on the draft).
*/
const h = React.createElement;

const FONT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../assets/fonts");
const f = (name) => path.join(FONT_DIR, name);
Font.register({ family: "Carlito", fonts: [{ src: f("Carlito-Regular.ttf") }, { src: f("Carlito-Bold.ttf"), fontWeight: 700 }, { src: f("Carlito-Italic.ttf"), fontStyle: "italic" }, { src: f("Carlito-BoldItalic.ttf"), fontWeight: 700, fontStyle: "italic" }] });
Font.register({ family: "Crimson", fonts: [{ src: f("CrimsonText-Regular.ttf") }, { src: f("CrimsonText-SemiBold.ttf"), fontWeight: 600 }, { src: f("CrimsonText-Bold.ttf"), fontWeight: 700 }, { src: f("CrimsonText-Italic.ttf"), fontStyle: "italic" }, { src: f("CrimsonText-BoldItalic.ttf"), fontWeight: 700, fontStyle: "italic" }] });
Font.register({ family: "PTSerif", fonts: [{ src: f("PTSerif-Regular.ttf") }, { src: f("PTSerif-Bold.ttf"), fontWeight: 700 }, { src: f("PTSerif-Italic.ttf"), fontStyle: "italic" }, { src: f("PTSerif-BoldItalic.ttf"), fontWeight: 700, fontStyle: "italic" }] });
Font.register({ family: "PlexMono", fonts: [{ src: f("PlexMono-Regular.ttf") }, { src: f("PlexMono-Medium.ttf"), fontWeight: 700 }] });
Font.registerHyphenationCallback((w) => [w]); // never split a word across lines: ATS text extraction stays clean

/*
  The looks. `sec` is how a section title is drawn, `head` where the name sits, `entry` which line leads an experience entry.
  All tokens are in points at scale 1.
*/
export const TEMPLATES = {
  classic: { label: "Classic", fam: "Crimson", base: 11.4, name: 27, lh: 1.22, head: "center", sec: "rule", entry: "company", accent: "#111111", muted: "#3a3a3a", pad: 40, gap: 9, dot: "•", sep: "  |  ", caps: true, nameCaps: false },
  modern: { label: "Modern", fam: "Carlito", base: 10.8, name: 28, lh: 1.26, head: "left", sec: "bar", entry: "role", accent: "#0f766e", muted: "#4b5563", pad: 40, gap: 10, dot: "•", sep: "  ·  ", caps: true, nameCaps: false },
  executive: { label: "Executive", fam: "PTSerif", base: 9.9, name: 24, lh: 1.28, head: "center", sec: "double", entry: "company", accent: "#1f2a44", muted: "#444444", pad: 42, gap: 9, dot: "•", sep: "   |   ", caps: true, nameCaps: true },
  minimal: { label: "Minimal", fam: "Carlito", base: 10.8, name: 26, lh: 1.32, head: "left", sec: "light", entry: "role", accent: "#111827", muted: "#6b7280", pad: 46, gap: 11, dot: "–", sep: "  /  ", caps: true, nameCaps: false },
  tech: { label: "Tech", fam: "Carlito", base: 10.6, name: 27, lh: 1.25, head: "band", sec: "tag", entry: "role", accent: "#1e3a5f", muted: "#475569", pad: 38, gap: 9, dot: "•", sep: "   ", caps: false, nameCaps: false, mono: true },
  compact: { label: "Compact", fam: "Carlito", base: 9.8, name: 22, lh: 1.2, head: "left", sec: "rule", entry: "company", accent: "#111111", muted: "#3a3a3a", pad: 32, gap: 6, dot: "•", sep: "  |  ", caps: true, nameCaps: false },
};
const SCALES = [1.12, 1.07, 1.03, 1, 0.96, 0.93, 0.9, 0.87, 0.84, 0.81, 0.78]; // the smallest still reads as ~8pt body text
const SPACING = { comfortable: 1.16, standard: 1, tight: 0.84 };
const HEX = /^#[0-9a-f]{6}$/i;

/* the fonts draw Latin text only: swap what we can, drop the rest so a stray symbol never prints as a box */
const SWAP = { "→": "->", "←": "<-", "≥": ">=", "≤": "<=", "₹": "Rs. ", "≈": "~", "✓": "", "★": "", "●": "•", "▪": "•", "◦": "•", "‑": "-", " ": " ", "▸": ">" };
const clean = (v) => String(v ?? "").replace(/[→←≥≤₹≈✓★●▪◦‑ ▸]/g, (c) => SWAP[c]).replace(/[^ -~¡-ÿ–—‘’“”•…]/g, "").replace(/\s+/g, " ").trim();
const list = (a) => (Array.isArray(a) ? a.map(clean).filter(Boolean) : []);
const href = (u) => {
  const s = String(u ?? "").trim();
  if (!s) return "";
  if (/^mailto:/i.test(s) || /^https?:\/\//i.test(s)) return s;
  return /^[a-z][a-z0-9+.-]*:/i.test(s) ? "" : `https://${s}`; // never javascript:, data:, file: ...
};
const shortUrl = (u) => clean(u).replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
const range = (start, end, current) => [clean(start), current ? "Present" : clean(end)].filter(Boolean).join(" – ");

export const buildDoc = (d, scale = 1) => {
  const L = TEMPLATES[d.template] || TEMPLATES.classic;
  const space = SPACING[d.design?.spacing] ?? 1;
  const accent = HEX.test(d.design?.accent || "") ? d.design.accent : L.accent;
  const sz = (n) => Math.round(n * scale * 100) / 100;
  const gap = (n) => Math.round(n * scale * space * 100) / 100;
  const band = L.head === "band";
  const center = L.head === "center";
  const bold = { fontFamily: L.fam, fontWeight: 700 };
  const ital = { fontFamily: L.fam, fontStyle: "italic" };
  const monoLabel = L.mono ? { fontFamily: "PlexMono", fontSize: sz(L.base - 1.4) } : {};

  const s = StyleSheet.create({
    page: { fontFamily: L.fam, fontSize: sz(L.base), color: "#161616", lineHeight: L.lh, paddingTop: 0, paddingBottom: Math.max(22, sz(L.pad) - 8) },
    body: { paddingHorizontal: Math.max(28, sz(L.pad)), paddingTop: band ? gap(10) : Math.max(24, sz(L.pad) - 6) },
    band: { backgroundColor: accent, paddingHorizontal: Math.max(28, sz(L.pad)), paddingTop: Math.max(24, sz(L.pad) - 8), paddingBottom: gap(14) },
    name: { ...bold, fontSize: sz(L.name), lineHeight: 1.08, letterSpacing: L.nameCaps ? 1.6 : 0, textTransform: L.nameCaps ? "uppercase" : "none", textAlign: center ? "center" : "left", color: band ? "#ffffff" : accent },
    headline: { fontSize: sz(L.base + 1.6), marginTop: 2, textAlign: center ? "center" : "left", color: band ? "#dbe7f5" : L.muted },
    contact: { marginTop: gap(5), textAlign: center ? "center" : "left", fontSize: sz(L.base - 0.7), color: band ? "#eaf1fb" : "#222222" },
    link: { color: band ? "#eaf1fb" : "#1d4ed8", textDecoration: "none" },
    sec: { marginTop: gap(L.gap + 4) },
    secTitle: { ...bold, fontSize: sz(L.base + (L.sec === "tag" ? 0.4 : 0.6)), letterSpacing: L.sec === "light" ? 1.8 : 0.9, textTransform: L.caps ? "uppercase" : "none", color: L.sec === "light" ? L.muted : accent, marginBottom: gap(4.5) },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    bold,
    italic: { ...ital, color: L.muted },
    dates: { ...(L.mono ? { fontFamily: "PlexMono", fontSize: sz(L.base - 1.5) } : { fontSize: sz(L.base - 0.4) }), color: L.muted, marginLeft: 10 },
    item: { marginBottom: gap(L.gap - 1.5) },
    bullet: { flexDirection: "row", marginTop: gap(1.8), paddingLeft: 7 },
    dot: { width: 11, color: accent },
    btext: { flex: 1 },
  });

  const Dot = ({ t }) => h(View, { style: s.bullet, wrap: false }, h(Text, { style: s.dot }, L.dot), h(Text, { style: s.btext }, t));
  const Bullets = ({ items }) => list(items).map((t, i) => h(Dot, { key: i, t }));

  /* section title in the template's style; all of them are plain text, the rule/bar/tag are decoration only */
  const Section = ({ title, children }) => {
    const t = clean(title);
    let head;
    if (L.sec === "rule") head = h(View, { style: { borderBottomWidth: 0.9, borderBottomColor: "#444444", borderBottomStyle: "solid", marginBottom: gap(4.5), paddingBottom: 1.4 } }, h(Text, { style: { ...s.secTitle, marginBottom: 0 } }, t));
    else if (L.sec === "double") head = h(View, { style: { borderTopWidth: 0.7, borderTopColor: accent, borderTopStyle: "solid", borderBottomWidth: 0.7, borderBottomColor: accent, borderBottomStyle: "solid", marginBottom: gap(5), paddingVertical: 2.2 } }, h(Text, { style: { ...s.secTitle, marginBottom: 0, textAlign: "center" } }, t));
    else if (L.sec === "bar") head = h(View, { style: { flexDirection: "row", alignItems: "center", marginBottom: gap(4.5) } }, h(View, { style: { width: 3.2, height: sz(L.base + 2), backgroundColor: accent, marginRight: 6, borderRadius: 1 } }), h(Text, { style: { ...s.secTitle, marginBottom: 0 } }, t));
    else if (L.sec === "light") head = h(View, { style: { flexDirection: "row", alignItems: "center", marginBottom: gap(5) } }, h(Text, { style: { ...s.secTitle, marginBottom: 0, marginRight: 8 } }, t), h(View, { style: { flex: 1, height: 0.6, backgroundColor: "#d1d5db" } }));
    else if (L.sec === "tag") head = h(View, { style: { flexDirection: "row", marginBottom: gap(5) } }, h(View, { style: { backgroundColor: accent, paddingHorizontal: 7, paddingVertical: 1.6, borderRadius: 2 } }, h(Text, { style: { ...bold, fontSize: sz(L.base - 0.4), color: "#ffffff", letterSpacing: 0.4 } }, t)));
    else head = h(Text, { style: s.secTitle }, t);
    return h(View, { style: s.sec }, head, children);
  };

  const b = d.basics || {};
  const bits = [];
  if (clean(b.email)) bits.push(h(Link, { key: "e", src: `mailto:${clean(b.email)}`, style: s.link }, clean(b.email)));
  if (clean(b.phone)) bits.push(clean(b.phone));
  if (clean(b.location)) bits.push(clean(b.location));
  (d.links || []).filter((x) => href(x.url)).forEach((x, i) => bits.push(h(Link, { key: `k${i}`, src: href(x.url), style: s.link }, clean(x.label) || shortUrl(x.url))));
  const contact = bits.flatMap((x, i) => (i ? [L.sep, x] : [x]));

  const edu = (d.education || []).filter((e) => clean(e.school) || clean(e.degree));
  const exp = (d.experience || []).filter((e) => clean(e.company) || clean(e.role));
  const prj = (d.projects || []).filter((p) => clean(p.name));
  const skl = (d.skills || []).filter((g) => list(g.items).length);
  const ext = (d.extras || []).filter((g) => list(g.items).length);

  const sections = {
    summary: clean(d.summary) ? h(Section, { key: "sum", title: "Summary" }, h(Text, null, clean(d.summary))) : null,
    education: edu.length
      ? h(Section, { key: "edu", title: "Education" }, edu.map((e, i) =>
          h(View, { key: i, style: s.item, wrap: false },
            h(View, { style: s.row },
              h(Text, { style: { ...s.bold, flex: 1 } }, clean(e.school) || clean(e.degree)),
              h(Text, { style: s.dates }, range(e.start, e.end, false))),
            clean(e.school) && (clean(e.degree) || clean(e.score)) ? h(Text, { style: s.italic }, [clean(e.degree), clean(e.score)].filter(Boolean).join("  |  ")) : null,
            clean(e.notes) ? h(Text, { style: { color: L.muted } }, clean(e.notes)) : null)))
      : null,
    skills: skl.length
      ? h(Section, { key: "skl", title: "Skills" }, skl.map((g, i) =>
          h(Text, { key: i, style: { marginTop: gap(1.8) } }, clean(g.group) ? h(Text, { style: s.bold }, `${clean(g.group)}: `) : null, list(g.items).join(L.mono ? "  •  " : ", "))))
      : null,
    experience: exp.length
      ? h(Section, { key: "exp", title: "Experience" }, exp.map((e, i) => {
          const lead = L.entry === "company" ? clean(e.company) || clean(e.role) : clean(e.role) || clean(e.company);
          const sub = L.entry === "company" ? clean(e.role) : clean(e.company);
          const place = clean(e.location);
          return h(View, { key: i, style: s.item },
            h(View, { style: s.row, wrap: false },
              h(Text, { style: { ...s.bold, flex: 1 } }, lead),
              h(Text, { style: s.dates }, range(e.start, e.end, e.current))),
            sub || place ? h(View, { style: s.row, wrap: false }, h(Text, { style: { ...s.italic, flex: 1 } }, sub !== lead ? sub : ""), place ? h(Text, { style: { ...s.italic, marginLeft: 10 } }, place) : null) : null,
            h(Bullets, { items: e.bullets }));
        }))
      : null,
    projects: prj.length
      ? h(Section, { key: "prj", title: "Projects" }, prj.map((p, i) => {
          const live = href(p.link), code = href(p.repo);
          return h(View, { key: i, style: s.item },
            h(View, { style: s.row, wrap: false },
              h(Text, { style: { flex: 1 } }, h(Text, { style: s.bold }, clean(p.name)), clean(p.tech) ? h(Text, { style: s.italic }, `  |  ${clean(p.tech)}`) : null),
              (live || code) ? h(Text, { style: s.dates }, live ? h(Link, { key: "l", src: live, style: { color: "#1d4ed8", textDecoration: "none" } }, "Live") : null, live && code ? "  ·  " : null, code ? h(Link, { key: "r", src: code, style: { color: "#1d4ed8", textDecoration: "none" } }, "Code") : null) : null),
            h(Bullets, { items: p.bullets }));
        }))
      : null,
  };
  // freshers lead with education and projects; experienced people lead with skills and experience
  const order = d.kind === "professional" ? ["summary", "skills", "experience", "projects", "education"] : ["summary", "education", "skills", "projects", "experience"];

  const header = [
    h(Text, { key: "n", style: s.name }, clean(b.name) || "Your Name"),
    clean(b.headline) ? h(Text, { key: "h", style: s.headline }, clean(b.headline)) : null,
    contact.length ? h(Text, { key: "c", style: s.contact }, contact) : null,
  ];

  return h(
    Document,
    { title: `${clean(b.name) || "Resume"} - Resume`, author: clean(b.name) },
    h(
      Page,
      { size: "A4", style: s.page },
      band ? h(View, { style: s.band }, ...header) : null,
      h(View, { style: s.body }, ...(band ? [] : header), ...order.map((k) => sections[k]), ...ext.map((g, i) => h(Section, { key: `x${i}`, title: clean(g.heading) || "Additional" }, h(Bullets, { items: g.items }))))
    )
  );
};

/* react-pdf writes a plain, uncompressed page tree, so the page count is right there in the file */
const countPages = (buf) => {
  const m = /\/Type\s*\/Pages[\s\S]{0,200}?\/Count\s+(\d+)/.exec(buf.toString("latin1")) || /\/Count\s+(\d+)[\s\S]{0,200}?\/Type\s*\/Pages/.exec(buf.toString("latin1"));
  return m ? Number(m[1]) : 1;
};

/* -> { buf, pages, scale }; pages is 1 whenever the content can be made to fit */
export const renderResumePdf = async (draft) => {
  const d = typeof draft?.toObject === "function" ? draft.toObject() : draft;
  let last = null;
  for (const scale of SCALES) {
    const buf = await renderToBuffer(buildDoc(d, scale));
    const pages = countPages(buf);
    last = { buf, pages, scale };
    if (pages <= 1) break;
  }
  return last;
};
