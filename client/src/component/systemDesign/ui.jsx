/* eslint-disable react/prop-types */
// Shared presentation kit for the System Design book pages (LLD and combo).
// Styling lives in ../SystemDesignHLD.css, scoped under the `.hld` root class.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, BookOpen, Check, Plus } from "@phosphor-icons/react";
import "../SystemDesignHLD.css";

export const EASE = [0.22, 1, 0.36, 1];
export const FLOAT_EASE = [0.37, 0, 0.63, 1];

export const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&display=swap";

const THEME_KEY = "theme";

export const cx = (...classes) => classes.filter(Boolean).join(" ");

export const twoDigits = (value) => String(value).padStart(2, "0");

export const formatMoney = (amount, currencyCode = "INR") => {
  const value = Number(amount || 0);
  const locale =
    { INR: "en-IN", USD: "en-US", GBP: "en-GB", EUR: "en-IE", AUD: "en-AU", CAD: "en-CA" }[
      currencyCode
    ] || "en";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currencyCode} ${value}`;
  }
};

export const percentOff = (price, mrp) => {
  const p = Number(price);
  const m = Number(mrp);
  return m > p && m > 0 ? Math.round(((m - p) / m) * 100) : 0;
};

/* ------------------------------------------------------------------ */
/*  Hooks                                                              */
/* ------------------------------------------------------------------ */

const readTheme = () => {
  if (typeof window === "undefined") return "light";
  try {
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

// Follows the theme the site navbar sets. These pages have no toggle of
// their own; the navbar owns it.
export function useSiteTheme() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const sync = (event) => {
      const specified = event?.detail?.theme;
      setTheme(specified === "light" || specified === "dark" ? specified : readTheme());
    };
    const onStorage = (event) => {
      if (!event.key || event.key === THEME_KEY) setTheme(readTheme());
    };
    const onFocus = () => setTheme(readTheme());

    sync();
    window.addEventListener("targettrek-theme-change", sync);
    window.addEventListener("themechange", sync);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("targettrek-theme-change", sync);
      window.removeEventListener("themechange", sync);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return theme;
}

// The site navbar is fixed. Measure it so the page clears it and anchors,
// the floating section bar and the skip link all sit below it.
export function useNavOffset(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    const siteNav = document.querySelector("nav.fixed.top-0");
    if (!root || !siteNav) return undefined;

    const apply = () => {
      const navRect = siteNav.getBoundingClientRect();
      root.style.setProperty("--hld-nav-h", `${Math.round(navRect.height)}px`);
      root.style.setProperty("--hld-pad", "0px");
      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      root.style.setProperty("--hld-pad", `${Math.max(0, Math.round(navRect.height - rootTop))}px`);
    };
    apply();

    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(apply);
    observer.observe(siteNav);
    return () => observer.disconnect();
  }, [rootRef]);
}

export function useInViewport(ref) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return visible;
}

export function useGoToSection() {
  const reduce = useReducedMotion();
  return (event, target) => {
    const el = document.querySelector(target);
    if (!el) return;
    event?.preventDefault?.();
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
}

/* ------------------------------------------------------------------ */
/*  Motion + layout                                                    */
/* ------------------------------------------------------------------ */

// Entrance wrapper. Hover effects live on the child (CSS), so the inline
// transform framer-motion leaves behind never fights a hover lift.
export function Reveal({ children, delay = 0, y = 32, className, as = "div", ...rest }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;

  return (
    <Tag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Section({ id, alt = false, narrow = false, labelledBy, children }) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cx("py-16 lg:py-24", alt ? "bg-alt" : "bg-base")}>
      <div className={cx("mx-auto px-4 sm:px-6 lg:px-8", narrow ? "max-w-3xl" : "max-w-6xl")}>
        {children}
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, description, align = "left", id }) {
  return (
    <Reveal className={cx("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <p className="eyebrow caption-3">{eyebrow}</p>
      <h2 id={id} className="heading-2 t1 mt-3">
        {title}
      </h2>
      {description && <p className="body-3 t2 mt-4">{description}</p>}
    </Reveal>
  );
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
      ease: EASE,
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

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      className="progress fixed inset-x-0 top-0 z-[95] h-0.5 origin-left"
      style={{ scaleX }}
    />
  );
}

// 3D pointer tilt with a slow idle float. Touch devices just get the float.
export function Tilt({ children, className, float = true }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 150, damping: 18 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 18 });

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div
      className={className}
      style={{ perspective: 1000 }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mx.set((event.clientX - rect.left) / rect.width - 0.5);
        my.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div
        className="h-full"
        animate={float ? { y: [0, -10, 0] } : undefined}
        transition={{ duration: 5, repeat: Infinity, ease: FLOAT_EASE }}
      >
        <motion.div className="h-full" style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

// Small label that drifts next to the hero book.
export function FloatChip({ className, delay = 0, children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cx("glass absolute z-10 rounded-xl px-3 py-2", className)}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 16 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: [0, -8, 0] }}
      transition={
        reduce
          ? { duration: 0.5, delay }
          : {
              opacity: { duration: 0.6, ease: EASE, delay },
              scale: { duration: 0.6, ease: EASE, delay },
              y: { duration: 6, repeat: Infinity, ease: FLOAT_EASE, delay },
            }
      }
    >
      {children}
    </motion.div>
  );
}

// Large type statement whose words light up one at a time as it scrolls in.
export function TaglineReveal({ text }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const words = useMemo(() => text.split(" "), [text]);
  const [count, setCount] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const next = Math.round(latest * words.length);
    setCount((current) => (next > current ? next : current));
  });

  return (
    <section className="bg-base relative py-20 lg:py-24" aria-label="Why this works">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p ref={ref} className="heading-2 t1 mx-auto max-w-[680px] text-center" aria-label={text}>
          {words.map((word, index) => (
            <span
              key={`${word}-${index}`}
              aria-hidden="true"
              className="word"
              data-on={reduce || index < count ? "true" : "false"}
            >
              {word}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page chrome                                                        */
/* ------------------------------------------------------------------ */

export function SkipLink() {
  return (
    <a href="#page-main" className="skip btn btn-primary button-sm">
      Skip to content
    </a>
  );
}

export function Breadcrumb({ current }) {
  return (
    <div className="bg-base">
      <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <ol className="caption-1 t3 flex items-center gap-2">
          <li>
            <a className="link focusable" href="/">
              Home
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <a className="link focusable" href="/books">
              Books
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="t1 truncate">
            {current}
          </li>
        </ol>
      </nav>
    </div>
  );
}

// Compact floating section bar. Desktop only; it slides in after the hero.
export function FloatNav({ links, show, onBuy, canBuy, buyLabel = "Get the ebook" }) {
  const goTo = useGoToSection();
  const [active, setActive] = useState("");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const targets = links.map((link) => document.querySelector(link.href)).filter(Boolean);
    if (!targets.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [links]);

  return (
    <div
      className="floatnav pointer-events-none fixed inset-x-0 z-40 hidden justify-center px-4 lg:flex"
      data-show={show ? "true" : "false"}
      {...(show ? {} : { inert: "" })}
    >
      <nav aria-label="On this page" className="glass pointer-events-auto flex max-w-full items-center gap-1 rounded-full p-1">
        <ul className="flex items-center">
          {links.map((link) => {
            const current = active === link.href;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(event) => goTo(event, link.href)}
                  aria-current={current ? "true" : undefined}
                  className="navlink focusable title-4 isolate block"
                >
                  {current && (
                    <motion.span
                      layoutId="sd-nav-active"
                      className="navlink-bg"
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  )}
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={onBuy} disabled={!canBuy} className="btn btn-primary button-sm rounded-full">
          {buyLabel}
          <ArrowRight className="arrow" size={16} weight="bold" />
        </button>
      </nav>
    </div>
  );
}

// Sticky buy bar. Mobile: always docked. Tablet and up: only after the hero.
export function BuyBar({ title, price, mrp, discount, onBuy, canBuy, buyLabel, hidden, heroVisible, secondary }) {
  return (
    <div
      className={cx(
        "buybar pointer-events-none fixed inset-x-0 bottom-0 z-[45] flex justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-4 md:pb-6",
        hidden && "translate-y-24 opacity-0",
        heroVisible && "md:translate-y-24 md:opacity-0"
      )}
    >
      <div className="glass pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl p-2 pl-4">
        <div className="min-w-0">
          <p className="title-4 t1 truncate">{title}</p>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
            <span className="body-1 mono ta">{price}</span>
            {mrp && <span className="caption-4 mono t3 strike">{mrp}</span>}
            {discount > 0 && <span className="caption-3 mono tok">{discount}% off</span>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {secondary && (
            <button type="button" onClick={secondary.onClick} className="btn btn-secondary button-sm lg-only">
              <BookOpen size={16} weight="bold" />
              {secondary.label}
            </button>
          )}
          <button type="button" onClick={onBuy} disabled={!canBuy} className="btn btn-primary button-md">
            {buyLabel}
            <ArrowRight className="arrow" size={18} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PriceSkeleton({ className = "h-5 w-14" }) {
  return <span className={cx("skel align-middle", className)} role="status" aria-label="Loading price" />;
}

/* ------------------------------------------------------------------ */
/*  Reusable content blocks                                            */
/* ------------------------------------------------------------------ */

export function StatsStrip({ items, label }) {
  return (
    <section aria-label={label} className="bg-base py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="rule bd grid grid-cols-2 gap-px overflow-hidden rounded-3xl md:grid-cols-4">
          {items.map(([value, suffix, text]) => (
            <div key={text} className="bg-s1 px-4 py-8 text-center">
              <div className="heading-3 mono ta">
                <CountUp to={value} suffix={suffix} />
              </div>
              <div className="caption-1 t2 mt-2">{text}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function Marquee({ terms, label }) {
  return (
    <div className="marquee-wrap overflow-hidden" aria-label={label}>
      <div className="marquee">
        {[...terms, ...terms].map((term, index) => (
          <span
            key={`${term}-${index}`}
            aria-hidden={index >= terms.length ? "true" : undefined}
            className="chip caption-1 mx-1 shrink-0"
          >
            {term}
          </span>
        ))}
      </div>
    </div>
  );
}

// A sibling book (or the bundle) shown right under the hero.
export function BookOfferCard({
  eyebrow,
  badge,
  featured = false,
  title,
  subtitle,
  description,
  cover,
  features = [],
  pills = [],
  status = "ready",
  price,
  mrp,
  currency = "INR",
  onBuy,
  canBuy = false,
  buyLabel,
  href,
  viewLabel = "View details",
  errorText,
}) {
  const off = percentOff(price, mrp);

  return (
    <article className={cx("card lift flex h-full flex-col rounded-3xl p-6 sm:p-8", featured && "featured")}>
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow caption-3">{eyebrow}</p>
        {badge && <span className="chip chip-accent caption-3">{badge}</span>}
      </div>

      <div className="mt-4 flex gap-4">
        {cover ? (
          <img
            src={cover}
            alt={`${title} ebook cover`}
            loading="lazy"
            decoding="async"
            className="cover bd h-auto w-24 shrink-0 self-start rounded-lg object-contain"
          />
        ) : (
          <span className="tile cover aspect-[0.72] w-24 self-start rounded-lg">
            <BookOpen size={28} weight="duotone" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="heading-6 t1">{title}</h3>
          {subtitle && <p className="body-5 ta mt-1">{subtitle}</p>}
          {description && <p className="body-6 t2 mt-2 line-clamp-3">{description}</p>}
        </div>
      </div>

      <ul className="mt-6 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="body-5 t1 flex items-start gap-2">
            <Check className="ta mt-0.5 shrink-0" size={16} weight="bold" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {pills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {pills.map((pill) => (
            <span key={pill} className="chip caption-4">
              {pill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-6">
        <div className="flex min-h-9 flex-wrap items-baseline gap-x-3 gap-y-1">
          {status === "loading" && <PriceSkeleton className="h-8 w-24" />}
          {status === "error" && <span className="body-4 t3">Price unavailable right now</span>}
          {status === "ready" && (
            <>
              <span className="heading-4 mono t1">{formatMoney(price, currency)}</span>
              {Number(mrp) > Number(price) && (
                <span className="body-5 mono t3 strike">{formatMoney(mrp, currency)}</span>
              )}
              {off > 0 && <span className="chip chip-accent caption-3 mono">{off}% off</span>}
            </>
          )}
        </div>

        <div className={cx("mt-4 grid gap-3", onBuy && "sm:grid-cols-2")}>
          {onBuy && (
            <button type="button" onClick={onBuy} disabled={!canBuy} className="btn btn-primary button-md w-full">
              {buyLabel}
              <ArrowRight className="arrow" size={18} weight="bold" />
            </button>
          )}
          <a href={href} className="btn btn-secondary button-md w-full">
            {viewLabel}
            {!onBuy && <ArrowRight className="arrow" size={18} weight="bold" />}
          </a>
        </div>

        {errorText && <p className="caption-2 t3 mt-3">{errorText}</p>}
      </div>
    </article>
  );
}

// Accordion FAQ. Answers stay in the DOM so crawlers can read them.
export function FaqList({ items, idPrefix = "faq", defaultOpen = null }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-10 space-y-3">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <Reveal key={item.q} y={16} delay={Math.min(index, 4) * 0.04}>
            <article className={cx("card rounded-2xl", isOpen && "featured")}>
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="focusable flex w-full items-center justify-between gap-4 rounded-2xl p-4 text-left sm:p-6"
                  aria-expanded={isOpen}
                  aria-controls={`${idPrefix}-answer-${index}`}
                  id={`${idPrefix}-question-${index}`}
                >
                  <span className="title-3 t1 sm:text-lg sm:leading-7">{item.q}</span>
                  <Plus size={20} weight="bold" className={cx("spin ta shrink-0", isOpen && "rotate-45")} />
                </button>
              </h3>
              <div
                id={`${idPrefix}-answer-${index}`}
                role="region"
                aria-labelledby={`${idPrefix}-question-${index}`}
                hidden={!isOpen}
                className="fade-up"
              >
                <p className="body-3 t2 px-4 pb-4 sm:px-6 sm:pb-6">{item.a}</p>
              </div>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

export function FinalCta({ eyebrow, title, copy, price, mrp, onBuy, canBuy, buyLabel, secondary, note, titleId }) {
  return (
    <section aria-labelledby={titleId} className="bg-base px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <Reveal className="mx-auto max-w-6xl">
        <div className="cta-dark rounded-3xl p-6 sm:p-10 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <p className="caption-3 uppercase tracking-wider text-[#fb923c]">{eyebrow}</p>
              <h2 id={titleId} className="heading-2 mt-4 max-w-[680px]">
                {title}
              </h2>
              <p className="body-3 t2 mt-4 max-w-[680px]">{copy}</p>
            </div>

            <div>
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="heading-3 mono">{price}</span>
                {mrp && <span className="body-5 mono strike text-[#8c8c8c]">{mrp}</span>}
              </div>
              <button type="button" onClick={onBuy} disabled={!canBuy} className="btn btn-primary btn-lg button-md mt-4 w-full">
                {buyLabel}
                <ArrowRight className="arrow" size={20} weight="bold" />
              </button>
              {secondary && (
                <button type="button" onClick={secondary.onClick} className="btn btn-light button-md mt-3 w-full">
                  <BookOpen size={18} weight="bold" />
                  {secondary.label}
                </button>
              )}
              {note && <p className="caption-5 mt-4 text-[#8c8c8c]">{note}</p>}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// Horizontally scrollable pill tabs (touch friendly, wraps on larger screens).
export function PillTabs({ items, value, onChange, label, role = "tablist" }) {
  const isTabs = role === "tablist";
  return (
    <div
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
      role={role}
      aria-label={label}
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role={isTabs ? "tab" : undefined}
            aria-selected={isTabs ? selected : undefined}
            aria-pressed={isTabs ? undefined : selected}
            onClick={() => onChange(item.id)}
            className="pill focusable button-sm shrink-0"
          >
            {item.label}
            {item.count != null && <span className="mono opacity-70"> {item.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export { AnimatePresence, motion, useReducedMotion };
