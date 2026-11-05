import { useEffect, useRef, useState } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SRC = "https://accounts.google.com/gsi/client";

let loader = null;
const loadGsi = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  loader ||= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = () => { loader = null; reject(new Error("Google script failed to load")); };
    document.head.appendChild(s);
  });
  return loader;
};

export const googleEnabled = Boolean(CLIENT_ID);

/*
  Renders Google's own sign-in button. `onCredential` receives the Google ID
  token, which the server verifies; nothing is trusted from the browser.
*/
export default function GoogleButton({ onCredential, text = "continue_with", disabled = false }) {
  const box = useRef(null);
  const cb = useRef(onCredential);
  cb.current = onCredential;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return undefined;
    let cancelled = false;

    loadGsi()
      .then(() => {
        if (cancelled || !box.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (res) => res?.credential && cb.current?.(res.credential),
          ux_mode: "popup",
        });
        window.google.accounts.id.renderButton(box.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text,
          shape: "pill",
          width: Math.min(360, box.current.offsetWidth || 320),
        });
      })
      .catch(() => !cancelled && setFailed(true));

    return () => { cancelled = true; };
  }, [text]);

  if (!CLIENT_ID) return null;
  if (failed) {
    return <p className="text-center text-xs text-stone-500">Google sign-in couldn't load. Check your connection or ad-blocker.</p>;
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-60" : ""} aria-busy={disabled}>
      <div ref={box} className="flex w-full justify-center" />
    </div>
  );
}
