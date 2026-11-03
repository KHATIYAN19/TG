import test from "node:test";
import assert from "node:assert/strict";

import { signRequest } from "./awsSigV4.js";

/* Official AWS Signature V4 test-suite case "get-vanilla" (example credentials). */
const CREDS = { accessKeyId: "AKIDEXAMPLE", secretAccessKey: "wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY" };
const DATE = new Date("2015-08-30T12:36:00Z");

test("matches the official AWS 'get-vanilla' signature", () => {
  const signed = signRequest({ method: "GET", url: "https://example.amazonaws.com/", region: "us-east-1", service: "service", date: DATE, ...CREDS });
  assert.equal(
    signed.authorization,
    "AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/service/aws4_request, SignedHeaders=host;x-amz-date, Signature=5fa00fa31553b73ebf1942676e86291e8372ff2a2260956d9b8aae1d763fbf31"
  );
  assert.equal(signed["x-amz-date"], "20150830T123600Z");
});

test("matches the official AWS 'get-vanilla-query-order-key-case' signature (query sorting)", () => {
  const signed = signRequest({ method: "GET", url: "https://example.amazonaws.com/?Param2=value2&Param1=value1", region: "us-east-1", service: "service", date: DATE, ...CREDS });
  assert.match(signed.authorization, /Signature=b97d918cfa904a5beff61c982a1b6f458b799221646efd99d3219ec94cdf2500$/);
});

test("matches the official AWS 'post-vanilla' signature (POST with a body-less request)", () => {
  const signed = signRequest({ method: "POST", url: "https://example.amazonaws.com/", region: "us-east-1", service: "service", date: DATE, ...CREDS });
  assert.match(signed.authorization, /Signature=5da7c1a2acd57cee7505fc6676e4e544621c30862966e37dddb68e92efbe5d6b$/);
});

test("signs the body: a different body gives a different signature; headers sorted + lower-cased", () => {
  const a = signRequest({ url: "https://email.ap-south-1.amazonaws.com/v2/email/outbound-emails", headers: { "Content-Type": "application/json" }, body: '{"a":1}', region: "ap-south-1", service: "ses", date: DATE, ...CREDS });
  const b = signRequest({ url: "https://email.ap-south-1.amazonaws.com/v2/email/outbound-emails", headers: { "Content-Type": "application/json" }, body: '{"a":2}', region: "ap-south-1", service: "ses", date: DATE, ...CREDS });
  assert.notEqual(a.authorization, b.authorization);
  assert.match(a.authorization, /SignedHeaders=content-type;host;x-amz-date,/);
});

test("a session token is signed as a header", () => {
  const s = signRequest({ url: "https://email.us-east-1.amazonaws.com/v2/email/outbound-emails", region: "us-east-1", service: "ses", sessionToken: "TOKEN123", date: DATE, ...CREDS });
  assert.match(s.authorization, /SignedHeaders=host;x-amz-date;x-amz-security-token,/);
  assert.equal(s["x-amz-security-token"], "TOKEN123");
});
