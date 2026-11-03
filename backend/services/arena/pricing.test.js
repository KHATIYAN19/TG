import test from "node:test";
import assert from "node:assert/strict";

import { computeCancellation, computeDiscountPaise, computePricing } from "./pricing.js";
import { buddyView, containsContactInfo, publicCard, generateAlias, FIELD_VISIBILITY } from "./privacy.js";

test("percentage coupon with cap", () => {
  const c = { discountType: "PERCENTAGE", discountValue: 50, maxDiscountPaise: 10000 };
  assert.equal(computeDiscountPaise(c, 29900), 10000);
});

test("fixed coupon cannot exceed price", () => {
  const c = { discountType: "FIXED", discountValue: 99900 };
  assert.deepEqual(computePricing(29900, c), {
    listPricePaise: 29900, discountPaise: 29900, finalPaise: 0,
  });
});

test("tiny remainder is raised to gateway minimum", () => {
  const c = { discountType: "FIXED", discountValue: 29850 };
  assert.equal(computePricing(29900, c).finalPaise, 100);
});

test("cancellation keeps 10% of what was paid", () => {
  assert.deepEqual(computeCancellation(29900, 10), { feePaise: 2990, refundPaise: 26910 });
  assert.deepEqual(computeCancellation(0, 10), { feePaise: 0, refundPaise: 0 });
  assert.deepEqual(computeCancellation(20000, 0), { feePaise: 0, refundPaise: 20000 });
});

const profile = {
  _id: "p1", alias: "Member-ABCDE", realName: "Asha Rao", companyName: "Acme Corp", designation: "Backend Engineer",
  contact: { email: "a@x.com", phone: "9876543210", linkedin: "in/asha" },
  topics: ["HLD", "LLD"], level: "intermediate", skills: ["Kafka"], yearsExperience: 3,
  companyType: "product", availability: ["weekday_evening"], bio: "", goal: "",
  shareSettings: { name: true, email: false, phone: true, linkedin: false },
};

test("public card never leaks private fields, but shows company and role", () => {
  const card = publicCard(profile);
  const json = JSON.stringify(card);
  for (const secret of ["Asha", "a@x.com", "9876543210", "in/asha"]) {
    assert.ok(!json.includes(secret), secret);
  }
  assert.equal(card.companyName, "Acme Corp");
  assert.equal(card.designation, "Backend Engineer");
  assert.deepEqual(card.topics, ["HLD", "LLD"]);
});

test("buddy view honours share settings", () => {
  const v = buddyView(profile);
  assert.deepEqual(v.shared, { name: "Asha Rao", phone: "9876543210" });
});

test("contact info detection", () => {
  assert.ok(containsContactInfo("mail me at foo@bar.com"));
  assert.ok(containsContactInfo("call 98765 43210"));
  assert.ok(containsContactInfo("see https://x.io"));
  assert.ok(containsContactInfo("whatsapp @asha"));
  assert.ok(!containsContactInfo("I want to practise Kafka and caching"));
});

test("alias format", () => {
  assert.match(generateAlias(), /^Member-[A-HJ-NP-Z2-9]{5}$/);
});

/* The landing page's public/private table is generated from FIELD_VISIBILITY.
   These tests make sure the claims it makes are actually true. */
const fullProfile = {
  _id: "p9", alias: "Member-ZZZZZ", realName: "Real Name", companyName: "Zoho", designation: "SDE", topics: ["HLD"], level: "advanced",
  skills: ["kafka"], yearsExperience: 4, companyType: "product", targetCompanies: ["Google"], languages: ["english"], sessionsPerWeek: 3,
  sessionModes: ["chat"], buddyPreference: "any", timeline: "exploring", availability: ["weekday_evening"], bio: "hi", goal: "mocks",
  contact: { email: "r@x.com", phone: "9876543210", linkedin: "https://linkedin.com/in/r" },
  shareSettings: { name: true, email: true, phone: true, linkedin: true },
};

test("publicCard exposes exactly the fields declared 'public'", () => {
  const exposed = Object.keys(publicCard(fullProfile)).filter((k) => k !== "id").sort();
  const declared = FIELD_VISIBILITY.filter((f) => f.visibility === "public").map((f) => f.key).sort();
  assert.deepEqual(exposed, declared);
});

test("buddyView can reveal only fields declared 'after_match_optional'", () => {
  const shared = Object.keys(buddyView(fullProfile).shared).sort();
  const optional = FIELD_VISIBILITY.filter((f) => f.visibility === "after_match_optional").map((f) => f.key).sort();
  assert.deepEqual(shared, optional);
});

test("nothing declared private/never leaks into the public card", () => {
  const json = JSON.stringify(publicCard(fullProfile));
  for (const secret of ["Real Name", "r@x.com", "9876543210", "linkedin.com/in/r"]) assert.ok(!json.includes(secret), secret);
});

test("default share settings in the table match the model defaults", async () => {
  const { default: Profile } = await import("../../models/arena/ArenaProfile.js");
  const defaults = new Profile({}).shareSettings.toObject();
  for (const f of FIELD_VISIBILITY.filter((x) => x.visibility === "after_match_optional")) {
    assert.equal(defaults[f.key], f.defaultShared, f.key);
  }
});
