import test from "node:test";
import assert from "node:assert/strict";
import { classifyFailure, shouldAttemptRepair } from "../src/repair-policy.mjs";
test("separates code failures from missing secrets", () => {
  assert.equal(classifyFailure({ exitCode: 1, log: "TypeError" }), "code-failure");
  assert.equal(classifyFailure({ exitCode: 1, log: "missing secret" }), "credentials");
});
test("stops repairs at budget boundary", () => {
  assert.equal(shouldAttemptRepair({ category: "code-failure", usedAttempts: 0, maxAttempts: 2, elapsedMs: 0, maxElapsedMs: 1000 }), true);
  assert.throws(() => shouldAttemptRepair({ category: "code-failure", usedAttempts: 2, maxAttempts: 2, elapsedMs: 0, maxElapsedMs: 1000 }));
});
