
import React, {
  useEffect,
  useState,
} from "react";

import { ArrowUpRight, Headphones, Rocket } from "lucide-react";
import "./Footer.css";

import { Link } from "react-router-dom";

/* =========================================================
   CONFIGURATION
========================================================= */

const THEME_KEY = "theme";

const THEME_EVENT =
  "targettrek-theme-change";

const SUPPORT_EMAIL =
  "supporttargettrek@gmail.com";


/* =========================================================
   NAVIGATION DATA
========================================================= */

const QUICK_LINKS = [
  { name: "Home", href: "/" },
  { name: "Learn", href: "/learn" },
  { name: "Books", href: "/books" },
  {
    name: "Mock Interviews",
    href: "/mock-interviews",
  },
  {
    name: "Interview Experiences",
    href: "/interviews",
  },
  {
    name: "Resources",
    href: "/resources",
  },
  { name: "Blogs", href: "/blogs" },
  {
    name: "Services",
    href: "/services",
  },
  {
    name: "About Us",
    href: "/about",
  },
  {
    name: "Portfolio",
    href: "/portfolio",
  },
  {
    name: "Contact",
    href: "/contact",
  },
];

const BOOK_LINKS = [
  {
    name: "All Books",
    href: "/books",
  },
  {
    name: "Mastering System Design — HLD",
    href: "/book/system-design/hld",
  },
  {
    name: "Mastering System Design — LLD (Java)",
    href: "/book/system-design/lld",
  },
  {
    name: "SQL & Database Interview Handbook",
    href: "/book/database/sql",
  },
  {
    name: "Google Cloud (GCP) Engineer's Handbook",
    href: "/book/cloud/gcp",
  },
  {
    name: "AWS: The Complete Cloud Engineer's Handbook",
    href: "/book/cloud/aws",
  },
  {
    name: "Docker Handbook + Cheat Sheet",
    href: "/book/docker",
  },
  {
    name: "Git & GitHub Guide + Cheat Sheet",
    href: "/book/git",
  },
];

const LEGAL_LINKS = [
  {
    name: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    name: "Terms of Service",
    href: "/terms-of-service",
  },
  {
    name: "Refund Policy",
    href: "/refund-policy",
  },
];

/* =========================================================
   THEME HELPERS
========================================================= */

function readTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const stored =
      window.localStorage.getItem(
        THEME_KEY
      );

    if (
      stored === "dark" ||
      stored === "light"
    ) {
      return stored;
    }

    return document.documentElement.classList
      .contains("dark")
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function useFooterTheme() {
  const [theme, setTheme] =
    useState(readTheme);

  useEffect(() => {
    const syncTheme = () => {
      setTheme(readTheme());
    };

    const handleThemeEvent = (event) => {
      const next =
        event?.detail?.theme;

      if (
        next === "dark" ||
        next === "light"
      ) {
        setTheme(next);
      } else {
        syncTheme();
      }
    };

    const handleStorageChange = (event) => {
      if (
        event.key === THEME_KEY ||
        event.key === null
      ) {
        syncTheme();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncTheme();
      }
    };

    window.addEventListener(
      THEME_EVENT,
      handleThemeEvent
    );

    window.addEventListener(
      "themechange",
      handleThemeEvent
    );

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      "focus",
      syncTheme
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    const observer =
      new MutationObserver(syncTheme);

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "class",
          "data-theme",
        ],
      }
    );

    syncTheme();

    return () => {
      window.removeEventListener(
        THEME_EVENT,
        handleThemeEvent
      );

      window.removeEventListener(
        "themechange",
        handleThemeEvent
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "focus",
        syncTheme
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      observer.disconnect();
    };
  }, []);

  return theme;
}

/* =========================================================
   FOOTER COMPONENT
========================================================= */

export default function Footer() {
  const theme = useFooterTheme();
  const year = new Date().getFullYear();

  return (
    <footer className="tt-foot" data-theme={theme}>
      <div className="tt-foot-in">
       <div className="tt-foot-shell">
        <div className="tt-foot-main">
        <section className="tt-foot-hero">
          <div>
            <span className="tt-foot-eyebrow">Resume Lab</span>
            <h2 className="tt-foot-title">
              Get your resume <span className="tt-foot-mark">reviewed</span> before a recruiter does.
            </h2>
            <p className="tt-foot-sub">
              Upload your resume and a job description. Get an ATS score, what to fix and a tailored version.
            </p>
          </div>
          <div className="tt-foot-cta">
            <Link to="/resume-review" className="tt-foot-btn tt-foot-btn--primary">
              Review my resume <ArrowUpRight size={16} />
            </Link>
            <Link to="/books" className="tt-foot-btn tt-foot-btn--ghost">Browse books</Link>
          </div>
        </section>

        <nav className="tt-foot-cols" aria-label="Footer">
          <div className="tt-foot-brand">
            <Link to="/" className="tt-foot-logo" aria-label="Target Trek home">
              <span className="tt-foot-logo-mark"><Rocket size={20} strokeWidth={2.2} /></span>
              <span>TargetTrek</span>
            </Link>
            <p className="tt-foot-about">
              Practical books, interview experiences and system design resources for developers preparing for their next role.
            </p>
            <div className="tt-foot-mail">
              <a href={`mailto:${SUPPORT_EMAIL}`}>
                <Headphones size={18} />
                <div><small>Books &amp; support</small><span>{SUPPORT_EMAIL}</span></div>
              </a>
            </div>
          </div>

          <div>
            <h3 className="tt-foot-h">Explore</h3>
            <ul className="tt-foot-list">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}><Link to={l.href} className="tt-foot-link">{l.name}</Link></li>
              ))}
            </ul>
          </div>

          <div className="tt-foot-col--books">
            <h3 className="tt-foot-h">Books</h3>
            <ul className="tt-foot-list">
              {BOOK_LINKS.map((b) => (
                <li key={b.href}><Link to={b.href} className="tt-foot-link">{b.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="tt-foot-h">Legal</h3>
            <ul className="tt-foot-list">
              {LEGAL_LINKS.map((l) => (
                <li key={l.href}><Link to={l.href} className="tt-foot-link">{l.name}</Link></li>
              ))}
            </ul>
          </div>
        </nav>
        </div>

        <div className="tt-foot-bar">
         <div className="tt-foot-bar-in">
          <span>© {year} Target Trek. All rights reserved.</span>
          <span>Payment or access issue? Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></span>
         </div>
        </div>
       </div>
      </div>
    </footer>
  );
}
