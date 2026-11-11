import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useEmbed, useLivePreview } from "../../chrome";
import { withDemoVoice } from "../../VoiceNote";

import AnniversaryPage from "./AnniversaryPage";
import SenderEditor, { CustomizeButton } from "../birthday/SenderEditor";
import { DUMMY_ANNIVERSARY } from "./dummy";
import { DEFAULT_THEME, THEMES } from "./themes";
import { EDITOR } from "./editor";

/*
  /memories/preview/anniversary : the Anniversary page with dummy data plus the SENDER's customize panel
  (theme, anniversary date, story, reasons, numbers, gifts, promises, wishes). Edits are kept on this device.
  ?theme=lovey|golden|candlelight|garden|sunset picks the starting look.
*/
const KEY = "memories:anniversary:preview";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };

export default function AnniversaryPreview() {
  const [params] = useSearchParams();
  const asked = params.get("theme");
  const embed = useEmbed();
  const saved = embed ? null : load();

  const [data, setData] = useState(saved?.data || DUMMY_ANNIVERSARY);
  const [themeId, setThemeId] = useState(THEMES[asked] ? asked : saved?.themeId || DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  useLivePreview(embed, DUMMY_ANNIVERSARY, setData, setThemeId);

  useEffect(() => { if (embed) return; try { localStorage.setItem(KEY, JSON.stringify({ data, themeId })); } catch { /* storage blocked */ } }, [data, themeId]);
  const reset = () => { setData(DUMMY_ANNIVERSARY); setThemeId(DEFAULT_THEME); };

  return (
    <>
      <AnniversaryPage data={withDemoVoice(data)} theme={themeId} />
      {!embed && <CustomizeButton onClick={() => setOpen(true)} giftCount={data.gifts?.length || 0} />}
      {!embed && <SenderEditor open={open} onClose={() => setOpen(false)} data={data} onData={setData} themeId={themeId} onTheme={setThemeId} onReset={reset} config={EDITOR} />}
    </>
  );
}
