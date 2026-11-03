import crypto from "node:crypto";

/*
  AWS Signature Version 4 request signing (no SDK needed).
  https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv4-create-signed-request.html

  Signs exactly the headers it is given, plus `host` and `x-amz-date`
  (and `x-amz-security-token` when a session token is used).
*/

const sha256Hex = (data) => crypto.createHash("sha256").update(data).digest("hex");
const hmac = (key, data) => crypto.createHmac("sha256", key).update(data).digest();

// RFC 3986 encoding, as SigV4 requires (encodeURIComponent leaves !'()* alone).
const encode = (value) =>
  encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

const canonicalPath = (pathname) =>
  pathname
    .split("/")
    .map((segment) => encode(decodeURIComponent(segment)))
    .join("/") || "/";

const canonicalQuery = (searchParams) =>
  [...searchParams.entries()]
    .map(([k, v]) => [encode(k), encode(v)])
    .sort((a, b) => (a[0] === b[0] ? (a[1] < b[1] ? -1 : 1) : a[0] < b[0] ? -1 : 1))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

export const amzDateOf = (date) => date.toISOString().replace(/[:-]|\.\d{3}/g, "");

export const signRequest = ({
  method = "POST",
  url,
  headers = {},
  body = "",
  region,
  service,
  accessKeyId,
  secretAccessKey,
  sessionToken = null,
  date = new Date(),
}) => {
  const target = new URL(url);
  const amzDate = amzDateOf(date);
  const dateStamp = amzDate.slice(0, 8);

  const toSign = {
    ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v).trim().replace(/\s+/g, " ")])),
    host: target.host,
    "x-amz-date": amzDate,
    ...(sessionToken ? { "x-amz-security-token": sessionToken } : {}),
  };

  const names = Object.keys(toSign).sort();
  const canonicalHeaders = names.map((n) => `${n}:${toSign[n]}\n`).join("");
  const signedHeaders = names.join(";");

  const canonicalRequest = [
    method.toUpperCase(),
    canonicalPath(target.pathname),
    canonicalQuery(target.searchParams),
    canonicalHeaders,
    signedHeaders,
    sha256Hex(body),
  ].join("\n");

  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256Hex(canonicalRequest)].join("\n");

  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secretAccessKey}`, dateStamp), region), service), "aws4_request");
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  return {
    ...toSign,
    authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
};
