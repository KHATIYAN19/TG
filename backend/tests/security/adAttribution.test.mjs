/*
  Ad sales stay visible in our own reports even when the buyer switched ad measurement off (or pressed the old
  "Reject all"), while nothing is ever reported to an ad platform for them.
  Run: node --test tests/security/adAttribution.test.mjs
*/
import { test } from "node:test";
import assert from "node:assert/strict";

import { buildAttribution } from "../../utils/attribution.js";
import { isMetaAttributed } from "../../services/metaCapi.js";

test("opted-out buyer from a Meta / Google ad: sale keeps its platform label, but no click ids are stored", () => {
  // what the browser sends after stripping fbclid/gclid/fbc/fbp for an opted-out visitor
  const meta = buildAttribution({ platform: "meta", utmCampaign: "diwali", adConsent: false });
  assert.equal(meta.platform, "meta");
  assert.equal(meta.utmCampaign, "diwali");
  assert.equal(meta.fbclid, null); assert.equal(meta.fbc, null); assert.equal(meta.fbp, null);
  assert.equal(buildAttribution({ platform: "google", adConsent: false }).platform, "google");
});

test("opted-out Meta sale is never reported to Meta", () => {
  assert.equal(isMetaAttributed(buildAttribution({ platform: "meta", adConsent: false })), false);
  assert.equal(isMetaAttributed(buildAttribution({ fbclid: "abc", platform: "meta", adConsent: true })), true);
});

test("the label alone can't invent an ad sale for opted-in visitors, and unknown labels are ignored", () => {
  assert.equal(buildAttribution({ platform: "meta", adConsent: true }).platform, "organic");
  assert.equal(buildAttribution({ platform: "tiktok", adConsent: false }).platform, "organic");
  assert.equal(buildAttribution({ platform: "organic", adConsent: false }).platform, "organic");
});

test("utm-tagged paid links are attributed with or without consent", () => {
  for (const adConsent of [true, false]) {
    assert.equal(buildAttribution({ utmSource: "facebook", utmMedium: "paid", adConsent }).platform, "meta");
    assert.equal(buildAttribution({ utmSource: "google", utmMedium: "cpc", adConsent }).platform, "google");
  }
});
