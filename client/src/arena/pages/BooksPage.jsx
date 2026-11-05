import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpen, Check, Lightbulb, Send, Sparkles, Swords } from "lucide-react";

import { useArena } from "../ArenaContext";
import { membershipHttp, errMsg } from "../api";
import { Badge, Button, Card, EmptyState, Spinner } from "../ui";

/*
  BOOKS (book-pack members only)
    - every book currently on Target Trek
    - request / suggest a new book
  The API checks pack membership itself; the tab is only the friendly side of it.
*/

const AREAS = ["System Design", "Java", "Spring Boot", "DSA", "GenAI", "SQL", "DevOps", "Cloud", "Frontend", "Other"];

const STATUS_TONE = { new: "slate", planned: "brand", published: "emerald", declined: "rose" };

const inputClass =
  "block w-full rounded-xl border border-stone-300 dk:border-[#5a4336] bg-white dk:bg-[#241b15] px-3.5 py-2.5 text-sm text-[#29201b] dk:text-[#fff7ed] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dk:focus:ring-orange-500/20";

export default function BooksPage() {
  const { me } = useArena();
  const lifetime = Boolean(me?.pack?.lifetime);

  const [library, setLibrary] = useState(null);
  const [mine, setMine] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const [lib, sug, summary] = await Promise.all([
        membershipHttp.get("/library"),
        membershipHttp.get("/suggestions"),
        membershipHttp.get("/me"),
      ]);
      const joined = (summary.data.data.packs || []).filter((p) => p.plan === "all_current").map((p) => new Date(p.activatedAt).getTime());
      setLibrary({ ...lib.data.data, joinedAt: joined.length ? Math.min(...joined) : null });
      setMine(sug.data.data || []);
    } catch (e) {
      setLoadError(errMsg(e));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const { data } = await membershipHttp.post("/suggestions", { title, topic, details });
      toast.success(data.message || "Thanks! Your suggestion has been sent.", { id: "book-suggest" });
      setTitle("");
      setTopic("");
      setDetails("");
      const sug = await membershipHttp.get("/suggestions");
      setMine(sug.data.data || []);
    } catch (err) {
      toast.error(errMsg(err), { id: "book-suggest" });
    } finally {
      setSending(false);
    }
  };

  if (!me?.pack?.packMember) {
    return (
      <EmptyState icon={BookOpen} title="Books are for pack members">
        Requesting new books is part of the All Books and Lifetime packs. If you bought one, sign in with the email you used at checkout.
        <div className="mt-4"><Link to="/books" className="font-semibold text-orange-700 underline dk:text-orange-300">See the packs</Link></div>
      </EmptyState>
    );
  }

  // Lifetime owns everything. An All Books member owns what existed when they joined.
  const owned = (book) => lifetime || !library?.joinedAt || new Date(book.createdAt).getTime() <= library.joinedAt;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* ---------- all current books ---------- */}
      <section aria-labelledby="books-title">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 id="books-title" className="text-lg font-bold text-[#29201b] dk:text-[#fff7ed]">All books right now</h2>
          <Badge tone="brand">{lifetime ? "Lifetime pack" : "All Books pack"}</Badge>
        </div>
        <p className="mb-4 text-sm text-stone-600 dk:text-[#d6c4b8]">
          {lifetime
            ? "Everything here is yours, and every future book is emailed to you free."
            : "Books from the day you joined are included. Newer books are marked, and you get an email for each one."}
        </p>

        {loadError && (
          <Card className="p-4 text-sm text-rose-700 dk:text-rose-300">
            {loadError} <button type="button" onClick={load} className="font-semibold underline">Try again</button>
          </Card>
        )}
        {!loadError && !library && <Spinner label="Loading the books" />}

        {library && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {library.books.map((b) => {
              const has = owned(b);
              return (
                <li key={b._id}>
                  <Card className="flex h-full gap-3 p-3">
                    <div className="grid h-24 w-[72px] shrink-0 place-items-center overflow-hidden rounded-lg bg-orange-50 dk:bg-orange-500/10">
                      {b.coverPageUrl ? <img src={b.coverPageUrl} alt="" loading="lazy" className="h-full w-full object-cover" /> : <BookOpen className="h-6 w-6 text-orange-600" aria-hidden />}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="text-sm font-semibold text-[#29201b] dk:text-[#fff7ed]">{b.title}</p>
                      {b.subtitle && <p className="line-clamp-2 text-xs text-stone-500 dk:text-[#b9a79c]">{b.subtitle}</p>}
                      {Number(b.matches) > 0 && (
                        <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-700 dk:bg-orange-500/10 dk:text-orange-300">
                          <Swords className="h-3 w-3" aria-hidden /> {b.matches} {Number(b.matches) === 1 ? "match" : "matches"}
                        </span>
                      )}
                      <div className="mt-auto pt-2 text-xs">
                        {has ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dk:text-emerald-300"><Check className="h-3.5 w-3.5" aria-hidden /> In your pack</span>
                        ) : (
                          <Link to={b.redirectUrl || "/books"} className="inline-flex items-center gap-1 font-semibold text-orange-700 underline dk:text-orange-300">
                            <Sparkles className="h-3.5 w-3.5" aria-hidden /> New since you joined
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ---------- request a book ---------- */}
      <section aria-labelledby="suggest-title" className="lg:sticky lg:top-32 lg:self-start">
        <Card className="p-5">
          <h2 id="suggest-title" className="flex items-center gap-2 text-lg font-bold text-[#29201b] dk:text-[#fff7ed]">
            <Lightbulb className="h-5 w-5 text-orange-600" aria-hidden /> Request a new book
          </h2>
          <p className="mt-1 text-sm text-stone-600 dk:text-[#d6c4b8]">Tell us which IT topic you are preparing for. We read every request.</p>

          <form onSubmit={submit} className="mt-4 space-y-3">
            <div>
              <label htmlFor="bk-title" className="mb-1 block text-sm font-medium text-stone-800 dk:text-[#ffedd5]">Book or topic</label>
              <input id="bk-title" value={title} onChange={(e) => setTitle(e.target.value)} minLength={3} maxLength={120} required placeholder="e.g. Kafka interview handbook" className={inputClass} />
            </div>
            <div>
              <label htmlFor="bk-topic" className="mb-1 block text-sm font-medium text-stone-800 dk:text-[#ffedd5]">Area <span className="font-normal text-stone-400">(optional)</span></label>
              <select id="bk-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClass}>
                <option value="">Choose…</option>
                {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="bk-details" className="mb-1 block text-sm font-medium text-stone-800 dk:text-[#ffedd5]">What should it cover? <span className="font-normal text-stone-400">(optional)</span></label>
              <textarea id="bk-details" value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1000} rows={4} placeholder="Company, level, topics you struggle with…" className={inputClass} />
            </div>
            <Button type="submit" loading={sending} disabled={title.trim().length < 3} className="w-full">
              <Send className="h-4 w-4" aria-hidden /> Send request
            </Button>
          </form>

          {mine.length > 0 && (
            <div className="mt-5 border-t border-[#f0ded0] pt-4 dk:border-[#443127]">
              <h3 className="mb-2 text-sm font-semibold text-stone-800 dk:text-[#ffedd5]">Your requests</h3>
              <ul className="space-y-2">
                {mine.map((s) => (
                  <li key={s._id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-stone-700 dk:text-[#ead9cc]">{s.title}</span>
                    <Badge tone={STATUS_TONE[s.status] || "slate"} className="capitalize">{s.status}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
