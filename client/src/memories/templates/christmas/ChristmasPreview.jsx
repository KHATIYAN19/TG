import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useEmbed, useLivePreview } from "../../chrome";
import { withDemoVoice } from "../../VoiceNote";

import ChristmasPage from "./ChristmasPage";
import SenderEditor, { CustomizeButton } from "../birthday/SenderEditor";
import { AUDIENCES } from "./audiences";
import { DUMMY_CHRISTMAS } from "./dummy";
import { DEFAULT_THEME, THEMES } from "./themes";
import { EDITOR } from "./editor";

/*
  /memories/preview/christmas : the Christmas page with dummy data plus the SENDER's customize panel
  (who you are thanking, theme, greeting, people, reasons, moments, numbers, gifts, promises, letter).
  Edits are kept on this device. ?theme=classic|snowy|gingerbread|aurora|golden picks the look,
  ?audience=partner|friend|family|colleague picks the wording.
*/
const KEY = "memories:christmas:preview:v3";
const SIG = JSON.stringify(DUMMY_CHRISTMAS); // saved edits are dropped when the demo data changes, so stale copies never hide new photos, videos or names
const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); return s && s.sig === SIG ? s : null; } catch { return null; } };

export default function ChristmasPreview() {
  const [params] = useSearchParams();
  const askedTheme = params.get("theme");
  const askedAud = params.get("audience");
  const embed = useEmbed();
  const saved = embed ? null : load();

  const [data, setData] = useState(() => {
    const base = saved?.data || DUMMY_CHRISTMAS;
    return AUDIENCES.some((a) => a.id === askedAud) ? { ...base, audience: askedAud } : base;
  });
  const [themeId, setThemeId] = useState(THEMES[askedTheme] ? askedTheme : saved?.themeId || DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  useLivePreview(embed, DUMMY_CHRISTMAS, setData, setThemeId);

  useEffect(() => { if (embed) return; try { localStorage.setItem(KEY, JSON.stringify({ data, themeId, sig: SIG })); } catch { /* storage blocked */ } }, [data, themeId]);
  const reset = () => { setData(DUMMY_CHRISTMAS); setThemeId(DEFAULT_THEME); };

  return (
    <>
      <ChristmasPage data={withDemoVoice(data)} theme={themeId} />
      {!embed && <CustomizeButton onClick={() => setOpen(true)} giftCount={data.gifts?.length || 0} />}
      {!embed && <SenderEditor open={open} onClose={() => setOpen(false)} data={data} onData={setData} themeId={themeId} onTheme={setThemeId} onReset={reset} config={EDITOR} />}
    </>
  );
}
