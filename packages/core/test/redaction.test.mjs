import test from "node:test";
import assert from "node:assert/strict";
import { redactSecrets } from "../src/redaction.mjs";

test("redacts known secrets", () => {
  assert.equal(redactSecrets("key=abc123xyz", ["abc123xyz"]), "key=[REDACTED]");
});
test("redacts bearer tokens and GitHub tokens", () => {
  const output = redactSecrets("Bearer abcdefghijklmnop github_pat_abcdefghijklmnopqrstuvwxyz");
  assert.equal(output.includes("abcdefghijklmnop"), false);
  assert.equal(output.includes("github_pat_"), false);
});
test("keeps ordinary command output", () => {
  assert.equal(redactSecrets("3 tests passed"), "3 tests passed");
});
