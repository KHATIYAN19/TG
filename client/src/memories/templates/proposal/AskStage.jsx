import { useCallback, useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "../birthday/fx";
import ReplyBox from "../common/ReplyBox";
import { track } from "../../track";
import { RingBox, OnFinger, BrokenHeart, Jewel } from "./art";
import { kindFor } from "./dummy";
import { Moon } from "../birthday/decor";

/* type the question out, one letter at a time */
function useTyped(text, run) {
  const [out, setOut] = useState("");
  useEffect(() => {
    if (!run) { setOut(""); return undefined; }
    if (prefersReducedMotion()) { setOut(text); return undefined; }
    let n = 0; let t;
    const tick = () => { n += 1; setOut(text.slice(0, n)); if (n < text.length) t = setTimeout(tick, 62); };
    tick();
    return () => clearTimeout(t);
  }, [text, run]);
  return out;
}

/*
  THE ASK. A hushed, dark stage. Phases:
    wait   -> the box is closed, a heartbeat thuds, "tap the box"
    ask    -> the lid opens, the jewel shines, the question types out, three kind answers appear
    yes    -> a big celebration
    time   -> "take all the time you need": calm, hopeful
    no     -> "thank you for being honest": rain, a cracked heart. Gentle, never guilt-tripping.
  Any answer can be taken back ("Let me answer again"): it is their choice, and they can change their mind either way.
*/
export default function AskStage({ question, name, sender, fx, sound, onYes, response, onAnswer, onReply }) {
  const kind = kindFor(question);
  const given = response?.answer?.value || null; // what they answered before (a reload shows it again)
  const [phase, setPhase] = useState(given === "yes" ? "yes" : given === "no" ? "no" : given === "later" ? "time" : "wait");
  const [final, setFinal] = useState(Boolean(response?.answer?.final)); // yes and no can never be changed
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const timers = useRef([]);
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const typed = useTyped(question, phase === "ask");
  const done = typed.length >= question.length;

  /* heartbeat while it is on screen and waiting */
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setVisible(true); return undefined; }
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || (phase !== "wait" && phase !== "ask")) return undefined;
    const t = setInterval(() => sound.sfx.heartbeat(), phase === "wait" ? 1300 : 1700);
    return () => clearInterval(t);
  }, [visible, phase, sound]);

  const stopRain = useCallback(() => sound.rain(0), [sound]);

  const openBox = () => {
    if (phase !== "wait") return;
    sound.sfx.chime();
    track("box_open");
    const { W, H } = fx?.size() || { W: 400, H: 700 };
    fx?.sparkle?.(W / 2, H * 0.45);
    setPhase("ask");
  };

  const showYes = () => { stopRain(); setPhase("yes"); onYes?.(); };
  const showTime = () => {
    sound.sfx.sniff();
    setPhase("time");
  };
  const showNo = () => {
    sound.sfx.nope();
    sound.rain(0.7);
    later(() => sound.sfx.sniff(), 900);
    later(() => sound.sfx.drip(), 1800);
    later(() => sound.sfx.drip(), 3300);
    setPhase("no");
  };

  /*
    Every answer goes to the server FIRST. A "yes" or a "no" is final there: if one was already given (on this phone, or another),
    the server returns that one and we show it instead. "I need a little time" is not final and can still change.
  */
  const choose = async (value) => {
    if (sending) return;
    setErr("");
    let result = value;
    if (onAnswer) {
      setSending(true);
      try {
        const r = await onAnswer(value);
        result = r.answer?.value || value;
        setFinal(Boolean(r.answer?.final));
      } catch {
        setSending(false);
        setErr("Your answer couldn't be sent. Check your connection and try again.");
        return;
      }
      setSending(false);
    } else setFinal(false); // a demo or preview: nothing is stored, so they can try every answer
    if (result === "yes") showYes(); else if (result === "no") showNo(); else showTime();
  };
  const yes = () => choose("yes");
  const time = () => choose("later");
  const no = () => choose("no");

  const back = () => {
    if (final) return; // a final answer stays
    stopRain();
    setPhase("ask");
    sound.sfx.chime();
  };

  return (
    <div ref={ref} className={`pr-stage ${phase}`} data-kind={kind}>
      <div className="pr-stars" aria-hidden />
      {phase === "no" && <div className="pr-rain" aria-hidden>{Array.from({ length: 46 }, (_, i) => <i key={i} style={{ left: `${(i * 21.7) % 100}%`, animationDelay: `${-((i * 37) % 17) / 10}s`, animationDuration: `${0.7 + ((i * 13) % 6) / 10}s` }} />)}</div>}

      {(phase === "wait" || phase === "ask") && (
        <div className="pr-stage-in">
          <p className="pr-kick">{phase === "wait" ? "One more thing…" : `${sender} asks`}</p>
          <RingBox open={phase === "ask"} kind={kind} onClick={openBox} label={phase === "wait" ? "Open the box" : "The ring box"} />
          {phase === "wait" && <p className="pr-hint">Tap the box</p>}
          {phase === "ask" && (
            <>
              <h2 className="pr-q" aria-label={question}><span aria-hidden>{typed}</span><b className="pr-caret" aria-hidden>|</b></h2>
              <p className="pr-to">{name}, {done ? "take your time. Your answer is yours alone." : "…"}</p>
              <div className={`pr-answers ${done ? "show" : ""}`}>
                <button type="button" className="bd-btn pr-yes" onClick={yes} disabled={!done || sending}>{kind === "ring" ? "Yes! 💍" : "Yes! 💖"}</button>
                <button type="button" className="pr-soft" onClick={time} disabled={!done || sending}>I need a little time</button>
                <button type="button" className="pr-soft pr-soft-no" onClick={no} disabled={!done || sending}>I&apos;m sorry, I can&apos;t</button>
              </div>
              {err && <p className="pr-err" role="alert">{err}</p>}
            </>
          )}
        </div>
      )}

      {phase === "yes" && (
        <div className="pr-stage-in pr-yes-in" role="status">
          <p className="pr-kick">{kind === "ring" ? "And the answer is" : "And the answer is"}</p>
          <h2 className="pr-yes-title">YES!</h2>
          <OnFinger kind={kind} />
          <p className="pr-yes-line">{name} said yes to {sender}. {kind === "ring" ? "We're engaged!" : "We're officially together!"} 🎉</p>
          <p className="pr-yes-sub">{kind === "ring" ? "Here's to a lifetime of love, laughter and a very big wedding." : "Here's to every adventure, every laugh and every tomorrow together."}</p>
          <button type="button" className="pr-link" onClick={() => onYes?.()}>Celebrate again ✨</button>
          {onReply && <ReplyBox className="pr-reply" sender={sender} onReply={onReply} previous={response?.replies || []} title={`Tell ${sender} how you feel`} chips={["I love you 💖", "I'm so happy!", "Can't wait"]} />}
        </div>
      )}

      {phase === "time" && (
        <div className="pr-stage-in pr-calm" role="status">
          <Moon className="pr-moon" />
          <h2 className="pr-sad-title">Take all the time you need</h2>
          <p className="pr-sad-text">Thank you for being honest with me, {name}. There is no hurry and no pressure at all. Whatever you decide, you matter to me, and I am grateful to have you in my life. I&apos;ll be right here.</p>
          <div className="pr-sad-jewel"><Jewel kind={kind} className="pr-sleep" /></div>
          {!final && <button type="button" className="pr-link" onClick={back}>Let me answer again</button>}
          {onReply && <ReplyBox className="pr-reply" sender={sender} onReply={onReply} previous={response?.replies || []} title="Want to tell them something?" chips={["Thank you for understanding", "I need a little time"]} />}
        </div>
      )}

      {phase === "no" && (
        <div className="pr-stage-in pr-sad" role="status">
          <BrokenHeart className="pr-broken" />
          <h2 className="pr-sad-title">Thank you for telling me honestly</h2>
          <p className="pr-sad-text">That took courage, and I respect it completely. My heart feels a little heavy, but I am so grateful for everything we have shared. I will always wish you happiness, {name}.</p>
          <p className="pr-sad-sign">With love, {sender}</p>
          {!final && <button type="button" className="pr-link" onClick={back}>Let me answer again</button>}
          {onReply && <ReplyBox className="pr-reply" sender={sender} onReply={onReply} previous={response?.replies || []} title="Want to tell them something?" chips={["I'm sorry", "Thank you for understanding"]} />}
        </div>
      )}
    </div>
  );
}
