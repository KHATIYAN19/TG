import MailSettings, { MAIL_PROVIDERS } from "../../models/MailSettings.js";

/*
  Runtime mail-provider setting with a short in-memory cache so the hot
  send path never waits on MongoDB. Every server instance re-reads at most
  every CACHE_MS, so an admin change reaches all instances within seconds.

  If MongoDB is unreachable the last known value (or the env default) is used:
  mail must keep flowing.
*/

const CACHE_MS = 10_000;

const envDefault = () => {
  const p = String(process.env.MAIL_PROVIDER || "").trim().toLowerCase();
  return MAIL_PROVIDERS.includes(p) ? p : "mailtrap";
};

let cache = null; // { value, at }

const toValue = (doc) => ({
  provider: doc?.provider && MAIL_PROVIDERS.includes(doc.provider) ? doc.provider : envDefault(),
  fallbackEnabled: doc?.fallbackEnabled !== false,
  updatedAt: doc?.updatedAt ?? null,
  updatedBy: doc?.updatedBy ?? null,
  history: (doc?.history ?? []).slice(-20).reverse(),
});

export const getMailSettings = async ({ fresh = false } = {}) => {
  if (!fresh && cache && Date.now() - cache.at < CACHE_MS) return cache.value;

  try {
    const doc = await MailSettings.findOne({ key: "global" }).lean();
    cache = { value: toValue(doc), at: Date.now() };
  } catch (error) {
    console.error("[mail] could not read settings, using last known:", error.message);
    if (!cache) cache = { value: toValue(null), at: Date.now() - CACHE_MS + 2000 };
  }
  return cache.value;
};

export const updateMailSettings = async ({ provider, fallbackEnabled, userId, userName }) => {
  const current = await getMailSettings({ fresh: true });

  const next = {
    provider: provider ?? current.provider,
    fallbackEnabled: fallbackEnabled ?? current.fallbackEnabled,
  };

  const doc = await MailSettings.findOneAndUpdate(
    { key: "global" },
    {
      $set: { ...next, updatedBy: userId },
      $push: {
        history: {
          $each: [{ from: current.provider, to: next.provider, fallbackEnabled: next.fallbackEnabled, by: userId, byName: userName || "", at: new Date() }],
          $slice: -50,
        },
      },
      $setOnInsert: { key: "global" },
    },
    { upsert: true, new: true }
  ).lean();

  cache = { value: toValue(doc), at: Date.now() };
  return cache.value;
};
