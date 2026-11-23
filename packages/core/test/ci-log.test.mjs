import test from "node:test";
import assert from "node:assert/strict";
import { summarizeCiLog } from "../src/ci-log.mjs";
test("redacts bearer credentials", () => assert.doesNotMatch(summarizeCiLog("Authorization: Bearer secretvalue"), /secretvalue/));
test("limits CI log context size", () => assert.equal(summarizeCiLog("x".repeat(20000)).length, 12000));
