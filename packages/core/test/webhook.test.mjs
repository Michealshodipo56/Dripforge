import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyGitHubWebhook } from "../src/webhook.mjs";
test("accepts valid signed raw payload", () => {
  const raw = Buffer.from('{"action":"assigned"}');
  const signature = "sha256=" + createHmac("sha256", "secret").update(raw).digest("hex");
  assert.equal(verifyGitHubWebhook(raw, signature, "secret"), true);
  assert.equal(verifyGitHubWebhook(Buffer.from("{}"), signature, "secret"), false);
  assert.equal(verifyGitHubWebhook(raw, "sha256=bad", "secret"), false);
});
