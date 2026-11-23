import test from "node:test";
import assert from "node:assert/strict";
import { decideCiRepair } from "../src/ci-repair.mjs";
test("waits for pending checks", () => assert.equal(decideCiRepair({ checks: [{ status: "in_progress" }] }).action, "wait"));
test("repairs observed code failures within budget", () => assert.equal(decideCiRepair({ checks: [{ status: "completed", conclusion: "failure", log: "TypeError" }] }).action, "repair"));
test("does not attempt repair after budget exhaustion", () => assert.equal(decideCiRepair({ checks: [{ status: "completed", conclusion: "failure" }], attempts: 2 }).action, "stop"));
test("escalates missing secrets rather than editing code", () => assert.equal(decideCiRepair({ checks: [{ status: "completed", conclusion: "failure", log: "missing secret" }] }).action, "escalate"));

test("does not treat missing checks as success", () => assert.deepEqual(decideCiRepair({ checks: [] }), { action: "wait", reason: "checks-not-reported", failed: [] }));
test("rejects negative retry budgets", () => assert.throws(() => decideCiRepair({ checks: [], attempts: -1 }), TypeError));
