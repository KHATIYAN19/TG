/*
  Gumroad order check. A buyer gives the order number from their receipt and the email they paid with;
  we ask Gumroad (with GUMROAD_ACCESS_TOKEN, kept on the server) whether that sale exists and is paid.
*/
const SALES_URL = () => process.env.GUMROAD_SALES_URL || "https://api.gumroad.com/v2/sales";
export const orderLookupEnabled = () => Boolean(process.env.GUMROAD_ACCESS_TOKEN);

/**
 * Find a buyer's sale by the order number on their receipt and the email they paid with (needs GUMROAD_ACCESS_TOKEN).
 * Only sales for `productIds` count. Returns { found:false } or { found:true, saleId, productId, email, quantity, refunded }.
 */
export async function findSale({ email, orderRef, productIds }) {
  const token = process.env.GUMROAD_ACCESS_TOKEN;
  if (!token) throw new Error("GUMROAD_NOT_CONFIGURED");
  const want = String(orderRef).trim().replace(/^#/, "");
  let otherProduct = false; // the order is real and the email matches, but it is for a product we don't sell credits for
  const verdict = (s) => {
    const mine = String(s.email || "").toLowerCase() === email.toLowerCase();
    const same = String(s.id ?? "") === want || String(s.order_id ?? "") === want || String(s.number ?? "") === want;
    if (!mine || !same) return null;
    if (!productIds.includes(String(s.product_id))) { otherProduct = true; return null; }
    return { found: true, saleId: String(s.id), productId: String(s.product_id), email: String(s.email), quantity: Math.min(50, Math.max(1, Math.floor(Number(s.quantity) || 1))), refunded: Boolean(s.refunded || s.chargebacked || (s.disputed && !s.dispute_won)) };
  };
  // 1) the receipt's "Order ID" is Gumroad's own sale id: look it up directly
  try {
    const r = await fetch(`${SALES_URL()}/${encodeURIComponent(want)}?${new URLSearchParams({ access_token: token })}`, { signal: AbortSignal.timeout(10000) });
    if (r.status === 401 || r.status === 403) { console.error("[gumroad] GUMROAD_ACCESS_TOKEN was rejected by Gumroad (HTTP " + r.status + "). Generate a new access token."); throw new Error("GUMROAD_NOT_CONFIGURED"); }
    if (r.ok) { const j = await r.json().catch(() => null); const hit = j?.success && j.sale ? verdict(j.sale) : null; if (hit) return hit; }
  } catch (e) { if (e.message === "GUMROAD_NOT_CONFIGURED") throw e; /* fall through to the search below */ }
  // 2) otherwise search that buyer's sales (for an order number instead of the id)
  let pageKey = null;
  for (let page = 0; page < 5; page++) { // one buyer's sales: a page or two at most
    const q = new URLSearchParams({ access_token: token, email });
    if (pageKey) q.set("page_key", pageKey);
    let res;
    try { res = await fetch(`${SALES_URL()}?${q}`, { signal: AbortSignal.timeout(10000) }); } catch { throw new Error("GUMROAD_UNREACHABLE"); }
    if (res.status === 401 || res.status === 403) { console.error("[gumroad] GUMROAD_ACCESS_TOKEN was rejected by Gumroad (HTTP " + res.status + "). Generate a new access token."); throw new Error("GUMROAD_NOT_CONFIGURED"); }
    if (!res.ok) throw new Error("GUMROAD_UNREACHABLE");
    const j = await res.json().catch(() => null);
    if (!j?.success) throw new Error("GUMROAD_UNREACHABLE");
    for (const sale of j.sales || []) { const hit = verdict(sale); if (hit) return hit; }
    pageKey = j.next_page_key;
    if (!pageKey) break;
  }
  return { found: false, otherProduct };
}

/** For the admin screen: is the token set, and does Gumroad accept it? Never returns the token. */
export async function checkConnection() {
  const token = process.env.GUMROAD_ACCESS_TOKEN;
  if (!token) return { ok: false, reason: "missing" };
  try {
    const res = await fetch(`${SALES_URL().replace(/\/sales$/, "")}/user?${new URLSearchParams({ access_token: token })}`, { signal: AbortSignal.timeout(10000) });
    if (res.status === 401 || res.status === 403) return { ok: false, reason: "rejected" };
    if (!res.ok) return { ok: false, reason: "unreachable" };
    const j = await res.json().catch(() => null);
    return { ok: true, account: String(j?.user?.name || j?.user?.email || "") };
  } catch { return { ok: false, reason: "unreachable" }; }
}
