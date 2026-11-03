/*
  Render every email template to a file you can open in a browser.
  This script NEVER sends email and never touches the network or the database.

    node scripts/preview-emails.mjs [output-folder]

  Default folder: <your temp dir>/targettrek-email-previews
  Open index.html in that folder.
*/
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { otpEmail, matchedEmail, unmatchedEmail, UNMATCH_VARIANTS } from "../services/mail/templates.js";

const out = path.resolve(process.argv[2] || path.join(os.tmpdir(), "targettrek-email-previews"));
fs.mkdirSync(out, { recursive: true });

const sample = { name: "Asha Rao", buddyAlias: "Member-7K3QX" };

const emails = [
  ["signup-otp", "Sign-up code", otpEmail({ purpose: "signup", name: sample.name, otp: "482915", minutes: 15 })],
  ["reset-otp", "Forgot-password code", otpEmail({ purpose: "reset", name: sample.name, otp: "730184", minutes: 10 })],
  ["login-otp", "Login code", otpEmail({ purpose: "login", name: sample.name, otp: "905512", minutes: 10 })],
  ["matched", "You're matched", matchedEmail({ ...sample, buddyTopics: ["HLD", "LLD"], buddyLevel: "intermediate", matchesLeft: 1 })],
  ...UNMATCH_VARIANTS.flatMap((variant) => [
    [`unmatched-${variant}`, `Unmatched: ${variant.replace(/_/g, " ")} (back in arena, 1 match left)`, unmatchedEmail({ ...sample, variant, matchesLeft: 1, backInArena: true })],
  ]),
  ["unmatched-no-matches-left", "Unmatched: all matches used", unmatchedEmail({ ...sample, variant: "ended_by_buddy", matchesLeft: 0, backInArena: false })],
  ["unmatched-not-counted", "Unmatched: not counted against you", unmatchedEmail({ ...sample, variant: "ended_by_team", matchesLeft: 2, backInArena: true, notCounted: true })],
];

for (const [file, , mail] of emails) {
  fs.writeFileSync(path.join(out, `${file}.html`), mail.html);
  fs.writeFileSync(path.join(out, `${file}.txt`), `Subject: ${mail.subject}\n\n${mail.text}\n`);
}

fs.writeFileSync(
  path.join(out, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>Email previews</title>
<body style="font-family:Arial,sans-serif;max-width:720px;margin:32px auto;padding:0 16px;background:#fff8f2;color:#29201b">
<h1>Target Trek email previews</h1>
<p>Rendered locally. Nothing was sent.</p>
<ul>${emails
    .map(([file, label, mail]) => `<li style="margin:8px 0"><a href="${file}.html">${label}</a> <small style="color:#7a6a5f">(${mail.subject}) · <a href="${file}.txt">plain text</a></small></li>`)
    .join("")}</ul></body>`
);

console.log(`Rendered ${emails.length} emails (HTML + plain text) to:\n${out}\nOpen ${path.join(out, "index.html")}`);
