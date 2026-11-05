import { useCallback, useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BellRing, BookOpen, Check, ChevronDown, Gift, Lightbulb, Swords } from "lucide-react";

import BASE_URL from "../utils/Url";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";

/* =====================================================
   BOOK PACKS (shared by the Books page and the pack pages)

   Everything comes from GET /api/membership/plans, which reads the Book
   rows marked as a pack in /admin/books. Change a price, the books inside
   or the Prep Arena matches there and every page here shows it on the next
   load. A pack with 0 matches simply shows no matches anywhere.
===================================================== */

export const PLANS_API = `${String(BASE_URL || "").replace(/\/+$/, "")}/api/membership`;

export const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

export const errText = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export function usePacks() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${PLANS_API}/plans`, { signal, timeout: 20000 });
      setData(res.data?.data || null);
    } catch (e) {
      if (axios.isCancel(e)) return;
      setError(errText(e, "Unable to load the packs."));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { data, loading, error, reload: () => load() };
}

const planLabel = (plan) => (plan === "lifetime" ? "Lifetime pack" : "All Books pack");

const creditWord = (n) => (Number(n) === 1 ? "credit" : "credits");

/* Dropdown: click to open and see every book inside the pack, by name, with its cover. */
function BooksInside({ books }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  if (!books.length) return null;

  return (
    <div className={`pk-inside ${open ? "open" : ""}`}>
      <button
        type="button"
        className="pk-inside-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="pk-inside-t">
          <BookOpen size={15} /> {open ? "Hide" : "See"} all {books.length} {books.length === 1 ? "book" : "books"} inside
        </span>
        <ChevronDown size={18} className="pk-chev" />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <ul className="pk-inside-list">
              {books.map((b, i) => (
                <motion.li
                  key={b._id}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: Math.min(i, 12) * 0.04 }}
                  whileHover={{ x: 4 }}
                >
                  <span className="pk-thumb">
                    {b.coverPageUrl ? <img src={b.coverPageUrl} alt="" loading="lazy" /> : <BookOpen size={14} />}
                  </span>
                  <span className="pk-inside-name">{b.title}</span>
                  <Check size={14} className="pk-inside-ok" />
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* One card per pack. `current` highlights the pack whose page you are on. */
export function PackCard({ pack, worth, current, onBuy, showLink = true }) {
  const lifetime = pack.plan === "lifetime";
  const credits = Number(pack.matches) || 0; // 0 = hidden everywhere. 1 credit = 1 match
  const included = pack.includedBooks || [];
  const save = worth > pack.price ? worth - pack.price : 0;
  const hasDetails = showLink && pack.redirectUrl && !current;

  return (
    <article className={`pk-card ${lifetime ? "pk-featured" : ""} ${current ? "pk-current" : ""}`}>
      {(pack.badge || lifetime) && <span className="pk-ribbon">{pack.badge || "Best value"}</span>}

      <p className="pk-kind">{planLabel(pack.plan)}</p>
      <h3>{pack.title}</h3>
      {pack.subtitle && <p className="pk-sub">{pack.subtitle}</p>}

      <div className="pk-price">
        <b>{inr(pack.price)}</b>
        {pack.mrp > pack.price && <s>{inr(pack.mrp)}</s>}
        <small>one-time</small>
      </div>
      {save > 0 && <p className="pk-save">Worth {inr(worth)} if bought one by one</p>}

      <ul className="pk-list">
        <li>
          <Check size={15} />
          <span>
            <b>{included.length > 0 ? `${included.length} books` : "All books"}</b> available today
          </span>
        </li>
        {lifetime ? (
          <li className="pk-strong"><Check size={15} /><span>Every book we publish in future, emailed to you free</span></li>
        ) : (
          <li><Check size={15} /><span>Email alert when a new book is published</span></li>
        )}
        {credits > 0 && (
          <li className="pk-strong pk-matches">
            <Swords size={15} />
            <span>{credits} Prep Arena {creditWord(credits)}</span>
          </li>
        )}
        {lifetime && (
          <li className="pk-strong pk-gift">
            <Gift size={15} />
            <span>Free limited Prep Arena credits when we launch new features</span>
          </li>
        )}
        {lifetime ? (
          <li className="pk-strong">
            <Lightbulb size={15} />
            <span>After you buy, request or suggest any new book to us (sign in to Prep Arena, open Books)</span>
          </li>
        ) : (
          <li><Lightbulb size={15} /><span>Request new books inside Prep Arena</span></li>
        )}
        {(pack.highlights || []).map((h) => (
          <li key={h}><Check size={15} /><span>{h}</span></li>
        ))}
      </ul>

      {credits > 0 && (
        <p className="pk-note">
          <b>1 credit = 1 match = 1 buddy partnership</b> for mock interviews and private chat. Your {credits} {creditWord(credits)} {credits === 1 ? "is" : "are"} added
          the moment you sign up on <Link to="/prep-buddy" className="pk-inline-link">Prep Arena</Link> with the same email you buy with.
        </p>
      )}

      <BooksInside books={included} />

      <div className={`pk-actions ${hasDetails ? "two" : ""}`}>
        <button type="button" className="pk-btn pk-btn-primary" onClick={() => onBuy(pack)}>
          Get this pack <ArrowRight size={16} />
        </button>
        {hasDetails && (
          <Link className="pk-btn pk-btn-ghost" to={pack.redirectUrl}>Details</Link>
        )}
      </div>
    </article>
  );
}

/* Self-contained section: fetches, renders, and owns the checkout modal. */
export default function PackShowcase({ theme = "light", currentPath = "" }) {
  const { data, loading, error } = usePacks();
  const [product, setProduct] = useState(null);

  const packs = data?.packs || [];
  if (error || (!loading && packs.length === 0)) return null;

  const anyMatches = packs.some((p) => Number(p.matches) > 0);

  return (
    <section className="pk-root" data-theme={theme} aria-labelledby="pk-title">
      <style>{PACK_CSS}</style>
      <div className="pk-wrap">
        <p className="pk-eyebrow">Book packs</p>
        <h2 id="pk-title">Get every book in one pack</h2>
        <p className="pk-lead">One payment, no subscription. Choose all current books, or go Lifetime and get every future book too.</p>

        {loading ? (
          <div className="pk-grid" aria-hidden="true">
            {[0, 1].map((i) => <div key={i} className="pk-card pk-skel"><i /><i /><i /></div>)}
          </div>
        ) : (
          <div className="pk-grid">
            {packs.map((p) => (
              <PackCard key={p._id} pack={p} worth={data.stats.individualWorth} current={currentPath && p.redirectUrl === currentPath} onBuy={setProduct} />
            ))}
          </div>
        )}

        {!loading && anyMatches && (
          <div className="pk-explain">
            <Swords size={18} />
            <p>
              <b>What is a Prep Arena credit?</b> Prep Arena pairs you with another serious candidate for mock interviews and private chat.
              1 credit = 1 match = 1 partnership; when it ends, your next credit pairs you with someone new.
            </p>
          </div>
        )}
        {!loading && packs.some((p) => p.plan === "lifetime") && (
          <div className="pk-explain pk-explain-gift">
            <Gift size={18} />
            <p>
              <b>Lifetime bonus:</b> we will give you free, limited Prep Arena credits when we launch new features and more. Buy once, and the perks keep growing.
            </p>
          </div>
        )}
        {!loading && (
          <div className="pk-explain">
            <BellRing size={18} />
            <p>
              <b>New books, straight to your inbox.</b> Pack members are emailed when a book is published, and can request or suggest new books from
              inside Prep Arena (sign in, then open <b>Books</b>).
            </p>
          </div>
        )}
      </div>

      <PayUCheckoutModal isOpen={Boolean(product)} onClose={() => setProduct(null)} product={product} />
    </section>
  );
}

/* Scoped styles. Variables switch with data-theme so the section fits both pages. */
export const PACK_CSS = `
.pk-root{--pk-bg:transparent;--pk-card:#fff;--pk-ink:#1C1917;--pk-mut:#57534E;--pk-line:#F1E3D4;--pk-or:#F97316;--pk-or2:#EA580C;--pk-soft:#FFF4EA;--pk-ok:#15803D;
  color:var(--pk-ink);padding:44px 0;font-family:inherit;line-height:1.55}
.pk-root[data-theme="dark"]{--pk-card:#221C18;--pk-ink:#F5F1EC;--pk-mut:#B8AEA4;--pk-line:#3A2F27;--pk-soft:#3B2414;--pk-ok:#4ADE80}
.pk-root *{box-sizing:border-box}
.pk-wrap{max-width:1120px;margin:0 auto;padding:0 16px}
.pk-eyebrow{display:inline-block;margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--pk-or2);background:var(--pk-soft);padding:5px 12px;border-radius:999px}
.pk-root h2{margin:0 0 6px;font-size:clamp(1.5rem,3.4vw,2.1rem);font-weight:800;letter-spacing:-.01em}
.pk-lead{margin:0 0 26px;color:var(--pk-mut);max-width:640px}
.pk-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:20px;align-items:stretch}
.pk-card{position:relative;display:flex;flex-direction:column;background:var(--pk-card);border:1px solid var(--pk-line);border-radius:20px;padding:26px 22px}
.pk-featured{border:2px solid var(--pk-or);box-shadow:0 18px 46px rgba(249,115,22,.16)}
.pk-current{outline:3px solid rgba(249,115,22,.35);outline-offset:3px}
.pk-ribbon{position:absolute;top:-13px;left:22px;background:var(--pk-or2);color:#fff;font-size:12px;font-weight:800;padding:4px 12px;border-radius:999px}
.pk-kind{margin:0;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--pk-or2)}
.pk-card h3{margin:4px 0 0;font-size:1.3rem;font-weight:800}
.pk-sub{margin:4px 0 0;color:var(--pk-mut);font-size:14px}
.pk-price{display:flex;align-items:baseline;gap:10px;margin-top:16px}
.pk-price b{font-size:2.5rem;line-height:1;font-weight:800}.pk-price s,.pk-price small{color:var(--pk-mut)}
.pk-save{margin:6px 0 0;color:var(--pk-ok);font-size:13px;font-weight:600}
.pk-list{list-style:none;padding:0;margin:18px 0;display:grid;gap:9px}
.pk-list li{display:flex;gap:10px;align-items:flex-start;font-size:14.5px}
.pk-list svg{flex:none;margin-top:3px;color:var(--pk-ok)}
.pk-strong span{font-weight:700}
.pk-matches svg{color:var(--pk-or2)}
.pk-note{margin:0 0 14px;padding:10px 12px;border-radius:12px;background:var(--pk-soft);border:1px solid var(--pk-line);font-size:13px;color:var(--pk-ink)}
.pk-inline-link{color:var(--pk-or2);font-weight:800;text-decoration:underline}
.pk-gift svg{color:#B45309}
.pk-explain-gift{background:linear-gradient(135deg,var(--pk-soft),transparent)}
.pk-inside{margin:0 0 16px}
.pk-inside-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 14px;border:1px solid var(--pk-line);border-radius:12px;background:var(--pk-soft);color:var(--pk-ink);font:inherit;cursor:pointer;transition:border-color .2s,box-shadow .2s}
.pk-inside-btn:hover{border-color:var(--pk-or);box-shadow:0 6px 16px rgba(249,115,22,.16)}
.pk-inside-btn:focus-visible{outline:3px solid #FDBA74;outline-offset:2px}
.pk-inside-t{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:800;color:var(--pk-or2)}
.pk-chev{flex:none;color:var(--pk-or2);transition:transform .3s}.pk-inside.open .pk-chev{transform:rotate(180deg)}
.pk-inside-list{list-style:none;margin:10px 0 0;padding:2px 4px 2px 0;display:grid;gap:7px;max-height:300px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--pk-or) transparent}
.pk-inside-list li{display:flex;align-items:center;gap:10px;padding:7px 10px;border:1px solid var(--pk-line);border-radius:12px;background:var(--pk-soft);transition:border-color .2s,box-shadow .2s,background .2s;cursor:default}
.pk-inside-list li:hover{border-color:var(--pk-or);box-shadow:0 8px 18px rgba(249,115,22,.18);background:var(--pk-card)}
.pk-thumb{flex:none;width:30px;height:40px;border-radius:5px;overflow:hidden;display:grid;place-items:center;background:var(--pk-card);color:var(--pk-or2);box-shadow:0 3px 8px rgba(120,53,15,.2)}
.pk-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.pk-inside-name{flex:1;min-width:0;font-size:13.5px;font-weight:700;line-height:1.3}
.pk-inside-ok{flex:none;color:var(--pk-ok)}
.pk-books{margin:0 0 14px;font-size:13.5px}
.pk-books summary{cursor:pointer;font-weight:700;color:var(--pk-or2)}
.pk-books ul{margin:8px 0 0;padding-left:18px;color:var(--pk-mut)}.pk-more{list-style:none;margin-left:-18px;font-style:italic}
.pk-actions{margin-top:auto;display:grid;grid-template-columns:1fr;gap:10px}
.pk-actions.two{grid-template-columns:1fr 1fr}
.pk-actions .pk-btn{width:100%;min-height:48px;flex:none}
.pk-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid transparent;border-radius:12px;padding:12px 18px;font-weight:700;font-size:15px;cursor:pointer;text-decoration:none;font-family:inherit;transition:transform .15s}
.pk-btn:hover{transform:translateY(-1px)}
.pk-btn:focus-visible{outline:3px solid #FDBA74;outline-offset:2px}
.pk-btn-primary{background:linear-gradient(135deg,var(--pk-or),var(--pk-or2));color:#fff;box-shadow:0 8px 20px rgba(249,115,22,.28)}
.pk-btn-ghost{color:var(--pk-ink);border-color:var(--pk-line);background:transparent}
.pk-explain{display:flex;gap:12px;align-items:flex-start;margin-top:16px;padding:14px 16px;border-radius:14px;background:var(--pk-soft);border:1px solid var(--pk-line)}
.pk-explain svg{flex:none;margin-top:3px;color:var(--pk-or2)}.pk-explain p{margin:0;font-size:14px}
.pk-skel i{display:block;height:16px;border-radius:8px;margin-top:14px;background:linear-gradient(90deg,var(--pk-line),var(--pk-soft),var(--pk-line));background-size:200% 100%;animation:pk-sh 1.3s infinite}
.pk-skel{min-height:260px}@keyframes pk-sh{to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.pk-root *{animation:none!important;transition:none!important}}
@media (max-width:520px){.pk-root{padding:32px 0}.pk-price b{font-size:2.1rem}}
`;
