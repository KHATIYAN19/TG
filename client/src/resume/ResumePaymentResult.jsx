import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle, Clock, WarningCircle } from "@phosphor-icons/react";

import { getPaymentStatus } from "./api";
import { Btn, Page } from "./ui";

/*
  Where a redirect gateway (Cashfree, PayU) sends the browser back to. The URL only says what the gateway claimed, so we ask OUR
  server for the real status (it asks the gateway) and keep asking for a short while if it is still pending.
  Once paid, the next step is to send in the resume.
*/
export default function ResumePaymentResult() {
  const token = useSelector((s) => s.auth?.token);
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const purchase = params.get("purchase") || "";
  const hinted = params.get("status");
  const [state, setState] = useState(purchase ? "checking" : "failed");
  const tries = useRef(0);
  const next = `/resume-review/app/submit/${purchase}`;

  useEffect(() => {
    if (!token || !purchase) return undefined;
    let live = true; let timer;
    const check = async () => {
      try {
        const r = await getPaymentStatus(purchase);
        if (!live) return;
        if (r.status === "paid") { setState("paid"); timer = setTimeout(() => navigate(next, { replace: true }), 1800); return; }
        if (r.status === "failed") return setState("failed");
        if (++tries.current < 10) { setState("checking"); timer = setTimeout(check, 3000); } else setState("pending");
      } catch { if (live) setState("pending"); }
    };
    check();
    return () => { live = false; clearTimeout(timer); };
  }, [token, purchase, navigate, next]);

  if (!token) return <Navigate to="/resume-review/login" replace state={{ from: location }} />;

  const view = {
    checking: [Clock, "Confirming your payment…", "Please wait a moment. Don't close this page."],
    paid: [CheckCircle, "Payment received", "Taking you to the next step: sending in your resume."],
    pending: [Clock, "Still waiting for the bank", "We haven't had confirmation yet. If money was deducted, your plan appears by itself within a few minutes. You'll find it in My reviews."],
    failed: [WarningCircle, hinted === "failed" ? "The payment didn't go through" : "We couldn't confirm a payment", "Nothing is charged for a failed payment. You can choose a plan again whenever you're ready."],
  }[state];
  const [Icon, title, text] = view;

  return (
    <Page title="Payment | Resume Lab">
      <main className="rv-shell" style={{ padding: "64px 0 120px" }}>
        <div className="rv-card rv-in" style={{ maxWidth: 440, margin: "0 auto", padding: 40, textAlign: "center" }} role="status" aria-live="polite">
          <Icon size={56} weight="duotone" aria-hidden style={{ margin: "0 auto" }} />
          <h1 className="rv-h3" style={{ marginTop: 20 }}>{title}</h1>
          <p className="rv-muted rv-sm" style={{ marginTop: 10 }}>{text}</p>
          <div style={{ display: "grid", gap: 8, marginTop: 28 }}>
            {state === "paid" && <Btn as={Link} to={next} replace size="lg">Send in my resume</Btn>}
            {state === "failed" && <Btn as={Link} to="/resume-review/app/plans" size="lg">Choose a plan</Btn>}
            {state === "pending" && <Btn as={Link} to="/resume-review/app" size="lg">My reviews</Btn>}
          </div>
        </div>
      </main>
    </Page>
  );
}
