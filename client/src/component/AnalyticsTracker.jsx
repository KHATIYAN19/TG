import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../lib/analytics";

// Reports every frontend route change to the backend.
export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location);
  }, [location.pathname, location.search]);

  return null;
}
