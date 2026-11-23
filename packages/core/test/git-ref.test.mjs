import test from "node:test";
import assert from "node:assert/strict";
import { assertSafeGitRef, makeIssueBranch } from "../src/git-ref.mjs";
test("generates stable safe branch names", () => assert.equal(makeIssueBranch(42, "abcdef12-3456"), "dripforge/issue-42-abcdef12"));
test("rejects dangerous references", () => {
  for (const ref of ["-c", "x..y", "foo.lock", "a//b", "foo bar", "a@{b", "x~1"]) assert.throws(() => assertSafeGitRef(ref), TypeError);
});
