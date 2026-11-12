import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useEmbed, useLivePreview } from "../../chrome";
import { withDemoVoice } from "../../VoiceNote";

import BirthdayPage from "./BirthdayPage";
import SenderEditor, { CustomizeButton } from "./SenderEditor";
import { DUMMY_BIRTHDAY } from "./dummy";
import { DEFAULT_THEME, THEMES } from "./themes";

/*
  /memories/preview/birthday : the birthday page with dummy data, plus the SENDER's customize panel
  (theme, names, message, gifts, wishes) so the choices can be tried live. Edits are kept on this device.
  ?theme=love|friendship|candy|citrus|dreamy|midnight|tropical|galaxy picks the starting look.
*/
const KEY = "memories:bd:preview:v3";
const SIG = JSON.stringify(DUMMY_BIRTHDAY); // saved edits are dropped when the demo data changes, so stale copies never hide new photos, videos or names
const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); return s && s.sig === SIG ? s : null; } catch { return null; } };

export default function BirthdayPreview() {
  const [params] = useSearchParams();
  const asked = params.get("theme");
  const embed = useEmbed();
  const saved = embed ? null : load();

  const [data, setData] = useState(saved?.data || DUMMY_BIRTHDAY);
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
