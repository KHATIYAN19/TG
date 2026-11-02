// Build-time prerender entry (loaded through Vite's ssrLoadModule by
// scripts/prerender.mjs). Not part of the browser bundle.
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";

import store from "./Redux/store.js";

export function renderPage(Component, url) {
  const helmetContext = {};

  const body = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <Provider store={store}>
          <Component />
        </Provider>
      </StaticRouter>
    </HelmetProvider>
  );

  const h = helmetContext.helmet;

  const head = h
    ? [
        h.title.toString(),
        h.priority?.toString() || "",
        h.meta.toString(),
        h.link.toString(),
        h.script.toString(),
      ].join("\n")
    : "";

  return { body, head };
}
