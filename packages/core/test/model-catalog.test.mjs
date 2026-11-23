import test from "node:test";
import assert from "node:assert/strict";
import { discoverModels, providerHint, supportedProviders } from "../src/model-catalog.mjs";
test("supports the requested provider set", () => assert.equal(supportedProviders.length, 8));
test("does not claim access from a catalog listing", async () => {
  const models = await discoverModels({ provider: "openai", apiKey: "test", fetchImpl: async () => ({
    ok: true, json: async () => ({ data: [{ id: "model-a" }] }),
  }) });
  assert.deepEqual(models, [{ id: "model-a", name: "model-a", accessVerified: false, toolCalling: null, contextWindow: null, pricing: null }]);
});
test("only unambiguous key prefixes get a hint", () => {
  assert.equal(providerHint("sk-ant-example"), "anthropic");
  assert.equal(providerHint("sk-ambiguous"), null);
});
test("rejects unsupported providers", async () => {
  await assert.rejects(discoverModels({ provider: "unknown", apiKey: "test" }), TypeError);
});
