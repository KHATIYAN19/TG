import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useEmbed, useLivePreview } from "../../chrome";
import { withDemoVoice } from "../../VoiceNote";

import ProposalPage from "./ProposalPage";
import SenderEditor, { CustomizeButton } from "../birthday/SenderEditor";
import { DUMMY_PROPOSAL } from "./dummy";
import { DEFAULT_THEME, THEMES } from "./themes";
import { EDITOR } from "./editor";

/*
  /memories/preview/proposal : the Proposal page with dummy data plus the SENDER's customize panel
  (theme, the question, story, reasons, vows, letter). Edits are kept on this device.
  ?theme=romance|starlit|blossom|fairytale|sunrise picks the starting look.
*/
const KEY = "memories:proposal:preview:v3";
const SIG = JSON.stringify(DUMMY_PROPOSAL); // saved edits are dropped when the demo data changes, so stale copies never hide new photos, videos or names
const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); return s && s.sig === SIG ? s : null; } catch { return null; } };

export default function ProposalPreview() {
  const [params] = useSearchParams();
  const asked = params.get("theme");
  const embed = useEmbed();
  const saved = embed ? null : load();

  const [data, setData] = useState(saved?.data || DUMMY_PROPOSAL);
  const [themeId, setThemeId] = useState(THEMES[asked] ? asked : saved?.themeId || DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  useLivePreview(embed, DUMMY_PROPOSAL, setData, setThemeId);

  useEffect(() => { if (embed) return; try { localStorage.setItem(KEY, JSON.stringify({ data, themeId, sig: SIG })); } catch { /* storage blocked */ } }, [data, themeId]);
  const reset = () => { setData(DUMMY_PROPOSAL); setThemeId(DEFAULT_THEME); };

  return (
    <>
      <ProposalPage data={withDemoVoice(data)} theme={themeId} />
      {!embed && <CustomizeButton onClick={() => setOpen(true)} giftCount={null} />}
      {!embed && <SenderEditor open={open} onClose={() => setOpen(false)} data={data} onData={setData} themeId={themeId} onTheme={setThemeId} onReset={reset} config={EDITOR} />}
    </>
  );
}
