import test from "node:test";
import assert from "node:assert/strict";
import { evaluateRequiredChecks } from "../src/ci-policy.mjs";
const success = { name: "test", head_sha: "abc", status: "completed", conclusion: "success" };
test("requires policy and matching head commit", () => {
  assert.equal(evaluateRequiredChecks([], [success], "abc").passed, false);
  assert.equal(evaluateRequiredChecks(["test"], [success], "abc").passed, true);
  assert.equal(evaluateRequiredChecks(["test"], [success], "def").passed, false);
});
test("rejects missing, pending and failing checks", () => {
  assert.equal(evaluateRequiredChecks(["test", "lint"], [success], "abc").passed, false);
  assert.equal(evaluateRequiredChecks(["test"], [{ ...success, status: "in_progress" }], "abc").passed, false);
  assert.equal(evaluateRequiredChecks(["test"], [{ ...success, conclusion: "failure" }], "abc").passed, false);
});
