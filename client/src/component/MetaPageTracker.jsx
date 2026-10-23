
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../lib/metaPixel";

export default function MetaPageTracker() {
  const location = useLocation();
  const previousRoute = useRef(null);

  useEffect(() => {
    const currentRoute =
      location.pathname + location.search;

    // Initial load already tracked in index.html
    if (previousRoute.current === null) {
      previousRoute.current = currentRoute;
      return;
    }

    // Track only when the route changes
    if (previousRoute.current !== currentRoute) {
      previousRoute.current = currentRoute;
      trackPageView();
    }
  }, [location.pathname, location.search]);

  return null;
}
