import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Helmet } from "react-helmet";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Document, Page, pdfjs } from "react-pdf";
// import lldPreviewPdf from "../assets/master_lld_java_preview.pdf";

import lldPreviewPdf from "../assest/master_lld_java_preview.pdf";

import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Layers3,
  LockKeyhole,
  Moon,
  Network,
  ShieldCheck,
  Sparkles,
  Sun,
  Workflow,
  Zap,
} from "lucide-react";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const SITE_NAME = "Target Trek";
const SITE_URL = "https://www.targettrek.in";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";
const SEO_TITLE = "System Design LLD in Java | Target Trek";
const SEO_DESCRIPTION =
  "Learn Java LLD through OOP, UML, SOLID, all 23 GoF patterns and 16 detailed interview practice problems.";
const THEME_KEY = "targettrek-lld-theme";
const HLD_REDIRECT_URL = "/book/system-design/hld";

const modules = [
  {
    number: "01",
    title: "LLD foundations",
    detail: "LLD vs HLD, interview expectations, responsibilities, cohesion and coupling.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "OOP in Java",
    detail:
      "Encapsulation, abstraction, inheritance, polymorphism, composition and Java modeling choices.",
    icon: Code2,
  },
  {
    number: "03",
    title: "UML and relationships",
    detail:
      "Class, sequence and state diagrams; IS-A, HAS-A, association, aggregation and composition.",
    icon: Network,
  },
  {
    number: "04",
    title: "SOLID and design principles",
    detail: "SOLID, DRY, KISS, YAGNI, Tell-Don't-Ask, Law of Demeter and more, with Java examples.",
    icon: Layers3,
  },
  {
    number: "05",
    title: "All 23 GoF patterns",
    detail:
      "Creational, structural and behavioral patterns: what problem each solves and when to use it.",
    icon: Sparkles,
  },
  {
    number: "06",
    title: "Concurrency and locking",
    detail:
      "Thread safety, race conditions, synchronized, atomic updates, seat and stock reservation.",
    icon: LockKeyhole,
  },
  {
    number: "07",
    title: "The 60-minute method",
    detail:
      "Clarify requirements, model classes, sketch UML, code the core flow and discuss trade-offs.",
    icon: Clock3,
  },
  {
    number: "08",
    title: "16 design problems",
    detail:
      "Practice 16 detailed prompts with requirements, core entities, class relationships and concurrency challenges.",
    icon: Workflow,
  },
];

const faqItems = [
  {
    q: "What exactly is included in this Java LLD book?",
    a: "The book covers LLD foundations, Java OOP, UML diagrams and relationships, SOLID and related principles, all 23 GoF patterns, a 60-minute interview framework, and 16 detailed LLD practice prompts.",
  },
  {
    q: "Are the design questions solved in Java?",
    a: "Yes. Java 17 is the language used for the examples. The question bank focuses on classes, enums, interfaces and in-memory data structures so you can practice object-oriented design clearly.",
  },
  {
    q: "Does the question bank include databases or Spring layers?",
    a: "No. These are interview-sized object-oriented design exercises. The question bank explicitly keeps the scope to domain classes and an in-memory system manager, without Spring, database, controller, service or repository layers.",
  },
  {
    q: "Do I need to memorize every design pattern?",
    a: "No. Learn the problem each pattern addresses and its trade-offs. The book encourages modeling the requirements first and selecting a pattern only when it helps.",
  },
  {
    q: "How does checkout work?",
    a: "Choose Get the ebook to open the existing secure PayU checkout flow. You can review the current price and order details before paying.",
  },
];

const flowSteps = [
  { n: "01", title: "Clarify", text: "Functional and non-functional requirements" },
  { n: "02", title: "Model", text: "Entities, responsibilities and invariants" },
  { n: "03", title: "Diagram", text: "Relationships, class and state flow" },
  { n: "04", title: "Choose", text: "Principles and patterns that fit" },
  { n: "05", title: "Code", text: "Core Java classes and behavior" },
  { n: "06", title: "Validate", text: "Concurrency, edge cases and trade-offs" },
];

const styles = `
html,
body,
#root {
  min-width: 100%;
}
body {
  margin: 0;
  overflow-x: hidden;
  background: #f8fbff;
}
html[data-lld-theme="dark"] body {
  background: #0a1020;
}
header button.rounded-full,
nav button.rounded-full,
header [role="button"].rounded-full,
nav [role="button"].rounded-full,
button[aria-label*="profile" i],
button[aria-label*="account" i],
button[aria-label*="user" i] {
  background: #eff6ff !important;
  color: #0f172a !important;
  border-color: #bfdbfe !important;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
}
html[data-lld-theme="dark"] header button.rounded-full,
html[data-lld-theme="dark"] nav button.rounded-full,
html[data-lld-theme="dark"] header [role="button"].rounded-full,
html[data-lld-theme="dark"] nav [role="button"].rounded-full,
html[data-lld-theme="dark"] button[aria-label*="profile" i],
html[data-lld-theme="dark"] button[aria-label*="account" i],
html[data-lld-theme="dark"] button[aria-label*="user" i] {
  background: #172033 !important;
  color: #f8fafc !important;
  border-color: #475569 !important;
}
.lldPage {
  --bg: #f8fbff;
  --surface: #ffffff;
  --surface-2: #f1f6fc;
  --text: #0f172a;
  --muted: #5f6f86;
  --border: #dbe5f0;
  --accent: #2563eb;
  --accent-2: #6d5ce7;
  --soft: #eaf2ff;
  --hero: #f8fbff;
  --hero-mid: #eef5ff;
  --hero-end: #f7f2ff;
  --hero-text: #0f172a;
  --hero-muted: #52647d;
  --hero-dot: rgba(37, 99, 235, 0.11);
  --hero-eyebrow-bg: rgba(255, 255, 255, 0.9);
  --hero-eyebrow-border: #cbdcf6;
  --hero-eyebrow-text: #1d4ed8;
  --hero-outline-bg: rgba(255, 255, 255, 0.82);
  --hero-outline-border: #cbdcf6;
  --hero-outline-text: #1e293b;
  --chip-bg: rgba(255, 255, 255, 0.92);
  --chip-border: #d9e5f5;
  --chip-text: #27364f;
  --chip-shadow: 0 14px 30px rgba(44, 71, 118, 0.14);
  --code: #10182a;
  --shadow: 0 18px 55px rgba(29, 49, 88, 0.09);
  color-scheme: light;
  position: relative;
  width: 100vw;
  max-width: none;
  min-height: 100vh;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  overflow-x: clip;
  overflow-y: visible;
  background: var(--bg);
  color: var(--text);
  isolation: isolate;
  transition:
    background 0.25s ease,
    color 0.25s ease;
}
@supports (width: 100dvw) {
  .lldPage {
    width: 100dvw;
    margin-left: calc(50% - 50dvw);
    margin-right: calc(50% - 50dvw);
  }
}
.lldPage[data-theme="dark"] {
  --bg: #0a1020;
  --surface: #111a2e;
  --surface-2: #17223a;
  --text: #edf3ff;
  --muted: #a6b2c8;
  --border: #26334c;
  --accent: #94a8ff;
  --accent-2: #c2a1ff;
  --soft: #1e2b49;
  --hero: #101b36;
  --hero-mid: #172c54;
  --hero-end: #28205a;
  --hero-text: #f8faff;
  --hero-muted: #bfcae0;
  --hero-dot: rgba(255, 255, 255, 0.14);
  --hero-eyebrow-bg: rgba(255, 255, 255, 0.08);
  --hero-eyebrow-border: rgba(174, 193, 255, 0.28);
  --hero-eyebrow-text: #dce5ff;
  --hero-outline-bg: rgba(255, 255, 255, 0.07);
  --hero-outline-border: rgba(255, 255, 255, 0.25);
  --hero-outline-text: #f4f7ff;
  --chip-bg: rgba(17, 29, 61, 0.86);
  --chip-border: rgba(255, 255, 255, 0.16);
  --chip-text: #edf2ff;
  --chip-shadow: 0 15px 30px rgba(0, 0, 0, 0.18);
  --code: #080e1b;
  --shadow: 0 18px 55px rgba(0, 0, 0, 0.22);
  color-scheme: dark;
}
.lldPage * {
  box-sizing: border-box;
}
.lldPage a {
  color: inherit;
  text-decoration: none;
}
.lldPage button {
  font: inherit;
}
.lld-shell {
  width: min(1280px, calc(100% - 48px));
  margin: 0 auto;
}
.lld-nav {
  position: sticky;
  top: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--bg) 84%, transparent);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
}
.lld-nav-inner {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}
.lld-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 850;
  letter-spacing: -0.03em;
}
.lld-brand-mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3a5cf0, #9362f4);
  color: #fff;
  box-shadow: 0 8px 20px rgba(68, 85, 235, 0.25);
}
.lld-nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
}
.lld-nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lld-theme-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 13px;
  background: color-mix(in srgb, var(--surface) 92%, var(--soft));
  color: var(--text);
  box-shadow: 0 5px 16px rgba(15, 23, 42, 0.08);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    transform 0.2s,
    border-color 0.2s;
}
.lld-theme-btn:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}
.lld-cta {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  background: linear-gradient(110deg, #3659ee, #7655e9);
  color: white !important;
  border: 0;
  border-radius: 14px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 850;
  box-shadow: 0 12px 26px rgba(71, 84, 229, 0.23);
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    filter 0.2s;
  cursor: pointer;
}
.lld-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(71, 84, 229, 0.32);
  filter: saturate(1.1);
}
.lld-cta:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.lld-cta-outline {
  background: var(--surface);
  color: var(--text) !important;
  border: 1px solid var(--border);
  box-shadow: none;
}
.lld-hero {
  position: relative;
  padding: 68px 0 76px;
  background:
    radial-gradient(
      ellipse at 74% 28%,
      color-mix(in srgb, var(--accent-2) 16%, transparent),
      transparent 38%
    ),
    linear-gradient(130deg, var(--hero), var(--hero-mid) 60%, var(--hero-end));
  color: var(--hero-text);
}
.lld-hero:before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    var(--hero-dot) 1px,
    transparent 1px
  );
  background-size: 25px 25px;
  mask-image: linear-gradient(90deg, transparent, black);
}
.lld-hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(340px, 0.9fr);
  gap: 48px;
  align-items: center;
}
.lld-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--hero-eyebrow-border);
  background: var(--hero-eyebrow-bg);
  color: var(--hero-eyebrow-text);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 11px;
  letter-spacing: 0.1em;
  font-weight: 850;
  text-transform: uppercase;
}
.lld-hero h1 {
  font-size: clamp(42px, 6vw, 68px);
  line-height: 0.99;
  letter-spacing: -0.055em;
  margin: 22px 0 18px;
  max-width: 690px;
}
.lld-gradient-text {
  background: linear-gradient(90deg, #2563eb, #7c3aed, #0284c7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.lldPage[data-theme="dark"] .lld-gradient-text {
  background: linear-gradient(90deg, #b1c2ff, #d6b9ff, #98e0ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.lld-hero-copy {
  max-width: 590px;
  color: var(--hero-muted);
  font-size: 16px;
  line-height: 1.8;
}
.lld-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}
.lld-hero .lld-cta-outline {
  color: var(--hero-outline-text) !important;
  border-color: var(--hero-outline-border);
  background: var(--hero-outline-bg);
}
.lld-hero .lld-cta-outline:hover {
  background: color-mix(in srgb, var(--hero-outline-bg) 72%, var(--accent) 12%);
}
.lld-hero-bullets {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 25px;
  color: var(--hero-muted);
  font-size: 12px;
  font-weight: 700;
}
.lld-hero-bullets span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.lld-hero-bullets svg {
  color: #85e2be;
}
.lld-book-stage {
  position: relative;
  min-height: 510px;
  display: grid;
  place-items: center;
  perspective: 1000px;
}
.lld-orbit {
  position: absolute;
  width: 360px;
  height: 360px;
  border: 1px solid rgba(179, 198, 255, 0.16);
  border-radius: 50%;
  animation: lldRotate 28s linear infinite;
}
.lld-orbit:before,
.lld-orbit:after {
  content: "";
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #98b1ff;
  box-shadow: 0 0 18px #89a4ff;
}
.lld-orbit:before {
  left: 34px;
  top: 78px;
}
.lld-orbit:after {
  right: 25px;
  bottom: 77px;
  background: #caa8ff;
}
.lld-book-mock {
  position: relative;
  width: min(310px, 75vw);
  height: 470px;
  border-radius: 5px 13px 13px 5px;
  background: linear-gradient(150deg, #182956, #263f83 58%, #5e4fb2);
  box-shadow:
    22px 28px 54px rgba(0, 0, 0, 0.38),
    inset 7px 0 0 rgba(255, 255, 255, 0.08);
  transform: rotateY(-9deg) rotateX(2deg);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.25);
  animation: lldFloat 5s ease-in-out infinite;
}
.lld-book-mock:before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at 72% 22%,
      rgba(138, 171, 255, 0.32),
      transparent 34%
    ),
    linear-gradient(140deg, transparent 40%, rgba(255, 255, 255, 0.07));
}
.lld-book-grid {
  position: absolute;
  inset: 24px 22px auto;
  height: 120px;
  opacity: 0.82;
}
.lld-book-grid svg {
  width: 100%;
  height: 100%;
}
.lld-book-content {
  position: absolute;
  inset: auto 25px 27px;
}
.lld-book-kicker {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #bdd0ff;
  font-weight: 850;
}
.lld-book-title {
  font-size: 26px;
  line-height: 1.04;
  letter-spacing: -0.04em;
  color: white;
  font-weight: 900;
  margin-top: 12px;
}
.lld-book-subtitle {
  font-size: 10px;
  line-height: 1.55;
  color: #d6ddf5;
  margin-top: 12px;
  max-width: 210px;
}
.lld-book-tag {
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  padding: 6px 9px;
  margin-top: 15px;
  color: #dce6ff;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.lld-float-chip {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 13px;
  border: 1px solid var(--chip-border);
  border-radius: 15px;
  background: var(--chip-bg);
  color: var(--chip-text);
  box-shadow: var(--chip-shadow);
  font-size: 11px;
  font-weight: 800;
  backdrop-filter: blur(10px);
  animation: lldFloat 4s ease-in-out infinite;
}
.lld-chip-one {
  top: 32px;
  left: 0;
}
.lld-chip-two {
  right: -2px;
  top: 112px;
  animation-delay: -1.5s;
}
.lld-chip-three {
  bottom: 38px;
  left: 4px;
  animation-delay: -2.5s;
}
.lld-hero-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(195, 207, 255, 0.45),
    transparent
  );
}
.lld-section {
  padding: 82px 0;
}
.lld-section-tight {
  padding: 56px 0;
}
.lld-section-head {
  max-width: 720px;
  margin: 0 auto 38px;
  text-align: center;
}
.lld-kicker {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 900;
  color: var(--accent);
}
.lld-section-head h2,
.lld-section-title {
  font-size: clamp(29px, 4vw, 43px);
  line-height: 1.08;
  letter-spacing: -0.045em;
  margin: 12px 0;
  color: var(--text);
}
.lld-section-head p {
  color: var(--muted);
  font-size: 15px;
  line-height: 1.75;
  margin: 0;
}
.lld-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: -32px;
  position: relative;
  z-index: 2;
}
.lld-stat {
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 18px;
  padding: 19px;
  box-shadow: var(--shadow);
}
.lld-stat strong {
  display: block;
  font-size: 25px;
  letter-spacing: -0.04em;
  color: var(--text);
}
.lld-stat span {
  display: block;
  font-size: 11px;
  color: var(--muted);
  font-weight: 750;
  margin-top: 5px;
}
.lld-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 21px;
  box-shadow: var(--shadow);
  transition:
    transform 0.22s,
    border-color 0.22s,
    box-shadow 0.22s;
}
.lld-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
  box-shadow: 0 22px 55px rgba(30, 51, 97, 0.12);
}
.lld-muted {
  color: var(--muted);
}
.lld-module-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.lld-module {
  padding: 21px;
  min-height: 205px;
}
.lld-module-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: var(--soft);
  color: var(--accent);
}
.lld-module-number {
  float: right;
  font-size: 11px;
  color: var(--muted);
  font-weight: 900;
  letter-spacing: 0.1em;
}
.lld-module h3 {
  font-size: 16px;
  letter-spacing: -0.02em;
  margin: 18px 0 8px;
}
.lld-module p {
  font-size: 12px;
  line-height: 1.7;
  color: var(--muted);
  margin: 0;
}
.lld-flow {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  position: relative;
}
.lld-flow-step {
  position: relative;
  padding: 18px 14px;
  min-height: 160px;
  z-index: 1;
}
.lld-flow-step:not(:last-child):after {
  content: "";
  position: absolute;
  top: 39px;
  right: -14px;
  width: 19px;
  height: 1px;
  background: var(--accent);
  z-index: 2;
}
.lld-flow-step .lld-flow-num {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--accent);
  font-weight: 900;
}
.lld-flow-step h3 {
  font-size: 15px;
  margin: 12px 0 7px;
}
.lld-flow-step p {
  font-size: 11px;
  line-height: 1.55;
  color: var(--muted);
  margin: 0;
}
.lld-flow-icon {
  display: grid;
  place-items: center;
  width: 31px;
  height: 31px;
  border-radius: 11px;
  background: var(--soft);
  color: var(--accent);
  margin-bottom: 12px;
}
.lld-diagram-panel {
  margin-top: 22px;
  padding: 24px;
  border-radius: 22px;
  border: 1px solid var(--border);
  background: linear-gradient(135deg, var(--surface), var(--surface-2));
}
.lld-diagram-title {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  align-items: center;
  margin-bottom: 19px;
}
.lld-diagram-title h3 {
  font-size: 16px;
  margin: 0;
}
.lld-diagram-title span {
  font-size: 10px;
  font-weight: 850;
  color: var(--muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.lld-class-diagram {
  display: grid;
  grid-template-columns: 1fr auto 1.15fr auto 1fr;
  align-items: center;
  gap: 12px;
}
.lld-uml-box {
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 14px;
  overflow: hidden;
  min-width: 0;
}
.lld-uml-box strong {
  display: block;
  padding: 11px 13px;
  background: var(--soft);
  color: var(--text);
  font-size: 12px;
}
.lld-uml-box span {
  display: block;
  padding: 9px 13px;
  border-top: 1px solid var(--border);
  font-size: 10px;
  color: var(--muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.lld-diagram-arrow {
  color: var(--accent);
  display: grid;
  place-items: center;
}
.lld-state-track {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
  flex-wrap: wrap;
}
.lld-state {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 9px 13px;
  background: var(--surface);
  font-size: 11px;
  font-weight: 850;
}
.lld-state-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7280;
}
.lld-state.is-active .lld-state-dot {
  background: #31c48d;
  box-shadow: 0 0 0 5px rgba(49, 196, 141, 0.14);
}
.lld-state-arrow {
  color: var(--muted);
}
.lld-pattern-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.lld-pattern-card {
  padding: 22px;
}
.lld-pattern-card h3 {
  font-size: 17px;
  margin: 0 0 4px;
}
.lld-pattern-card .lld-count {
  font-size: 11px;
  color: var(--muted);
  font-weight: 750;
}
.lld-pattern-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 17px;
}
.lld-pattern-pill {
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 10px;
  padding: 7px 9px;
  font-size: 10px;
  font-weight: 750;
}
.lld-scope-note {
  margin-top: 20px;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  font-size: 12px;
  line-height: 1.65;
  color: var(--muted);
}
.lld-question-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.lld-question {
  padding: 20px;
  position: relative;
  overflow: hidden;
}
.lld-question:before {
  content: attr(data-number);
  position: absolute;
  right: 16px;
  top: 9px;
  font-size: 51px;
  line-height: 1;
  font-weight: 950;
  letter-spacing: -0.06em;
  color: var(--soft);
  pointer-events: none;
}
.lld-question-top {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--accent);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  position: relative;
}
.lld-question h3 {
  font-size: 17px;
  letter-spacing: -0.025em;
  margin: 12px 0 4px;
  position: relative;
}
.lld-question-product {
  font-size: 11px;
  color: var(--muted);
  font-weight: 700;
}
.lld-question-focus {
  font-size: 12px;
  color: var(--text);
  line-height: 1.55;
  margin: 13px 0 0;
  max-width: 460px;
}
.lld-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}
.lld-tag {
  border-radius: 999px;
  background: var(--soft);
  color: var(--accent);
  padding: 5px 8px;
  font-size: 9px;
  font-weight: 850;
}
.lld-code-card {
  background: var(--code);
  border-radius: 21px;
  overflow: hidden;
  color: #e5edff;
  border: 1px solid rgba(140, 160, 220, 0.2);
  box-shadow: var(--shadow);
}
.lld-code-top {
  padding: 14px 17px;
  border-bottom: 1px solid rgba(190, 205, 255, 0.13);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #b9c7e5;
  font-weight: 800;
}
.lld-code-dots {
  display: flex;
  gap: 5px;
}
.lld-code-dots i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #61708e;
}
.lld-code-card pre {
  padding: 21px;
  margin: 0;
  overflow: auto;
  font:
    12px/1.8 ui-monospace,
    SFMono-Regular,
    Menlo,
    monospace;
  color: #e5edff;
}
.lld-highlight {
  color: #a6bcff;
}
.lld-code-caption {
  padding: 0 21px 19px;
  font-size: 11px;
  line-height: 1.6;
  color: #9daecc;
}
.lld-faq {
  max-width: 850px;
  margin: 0 auto;
  display: grid;
  gap: 10px;
}
.lld-faq-item {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
}
.lld-faq-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  width: 100%;
  padding: 18px 20px;
  border: 0;
  background: transparent;
  color: var(--text);
  text-align: left;
  font-size: 14px;
  font-weight: 850;
  cursor: pointer;
}
.lld-faq-answer {
  padding: 0 20px 18px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
}
.lld-final-cta {
  position: relative;
  overflow: hidden;
  padding: clamp(28px, 5vw, 52px);
  border-radius: 28px;
  background: linear-gradient(130deg, #16234a, #373078 68%, #5a3f9f);
  color: white;
  display: grid;
  grid-template-columns: 1fr minmax(250px, 310px);
  gap: 32px;
  align-items: center;
  box-shadow: 0 24px 60px rgba(39, 44, 103, 0.22);
}
.lld-final-cta:after {
  content: "";
  position: absolute;
  width: 330px;
  height: 330px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  right: 18%;
  top: -210px;
  box-shadow:
    0 0 0 35px rgba(255, 255, 255, 0.035),
    0 0 0 72px rgba(255, 255, 255, 0.025);
}
.lld-final-copy,
.lld-price-card {
  position: relative;
  z-index: 1;
}
.lld-final-copy h2 {
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.08;
  letter-spacing: -0.045em;
  margin: 15px 0;
}
.lld-final-copy p {
  max-width: 560px;
  color: #c5cee5;
  font-size: 14px;
  line-height: 1.75;
}
.lld-final-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 18px;
  font-size: 11px;
  color: #e3eaff;
  font-weight: 800;
}
.lld-final-checks span {
  display: flex;
  align-items: center;
  gap: 6px;
}
.lld-price-card {
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  padding: 23px;
}
.lld-price-label {
  font-size: 11px;
  color: #c7d2ed;
  font-weight: 800;
}
.lld-price-line {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 9px 0;
}
.lld-price-now {
  font-size: 36px;
  font-weight: 950;
  letter-spacing: -0.05em;
  color: white;
}
.lld-price-old {
  font-size: 15px;
  color: #b8c2dc;
  text-decoration: line-through;
}
.lld-discount {
  font-size: 11px;
  font-weight: 900;
  color: #9ff0cb;
}
.lld-price-card .lld-cta {
  margin-top: 16px;
  width: 100%;
  background: linear-gradient(100deg, #a99bff, #8ad8ff);
  color: #141731 !important;
}
.lld-price-small {
  font-size: 10px;
  text-align: center;
  color: #cad2e7;
  line-height: 1.55;
  margin: 11px 0 0;
}
.lld-footer {
  padding: 31px 0 85px;
  color: var(--muted);
  font-size: 11px;
}
.lld-footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  border-top: 1px solid var(--border);
  padding-top: 23px;
}
.lld-mobile-buy {
  display: none;
}
.lld-error {
  font-size: 11px;
  color: #ffb4bd;
  line-height: 1.5;
  margin: 10px 0 0;
}
.lld-skeleton {
  height: 18px;
  width: 95px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.14),
    rgba(255, 255, 255, 0.28),
    rgba(255, 255, 255, 0.14)
  );
  background-size: 180% 100%;
  animation: lldShimmer 1.2s infinite;
}
.lld-hld-section {
  padding: 42px 0 18px;
}
.lld-hld-head {
  max-width: 720px;
  margin: 0 auto 24px;
  text-align: center;
}
.lld-hld-head h2 {
  margin: 9px 0 0;
  color: var(--text);
  font-size: clamp(25px, 4vw, 36px);
  line-height: 1.12;
  letter-spacing: -0.04em;
}
.lld-hld-head p {
  max-width: 620px;
  margin: 12px auto 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.7;
}
.lld-hld-card {
  display: grid;
  grid-template-columns: minmax(250px, 0.76fr) minmax(0, 1.24fr);
  max-width: 930px;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 24px;
  background: var(--surface);
  box-shadow: var(--shadow);
}
.lld-hld-cover {
  position: relative;
  min-height: 360px;
  overflow: hidden;
  border-right: 1px solid var(--border);
  background:
    radial-gradient(circle at 70% 20%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 38%),
    linear-gradient(145deg, var(--surface-2), var(--soft));
}
.lld-hld-cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.lld-hld-cover-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 28px;
  color: var(--text);
}
.lld-hld-cover-fallback small {
  color: var(--accent);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.lld-hld-cover-fallback strong {
  max-width: 260px;
  margin-top: 12px;
  font-size: 30px;
  line-height: 1.05;
  letter-spacing: -0.045em;
}
.lld-hld-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 30px;
}
.lld-hld-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.lld-hld-badge {
  display: inline-flex;
  align-items: center;
  min-height: 27px;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--accent);
  font-size: 10px;
  font-weight: 900;
}
.lld-hld-details h3 {
  margin: 17px 0 0;
  color: var(--text);
  font-size: clamp(23px, 3vw, 31px);
  line-height: 1.1;
  letter-spacing: -0.04em;
}
.lld-hld-details > p {
  margin: 13px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.75;
}
.lld-hld-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 17px;
}
.lld-hld-topic {
  padding: 6px 9px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg);
  color: var(--muted);
  font-size: 10px;
  font-weight: 800;
}
.lld-hld-price-box {
  margin-top: 19px;
  padding: 15px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--surface-2);
}
.lld-hld-price-label {
  color: var(--accent);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.lld-hld-price-row {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 9px;
  margin-top: 5px;
}
.lld-hld-current {
  color: var(--text);
  font-size: 24px;
  font-weight: 900;
}
.lld-hld-old {
  padding-bottom: 2px;
  color: var(--muted);
  font-size: 13px;
  text-decoration: line-through;
}
.lld-hld-save {
  padding-bottom: 2px;
  color: #059669;
  font-size: 10px;
  font-weight: 900;
}
.lldPage[data-theme="dark"] .lld-hld-save {
  color: #6ee7b7;
}
.lld-hld-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 19px;
}
.lld-hld-actions .lld-cta,
.lld-hld-actions .lld-cta-outline {
  min-height: 44px;
  padding: 11px 15px;
  font-size: 12px;
}
.lld-hld-error {
  margin: 10px 0 0;
  color: #b45309;
  font-size: 11px;
  line-height: 1.5;
}
.lldPage[data-theme="dark"] .lld-hld-error {
  color: #fbbf24;
}
@keyframes lldFloat {
  0%,
  100% {
    transform: translateY(0) rotateY(-9deg);
  }
  50% {
    transform: translateY(-9px) rotateY(-7deg);
  }
}
@keyframes lldRotate {
  to {
    transform: rotate(360deg);
  }
}
@keyframes lldShimmer {
  to {
    background-position: -180% 0;
  }
}
@media (max-width: 950px) {
  .lld-hero-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .lld-book-stage {
    min-height: 455px;
  }
  .lld-module-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .lld-flow {
    grid-template-columns: repeat(3, 1fr);
  }
  .lld-flow-step:nth-child(3):after {
    display: none;
  }
  .lld-final-cta {
    grid-template-columns: 1fr 280px;
  }
}
@media (max-width: 720px) {
  .lld-shell {
    width: min(100% - 28px, 620px);
  }
  .lld-nav-inner {
    height: 62px;
  }
  .lld-nav-links {
    display: none;
  }
  .lld-brand {
    font-size: 13px;
  }
  .lld-nav-actions .lld-cta {
    padding: 11px 13px;
    font-size: 11px;
  }
  .lld-theme-btn {
    width: 37px;
    height: 37px;
  }
  .lld-hero {
    padding: 40px 0 56px;
  }
  .lld-hero-grid {
    grid-template-columns: 1fr;
  }
  .lld-hero h1 {
    font-size: clamp(36px, 11vw, 52px);
    line-height: 1.02;
  }
  .lld-hero-copy {
    font-size: 14px;
  }
  .lld-book-stage {
    min-height: 390px;
    margin-top: 0;
  }
  .lld-book-mock {
    height: 365px;
    width: 245px;
  }
  .lld-orbit {
    width: 310px;
    height: 310px;
  }
  .lld-chip-one {
    left: 0;
    top: 20px;
  }
  .lld-chip-two {
    right: 0;
    top: 90px;
  }
  .lld-chip-three {
    bottom: 15px;
    left: 0;
  }
  .lld-stats {
    grid-template-columns: repeat(2, 1fr);
    margin-top: -24px;
  }
  .lld-stat {
    padding: 15px;
  }
  .lld-stat strong {
    font-size: 21px;
  }
  .lld-section {
    padding: 62px 0;
  }
  .lld-section-tight {
    padding: 48px 0;
  }
  .lld-section-head {
    margin-bottom: 27px;
  }
  .lld-module-grid {
    grid-template-columns: 1fr 1fr;
    gap: 9px;
  }
  .lld-module {
    padding: 16px;
    min-height: 185px;
  }
  .lld-module h3 {
    font-size: 14px;
    margin-top: 14px;
  }
  .lld-module p {
    font-size: 11px;
  }
  .lld-flow {
    grid-template-columns: repeat(2, 1fr);
  }
  .lld-flow-step:nth-child(3):after {
    display: block;
  }
  .lld-flow-step:nth-child(even):after {
    display: none;
  }
  .lld-flow-step {
    min-height: 144px;
  }
  .lld-diagram-panel {
    padding: 17px;
  }
  .lld-class-diagram {
    grid-template-columns: 1fr;
    gap: 7px;
  }
  .lld-diagram-arrow {
    transform: rotate(90deg);
    height: 18px;
  }
  .lld-state-track {
    gap: 7px;
  }
  .lld-state {
    padding: 8px 10px;
    font-size: 10px;
  }
  .lld-pattern-grid {
    grid-template-columns: 1fr;
  }
  .lld-question-grid {
    grid-template-columns: 1fr;
  }
  .lld-question {
    padding: 17px;
  }
  .lld-question h3 {
    font-size: 16px;
  }
  .lld-final-cta {
    grid-template-columns: 1fr;
    padding: 27px 21px;
    gap: 22px;
  }
  .lld-price-card {
    max-width: none;
  }
  .lld-footer-inner {
    align-items: flex-start;
    flex-direction: column;
  }
  .lld-mobile-buy {
    display: flex;
    position: fixed;
    z-index: 35;
    bottom: max(10px, env(safe-area-inset-bottom));
    left: max(10px, env(safe-area-inset-left));
    right: max(10px, env(safe-area-inset-right));
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 10px 9px 14px;
    border: 1px solid var(--border);
    border-radius: 17px;
    background: color-mix(in srgb, var(--surface) 91%, transparent);
    backdrop-filter: blur(16px);
    box-shadow: 0 12px 35px rgba(15, 25, 50, 0.22);
  }
  .lld-mobile-price {
    font-size: 12px;
    font-weight: 900;
    color: var(--text);
  }
  .lld-mobile-price small {
    display: block;
    font-size: 9px;
    color: var(--muted);
    font-weight: 700;
  }
  .lld-mobile-buy .lld-cta {
    padding: 11px 14px;
    font-size: 11px;
  }
  .lld-footer {
    padding-bottom: 94px;
  }
  .lld-hld-card {
    grid-template-columns: 1fr;
    max-width: 580px;
  }
  .lld-hld-cover {
    min-height: 285px;
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }
  .lld-hld-details {
    padding: 24px;
  }
  .lld-hld-section {
    padding-top: 34px;
  }
}
@media (max-width: 480px) {
  .lld-shell {
    width: min(100% - 22px, 560px);
  }
  .lld-hero-actions {
    display: grid;
    grid-template-columns: 1fr;
  }
  .lld-hero-actions .lld-cta {
    width: 100%;
    min-height: 46px;
  }
  .lld-hero-bullets {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .lld-book-stage {
    min-height: 365px;
  }
  .lld-book-mock {
    width: 230px;
    height: 345px;
  }
  .lld-orbit {
    width: 265px;
    height: 265px;
  }
  .lld-float-chip {
    padding: 8px 9px;
    font-size: 9px;
    border-radius: 12px;
  }
  .lld-chip-one {
    top: 16px;
  }
  .lld-chip-two {
    top: 78px;
  }
  .lld-chip-three {
    bottom: 12px;
  }
  .lld-mobile-buy {
    gap: 8px;
  }
  .lld-mobile-buy .lld-cta {
    min-height: 42px;
  }
  .lld-hld-cover {
    min-height: 230px;
  }
  .lld-hld-details {
    padding: 20px;
  }
  .lld-hld-actions {
    grid-template-columns: 1fr;
  }
  .lld-hld-actions .lld-cta,
  .lld-hld-actions .lld-cta-outline {
    width: 100%;
  }
}
@media (max-width: 390px) {
  .lld-nav-actions .lld-cta {
    display: none;
  }
  .lld-module-grid {
    grid-template-columns: 1fr;
  }
  .lld-module {
    min-height: 0;
  }
  .lld-hero-actions .lld-cta {
    width: 100%;
  }
  .lld-state-track {
    gap: 5px;
  }
  .lld-state {
    font-size: 9px;
    padding: 7px 8px;
  }
}

.lldPage {
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}
.lldPage section[id],
.lldPage [id="patterns"],
.lldPage [id="problems"] {
  scroll-margin-top: 90px;
}
.lldPage button:focus-visible,
.lldPage a:focus-visible,
.lldPage summary:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 4px;
}
.lld-expanded section {
  position: relative;
}
.lld-expanded [class~="bg-[#fbfdff]"] {
  background: var(--surface);
}
.lld-expanded [class~="bg-white"] {
  background-color: var(--surface);
}
.lld-expanded [class~="bg-slate-50"],
.lld-expanded [class~="bg-slate-100"],
.lld-expanded [class~="bg-blue-50"],
.lld-expanded [class~="bg-blue-100"],
.lld-expanded [class~="bg-emerald-50"] {
  background-color: var(--surface-2);
}
.lld-expanded [class*="text-slate-9"],
.lld-expanded [class~="text-slate-800"] {
  color: var(--text);
}
.lld-expanded [class~="text-slate-700"],
.lld-expanded [class~="text-slate-600"],
.lld-expanded [class~="text-slate-500"],
.lld-expanded [class~="text-slate-400"] {
  color: var(--muted);
}
.lld-expanded [class~="text-blue-600"],
.lld-expanded [class~="text-blue-700"],
.lld-expanded [class~="text-blue-500"] {
  color: var(--accent);
}
.lld-expanded [class*="border-slate-"],
.lld-expanded [class*="border-blue-"],
.lld-expanded [class*="border-emerald-"] {
  border-color: var(--border);
}
.lld-expanded [class*="bg-blue-50/"] {
  background-color: var(--soft);
}
.lld-expanded [class~="from-blue-50"] {
  --tw-gradient-from: var(--surface-2);
  --tw-gradient-to: var(--surface);
}
.lld-expanded [class~="via-white"] {
  --tw-gradient-stops: var(--surface-2), var(--surface), var(--surface-2);
}
.lld-expanded [class~="to-slate-50"] {
  --tw-gradient-to: var(--surface-2);
}
.lld-expanded [class~="to-white"] {
  --tw-gradient-to: var(--surface);
}
.lld-expanded h2 {
  letter-spacing: -0.04em;
  font-size: clamp(27px, 4vw, 40px);
  line-height: 1.14;
}
.lld-expanded pre {
  background: var(--code) !important;
  color: #dfebff !important;
  border-radius: 16px;
  font-size: 12px;
  line-height: 1.85;
  tab-size: 4;
}
.lld-expanded [class~="rounded-3xl"] {
  border-radius: 24px;
  box-shadow: var(--shadow);
}
.lld-expanded details {
  margin-top: 20px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface-2);
  overflow: hidden;
}
.lld-expanded summary {
  cursor: pointer;
  padding: 15px;
  font-size: 12px;
  font-weight: 800;
  color: var(--accent);
}
.lld-requirements {
  padding: 0 17px 18px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.8;
}
.lld-requirements h4 {
  margin: 18px 0 9px;
  color: var(--text);
  font-size: 13px;
  font-weight: 800;
}
.lld-requirements ul {
  list-style: disc;
  padding-left: 20px;
  display: grid;
  gap: 8px;
}
.lld-requirements code {
  padding: 2px 4px;
  background: var(--soft);
  border-radius: 4px;
  overflow-wrap: anywhere;
  color: var(--accent);
}
.lld-requirements strong {
  color: var(--text);
}
.lld-source-note {
  border: 1px solid var(--border);
  background: var(--soft);
  padding: 22px;
  border-radius: 20px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--muted);
  margin: 28px auto;
}

.lldPage {
  padding-top: var(--lld-navbar-offset, 88px);
  padding-bottom: 48px;
}
.lld-theme-toolbar {
  position: relative;
  z-index: 4;
  display: flex;
  justify-content: flex-end;
  margin-top: -38px;
  margin-bottom: 24px;
}
.lld-book-mock:after {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 13px;
  z-index: 3;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.34),
    rgba(255, 255, 255, 0.12),
    transparent
  );
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}
.lld-book-grid {
  top: 35px;
  height: 160px;
}
.lld-book-title {
  font-size: 31px;
  line-height: 1.1;
}
.lld-book-content {
  bottom: 35px;
}
#problems .lld-design-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}
#problems .lld-design-card {
  position: relative;
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 26px;
  background: linear-gradient(145deg, var(--surface), var(--surface-2));
  box-shadow: var(--shadow);
  transition:
    transform 0.2s,
    border-color 0.2s;
}
#problems .lld-design-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
}
@media (max-width: 720px) {
  .lld-theme-toolbar {
    margin-top: -25px;
    margin-bottom: 22px;
  }
  .lldPage {
    padding-bottom: 88px;
  }
  .lld-book-title {
    font-size: 27px;
  }
  .lld-book-grid {
    height: 130px;
  }
  #problems .lld-design-grid {
    grid-template-columns: 1fr;
  }
  #problems .lld-design-card {
    padding: 21px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .lldPage * {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* =========================
   SECURE PDF PREVIEW
   ========================= */
.lld-preview-section {
  padding: 30px 0 78px;
}

.lld-preview-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 26px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.lld-preview-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(135deg, var(--surface), var(--surface-2));
}

.lld-preview-topbar-left {
  min-width: 0;
}

.lld-preview-topbar-title {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--text);
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.lld-preview-topbar-copy {
  margin: 5px 0 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.55;
}

.lld-preview-badge {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 31px;
  padding: 7px 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg);
  color: var(--accent);
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}

.lld-pdf-shell {
  position: relative;
  padding: 14px;
  background: color-mix(in srgb, var(--surface-2) 78%, var(--bg));
}

.lld-pdf-viewport {
  position: relative;
  width: 100%;
  height: min(78vh, 900px);
  min-height: 560px;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  scrollbar-gutter: stable;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: #dfe5ee;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
}

.lldPage[data-theme="dark"] .lld-pdf-viewport {
  background: #080e1b;
}

.lld-pdf-viewport:focus-visible {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 28%, transparent);
  border-color: var(--accent);
}

.lld-pdf-document {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
}

.lld-pdf-page-wrap {
  position: relative;
  width: fit-content;
  max-width: 100%;
  overflow: hidden;
  border-radius: 6px;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.12),
    0 10px 28px rgba(15, 23, 42, 0.16);
}

.lld-pdf-page-number {
  position: absolute;
  z-index: 2;
  right: 10px;
  top: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  color: #ffffff;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.04em;
  pointer-events: none;
}

.lld-pdf-page {
  line-height: 0;
  pointer-events: none;
}

.lld-pdf-page canvas {
  display: block !important;
  max-width: 100% !important;
  height: auto !important;
  pointer-events: none !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -webkit-user-drag: none !important;
}

.lld-pdf-loading,
.lld-pdf-error {
  display: grid;
  place-items: center;
  min-height: 320px;
  padding: 30px;
  text-align: center;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.7;
}

.lld-pdf-loading-inner {
  display: grid;
  justify-items: center;
  gap: 12px;
}

.lld-pdf-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid color-mix(in srgb, var(--accent) 20%, var(--border));
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: lldPdfSpin 0.8s linear infinite;
}

.lld-pdf-error {
  color: #b45309;
}

.lldPage[data-theme="dark"] .lld-pdf-error {
  color: #fbbf24;
}

.lld-preview-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 13px 16px 15px;
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 10px;
  line-height: 1.6;
}

.lld-preview-note svg {
  flex: 0 0 auto;
  margin-top: 2px;
  color: var(--accent);
}

@keyframes lldPdfSpin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 720px) {
  .lld-preview-section {
    padding: 18px 0 62px;
  }

  .lld-preview-card {
    border-radius: 20px;
  }

  .lld-preview-topbar {
    align-items: flex-start;
    padding: 15px;
  }

  .lld-preview-topbar-title {
    font-size: 13px;
  }

  .lld-preview-badge {
    min-height: 28px;
    padding: 6px 8px;
    font-size: 9px;
  }

  .lld-pdf-shell {
    padding: 8px;
  }

  .lld-pdf-viewport {
    height: 72vh;
    min-height: 480px;
    padding: 7px;
    border-radius: 14px;
  }

  .lld-pdf-document {
    gap: 10px;
  }

  .lld-pdf-page-wrap {
    border-radius: 4px;
  }

  .lld-pdf-page-number {
    right: 7px;
    top: 7px;
    height: 21px;
    min-width: 24px;
    font-size: 8px;
  }
}

@media (max-width: 420px) {
  .lld-preview-topbar {
    gap: 10px;
  }

  .lld-preview-topbar-copy {
    font-size: 10px;
  }

  .lld-pdf-viewport {
    height: 68vh;
    min-height: 430px;
    padding: 5px;
  }

  .lld-preview-note {
    padding: 11px 12px 13px;
  }
}

`;

export default function SystemDesignLLD({ navbarOffset = 88 }) {
  const reduceMotion = useReducedMotion();
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [hldProduct, setHldProduct] = useState(null);
  const [loadingHldProduct, setLoadingHldProduct] = useState(true);
  const [hldProductError, setHldProductError] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const referralCode = (params.get("referralCode") || params.get("ref") || "").trim();
      if (referralCode) window.localStorage.setItem("referralCode", referralCode);
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previousTheme = root.getAttribute("data-lld-theme");
    const previousBackground = body.style.backgroundColor;
    root.setAttribute("data-lld-theme", theme);
    body.style.backgroundColor = theme === "dark" ? "#0a1020" : "#f8fbff";
    return () => {
      if (previousTheme === null) root.removeAttribute("data-lld-theme");
      else root.setAttribute("data-lld-theme", previousTheme);
      body.style.backgroundColor = previousBackground;
    };
  }, [theme]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");
        const redirectUrl = window.location.pathname;
        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(redirectUrl)}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(
            result?.error?.message ||
              result?.message ||
              "Unable to load the current product details.",
          );
        }
        setProduct(result.data);
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("Failed to fetch LLD product:", error);
        setProduct(null);
        setProductError(error?.message || "Unable to load the current product details.");
      } finally {
        if (!controller.signal.aborted) setLoadingProduct(false);
      }
    };
    fetchProduct();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchHldProduct = async () => {
      try {
        setLoadingHldProduct(true);
        setHldProductError("");
        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(HLD_REDIRECT_URL)}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(
            result?.error?.message ||
              result?.message ||
              "Unable to load the HLD book details.",
          );
        }
        setHldProduct(result.data);
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("Failed to fetch HLD product:", error);
        setHldProduct(null);
        setHldProductError(error?.message || "Unable to load the HLD book details.");
      } finally {
        if (!controller.signal.aborted) setLoadingHldProduct(false);
      }
    };
    fetchHldProduct();
    return () => controller.abort();
  }, []);

  const currency = product?.currency || "INR";
  const currentPrice = Number(product?.price);
  const validPrice =
    product?.price != null &&
    product.price !== "" &&
    Number.isFinite(currentPrice) &&
    currentPrice >= 0;
  const mrp = Number(product?.mrp ?? 0);
  const discount =
    mrp > currentPrice && mrp > 0 ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;
  const formatMoney = (amount, currencyCode = currency) => {
    const locale =
      { INR: "en-IN", USD: "en-US", GBP: "en-GB", EUR: "en-IE", AUD: "en-AU", CAD: "en-CA" }[
        currencyCode
      ] || "en";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: Number.isInteger(Number(amount)) ? 0 : 2,
      }).format(Number(amount || 0));
    } catch {
      return `${currencyCode} ${Number(amount || 0)}`;
    }
  };
  const canBuy =
    !loadingProduct &&
    !productError &&
    validPrice &&
    Boolean(product?._id) &&
    product?.isActive !== false;
  const displayedPrice = loadingProduct
    ? "Loading"
    : productError || !validPrice
      ? "Unavailable"
      : formatMoney(currentPrice);
  const hldCurrency = hldProduct?.currency || "INR";
  const hldCurrentPrice = Number(hldProduct?.price);
  const hldValidPrice =
    hldProduct?.price != null &&
    hldProduct.price !== "" &&
    Number.isFinite(hldCurrentPrice) &&
    hldCurrentPrice >= 0;
  const hldMrp = Number(hldProduct?.mrp ?? 0);
  const hldDiscount =
    hldMrp > hldCurrentPrice && hldMrp > 0
      ? Math.round(((hldMrp - hldCurrentPrice) / hldMrp) * 100)
      : 0;
  const hldCanBuy =
    !loadingHldProduct &&
    !hldProductError &&
    hldValidPrice &&
    Boolean(hldProduct?._id) &&
    hldProduct?.isActive !== false;
  const hldCoverImage =
    hldProduct?.coverpageurl || hldProduct?.coverPageUrl || hldProduct?.cover_page_url || "";
  const openCheckout = () => {
    if (!canBuy) return;
    setCheckoutProduct(product);
    setCheckoutOpen(true);
  };
  const openHldCheckout = () => {
    if (!hldCanBuy) return;
    setCheckoutProduct(hldProduct);
    setCheckoutOpen(true);
  };
  const animation = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.16 },
        transition: { duration: 0.5, ease: "easeOut" },
      };

  const supportEmail = SUPPORT_EMAIL;
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "/book/system-design/lld";

  const canonicalUrl = `${SITE_URL}${pathname}`;

  const productName = product?.title || "Mastering System Design — Low-Level Design in Java";

  const seoImage = product?.coverpageurl || product?.coverPageUrl || product?.cover_page_url || "";

  const productSchema = {
    "@type": "Product",
    "@id": `${canonicalUrl}#product`,
    name: productName,
    description: SEO_DESCRIPTION,
    url: canonicalUrl,
    category: "Low-Level Design Java Ebook",
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    ...(product?._id ? { sku: String(product._id) } : {}),
    ...(seoImage ? { image: [seoImage] } : {}),
    ...(product && validPrice && !productError
      ? {
          offers: {
            "@type": "Offer",
            url: canonicalUrl,
            price: currentPrice,
            priceCurrency: currency,
            availability: "https://schema.org/OnlineOnly",
            itemCondition: "https://schema.org/NewCondition",
            seller: {
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
            },
            ...(mrp > currentPrice
              ? {
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price: mrp,
                    priceCurrency: currency,
                    priceType: "https://schema.org/StrikethroughPrice",
                  },
                }
              : {}),
          },
        }
      : {}),
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        email: supportEmail,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: SEO_TITLE,
        description: SEO_DESCRIPTION,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@id": `${canonicalUrl}#product`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Books",
            item: `${SITE_URL}/books`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "System Design LLD in Java",
            item: canonicalUrl,
          },
        ],
      },
      productSchema,
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: faqItems.map(({ q: question, a: answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
          },
        })),
      },
    ],
  };

  const seoHead = (
    <Helmet htmlAttributes={{ lang: "en" }}>
      <title>{SEO_TITLE}</title>
      <meta name="description" content={SEO_DESCRIPTION} />
      <meta name="author" content={SITE_NAME} />
      <meta name="application-name" content={SITE_NAME} />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta
        name="googlebot"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta name="theme-color" content={theme === "dark" ? "#0a1020" : "#f8fbff"} />
      <meta name="color-scheme" content={theme === "dark" ? "dark light" : "light dark"} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={SEO_TITLE} />
      <meta property="og:description" content={SEO_DESCRIPTION} />
      <meta property="og:url" content={canonicalUrl} />
      {seoImage && <meta property="og:image" content={seoImage} />}
      {seoImage && <meta property="og:image:alt" content={`${productName} ebook cover`} />}
      {product && !productError && (
        <meta property="product:price:amount" content={String(currentPrice)} />
      )}
      {product && !productError && <meta property="product:price:currency" content={currency} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={SEO_TITLE} />
      <meta name="twitter:description" content={SEO_DESCRIPTION} />
      {seoImage && <meta name="twitter:image" content={seoImage} />}
      {seoImage && <meta name="twitter:image:alt" content={`${productName} ebook cover`} />}
      <script type="application/ld+json">
        {JSON.stringify(structuredData).replace(/</g, "\\u003c")}
      </script>
    </Helmet>
  );

  return (
    <>
      <div
        className="lldPage lld-expanded"
      data-theme={theme}
      style={{
        "--lld-navbar-offset":
          typeof navbarOffset === "number" ? `${navbarOffset}px` : navbarOffset,
      }}
    >
      {seoHead}
      <style>{styles}</style>

      <main id="top">
        <section className="lld-hero">
          <div className="lld-shell lld-theme-toolbar">
            <button
              className="lld-theme-btn"
              type="button"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            >
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
          </div>
          <div className="lld-shell lld-hero-grid">
            <motion.div {...animation}>
              <div className="lld-eyebrow">
                <Sparkles size={13} /> Java-first interview handbook
              </div>
              <h1>
                Design with clarity.
                <br />
                <span className="lld-gradient-text">Code with confidence.</span>
              </h1>
              <p className="lld-hero-copy">
                Build the skills to turn an interview prompt into clear requirements, a thoughtful
                class model and clean Java code. Learn the concepts, then practice them across 16
                familiar systems.
              </p>
              <div className="lld-hero-actions">
                <button className="lld-cta" type="button" onClick={openCheckout} disabled={!canBuy}>
                  Get the ebook {displayedPrice !== "Unavailable" && <span>{displayedPrice}</span>}{" "}
                  <ArrowRight size={16} />
                </button>
                <a className="lld-cta lld-cta-outline" href="#inside">
                  <BookOpen size={16} /> Explore the book
                </a>
              </div>
              {productError && (
                <p className="lld-error">
                  Price is temporarily unavailable. Please try again or contact {SUPPORT_EMAIL}.
                </p>
              )}
              <div className="lld-hero-bullets">
                <span>
                  <Check size={14} /> Java 17 examples
                </span>
                <span>
                  <Check size={14} /> 23 GoF patterns
                </span>
                <span>
                  <Check size={14} /> 16 design problems
                </span>
              </div>
            </motion.div>

            <motion.div
              className="lld-book-stage"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, delay: 0.08 }}
            >
              <div className="lld-orbit" />
              <div className="lld-float-chip lld-chip-one">
                <Code2 size={15} color="#9ce4ca" /> Java examples
              </div>
              <div className="lld-float-chip lld-chip-two">
                <Network size={15} color="#b9a7ff" /> UML made practical
              </div>
              <div className="lld-float-chip lld-chip-three">
                <Zap size={15} color="#ffd782" /> 60-minute framework
              </div>
              <div
                className="lld-book-mock"
                role="img"
                aria-label="Mastering System Design LLD Java ebook cover"
              >
                {product?.coverpageurl ? (
                  <img
                    src={product.coverpageurl}
                    alt="Mastering System Design LLD book cover"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      zIndex: 2,
                    }}
                  />
                ) : (
                  <>
                    <div className="lld-book-grid" aria-hidden="true">
                      <svg viewBox="0 0 260 120" fill="none">
                        <rect
                          x="5"
                          y="18"
                          width="66"
                          height="27"
                          rx="7"
                          stroke="#91B0FF"
                          strokeOpacity=".8"
                        />
                        <rect
                          x="98"
                          y="4"
                          width="68"
                          height="27"
                          rx="7"
                          stroke="#B3A1FF"
                          strokeOpacity=".8"
                        />
                        <rect
                          x="188"
                          y="22"
                          width="66"
                          height="27"
                          rx="7"
                          stroke="#91B0FF"
                          strokeOpacity=".8"
                        />
                        <rect
                          x="50"
                          y="77"
                          width="72"
                          height="27"
                          rx="7"
                          stroke="#85DBD1"
                          strokeOpacity=".8"
                        />
                        <rect
                          x="153"
                          y="78"
                          width="72"
                          height="27"
                          rx="7"
                          stroke="#F0BB87"
                          strokeOpacity=".8"
                        />
                        <path
                          d="M71 31h27m68-13h22M42 45l24 32m56-46 1 47m67-28-29 41m-87 0h31"
                          stroke="#91B0FF"
                          strokeOpacity=".75"
                        />
                        <circle cx="85" cy="31" r="3" fill="#F0BB87" />
                        <circle cx="143" cy="64" r="3" fill="#B3A1FF" />
                      </svg>
                    </div>
                    <div className="lld-book-content">
                      <div className="lld-book-kicker">The Java Interview Guide</div>
                      <div className="lld-book-title">
                        MASTER
                        <br />
                        SYSTEM DESIGN
                        <br />
                        <span style={{ color: "#b8c5ff" }}>- LLD</span>
                      </div>
                      <div className="lld-book-subtitle">
                        OOP · UML · SOLID · Design Patterns · Concurrency · 16 Design Problems
                      </div>
                      <span className="lld-book-tag">JAVA 17 · INTERVIEW EDITION</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
          <div className="lld-hero-bottom" />
        </section>

        <section className="lld-shell" aria-label="Book highlights">
          <div className="lld-stats">
            {[
              ["23", "GoF design patterns"],
              ["16", "Interview design problems"],
              ["60", "Minute design framework"],
              ["Java 17", "Code examples"],
            ].map(([value, label], index) => (
              <motion.div
                className="lld-stat"
                key={label}
                {...animation}
                transition={{ ...animation.transition, delay: index * 0.05 }}
              >
                <strong>{value}</strong>
                <span>{label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="lld-hld-section" aria-labelledby="hld-companion-title">
          <div className="lld-shell">
            <motion.div className="lld-hld-head" {...animation}>
              <div className="lld-kicker">Complete your system design preparation</div>
              <h2 id="hld-companion-title">Pair LLD with High-Level Design</h2>
              <p>
                LLD helps you design classes and object interactions. HLD helps you reason about
                scalability, databases, caching, messaging, reliability and distributed
                architecture.
              </p>
            </motion.div>
            <motion.div className="lld-hld-card" {...animation}>
              <div className="lld-hld-cover">
                {hldCoverImage ? (
                  <img
                    src={hldCoverImage}
                    alt="Mastering System Design High-Level Design ebook cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="lld-hld-cover-fallback">
                    <small>Mastering System Design</small>
                    <strong>High-Level Design</strong>
                  </div>
                )}
              </div>
              <div className="lld-hld-details">
                <div className="lld-hld-badges">
                  <span className="lld-hld-badge">HLD</span>
                  <span className="lld-hld-badge">24+ Core Topics</span>
                  <span className="lld-hld-badge">15+ Design Examples</span>
                </div>
                <h3>Mastering System Design — High-Level Design</h3>
                <p>
                  Learn how production systems scale from a single service to distributed
                  architectures. Cover databases, Redis and caching, load balancing, Kafka,
                  queues, replication, sharding, fault tolerance, observability and complete
                  system-design interview flows.
                </p>
                <div className="lld-hld-topics">
                  {[
                    "Scalability",
                    "Databases",
                    "Redis",
                    "Kafka",
                    "Load Balancing",
                    "Distributed Systems",
                    "Fault Tolerance",
                    "Interview Design",
                  ].map((item) => (
                    <span className="lld-hld-topic" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
                <div className="lld-hld-price-box">
                  {loadingHldProduct ? (
                    <div className="lld-hld-price-label">Loading latest HLD price...</div>
                  ) : hldProduct && hldValidPrice ? (
                    <>
                      <div className="lld-hld-price-label">Current HLD ebook price</div>
                      <div className="lld-hld-price-row">
                        <span className="lld-hld-current">
                          {formatMoney(hldCurrentPrice, hldCurrency)}
                        </span>
                        {hldMrp > hldCurrentPrice && (
                          <span className="lld-hld-old">
                            {formatMoney(hldMrp, hldCurrency)}
                          </span>
                        )}
                        {hldDiscount > 0 && (
                          <span className="lld-hld-save">Save {hldDiscount}%</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="lld-hld-price-label">HLD price temporarily unavailable</div>
                  )}
                </div>
                <div className="lld-hld-actions">
                  <a className="lld-cta lld-cta-outline" href={HLD_REDIRECT_URL}>
                    View HLD Book <ArrowRight size={15} />
                  </a>
                  <button
                    className="lld-cta"
                    type="button"
                    onClick={openHldCheckout}
                    disabled={!hldCanBuy}
                  >
                    {loadingHldProduct ? "Loading..." : "Buy HLD Now"} <BookOpen size={15} />
                  </button>
                </div>
                {hldProductError && (
                  <p className="lld-hld-error">
                    {hldProductError} You can still open the HLD book page.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="lld-section" id="inside">
          <div className="lld-shell">
            <motion.div className="lld-section-head" {...animation}>
              <div className="lld-kicker">A clear path from concept to code</div>
              <h2>Everything you need to reason through LLD</h2>
              <p>
                Understand why a design works, how to express it in UML, and how to turn it into
                Java that an interviewer can follow.
              </p>
            </motion.div>
            <div className="lld-module-grid">
              {modules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <motion.article
                    className="lld-card lld-module"
                    key={module.number}
                    {...animation}
                    transition={{ ...animation.transition, delay: (index % 4) * 0.06 }}
                  >
                    <span className="lld-module-number">{module.number}</span>
                    <span className="lld-module-icon">
                      <Icon size={19} />
                    </span>
                    <h3>{module.title}</h3>
                    <p>{module.detail}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="lld-section-tight" aria-labelledby="flow-title">
          <div className="lld-shell">
            <motion.div className="lld-section-head" {...animation}>
              <div className="lld-kicker">A repeatable interview approach</div>
              <h2 id="flow-title">From prompt to a design you can explain</h2>
              <p>
                Follow a practical sequence instead of jumping straight into classes or patterns.
              </p>
            </motion.div>
            <div className="lld-flow">
              {flowSteps.map((step, index) => (
                <motion.div
                  className="lld-card lld-flow-step"
                  key={step.n}
                  {...animation}
                  transition={{ ...animation.transition, delay: index * 0.055 }}
                >
                  <div className="lld-flow-icon">
                    {index === 0 ? (
                      <BookOpen size={15} />
                    ) : index === 1 ? (
                      <Layers3 size={15} />
                    ) : index === 2 ? (
                      <Network size={15} />
                    ) : index === 3 ? (
                      <Sparkles size={15} />
                    ) : index === 4 ? (
                      <Code2 size={15} />
                    ) : (
                      <ShieldCheck size={15} />
                    )}
                  </div>
                  <span className="lld-flow-num">STEP {step.n}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  {index < flowSteps.length - 1 && (
                    <span className="lld-flow-step-arrow" aria-hidden="true" />
                  )}
                </motion.div>
              ))}
            </div>

            <motion.div className="lld-diagram-panel" {...animation}>
              <div className="lld-diagram-title">
                <h3>Example: model a show-specific seat booking</h3>
                <span>Class relationship + state flow</span>
              </div>
              <div
                className="lld-class-diagram"
                aria-label="Show contains show seats; booking holds selected show seats"
              >
                <div className="lld-uml-box">
                  <strong>Show</strong>
                  <span>id</span>
                  <span>movie · screen · time</span>
                </div>
                <div className="lld-diagram-arrow">
                  <ArrowRight size={18} />
                  <small style={{ display: "block", fontSize: 9 }}>1 to many</small>
                </div>
                <div className="lld-uml-box">
                  <strong>ShowSeat</strong>
                  <span>seatId · category</span>
                  <span>status: AVAILABLE / LOCKED / BOOKED</span>
                </div>
                <div className="lld-diagram-arrow">
                  <ArrowRight size={18} />
                  <small style={{ display: "block", fontSize: 9 }}>held by</small>
                </div>
                <div className="lld-uml-box">
                  <strong>Booking</strong>
                  <span>userId · seats</span>
                  <span>status · holdExpiry</span>
                </div>
              </div>
              <div
                className="lld-state-track"
                aria-label="Seat state transitions from available to locked to booked"
              >
                {["AVAILABLE", "LOCKED", "BOOKED"].map((state, index) => (
                  <React.Fragment key={state}>
                    <motion.div
                      className={`lld-state ${index === 0 ? "is-active" : ""}`}
                      animate={reduceMotion ? {} : { y: [0, -3, 0] }}
                      transition={{
                        duration: 2.4,
                        delay: index * 0.35,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <span className="lld-state-dot" /> {state}
                    </motion.div>
                    {index < 2 && (
                      <ArrowRight size={14} className="lld-state-arrow" aria-hidden="true" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </div>
        </section>


        <PdfPreviewSection file={lldPreviewPdf} animation={animation} />

        <FullCurriculum
          handleBuyNow={openCheckout}
          canBuy={canBuy}
          displayedPrice={displayedPrice}
          currentPrice={currentPrice}
          mrp={mrp}
          discount={discount}
          formatMoney={formatMoney}
          supportEmail={SUPPORT_EMAIL}
          productStatusMessage={
            productError || (loadingProduct ? "Loading the current price..." : "")
          }
        />

        <section className="lld-section-tight" id="faq">
          <div className="lld-shell">
            <motion.div className="lld-section-head" {...animation}>
              <div className="lld-kicker">Quick answers</div>
              <h2>Before you start</h2>
              <p>What to expect from the book and its interview practice scope.</p>
            </motion.div>
            <div className="lld-faq">
              {faqItems.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div className="lld-faq-item" key={item.q}>
                    <button
                      className="lld-faq-button"
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={`lld-faq-${index}`}
                    >
                      <span>{item.q}</span>
                      <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                        <ChevronDown size={17} />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`lld-faq-${index}`}
                          className="lld-faq-answer"
                          initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: reduceMotion ? 0 : 0.22 }}
                        >
                          {item.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="lld-section-tight">
          <div className="lld-shell">
            <motion.div className="lld-final-cta" {...animation}>
              <div className="lld-final-copy">
                <div className="lld-eyebrow">
                  <Sparkles size={13} /> Build a stronger LLD approach
                </div>
                <h2>Turn interview prompts into designs you can defend.</h2>
                <p>
                  Get the Java LLD handbook and practice the full journey from requirements to
                  classes, patterns, code and edge cases.
                </p>
                <div className="lld-final-checks">
                  <span>
                    <Check size={14} /> 23 patterns
                  </span>
                  <span>
                    <Check size={14} /> 16 design problems
                  </span>
                  <span>
                    <Check size={14} /> Java 17
                  </span>
                </div>
              </div>
              <div className="lld-price-card">
                <div className="lld-price-label">Digital ebook · instant access after checkout</div>
                <div className="lld-price-line">
                  {loadingProduct ? (
                    <div className="lld-skeleton" />
                  ) : (
                    <span className="lld-price-now">
                      {productError || !validPrice
                        ? "Price unavailable"
                        : formatMoney(currentPrice)}
                    </span>
                  )}
                  {!loadingProduct && !productError && mrp > currentPrice && (
                    <span className="lld-price-old">{formatMoney(mrp)}</span>
                  )}
                </div>
                {!loadingProduct && !productError && discount > 0 && (
                  <div className="lld-discount">Save {discount}% on the current price</div>
                )}
                <button className="lld-cta" type="button" onClick={openCheckout} disabled={!canBuy}>
                  {loadingProduct ? "Loading price..." : "Get the ebook"} <ArrowRight size={16} />
                </button>
                {productError && <p className="lld-error">{productError}</p>}
                <p className="lld-price-small">
                  Digital products are non-refundable after purchase.
                  <br />
                  Questions?{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} style={{ textDecoration: "underline" }}>
                    {SUPPORT_EMAIL}
                  </a>
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <div className="lld-mobile-buy">
        <div className="lld-mobile-price">
          {loadingProduct
            ? "Loading price"
            : productError || !validPrice
              ? "Price unavailable"
              : formatMoney(currentPrice)}
          <small>Master System Design - LLD</small>
        </div>
        <button className="lld-cta" type="button" onClick={openCheckout} disabled={!canBuy}>
          Get the ebook <ChevronRight size={15} />
        </button>
      </div>

      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <PayUCheckoutModal
            isOpen={checkoutOpen}
            onClose={() => {
              setCheckoutOpen(false);
              setCheckoutProduct(null);
            }}
            product={checkoutProduct || product}
          />,
          document.body
        )}
    </>
  );
}


function PdfPreviewSection({ file, animation }) {
  const viewportRef = useRef(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageWidth, setPageWidth] = useState(760);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const updateWidth = () => {
      const horizontalPadding = window.innerWidth <= 720 ? 14 : 34;
      const available = Math.max(220, viewport.clientWidth - horizontalPadding);
      setPageWidth(Math.min(900, available));
    };

    updateWidth();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateWidth) : null;

    resizeObserver?.observe(viewport);
    window.addEventListener("resize", updateWidth, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const previewPages = Math.min(pageCount, 5);

  const blockBrowserSaveOrPrint = (event) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = String(event.key || "").toLowerCase();
    if (key === "s" || key === "p") event.preventDefault();
  };

  return (
    <section className="lld-preview-section" id="preview" aria-labelledby="lld-preview-title">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">Read before you buy</div>
          <h2 id="lld-preview-title">Preview the book directly on this page</h2>
          <p>
            Scroll through a short sample of the Java LLD handbook. The preview uses a custom
            canvas viewer, so the browser PDF toolbar and its download or print buttons are not
            shown.
          </p>
        </motion.div>

        <motion.div className="lld-preview-card" {...animation}>
          <div className="lld-preview-topbar">
            <div className="lld-preview-topbar-left">
              <div className="lld-preview-topbar-title">
                <BookOpen size={17} /> Mastering System Design — LLD Java
              </div>
              <p className="lld-preview-topbar-copy">
                Scroll vertically inside the preview. Optimized for desktop, tablet and mobile.
              </p>
            </div>
            <div className="lld-preview-badge">
              <ShieldCheck size={13} /> {previewPages || "4–5"} page preview
            </div>
          </div>

          <div className="lld-pdf-shell">
            <div
              ref={viewportRef}
              className="lld-pdf-viewport"
              role="region"
              aria-label="Scrollable PDF book preview"
              tabIndex={0}
              onContextMenu={(event) => event.preventDefault()}
              onDragStart={(event) => event.preventDefault()}
              onKeyDown={blockBrowserSaveOrPrint}
            >
              <Document
                file={file}
                onLoadSuccess={({ numPages }) => {
                  setPageCount(numPages);
                  setPreviewError("");
                }}
                onLoadError={(error) => {
                  console.error("Failed to load LLD preview PDF:", error);
                  setPreviewError("The preview could not be loaded. Please refresh and try again.");
                }}
                loading={
                  <div className="lld-pdf-loading">
                    <div className="lld-pdf-loading-inner">
                      <span className="lld-pdf-spinner" aria-hidden="true" />
                      <span>Loading book preview…</span>
                    </div>
                  </div>
                }
                error={
                  <div className="lld-pdf-error">
                    {previewError || "The preview could not be loaded. Please refresh and try again."}
                  </div>
                }
                noData={<div className="lld-pdf-error">Preview file is unavailable.</div>}
              >
                <div className="lld-pdf-document">
                  {Array.from({ length: previewPages }, (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <div className="lld-pdf-page-wrap" key={pageNumber}>
                        <span className="lld-pdf-page-number">{pageNumber}</span>
                        <Page
                          className="lld-pdf-page"
                          pageNumber={pageNumber}
                          width={pageWidth}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          renderForms={false}
                          loading={
                            <div className="lld-pdf-loading" style={{ minHeight: 260 }}>
                              Loading page {pageNumber}…
                            </div>
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </Document>
            </div>
          </div>

          <div className="lld-preview-note">
            <ShieldCheck size={14} />
            <span>
              This preview contains only a few selected pages from the book. Some topics may start or end midway and may not be fully covered in the preview. The complete explanations, code examples, diagrams, and remaining content are available in the full ebook.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function RevealSection({ children, ...props }) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      {...props}
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.06 }}
      transition={{ duration: reduced ? 0 : 0.45 }}
    >
      {children}
    </motion.section>
  );
}

const QUESTION_SUMMARIES = [
  "Model cities, theatres, screens and show-specific seats. Explore temporary seat holds, booking states, category pricing and safe cancellation.",
  "Track product batches across warehouses, reserve stock during checkout, apply issuance policies and trigger low-stock notifications.",
  "Allocate compatible spaces across parking floors, issue tickets and calculate fees with interchangeable pricing policies.",
  "Coordinate email, SMS, push and in-app delivery with templates, preferences, priorities and bounded retry policies.",
  "Compare fixed window, sliding window log, sliding window counter, token bucket and leaky bucket algorithms with concurrent requests.",
  "Design named loggers, severity filters, pluggable appenders, formatters and synchronized writes.",
  "Model trains, routes, coaches and berths with booking states, cancellation rules and waitlist promotion.",
  "Separate future reservations from active rentals, validate date ranges and compose rental pricing with optional add-ons.",
  "Work with equal, exact and percentage splits, consistent rounding, balance sheets and debt settlement.",
  "Model matches, innings and ball events, update scoreboards and notify subscribers as play progresses.",
  "Compose eligibility rules and discount strategies with redemption limits, usage tracking and validation.",
  "Keep driver matching and fare calculation independent while managing ride states and driver availability.",
  "Model provider integrations, payment states, idempotent operations, retries and refunds through a common contract.",
  "Coordinate meeting participants, host permissions, chat and screen sharing through explicit collaboration rules.",
  "Manage carts, order states, inventory reservations, shipments, partial returns and refund calculations.",
  "Coordinate restaurant menus, preparation states, courier assignment, delivery fees and order tracking.",
];

function FullCurriculum({
  handleBuyNow,
  canBuy,
  displayedPrice,
  currentPrice,
  mrp,
  discount,
  formatMoney,
  supportEmail,
  productStatusMessage,
}) {
  const productStatusClassName = "mt-3 text-sm text-slate-500";
  const patterns = {
    Creational: [
      {
        name: "Singleton",
        purpose:
          "Ensures that a class has only one instance and provides a controlled access point.",
        example: "Logger, Configuration Manager, Cache Manager",
        when: "When exactly one shared instance is required.",
      },
      {
        name: "Factory Method",
        purpose: "Creates objects without exposing the exact object creation logic to the client.",
        example: "Notification Factory, Payment Factory",
        when: "When object creation depends on runtime input.",
      },
      {
        name: "Abstract Factory",
        purpose: "Creates families of related objects without specifying their concrete classes.",
        example: "UI components, payment provider families",
        when: "When multiple related products must work together.",
      },
      {
        name: "Builder",
        purpose: "Constructs complex objects step by step.",
        example: "User, Car, HTTP Request, Pizza",
        when: "When an object has many optional parameters.",
      },
      {
        name: "Prototype",
        purpose: "Creates new objects by copying an existing object.",
        example: "Document templates, game objects",
        when: "When object creation is expensive or cloning is convenient.",
      },
    ],

    Structural: [
      {
        name: "Adapter",
        purpose: "Allows incompatible interfaces to work together.",
        example: "Third-party payment SDK adapter",
        when: "When an existing API does not match your application's interface.",
      },
      {
        name: "Bridge",
        purpose: "Separates abstraction from implementation so both can evolve independently.",
        example: "Notification type + delivery channel",
        when: "When two dimensions of a system change independently.",
      },
      {
        name: "Composite",
        purpose: "Treats individual objects and compositions of objects uniformly.",
        example: "File and Folder hierarchy",
        when: "When you have tree-like structures.",
      },
      {
        name: "Decorator",
        purpose: "Adds behavior dynamically without modifying the original class.",
        example: "Coffee toppings, logging, authorization",
        when: "When functionality needs to be layered dynamically.",
      },
      {
        name: "Facade",
        purpose: "Provides a simple interface over a complex subsystem.",
        example: "Order processing service",
        when: "When clients should not know subsystem complexity.",
      },
      {
        name: "Flyweight",
        purpose: "Shares common immutable state to reduce memory usage.",
        example: "Game objects, character rendering",
        when: "When thousands of similar objects exist.",
      },
      {
        name: "Proxy",
        purpose: "Provides a substitute or controlled access to another object.",
        example: "Caching proxy, authorization proxy",
        when: "When access needs to be controlled or enhanced.",
      },
    ],

    Behavioral: [
      {
        name: "Chain of Responsibility",
        purpose: "Passes a request through a chain of handlers.",
        example: "Authentication → Authorization → Validation",
        when: "When multiple handlers may process a request.",
      },
      {
        name: "Command",
        purpose: "Encapsulates a request as an object.",
        example: "Undo/redo, remote commands",
        when: "When operations need to be queued, logged or undone.",
      },
      {
        name: "Interpreter",
        purpose: "Defines a representation and interpreter for a language or grammar.",
        example: "Rule engines, expression evaluators",
        when: "When a simple domain-specific language is required.",
      },
      {
        name: "Iterator",
        purpose: "Provides sequential access to elements without exposing collection internals.",
        example: "Custom collection traversal",
        when: "When collections need standardized traversal.",
      },
      {
        name: "Mediator",
        purpose: "Centralizes communication between multiple objects.",
        example: "Chat room, air traffic control",
        when: "When many objects communicate directly and become tightly coupled.",
      },
      {
        name: "Memento",
        purpose: "Captures and restores an object's previous state.",
        example: "Undo functionality",
        when: "When object state needs checkpointing.",
      },
      {
        name: "Observer",
        purpose: "Notifies dependent objects when state changes.",
        example: "Notification system, stock updates",
        when: "When multiple subscribers depend on an event.",
      },
      {
        name: "State",
        purpose: "Changes object behavior when its internal state changes.",
        example: "Vending machine, order lifecycle",
        when: "When behavior varies significantly by state.",
      },
      {
        name: "Strategy",
        purpose: "Encapsulates interchangeable algorithms behind a common interface.",
        example: "Payment methods, coupon strategies",
        when: "When an algorithm can vary independently.",
      },
      {
        name: "Template Method",
        purpose:
          "Defines the skeleton of an algorithm while allowing subclasses to customize steps.",
        example: "Payment processing workflow",
        when: "When workflows share common steps.",
      },
      {
        name: "Visitor",
        purpose: "Adds operations to object structures without modifying their classes.",
        example: "Document processing, AST operations",
        when: "When many operations must be performed over a stable object structure.",
      },
    ],
  };

  const designQuestions = [
    {
      company: "BookMyShow",
      title: "Movie Ticket Booking",
      focus: "Concurrency + Seat Locking",
      patterns: ["State", "Strategy", "Observer"],
      classes: "Movie, Theatre, Screen, Show, Seat, Booking, Payment, User",
    },
    {
      company: "Zepto",
      title: "Inventory Management",
      focus: "Inventory + concurrency",
      patterns: ["Strategy", "Observer", "Factory Method"],
      classes: "Product, Inventory, Warehouse, StockItem, Order, Reservation",
    },
    {
      company: "Parking System",
      title: "Parking Lot",
      focus: "Object modeling + pricing",
      patterns: ["Strategy", "Factory Method", "State"],
      classes: "ParkingLot, Floor, Spot, Vehicle, Ticket, PricingStrategy",
    },
    {
      company: "Notification Platform",
      title: "Notification System",
      focus: "Multiple channels",
      patterns: ["Factory", "Strategy", "Observer"],
      classes: "Notification, Channel, Template, UserPreference, NotificationDispatcher",
    },
    {
      company: "API Platform",
      title: "Rate Limiter",
      focus: "Algorithms + thread safety",
      patterns: ["Strategy", "Factory Method"],
      classes: "RateLimiter, Algorithm, TokenBucket, SlidingWindow, Client",
    },
    {
      company: "Logging Platform",
      title: "Logger",
      focus: "Thread safety + extensibility",
      patterns: ["Singleton", "Chain of Responsibility", "Strategy"],
      classes: "Logger, LogLevel, LogHandler, ConsoleAppender, FileAppender",
    },
    {
      company: "IRCTC",
      title: "Train Reservation System",
      focus: "Booking + state transitions",
      patterns: ["State", "Strategy", "Observer"],
      classes: "Train, Station, Route, Coach, Seat, Passenger, Booking",
    },
    {
      company: "Zoomcar",
      title: "Car Rental System",
      focus: "Vehicle availability + pricing",
      patterns: ["Strategy", "State", "Factory"],
      classes: "Vehicle, Car, Customer, Rental, Location, PricingStrategy",
    },
    {
      company: "Splitwise",
      title: "Expense Sharing",
      focus: "Strategy + domain modeling",
      patterns: ["Strategy", "Factory Method"],
      classes: "User, Expense, Split, Group, Balance, SplitStrategy",
    },
    {
      company: "Cricbuzz",
      title: "Live Cricket Score",
      focus: "Real-time updates",
      patterns: ["Observer", "State", "Strategy"],
      classes: "Match, Innings, Ball, Score, Subscriber, ScoreBoard",
    },
    {
      company: "Coupon Engine",
      title: "Coupon Application",
      focus: "Business rules",
      patterns: ["Strategy", "Chain of Responsibility", "Factory"],
      classes: "Coupon, Cart, DiscountStrategy, EligibilityRule, CouponEngine",
    },
    {
      company: "Uber",
      title: "Ride Booking",
      focus: "Matching + pricing",
      patterns: ["Strategy", "Observer", "State"],
      classes: "Rider, Driver, Ride, Location, PricingStrategy, MatchingStrategy",
    },
    {
      company: "Payment Platform",
      title: "Payment Gateway",
      focus: "Multiple providers",
      patterns: ["Adapter", "Factory", "Strategy"],
      classes: "Payment, PaymentGateway, PaymentProvider, Transaction, PaymentFactory",
    },
    {
      company: "Video Conferencing",
      title: "Zoom-like Meeting System",
      focus: "Meeting lifecycle",
      patterns: ["State", "Observer", "Mediator"],
      classes: "Meeting, Participant, Host, Room, Chat, MeetingState",
    },
    {
      company: "E-commerce",
      title: "Order Management",
      focus: "Order lifecycle",
      patterns: ["State", "Observer", "Command"],
      classes: "Order, OrderItem, Payment, Shipment, OrderState, Notification",
    },
    {
      company: "Food Delivery",
      title: "Food Delivery System",
      focus: "Dispatch + pricing",
      patterns: ["Strategy", "Observer", "State"],
      classes: "Restaurant, Menu, Order, DeliveryPartner, DispatchStrategy",
    },
  ];

  const codeExamples = {
    Factory: `interface Payment {
    void pay(double amount);
}

class CardPayment implements Payment {
    public void pay(double amount) {
        System.out.println("Card: " + amount);
    }
}

class PaymentFactory {
    static Payment create(String type) {
        if (type.equals("CARD"))
            return new CardPayment();

        throw new IllegalArgumentException("Unknown type");
    }
}

Payment payment = PaymentFactory.create("CARD");
payment.pay(999);`,
    Strategy: `interface PricingStrategy {
    double calculate(double amount);
}

class NormalPricing implements PricingStrategy {
    public double calculate(double amount) {
        return amount;
    }
}

class DiscountPricing implements PricingStrategy {
    public double calculate(double amount) {
        return amount * 0.9;
    }
}

class Order {
    private PricingStrategy strategy;

    Order(PricingStrategy strategy) {
        this.strategy = strategy;
    }

    double getPrice(double amount) {
        return strategy.calculate(amount);
    }
}`,
    Observer: `interface Observer {
    void update(String message);
}

class User implements Observer {
    public void update(String message) {
        System.out.println(message);
    }
}

class NotificationDispatcher {
    private List<Observer> users = new ArrayList<>();

    void subscribe(Observer user) {
        users.add(user);
    }

    void notifyUsers(String message) {
        for (Observer user : users)
            user.update(message);
    }
}`,
    Builder: `class User {
    private String name;
    private String email;
    private int age;

    static class Builder {
        private String name;
        private String email;
        private int age;

        Builder name(String value) {
            name = value;
            return this;
        }

        Builder email(String value) {
            email = value;
            return this;
        }

        Builder age(int value) {
            age = value;
            return this;
        }

        User build() {
            User user = new User();
            user.name = name;
            user.email = email;
            user.age = age;
            return user;
        }
    }
}`,
    Locking: `class Inventory {
    private final Object lock = new Object();
    private int stock = 10;

    boolean reserve(int quantity) {
        synchronized (lock) {
            if (quantity <= 0 || stock < quantity)
                return false;

            stock -= quantity;
            return true;
        }
    }
}`,
  };

  const codeTabs = [
    ["Factory", "Factory Pattern"],
    ["Strategy", "Strategy Pattern"],
    ["Observer", "Observer Pattern"],
    ["Builder", "Builder Pattern"],
    ["Locking", "Thread-Safe Locking"],
  ];

  const principles = [
    {
      title: "Single Responsibility",
      short: "One class should have one reason to change.",
    },
    {
      title: "Open / Closed",
      short: "Open for extension, closed for modification.",
    },
    {
      title: "Liskov Substitution",
      short: "Subtypes should remain substitutable for their base types.",
    },
    {
      title: "Interface Segregation",
      short: "Prefer focused interfaces over large interfaces.",
    },
    {
      title: "Dependency Inversion",
      short: "High-level logic should depend on abstractions.",
    },
    {
      title: "KISS",
      short: "Keep the design simple unless complexity provides real value.",
    },
    {
      title: "DRY",
      short: "Avoid duplicating business logic and knowledge.",
    },
    {
      title: "YAGNI",
      short: "Do not build functionality before there is a real requirement.",
    },
    {
      title: "Composition over Inheritance",
      short: "Prefer composing behavior when inheritance creates unnecessary coupling.",
    },
    {
      title: "Program to Interfaces",
      short: "Depend on contracts rather than concrete implementations.",
    },
    {
      title: "High Cohesion",
      short: "Keep closely related responsibilities together.",
    },
    {
      title: "Low Coupling",
      short: "Minimize unnecessary dependencies between components.",
    },
  ];
  return (
    <div className="lld-expanded">
      <div className="lld-shell lld-source-note">
        <strong>Java practice scope:</strong> Work through domain classes, enums, policy interfaces
        and an in-memory system manager. Each of the 16 designs includes functional requirements,
        quality goals and a class checklist for a 60-minute exercise.
      </div>
      <RevealSection className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Why Low-Level Design?
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Don't just write classes.
              <span className="block text-blue-600">Learn how to design them.</span>
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              LLD is about converting requirements into clean, extensible and maintainable
              object-oriented designs. The goal is not to memorize patterns. The goal is to
              understand <strong>why</strong> a particular design makes sense for a particular
              problem.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Convert requirements into classes and responsibilities",
                "Identify relationships between objects",
                "Choose composition or inheritance correctly",
                "Recognize when a design pattern actually helps",
                "Handle changing business requirements",
                "Design for concurrency and thread safety",
                "Write clean, testable and extensible code",
                "Explain your design clearly during interviews",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    ✓
                  </div>

                  <p className="text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8">
            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              The LLD Mindset
            </div>

            <h3 className="mt-3 text-2xl font-black text-slate-950">
              Requirement → Design → Pattern → Code
            </h3>

            <div className="mt-7 space-y-4">
              {[
                ["01", "Understand", "What exactly does the system need to do?"],
                ["02", "Identify", "What are the entities, responsibilities and relationships?"],
                ["03", "Model", "How should classes collaborate?"],
                ["04", "Choose", "Which principle or pattern solves the design problem?"],
                ["05", "Code", "Convert the design into clean implementation."],
              ].map(([number, title, text]) => (
                <div
                  key={number}
                  className="flex gap-4 rounded-2xl border border-blue-100 bg-white p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
                    {number}
                  </div>

                  <div>
                    <div className="font-bold text-slate-950">{title}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Who Should Buy This?
            </div>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Built for developers who want to design, not just code
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Whether you're starting LLD or preparing for an interview, the book follows a
              progressive path from fundamentals to complete real-world systems.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "Complete Beginners",
                "Learn OOP, SOLID, relationships and design patterns from the ground up.",
              ],
              [
                "SDE-1 Developers",
                "Build the foundation required for machine-coding and LLD interviews.",
              ],
              [
                "SDE-2 Developers",
                "Improve design thinking, extensibility and trade-off discussions.",
              ],
              [
                "Backend Engineers",
                "Turn business requirements into clean object-oriented services.",
              ],
              [
                "Java Developers",
                "Learn how object-oriented design, patterns, concurrency and locking translate into clean Java implementations.",
              ],
              [
                "Interview Candidates",
                "Practice realistic LLD questions with a structured design process.",
              ],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-6 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="font-black text-slate-950">{title}</h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>
      <RevealSection className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Learning Path
          </div>

          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Beginner → Interview Ready
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-5">
          {[
            ["01", "OOP", "Classes, objects, inheritance, abstraction and polymorphism."],
            ["02", "Principles", "SOLID, KISS, DRY, YAGNI, coupling and cohesion."],
            ["03", "Patterns", "All three pattern families and 23 GoF patterns."],
            ["04", "Concurrency", "Threads, locks, race conditions and thread-safe design."],
            ["05", "Real Systems", "16 practical LLD interview problems."],
          ].map(([number, title, text]) => (
            <div key={number} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-black text-blue-600">{number}</div>

              <h3 className="mt-3 font-black text-slate-950">{title}</h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </RevealSection>
      <RevealSection className="border-y border-slate-200 bg-blue-50/50 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Foundation
            </div>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">OOP Fundamentals</h2>

            <p className="mt-4 leading-7 text-slate-600">
              Before patterns, understand how objects should own state, expose behavior and
              collaborate with other objects.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["Encapsulation", "Keep state and behavior together while controlling access."],
              [
                "Abstraction",
                "Expose what the object does without exposing unnecessary implementation.",
              ],
              [
                "Inheritance",
                "Reuse and specialize behavior where an is-a relationship genuinely exists.",
              ],
              [
                "Polymorphism",
                "Allow different implementations to be used through a common contract.",
              ],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="font-black">{title}</h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>
      <RevealSection className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8" id="inside">
        <div className="max-w-3xl">
          <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Design Principles
          </div>

          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            SOLID + KISS + DRY + YAGNI
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            The book doesn't treat design principles as definitions to memorize. Each principle is
            connected to practical design problems and refactoring decisions.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle, index) => (
            <div
              key={principle.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-xs font-black text-blue-600">
                PRINCIPLE {String(index + 1).padStart(2, "0")}
              </div>

              <h3 className="mt-3 font-black text-slate-950">{principle.title}</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">{principle.short}</p>
            </div>
          ))}
        </div>
      </RevealSection>
      <RevealSection id="patterns" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Complete Pattern Library
            </div>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              All 23 GoF Design Patterns
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Learn the complete Creational, Structural and Behavioral pattern families with
              purpose, use cases, examples and implementation thinking.
            </p>
          </div>

          <div className="mt-12 space-y-12">
            {Object.entries(patterns).map(([category, items]) => (
              <div key={category}>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">{category} Patterns</h3>

                    <p className="mt-1 text-sm text-slate-500">{items.length} patterns covered</p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
                    {category === "Creational"
                      ? "Object Creation"
                      : category === "Structural"
                        ? "Object Composition"
                        : "Object Behavior"}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((pattern, index) => (
                    <div
                      key={pattern.name}
                      className="group rounded-2xl border border-slate-200 bg-[#fbfdff] p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-blue-600">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                          {category}
                        </span>
                      </div>

                      <h4 className="mt-4 text-lg font-black text-slate-950">{pattern.name}</h4>

                      <p className="mt-3 text-sm leading-6 text-slate-600">{pattern.purpose}</p>

                      <div className="mt-5 rounded-xl bg-blue-50 p-4">
                        <div className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                          Example
                        </div>

                        <div className="mt-1 text-sm font-semibold text-slate-700">
                          {pattern.example}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          When to use
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">{pattern.when}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>
      <RevealSection className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 lg:p-12">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Pattern Thinking
              </div>

              <h2 className="mt-3 text-3xl font-black text-slate-950">
                Don't force a pattern.
                <span className="block text-blue-600">Let the requirement reveal it.</span>
              </h2>

              <p className="mt-5 leading-7 text-slate-600">
                A common LLD mistake is trying to use every design pattern in every problem. The
                book teaches you to first understand the requirement and then identify the design
                pressure.
              </p>
            </div>

            <div className="space-y-4">
              {[
                ["Changing algorithm?", "Think Strategy."],
                ["Different object creation?", "Think Factory."],
                ["Multiple subscribers?", "Think Observer."],
                ["Additional behavior?", "Think Decorator."],
                ["Object has many optional fields?", "Think Builder."],
                ["Different object states?", "Think State."],
                ["Incompatible external API?", "Think Adapter."],
                ["Multiple handlers?", "Think Chain of Responsibility."],
              ].map(([question, answer]) => (
                <div
                  key={question}
                  className="flex items-center justify-between gap-4 rounded-xl border border-blue-100 bg-white p-4"
                >
                  <span className="text-sm font-semibold text-slate-700">{question}</span>

                  <span className="shrink-0 text-sm font-black text-blue-600">{answer}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Start With Requirements
            </div>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Functional + Non-Functional Requirements
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Before drawing classes, understand what the system must do and what qualities the
              system must maintain.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-7">
              <h3 className="text-xl font-black text-slate-950">Functional Requirements</h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                What should the system actually do?
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Create a booking",
                  "Cancel a booking",
                  "Reserve a seat",
                  "Send a notification",
                  "Apply a coupon",
                  "Process a payment",
                  "Update inventory",
                  "Calculate a fare",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-[#fbfdff] p-7">
              <h3 className="text-xl font-black text-slate-950">Non-Functional Requirements</h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                How should the system behave under real conditions?
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  "Concurrency",
                  "Thread Safety",
                  "Performance",
                  "Scalability",
                  "Reliability",
                  "Maintainability",
                  "Extensibility",
                  "Testability",
                  "Security",
                  "Availability",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection className="border-y border-slate-200 bg-blue-50/50 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Concurrency & Thread Safety
              </div>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Locking is part of LLD.</h2>

              <p className="mt-5 leading-7 text-slate-600">
                Real-world LLD problems often contain shared state. Two users may attempt the same
                seat, two orders may update the same inventory, or multiple threads may write to the
                same resource.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Race Conditions",
                  "Critical Sections",
                  "Mutex",
                  "Synchronized Blocks",
                  "Read / Write Locks",
                  "Atomic Operations",
                  "Deadlocks",
                  "Thread Safety",
                  "Optimistic Locking",
                  "Pessimistic Locking",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Seat / Inventory Locking</span>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  Java
                </span>
              </div>

              <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700 sm:p-5 sm:text-sm sm:leading-7">
                {`class Inventory {

    private final Object lock = new Object();
    private int stock = 10;

    boolean reserve(int quantity) {

        synchronized (lock) {

            if (stock < quantity)
                return false;

            stock -= quantity;

            return true;
        }
    }
}`}
              </pre>

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-600">
                The book explains why the critical section exists, what race condition can occur
                without it, and how different locking approaches affect the design.
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Code-First Learning
          </div>

          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Design Patterns in Java
          </h2>

          <p className="mx-auto mt-4 max-w-3xl leading-7 text-slate-600">
            Each design problem is explained conceptually and then translated into practical,
            interview-focused Java code.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <span className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200">
            Java
          </span>
        </div>

        <div className="mt-8 space-y-7">
          {codeTabs.map(([key, title]) => (
            <div
              key={key}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col items-start gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <div className="font-black text-slate-950">{title}</div>

                  <div className="mt-1 text-xs text-slate-500">Java implementation</div>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  Java
                </span>
              </div>

              <pre className="overflow-x-auto bg-white p-4 text-xs leading-6 text-slate-700 sm:p-6 sm:text-sm sm:leading-7">
                {codeExamples[key]}
              </pre>
            </div>
          ))}
        </div>
      </RevealSection>
      <RevealSection className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="text-center">
            <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Interview Framework
            </div>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              A Repeatable LLD Design Process
            </h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Clarify Requirements", "Identify scope, actors and core use cases."],
              ["02", "Find Entities", "Extract nouns, domain objects and responsibilities."],
              [
                "03",
                "Define Relationships",
                "Association, aggregation, composition and inheritance.",
              ],
              ["04", "Assign Responsibilities", "Decide which class owns which behavior."],
              ["05", "Identify Changing Parts", "Find areas likely to change independently."],
              ["06", "Apply Principles", "Use SOLID, KISS, DRY and low coupling."],
              ["07", "Choose Patterns", "Use patterns only where they solve a real problem."],
              [
                "08",
                "Handle Concurrency",
                "Identify shared state and synchronization requirements.",
              ],
              ["09", "Write Code", "Implement interfaces, classes and collaborations."],
              ["10", "Discuss Trade-offs", "Explain alternatives and why your design works."],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-2xl border border-slate-200 bg-[#fbfdff] p-6">
                <div className="text-xs font-black text-blue-600">{number}</div>

                <h3 className="mt-3 font-black text-slate-950">{title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>
      <RevealSection
        id="problems"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="max-w-3xl">
          <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Inside the book · Real-world design practice
          </div>

          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            16 System Designs Covered in the Book
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Explore the systems included in the book. Each card highlights the domain, core classes
            and design concepts you will practice. The full practice prompts and requirements are
            inside the book.
          </p>
        </div>

        <div className="mt-10 lld-design-grid">
          {designQuestions.map((question, index) => (
            <div key={question.title} className="lld-design-card">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  {question.company}
                </span>

                <span className="text-xs font-bold text-slate-400">
                  LLD {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-black text-slate-950">{question.title}</h3>

              <div className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                {question.focus}
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                  What you will explore
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600">{QUESTION_SUMMARIES[index]}</p>
              </div>

              <div className="mt-5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Key Classes
                </div>

                <p className="mt-2 text-xs leading-6 text-slate-600">{question.classes}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {question.patterns.map((pattern) => (
                  <span
                    key={pattern}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700"
                  >
                    {pattern}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </RevealSection>
      <RevealSection className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-700">
              Example: BookMyShow
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Movie Ticket Booking
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              A practical LLD exercise around shows, seats, users, bookings, payments and the most
              important challenge: handling concurrent seat reservations.
            </p>
          </div>

          <div className="mt-10 grid min-w-0 gap-6 lg:grid-cols-2 lg:items-stretch">
            <div className="min-w-0 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-6 lg:p-8">
              <div className="mb-6">
                <span className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                  What you'll design
                </span>

                <h3 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
                  Booking System Responsibilities
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  "Identify Movie, Theatre, Screen and Show",
                  "Model individual Seat and SeatStatus",
                  "Create Booking and Payment abstractions",
                  "Define seat lifecycle",
                  "Handle temporary seat locking",
                  "Prevent duplicate booking",
                  "Calculate booking/payment amounts",
                  "Notify users after booking state changes",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                      ✓
                    </div>

                    <p className="min-w-0 break-words text-sm font-semibold leading-6 text-slate-700">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7">
                <div className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Patterns & Concepts
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {["State", "Strategy", "Observer", "Locking"].map((item) => (
                    <span
                      key={item}
                      className="max-w-full break-words rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <div className="min-w-0">
                  <div className="text-sm font-black text-slate-950">Seat Locking</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Thread-safe seat state transition
                  </div>
                </div>

                <span className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  Java
                </span>
              </div>

              <div className="min-w-0 overflow-hidden bg-white">
                <pre className="max-w-full overflow-x-auto whitespace-pre bg-slate-50 p-4 text-[11px] leading-6 text-slate-700 sm:p-6 sm:text-sm sm:leading-7">
                  {`enum SeatState { AVAILABLE, LOCKED, BOOKED }

class Seat {

    private SeatState state = SeatState.AVAILABLE;

    public synchronized boolean lock() {

        if (state != SeatState.AVAILABLE)
            return false;

        state = SeatState.LOCKED;
        return true;
    }

    public synchronized void book() {

        if (state != SeatState.LOCKED)
            throw new IllegalStateException();

        state = SeatState.BOOKED;
    }
}`}
                </pre>
              </div>

              <div className="border-t border-slate-200 bg-blue-50/60 p-4 sm:p-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
                    ?
                  </div>

                  <h4 className="text-sm font-black text-slate-950">Design Thinking</h4>
                </div>

                <p className="mt-3 break-words text-sm leading-7 text-slate-600">
                  The important part is not memorizing this class. The important part is recognizing
                  that seat state changes need controlled transitions and concurrency protection.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-blue-100 bg-blue-50/50 p-4 sm:p-6">
            <div className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
              Seat Lifecycle
            </div>

            <div className="mt-5 hidden items-center justify-center gap-3 sm:flex">
              <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700">
                AVAILABLE
              </div>
              <span className="font-black text-blue-500">→</span>
              <div className="rounded-xl border border-blue-200 bg-blue-100 px-5 py-3 text-sm font-bold text-blue-700">
                LOCKED
              </div>
              <span className="font-black text-blue-500">→</span>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700">
                BOOKED
              </div>
            </div>

            <div className="mt-5 flex flex-col items-stretch gap-2 sm:hidden">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-xs font-bold text-slate-700">
                AVAILABLE
              </div>
              <div className="text-center font-black text-blue-500">↓</div>
              <div className="rounded-xl border border-blue-200 bg-blue-100 px-4 py-3 text-center text-xs font-bold text-blue-700">
                LOCKED
              </div>
              <div className="text-center font-black text-blue-500">↓</div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-xs font-bold text-emerald-700">
                BOOKED
              </div>
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Pattern Practice Map
          </div>

          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Connect each pattern to a familiar design problem
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Movie Ticket Booking", "Composition + State"],
            ["Inventory Management", "Strategy + Observer"],
            ["Parking Lot", "Strategy + Factory"],
            ["Notification System", "Strategy + Observer"],
            ["Rate Limiter", "Strategy + Concurrency"],
            ["Logger", "Registry + Strategy"],
            ["Train Reservation", "State + Queue"],
            ["Car Rental", "Strategy + Decorator"],
            ["Expense Sharing", "Strategy + Graph"],
            ["Live Cricket Score", "Events + State"],
            ["Coupon Engine", "Strategy + Chain"],
            ["Ride Booking", "Strategy + State"],
            ["Payment Gateway", "Adapter + Strategy"],
            ["Video Conferencing", "Mediator + Composition"],
            ["Order Management", "State + Strategy"],
            ["Food Delivery", "Strategy + State"],
          ].map(([title, pattern]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-black text-slate-950">{title}</h3>

              <div className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {pattern}
              </div>
            </div>
          ))}
        </div>
      </RevealSection>
      <RevealSection className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Inside The Book
              </div>

              <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                Everything You Need for LLD
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                A structured progression from object-oriented thinking to complete design problems
                and implementation.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "OOP Fundamentals",
                "Classes & Objects",
                "Association",
                "Aggregation",
                "Composition",
                "Inheritance",
                "Polymorphism",
                "Interfaces",
                "Abstract Classes",
                "SOLID",
                "KISS",
                "DRY",
                "YAGNI",
                "Coupling",
                "Cohesion",
                "Composition vs Inheritance",
                "All 23 GoF Patterns",
                "UML Thinking",
                "Class Relationships",
                "Concurrency",
                "Thread Safety",
                "Locking",
                "Race Conditions",
                "Deadlocks",
                "Functional Requirements",
                "Non-Functional Requirements",
                "Design Trade-offs",
                "Machine Coding",
                "16 Real-World Systems",
                "Java",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-[#fbfdff] p-3 text-sm font-semibold text-slate-700"
                >
                  <span className="text-blue-600">✓</span>

                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:p-12">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Interview Preparation
              </div>

              <h2 className="mt-3 text-3xl font-black text-slate-950">
                What Will You Learn to Answer?
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                The goal is to explain your reasoning, not simply draw classes on a whiteboard.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Why did you create this interface?",
                "Why Strategy instead of inheritance?",
                "Why Factory instead of new?",
                "Where would you use Observer?",
                "What happens if two threads access this object?",
                "Where is the critical section?",
                "How would you make this design extensible?",
                "What changes if another payment provider is added?",
                "What happens if a new notification channel is introduced?",
                "How would you test this design?",
                "What is the responsibility of each class?",
                "Which part of the design is likely to change?",
              ].map((question) => (
                <div
                  key={question}
                  className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700"
                >
                  {question}
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>
    </div>
  );
}
