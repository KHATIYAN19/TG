/*
  Offline checks for the SQS email queue (no AWS, no mail provider, no database):
  fetch is replaced by a fake SQS + fake Resend.      Run: node tests/mail/queue.test.mjs
*/
import assert from "node:assert/strict";
import mongoose from "mongoose";

mongoose.set("bufferCommands", false); // no database in this test

process.env.AMAZON_ACCESS_KEY_ID = "AKIATEST";
process.env.AMAZON_SECRET_ACCESS_KEY = "secret";
process.env.AMAZON_REGION = "ap-south-1";
process.env.SQS_EMAIL_QUEUE_NAME = "tt-email";
process.env.MAIL_PROVIDER = "resend";
process.env.RESEND_API_KEY = "re_test";
process.env.MAIL_WORKER_RATE_PER_SEC = "1000";

const calls = [];
let resendFails = false;

globalThis.fetch = async (url, init = {}) => {
  const u = String(url);
  if (u.startsWith("https://sqs.")) {
    const action = init.headers["x-amz-target"].replace("AmazonSQS.", "");
    const body = JSON.parse(init.body);
    calls.push({ action, body, auth: init.headers.authorization });
    const json = (o, status = 200) => new Response(JSON.stringify(o), { status });
    if (action === "GetQueueUrl") return json({ QueueUrl: `https://sqs.ap-south-1.amazonaws.com/111/${body.QueueName}` });
    if (action === "GetQueueAttributes")
      return json({ Attributes: { RedrivePolicy: JSON.stringify({ deadLetterTargetArn: "arn:aws:sqs:ap-south-1:111:tt-email-dlq", maxReceiveCount: 3 }), ApproximateNumberOfMessages: "4" } });
    if (action === "SendMessage") return json({ MessageId: "m-1" });
    return json({});
  }
  if (u.startsWith("https://api.resend.com")) {
    calls.push({ action: "resend", body: JSON.parse(init.body) });
    if (resendFails) return new Response(JSON.stringify({ message: "rate limit", name: "rate_limit" }), { status: 429 });
    return new Response(JSON.stringify({ id: "r-1" }), { status: 200 });
  }
  throw new Error("unexpected fetch " + u);
};

const { default: sendMail } = await import("../../utils/MailSender.js");
const { processMessage, isPermanentError } = await import("../../services/mail/mailWorker.js");
const { filterBuyers } = await import("../../services/campaign/audience.js");
const { renderCampaignEmail, verifyUnsubscribeToken, unsubscribeToken } = await import("../../services/campaign/render.js");

let passed = 0;
const t = async (name, fn) => {
  calls.length = 0;
  await fn();
  passed += 1;
  console.log("ok -", name);
};

await t("sendMail() queues the email (SigV4-signed) and does NOT call the provider", async () => {
  const info = await sendMail("a@x.com", "Hello", "plain", "<b>hi</b>", { replyTo: "help@x.com" });
  assert.equal(info.queued, true);
  const send = calls.find((c) => c.action === "SendMessage");
  assert.ok(send.auth.startsWith("AWS4-HMAC-SHA256"));
  assert.ok(send.auth.includes("/ap-south-1/sqs/aws4_request"));
  const msg = JSON.parse(send.body.MessageBody);
  assert.deepEqual([msg.kind, msg.to, msg.subject, msg.options.replyTo], ["mail", ["a@x.com"], "Hello", "help@x.com"]);
  assert.ok(!calls.some((c) => c.action === "resend"));
});

await t("emails with attachments skip the queue and go straight to the provider", async () => {
  const info = await sendMail("a@x.com", "Book", "t", "<p>h</p>", { attachments: [{ filename: "b.pdf", content: Buffer.from("PDF") }] });
  assert.equal(info.provider, "resend");
  assert.ok(!calls.some((c) => c.action === "SendMessage"));
});

await t("options.sync forces a direct send", async () => {
  const info = await sendMail("a@x.com", "S", "t", "<p>h</p>", { sync: true });
  assert.equal(info.provider, "resend");
});

await t("worker: a queued mail is delivered, then the message is deleted", async () => {
  const body = JSON.stringify({ kind: "mail", to: ["a@x.com"], subject: "S", text: "t", html: "<p>h</p>", options: {} });
  await processMessage({ messageId: "m", receiptHandle: "rh-1", body, receiveCount: 1 });
  assert.ok(calls.some((c) => c.action === "resend" && c.body.to[0] === "a@x.com"));
  assert.ok(calls.some((c) => c.action === "DeleteMessage" && c.body.ReceiptHandle === "rh-1"));
});

await t("worker: provider failure -> message kept, retry delay set (not deleted)", async () => {
  resendFails = true;
  const body = JSON.stringify({ kind: "mail", to: ["a@x.com"], subject: "S", text: "t", html: "<p>h</p>", options: {} });
  await processMessage({ messageId: "m", receiptHandle: "rh-2", body, receiveCount: 1 });
  assert.ok(!calls.some((c) => c.action === "DeleteMessage"));
  const vis = calls.find((c) => c.action === "ChangeMessageVisibility");
  assert.equal(vis.body.VisibilityTimeout, 30);
});

await t("worker: final attempt with a DLQ -> left for AWS to move to the DLQ (not deleted)", async () => {
  const body = JSON.stringify({ kind: "mail", to: ["a@x.com"], subject: "S", text: "t", html: "<p>h</p>", options: {} });
  await processMessage({ messageId: "m", receiptHandle: "rh-3", body, receiveCount: 3 }); // maxReceiveCount = 3
  assert.ok(!calls.some((c) => c.action === "DeleteMessage"));
  assert.equal(calls.find((c) => c.action === "ChangeMessageVisibility").body.VisibilityTimeout, 5);
  resendFails = false;
});

await t("worker: garbage / unknown messages are dropped", async () => {
  await processMessage({ messageId: "m", receiptHandle: "rh-4", body: "not json", receiveCount: 1 });
  await processMessage({ messageId: "m", receiptHandle: "rh-5", body: JSON.stringify({ kind: "zzz" }), receiveCount: 1 });
  assert.equal(calls.filter((c) => c.action === "DeleteMessage").length, 2);
});

await t("permanent vs temporary error classification", async () => {
  assert.equal(isPermanentError({ code: "InvalidParameterValue", statusCode: 400, message: "x" }), true);
  assert.equal(isPermanentError({ statusCode: 400, message: "Illegal address" }), true);
  assert.equal(isPermanentError({ code: "MessageRejected", statusCode: 400, message: "Email address is not verified" }), false);
  assert.equal(isPermanentError({ statusCode: 429, message: "slow down" }), false);
});

const A = "a".repeat(24), B = "b".repeat(24), C = "c".repeat(24);
const buyer = (email, books, extra = {}) => ({ email, allBooks: new Set(books), windowBooks: new Set(books), windowOrders: 1, orders: 1, spent: 500, ...extra });
const buyers = [buyer("hld@x.com", [A]), buyer("lld@x.com", [B]), buyer("both@x.com", [A, B]), buyer("other@x.com", [C])];

await t("audience: bought HLD but NOT LLD / reverse / all-of / any-of / bundle", async () => {
  const emails = (f, bundles) => filterBuyers(buyers, f, bundles).map((b) => b.email).sort();
  assert.deepEqual(emails({ includeBooks: [A], excludeBooks: [B] }), ["hld@x.com"]);
  assert.deepEqual(emails({ includeBooks: [B], excludeBooks: [A] }), ["lld@x.com"]);
  assert.deepEqual(emails({ includeBooks: [A, B], includeMode: "all" }), ["both@x.com"]);
  assert.deepEqual(emails({ includeBooks: [A, B], includeMode: "any" }), ["both@x.com", "hld@x.com", "lld@x.com"]);
  assert.deepEqual(emails({ excludeBooks: [A, B] }), ["other@x.com"]);
  // someone who bought bundle C that contains A counts as an A owner
  assert.deepEqual(emails({ includeBooks: [A], excludeBooks: [B] }, new Map([[C, [A]]])), ["hld@x.com", "other@x.com"]);
  assert.deepEqual(emails({ minSpent: 600 }), []);
});

await t("template rendering: escaping, coupon, button, subject, unsubscribe token", async () => {
  const campaign = { _id: "abc", subject: "Hi {{firstName}}: {{couponDiscount}}", html: "<p>{{name}}</p>{{{coupon}}}{{{button}}}<a href=\"{{unsubscribeUrl}}\">u</a>", content: { couponCode: "save20", ctaText: "Go", ctaUrl: "javascript:alert(1)" } };
  const mail = renderCampaignEmail(campaign, { email: "a@b.com", name: "<script>x</script> Ravi" }, { coupon: { discountType: "PERCENTAGE", discountValue: 20 } });
  assert.equal(mail.subject, "Hi <script>x</script>: 20% OFF"); // plain-text subject, never HTML
  assert.ok(!mail.html.includes("<script>"));
  assert.ok(mail.html.includes("SAVE20"));
  assert.ok(!mail.html.includes("javascript:")); // unsafe CTA link replaced
  assert.ok(verifyUnsubscribeToken("a@b.com", unsubscribeToken("a@b.com")));
  assert.ok(!verifyUnsubscribeToken("a@b.com", unsubscribeToken("z@b.com")));
});

console.log(`\n${passed} checks passed`);
process.exit(0);
