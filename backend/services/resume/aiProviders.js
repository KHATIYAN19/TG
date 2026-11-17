import { PROVIDERS, keyOf, outputCap, findModel } from "./aiModels.js";

/*
  One way to ask any provider for a JSON answer about a resume.

    generateJson({ provider, model, system, text, pdf, filename, signal })
      -> { text, truncated, usage: { input, output } }

  Failures are thrown as ProviderError. retryable = true for rate limits, overloads, server errors and network blips
  (the caller tries again); false for a bad key, an unknown model or a refused request (the admin has to fix it).
*/
export class ProviderError extends Error {
  constructor(message, { status = 0, retryable = false } = {}) {
    super(message);
    this.name = "ProviderError";
    this.status = status;
    this.retryable = retryable;
  }
}

const trim = (s, n = 300) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
const retryableStatus = (s) => s === 408 || s === 409 || s === 425 || s === 429 || s >= 500;
const base = (envName, fallback) => String(process.env[envName] || fallback).replace(/\/+$/, "");

const send = async (label, url, init) => {
  let res;
  try {
    res = await fetch(url, init);
  } catch (e) {
    if (e?.name === "AbortError") throw e;
    throw new ProviderError(`${label}: network error (${trim(e?.cause?.code || e?.message, 80)})`, { retryable: true });
  }
  if (!res.ok) {
    const body = trim(await res.text().catch(() => ""));
    throw new ProviderError(`${label} ${res.status}: ${body}`, { status: res.status, retryable: retryableStatus(res.status) });
  }
  try {
    return await res.json();
  } catch {
    throw new ProviderError(`${label}: the answer was not readable`, { retryable: true });
  }
};

/* ------------------------------- OpenAI ------------------------------- */
const openai = async ({ model, system, text, pdf, filename, signal }) => {
  const known = findModel("openai", model);
  const parts = [{ type: "text", text }];
  if (pdf) parts.push({ type: "file", file: { filename, file_data: `data:application/pdf;base64,${pdf.toString("base64")}` } });
  const cap = outputCap("openai", model);
  const body = {
    model,
    messages: [{ role: "system", content: system }, { role: "user", content: parts }],
    response_format: { type: "json_object" },
    ...(known?.reasoning ? { max_completion_tokens: cap, reasoning_effort: "low" } : { max_tokens: cap, temperature: 0.25 }),
  };
  const data = await send("OpenAI", `${base("OPENAI_BASE_URL", "https://api.openai.com/v1")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${keyOf("openai")}` },
    body: JSON.stringify(body),
    signal,
  });
  const choice = data?.choices?.[0];
  return {
    text: choice?.message?.content || "",
    truncated: choice?.finish_reason === "length",
    usage: { input: data?.usage?.prompt_tokens || 0, output: data?.usage?.completion_tokens || 0 },
  };
};

/* ------------------------------- Gemini ------------------------------- */
const gemini = async ({ model, system, text, pdf, signal }) => {
  const parts = [{ text }];
  if (pdf) parts.push({ inlineData: { mimeType: "application/pdf", data: pdf.toString("base64") } });
  const data = await send("Gemini", `${base("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta")}/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": keyOf("gemini") },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts }],
      generationConfig: { temperature: 0.25, maxOutputTokens: outputCap("gemini", model), responseMimeType: "application/json" },
    }),
    signal,
  });
  const cand = data?.candidates?.[0];
  if (!cand) {
    const why = data?.promptFeedback?.blockReason;
    throw new ProviderError(`Gemini returned no answer${why ? ` (blocked: ${why})` : ""}`, { retryable: !why });
  }
  const out = (cand.content?.parts || []).map((p) => p?.text || "").join("");
  if (!out && ["SAFETY", "RECITATION", "PROHIBITED_CONTENT", "BLOCKLIST"].includes(cand.finishReason)) {
    throw new ProviderError(`Gemini refused to answer (${cand.finishReason})`);
  }
  return {
    text: out,
    truncated: cand.finishReason === "MAX_TOKENS",
    usage: { input: data?.usageMetadata?.promptTokenCount || 0, output: (data?.usageMetadata?.candidatesTokenCount || 0) + (data?.usageMetadata?.thoughtsTokenCount || 0) },
  };
};

/* ------------------------------ Anthropic ------------------------------ */
const anthropic = async ({ model, system, text, pdf, signal }) => {
  const content = [];
  if (pdf) content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf.toString("base64") } });
  content.push({ type: "text", text });
  const data = await send("Claude", `${base("ANTHROPIC_BASE_URL", "https://api.anthropic.com")}/v1/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": keyOf("anthropic"), "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: outputCap("anthropic", model), temperature: 0.25, system, messages: [{ role: "user", content }] }),
    signal,
  });
  const out = (data?.content || []).filter((b) => b?.type === "text").map((b) => b.text || "").join("");
  if (data?.stop_reason === "refusal") throw new ProviderError("Claude declined to answer this resume");
  return {
    text: out,
    truncated: data?.stop_reason === "max_tokens",
    usage: { input: data?.usage?.input_tokens || 0, output: data?.usage?.output_tokens || 0 },
  };
};

const ADAPTERS = { openai, gemini, anthropic };

/* Claude has no JSON mode: take the outermost {...} so a stray sentence or a ```json fence never breaks the review */
export const extractJson = (raw) => {
  const s = String(raw || "").trim();
  if (!s) return null;
  try { return JSON.parse(s); } catch { /* fall through */ }
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(s.slice(a, b + 1)); } catch { return null; }
};

export const generateJson = async ({ provider, model, system, text, pdf = null, filename = "resume.pdf", signal }) => {
  const adapter = ADAPTERS[provider];
  if (!adapter) throw new ProviderError(`Unknown AI provider "${provider}".`);
  if (!keyOf(provider)) throw new ProviderError(`${PROVIDERS[provider].label} is not set up: add ${PROVIDERS[provider].envKey} to the server settings.`);
  return adapter({ model, system, text, pdf, filename, signal });
};
