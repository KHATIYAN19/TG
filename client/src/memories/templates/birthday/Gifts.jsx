import { useRef, useState } from "react";
import { track } from "../../track";

/*
  GIFTS: the sender writes the gifts (e.g. "Movie date"); the page shows exactly those, as wrapped boxes.
  No gifts = this whole section is not rendered. Tap a box: it shakes, the lid flies off, rays spin up,
  the present rises out and a ticket-style voucher appears with the sender's note.
*/

/* emoji guessed from the gift name; the sender can also type their own */
const EMOJI = [
  [/movie|film|cinema|netflix/i, "🎬"], [/coffee|cafe|chai|tea\b/i, "☕"], [/dinner|lunch|food|eat|treat|restaurant|meal|brunch/i, "🍽️"],
  [/pizza/i, "🍕"], [/burger/i, "🍔"], [/ice ?cream|dessert/i, "🍨"], [/chocolate/i, "🍫"], [/cake|bake/i, "🎂"],
  [/trip|travel|holiday|vacation|getaway|flight|tour/i, "✈️"], [/beach|goa|island/i, "🏖️"], [/picnic/i, "🧺"], [/road ?trip|drive|car\b/i, "🚗"],
  [/hug/i, "🤗"], [/kiss/i, "💋"], [/date|romantic|candle/i, "🕯️"], [/flower|rose|bouquet/i, "💐"], [/ring|jewel|necklace|bracelet/i, "💍"],
  [/shop|dress|clothes|outfit|fashion|bag\b/i, "🛍️"], [/shoe|sneaker/i, "👟"], [/book|read/i, "📚"], [/music|concert|song|playlist/i, "🎵"],
  [/game|gaming|play ?station|xbox/i, "🎮"], [/photo|camera|shoot/i, "📸"], [/spa|massage|relax/i, "💆"], [/dance|party|club/i, "💃"],
  [/phone|mobile/i, "📱"], [/watch/i, "⌚"], [/perfume|fragrance/i, "🧴"], [/yoga|gym|fit/i, "🧘"], [/letter|note|message|card/i, "💌"],
  [/pet|dog|puppy/i, "🐶"], [/cat|kitten/i, "🐱"], [/star|wish/i, "🌟"], [/walk|stroll|hike/i, "🚶"], [/talk|conversation|chat|listen/i, "💬"], [/apolog|sorry|forgive/i, "🙏"], [/promise/i, "🤞"], [/wine|champagne|toast|cheers/i, "🍾"], [/frame|album|scrapbook|memory book/i, "🖼️"], [/teddy|plush|bear/i, "🧸"], [/candle|candlelit/i, "🕯️"], [/jewel|earring|pendant/i, "💎"], [/honeymoon|cruise/i, "🛳️"], [/surprise|mystery/i, "🎁"], [/love|heart|forever/i, "❤️"],
];
export const emojiFor = (g) => g.emoji || EMOJI.find(([re]) => re.test(g.title))?.[1] || "🎁";

/* wrapping paper by theme (a data-URI pattern or a gradient) */
const svg = (inner, size = 18) => ({ image: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${inner}</svg>`)}")`, size: `${size}px ${size}px` });
const PATTERNS = {
  hearts: svg("<path transform='translate(4.4 5) scale(.3)' d='M16 28C16 28 2 19 2 9.5 2 5 5.5 2 9.5 2 12.3 2 14.8 3.6 16 6 17.2 3.6 19.7 2 22.5 2 26.5 2 30 5 30 9.5 30 19 16 28 16 28Z' fill='white' fill-opacity='.5'/>"),
  stars: svg("<path transform='translate(3.5 3.5) scale(.46)' d='M12 1.5l3 6.9 7.5.7-5.7 5 1.8 7.4L12 17.7l-6.6 3.8 1.8-7.4-5.7-5 7.5-.7z' fill='white' fill-opacity='.5'/>"),
  dots: svg("<circle cx='5' cy='5' r='2.2' fill='white' fill-opacity='.55'/><circle cx='14' cy='14' r='2.2' fill='white' fill-opacity='.55'/>"),
  waves: svg("<path d='M0 9 Q4.5 3 9 9 T18 9' stroke='white' stroke-opacity='.5' stroke-width='2' fill='none'/>"),
  stripes: { image: "repeating-linear-gradient(135deg, rgba(255,255,255,.34) 0 5px, transparent 5px 11px)", size: "auto" },
};
const BOXES = ["classic", "hat", "tall", "bag"];

export default function Gifts({ gifts, sender, recipient, pattern = "dots", boxes = BOXES, tagText, fx, sound, onAllOpen, onOpen }) {
  const [state, setState] = useState({}); // id -> opening | open
  const refs = useRef({});
  const opened = Object.values(state).filter((s) => s === "open").length;
  const pat = PATTERNS[pattern] || PATTERNS.dots;

  const openGift = (g) => {
    if (state[g.id]) return;
    setState((s) => ({ ...s, [g.id]: "opening" }));
    sound?.sfx.rustle();
    try { navigator.vibrate?.(20); } catch { /* not supported */ }
    setTimeout(() => {
      const el = refs.current[g.id];
      if (el) {
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + 60;
        fx?.confetti(x, y, { n: 80, angle: -Math.PI / 2, spread: 2.4, power: 560 });
        fx?.sparkle(x, y - 20, { n: 18 });
      }
      sound?.sfx.chime();
      onOpen?.(g);
      track("gift_open", { id: String(g.id), title: g.title });
      setState((s) => {
        const next = { ...s, [g.id]: "open" };
        if (Object.values(next).filter((v) => v === "open").length === gifts.length) setTimeout(() => onAllOpen?.(), 600);
        return next;
      });
    }, 520);
  };

  const unwrapAll = () => gifts.filter((g) => !state[g.id]).forEach((g, i) => setTimeout(() => openGift(g), i * 750));
  const left = gifts.length - opened;

  return (
    <>
      <div className="bd-gifts">
        {gifts.map((g, i) => {
          const st = state[g.id] || "closed";
          return (
            <button
              key={g.id}
              ref={(el) => { refs.current[g.id] = el; }}
              type="button"
              className="bd-gift mem-reveal"
              data-state={st}
              data-box={boxes[i % boxes.length]}
              style={{ "--g": `var(--gift-${(i % 4) + 1})`, "--rd": `${(i % 4) * 0.08}s`, "--pat": pat.image, "--pat-size": pat.size }}
              onClick={() => openGift(g)}
              aria-label={st === "closed" ? `Open gift ${i + 1} of ${gifts.length}` : g.title}
              aria-pressed={st !== "closed"}
            >
              <span className="bd-gift-stage" aria-hidden>
                <span className="bd-gift-rays" />
                <span className="bd-gift-item">{emojiFor(g)}</span>
                <span className="bd-gift-body" />
                <span className="bd-gift-lid"><span className="bd-gift-bow" /></span>
                <span className="bd-gift-tag">{tagText || (recipient ? `For ${recipient}` : "For you")}</span>
              </span>
              <span className="bd-gift-label">{st === "closed" ? <span className="bd-gift-tap">Tap to open</span> : g.title}</span>
              <span className="bd-ticket" aria-hidden={st !== "open"}>
                <b>{emojiFor(g)} {g.title}</b>
                {g.note && <small>{g.note}</small>}
                <em>— from {sender}</em>
              </span>
            </button>
          );
        })}
      </div>
      <div className="bd-counter" aria-live="polite">
        <span>
          {left === 0 ? (gifts.length > 1 ? "You found every gift! 🎉" : "Hope you love it! 🎉") : `${opened} of ${gifts.length} opened`}
          {left > 1 && <button type="button" onClick={unwrapAll} style={{ marginLeft: 10, color: "var(--bd-accent)", fontWeight: 700 }}>Unwrap them all</button>}
        </span>
      </div>
    </>
  );
}
