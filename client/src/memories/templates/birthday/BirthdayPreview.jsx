import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useEmbed, useLivePreview } from "../../chrome";
import { withDemoVoice } from "../../VoiceNote";

import BirthdayPage from "./BirthdayPage";
import SenderEditor, { CustomizeButton } from "./SenderEditor";
import { DUMMY_BIRTHDAY } from "./dummy";
import { DEFAULT_THEME, THEMES } from "./themes";
import { AUDIENCES, audienceFor } from "./audiences";

/*
  /memories/preview/birthday : the birthday page with dummy data, plus the SENDER's customize panel
  (look, who it is for, names, the wish question, gifts, reasons, coupons, moments) so the choices can be tried live.
  Edits are kept on this device. ?theme=<look id> picks the starting look and ?audience=partner|friend|parent|sibling|...
  who it is written for.
*/
const KEY = "memories:bd:preview:v4";
const SIG = JSON.stringify(DUMMY_BIRTHDAY); // saved edits are dropped when the demo data changes, so stale copies never hide new photos, videos or names
const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); return s && s.sig === SIG ? s : null; } catch { return null; } };

export default function BirthdayPreview() {
  const [params] = useSearchParams();
  const asked = params.get("theme");
  const askedAud = params.get("audience");
  const embed = useEmbed();
  const saved = embed ? null : load();

  const [data, setData] = useState(() => {
    const base = saved?.data || DUMMY_BIRTHDAY;
    return AUDIENCES.some((a) => a.id === askedAud) ? { ...base, audience: askedAud, question: audienceFor(askedAud).question } : base;
  });
  const [themeId, setThemeId] = useState(THEMES[asked] ? asked : saved?.themeId || DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  useLivePreview(embed, DUMMY_BIRTHDAY, setData, setThemeId);

  useEffect(() => { if (embed) return; try { localStorage.setItem(KEY, JSON.stringify({ data, themeId, sig: SIG })); } catch { /* storage blocked */ } }, [data, themeId]);

  const reset = () => { setData(DUMMY_BIRTHDAY); setThemeId(DEFAULT_THEME); };

  return (
    <>
      <BirthdayPage data={withDemoVoice(data)} theme={themeId} />
      {!embed && <CustomizeButton onClick={() => setOpen(true)} giftCount={data.gifts?.length || 0} />}
      {!embed && <SenderEditor open={open} onClose={() => setOpen(false)} data={data} onData={setData} themeId={themeId} onTheme={setThemeId} onReset={reset} />}
    </>
  );
}
