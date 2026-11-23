import test from "node:test";
import assert from "node:assert/strict";
import { requireApproval } from "../src/approval.mjs";
test("approval is scoped to the requested job and action", () => {
  const decisions = [{ jobId: "job-1", action: "open_pull_request", status: "approved" }];
  assert.equal(requireApproval({ action: "open_pull_request", decisions, jobId: "job-1" }), true);
  assert.throws(() => requireApproval({ action: "open_pull_request", decisions, jobId: "job-2" }));
  assert.throws(() => requireApproval({ action: "write_repository", decisions, jobId: "job-1" }));
});
test("revoked approvals do not authorize actions", () => {
  assert.throws(() => requireApproval({ action: "open_pull_request", jobId: "job-1", decisions: [{ jobId: "job-1", action: "open_pull_request", status: "approved", revoked: true }] }));
});
