import test from "node:test";
import assert from "node:assert/strict";
import { encryptCredential, decryptCredential } from "../src/credentials.mjs";
const key = "a".repeat(64);
test("credentials round-trip with user-scoped associated data", () => {
  const payload = encryptCredential("example-provider-secret", key, "user-1:openai");
  assert.equal(decryptCredential(payload, key, "user-1:openai"), "example-provider-secret");
  assert.notEqual(payload.toString("utf8"), "example-provider-secret");
  assert.throws(() => decryptCredential(payload, key, "user-2:openai"));
});
test("tampering invalidates encrypted credentials", () => {
  const payload = encryptCredential("secret", key, "user-1");
  payload[payload.length - 1] ^= 1;
  assert.throws(() => decryptCredential(payload, key, "user-1"));
});
test("invalid encryption keys are rejected", () => {
  assert.throws(() => encryptCredential("secret", "not-a-key", "user-1"), TypeError);
});
