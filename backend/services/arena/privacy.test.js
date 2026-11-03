import test from "node:test";
import assert from "node:assert/strict";

import { detectContactInfo } from "./privacy.js";

// Company names / job titles: domains are fine, contact details are not.
test("entity mode allows Observe.AI / Notion.so / Zoho Corp", () => {
  for (const name of ["Observe.AI", "Notion.so", "Zoho Corp", "Tata Consultancy Services", "Amazon", "Sr. Software Engineer"]) {
    assert.equal(detectContactInfo(name, { entity: true }), null, name);
  }
});
test("entity mode still blocks contact details", () => {
  for (const bad of ["Acme (mail rahul@acme.com)", "call 9876543210", "https://acme.com", "@rahul_dev", "dm me on telegram"]) {
    assert.ok(detectContactInfo(bad, { entity: true }), bad);
  }
});

const BLOCK = {
  "plain email": "mail me at foo@bar.com",
  "email (at)/(dot)": "foo (at) gmail (dot) com",
  "email 'at gmail dot com'": "reach rahul at gmail dot com",
  "email spaced": "foo @ bar . com",
  "gmail.com mention": "my id is rahul99 gmail.com",
  "10-digit phone": "call 9876543210",
  "spaced phone": "98765 43210",
  "dotted phone": "98.76.54.32.10",
  "dashed phone": "987-654-3210",
  "+91 phone": "+91 98765 43210",
  "spelled phone": "nine eight seven six five four three two one zero",
  "mixed spelled phone": "9 8 seven six 5 four three 2 1 0",
  "fullwidth digits": "９８７６５４３２１０",
  "zero-width split": "9876​543210",
  "http link": "see https://example.com/me",
  "www link": "www.mysite.in",
  "bare domain": "rahul.dev",
  "spelled domain": "mysite dot com",
  "shortener": "bit.ly/abc",
  "wa.me": "wa.me/919876543210",
  "t.me": "t.me/rahul",
  "@handle": "find me @rahul_dev",
  "whatsapp number": "whatsapp 9",
  "telegram id": "telegram id rahul",
  "dm me": "dm me for more",
  "call me": "call me tomorrow",
  "my number": "my number is private lol",
  "linkedin id": "linkedin: rahul-sharma",
  "my name is": "my name is Rahul",
  "i'm called": "i am called Rahul",
  "instagram handle": "insta @rahul",
};

const ALLOW = {
  "years of experience": "I have 8 years of experience in backend",
  "date range": "Worked 2020-2024 on payments",
  "versions": "Spring Boot 3.2 and Java 21",
  "big-o": "Comfortable with O(n log n) and O(1) tradeoffs",
  "node.js": "Node.js, Next.js and Socket.io",
  "asp.net": "ASP.NET and .NET Core",
  "plain sentence": "Preparing for product-company design rounds, evenings work best",
  "system design": "strong on caching and sharding, weak on consensus",
  "at scale": "design systems at scale",
  "numbers": "solved 450 leetcode problems in 6 months",
  "goal": "weekly mock interviews with honest feedback",
  "kafka": "kafka, redis, rate limiter",
  "one word": "I want one mock interview per week and two reviews",
};

for (const [name, text] of Object.entries(BLOCK)) {
  test(`blocks: ${name}`, () => assert.ok(detectContactInfo(text), `should block: ${JSON.stringify(text)}`));
}
for (const [name, text] of Object.entries(ALLOW)) {
  test(`allows: ${name}`, () => assert.equal(detectContactInfo(text), null, `should allow: ${JSON.stringify(text)} (got ${detectContactInfo(text)})`));
}
