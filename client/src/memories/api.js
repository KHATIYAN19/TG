import axios from "axios";

import { API_ROOT } from "../arena/api";

/* Public marketing info (price, limits, occasions). No login needed; the page works without it. */
export const fetchPublicInfo = async () => {
  const { data } = await axios.get(`${API_ROOT}/api/memories/public`, { timeout: 12000 });
  return data?.data || null;
};

export const formatPrice = (price) => {
  if (price == null) return null;
  if (Number(price) === 0) return "Free";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: Number(price) % 1 ? 2 : 0 }).format(price);
};

/* End the session the same way the rest of the site does, then clear local auth. */
export const signOutRequest = async (token) => {
  try {
    await axios.post(`${API_ROOT}/api/auth/logout`, null, { withCredentials: true, timeout: 10000, headers: token ? { Authorization: `Bearer ${token}` } : {} });
  } catch {
    /* the local sign-out below still happens */
  }
};
