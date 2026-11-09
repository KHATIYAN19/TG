import { useCallback, useRef, useState } from "react";

import ReplyBox from "../common/ReplyBox";
import { track } from "../../track";

/*
  THE QUESTION
  "Will you forgive me?" The playful "No" dodges a few times, but it is only a game: after five tries it stays
  still, and a clearly marked "I need a little time" is always there. Either of those gets a kind,
  pressure-free answer. "Yes" starts the celebration.
*/
const NO_LABELS = ["No", "Are you sure? 🥺", "Pretty please?", "I'll bring chocolate 🍫", "I'm truly sorry…", "Please? 💔"];
const DODGES = 5;
const rnd = (a, b) => a + Math.random() * (b - a);

export default function Forgive({ name, sender, onYes, onGentle, sound, initial = null, onAnswer, onReply, replies = [] }) {
  const box = useRef(null);
  const noRef = useRef(null);
  const [tries, setTries] = useState(0);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [view, setView] = useState(initial === "yes" ? "yes" : initial === "later" ? "time" : "ask"); // ask | yes | time
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

  /*
    Give the answer to the server first. A "yes" is final there: if it was already given (on this phone before, or another), the server
    says so and that is what we show. "I need a little time" is not final, so it can still turn into a yes later.
  */
  const answer = async (value) => {
    if (sending) return;
    setErr("");
    let given = value;
    if (onAnswer) {
      setSending(true);
      try { given = (await onAnswer(value))?.answer?.value || value; } catch { setSending(false); setErr("Your answer couldn't be sent. Check your connection and try again."); return; }
      setSending(false);
    }
    if (given === "yes") { setView("yes"); onYes?.(); } else { setView("time"); onGentle?.(); }
  };

  const dodge = useCallback(() => {
    const b = box.current?.getBoundingClientRect();
    const n = noRef.current?.getBoundingClientRect();
    if (!b || !n) return;
    const maxX = Math.max(10, b.width / 2 - n.width / 2 - 6);
    const maxY = Math.max(10, b.height / 2 - n.height / 2 - 4);
    setOff({ x: rnd(-maxX, maxX), y: rnd(-maxY, maxY) });
    setTries((t) => t + 1);
    sound?.sfx.nope();
  }, [sound]);

  const noEnter = (e) => { if (e.pointerType === "mouse" && tries < DODGES) dodge(); };
  const noDown = (e) => { if (e.pointerType !== "mouse" && tries < DODGES) { e.preventDefault(); dodge(); } };
  const noClick = () => {
    if (tries < DODGES) { dodge(); return; }
    answer("later");
  };

  if (view === "yes") {
    return (
      <div className="sr-thanks" role="status">
        <span className="sr-thanks-heart" aria-hidden>💖</span>
        <p className="bd-script">Thank you, {name}</p>
        <small>I don&apos;t take it for granted. I&apos;ll spend every day deserving it.</small>
        <em>Forever grateful, {sender}</em>
        {onReply && <ReplyBox sender={sender} onReply={onReply} previous={replies} title="Tell them how you feel" chips={["Thank you for saying sorry 💖", "Let's start fresh", "I love you"]} />}
      </div>
    );
  }
  if (view === "time") {
    return (
      <div className="sr-thanks soft" role="status">
        <span className="sr-thanks-heart" aria-hidden>💛</span>
        <p className="bd-script">That&apos;s okay</p>
        <small>Take all the time you need. There&apos;s no pressure at all. I&apos;ll be here whenever you&apos;re ready.</small>
        <em>— {sender}</em>
        <button type="button" className="sr-linkbtn" onClick={() => { setView("ask"); setTries(0); setOff({ x: 0, y: 0 }); track("answer_back"); }}>Back to the question</button>
        {onReply && <ReplyBox sender={sender} onReply={onReply} previous={replies} title="Want to tell them something?" chips={["Thank you for understanding", "I just need a little time"]} />}
      </div>
    );
  }

  return (
    <div className="sr-ask-wrap">
      <div className="sr-ask" ref={box}>
        <button type="button" className="bd-btn sr-yes" style={{ scale: String(Math.min(1.7, 1 + tries * 0.12)) }} onClick={() => answer("yes")} disabled={sending}>
          Yes, I forgive you 💖
        </button>
        <button ref={noRef} type="button" className="bd-btn bd-btn-ghost sr-no" style={{ transform: `translate(${off.x}px, ${off.y}px)` }}
          onPointerEnter={noEnter} onPointerDown={noDown} onClick={noClick}>
          {NO_LABELS[Math.min(tries, NO_LABELS.length - 1)]}
        </button>
      </div>
      <button type="button" className="sr-linkbtn" onClick={() => answer("later")} disabled={sending}>I need a little time</button>
      {err && <p role="alert" className="sr-ask-err">{err}</p>}
    </div>
  );
}
