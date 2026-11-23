import test from "node:test";
import assert from "node:assert/strict";
import { inspectPullRequestChecks } from "../src/ci-monitor.mjs";
test("evaluates required checks for PR head", async () => {
  const calls = [];
  const github = { request: async path => {
    calls.push(path);
    return path.includes("/pulls/") ? { head: { sha: "abc" } } :
      { check_runs: [{ name: "build", head_sha: "abc", status: "completed", conclusion: "success" }] };
  }};
  const result = await inspectPullRequestChecks({ github, owner: "example", repo: "app", pullNumber: 2, requiredNames: ["build"] });
  assert.equal(result.passed, true);
  assert.equal(result.sha, "abc");
  assert.match(calls[1], /commits\/abc\/check-runs/);
});
test("does not trust checks from a different commit", async () => {
  const github = { request: async path => path.includes("/pulls/") ? { head: { sha: "new" } } :
    { check_runs: [{ name: "build", head_sha: "old", status: "completed", conclusion: "success" }] } };
  const result = await inspectPullRequestChecks({ github, owner: "x", repo: "y", pullNumber: 1, requiredNames: ["build"] });
  assert.equal(result.passed, false);
});
