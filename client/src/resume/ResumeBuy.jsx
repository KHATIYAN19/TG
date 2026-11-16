import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { fetchPackages } from "./api";
import PlanPicker, { usePlanBuy } from "./PlanPicker";
import { Kicker } from "./ui";

/* The signed-in "Plans" tab: every plan, bought in place. Sending in the resume comes after payment. */
export default function ResumeBuy() {
  const [params] = useSearchParams();
  const [packs, setPacks] = useState(null);
  const [failed, setFailed] = useState(false);
  const buyer = usePlanBuy();
  useEffect(() => { fetchPackages().then(setPacks).catch(() => setFailed(true)); }, []);
  return (
    <div>
      <div style={{ maxWidth: 640, marginBottom: 32 }}>
        <Kicker>Plans</Kicker>
        <h1 className="rv-h2" style={{ marginTop: 16 }}>Choose a plan and pay</h1>
        <p className="rv-lead" style={{ marginTop: 12 }}>You pay first. Right after, you'll be asked for your details and resume.</p>
      </div>
      <PlanPicker packs={packs} failed={failed} buyer={buyer} highlight={params.get("package") || ""} center={false} />
      <p className="rv-xs rv-subtle" style={{ marginTop: 24 }}>Secure payment by UPI, card or netbanking. One-time payment, no subscription. Plans cannot be cancelled once bought. You can buy more than one plan and the reviews add up.</p>
    </div>
  );
}
