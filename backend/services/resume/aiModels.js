/*
  Every AI model an admin can pick for Resume Lab reviews, grouped by provider.

  Adding a model later: add one line to MODELS. Adding a provider: add it to PROVIDERS, MODELS, and an adapter in aiProviders.js.
  An admin can also type any other model id for a provider (the "custom model" box), so a brand-new model never needs a deploy.

  inPer1M / outPer1M are the provider's list prices in US dollars per million tokens, shown to the admin as a cost guide only
  (null = not known here; check the provider's pricing page). maxOutput is the most tokens the model can write in one answer.
  reasoning: OpenAI "thinking" models take max_completion_tokens and no temperature.
*/
export const PROVIDERS = {
  openai: { id: "openai", label: "OpenAI", envKey: "OPENAI_API_KEY" },
  gemini: { id: "gemini", label: "Google Gemini", envKey: "GEMINI_API_KEY" },
  anthropic: { id: "anthropic", label: "Anthropic Claude", envKey: "ANTHROPIC_API_KEY" },
};

export const PROVIDER_IDS = Object.keys(PROVIDERS);

export const MODELS = [
  // OpenAI
  { provider: "openai", id: "gpt-4.1", label: "GPT-4.1", note: "Best all-round quality. The current default.", inPer1M: 2, outPer1M: 8, maxOutput: 32768 },
  { provider: "openai", id: "gpt-4.1-mini", label: "GPT-4.1 mini", note: "About 5x cheaper, still good reviews.", inPer1M: 0.4, outPer1M: 1.6, maxOutput: 32768 },
  { provider: "openai", id: "gpt-4.1-nano", label: "GPT-4.1 nano", note: "Cheapest and fastest, shallower advice.", inPer1M: 0.1, outPer1M: 0.4, maxOutput: 32768 },
  { provider: "openai", id: "gpt-4o", label: "GPT-4o", note: "Previous generation, steady quality.", inPer1M: 2.5, outPer1M: 10, maxOutput: 16384 },
  { provider: "openai", id: "gpt-4o-mini", label: "GPT-4o mini", note: "Previous generation, low cost.", inPer1M: 0.15, outPer1M: 0.6, maxOutput: 16384 },
  { provider: "openai", id: "gpt-5", label: "GPT-5", note: "Thinks before answering. Deepest reviews, slower.", inPer1M: 1.25, outPer1M: 10, maxOutput: 65536, reasoning: true },
  { provider: "openai", id: "gpt-5-mini", label: "GPT-5 mini", note: "Thinks before answering, lower cost.", inPer1M: 0.25, outPer1M: 2, maxOutput: 65536, reasoning: true },
  { provider: "openai", id: "gpt-5-nano", label: "GPT-5 nano", note: "Thinks before answering, lowest cost.", inPer1M: 0.05, outPer1M: 0.4, maxOutput: 65536, reasoning: true },
  // Google Gemini
  { provider: "gemini", id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", note: "Gemini's most capable model.", inPer1M: 1.25, outPer1M: 10, maxOutput: 65536 },
  { provider: "gemini", id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", note: "Fast, good value.", inPer1M: 0.3, outPer1M: 2.5, maxOutput: 65536 },
  { provider: "gemini", id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite", note: "Cheapest Gemini.", inPer1M: 0.1, outPer1M: 0.4, maxOutput: 65536 },
  // Anthropic Claude
  { provider: "anthropic", id: "claude-opus-5-5", label: "Claude Opus 5.5", note: "Claude's most capable model.", inPer1M: null, outPer1M: null, maxOutput: 32000 },
  { provider: "anthropic", id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5", note: "Strong quality at a balanced price.", inPer1M: null, outPer1M: null, maxOutput: 32000 },
  { provider: "anthropic", id: "claude-haiku-5-5", label: "Claude Haiku 5.5", note: "Fastest and lowest cost Claude.", inPer1M: null, outPer1M: null, maxOutput: 32000 },
  { provider: "anthropic", id: "claude-sonnet-4-5", label: "Claude Sonnet 4.5", note: "Previous generation Sonnet.", inPer1M: 3, outPer1M: 15, maxOutput: 32000 },
  { provider: "anthropic", id: "claude-haiku-4-5", label: "Claude Haiku 4.5", note: "Previous generation Haiku.", inPer1M: 1, outPer1M: 5, maxOutput: 32000 },
];

export const DEFAULT_CHOICE = { provider: "openai", model: "gpt-4.1" };

/* a typical review reads about 8,000 tokens and writes about 4,500: used for the "about ₹ per review" guide */
export const TYPICAL_REVIEW = { inputTokens: 8000, outputTokens: 4500 };

export const findModel = (provider, id) => MODELS.find((m) => m.provider === provider && m.id === id) || null;

/* the most one answer may write: the model's own limit, our cap, and a lower cap for Claude (long non-streamed requests are refused) */
export const outputCap = (provider, id) => {
  const known = findModel(provider, id);
  const ours = Number(process.env.RESUME_AI_MAX_TOKENS) || 30000;
  const modelMax = known?.maxOutput || (provider === "openai" ? 16384 : 32000);
  return Math.min(ours, modelMax, provider === "anthropic" ? 16000 : Infinity);
};

/* a custom id is only letters, numbers and . _ - : / so it can never carry anything into a URL or a header */
export const validModelId = (id) => /^[A-Za-z0-9][A-Za-z0-9._:\/-]{1,98}$/.test(String(id || ""));

export const keyOf = (provider) => String(process.env[PROVIDERS[provider]?.envKey] || "").trim();
export const isConfigured = (provider) => Boolean(keyOf(provider));

/* rough US-dollar cost of one typical review, or null when the price is not known */
export const costPerReviewUsd = (m) => (m?.inPer1M == null || m?.outPer1M == null ? null : (TYPICAL_REVIEW.inputTokens * m.inPer1M + TYPICAL_REVIEW.outputTokens * m.outPer1M) / 1e6);
