import test from "node:test";
import assert from "node:assert/strict";
import { summarizeChecks } from "../src/ci-summary.mjs";
test("empty checks are unknown", () => assert.equal(summarizeChecks([]).status, "unknown"));
test("pending checks do not pass", () => assert.equal(summarizeChecks([{status:"queued"}]).status, "pending"));
test("failed checks are detected", () => assert.equal(summarizeChecks([{status:"completed",conclusion:"failure"}]).failed, 1));
test("never claims required branch protection", () => assert.equal(summarizeChecks([{status:"completed",conclusion:"success"}]).requiredChecksVerified, false));
