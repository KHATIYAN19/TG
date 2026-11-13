import crypto from "crypto";

/*
  META CONVERSIONS API (server side), shared by books and Memories.

  The browser pixel misses buyers who pay and close the tab, ad blockers, in-app browsers and webhook-only confirmations. Sending
  the sale from the server, with the SAME event_id the browser uses (`purchase_<orderId>`), means Meta counts each sale once and
  can match it to the ad click (fbc/fbp) + hashed email/phone.

  ONLY sales that came from a Meta ad are reported (attribution.platform === "meta", decided at checkout by utils/attribution.js).
  Organic and Google-ad sales are not sent, so Meta learns from ad-driven buyers only.

  Off unless META_CAPI_ACCESS_TOKEN is set. META_PIXEL_ID defaults to the pixel in client/index.html.
  META_TEST_EVENT_CODE (optional) routes events to Events Manager > Test events only.
  Never throws: a Meta outage must not affect a payment.
*/
const PIXEL_ID = () => process.env.META_PIXEL_ID || "965336112563401";
const API_VERSION = () => process.env.META_GRAPH_VERSION || "v21.0";

export const capiEnabled = () => Boolean(process.env.META_CAPI_ACCESS_TOKEN);

/** The one rule for "report this sale to Meta". */
export const isMetaAttributed = (attribution) => attribution?.platform === "meta";

const sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");
const hashed = (v, norm = (s) => s) => {
  const s = norm(String(v ?? "").trim());
  return s ? sha256(s) : undefined;
};

/** digits with country code. A bare 10 digit number is Indian (+91), which is how the site stores them. */
export const phoneDigits = (mobile, countryCode) => {
  const national = String(mobile || "").replace(/\D/g, "").replace(/^0+/, "");
  const cc = String(countryCode || "").replace(/\D/g, "") || (national.length === 10 ? "91" : "");
  const all = `${cc}${national}`;
  return all.length >= 8 ? all : "";
};

/**
 * @returns {Promise<boolean>} true when Meta accepted the event
 * @param {object} e { eventId, value, currency, contentIds[], contentName, paidAt, attribution, ip, userAgent, url,
 *                     user: { email, phone, name, externalId } }
 */
export const sendPurchaseEvent = async (e) => {
  try {
    if (!capiEnabled() || !isMetaAttributed(e.attribution)) return false;
    const value = Number(e.value);
    if (!(value > 0) || !e.eventId) return false; // free orders are not purchases

    const a = e.attribution;
    const u = e.user || {};
    const [first, ...rest] = String(u.name || "").trim().split(/\s+/);

    const userData = {
      em: hashed(u.email, (s) => s.toLowerCase()),
      ph: hashed(u.phone),
      fn: hashed(first, (s) => s.toLowerCase()),
      ln: hashed(rest.join(" "), (s) => s.toLowerCase()),
      external_id: u.externalId ? sha256(String(u.externalId)) : undefined,
      client_ip_address: e.ip || undefined,
      client_user_agent: e.userAgent || undefined,
      fbc: a.fbc || undefined,
      fbp: a.fbp || undefined,
    };
    Object.keys(userData).forEach((k) => userData[k] === undefined && delete userData[k]);

    const ids = (e.contentIds || []).map(String).filter(Boolean);
    const body = {
      data: [{
        event_name: "Purchase",
        event_time: Math.floor(new Date(e.paidAt || Date.now()).getTime() / 1000),
        event_id: e.eventId,
        action_source: "website",
        event_source_url: e.url || undefined,
        user_data: userData,
        custom_data: {
          value, currency: e.currency || "INR",
          content_ids: ids, content_name: e.contentName || undefined, content_type: "product",
          contents: ids.map((id) => ({ id, quantity: 1 })), num_items: ids.length || 1,
          ...(a.campaignId && { campaign_id: a.campaignId }), ...(a.adsetId && { adset_id: a.adsetId }), ...(a.adId && { ad_id: a.adId }),
          ...(a.utmCampaign && { utm_campaign: a.utmCampaign }),
        },
      }],
      ...(process.env.META_TEST_EVENT_CODE && { test_event_code: process.env.META_TEST_EVENT_CODE }),
    };

    const url = `https://graph.facebook.com/${API_VERSION()}/${PIXEL_ID()}/events?access_token=${encodeURIComponent(process.env.META_CAPI_ACCESS_TOKEN)}`;
    // A Meta outage, timeout or rate limit is retried a few times; a real rejection (bad token, bad data) is not.
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
        if (r.ok) return true;
        console.error(`[meta-capi] ${e.eventId} failed (try ${attempt}): HTTP ${r.status}`, (await r.text().catch(() => "")).slice(0, 300));
        if (r.status < 500 && r.status !== 429) return false;
      } catch (netErr) {
        console.error(`[meta-capi] ${e.eventId} network error (try ${attempt}):`, netErr?.message || netErr);
      }
      if (attempt < 3) await new Promise((ok) => setTimeout(ok, attempt * 2000));
    }
    return false; // the sweep (services/metaSweep.js) tries again later
  } catch (err) {
    console.error(`[meta-capi] ${e?.eventId} error:`, err?.message || err);
    return false;
  }
};
