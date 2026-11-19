import { WebSocketServer } from "ws";

import redis from "../../utils/redis.js";
import { auth } from "../../Middleware/auth.js";
import { authKeys } from "../authStateService.js";
import { registerSocket, unregisterSocket } from "./hub.js";
import { deleteMessage, editMessage, markRead, postMessage, reactMessage, typing } from "./chat.js";

/*
  REFERRAL CHAT  (ws://…/ws/referral)
  client → server  {type:"auth", token}  must be the FIRST frame (≤ 5 s)
                   {type:"message", requestId, text, replyTo?}   {type:"edit", requestId, id, text}   {type:"delete", requestId, id}
                   {type:"react", requestId, id, emoji}   {type:"typing", requestId}   {type:"read", requestId}
  server → client  {type:"ready"}  {type:"message" | "message_updated", requestId, message}  {type:"typing" | "read", requestId}
                   {type:"request_updated", requestId, status, chatUnlocked}  {type:"error", code, message, requestId?}
  The token travels in the first frame (never the URL), is checked by the same `auth` middleware as the REST API, the Origin is checked
  against the CORS allow-list, and the chat is re-checked from MongoDB on every message.
*/
const AUTH_TIMEOUT_MS = 5000;
const HEARTBEAT_MS = 30000;
const REVALIDATE_MS = 60000;
const MAX_PAYLOAD = 6 * 1024;
const RATE_WINDOW_MS = 10000;
const RATE_MAX = 15;

const authenticate = (token) =>
  new Promise((resolve) => {
    const header = (n) => (n.toLowerCase() === "authorization" ? `Bearer ${token}` : undefined);
    const req = { cookies: {}, get: header, header };
    auth(req, { status() { return this; }, json: () => resolve(null) }, () => resolve(req));
  });

const send = (ws, payload) => { if (ws.readyState === 1) ws.send(JSON.stringify(payload)); };

const sessionStillValid = async (ctx) => {
  try {
    const [u, s] = await redis.mget(authKeys.user(ctx.userId), authKeys.session(ctx.sessionId));
    return Boolean(u && s && u.status === "active" && !u.isDeleted && s.state === "active" && s.expiresAt > Date.now());
  } catch { return true; }
};

export const attachReferralSocket = (server, { isOriginAllowed = () => true, path = "/ws/referral" } = {}) => {
  const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_PAYLOAD });

  server.on("upgrade", (request, socket, head) => {
    let pathname = "";
    try { pathname = new URL(request.url, "http://localhost").pathname; } catch { /* ignore */ }
    if (pathname !== path) return;
    const origin = request.headers.origin;
    if (origin && !isOriginAllowed(origin)) { socket.write("HTTP/1.1 403 Forbidden\r\n\r\n"); return socket.destroy(); }
    wss.handleUpgrade(request, socket, head, (ws) => wss.emit("connection", ws, request));
  });

  wss.on("connection", (ws) => {
    const ctx = { userId: null, sessionId: null, authed: false, sent: [], alive: true };
    ws.on("pong", () => { ctx.alive = true; });
    const authTimer = setTimeout(() => { if (!ctx.authed) ws.close(4001, "Auth timeout"); }, AUTH_TIMEOUT_MS);
    const revalidate = setInterval(async () => { if (ctx.authed && !(await sessionStillValid(ctx))) ws.close(4002, "Session expired"); }, REVALIDATE_MS);

    ws.on("message", async (raw) => {
      let frame;
      try { frame = JSON.parse(raw.toString()); } catch { return send(ws, { type: "error", code: "BAD_FRAME", message: "Invalid message" }); }
      try {
        if (!ctx.authed) {
          if (frame?.type !== "auth") return ws.close(4001, "Auth required");
          const req = typeof frame.token === "string" ? await authenticate(frame.token) : null;
          if (!req) { send(ws, { type: "error", code: "UNAUTHORIZED", message: "Please sign in again" }); return ws.close(4002, "Unauthorized"); }
          ctx.userId = String(req.user.id || req.user._id); ctx.sessionId = req.sessionId; ctx.authed = true;
          clearTimeout(authTimer);
          registerSocket(ctx.userId, ws);
          return send(ws, { type: "ready" });
        }
        const now = Date.now();
        ctx.sent = ctx.sent.filter((t) => now - t < RATE_WINDOW_MS);
        if (frame.type !== "typing" && frame.type !== "read") {
          if (ctx.sent.length >= RATE_MAX) return send(ws, { type: "error", code: "RATE_LIMITED", message: "You're sending messages too fast", requestId: frame.requestId });
          ctx.sent.push(now);
        }
        const base = { requestId: frame.requestId, userId: ctx.userId };
        if (frame.type === "message") await postMessage({ ...base, text: frame.text, replyTo: frame.replyTo });
        else if (frame.type === "edit") await editMessage({ ...base, id: frame.id, text: frame.text });
        else if (frame.type === "delete") await deleteMessage({ ...base, id: frame.id });
        else if (frame.type === "react") await reactMessage({ ...base, id: frame.id, emoji: frame.emoji });
        else if (frame.type === "typing") await typing(base);
        else if (frame.type === "read") await markRead(base);
      } catch (e) {
        if (e?.status && e?.code) return send(ws, { type: "error", code: e.code, message: e.message, requestId: frame?.requestId });
        console.error("[referral:ws]", e);
        send(ws, { type: "error", code: "SERVER_ERROR", message: "Something went wrong", requestId: frame?.requestId });
      }
    });

    ws.on("close", () => { clearTimeout(authTimer); clearInterval(revalidate); if (ctx.userId) unregisterSocket(ctx.userId, ws); });
    ws.on("error", () => ws.terminate());
    ws._refCtx = ctx;
  });

  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (ws._refCtx && !ws._refCtx.alive) { ws.terminate(); continue; }
      if (ws._refCtx) ws._refCtx.alive = false;
      ws.ping();
    }
  }, HEARTBEAT_MS);
  wss.on("close", () => clearInterval(heartbeat));
  heartbeat.unref();
  return wss;
};
