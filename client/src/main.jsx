
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App.jsx";
// import "./index.css";

// import ScrollTop from "./component/ScrollTop.jsx";
import { initDeviceHint } from "./lib/authSession.js";
// import MetaPageTracker from "./component/MetaPageTracker.jsx";

// import { BrowserRouter } from "react-router-dom";

// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import { Provider } from "react-redux";
// import store from "./Redux/store.js";

// import { HelmetProvider } from "react-helmet-async";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <HelmetProvider>
//       <BrowserRouter>
//         {/* Scroll to top on route changes */}
//         <ScrollTop />

//         {/* Track Meta Pixel PageView on SPA navigation */}
//         <MetaPageTracker />

//         {/* Redux application */}
//         <Provider store={store}>
//           <App />
//         </Provider>

//         {/* Global toast notifications */}
//         <ToastContainer />
//       </BrowserRouter>
//     </HelmetProvider>
//   </React.StrictMode>
// );
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import "./index.css";
import "./styles/forms.css";

// Components
import ScrollTop from "./component/ScrollTop.jsx";
import NavProgress from "./component/NavProgress.jsx";
import MetaPageTracker from "./component/MetaPageTracker.jsx";
import ClarityTracker from "./component/ClarityTracker.jsx";
import { initClarity } from "./lib/clarity.js";
import { installRoutePrefetch } from "./lib/routePrefetch.js";

// React Router
import { BrowserRouter } from "react-router-dom";

// Toast notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Redux
import { Provider } from "react-redux";
import store from "./Redux/store.js";

// SEO
import { HelmetProvider } from "react-helmet-async";

import { captureAttribution } from "./lib/attribution.js";
import { onConsentChange } from "./lib/consent.js";
import { ensureGoogleAdsTag } from "./lib/googleAds.js";

// Remember paid-ad clicks (Meta / Google) before the app renders.
captureAttribution();
// Google Ads tag (always on, like Meta Pixel); does nothing until VITE_GOOGLE_ADS_ID is set.
ensureGoogleAdsTag();

// Analytics starts only after the visitor opts in; sales measurement is always on (lib/consent.js).
// A change made later in this page view applies straight away; Meta Pixel's own loader lives in index.html.
initClarity();
onConsentChange((choice) => {
  if (choice.analytics) initClarity();
  if (choice.marketing) window.__ttLoadMetaPixel?.();
});

// After a new deploy, an open tab may request lazy chunks whose hashed
// filenames no longer exist. Reload once to pick up the new build.
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  try {
    const last = Number(sessionStorage.getItem("tt_chunk_reload") || 0);
    if (Date.now() - last < 10000) return; // avoid reload loops
    sessionStorage.setItem("tt_chunk_reload", String(Date.now()));
  } catch {
    /* storage unavailable */
  }
  window.location.reload();
});

// ============================================
// ROOT ELEMENT
// ============================================

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "React root element not found. Check index.html."
  );
}

// ============================================
// INITIALIZE REACT
// ============================================

initDeviceHint();
installRoutePrefetch();

// A prerendered page already sits in #root. Keep its HTML so the app can show it (styled, via the
// page's own <link>s) while the route's code loads, instead of wiping it for a spinner.
if (rootElement.firstElementChild) {
  window.__PRERENDER__ = { path: window.location.pathname.replace(/\/+$/, "") || "/", html: rootElement.innerHTML };
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter future={{ v7_startTransition: true }}>

        {/* Scroll to top on route changes */}
        <ScrollTop />

        {/* Top progress bar while the next page's code loads */}
        <NavProgress />

        {/* Meta Pixel SPA navigation tracking */}
        <MetaPageTracker />

        {/* Redux provider */}
        <Provider store={store}>
          <ClarityTracker />
          <App />
        </Provider>

        {/* Global toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />

      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);