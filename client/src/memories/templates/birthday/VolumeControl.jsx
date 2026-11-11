import { useEffect, useRef, useState } from "react";
import { Play, Volume, Volume1, Volume2, VolumeX } from "lucide-react";

const KEY_V = "memories:bd:volume";
const KEY_M = "memories:bd:muted";
const DEFAULT_VOL = 0.7;
const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, String(v)); } catch { /* storage blocked */ } };
const clamp01 = (v, d = DEFAULT_VOL) => { const n = Number(v); return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : d; };

/* the page's own videos (the ones with player controls; silent thumbnails are left alone) */
const pageVideos = () => [...document.querySelectorAll("video[controls]")];

/*
  ONE volume for the whole page: the music, every sound effect and the videos all follow this control, and the icon and the
  slider always show what you actually hear. Changing the volume on a video's own player moves this control too.
  It also makes the page go quiet the moment it is not on screen (another tab, a locked phone, a closed or scrolled-away
  preview) and carry on when it is back. The choice is remembered on this device.
*/
export default function VolumeControl({ sound, visible, songPlaying, onToggleSong, songReady }) {
  const [vol, setVol] = useState(() => clamp01(read(KEY_V, DEFAULT_VOL)));
  const [muted, setMuted] = useState(() => read(KEY_M, "false") === "true");
  const lastVol = useRef(vol > 0 ? vol : DEFAULT_VOL); // what "unmute" goes back to
  if (vol > 0) lastVol.current = vol;

  const off = muted || vol === 0;
  const level = off ? 0 : vol;
  const state = useRef({ vol, off });
  state.current = { vol, off };

  // the music and sound effects
  useEffect(() => { sound?.setVolume(vol); write(KEY_V, vol); }, [sound, vol]);
  useEffect(() => { sound?.setMuted(off); write(KEY_M, muted); }, [sound, off, muted]);

  // the videos: same volume, same mute. A video that starts later picks it up as it starts.
  useEffect(() => {
    const apply = (v) => { if (Math.abs(v.volume - vol) > 0.01) v.volume = vol; if (v.muted !== off) v.muted = off; };
    pageVideos().forEach(apply);
    const onPlay = (e) => { if (e.target instanceof HTMLVideoElement && e.target.controls) apply(e.target); };
    document.addEventListener("play", onPlay, true);
    return () => document.removeEventListener("play", onPlay, true);
  }, [vol, off]);

  // someone used a video's own volume button or slider: follow it
  useEffect(() => {
    const onChange = (e) => {
      const v = e.target;
      if (!(v instanceof HTMLVideoElement) || !v.controls) return;
      const now = state.current;
      const videoOff = v.muted || v.volume === 0;
      if (videoOff !== now.off) {
        if (videoOff) setMuted(true);
        else { setMuted(false); setVol(v.volume > 0 ? clamp01(v.volume) : lastVol.current); }
      } else if (!videoOff && Math.abs(v.volume - now.vol) > 0.01) setVol(clamp01(v.volume));
    };
    document.addEventListener("volumechange", onChange, true);
    return () => document.removeEventListener("volumechange", onChange, true);
  }, []);

  // another copy of the page on this device (e.g. the preview next to the form) changed the volume
  useEffect(() => {
    const onStore = (e) => {
      if (e.key === KEY_V && e.newValue != null) setVol(clamp01(e.newValue));
      if (e.key === KEY_M && e.newValue != null) setMuted(e.newValue === "true");
    };
    window.addEventListener("storage", onStore);
    return () => window.removeEventListener("storage", onStore);
  }, []);

  // not on screen = not a sound. Hidden tab, locked phone, closed app, or (inside a preview frame) scrolled out of view.
  useEffect(() => {
    if (!sound) return undefined;
    sound.wake?.();
    let inView = true;
    let paused = [];
    const sync = () => {
      const quiet = document.hidden || !inView;
      if (quiet) {
        sound.hold?.();
        pageVideos().forEach((v) => { if (!v.paused) { paused.push(v); v.pause(); } });
      } else {
        sound.release?.();
        paused.forEach((v) => { if (v.isConnected) v.play().catch(() => {}); });
        paused = [];
      }
    };
    const leave = () => { sound.hold?.(); pageVideos().forEach((v) => v.pause()); };
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", sync);

    let io = null;
    let framed = false;
    try { framed = window.self !== window.top; } catch { framed = true; }
    if (framed && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0 });
      io.observe(document.documentElement);
    }
    return () => {
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("pageshow", sync);
      io?.disconnect();
    };
  }, [sound]);

  const toggleMute = () => {
    if (off) { setMuted(false); if (vol === 0) setVol(lastVol.current); }
    else setMuted(true);
  };
  const slide = (e) => {
    const v = clamp01(e.target.value, 0);
    setVol(v);
    setMuted(false);
  };

  const Icon = level === 0 ? VolumeX : level < 0.34 ? Volume : level < 0.67 ? Volume1 : Volume2;
  const pct = Math.round(level * 100);
  return (
    <div className={`bd-vol ${visible ? "" : "hidden"}`} data-off={off || undefined} role="group" aria-label="Sound controls">
      {songReady && (
        <button type="button" onClick={onToggleSong} aria-label={songPlaying ? "Stop the song" : "Play the song"} title={songPlaying ? "Stop song" : "Play song"}>
          {songPlaying ? <span className="bd-eq" data-off={off || undefined} aria-hidden><i /><i /><i /><i /></span> : <Play className="h-4 w-4" fill="currentColor" aria-hidden />}
        </button>
      )}
      <button type="button" className="bd-vol-mute" onClick={toggleMute} aria-label={off ? "Turn sound on" : "Turn sound off"} aria-pressed={off} title={off ? "Sound is off" : `Volume ${pct}%`}>
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </button>
      <input type="range" min="0" max="1" step="0.05" value={level} aria-label="Volume" aria-valuetext={off ? "Sound off" : `${pct}%`}
        style={{ "--v": `${pct}%` }} onChange={slide} />
    </div>
  );
}
