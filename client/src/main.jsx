
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App.jsx";
// import "./index.css";

// import ScrollTop from "./component/ScrollTop.jsx";
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

// Components
import ScrollTop from "./component/ScrollTop.jsx";
import MetaPageTracker from "./component/MetaPageTracker.jsx";
import AnalyticsTracker from "./component/AnalyticsTracker.jsx";

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

// Remember paid-ad clicks (Meta / Google) before the app renders.
captureAttribution();

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

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>

        {/* Scroll to top on route changes */}
        <ScrollTop />

        {/* Meta Pixel SPA navigation tracking */}
        <MetaPageTracker />

        {/* First-party analytics (visitors, routes, live users) */}
        <AnalyticsTracker />

        {/* Redux provider */}
        <Provider store={store}>
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