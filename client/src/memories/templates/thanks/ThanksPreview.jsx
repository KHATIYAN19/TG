import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useEmbed, useLivePreview } from "../../chrome";

import ThanksPage from "./ThanksPage";
import SenderEditor, { CustomizeButton } from "../birthday/SenderEditor";
import { AUDIENCES } from "./audiences";
import { DUMMY_THANKS } from "./dummy";
import { DEFAULT_THEME, THEMES } from "./themes";
import { EDITOR } from "./editor";

/*
  /memories/preview/thanks : the Thank You page with dummy data plus the SENDER's customize panel
  (who you are thanking, theme, greeting, people, reasons, moments, numbers, gifts, promises, letter).
  Edits are kept on this device. ?theme=harvest|cozy|sunshine|professional|meadow|twilight picks the look,
  ?audience=friend|family|colleague|team|mentor|community picks the wording.
*/
const KEY = "memories:thanks:preview:v2";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };

export default function ThanksPreview() {
  const [params] = useSearchParams();
  const askedTheme = params.get("theme");
  const askedAud = params.get("audience");
  const embed = useEmbed();
  const saved = embed ? null : load();

  const [data, setData] = useState(() => {
    const base = saved?.data || DUMMY_THANKS;
    return AUDIENCES.some((a) => a.id === askedAud) ? { ...base, audience: askedAud } : base;
  });
  const [themeId, setThemeId] = useState(THEMES[askedTheme] ? askedTheme : saved?.themeId || DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  useLivePreview(embed, DUMMY_THANKS, setData, setThemeId);

  useEffect(() => { if (embed) return; try { localStorage.setItem(KEY, JSON.stringify({ data, themeId })); } catch { /* storage blocked */ } }, [data, themeId]);
  const reset = () => { setData(DUMMY_THANKS); setThemeId(DEFAULT_THEME); };

  return (
    <>
      <ThanksPage data={data} theme={themeId} />
      {!embed && <CustomizeButton onClick={() => setOpen(true)} giftCount={data.gifts?.length || 0} />}
      {!embed && <SenderEditor open={open} onClose={() => setOpen(false)} data={data} onData={setData} themeId={themeId} onTheme={setThemeId} onReset={reset} config={EDITOR} />}
    </>
  );
}
