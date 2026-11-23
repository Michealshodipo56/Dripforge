import test from "node:test";
import assert from "node:assert/strict";
import { issueJobKey } from "../src/idempotency.mjs";
const issue = { installationId: 42, repositoryId: 90, issueNumber: 846, targetBranch: "main" };
test("repeated issue deliveries produce identical job keys", () => {
  assert.equal(issueJobKey(issue), issueJobKey({ ...issue }));
});
test("distinct branches produce distinct keys", () => {
  assert.notEqual(issueJobKey(issue), issueJobKey({ ...issue, targetBranch: "develop" }));
});
test("invalid identifiers are rejected", () => {
  assert.throws(() => issueJobKey({ ...issue, issueNumber: 0 }), TypeError);
});
