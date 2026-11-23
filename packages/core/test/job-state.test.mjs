import test from "node:test";
import assert from "node:assert/strict";
import { canTransition, transition, requiredChecksPassed } from "../src/job-state.mjs";

test("job progresses through investigation and planning", () => {
  assert.equal(transition("queued", "investigating"), "investigating");
  assert.equal(transition("investigating", "planning"), "planning");
});
test("invalid and terminal transitions are rejected", () => {
  assert.equal(canTransition("completed", "implementing"), false);
  assert.throws(() => transition("completed", "implementing"), /Invalid job transition/);
});
test("CI success requires observed successful required checks", () => {
  assert.equal(requiredChecksPassed([]), false);
  assert.equal(requiredChecksPassed([{ required: true, status: "completed", conclusion: "success" }]), true);
  assert.equal(requiredChecksPassed([{ required: true, status: "completed", conclusion: "failure" }]), false);
  assert.equal(requiredChecksPassed([{ required: true, status: "queued", conclusion: null }]), false);
  assert.equal(requiredChecksPassed([{ required: false, status: "completed", conclusion: "success" }]), false);
});
