import test from "node:test";
import assert from "node:assert/strict";

import { otpEmail, matchedEmail, unmatchedEmail, reminderEmail, UNMATCH_VARIANTS, esc } from "./templates.js";

const SUPPORT = "supporttargettrek@gmail.com";
const ALL = () => [
  otpEmail({ purpose: "signup", name: "Asha Rao", otp: "482915", minutes: 15 }),
  otpEmail({ purpose: "reset", name: "Asha Rao", otp: "730184", minutes: 10 }),
  otpEmail({ purpose: "login", name: "Asha Rao", otp: "905512", minutes: 10 }),
  matchedEmail({ name: "Asha", buddyAlias: "Member-7K3QX", buddyTopics: ["HLD", "LLD"], buddyLevel: "intermediate", matchesLeft: 1 }),
  ...UNMATCH_VARIANTS.map((variant) => unmatchedEmail({ name: "Asha", buddyAlias: "Member-7K3QX", variant, matchesLeft: 1, backInArena: true })),
  unmatchedEmail({ name: "Asha", buddyAlias: "Member-7K3QX", variant: "ended", matchesLeft: 0, backInArena: false }),
];

test("every email has a subject, an HTML body and a plain-text body", () => {
  for (const m of ALL()) {
    assert.ok(m.subject && m.subject.length < 80, m.subject);
    assert.ok(m.html.startsWith("<!DOCTYPE html>"));
    assert.ok(m.text.length > 200);
  }
});

test("every email carries the support address (link + text) and a Reply hint", () => {
  for (const m of ALL()) {
    assert.ok(m.html.includes(`mailto:${SUPPORT}`), `${m.subject}: mailto missing`);
    assert.ok(m.text.includes(SUPPORT), `${m.subject}: support address missing from text`);
    assert.match(m.text, /NEED HELP\?/);
    assert.match(m.html, /Need help\?/);
  }
});

test("support address can be overridden with SUPPORT_EMAIL", () => {
  process.env.SUPPORT_EMAIL = "help@example.org";
  try {
    const m = otpEmail({ purpose: "signup", name: "A", otp: "111111", minutes: 5 });
    assert.ok(m.html.includes("mailto:help@example.org") && !m.html.includes(SUPPORT));
  } finally { delete process.env.SUPPORT_EMAIL; }
});

test("orange brand palette is used and nothing external is loaded (no images, fonts, scripts, remote CSS)", () => {
  for (const m of ALL()) {
    assert.ok(m.html.includes("#ea580c") && m.html.includes("#c2410c"), "orange palette");
    assert.ok(!/<img|<script|<link|@import|url\(http|@font-face/i.test(m.html), "external resources");
    assert.ok(!/indigo|#4f46e5|#6366f1/i.test(m.html), "old indigo theme must be gone");
  }
});

test("email-client safety: table layout, inline styles, preheader, under Gmail's 102 KB clipping limit", () => {
  for (const m of ALL()) {
    assert.match(m.html, /<table role="presentation"/);
    assert.match(m.html, /display:none;max-height:0/, "preheader");
    assert.ok(Buffer.byteLength(m.html) < 60 * 1024, `${m.subject}: ${Buffer.byteLength(m.html)} bytes`);
    assert.ok(!/<style/i.test(m.html), "no <style> block (stripped by some clients)");
  }
});

test("OTP emails: the code, expiry and the safety warning appear in HTML and text; code never in the subject", () => {
  const cases = [["signup", "482915", 15], ["reset", "730184", 10], ["login", "905512", 10]];
  for (const [purpose, otp, minutes] of cases) {
    const m = otpEmail({ purpose, name: "Asha Rao", otp, minutes });
    assert.ok(m.html.includes(otp) && m.text.includes(`YOUR CODE: ${otp}`));
    assert.ok(m.html.includes(`${minutes} minutes`) && m.text.includes(`${minutes} minutes`));
    assert.match(m.html, /Never share this code/); assert.match(m.text, /Never share this code/);
    assert.ok(!m.subject.includes(otp), "code must not be in the subject line");
    assert.match(m.html, /Hi Asha,/, "first name only");
  }
});

test("OTP emails: purpose-specific help (limits and what happens next)", () => {
  const signup = otpEmail({ purpose: "signup", name: "A", otp: "111111", minutes: 15 });
  assert.match(signup.html, /5 codes in 24 hours/); assert.match(signup.html, /10 wrong attempts/); assert.match(signup.html, /No account is created/);
  const reset = otpEmail({ purpose: "reset", name: "A", otp: "111111", minutes: 10 });
  assert.match(reset.html, /password stays exactly as it is/); assert.match(reset.html, /5 wrong codes or resends/); assert.match(reset.html, /signed out of every other device/);
  assert.throws(() => otpEmail({ purpose: "nope", name: "A", otp: "1", minutes: 1 }), /Unknown OTP email purpose/);
});

test("matched email: buddy's anonymous id, focus, matches left, CTA and settings links, safety + help", () => {
  const m = matchedEmail({ name: "Asha Rao", buddyAlias: "Member-7K3QX", buddyTopics: ["HLD", "LLD"], buddyLevel: "intermediate", matchesLeft: 1 });
  assert.match(m.subject, /You're matched with Member-7K3QX/);
  for (const needle of ["Member-7K3QX", "HLD, LLD", "intermediate", "Open my buddy", "/prep-buddy/app/buddy", "/prep-buddy/app/settings", "Report", "Block", "Your first 24 hours"]) assert.ok(m.html.includes(needle), needle);
  assert.ok(m.text.includes("OPEN MY BUDDY: ") && m.text.includes("Matches left after this: 1"));
  assert.match(m.html, /1 match left/);
});

test("matched email works with missing optional data (no matches count, no focus)", () => {
  const m = matchedEmail({ name: "", buddyAlias: undefined });
  assert.match(m.subject, /You're matched with your new buddy/); assert.match(m.html, /Hi there,/);
  assert.ok(!m.html.includes("Matches left after this"));
});

test("matched email never contains a real name, email or phone of the buddy (only what is passed: the alias)", () => {
  const m = matchedEmail({ name: "Asha", buddyAlias: "Member-7K3QX", buddyTopics: ["HLD"], buddyLevel: "beginner", matchesLeft: 2 });
  assert.ok(!/@[a-z0-9.-]+\.[a-z]{2,}/i.test(m.html.replace(/supporttargettrek@gmail\.com/g, "").replace(/https?:\/\/[^"'\s<]+/g, "")), "no stray email addresses");
});

test("unmatched: five variants, each worded from the recipient's point of view", () => {
  const lead = (variant) => unmatchedEmail({ name: "Asha", buddyAlias: "Member-7K3QX", variant, matchesLeft: 1, backInArena: true });
  assert.match(lead("ended_by_you").html, /You ended your partnership/); assert.match(lead("ended_by_you").text, /as you asked/);
  assert.match(lead("ended_by_buddy").html, /ended your partnership\. This happens/);
  assert.match(lead("blocked_by_you").html, /You blocked your buddy/);
  assert.match(lead("ended_by_team").html, /the Target Trek team ended your partnership/);
  const visible = lead("ended").html.replace(/<[^>]+>/g, " ") + " " + lead("ended").text;   // words a person reads (not CSS like "inline-block")
  assert.ok(!/\b(block(ed)?|report(ed)?|suspend(ed)?)\b/i.test(visible), "the neutral email never reveals a block, report or suspension");
  assert.match(lead("nonsense").html, /Your partnership has ended/, "unknown variant falls back to neutral");
});

test("unmatched: next step depends on matches left; 'not counted' note appears only when set", () => {
  const back = unmatchedEmail({ name: "A", buddyAlias: "M-1", variant: "ended", matchesLeft: 2, backInArena: true });
  assert.match(back.html, /back in the arena/); assert.match(back.html, /2 matches left/); assert.ok(back.html.includes("/prep-buddy/app/arena") && back.html.includes("Find a new buddy"));
  const none = unmatchedEmail({ name: "A", buddyAlias: "M-1", variant: "ended", matchesLeft: 0, backInArena: false });
  assert.match(none.html, /used all the matches/); assert.ok(none.html.includes("Join the arena again") && !none.html.includes("Find a new buddy"));
  assert.ok(!back.html.includes("did not count against your matches"));
  const restored = unmatchedEmail({ name: "A", buddyAlias: "M-1", variant: "ended_by_team", matchesLeft: 2, backInArena: true, notCounted: true });
  assert.match(restored.html, /did not count against your matches/); assert.match(restored.text, /did not count against your matches/);
  assert.match(back.html, /Reply to this email/);
});

test("user-supplied text is HTML-escaped everywhere (name, alias, topics, level)", () => {
  const evil = `<script>alert(1)</script>"&'`;
  const mails = [
    otpEmail({ purpose: "signup", name: evil, otp: "123456", minutes: 5 }),
    matchedEmail({ name: evil, buddyAlias: evil, buddyTopics: [evil], buddyLevel: evil, matchesLeft: 1 }),
    unmatchedEmail({ name: evil, buddyAlias: evil, variant: "ended_by_buddy", matchesLeft: 1, backInArena: true }),
    reminderEmail({ name: evil, pricePaise: 1900, matches: 2, offerText: evil }),
  ];
  for (const m of mails) { assert.ok(!m.html.includes("<script>alert"), m.subject); assert.ok(m.html.includes("&lt;script&gt;")); }
  assert.equal(esc(`<b>"x"&'</b>`), "&lt;b&gt;&quot;x&quot;&amp;&#39;&lt;/b&gt;");
});

test("site links follow FRONTEND_URL", () => {
  process.env.FRONTEND_URL = "https://staging.example.com/";
  try {
    const m = matchedEmail({ name: "A", buddyAlias: "M-1" });
    assert.ok(m.html.includes("https://staging.example.com/prep-buddy/app/buddy") && !m.html.includes("staging.example.com//"));
    assert.ok(m.text.includes("https://staging.example.com/privacy-policy"));
  } finally { delete process.env.FRONTEND_URL; }
});

test("reminder email: greets by first name and shows the live price and match count", () => {
  const m = reminderEmail({ name: "Asha Rao", pricePaise: 1900, matches: 2 });
  assert.equal(m.subject, "Hi Asha, get Prep Buddy Arena at ₹19 for 2 matches");
  for (const body of [m.html, m.text]) {
    assert.ok(body.includes("₹19") && body.includes("2 matches"));
    assert.ok(body.includes("/prep-buddy/app/join"));
    assert.ok(body.includes(SUPPORT));
  }
  assert.ok(m.html.includes("#ea580c") || m.html.includes("#c2410c"), "orange palette");
  assert.ok(!m.text.includes("\n\n\n"), "no empty gaps in the text version");
});

test("reminder email: follows the settings (price, singular match, offer)", () => {
  const m = reminderEmail({ name: "", pricePaise: 29900, matches: 1, offerText: "Diwali sale" });
  assert.ok(m.subject.startsWith("Hi there,") && m.subject.includes("₹299") && m.subject.includes("1 match") && !m.subject.includes("1 matches"));
  assert.ok(m.html.includes("Diwali sale") && m.text.includes("Diwali sale"));
});

test("reminder email: each attempt has its own subject (no stacking into one thread)", () => {
  const subjects = [1, 2, 3, 4].map((attempt) => reminderEmail({ name: "Asha", pricePaise: 1900, matches: 2, attempt }).subject);
  assert.equal(new Set(subjects.slice(0, 3)).size, 3);
  assert.equal(subjects[3], subjects[2], "attempts beyond the last variant reuse it");
});

test("reminder email: compact layout uses padding only, no margins", () => {
  const m = reminderEmail({ name: "Asha", pricePaise: 1900, matches: 2, attempt: 2, offerText: "Sale", unsubscribeUrl: "https://example.com/u?e=a" });
  assert.ok(!/margin:(?!0;)/.test(m.html), "no non-zero margins");
  assert.ok(m.html.includes("https://example.com/u?e=a") && m.text.includes("Unsubscribe: https://example.com/u?e=a"));
});
