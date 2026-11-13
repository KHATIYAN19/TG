import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cake, Champagne, CircleNotch, Diamond, HeartBreak, Leaf } from "@phosphor-icons/react";

import { cx } from "./ui";

/* Small pieces the landing page sections share. */

export const SIGNUP = "/memories/login?mode=signup";

/* each occasion's icon and its flat colours (tint = the surface behind its phone, ink = the icon) */
export const OCCASION = {
  birthday: { Icon: Cake, tint: "#ffe4ec", ink: "#be123c", short: "Pop, cut, unwrap" },
  sorry: { Icon: HeartBreak, tint: "#ede9fe", ink: "#6d28d9", short: "Say it softly" },
  proposal: { Icon: Diamond, tint: "#fef3c7", ink: "#b45309", short: "The big question" },
  anniversary: { Icon: Champagne, tint: "#ffedd5", ink: "#c2410c", short: "Your love story" },
  thanks: { Icon: Leaf, tint: "#dcfce7", ink: "#15803d", short: "Say thank you" },
};

/** The flat button used across Memories. `to` makes a router link, `href` a plain link, neither a button. `loading` shows a spinner and blocks taps. */
export function Btn({ to, href, variant = "primary", size = "md", className, children, loading = false, disabled = false, ...rest }) {
  const cls = cx("ml-btn", size === "sm" ? "ml-btn-sm button-sm" : "button-md", variant !== "primary" && `ml-btn-${variant}`, className);
  const body = <>{loading && <CircleNotch size={16} weight="bold" className="animate-spin" aria-hidden />}{children}</>;
  if (to) return <Link to={to} className={cls} {...rest}>{body}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{body}</a>;
  return <button type="button" className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>{body}</button>;
}

/** Kicker, heading and an optional line of text above a section. */
export function SectionHead({ id, kicker, title, text, dark = false, className }) {
  return (
    <div id={id} className={cx("mem-anchor mem-reveal mx-auto max-w-[680px] text-center", className)}>
      <p className="ml-kicker caption-3">{kicker}</p>
      <h2 className={cx("heading-2 mt-3", dark ? "text-white" : "text-[#2a1023]")}>{title}</h2>
      {text && <p className={cx("body-3 mt-4", dark ? "text-[#9b9b9b]" : "text-[#7a5370]")}>{text}</p>}
    </div>
  );
}

/**
 * True while the element is on screen or within `margin` of it. The live template phones are whole pages in an iframe,
 * so they are only kept mounted while they are near the screen.
 */
export function useNear(ref, margin = "600px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!ref.current) return undefined;
    if (typeof IntersectionObserver === "undefined") { setNear(true); return undefined; }
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: margin });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref, margin]);
  return near;
}

/**
 * The site wraps every page in `overflow-x: hidden`, which turns those wrappers into scroll boxes and stops anything inside
 * from sticking to the top of the screen. While this page is open they are switched to `clip`, which hides the same overflow
 * without that side effect, and put back when the page closes.
 */
export function useStickyFix(ref) {
  useEffect(() => {
    const undo = [];
    for (let n = ref.current?.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      if (getComputedStyle(n).overflowX === "hidden") { const was = n.style.overflowX; n.style.overflowX = "clip"; undo.push(() => { n.style.overflowX = was; }); }
    }
    return () => undo.forEach((f) => f());
  }, [ref]);
}

/* a tiny abstract picture of a look, made from its three colours */
export function LookArt({ swatch = [], className }) {
  const [a = "#f43f5e", b = "#fda4af", c = "#fff1f2"] = swatch;
  return (
    <span className={cx("relative block overflow-hidden", className)} style={{ background: c }} aria-hidden>
      <i className="ml-look-a absolute -right-4 -top-4 block h-16 w-16 rounded-full" style={{ background: a }} />
      <i className="ml-look-b absolute -bottom-4 left-4 block h-12 w-12 rounded-full" style={{ background: b }} />
    </span>
  );
}
