import test from "node:test";
import assert from "node:assert/strict";
import { eligibleAssignedIssues, groupIssuesByRepository } from "../src/issue-filter.mjs";
const repository = { full_name: "owner/repo" };
test("excludes pull requests returned by GitHub issues API", () => {
  const issues = [{ number: 1, state: "open", repository }, { number: 2, state: "open", repository, pull_request: {} }];
  assert.deepEqual(eligibleAssignedIssues(issues).map(x => x.number), [1]);
  assert.equal(groupIssuesByRepository(issues).get("owner/repo").length, 1);
});
