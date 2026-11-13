// Base stylesheet and small motion helpers shared by the handbook pages that
// were built on the original LLD page (AWS, GCP and SQL handbooks).
import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

const THEME_KEY = "theme";

export const readTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
};

export const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');
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
html[data-theme="dark"] body {
  background: #0a1020;
}
.lldPage {
  --bg: #FAF9F6;
  --surface: #ffffff;
  --surface-2: #F5F1EB;
  --text: #292524;
  --muted: #6B625B;
  --border: #E7E0D8;
  --accent: #EA580C;
  --accent-2: #FB923C;
  --soft: #FFF0E3;
  --hero: #FFF9F2;
  --hero-mid: #FFF1E4;
  --hero-end: #FFE8D1;
  --hero-text: #292524;
  --hero-muted: #67594E;
  --hero-dot: rgba(234, 88, 12, 0.09);
  --hero-eyebrow-bg: rgba(255, 255, 255, 0.9);
  --hero-eyebrow-border: #FED7AA;
  --hero-eyebrow-text: #C2410C;
  --hero-outline-bg: rgba(255, 255, 255, 0.82);
  --hero-outline-border: #E8C7A6;
  --hero-outline-text: #292524;
  --chip-bg: rgba(255, 255, 255, 0.92);
  --chip-border: #E8D2BF;
  --chip-text: #292524;
  --chip-shadow: 0 14px 30px rgba(44, 71, 118, 0.14);
  --code: #1C1917;
  --shadow: 0 18px 55px rgba(29, 49, 88, 0.09);
  color-scheme: light;
  position: relative;
  width: 100%;
  max-width: none;
  min-height: 100vh;
  margin: 0;
  overflow-x: clip;
  overflow-y: visible;
  background: var(--bg);
  color: var(--text);
  isolation: isolate;
  transition:
    background 0.25s ease,
    color 0.25s ease;
}
.lldPage[data-theme="dark"] {
  --bg: #141210;
  --surface: #211D1A;
  --surface-2: #29231E;
  --text: #FAF7F3;
  --muted: #C0B5AA;
  --border: #403831;
  --accent: #FB923C;
  --accent-2: #FDBA74;
  --soft: #39271D;
  --hero: #211811;
  --hero-mid: #382318;
  --hero-end: #492B1B;
  --hero-text: #FFF8F1;
  --hero-muted: #D5C5B5;
  --hero-dot: rgba(255, 255, 255, 0.14);
  --hero-eyebrow-bg: rgba(255, 255, 255, 0.08);
  --hero-eyebrow-border: rgba(174, 193, 255, 0.28);
  --hero-eyebrow-text: #FFD2A8;
  --hero-outline-bg: rgba(255, 255, 255, 0.07);
  --hero-outline-border: rgba(255, 255, 255, 0.25);
  --hero-outline-text: #FFF4E8;
  --chip-bg: rgba(17, 29, 61, 0.86);
  --chip-border: rgba(255, 255, 255, 0.16);
  --chip-text: #FFF3E7;
  --chip-shadow: 0 15px 30px rgba(0, 0, 0, 0.18);
  --code: #110F0D;
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
  .lld-float-chip {
    display: none;
  }
  .lld-flow {
    grid-template-columns: 1fr;
  }
  .lld-flow-step:not(:last-child):after {
    display: none;
  }
  .lld-book-stage {
    min-height: 350px;
  }
  .lld-book-mock {
    width: min(230px, 72vw);
  }
  .lld-final-cta {
    border-radius: 22px;
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
  padding-top: var(--lld-navbar-offset, 64px);
  padding-bottom: 48px;
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



/* =====================================================
   TARGET TREK LLD — ORANGE / CHARCOAL EDITORIAL THEME
   Font contrast and purchase elements, both themes
   ===================================================== */
.lldPage { font-family: 'DM Sans', sans-serif; }
.lldPage h1, .lldPage h2, .lldPage h3, .lldPage h4,
.lldPage button, .lldPage .lld-price-now, .lldPage .lld-book-title {
  font-family: 'Manrope', sans-serif;
}
.lldPage h1, .lldPage h2, .lldPage h3, .lldPage h4,
.lldPage strong { color: var(--text); }
.lld-hero h1, .lld-book-mock .lld-book-title, .lld-final-cta h2,
.lld-final-cta .lld-price-now { color: #FFFFFF; }
.lld-hero h1 { color: var(--hero-text); }
.lldPage[data-theme="dark"] .lld-hero h1 { color: #FFF8F1; }
.lld-gradient-text, .lldPage[data-theme="dark"] .lld-gradient-text {
  background: linear-gradient(100deg,#EA580C,#F97316,#FB923C);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.lldPage[data-theme="dark"] .lld-gradient-text {
  background: linear-gradient(100deg,#FDBA74,#FB923C,#FFEDD5);
  -webkit-background-clip: text; background-clip: text;
}
.lld-hero { padding: 42px 0 50px; }
.lld-hero-grid { gap: 28px; }
.lld-hero h1 { font-size: clamp(32px, 4.5vw, 52px); line-height: 1.07; margin: 14px 0; }
.lld-hero-copy { line-height: 1.67; }
.lld-book-stage { min-height: 385px; }
.lld-book-mock {
  width: min(260px, 70vw); height: 390px;
  background: linear-gradient(145deg,#221B17,#482919 65%,#9A3412);
  border: 1px solid rgba(253,186,116,.38);
  box-shadow: 15px 22px 45px rgba(32,19,12,.27);
}
.lld-book-kicker { color: #FDBA74; }
.lld-book-subtitle { color: #F5DED0; }
.lld-book-tag { color: #FFEDD5; }
.lld-orbit { border-color: rgba(234,88,12,.22); }
.lld-orbit:before, .lld-orbit:after { background: #FB923C; box-shadow: 0 0 17px rgba(249,115,22,.5); }
.lld-cta {
  padding: 12px 18px; border-radius: 11px;
  background: linear-gradient(110deg,#EA580C,#F97316);
  color: #FFF !important;
  box-shadow: 0 10px 22px rgba(234,88,12,.20);
}
.lld-cta:hover { box-shadow: 0 12px 25px rgba(234,88,12,.29); }
.lld-cta-outline { background: var(--surface); color: var(--text) !important; box-shadow: none; }
.lld-hero .lld-cta-outline { color: var(--hero-outline-text) !important; }
.lldPage .lld-section-head h2, .lldPage .lld-section-title { color: var(--text); }
.lldPage .lld-module h3, .lldPage .lld-question h3,
.lldPage .lld-pattern-card h3, .lldPage .lld-design-card h3 { color: var(--text); }
.lldPage .lld-module p, .lldPage .lld-section-head p,
.lldPage .lld-question-product, .lldPage .lld-faq-answer { color: var(--muted); }
.lldPage .lld-kicker, .lldPage .lld-flow-num,
.lldPage .lld-question-top, .lldPage .lld-tag { color: var(--accent); }
.lldPage .lld-stat, .lldPage .lld-card, .lldPage .lld-faq-item,
.lldPage .lld-hld-card { border-color: var(--border); }
.lldPage .lld-tag, .lldPage .lld-module-icon,
.lldPage .lld-flow-icon { background: var(--soft); }
.lld-final-cta {
  background: linear-gradient(125deg,#1C1917,#3A281D 65%,#9A3412);
  box-shadow: 0 18px 45px rgba(29,20,16,.20);
}
.lld-final-copy h2, .lld-final-copy h3 { color: #FFF8F1; }
.lld-final-copy p, .lld-price-label, .lld-price-old,
.lld-price-small, .lld-final-checks { color: #E9D9CA; }
.lld-price-card .lld-cta {
  background: #F97316;
  color: #FFFFFF !important;
}
.lld-discount, .lld-hld-save { color: #EA580C; }
.lldPage[data-theme="dark"] .lld-discount,
.lldPage[data-theme="dark"] .lld-hld-save { color: #FDBA74; }
.lldPage .lld-code-card { background: #1C1917; border-color: #4B3629; }
.lldPage .lld-code-top, .lldPage .lld-code-caption { color: #D6C6B6; }
.lldPage .lld-highlight { color: #FDBA74; }
.lldPage .lld-expanded [class~="text-blue-600"],
.lldPage .lld-expanded [class~="text-blue-700"],
.lldPage .lld-expanded [class~="text-blue-500"] { color: var(--accent); }
.lldPage .lld-expanded [class~="text-slate-800"],
.lldPage .lld-expanded [class~="text-slate-900"] { color: var(--text); }
.lldPage .lld-expanded [class~="text-slate-600"],
.lldPage .lld-expanded [class~="text-slate-500"] { color: var(--muted); }
.lld-preview-topbar, .lld-preview-badge, .lld-preview-note { color: var(--text); }
.lldPage[data-theme="dark"] .lld-preview-topbar,
.lldPage[data-theme="dark"] .lld-preview-badge,
.lldPage[data-theme="dark"] .lld-preview-note { color: #FAF7F3; }
.lld-hld-cover { background: linear-gradient(140deg,var(--surface-2),var(--soft)); }
.lld-mobile-buy .lld-cta { background: #F97316; color: #FFF !important; }
@media(max-width:720px){
  .lld-hero { padding: 28px 0 38px; }
  .lld-book-stage { min-height: 340px; }
  .lld-book-mock { width: min(225px,72vw); height: 335px; }
  .lld-hero h1 { font-size: clamp(31px,8vw,42px); }
}


/* The optional combo uses the same orange/brown theme as the HLD card. */
.lld-combo-card { margin-top: 24px; border: 1px solid var(--border); }
.lldPage .lld-expanded .text-blue-600 { color: var(--accent) !important; }
.lldPage .lld-expanded .text-blue-700 { color: var(--accent) !important; }
.lldPage .lld-expanded .bg-blue-50 { background: var(--soft) !important; }
.lldPage .lld-expanded .border-blue-100 { border-color: var(--border) !important; }
.lldPage .lld-expanded .text-slate-950 { color: var(--text) !important; }
.lldPage .lld-expanded .text-slate-600, .lldPage .lld-expanded .text-slate-500, .lldPage .lld-expanded .text-slate-400 { color: var(--muted) !important; }
.lldPage .lld-expanded .bg-white { background-color: var(--surface) !important; }
.lldPage .lld-expanded .bg-slate-50 { background-color: var(--surface-2) !important; }
.lldPage .lld-expanded .border-slate-200 { border-color: var(--border) !important; }

/* Java examples: explicit theme tokens prevent white-on-white code in light mode. */
.lldPage .lld-java-example-card {
  background: var(--surface) !important;
  border-color: var(--border) !important;
}
.lldPage .lld-java-example-head {
  background: var(--surface-2) !important;
  border-color: var(--border) !important;
}
.lldPage .lld-java-example-head .text-slate-950 { color: var(--text) !important; }
.lldPage .lld-java-example-head .text-slate-500 { color: var(--muted) !important; }
.lldPage .lld-java-code {
  display: block;
  margin: 0;
  background: #faf7f2 !important;
  color: #292524 !important;
  -webkit-text-fill-color: #292524;
  border: 0;
  tab-size: 2;
  white-space: pre;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
.lldPage[data-theme="dark"] .lld-java-code {
  background: #171411 !important;
  color: #f5e9dc !important;
  -webkit-text-fill-color: #f5e9dc;
}
/* Responsive landscape 16:9 covers: neither crop nor distort artwork. */
.lld-companion-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 22px;
  max-width: 1120px;
  margin-inline: auto;
}
.lld-companion-grid > .lld-hld-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
  max-width: none;
  margin: 0;
  overflow: hidden;
  border-radius: 20px;
}
.lld-companion-grid > .lld-hld-card:only-child {
  max-width: 550px;
  justify-self: center;
}
.lld-companion-grid .lld-hld-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto;
  min-height: 0;
  flex: none;
  border-right: 0;
  border-bottom: 1px solid var(--border);
  display: block;
}
.lld-companion-grid .lld-hld-cover img {
  display: block;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  padding: 0;
}
.lld-companion-grid .lld-hld-cover-fallback {
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
}
.lld-companion-grid .lld-hld-cover-fallback strong {
  font-size: clamp(21px, 2.8vw, 30px);
}
.lld-companion-grid .lld-hld-details {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-start;
  padding: 22px;
}
.lld-companion-grid .lld-hld-details h3 {
  font-size: clamp(18px, 2vw, 22px);
  line-height: 1.3;
}
.lld-companion-grid .lld-hld-details > p {
  font-size: 12.5px;
  line-height: 1.7;
}
.lld-companion-grid .lld-hld-badge { font-size: 10px; padding: 5px 9px; }
.lld-companion-grid .lld-hld-topics { margin-top: 12px; }
.lld-companion-grid .lld-hld-price-box { margin-top: auto; }
.lld-companion-grid .lld-hld-actions {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding-top: 12px;
  margin-top: 0;
}
.lld-companion-grid .lld-hld-actions .lld-cta {
  min-width: 0;
  min-height: 42px;
  padding: 10px 8px;
  font-size: 11px;
  text-align: center;
}
@media (max-width: 780px) {
  .lld-companion-grid { grid-template-columns: minmax(0, 1fr); max-width: 550px; }
  .lld-companion-grid > .lld-hld-card { max-width: 550px; }
}
@media (max-width: 420px) {
  .lld-companion-grid { gap: 16px; }
  .lld-companion-grid .lld-hld-details { padding: 16px; }
  .lld-companion-grid .lld-hld-actions { grid-template-columns: 1fr; }
}

/* =========================================================
   MOTION LAYER: scroll, hover, scale and sticky buy card
   (individual transform properties so they compose with
   framer-motion's inline transforms)
========================================================= */
.lld-progress {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 90;
  height: 3px;
  transform-origin: 0 50%;
  background: linear-gradient(90deg, #EA580C, #FB923C, #F59E0B);
  pointer-events: none;
}

.lld-card,
.lld-module,
.lld-stat,
.lld-hld-card,
.lld-flow-step,
.lld-pattern-card,
.lld-design-card,
.lld-question,
.lld-faq-item,
.lld-code-card,
.lld-preview-card,
.lld-price-card {
  transition:
    translate 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    scale 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.4s ease,
    border-color 0.4s ease;
}
.lld-card:hover,
.lld-module:hover,
.lld-stat:hover,
.lld-hld-card:hover,
.lld-flow-step:hover,
.lld-pattern-card:hover,
.lld-design-card:hover,
.lld-question:hover,
.lld-code-card:hover,
.lld-price-card:hover {
  translate: 0 -6px;
  scale: 1.015;
  box-shadow: 0 26px 60px rgba(234, 88, 12, 0.16);
  border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
}
.lld-faq-item:hover {
  border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
  scale: 1.005;
}

.lld-module-icon,
.lld-flow-icon,
.lld-module-number {
  transition: rotate 0.4s ease, scale 0.4s ease, color 0.3s ease;
}
.lld-module:hover .lld-module-icon,
.lld-flow-step:hover .lld-flow-icon {
  rotate: -8deg;
  scale: 1.18;
}
.lld-module:hover .lld-module-number {
  scale: 1.12;
}

.lld-tag,
.lld-pattern-pill,
.lld-hld-topic,
.lld-hld-badge {
  transition: translate 0.25s ease, scale 0.25s ease, background 0.25s ease;
}
.lld-tag:hover,
.lld-pattern-pill:hover,
.lld-hld-topic:hover,
.lld-hld-badge:hover {
  translate: 0 -2px;
  scale: 1.07;
}

.lld-hld-cover img,
.lld-hld-cover-fallback {
  transition: scale 0.5s cubic-bezier(0.22, 1, 0.36, 1), rotate 0.5s ease;
}
.lld-hld-card:hover .lld-hld-cover img,
.lld-hld-card:hover .lld-hld-cover-fallback {
  scale: 1.06;
  rotate: -1.5deg;
}

/* CTA: press, glow and shimmer sweep */
.lld-cta {
  position: relative;
  overflow: hidden;
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.25s,
    filter 0.25s,
    scale 0.2s;
}
.lld-cta:hover:not(:disabled) {
  scale: 1.03;
}
.lld-cta:active:not(:disabled) {
  scale: 0.97;
}
.lld-cta:not(.lld-cta-outline):not(:disabled)::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.38) 50%, transparent 70%);
  transform: translateX(-130%);
  animation: lldSheen 3.6s ease-in-out infinite;
  pointer-events: none;
}
@keyframes lldSheen {
  0%, 55% { transform: translateX(-130%); }
  100% { transform: translateX(130%); }
}
.lld-cta svg {
  transition: translate 0.25s ease;
}
.lld-cta:hover svg:last-child {
  translate: 4px 0;
}

/* animated gradient headline */
.lld-gradient-text {
  background-size: 200% auto !important;
  animation: lldGradient 6s linear infinite;
}
@keyframes lldGradient {
  to { background-position: 200% center; }
}

/* hero pointer parallax (uses translate/rotate so it never fights lldFloat) */
.lld-book-stage {
  --mx: 0;
  --my: 0;
}
.lld-book-mock {
  translate: calc(var(--mx) * -12px) calc(var(--my) * -10px);
  rotate: calc(var(--mx) * 2.5deg);
  transition: translate 0.3s ease-out, rotate 0.3s ease-out;
}
.lld-chip-one {
  translate: calc(var(--mx) * 20px) calc(var(--my) * 14px);
}
.lld-chip-two {
  translate: calc(var(--mx) * -18px) calc(var(--my) * 12px);
}
.lld-chip-three {
  translate: calc(var(--mx) * 14px) calc(var(--my) * -16px);
}
.lld-orbit {
  translate: calc(var(--mx) * 8px) calc(var(--my) * 6px);
  transition: translate 0.4s ease-out;
}
.lld-float-chip {
  transition: translate 0.3s ease-out;
}

/* FAQ answers stay in the DOM (crawlable) and animate open */
.lld-faq-collapse {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.32s ease;
}
.lld-faq-collapse.is-open {
  grid-template-rows: 1fr;
}
.lld-faq-collapse-inner {
  min-height: 0;
  overflow: hidden;
}

.lld-stats-scale,
.lld-companion-scale {
  will-change: transform, opacity;
}

/* RESPONSIVE STICKY BUY CARD
   mobile: docked strip · sm: centered card · md/lg/xl/2xl: progressively wider.
   On md+ it slides in only after the hero scrolls away. */
.lld-mobile-buy {
  display: none !important;
}
.lldPage > main {
  padding-bottom: 104px;
}
.lld-sticky {
  position: fixed;
  inset: auto 0 0 0;
  z-index: 60;
  display: flex;
  justify-content: center;
  padding: 0 10px max(10px, env(safe-area-inset-bottom));
  pointer-events: none;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease;
}
.lld-sticky.is-checkout-open {
  transform: translateY(110%);
  opacity: 0;
  visibility: hidden;
}
.lld-sticky-card {
  pointer-events: auto;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  backdrop-filter: blur(16px);
  box-shadow: 0 -10px 45px rgba(15, 23, 42, 0.18);
}
.lld-sticky-info {
  min-width: 0;
  padding-left: 4px;
}
.lld-sticky-title {
  display: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text);
  font-size: 14px;
  line-height: 1.2;
}
.lld-sticky-price {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
}
.lld-sticky-now {
  color: var(--accent);
  font-size: 19px;
  font-weight: 900;
  line-height: 1;
}
.lld-sticky-old {
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  text-decoration: line-through;
}
.lld-sticky-off {
  padding: 2px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent);
  font-size: 10px;
  font-weight: 800;
}
.lld-sticky-sub {
  display: block;
  margin-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--muted);
  font-size: 11px;
  font-weight: 700;
}
.lld-sticky-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.lld-sticky-preview {
  display: none;
}
.lld-sticky-actions .lld-cta {
  min-height: 48px;
  padding: 0 16px;
  font-size: 13px;
  white-space: nowrap;
}
.lld-pulse {
  animation: lldPulse 2.4s ease-out infinite;
}
@keyframes lldPulse {
  0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.45); }
  70%, 100% { box-shadow: 0 0 0 14px rgba(249, 115, 22, 0); }
}

@media (min-width: 640px) {
  .lld-sticky { padding-inline: 16px; }
  .lld-sticky-card { max-width: 576px; gap: 16px; padding: 12px; border-radius: 22px; }
  .lld-sticky-title { display: block; }
  .lld-sticky-price { margin-top: 4px; }
  .lld-sticky-sub { display: none; }
  .lld-sticky-now { font-size: 17px; }
  .lld-sticky-actions .lld-cta { padding: 0 22px; font-size: 14px; }
}
@media (min-width: 768px) {
  .lld-sticky { padding-bottom: 20px; }
  .lld-sticky-card { max-width: 672px; padding: 12px 12px 12px 20px; border-radius: 18px; }
  .lld-sticky.is-hero-visible:not(.is-checkout-open) {
    transform: translateY(40px);
    opacity: 0;
    visibility: hidden;
  }
  .lld-pulse { animation: none; }
}
@media (min-width: 1024px) {
  .lld-sticky-card { max-width: 768px; gap: 24px; }
  .lld-sticky-title { font-size: 16px; }
  .lld-sticky-now { font-size: 19px; }
  .lld-sticky-preview { display: inline-flex; }
}
@media (min-width: 1280px) {
  .lld-sticky-card { max-width: 896px; }
}
@media (min-width: 1536px) {
  .lld-sticky-card { max-width: 1024px; }
}

@media (prefers-reduced-motion: reduce) {
  .lld-gradient-text,
  .lld-pulse,
  .lld-cta::after {
    animation: none !important;
  }
  .lld-book-mock,
  .lld-chip-one,
  .lld-chip-two,
  .lld-chip-three,
  .lld-orbit {
    translate: none;
    rotate: none;
  }
}

/* =========================================================
   COMPANION CARDS (HLD + Combo): redesigned
========================================================= */
.lld-cc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
  gap: 26px;
  max-width: 1000px;
  margin: 36px auto 0;
  align-items: stretch;
}
.lld-cc {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 560px;
  width: 100%;
  margin-inline: auto;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 30px;
  background: var(--surface);
  box-shadow: var(--shadow);
  isolation: isolate;
  transition:
    translate 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.45s ease,
    border-color 0.45s ease;
}
.lld-cc:hover {
  translate: 0 -8px;
  border-color: color-mix(in srgb, var(--accent) 60%, var(--border));
  box-shadow: 0 34px 80px rgba(234, 88, 12, 0.2);
}
.lld-cc--combo {
  border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
}
.lld-cc--combo::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  padding: 1.5px;
  background: linear-gradient(135deg, #ea580c, #fbbf24, #ea580c);
  background-size: 200% 200%;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: lldBorderShift 6s linear infinite;
}
@keyframes lldBorderShift {
  to { background-position: 200% 200%; }
}

.lld-cc-stage {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 270px;
  padding: 42px 20px 30px;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 15%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 55%),
    radial-gradient(circle at 85% 90%, color-mix(in srgb, var(--accent-2) 22%, transparent), transparent 55%),
    linear-gradient(150deg, var(--soft), var(--surface-2));
}
.lld-cc-stage::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(color-mix(in srgb, var(--accent) 26%, transparent) 1.2px, transparent 1.2px);
  background-size: 22px 22px;
  opacity: 0.55;
  mask-image: linear-gradient(to bottom, #000, transparent 85%);
  -webkit-mask-image: linear-gradient(to bottom, #000, transparent 85%);
}
.lld-cc-glow {
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 35%, transparent);
  filter: blur(60px);
  animation: lldGlow 5s ease-in-out infinite;
}
@keyframes lldGlow {
  0%, 100% { scale: 1; opacity: 0.55; }
  50% { scale: 1.2; opacity: 0.9; }
}
.lld-cc-ribbon {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 999px;
  background: linear-gradient(110deg, #ea580c, #f97316);
  color: #fff;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: 0 8px 20px rgba(234, 88, 12, 0.35);
}
.lld-cc--combo .lld-cc-ribbon {
  background: linear-gradient(110deg, #f59e0b, #ea580c);
}
.lld-cc-plus {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 3;
  padding: 6px 12px;
  border: 1px solid var(--chip-border);
  border-radius: 12px;
  background: var(--chip-bg);
  color: var(--chip-text);
  font-size: 11px;
  font-weight: 900;
  backdrop-filter: blur(8px);
}
.lld-cc-cover {
  position: relative;
  z-index: 2;
  width: min(168px, 52%);
  aspect-ratio: 0.72;
  border-radius: 6px 14px 14px 6px;
  overflow: hidden;
  background: linear-gradient(150deg, #221b17, #482919 65%, #9a3412);
  box-shadow:
    18px 24px 44px rgba(32, 19, 12, 0.35),
    inset 6px 0 0 rgba(255, 255, 255, 0.1);
  animation: lldCoverBob 5s ease-in-out infinite;
  transition: scale 0.5s cubic-bezier(0.22, 1, 0.36, 1), rotate 0.5s ease;
}
.lld-cc:hover .lld-cc-cover {
  scale: 1.08;
  rotate: -3deg;
}
@keyframes lldCoverBob {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -10px; }
}
.lld-cc-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.lld-cc-fallback {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: flex-end;
  gap: 6px;
  padding: 16px;
  color: #fff;
}
.lld-cc-fallback small {
  color: #fdba74;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.lld-cc-fallback strong {
  font-size: 19px;
  line-height: 1.1;
}

.lld-cc-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  padding: 24px 24px 26px;
}
.lld-cc-eyebrow {
  color: var(--accent);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.lld-cc-body h3 {
  margin: 0;
  color: var(--text);
  font-size: 21px;
  line-height: 1.22;
}
.lld-cc-desc {
  margin: 0;
  color: var(--muted);
  font-size: 13.5px;
  line-height: 1.7;
}
.lld-cc-features {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.lld-cc-features li {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--text);
  font-size: 13px;
  font-weight: 700;
}
.lld-cc-features svg {
  flex: none;
  width: 22px;
  height: 22px;
  padding: 4px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 16%, transparent);
  color: var(--accent);
}
.lld-cc-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.lld-cc-topics span {
  padding: 5px 11px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--muted);
  font-size: 11.5px;
  font-weight: 700;
  transition: translate 0.25s ease, scale 0.25s ease, border-color 0.25s, color 0.25s;
}
.lld-cc-topics span:hover {
  translate: 0 -2px;
  scale: 1.07;
  border-color: var(--accent);
  color: var(--accent);
}
.lld-cc-price {
  margin-top: auto;
  padding: 16px 18px;
  border: 1px dashed color-mix(in srgb, var(--accent) 45%, var(--border));
  border-radius: 18px;
  background: color-mix(in srgb, var(--accent) 7%, var(--surface));
}
.lld-cc-price-label {
  color: var(--muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.lld-cc-price-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  margin-top: 6px;
}
.lld-cc-now {
  color: var(--text);
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
}
.lld-cc-old {
  color: var(--muted);
  font-size: 15px;
  font-weight: 700;
  text-decoration: line-through;
}
.lld-cc-save {
  padding: 4px 10px;
  border-radius: 999px;
  background: #16a34a;
  color: #fff;
  font-size: 11px;
  font-weight: 900;
}
.lld-cc-actions {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 10px;
}
.lld-cc-actions .lld-cta {
  min-height: 50px;
  padding-inline: 12px;
  font-size: 13px;
}
@media (max-width: 430px) {
  .lld-cc-actions {
    grid-template-columns: 1fr;
  }
  .lld-cc-body {
    padding: 20px 18px 22px;
  }
  .lld-cc-now {
    font-size: 28px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .lld-cc-cover,
  .lld-cc-glow,
  .lld-cc--combo::before {
    animation: none !important;
  }
  .lld-cc:hover,
  .lld-cc:hover .lld-cc-cover {
    translate: none;
    scale: 1;
    rotate: none;
  }
}


html { scroll-behavior: smooth; }
`;

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  return <motion.div aria-hidden="true" className="lld-progress" style={{ scaleX }} />;
}

export function CountUp({ to, suffix = "", duration = 1.4 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) {
      setValue(to);
      return undefined;
    }
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

// Scroll-linked scale in / scale out: grows to full size entering the viewport
// and eases back slightly as it leaves.
export function ScrollScale({ children, className, from = 0.93 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [from, 1, 1, from + 0.03]);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.35, 1, 1, 0.55]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div ref={ref} className={className} style={{ scale, opacity }}>
      {children}
    </motion.div>
  );
}
