const KNOWN = Object.freeze({
  openai: { endpoint: "https://api.openai.com/v1/models", auth: "bearer" },
  anthropic: { endpoint: "https://api.anthropic.com/v1/models", auth: "anthropic" },
  google: { endpoint: "https://generativelanguage.googleapis.com/v1beta/models", auth: "google" },
  openrouter: { endpoint: "https://openrouter.ai/api/v1/models", auth: "bearer" },
  groq: { endpoint: "https://api.groq.com/openai/v1/models", auth: "bearer" },
  deepseek: { endpoint: "https://api.deepseek.com/models", auth: "bearer" },
  together: { endpoint: "https://api.together.xyz/v1/models", auth: "bearer" },
  fireworks: { endpoint: "https://api.fireworks.ai/inference/v1/models", auth: "bearer" },
});
export const supportedProviders = Object.freeze(Object.keys(KNOWN));
export function providerHint(key) {
  if (typeof key !== "string") return null;
  if (key.startsWith("sk-ant-")) return "anthropic";
  if (key.startsWith("sk-or-")) return "openrouter";
  if (key.startsWith("gsk_")) return "groq";
  return null;
}
export async function discoverModels({ provider, apiKey, fetchImpl = fetch, signal }) {
  const config = KNOWN[provider];
  if (!config) throw new TypeError("Unsupported provider");
  if (typeof apiKey !== "string" || !apiKey) throw new TypeError("API key required");
  const headers = { accept: "application/json" };
  if (config.auth === "anthropic") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
  } else if (config.auth === "google") headers["x-goog-api-key"] = apiKey;
  else headers.authorization = `Bearer ${apiKey}`;
  const response = await fetchImpl(config.endpoint, { headers, signal });
  if (!response.ok) throw new Error(`Model discovery failed: HTTP ${response.status}`);
  const body = await response.json();
  const raw = Array.isArray(body.data) ? body.data : Array.isArray(body.models) ? body.models : [];
  return raw.map(model => ({
    id: String(model.id ?? model.name ?? ""),
    name: String(model.display_name ?? model.displayName ?? model.name ?? model.id ?? ""),
    // Catalog listing alone is not proof of permission to invoke this model.
    accessVerified: false,
    toolCalling: null,
    contextWindow: null,
    pricing: null,
  })).filter(model => model.id);
}
