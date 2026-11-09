import { useEffect, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

const KEY_V = "memories:bd:volume";
const KEY_M = "memories:bd:muted";
const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, String(v)); } catch { /* storage blocked */ } };

/* Volume, mute and "play the song again". Remembers the choice on this device. */
export default function VolumeControl({ sound, visible, songPlaying, onToggleSong, songReady }) {
  const [vol, setVol] = useState(() => Number(read(KEY_V, 0.7)));
  const [muted, setMuted] = useState(() => read(KEY_M, "false") === "true");

  useEffect(() => { sound?.setVolume(vol); write(KEY_V, vol); }, [sound, vol]);
  useEffect(() => { sound?.setMuted(muted); write(KEY_M, muted); }, [sound, muted]);

  const off = muted || vol === 0;
  return (
    <div className={`bd-vol ${visible ? "" : "hidden"}`} role="group" aria-label="Sound controls">
      {songReady && (
        <button type="button" onClick={onToggleSong} aria-label={songPlaying ? "Stop the birthday song" : "Play the birthday song"} title={songPlaying ? "Stop song" : "Play song"}>
          {songPlaying ? <span className="bd-eq" aria-hidden><i /><i /><i /><i /></span> : <Play className="h-4 w-4" fill="currentColor" aria-hidden />}
          {songPlaying && <Pause className="sr-only" />}
        </button>
      )}
      <button type="button" onClick={() => setMuted((m) => !m)} aria-label={off ? "Unmute" : "Mute"} aria-pressed={off}>
        {off ? <VolumeX className="h-[18px] w-[18px]" aria-hidden /> : <Volume2 className="h-[18px] w-[18px]" aria-hidden />}
      </button>
      <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : vol} aria-label="Volume"
        onChange={(e) => { const v = Number(e.target.value); setVol(v); if (v > 0) setMuted(false); }} />
    </div>
  );
}
