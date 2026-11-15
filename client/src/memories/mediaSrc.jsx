/*
  Which file of a video to play. The server makes a web-ready 1080p copy (`url`, starts playing after the first few hundred KB) and, for
  big sources, a lighter 720p copy (`lowUrl`). On a slow or data-saving connection the lighter one is used so it never stalls.
  Falls back to the original when the fast copies are not ready yet.
*/
export function pickVideo(v) {
  if (!v) return undefined;
  try {
    const c = navigator.connection;
    const slow = c && (c.saveData || /(^|-)2g$|3g/.test(c.effectiveType || "") || (c.downlink && c.downlink < 2.5));
    if (slow && v.lowUrl) return v.lowUrl;
  } catch { /* keep the main one */ }
  return v.url;
}

/**
 * A video whose fast copy is still being made. Its original may not start until it has fully downloaded (phone videos keep their index at
 * the end), so a short "preparing" card is shown with a "Try anyway" button instead of a player that sits there buffering.
 */
export function Preparing({ poster, onTry }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", padding: 16, color: "#fff", background: poster ? `center / cover url(${poster})` : "#2a1a26" }}>
      <div style={{ background: "rgba(0,0,0,.55)", borderRadius: 14, padding: "12px 16px", maxWidth: 260 }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Getting this video ready…</p>
        <p style={{ margin: "4px 0 10px", fontSize: ".8rem", opacity: .85 }}>It will play instantly in a minute or two.</p>
        <button type="button" onClick={onTry} style={{ border: 0, borderRadius: 999, padding: "6px 14px", fontWeight: 600, cursor: "pointer" }}>Try anyway</button>
      </div>
    </div>
  );
}
