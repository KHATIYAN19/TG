import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Stop browser from restoring the previous scroll position
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Wait until the new route has rendered
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);

      // Extra fallback
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;