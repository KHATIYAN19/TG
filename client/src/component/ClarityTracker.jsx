import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { clarityIdentify, clarityEvent } from "../lib/clarity";
import Clarity from "@microsoft/clarity";

// Links Clarity sessions to logged-in users and tags each SPA route.
export default function ClarityTracker() {
  const user = useSelector((s) => s.auth?.user);
  const { pathname } = useLocation();

  useEffect(() => {
    clarityIdentify(user);
  }, [user]);

  useEffect(() => {
    try {
      Clarity.setTag("page", pathname);
    } catch {
      /* ignore */
    }
    clarityEvent("pageview");
  }, [pathname]);

  return null;
}
