import express from "express";
import jwt from "jsonwebtoken";

/*
  Body size limits. Anonymous requests get 1 MB, which is plenty for every public form, checkout and
  gateway callback. Requests carrying a validly SIGNED access token keep 10 MB: admin tools legitimately
  send large bodies (campaign HTML + recipient lists, rich-text posts with pasted images). An attacker
  cannot forge the signature, so they can no longer make the server buffer and parse 10 MB per request.
  (The full session check still happens later, in the `auth` middleware of each route.)
*/
export const ANON_BODY_LIMIT = "1mb";
export const AUTHED_BODY_LIMIT = "10mb";

const jsonSmall = express.json({ limit: ANON_BODY_LIMIT });
const jsonLarge = express.json({ limit: AUTHED_BODY_LIMIT });
const formSmall = express.urlencoded({ extended: true, limit: ANON_BODY_LIMIT });
const formLarge = express.urlencoded({ extended: true, limit: AUTHED_BODY_LIMIT });

const hasSignedAccessToken = (req) => {
  const match = /^Bearer\s+(\S+)$/i.exec(req.get("Authorization") || "");
  if (!match) return false;
  try {
    // Expired-but-genuine tokens count too, so the route still answers 401 TOKEN_EXPIRED (which the app
    // silently refreshes and retries) rather than 413 for an admin whose token lapsed a moment ago.
    jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ["HS256"], ignoreExpiration: true });
    return true;
  } catch {
    return false;
  }
};

export const bodyParsers = (req, res, next) => {
  const large = hasSignedAccessToken(req);
  const json = large ? jsonLarge : jsonSmall;
  const form = large ? formLarge : formSmall;
  json(req, res, (error) => (error ? next(error) : form(req, res, next)));
};
