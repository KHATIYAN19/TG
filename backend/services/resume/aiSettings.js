import ResumeAiSettings from "../../models/resume/ResumeAiSettings.js";
import { DEFAULT_CHOICE, PROVIDER_IDS, isConfigured } from "./aiModels.js";

/*
  Which model writes the reviews right now.
    1. the admin's choice (Resume Lab, "AI model" tab), if that provider's key is on the server
    2. otherwise OpenAI with RESUME_AI_MODEL (default gpt-4.1), so reviews never stop because a key was removed
  Read from the database at most every 30 seconds per server, and straight away after an admin saves.
*/
const TTL_MS = 30_000;
let cache = { at: 0, doc: null };

export const readSettings = async ({ fresh = false } = {}) => {
  if (!fresh && cache.at && Date.now() - cache.at < TTL_MS) return cache.doc;
  const doc = await ResumeAiSettings.findOne({ key: "global" }).lean();
  cache = { at: Date.now(), doc };
  return doc;
};

export const forgetSettings = () => { cache = { at: 0, doc: null }; };

const envDefault = () => ({ provider: DEFAULT_CHOICE.provider, model: process.env.RESUME_AI_MODEL || DEFAULT_CHOICE.model });

/** { provider, model, source: "admin" | "default" } for the next review. */
export const resolveActive = async () => {
  let doc = null;
  try { doc = await readSettings(); } catch (e) { console.warn("[resume] could not read the AI model setting:", e?.message || e); }
  if (doc && PROVIDER_IDS.includes(doc.provider) && doc.model) {
    if (isConfigured(doc.provider)) return { provider: doc.provider, model: doc.model, source: "admin" };
    console.warn(`[resume] the chosen AI provider "${doc.provider}" has no API key on this server; using the default model instead.`);
  }
  return { ...envDefault(), source: "default" };
};

export const saveSettings = async ({ provider, model, userId, userName }) => {
  const before = (await readSettings({ fresh: true })) || {};
  const now = envDefault();
  const from = { provider: before.provider || now.provider, model: before.model || now.model };
  const doc = await ResumeAiSettings.findOneAndUpdate(
    { key: "global" },
    {
      $set: { provider, model, updatedBy: userId || null },
      $push: { history: { $each: [{ fromProvider: from.provider, fromModel: from.model, toProvider: provider, toModel: model, by: userId || null, byName: userName || "", at: new Date() }], $slice: -30 } },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  forgetSettings();
  return doc;
};
