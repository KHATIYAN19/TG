import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import ScrollToTop from "./component/ScrollTop.jsx";
import { BrowserRouter } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Provider } from "react-redux";
import store from "./Redux/store.js";

import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
       <ScrollToTop />
        <Provider store={store}>
          <App />
        </Provider>

        <ToastContainer />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);