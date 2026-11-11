// Single source of truth for this backend's own public URL.
// Uses BACKEND_URL from the environment, else the Cloud Run service URL.
export const DEFAULT_BACKEND_URL = "https://tg-540700086743.asia-south2.run.app";

export const BACKEND_URL = String(process.env.BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");

// Public URL of the website. Uses FRONTEND_URL from the environment, else the live site.
export const DEFAULT_FRONTEND_URL = "https://www.targettrek.in";

export const FRONTEND_URL = String(process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL).replace(/\/+$/, "");

// Same as FRONTEND_URL but read at call time (for code that must see env changes after startup).
export const getFrontendUrl = () => String(process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL).replace(/\/+$/, "");
