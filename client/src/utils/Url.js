export const DEFAULT_BACKEND_URL = "https://tg-540700086743.asia-south2.run.app";

const BASE_URL = String(import.meta.env.VITE_BASE_URL || DEFAULT_BACKEND_URL).replace(/\/+$/, "");

export default BASE_URL;
