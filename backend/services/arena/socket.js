import { WebSocketServer } from "ws";
import ArenaMatch from "../../models/arena/ArenaMatch.js";
import ArenaMessage from "../../models/arena/ArenaMessage.js";
import ArenaProfile from "../../models/arena/ArenaProfile.js";

import redis from "../../utils/redis.js";
import { auth } from "../../Middleware/auth.js";
import { authKeys } from "../authStateService.js";
import { registerSocket, unregisterSocket, emitToUser } from "./hub.js";
import { cleanText, messageView, MAX_TEXT } from "./chat.js";

/*
  REAL-TIME CHAT  (ws://…/ws/arena)
  --------------------------------
  Protocol (JSON frames)
    client → server   {type:"auth", token}      must be the FIRST frame (≤ 5 s)
                      {type:"message", text}
                      {type:"typing"}
    server → client   {type:"ready", matchId}
                      {type:"message", id, from:"me"|"buddy", text, createdAt, editableUntil, reactions}
                      {type:"message_updated", message}   (edited / deleted / reacted)
                      {type:"typing"}
                      {type:"error", code, message}
                      {type:"matched" | "match_ended" | "share_updated" |
                       "request_received" | "request_updated" | "suspended"}

  Security
    - The JWT is NOT put in the URL (URLs end up in logs); it is sent in
      the first frame and validated by the same `auth` middleware the REST
      API uses (JWT + Redis session + account state + token version).
    - The Origin header is checked against the CORS allow-list.
    - The user may only talk to their own ACTIVE match; membership is
      re-checked from MongoDB on every message.
    - Sessions are re-validated in Redis every minute, so a revoked
      session or suspended account is disconnected promptly.
    - Payload size, message length and send rate are capped.
*/

const AUTH_TIMEOUT_MS = 5_000;
const HEARTBEAT_MS = 30_000;
const REVALIDATE_MS = 60_000;
const MAX_PAYLOAD = 4 * 1024;
const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 12;

/* Reuse the REST auth middleware for the first-frame token check. */
const authenticate = (token) =>
  new Promise((resolve) => {
    const req = {
      cookies: {},
      get: (name) => (name.toLowerCase() === "authorization" ? `Bearer ${token}` : undefined),
      header: (name) => (name.toLowerCase() === "authorization" ? `Bearer ${token}` : undefined),
    };
    const res = {
      status() { return this; },
      json: () => resolve(null),
    };
    auth(req, res, () => resolve(req));
  });

const clean = cleanText;

const send = (ws, payload) => {
  if (ws.readyState === 1) ws.send(JSON.stringify(payload));
};

const fail = (ws, code, message) => send(ws, { type: "error", code, message });

const sessionStillValid = async (ctx) => {
  try {
    const [userAuth, sessionAuth] = await redis.mget(authKeys.user(ctx.userId), authKeys.session(ctx.sessionId));
    return Boolean(
      userAuth &&
        sessionAuth &&
        userAuth.status === "active" &&
        !userAuth.isDeleted &&
        sessionAuth.state === "active" &&
        sessionAuth.expiresAt > Date.now()
    );
  } catch {
    return true; // don't kick everyone if Redis blips; REST stays fail-closed
  }
};

export const attachArenaSocket = (server, { isOriginAllowed = () => true, path = "/ws/arena" } = {}) => {
  const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_PAYLOAD });

  server.on("upgrade", (request, socket, head) => {
    let pathname = "";
    try {
      pathname = new URL(request.url, "http://localhost").pathname;
    } catch {
      /* ignore */
    }
    if (pathname !== path) return; // leave other upgrades alone

    const origin = request.headers.origin;
    if (origin && !isOriginAllowed(origin)) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      return socket.destroy();
    }

    wss.handleUpgrade(request, socket, head, (ws) => wss.emit("connection", ws, request));
  });

  wss.on("connection", (ws) => {
    const ctx = { userId: null, sessionId: null, matchId: null, authed: false, sent: [], alive: true };

    ws.on("pong", () => { ctx.alive = true; });

    const authTimer = setTimeout(() => {
      if (!ctx.authed) ws.close(4001, "Auth timeout");
    }, AUTH_TIMEOUT_MS);

    const revalidate = setInterval(async () => {
      if (ctx.authed && !(await sessionStillValid(ctx))) ws.close(4002, "Session expired");
    }, REVALIDATE_MS);

    const handleAuth = async (frame) => {
      const authedReq = typeof frame.token === "string" ? await authenticate(frame.token) : null;
      if (!authedReq) {
        fail(ws, "UNAUTHORIZED", "Please sign in again");
        return ws.close(4002, "Unauthorized");
      }

      ctx.userId = authedReq.user.id;
      ctx.sessionId = authedReq.sessionId;
      ctx.authed = true;
      clearTimeout(authTimer);
      registerSocket(ctx.userId, ws);

      const match = await ArenaMatch.findOne({ users: ctx.userId, status: "active" }).select("_id").lean();
      ctx.matchId = match ? String(match._id) : null;

      send(ws, { type: "ready", matchId: ctx.matchId });
    };

    const handleMessage = async (frame) => {
      const now = Date.now();
      ctx.sent = ctx.sent.filter((t) => now - t < RATE_WINDOW_MS);
      if (ctx.sent.length >= RATE_MAX) return fail(ws, "RATE_LIMITED", "You're sending messages too fast");
      ctx.sent.push(now);

      const text = clean(frame.text);
      if (!text) return;
      if (text.length > MAX_TEXT) return fail(ws, "TOO_LONG", `Messages are limited to ${MAX_TEXT} characters`);

      // Re-check on EVERY message: the match may have ended or a member been suspended.
      const match = await ArenaMatch.findOne({ users: ctx.userId, status: "active" }).lean();
      if (!match) return fail(ws, "NO_MATCH", "Your partnership has ended");

      const profiles = await ArenaProfile.find({ _id: { $in: match.profiles } }).select("user status").lean();
      if (profiles.some((p) => p.status === "suspended")) return fail(ws, "SUSPENDED", "Chat is unavailable");

      const buddyId = match.users.find((u) => String(u) !== String(ctx.userId));

      const saved = await ArenaMessage.create({ match: match._id, sender: ctx.userId, text });

      // Each member gets their own view (mine / editableUntil / reactions).
      emitToUser(ctx.userId, { type: "message", from: "me", ...messageView(saved, ctx.userId) });
      emitToUser(buddyId, { type: "message", from: "buddy", ...messageView(saved, buddyId) });
    };

    ws.on("message", async (raw) => {
      let frame;
      try {
        frame = JSON.parse(raw.toString());
      } catch {
        return fail(ws, "BAD_FRAME", "Invalid message");
      }

      try {
        if (!ctx.authed) {
          if (frame?.type !== "auth") return ws.close(4001, "Auth required");
          return await handleAuth(frame);
        }

        if (frame?.type === "message") return await handleMessage(frame);

        if (frame?.type === "typing") {
          const match = await ArenaMatch.findOne({ users: ctx.userId, status: "active" }).select("users").lean();
          const buddyId = match?.users.find((u) => String(u) !== String(ctx.userId));
          if (buddyId) emitToUser(buddyId, { type: "typing" });
        }
      } catch (error) {
        console.error("[arena:ws]", error);
        fail(ws, "SERVER_ERROR", "Something went wrong");
      }
    });

    ws.on("close", () => {
      clearTimeout(authTimer);
      clearInterval(revalidate);
      if (ctx.userId) unregisterSocket(ctx.userId, ws);
    });

    ws.on("error", () => ws.terminate());

    ws._arenaCtx = ctx;
  });

  // Drop dead connections (closed laptops, lost networks).
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (ws._arenaCtx && !ws._arenaCtx.alive) {
        ws.terminate();
        continue;
      }
      if (ws._arenaCtx) ws._arenaCtx.alive = false;
      ws.ping();
    }
  }, HEARTBEAT_MS);

  wss.on("close", () => clearInterval(heartbeat));
  heartbeat.unref();

  return wss;
};
