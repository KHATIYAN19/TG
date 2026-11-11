import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useEmbed, useLivePreview } from "../../chrome";
import { withDemoVoice } from "../../VoiceNote";

import SorryPage from "./SorryPage";
import SenderEditor, { CustomizeButton } from "../birthday/SenderEditor";
import { DUMMY_SORRY } from "./dummy";
import { DEFAULT_THEME, THEMES } from "./themes";
import { EDITOR } from "./editor";

/*
  /memories/preview/sorry : the Sorry page with dummy data plus the SENDER's customize panel
  (theme, names, apology, promises, peace offerings, sweet lines). Edits are kept on this device.
  ?theme=teddy|rain|rose|starry|sunflower|friends picks the starting look.
*/
const KEY = "memories:sorry:preview";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } };

export default function SorryPreview() {
  const [params] = useSearchParams();
  const asked = params.get("theme");
  const embed = useEmbed();
  const saved = embed ? null : load();

  const [data, setData] = useState(saved?.data || DUMMY_SORRY);
  const [themeId, setThemeId] = useState(THEMES[asked] ? asked : saved?.themeId || DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  useLivePreview(embed, DUMMY_SORRY, setData, setThemeId);

  useEffect(() => { if (embed) return; try { localStorage.setItem(KEY, JSON.stringify({ data, themeId })); } catch { /* storage blocked */ } }, [data, themeId]);
  const reset = () => { setData(DUMMY_SORRY); setThemeId(DEFAULT_THEME); };

  return (
    <>
      <SorryPage data={withDemoVoice(data)} theme={themeId} />
      {!embed && <CustomizeButton onClick={() => setOpen(true)} giftCount={data.gifts?.length || 0} />}
      {!embed && <SenderEditor open={open} onClose={() => setOpen(false)} data={data} onData={setData} themeId={themeId} onTheme={setThemeId} onReset={reset} config={EDITOR} />}
    </>
  );
}
