import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";

import { getPaymentStatus } from "./memApi";
import AppShell from "./AppShell";
import { trackPaid } from "./metaTracking";
import { Button } from "./ui";

/*
  Where a redirect gateway (Cashfree, PayU) sends the browser back to. The URL only says what the gateway told us,
  so we ask OUR server for the real status of the order (it asks the gateway), and keep asking for a short while if it's still pending.
*/
export default function MemoriesPaymentResult() {
  const token = useSelector((s) => s.auth?.token);
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const order = params.get("order") || "";
  const hinted = params.get("status");
  const [state, setState] = useState(order ? "checking" : "failed"); // checking | paid | pending | failed
  const tries = useRef(0);

  useEffect(() => {
    if (!token || !order) return undefined;
    let live = true;
    let timer;
    const check = async () => {
      try {
        const r = await getPaymentStatus(order);
        if (!live) return;
        if (r.status === "paid") { trackPaid(order); setState("paid"); timer = setTimeout(() => navigate("/memories/app", { replace: true, state: { welcome: "payment" } }), 2200); return; }
        if (r.status === "failed") return setState("failed");
        if (++tries.current < 10) { setState("checking"); timer = setTimeout(check, 3000); } else setState("pending");
      } catch {
        if (live) setState("pending");
      }
    };
    check();
    return () => { live = false; clearTimeout(timer); };
  }, [token, order, navigate]);

  if (!token) return <Navigate to="/memories/login" replace state={{ from: location }} />;

  const view = {
    checking: [Clock3, "text-amber-500", "Confirming your payment…", "Please wait a moment. Don't close this page."],
    paid: [CheckCircle2, "text-emerald-500", "Payment received!", "1 page credit has been added. Taking you to the templates…"],
    pending: [Clock3, "text-amber-500", "Still waiting for the bank", "We haven't received confirmation yet. If money was deducted, your credit will appear automatically within a few minutes."],
    failed: [AlertTriangle, "text-rose-500", hinted === "failed" ? "The payment didn't go through" : "We couldn't confirm a payment", "Nothing was charged for a failed payment. You can try again whenever you're ready."],
  }[state];
  const [Icon, tone, title, text] = view;

  return (
    <AppShell title="Payment">
      <div className="mx-auto max-w-md py-16 text-center" role="status" aria-live="polite">
        <div className="rounded-[28px] border border-rose-100 bg-white p-8 shadow-xl shadow-rose-100/60">
          <Icon className={`mx-auto h-14 w-14 ${tone} ${state === "checking" ? "animate-pulse" : ""}`} aria-hidden />
          <h1 className="mt-4 text-xl font-bold text-[#3a1530]">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#7a5370]">{text}</p>
          <div className="mt-6 flex flex-col gap-2">
            {state === "paid" && <Button as={Link} to="/memories/app" size="lg">Choose a template</Button>}
            {(state === "failed" || state === "pending") && <Button as={Link} to="/memories/app/pay" size="lg">{state === "failed" ? "Try again" : "Back to payment"}</Button>}
            {state === "pending" && <Button as={Link} to="/memories/app" variant="soft">Check my credits</Button>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
