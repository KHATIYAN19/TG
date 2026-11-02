/* eslint-disable react/prop-types -- small internal helper components */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import toast, { Toaster } from "react-hot-toast";

import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  ImageIcon,
  Link2,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Send,
  Sparkles,
  Square,
  Trash2,
  Wand2,
  XCircle,
} from "lucide-react";

import BASE_URL from "../utils/Url.js";
import RichTextEditor from "../component/RichTextEditor.jsx";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const BLOG_API = `${BASE_URL}/blogs`;

const CATEGORIES = [
  "backend",
  "frontend",
  "system design",
  "genai",
  "tech news",
  "java",
  "devops",
  "security",
  "career",
  "interview prep",
];

const LENGTHS = [
  { id: "short", label: "Short", hint: "800-1200 words" },
  { id: "medium", label: "Medium", hint: "1500-2200 words" },
  { id: "long", label: "Long", hint: "2800-3800 words" },
];

const STEPS = [
  { id: "context", label: "Load site pages" },
  { id: "research", label: "Research the web" },
  { id: "outline", label: "Plan the sections" },
  { id: "write", label: "Write the article" },
  { id: "expand", label: "Add depth if thin" },
  { id: "review", label: "Fact-check" },
  { id: "polish", label: "Validate links & format" },
  { id: "cover", label: "Cover image" },
];

const EXAMPLES = [
  "Explain how Kafka consumer group rebalancing works and how to avoid rebalance storms in production",
  "What's new in React this month and what it means for large frontend codebases",
  "Latest GenAI agent frameworks news, with a comparison of how they handle tool calling",
  "How to design a rate limiter for a public API: token bucket vs sliding window, with interview angle",
];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const readTheme = () => {
  try {
    return window.localStorage.getItem(THEME_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 150);

/*
 * The raw model stream is shown as TEXT only (never as HTML): the agent reads
 * web pages, which can contain hidden instructions, so nothing the model emits
 * is rendered as markup until the server has sanitised it.
 */
const htmlToReadableText = (html = "") =>
  html
    .replace(/<\/(p|h[1-6]|li|blockquote|pre)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

/*
|--------------------------------------------------------------------------
| SSE over fetch (EventSource cannot POST or send an Authorization header)
|--------------------------------------------------------------------------
*/

async function streamGenerate({ body, token, signal, onEvent }) {
  const res = await fetch(`${BLOG_API}/admin/agent/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));

    throw new Error(
      json?.error?.message ||
        json?.message ||
        `Request failed (${res.status})`
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let index;

    while ((index = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, index);

      buffer = buffer.slice(index + 2);

      let event = "message";
      const data = [];

      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) {
          event = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          data.push(line.slice(5).trim());
        }
      }

      if (!data.length) {
        continue; // heartbeat comment
      }

      try {
        onEvent(event, JSON.parse(data.join("\n")));
      } catch (error) {
        if (!(error instanceof SyntaxError)) {
          throw error;
        }
      }
    }
  }
}

/*
|--------------------------------------------------------------------------
| SMALL UI PIECES
|--------------------------------------------------------------------------
*/

const Toggle = ({ checked, onChange, label, hint, disabled, c }) => (
  <label
    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
      checked ? c.toggleOn : c.toggleOff
    } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
  >
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 h-4 w-4 accent-[#EA580C]"
    />

    <span>
      <span className={`block text-sm font-bold ${c.primary}`}>
        {label}
      </span>

      <span className={`block text-xs leading-5 ${c.muted}`}>
        {hint}
      </span>
    </span>
  </label>
);

const StepIcon = ({ state }) => {
  if (state === "start") {
    return <Loader2 size={16} className="animate-spin text-[#EA580C]" />;
  }

  if (state === "done") {
    return <CheckCircle2 size={16} className="text-emerald-500" />;
  }

  if (state === "error") {
    return <XCircle size={16} className="text-red-500" />;
  }

  if (state === "skip") {
    return <span className="block h-1.5 w-3 rounded bg-slate-400/50" />;
  }

  return <span className="block h-2 w-2 rounded-full bg-slate-400/40" />;
};

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

const BlogAgentPage = () => {
  const navigate = useNavigate();

  const { token } = useSelector((state) => state?.auth || {});

  /* ---------------- theme ---------------- */

  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const onTheme = (event) => {
      const next = event?.detail?.theme;
      setTheme(next === "dark" || next === "light" ? next : readTheme());
    };

    const onStorage = (event) => {
      if (event.key === THEME_KEY) {
        setTheme(readTheme());
      }
    };

    window.addEventListener(THEME_EVENT, onTheme);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(THEME_EVENT, onTheme);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const dark = theme === "dark";

  const c = useMemo(
    () => ({
      page: dark ? "bg-[#080D14] text-[#F4F7FA]" : "bg-[#F5F9FC] text-[#0B1524]",
      card: dark ? "border-[#1E2C3D] bg-[#0C131D]" : "border-[#E1E9F1] bg-white",
      soft: dark ? "bg-[#101924]" : "bg-[#F8FAFC]",
      border: dark ? "border-[#1E2C3D]" : "border-[#E1E9F1]",
      primary: dark ? "text-[#F4F7FA]" : "text-[#0B1524]",
      secondary: dark ? "text-[#9AA9BA]" : "text-[#5B6B82]",
      muted: dark ? "text-[#708196]" : "text-[#7C8CA3]",
      accent: dark ? "text-[#FB923C]" : "text-[#EA580C]",
      input: dark
        ? "border-[#1E2C3D] bg-[#080D14] text-[#F4F7FA] placeholder:text-[#708196] focus:border-[#FB923C] focus:ring-orange-900/30"
        : "border-[#E1E9F1] bg-[#F8FAFC] text-[#0B1524] placeholder:text-[#7C8CA3] focus:border-[#EA580C] focus:ring-orange-100",
      toggleOn: dark
        ? "border-[#9A3412] bg-orange-950/30"
        : "border-[#FDBA74] bg-[#FFF7ED]",
      toggleOff: dark
        ? "border-[#1E2C3D] bg-[#101924]"
        : "border-[#E1E9F1] bg-white",
    }),
    [dark]
  );

  const inputClass = `w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-4 ${c.input}`;

  /* ---------------- form ---------------- */

  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("");
  const [length, setLength] = useState("medium");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [research, setResearch] = useState(true);
  const [factCheck, setFactCheck] = useState(true);
  const [cover, setCover] = useState(true);

  /* ---------------- run state ---------------- */

  const [phase, setPhase] = useState("idle"); // idle | running | review | saving
  const [steps, setSteps] = useState({});
  const [stepNotes, setStepNotes] = useState({});
  const [searches, setSearches] = useState([]);
  const [meta, setMeta] = useState(null);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const [draft, setDraft] = useState(null);
  const [tagsText, setTagsText] = useState("");
  const [keywordsText, setKeywordsText] = useState("");

  const controllerRef = useRef(null);
  const bufferRef = useRef("");
  const rafRef = useRef(0);
  const paneRef = useRef(null);
  const startedAtRef = useRef(0);
  const savedRef = useRef(false);
  const coverIdRef = useRef("");

  /* ---------------- helpers ---------------- */

  const flushStream = useCallback(() => {
    rafRef.current = 0;
    setStreamText(bufferRef.current);
  }, []);

  const pushDelta = useCallback(
    (text) => {
      bufferRef.current += text;

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flushStream);
      }
    },
    [flushStream]
  );

  /* keep the live pane scrolled to the newest text */
  useEffect(() => {
    const el = paneRef.current;

    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [streamText]);

  /* elapsed timer */
  useEffect(() => {
    if (phase !== "running") {
      return undefined;
    }

    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000)),
      1000
    );

    return () => clearInterval(timer);
  }, [phase]);

  /* stop everything if the admin leaves the page */
  useEffect(
    () => () => {
      controllerRef.current?.abort();
      cancelAnimationFrame(rafRef.current);
    },
    []
  );

  /* warn before losing an unsaved draft */
  useEffect(() => {
    if (phase !== "review" && phase !== "running") {
      return undefined;
    }

    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);

    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  const releaseCover = useCallback(
    async (publicId) => {
      if (!publicId || savedRef.current || !token) {
        return;
      }

      try {
        await axios.delete(`${BLOG_API}/admin/agent/cover`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { publicId },
        });
      } catch {
        /* best effort – an unused cover is harmless */
      }
    },
    [token]
  );

  /* ---------------- generate ---------------- */

  const handleEvent = useCallback(
    (event, data) => {
      if (event === "status") {
        setSteps((prev) => ({ ...prev, [data.step]: data.state }));

        setStepNotes((prev) => ({
          ...prev,
          [data.step]: data.message || prev[data.step] || "",
        }));
      } else if (event === "search") {
        if (data.query) {
          setSearches((prev) =>
            prev.includes(data.query) ? prev : [...prev, data.query].slice(-12)
          );
        }
      } else if (event === "meta") {
        setMeta(data);
      } else if (event === "delta") {
        pushDelta(data.text || "");
      } else if (event === "draft") {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;

        coverIdRef.current = data.cloudinaryPublicId || "";

        setDraft(data);
        setTagsText((data.tags || []).join(", "));
        setKeywordsText((data.seo?.keywords || []).join(", "));
        setPhase("review");
      } else if (event === "error") {
        throw new Error(data.message || "Generation failed.");
      }
    },
    [pushDelta]
  );

  const handleGenerate = async () => {
    if (phase === "running") {
      return;
    }

    if (prompt.trim().length < 10) {
      toast.error("Describe the topic in at least 10 characters.");
      return;
    }

    if (!token) {
      toast.error("Please log in again.");
      return;
    }

    // a previous unused cover should not be left behind
    if (coverIdRef.current) {
      releaseCover(coverIdRef.current);
      coverIdRef.current = "";
    }

    const controller = new AbortController();

    controllerRef.current = controller;
    startedAtRef.current = Date.now();
    bufferRef.current = "";
    savedRef.current = false;

    setPhase("running");
    setSteps({});
    setStepNotes({});
    setSearches([]);
    setMeta(null);
    setStreamText("");
    setDraft(null);
    setError("");
    setElapsed(0);

    try {
      await streamGenerate({
        body: {
          prompt: prompt.trim(),
          category,
          length,
          audience: audience.trim(),
          tone: tone.trim(),
          research,
          factCheck,
          cover,
        },
        token,
        signal: controller.signal,
        onEvent: handleEvent,
      });

      setPhase((current) => (current === "running" ? "idle" : current));
    } catch (err) {
      if (controller.signal.aborted) {
        setPhase("idle");
        toast("Generation stopped.");
        return;
      }

      setError(err.message || "Generation failed.");
      setPhase("idle");
      toast.error(err.message || "Generation failed.");
    }
  };

  const handleStop = () => {
    controllerRef.current?.abort();
  };

  /* ---------------- review edits ---------------- */

  const setField = (key, value) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const setSeo = (key, value) =>
    setDraft((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));

  const slugValid = draft ? SLUG_RE.test(draft.slug || "") : true;

  /* ---------------- save ---------------- */

  const handleSave = async (publish) => {
    if (!draft || phase === "saving") {
      return;
    }

    if (!SLUG_RE.test(draft.slug || "")) {
      toast.error("Slug must contain lowercase letters, numbers and hyphens only.");
      return;
    }

    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!tags.length || tags.length > 15) {
      toast.error("Add between 1 and 15 tags.");
      return;
    }

    if (!draft.imageUrl) {
      toast.error("Add a cover image URL (or generate one) before saving.");
      return;
    }

    setPhase("saving");

    const toastId = toast.loading(publish ? "Publishing..." : "Saving draft...");

    try {
      const { data } = await axios.post(
        `${BLOG_API}/admin/agent/save`,
        {
          title: draft.title,
          slug: draft.slug,
          excerpt: draft.excerpt,
          content: draft.content,
          author: draft.author || "Target Trek Editorial",
          category: draft.category,
          tags,
          altText: draft.altText || "",
          imageUrl: draft.imageUrl,
          cloudinaryPublicId: draft.cloudinaryPublicId || "",
          isPublished: Boolean(publish),
          isFeatured: false,
          editorChoice: false,
          seo: {
            metaTitle: draft.seo?.metaTitle || "",
            metaDescription: draft.seo?.metaDescription || "",
            keywords: keywordsText
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean),
            canonicalUrl: draft.seo?.canonicalUrl || "",
            ogImageUrl: draft.seo?.ogImageUrl || draft.imageUrl,
            noIndex: Boolean(draft.seo?.noIndex),
          },
          sources: draft.sources || [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data?.success) {
        throw new Error("Unable to save the blog.");
      }

      savedRef.current = true;

      toast.success(data.message || "Saved.", { id: toastId });

      navigate("/blog-manage");
    } catch (err) {
      setPhase("review");

      toast.error(
        err.response?.data?.error?.message ||
          err.response?.data?.message ||
          err.message ||
          "Save failed.",
        { id: toastId }
      );
    }
  };

  const handleDiscard = async () => {
    if (!window.confirm("Discard this draft? It has not been saved.")) {
      return;
    }

    await releaseCover(coverIdRef.current);

    coverIdRef.current = "";

    setDraft(null);
    setMeta(null);
    setStreamText("");
    setSteps({});
    setSearches([]);
    setPhase("idle");
  };

  /* ---------------- derived ---------------- */

  const liveText = useMemo(() => htmlToReadableText(streamText), [streamText]);

  const mm = String(Math.floor(elapsed / 60)).padStart(1, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const running = phase === "running";
  const reviewing = phase === "review" || phase === "saving";

  /* ---------------- render ---------------- */

  return (
    <main className={`min-h-screen pb-24 pt-24 transition-colors ${c.page}`}>
      <Helmet>
        <title>AI Blog Writer | Target Trek Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Toaster position="top-center" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ------------------------------------------------ header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              to="/blog-manage"
              className={`inline-flex items-center gap-2 text-sm font-semibold ${c.accent}`}
            >
              <ArrowLeft size={16} />
              Back to blogs
            </Link>

            <h1 className="mt-3 flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EA580C] text-white">
                <Sparkles size={22} />
              </span>
              AI Blog Writer
            </h1>

            <p className={`mt-2 max-w-2xl text-sm leading-6 ${c.secondary}`}>
              Give the agent a topic. It researches the web, writes the article
              live, fact-checks it, adds real internal links and a cover image,
              then hands you an editable draft. Nothing is published until you
              say so.
            </p>
          </div>

          {running && (
            <div
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${c.card} ${c.accent}`}
            >
              <Loader2 size={15} className="animate-spin" />
              {mm}:{ss}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
          {/* ================================================== BRIEF */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className={`rounded-3xl border p-5 sm:p-6 ${c.card}`}>
              <label className={`text-sm font-bold ${c.primary}`} htmlFor="brief">
                What should the blog be about?
              </label>

              <textarea
                id="brief"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={running}
                rows={6}
                maxLength={4000}
                placeholder="e.g. Explain how consistent hashing works, why Redis Cluster uses hash slots instead, and how it shows up in system design interviews."
                className={`${inputClass} mt-2 resize-y leading-6`}
              />

              <div className={`mt-1 flex justify-between text-xs ${c.muted}`}>
                <span>Be specific: angle, audience, what to cover.</span>
                <span>{prompt.length}/4000</span>
              </div>

              {!prompt && (
                <div className="mt-3 space-y-1.5">
                  <p className={`text-xs font-bold uppercase tracking-wider ${c.muted}`}>
                    Try an example
                  </p>

                  {EXAMPLES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setPrompt(example)}
                      disabled={running}
                      className={`block w-full rounded-lg border px-3 py-2 text-left text-xs leading-5 transition hover:border-[#FDBA74] ${c.border} ${c.secondary}`}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <label className={`text-xs font-bold ${c.secondary}`}>Category</label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={running}
                    className={`${inputClass} mt-1.5`}
                  >
                    <option value="">Let the agent choose</option>

                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`text-xs font-bold ${c.secondary}`}>Length</label>

                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {LENGTHS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        disabled={running}
                        onClick={() => setLength(item.id)}
                        title={item.hint}
                        className={`rounded-xl border px-2 py-2 text-xs font-bold transition ${
                          length === item.id
                            ? "border-[#EA580C] bg-[#EA580C] text-white"
                            : `${c.border} ${c.secondary} hover:border-[#FDBA74]`
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-bold ${c.secondary}`}>
                    Audience (optional)
                  </label>

                  <input
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    disabled={running}
                    maxLength={200}
                    placeholder="e.g. backend devs with 2-5 years"
                    className={`${inputClass} mt-1.5`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-bold ${c.secondary}`}>
                    Tone (optional)
                  </label>

                  <input
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    disabled={running}
                    maxLength={100}
                    placeholder="e.g. practical, interview-focused"
                    className={`${inputClass} mt-1.5`}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                <Toggle
                  c={c}
                  checked={research}
                  disabled={running}
                  onChange={setResearch}
                  label="Research the web"
                  hint="Finds current facts and real source links. Turn off only for evergreen topics."
                />

                <Toggle
                  c={c}
                  checked={factCheck && research}
                  disabled={running || !research}
                  onChange={setFactCheck}
                  label="Fact-check pass"
                  hint="A second agent verifies every claim and removes anything unsupported."
                />

                <Toggle
                  c={c}
                  checked={cover}
                  disabled={running}
                  onChange={setCover}
                  label="Generate cover image"
                  hint="Creates a cover and uploads it to your media library."
                />
              </div>

              {running ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100"
                >
                  <Square size={16} />
                  Stop generating
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={phase === "saving"}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#EA580C] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#C2410C] disabled:opacity-60"
                >
                  {draft ? <RefreshCw size={16} /> : <Wand2 size={16} />}
                  {draft ? "Generate again" : "Generate blog"}
                </button>
              )}

              <p className={`mt-3 text-center text-xs ${c.muted}`}>
                Detailed articles take 3-6 minutes. Uses your OpenAI credits.
              </p>
            </div>
          </aside>

          {/* ================================================== WORKSPACE */}
          <section className="min-w-0 space-y-6">
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Generation failed</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* ------------------------------------------ idle empty state */}
            {phase === "idle" && !draft && !error && (
              <div
                className={`flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed p-8 text-center ${c.border} ${c.secondary}`}
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF7ED] text-[#EA580C]">
                  <Sparkles size={28} />
                </span>

                <p className={`mt-5 text-lg font-bold ${c.primary}`}>
                  Your article will be written here, live
                </p>

                <p className="mt-2 max-w-md text-sm leading-6">
                  You&apos;ll see each step as it happens: searches, writing,
                  fact-checking and link validation.
                </p>
              </div>
            )}

            {/* ------------------------------------------ progress + live */}
            {(running || (phase === "idle" && Object.keys(steps).length > 0)) && (
              <>
                <div className={`rounded-3xl border p-5 sm:p-6 ${c.card}`}>
                  <h2 className={`text-sm font-bold ${c.primary}`}>Progress</h2>

                  <ol className="mt-4 grid gap-3 sm:grid-cols-2" aria-live="polite">
                    {STEPS.map((step) => {
                      const state = steps[step.id];

                      return (
                        <li
                          key={step.id}
                          className={`flex items-start gap-3 rounded-xl border p-3 ${c.border} ${
                            state === "start" ? c.toggleOn : ""
                          }`}
                        >
                          <span className="mt-0.5">
                            <StepIcon state={state} />
                          </span>

                          <span className="min-w-0">
                            <span
                              className={`block text-sm font-bold ${
                                state ? c.primary : c.muted
                              }`}
                            >
                              {step.label}
                            </span>

                            {stepNotes[step.id] && (
                              <span className={`block truncate text-xs ${c.secondary}`}>
                                {stepNotes[step.id]}
                              </span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ol>

                  {searches.length > 0 && (
                    <div className="mt-5">
                      <p
                        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${c.muted}`}
                      >
                        <Globe size={13} />
                        Web searches
                      </p>

                      <ul className="mt-2 flex flex-wrap gap-2">
                        {searches.map((query) => (
                          <li
                            key={query}
                            className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${c.border} ${c.secondary}`}
                          >
                            <Search size={11} className="shrink-0" />
                            <span className="truncate">{query}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {(meta || streamText) && (
                  <div className={`overflow-hidden rounded-3xl border ${c.card}`}>
                    <div
                      className={`flex items-center justify-between border-b px-5 py-3 ${c.border}`}
                    >
                      <h2 className={`flex items-center gap-2 text-sm font-bold ${c.primary}`}>
                        <FileText size={15} className={c.accent} />
                        Writing live
                      </h2>

                      {running && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-[#EA580C]">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-[#EA580C]" />
                          streaming
                        </span>
                      )}
                    </div>

                    {meta && (
                      <div className={`border-b px-5 py-4 ${c.border}`}>
                        <p className={`text-xl font-black leading-snug ${c.primary}`}>
                          {meta.title}
                        </p>

                        {meta.excerpt && (
                          <p className={`mt-2 text-sm leading-6 ${c.secondary}`}>
                            {meta.excerpt}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(meta.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[#FFF7ED] px-2.5 py-0.5 text-xs font-bold text-[#C2410C]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      ref={paneRef}
                      className={`max-h-[460px] overflow-y-auto whitespace-pre-wrap px-5 py-4 text-[15px] leading-7 ${c.primary}`}
                    >
                      {liveText}

                      {running && (
                        <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-[#EA580C] align-middle" />
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ------------------------------------------ review */}
            {reviewing && draft && (
              <div className="space-y-6">
                {draft.warnings?.length > 0 && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="flex items-center gap-2 font-bold">
                      <AlertTriangle size={16} />
                      Check before publishing
                    </p>

                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {draft.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={`flex flex-wrap items-center gap-x-5 gap-y-1 rounded-2xl border px-5 py-3 text-xs font-semibold ${c.card} ${c.secondary}`}>
                  <span className="flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-500" />
                    {draft.stats?.words} words
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Link2 size={14} className={c.accent} />
                    {draft.stats?.internalLinks} internal links
                  </span>

                  <span className="flex items-center gap-1.5">
                    <ExternalLink size={14} className={c.accent} />
                    {draft.stats?.externalLinks} external links
                  </span>

                  <span className="flex items-center gap-1.5">
                    <ImageIcon size={14} className={c.accent} />
                    {draft.imageUrl ? "Cover ready" : "No cover"}
                  </span>
                </div>

                {/* ---- cover + core fields ---- */}
                <div className={`rounded-3xl border p-5 sm:p-6 ${c.card}`}>
                  <h2 className={`text-sm font-bold ${c.primary}`}>Basics</h2>

                  <div className="mt-4 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <div>
                      <div
                        className={`flex aspect-[3/2] items-center justify-center overflow-hidden rounded-2xl border ${c.border} ${c.soft}`}
                      >
                        {draft.imageUrl ? (
                          <img
                            src={draft.imageUrl}
                            alt={draft.altText || draft.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={30} className={c.muted} />
                        )}
                      </div>

                      <label className={`mt-3 block text-xs font-bold ${c.secondary}`}>
                        Cover image URL
                      </label>

                      <input
                        value={draft.imageUrl || ""}
                        onChange={(e) => {
                          setField("imageUrl", e.target.value);
                          setSeo("ogImageUrl", e.target.value);
                        }}
                        placeholder="https://…"
                        className={`${inputClass} mt-1.5`}
                      />

                      <label className={`mt-3 block text-xs font-bold ${c.secondary}`}>
                        Image alt text
                      </label>

                      <input
                        value={draft.altText || ""}
                        onChange={(e) => setField("altText", e.target.value)}
                        maxLength={200}
                        className={`${inputClass} mt-1.5`}
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`text-xs font-bold ${c.secondary}`}>Title</label>

                        <input
                          value={draft.title}
                          onChange={(e) => setField("title", e.target.value)}
                          maxLength={180}
                          className={`${inputClass} mt-1.5 font-bold`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <label className={`text-xs font-bold ${c.secondary}`}>Slug</label>

                          <button
                            type="button"
                            onClick={() => setField("slug", slugify(draft.title))}
                            className={`text-xs font-bold ${c.accent}`}
                          >
                            Make from title
                          </button>
                        </div>

                        <input
                          value={draft.slug}
                          onChange={(e) => setField("slug", e.target.value.toLowerCase())}
                          className={`${inputClass} mt-1.5 ${
                            slugValid ? "" : "!border-red-400"
                          }`}
                        />

                        {!slugValid && (
                          <p className="mt-1 text-xs text-red-500">
                            Lowercase letters, numbers and hyphens only.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={`text-xs font-bold ${c.secondary}`}>Excerpt</label>

                        <textarea
                          value={draft.excerpt}
                          onChange={(e) => setField("excerpt", e.target.value)}
                          rows={3}
                          maxLength={500}
                          className={`${inputClass} mt-1.5 resize-y`}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className={`text-xs font-bold ${c.secondary}`}>Category</label>

                          <input
                            list="agent-categories"
                            value={draft.category}
                            onChange={(e) => setField("category", e.target.value.toLowerCase())}
                            className={`${inputClass} mt-1.5`}
                          />

                          <datalist id="agent-categories">
                            {CATEGORIES.map((item) => (
                              <option key={item} value={item} />
                            ))}
                          </datalist>
                        </div>

                        <div>
                          <label className={`text-xs font-bold ${c.secondary}`}>
                            Tags (comma separated)
                          </label>

                          <input
                            value={tagsText}
                            onChange={(e) => setTagsText(e.target.value)}
                            className={`${inputClass} mt-1.5`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---- content editor ---- */}
                <div className={`rounded-3xl border p-5 sm:p-6 ${c.card}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className={`text-sm font-bold ${c.primary}`}>Article</h2>

                    <span className={`text-xs ${c.muted}`}>
                      Edit freely – this is the same editor as Add Blog.
                    </span>
                  </div>

                  <RichTextEditor
                    value={draft.content}
                    onChange={(html) => setField("content", html)}
                    isDark={dark}
                    minHeight={520}
                  />
                </div>

                {/* ---- SEO ---- */}
                <div className={`rounded-3xl border p-5 sm:p-6 ${c.card}`}>
                  <h2 className={`text-sm font-bold ${c.primary}`}>SEO</h2>

                  <div className="mt-4 grid gap-4">
                    <div>
                      <div className="flex justify-between">
                        <label className={`text-xs font-bold ${c.secondary}`}>Meta title</label>
                        <span className={`text-xs ${c.muted}`}>
                          {(draft.seo?.metaTitle || "").length}/70
                        </span>
                      </div>

                      <input
                        value={draft.seo?.metaTitle || ""}
                        onChange={(e) => setSeo("metaTitle", e.target.value)}
                        maxLength={70}
                        className={`${inputClass} mt-1.5`}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <label className={`text-xs font-bold ${c.secondary}`}>
                          Meta description
                        </label>
                        <span className={`text-xs ${c.muted}`}>
                          {(draft.seo?.metaDescription || "").length}/180
                        </span>
                      </div>

                      <textarea
                        value={draft.seo?.metaDescription || ""}
                        onChange={(e) => setSeo("metaDescription", e.target.value)}
                        maxLength={180}
                        rows={2}
                        className={`${inputClass} mt-1.5 resize-y`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-bold ${c.secondary}`}>
                        Keywords (comma separated)
                      </label>

                      <input
                        value={keywordsText}
                        onChange={(e) => setKeywordsText(e.target.value)}
                        className={`${inputClass} mt-1.5`}
                      />
                    </div>
                  </div>
                </div>

                {/* ---- sources ---- */}
                {draft.sources?.length > 0 && (
                  <div className={`rounded-3xl border p-5 sm:p-6 ${c.card}`}>
                    <h2 className={`text-sm font-bold ${c.primary}`}>
                      Sources used ({draft.sources.length})
                    </h2>

                    <ul className="mt-3 space-y-2">
                      {draft.sources.map((source) => (
                        <li key={source.url}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 text-sm font-semibold hover:underline ${c.accent}`}
                          >
                            <ExternalLink size={14} />
                            {source.title || source.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* ---- actions ---- */}
                <div
                  className={`sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur ${
                    dark ? "border-[#1E2C3D] bg-[#0C131D]/95" : "border-[#E1E9F1] bg-white/95"
                  }`}
                >
                  <button
                    type="button"
                    onClick={handleDiscard}
                    disabled={phase === "saving"}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    Discard
                  </button>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleSave(false)}
                      disabled={phase === "saving"}
                      className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition hover:border-[#FDBA74] disabled:opacity-60 ${c.border} ${c.primary}`}
                    >
                      {phase === "saving" ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save as draft
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSave(true)}
                      disabled={phase === "saving"}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#EA580C] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#C2410C] disabled:opacity-60"
                    >
                      <Send size={16} />
                      Publish now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default BlogAgentPage;
