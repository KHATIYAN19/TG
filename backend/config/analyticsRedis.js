
import { Redis } from "@upstash/redis";

export const analyticsRedis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const ACTIVE_SECONDS = Math.max(
  30,
  Number(process.env.ANALYTICS_ACTIVE_SECONDS) || 60
);

export const ACTIVE_KEY = "tt:analytics:live:sessions";

export const sessionKey = (sessionId) =>
  `tt:analytics:live:session:${sessionId}`;

export async function markSessionLive(session) {
  const now = Date.now();

  await Promise.all([
    analyticsRedis.set(
      sessionKey(session.sessionId),
      {
        ...session,
        lastSeenAt: now,
      },
      { ex: ACTIVE_SECONDS + 30 }
    ),

    analyticsRedis.zadd(ACTIVE_KEY, {
      score: now,
      member: session.sessionId,
    }),
  ]);
}

export async function removeLiveSession(sessionId) {
  await Promise.all([
    analyticsRedis.del(sessionKey(sessionId)),
    analyticsRedis.zrem(ACTIVE_KEY, sessionId),
  ]);
}

export async function getLiveSessions() {
  const cutoff =
    Date.now() - ACTIVE_SECONDS * 1000;

  await analyticsRedis.zremrangebyscore(
    ACTIVE_KEY,
    "-inf",
    cutoff
  );

  const sessionIds = await analyticsRedis.zrange(
    ACTIVE_KEY,
    cutoff,
    "+inf",
    { byScore: true }
  );

  if (!sessionIds.length) return [];

  // Fetch in manageable batches.
  const sessions = [];

  for (let i = 0; i < sessionIds.length; i += 100) {
    const batch = sessionIds.slice(i, i + 100);

    const values = await analyticsRedis.mget(
      ...batch.map(sessionKey)
    );

    sessions.push(...values.filter(Boolean));
  }

  return sessions;
}
