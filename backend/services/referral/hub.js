/* Live WebSocket connections for the referral chat, by user. One server instance; scaling out needs a pub/sub backplane in front of emitToUser(). */
const sockets = new Map();

export const registerSocket = (userId, ws) => {
  const key = String(userId);
  if (!sockets.has(key)) sockets.set(key, new Set());
  sockets.get(key).add(ws);
};
export const unregisterSocket = (userId, ws) => {
  const key = String(userId);
  const set = sockets.get(key);
  if (!set) return;
  set.delete(ws);
  if (!set.size) sockets.delete(key);
};
export const emitToUser = (userId, event) => {
  const set = sockets.get(String(userId));
  if (!set) return 0;
  const payload = JSON.stringify(event);
  let sent = 0;
  for (const ws of set) if (ws.readyState === 1) { ws.send(payload); sent += 1; }
  return sent;
};
export const disconnectUser = (userId, code = 4003, reason = "Closed") => { for (const ws of sockets.get(String(userId)) || []) ws.close(code, reason); };
export const isOnline = (userId) => sockets.has(String(userId));
