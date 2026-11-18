import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  CalendarCheck,
  ChevronRight,
  Code2,
  FileText,
  Gift,
  Home,
  Info,
  Layers,
  Library,
  Mail,
  Newspaper,
  Search,
  Shield,
  Tag,
  Users,
  X,
} from "lucide-react";

import "./notFound.css";

/* =====================================================
   NOT FOUND (404)
   Shows the path that was asked for, guesses the page
   the visitor probably meant, and lets them search every
   main destination on the site.
===================================================== */

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Geist+Mono:wght@400;600&family=Manrope:wght@500;600;700;800&display=swap";

const readTheme = () => {
  if (typeof window === "undefined") return "light";
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

const GROUPS = [
  {
    title: "Prepare for interviews",
    items: [
      { to: "/books", Icon: BookOpen, name: "Ebooks", text: "System design, Java, SQL, cloud, GenAI", keys: "book books ebook pdf" },
      { to: "/books/bundle-offers", Icon: Tag, name: "Bundle offers", text: "Buy several books and save", keys: "bundle offer combo discount deal" },
      { to: "/book/all-books", Icon: Library, name: "All Access", text: "The whole library in one purchase", keys: "all access library every book" },
      { to: "/resources", Icon: Layers, name: "Free resources", text: "HLD, SQL and API guides", keys: "resources hld sql api free guide learn" },
      { to: "/learn", Icon: Code2, name: "Learn", text: "Start here: topics and study paths", keys: "learn home study" },
    ],
  },
  {
    title: "Practise and get hired",
    items: [
      { to: "/resume-review", Icon: FileText, name: "Resume Lab", text: "Resume review and AI scoring", keys: "resume cv review ats lab builder" },
      { to: "/mock-interviews", Icon: CalendarCheck, name: "Mock interviews", text: "Book a live technical mock", keys: "mock interview booking practice" },
      { to: "/prep-buddy", Icon: Users, name: "Prep Buddy", text: "Find an interview prep partner", keys: "prep buddy arena partner match" },
      { to: "/interviews", Icon: Briefcase, name: "Interview experiences", text: "Real questions from real rounds", keys: "interview experience questions company" },
    ],
  },
  {
    title: "More from Target Trek",
    items: [
      { to: "/memories", Icon: Gift, name: "Memories", text: "Personalised memory pages", keys: "memories birthday gift" },
      { to: "/blogs", Icon: Newspaper, name: "Blog", text: "Articles and guides", keys: "blog blogs article post" },
      { to: "/about", Icon: Info, name: "About", text: "Who we are", keys: "about team" },
      { to: "/contact", Icon: Mail, name: "Contact", text: "Questions and support", keys: "contact help support email" },
      { to: "/privacy-policy", Icon: Shield, name: "Policies", text: "Privacy, terms and refunds", keys: "privacy terms refund policy legal" },
    ],
  },
];

const ALL = GROUPS.flatMap((g) => g.items);

/* small edit-distance, used to guess the page the visitor meant */
const distance = (a, b) => {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
};

const guess = (path) => {
  const clean = path.toLowerCase().replace(/\/+$/, "") || "/";
  if (clean === "/") return null;
  const words = clean.split(/[^a-z0-9]+/).filter((w) => w.length > 3);
  let best = null;
  for (const it of ALL) {
    const d = distance(clean, it.to) / Math.max(clean.length, it.to.length);
    const hit = words.some((w) => it.keys.split(" ").some((k) => k.length > 3 && (k.startsWith(w) || w.startsWith(k) || distance(w, k) <= 1)));
    const score = hit ? d - 0.4 : d;
    if (!best || score < best.score) best = { it, score };
  }
  return best && best.score < 0.3 ? best.it : null;
};

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [theme, setTheme] = useState(readTheme);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    setTheme(readTheme());
    const onTheme = (e) => {
      const t = e?.detail?.theme;
      if (t === "dark" || t === "light") setTheme(t);
    };
    const onStorage = (e) => {
      if (e.key === THEME_KEY) setTheme(readTheme());
    };
    window.addEventListener(THEME_EVENT, onTheme);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(THEME_EVENT, onTheme);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  /* "/" focuses the search box */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const asked = `${pathname}${search}`;
  const meant = useMemo(() => guess(pathname), [pathname]);

  const q = query.trim().toLowerCase();
  const groups = useMemo(
    () =>
      GROUPS.map((g) => ({
        ...g,
        items: g.items.filter((it) => !q || `${it.name} ${it.text} ${it.keys} ${it.to}`.toLowerCase().includes(q)),
      })).filter((g) => g.items.length),
    [q]
  );

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const reportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Broken link on Target Trek")}&body=${encodeURIComponent(
    `Hello Target Trek Support,\n\nThis link didn't work for me:\nhttps://www.targettrek.in${asked}\n\nWhere I found it (page, email, search result):\n\nThank you.`
  )}`;

  return (
    <div className="nf" data-theme={theme}>
      <Helmet>
        <title>Page not found (404) | Target Trek</title>
        <meta name="description" content="This page doesn't exist on Target Trek. Find ebooks, Resume Lab, mock interviews, Prep Buddy and free resources from here." />
        <meta name="robots" content="noindex,follow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </Helmet>

      <main className="nf-wrap">
        <section className="nf-top" aria-labelledby="nf-h">
          <div>
            <span className="nf-code">
              <i aria-hidden />
              Error 404 · Page not found
            </span>
            <h1 id="nf-h" className="nf-h1">
              This page took a <span className="nf-mark">wrong turn.</span>
            </h1>
            <p className="nf-lead">
              The link may be old, mistyped, or the page has moved. Nothing is broken on your side. Let&apos;s get you to the
              right place.
            </p>

            {meant && (
              <p className="nf-suggest">
                <span>Did you mean</span>
                <Link to={meant.to}>
                  {meant.name}
                  <ArrowRight size={16} aria-hidden />
                </Link>
              </p>
            )}

            <div className="nf-actions">
              <Link to="/" className="nf-btn nf-btn-primary">
                <Home size={18} aria-hidden /> Go to homepage
              </Link>
              <button type="button" className="nf-btn nf-btn-ghost" onClick={goBack}>
                <ArrowLeft size={18} aria-hidden /> Go back
              </button>
            </div>
          </div>

          <div className="nf-term" role="img" aria-label={`The page ${asked} returned 404 not found`}>
            <div className="nf-term-bar" aria-hidden>
              <i />
              <i />
              <i />
              <span>targettrek.in</span>
            </div>
            <div className="nf-term-body" aria-hidden>
              <div className="nf-big">
                <b>
                  4<span>0</span>4
                </b>
                <em>not found</em>
              </div>
              <p>
                <span className="k">GET</span> <span className="v">{asked}</span>
              </p>
              <p>
                <span className="k">Host:</span> <span className="v">www.targettrek.in</span>
              </p>
              <hr />
              <p className="bad">HTTP/1.1 404 Not Found</p>
              <p className="c"># the page you asked for isn&apos;t here</p>
              <p>
                <span className="ok">→ try</span> <span className="v">{meant ? meant.to : "/books"}</span> <span className="nf-cursor" />
              </p>
            </div>
          </div>
        </section>

        <section className="nf-find" aria-labelledby="nf-find-h">
          <div className="nf-find-head">
            <div>
              <span className="nf-eyebrow">Find your way</span>
              <h2 id="nf-find-h" className="nf-h2">Where were you headed?</h2>
            </div>
          </div>

          <label className="nf-search">
            <Search size={19} aria-hidden />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages: books, resume, mock interview…"
              aria-label="Search Target Trek pages"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                <X size={17} aria-hidden />
              </button>
            ) : (
              <kbd aria-hidden>/</kbd>
            )}
          </label>

          {groups.length ? (
            <div className="nf-groups">
              {groups.map((g) => (
                <div key={g.title} className="nf-group">
                  <h3>{g.title}</h3>
                  <ul>
                    {g.items.map(({ to, Icon, name, text }) => (
                      <li key={to}>
                        <Link to={to} className="nf-dest">
                          <span className="nf-ico">
                            <Icon size={19} aria-hidden />
                          </span>
                          <div>
                            <b>{name}</b>
                            <small>{text}</small>
                          </div>
                          <ChevronRight size={18} className="nf-go" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="nf-none" role="status">
              No page matches <b>&ldquo;{query}&rdquo;</b>. Try &ldquo;books&rdquo;, &ldquo;resume&rdquo; or &ldquo;interview&rdquo;, or
              email us and we&apos;ll point you to it.
            </p>
          )}
        </section>

        <div className="nf-help">
          <p>
            <b>Followed a link from our site or an email?</b> Tell us and we&apos;ll fix it. We&apos;ll include the address you
            tried automatically.
          </p>
          <a href={reportHref} className="nf-btn nf-btn-ghost">
            <Mail size={17} aria-hidden /> Report broken link
          </a>
        </div>
      </main>
    </div>
  );
}
