import test from "node:test";
import assert from "node:assert/strict";
import { summarizeCommandResult, localValidationPassed } from "../src/validation.mjs";
test("successful exit is recorded", () => assert.equal(summarizeCommandResult({ command: "npm test", exitCode: 0 }).passed, true));
test("timed-out command is not successful", () => assert.equal(localValidationPassed([{ exitCode: 0, timedOut: true }]), false));
test("empty and unobserved results never pass", () => {
  assert.equal(localValidationPassed([]), false);
  assert.throws(() => localValidationPassed([{ command: "npm test" }]), TypeError);
});
