import { useEffect } from "react";

/*
  Shared helpers for the payment flow (checkout modal, success page, failed page).
  - loadPayFonts(): injects the same Google fonts /resume-review uses, once.
  - copyText(): clipboard copy with a fallback for browsers / webviews that block the Clipboard API.
*/

const FONTS_ID = "tt-pay-fonts";
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Geist+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap";

export function loadPayFonts() {
  if (typeof document === "undefined" || document.getElementById(FONTS_ID)) return;
  const link = document.createElement("link");
  link.id = FONTS_ID;
  link.rel = "stylesheet";
  link.href = FONTS_HREF;
  document.head.appendChild(link);
}

export function usePayFonts() {
  useEffect(() => {
    loadPayFonts();
  }, []);
}

export async function copyText(text) {
  const value = String(text ?? "");
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      area.setSelectionRange(0, value.length);
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}
